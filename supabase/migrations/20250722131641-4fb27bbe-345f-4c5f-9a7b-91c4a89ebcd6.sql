-- Actualizar el enum estado_tarea para incluir valores en español
ALTER TYPE estado_tarea ADD VALUE 'pendiente';
ALTER TYPE estado_tarea ADD VALUE 'en_progreso';  
ALTER TYPE estado_tarea ADD VALUE 'completada';

-- Crear función para gestionar proyectos
CREATE OR REPLACE FUNCTION public.crear_proyecto_con_miembro(
  p_nombre TEXT,
  p_descripcion TEXT DEFAULT NULL,
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin_estimada DATE DEFAULT NULL,
  p_presupuesto NUMERIC DEFAULT NULL,
  p_responsable_id UUID DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  nuevo_proyecto_id UUID;
BEGIN
  -- Crear el proyecto
  INSERT INTO public.proyectos (
    nombre,
    descripcion,
    fecha_inicio,
    fecha_fin_estimada,
    presupuesto,
    responsable_id,
    creado_por
  ) VALUES (
    p_nombre,
    p_descripcion,
    p_fecha_inicio,
    p_fecha_fin_estimada,
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

  RETURN nuevo_proyecto_id;
END;
$$;