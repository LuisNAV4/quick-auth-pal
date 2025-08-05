-- Eliminar todas las tablas existentes relacionadas con proyectos
DROP TABLE IF EXISTS public.archivos CASCADE;
DROP TABLE IF EXISTS public.comentarios CASCADE;
DROP TABLE IF EXISTS public.registros_tiempo CASCADE;
DROP TABLE IF EXISTS public.notificaciones CASCADE;
DROP TABLE IF EXISTS public.invitaciones CASCADE;
DROP TABLE IF EXISTS public.tareas CASCADE;
DROP TABLE IF EXISTS public.miembros_proyecto CASCADE;
DROP TABLE IF EXISTS public.proyectos CASCADE;

-- Eliminar tipos personalizados si existen
DROP TYPE IF EXISTS public.estado_proyecto CASCADE;
DROP TYPE IF EXISTS public.prioridad CASCADE;

-- Crear tipos personalizados
CREATE TYPE public.estado_proyecto AS ENUM ('planificacion', 'en_progreso', 'en_revision', 'completado', 'pausado', 'cancelado');
CREATE TYPE public.prioridad AS ENUM ('low', 'medium', 'high');

-- Crear tabla de proyectos
CREATE TABLE public.proyectos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    estado estado_proyecto NOT NULL DEFAULT 'planificacion',
    prioridad prioridad NOT NULL DEFAULT 'medium',
    fecha_inicio DATE,
    fecha_fin_estimada DATE,
    fecha_fin DATE,
    presupuesto NUMERIC,
    progreso INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    color TEXT DEFAULT '#3B82F6',
    activo BOOLEAN NOT NULL DEFAULT true,
    creado_por UUID NOT NULL,
    responsable_id UUID,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de miembros de proyecto
CREATE TABLE public.miembros_proyecto (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL,
    rol_proyecto TEXT NOT NULL DEFAULT 'miembro',
    puede_editar BOOLEAN DEFAULT false,
    puede_eliminar BOOLEAN DEFAULT false,
    fecha_union TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(proyecto_id, usuario_id)
);

-- Crear tabla de tareas
CREATE TABLE public.tareas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    asignado_a UUID,
    creado_por UUID NOT NULL,
    estado estado_proyecto NOT NULL DEFAULT 'planificacion',
    prioridad prioridad NOT NULL DEFAULT 'medium',
    fecha_inicio DATE,
    fecha_limite DATE,
    fecha_fin DATE,
    progreso INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    tiempo_estimado INTEGER, -- en horas
    tiempo_real INTEGER, -- en horas
    orden_posicion INTEGER DEFAULT 0,
    tarea_padre_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
    etiquetas TEXT[],
    activa BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de invitaciones
CREATE TABLE public.invitaciones (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    rol_proyecto TEXT NOT NULL DEFAULT 'miembro',
    estado TEXT NOT NULL DEFAULT 'pendiente',
    mensaje_personalizado TEXT,
    invitado_por UUID NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days')
);

-- Crear tabla de comentarios
CREATE TABLE public.comentarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contenido TEXT NOT NULL,
    autor_id UUID NOT NULL,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
    tarea_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
    comentario_padre_id UUID REFERENCES public.comentarios(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CHECK (proyecto_id IS NOT NULL OR tarea_id IS NOT NULL)
);

-- Crear tabla de archivos
CREATE TABLE public.archivos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    nombre_archivo_original TEXT NOT NULL,
    ruta_archivo TEXT NOT NULL,
    tipo_mime TEXT,
    tamaño INTEGER,
    subido_por UUID NOT NULL,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
    tarea_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
    comentario_id UUID REFERENCES public.comentarios(id) ON DELETE CASCADE,
    fecha_subida TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CHECK (proyecto_id IS NOT NULL OR tarea_id IS NOT NULL OR comentario_id IS NOT NULL)
);

-- Crear tabla de registros de tiempo
CREATE TABLE public.registros_tiempo (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    tarea_id UUID NOT NULL REFERENCES public.tareas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL,
    horas_trabajadas NUMERIC NOT NULL CHECK (horas_trabajadas > 0),
    fecha_trabajo DATE NOT NULL DEFAULT CURRENT_DATE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de notificaciones
CREATE TABLE public.notificaciones (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT NOT NULL,
    usuario_id UUID NOT NULL,
    remitente_id UUID,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
    tarea_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
    leida BOOLEAN DEFAULT false,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_tiempo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;

-- Función para verificar si un usuario es miembro de un proyecto
CREATE OR REPLACE FUNCTION public.es_miembro_proyecto(proyecto_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.miembros_proyecto 
    WHERE proyecto_id = proyecto_uuid AND usuario_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.proyectos 
    WHERE id = proyecto_uuid AND (creado_por = auth.uid() OR responsable_id = auth.uid())
  );
$$;

-- Función para crear proyecto con miembro automático
CREATE OR REPLACE FUNCTION public.crear_proyecto_con_miembro(
    p_nombre text,
    p_descripcion text DEFAULT NULL,
    p_fecha_inicio date DEFAULT NULL,
    p_fecha_fin_estimada date DEFAULT NULL,
    p_presupuesto numeric DEFAULT NULL,
    p_responsable_id uuid DEFAULT NULL,
    p_miembros_ids uuid[] DEFAULT ARRAY[]::uuid[]
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Políticas RLS para proyectos
CREATE POLICY "Los usuarios pueden crear proyectos" 
ON public.proyectos 
FOR INSERT 
WITH CHECK (creado_por = auth.uid());

CREATE POLICY "Los usuarios pueden ver proyectos donde son miembros" 
ON public.proyectos 
FOR SELECT 
USING (es_miembro_proyecto(id) OR (obtener_rol_usuario_actual() = 'admin'::rol_usuario));

CREATE POLICY "Los miembros pueden actualizar proyectos" 
ON public.proyectos 
FOR UPDATE 
USING (es_miembro_proyecto(id) OR (obtener_rol_usuario_actual() = 'admin'::rol_usuario));

CREATE POLICY "El creador y admins pueden eliminar proyectos" 
ON public.proyectos 
FOR DELETE 
USING ((creado_por = auth.uid()) OR (obtener_rol_usuario_actual() = 'admin'::rol_usuario));

-- Políticas RLS para miembros_proyecto
CREATE POLICY "Los miembros pueden ver miembros del proyecto" 
ON public.miembros_proyecto 
FOR SELECT 
USING (es_miembro_proyecto(proyecto_id));

CREATE POLICY "El creador del proyecto puede gestionar miembros" 
ON public.miembros_proyecto 
FOR ALL 
USING ((EXISTS (
  SELECT 1 FROM public.proyectos 
  WHERE id = miembros_proyecto.proyecto_id AND creado_por = auth.uid()
)) OR (obtener_rol_usuario_actual() = 'admin'::rol_usuario));

-- Políticas RLS para tareas
CREATE POLICY "Los miembros pueden ver tareas del proyecto" 
ON public.tareas 
FOR SELECT 
USING (es_miembro_proyecto(proyecto_id));

CREATE POLICY "Los miembros pueden crear tareas" 
ON public.tareas 
FOR INSERT 
WITH CHECK (es_miembro_proyecto(proyecto_id) AND creado_por = auth.uid());

CREATE POLICY "Los miembros pueden actualizar tareas" 
ON public.tareas 
FOR UPDATE 
USING (es_miembro_proyecto(proyecto_id));

CREATE POLICY "El creador puede eliminar tareas" 
ON public.tareas 
FOR DELETE 
USING ((creado_por = auth.uid()) OR (obtener_rol_usuario_actual() = 'admin'::rol_usuario));

-- Políticas RLS para invitaciones
CREATE POLICY "Los usuarios pueden ver las invitaciones que enviaron" 
ON public.invitaciones 
FOR SELECT 
USING (invitado_por = auth.uid());

CREATE POLICY "Los miembros pueden crear invitaciones" 
ON public.invitaciones 
FOR INSERT 
WITH CHECK ((invitado_por = auth.uid()) AND es_miembro_proyecto(proyecto_id));

CREATE POLICY "Los usuarios pueden actualizar sus invitaciones" 
ON public.invitaciones 
FOR UPDATE 
USING (invitado_por = auth.uid());

CREATE POLICY "Los invitados pueden ver y actualizar con token" 
ON public.invitaciones 
FOR ALL 
USING (true);

-- Políticas RLS para comentarios
CREATE POLICY "Los miembros pueden ver comentarios" 
ON public.comentarios 
FOR SELECT 
USING ((proyecto_id IS NOT NULL AND es_miembro_proyecto(proyecto_id)) OR 
        (tarea_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.tareas t 
          WHERE t.id = comentarios.tarea_id AND es_miembro_proyecto(t.proyecto_id)
        )));

CREATE POLICY "Los miembros pueden crear comentarios" 
ON public.comentarios 
FOR INSERT 
WITH CHECK ((autor_id = auth.uid()) AND 
             ((proyecto_id IS NOT NULL AND es_miembro_proyecto(proyecto_id)) OR 
              (tarea_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.tareas t 
                WHERE t.id = comentarios.tarea_id AND es_miembro_proyecto(t.proyecto_id)
              ))));

CREATE POLICY "El autor puede actualizar sus comentarios" 
ON public.comentarios 
FOR UPDATE 
USING (autor_id = auth.uid());

CREATE POLICY "El autor puede eliminar sus comentarios" 
ON public.comentarios 
FOR DELETE 
USING (autor_id = auth.uid());

-- Políticas RLS para archivos
CREATE POLICY "Los miembros pueden ver archivos" 
ON public.archivos 
FOR SELECT 
USING ((proyecto_id IS NOT NULL AND es_miembro_proyecto(proyecto_id)) OR 
        (tarea_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.tareas t 
          WHERE t.id = archivos.tarea_id AND es_miembro_proyecto(t.proyecto_id)
        )));

CREATE POLICY "Los miembros pueden subir archivos" 
ON public.archivos 
FOR INSERT 
WITH CHECK (subido_por = auth.uid());

CREATE POLICY "El que subió el archivo puede eliminarlo" 
ON public.archivos 
FOR DELETE 
USING (subido_por = auth.uid());

-- Políticas RLS para registros_tiempo
CREATE POLICY "Los usuarios pueden ver registros de sus proyectos" 
ON public.registros_tiempo 
FOR SELECT 
USING ((usuario_id = auth.uid()) OR es_miembro_proyecto(proyecto_id));

CREATE POLICY "Los usuarios pueden crear sus registros de tiempo" 
ON public.registros_tiempo 
FOR INSERT 
WITH CHECK ((usuario_id = auth.uid()) AND es_miembro_proyecto(proyecto_id));

CREATE POLICY "Los usuarios pueden actualizar sus registros" 
ON public.registros_tiempo 
FOR UPDATE 
USING (usuario_id = auth.uid());

-- Políticas RLS para notificaciones
CREATE POLICY "Los usuarios pueden ver sus notificaciones" 
ON public.notificaciones 
FOR SELECT 
USING (usuario_id = auth.uid());

CREATE POLICY "Se pueden crear notificaciones para cualquier usuario" 
ON public.notificaciones 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Los usuarios pueden actualizar sus notificaciones" 
ON public.notificaciones 
FOR UPDATE 
USING (usuario_id = auth.uid());

-- Triggers para actualizar timestamp
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actualizar_proyectos_timestamp
    BEFORE UPDATE ON public.proyectos
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp_modificacion();

CREATE TRIGGER actualizar_tareas_timestamp
    BEFORE UPDATE ON public.tareas
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp_modificacion();

CREATE TRIGGER actualizar_comentarios_timestamp
    BEFORE UPDATE ON public.comentarios
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp_modificacion();