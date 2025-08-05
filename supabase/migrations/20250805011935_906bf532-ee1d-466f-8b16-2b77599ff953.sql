-- Actualizar la función RPC para incluir fecha_fin
CREATE OR REPLACE FUNCTION public.crear_proyecto_con_miembro(
  p_nombre text, 
  p_descripcion text DEFAULT NULL::text, 
  p_fecha_inicio date DEFAULT NULL::date, 
  p_fecha_fin_estimada date DEFAULT NULL::date,
  p_fecha_fin date DEFAULT NULL::date,
  p_presupuesto numeric DEFAULT NULL::numeric, 
  p_responsable_id uuid DEFAULT NULL::uuid, 
  p_miembros_ids uuid[] DEFAULT ARRAY[]::uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  nuevo_proyecto_id UUID;
  miembro_id UUID;
BEGIN
  -- Crear el proyecto
  INSERT INTO public.proyectos (
    nombre,
    descripcion,
    fecha_inicio,
    fecha_fin_estimada,
    fecha_fin,
    presupuesto,
    responsable_id,
    creado_por
  ) VALUES (
    p_nombre,
    p_descripcion,
    p_fecha_inicio,
    p_fecha_fin_estimada,
    p_fecha_fin,
    p_presupuesto,
    p_responsable_id,
    auth.uid()
  ) RETURNING id INTO nuevo_proyecto_id;

  -- Agregar al creador como miembro del proyecto
  INSERT INTO public.miembros_proyecto (
    proyecto_id,
    usuario_id,
    rol_proyecto,
    puede_editar,
    puede_eliminar
  ) VALUES (
    nuevo_proyecto_id,
    auth.uid(),
    'admin',
    true,
    true
  );

  -- Si hay un responsable diferente al creador, agregarlo también
  IF p_responsable_id IS NOT NULL AND p_responsable_id != auth.uid() THEN
    INSERT INTO public.miembros_proyecto (
      proyecto_id,
      usuario_id,
      rol_proyecto,
      puede_editar,
      puede_eliminar
    ) VALUES (
      nuevo_proyecto_id,
      p_responsable_id,
      'manager',
      true,
      false
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- Agregar miembros adicionales si se proporcionaron
  IF array_length(p_miembros_ids, 1) > 0 THEN
    FOREACH miembro_id IN ARRAY p_miembros_ids
    LOOP
      IF miembro_id != auth.uid() AND (p_responsable_id IS NULL OR miembro_id != p_responsable_id) THEN
        INSERT INTO public.miembros_proyecto (
          proyecto_id,
          usuario_id,
          rol_proyecto,
          puede_editar,
          puede_eliminar
        ) VALUES (
          nuevo_proyecto_id,
          miembro_id,
          'miembro',
          false,
          false
        ) ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
  END IF;

  RETURN nuevo_proyecto_id;
END;
$function$