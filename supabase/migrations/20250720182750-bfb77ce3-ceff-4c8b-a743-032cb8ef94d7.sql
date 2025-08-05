-- Crear enum para roles de usuario
CREATE TYPE public.rol_usuario AS ENUM ('admin', 'gerente', 'miembro');

-- Crear enum para estado de proyectos
CREATE TYPE public.estado_proyecto AS ENUM ('planificacion', 'en_progreso', 'en_pausa', 'completado', 'cancelado');

-- Crear enum para prioridad
CREATE TYPE public.prioridad AS ENUM ('baja', 'media', 'alta', 'urgente');

-- Crear enum para estado de tareas
CREATE TYPE public.estado_tarea AS ENUM ('pendiente', 'en_progreso', 'en_revision', 'completada', 'cancelada');

-- Tabla de perfiles de usuario
CREATE TABLE public.perfiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    email TEXT NOT NULL,
    avatar_url TEXT,
    puesto TEXT,
    telefono TEXT,
    bio TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de roles de usuario
CREATE TABLE public.roles_usuario (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rol rol_usuario NOT NULL DEFAULT 'miembro',
    asignado_por UUID REFERENCES auth.users(id),
    fecha_asignacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(usuario_id, rol)
);

-- Tabla de proyectos
CREATE TABLE public.proyectos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    estado estado_proyecto NOT NULL DEFAULT 'planificacion',
    prioridad prioridad NOT NULL DEFAULT 'media',
    presupuesto DECIMAL(12,2),
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_fin_estimada DATE,
    progreso INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    creado_por UUID NOT NULL REFERENCES auth.users(id),
    responsable_id UUID REFERENCES auth.users(id),
    color TEXT DEFAULT '#3B82F6',
    activo BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de miembros del equipo por proyecto
CREATE TABLE public.miembros_proyecto (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rol_proyecto TEXT DEFAULT 'miembro',
    puede_editar BOOLEAN DEFAULT false,
    puede_eliminar BOOLEAN DEFAULT false,
    fecha_union TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(proyecto_id, usuario_id)
);

-- Tabla de tareas
CREATE TABLE public.tareas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    estado estado_tarea NOT NULL DEFAULT 'pendiente',
    prioridad prioridad NOT NULL DEFAULT 'media',
    asignado_a UUID REFERENCES auth.users(id),
    creado_por UUID NOT NULL REFERENCES auth.users(id),
    fecha_inicio DATE,
    fecha_fin DATE,
    fecha_limite DATE,
    tiempo_estimado INTEGER, -- en horas
    tiempo_real INTEGER, -- en horas
    progreso INTEGER DEFAULT 0 CHECK (progreso >= 0 AND progreso <= 100),
    orden_posicion INTEGER DEFAULT 0,
    tarea_padre_id UUID REFERENCES public.tareas(id),
    etiquetas TEXT[],
    activa BOOLEAN NOT NULL DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de comentarios
CREATE TABLE public.comentarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    contenido TEXT NOT NULL,
    autor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
    tarea_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
    comentario_padre_id UUID REFERENCES public.comentarios(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CHECK ((proyecto_id IS NOT NULL AND tarea_id IS NULL) OR (proyecto_id IS NULL AND tarea_id IS NOT NULL))
);

-- Tabla de archivos
CREATE TABLE public.archivos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL,
    nombre_archivo_original TEXT NOT NULL,
    ruta_archivo TEXT NOT NULL,
    tipo_mime TEXT,
    tamaño INTEGER,
    subido_por UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
    tarea_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
    comentario_id UUID REFERENCES public.comentarios(id) ON DELETE CASCADE,
    fecha_subida TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de notificaciones
CREATE TABLE public.notificaciones (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    tipo TEXT NOT NULL, -- 'tarea_asignada', 'proyecto_actualizado', 'comentario_nuevo', etc.
    leida BOOLEAN DEFAULT false,
    proyecto_id UUID REFERENCES public.proyectos(id) ON DELETE CASCADE,
    tarea_id UUID REFERENCES public.tareas(id) ON DELETE CASCADE,
    remitente_id UUID REFERENCES auth.users(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla de tiempo trabajado
CREATE TABLE public.registros_tiempo (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tarea_id UUID NOT NULL REFERENCES public.tareas(id) ON DELETE CASCADE,
    proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
    descripcion TEXT,
    horas_trabajadas DECIMAL(5,2) NOT NULL,
    fecha_trabajo DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proyectos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.miembros_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_tiempo ENABLE ROW LEVEL SECURITY;

-- Función para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.obtener_rol_usuario_actual()
RETURNS rol_usuario AS $$
  SELECT rol FROM public.roles_usuario WHERE usuario_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Función para verificar si el usuario es miembro del proyecto
CREATE OR REPLACE FUNCTION public.es_miembro_proyecto(proyecto_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.miembros_proyecto 
    WHERE proyecto_id = proyecto_uuid AND usuario_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.proyectos 
    WHERE id = proyecto_uuid AND (creado_por = auth.uid() OR responsable_id = auth.uid())
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Políticas RLS para perfiles
CREATE POLICY "Los usuarios pueden ver todos los perfiles" ON public.perfiles
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.perfiles
    FOR UPDATE USING (usuario_id = auth.uid());

CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON public.perfiles
    FOR INSERT WITH CHECK (usuario_id = auth.uid());

-- Políticas RLS para roles_usuario
CREATE POLICY "Los usuarios pueden ver todos los roles" ON public.roles_usuario
    FOR SELECT USING (true);

CREATE POLICY "Solo admins pueden gestionar roles" ON public.roles_usuario
    FOR ALL USING (public.obtener_rol_usuario_actual() = 'admin');

-- Políticas RLS para proyectos
CREATE POLICY "Los usuarios pueden ver proyectos donde son miembros" ON public.proyectos
    FOR SELECT USING (
        public.es_miembro_proyecto(id) OR 
        public.obtener_rol_usuario_actual() = 'admin'
    );

CREATE POLICY "Los usuarios pueden crear proyectos" ON public.proyectos
    FOR INSERT WITH CHECK (creado_por = auth.uid());

CREATE POLICY "Los miembros pueden actualizar proyectos" ON public.proyectos
    FOR UPDATE USING (
        public.es_miembro_proyecto(id) OR 
        public.obtener_rol_usuario_actual() = 'admin'
    );

CREATE POLICY "El creador y admins pueden eliminar proyectos" ON public.proyectos
    FOR DELETE USING (
        creado_por = auth.uid() OR 
        public.obtener_rol_usuario_actual() = 'admin'
    );

-- Políticas RLS para miembros_proyecto
CREATE POLICY "Los miembros pueden ver miembros del proyecto" ON public.miembros_proyecto
    FOR SELECT USING (public.es_miembro_proyecto(proyecto_id));

CREATE POLICY "El creador del proyecto puede gestionar miembros" ON public.miembros_proyecto
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.proyectos 
            WHERE id = proyecto_id AND creado_por = auth.uid()
        ) OR public.obtener_rol_usuario_actual() = 'admin'
    );

-- Políticas RLS para tareas
CREATE POLICY "Los miembros pueden ver tareas del proyecto" ON public.tareas
    FOR SELECT USING (public.es_miembro_proyecto(proyecto_id));

CREATE POLICY "Los miembros pueden crear tareas" ON public.tareas
    FOR INSERT WITH CHECK (
        public.es_miembro_proyecto(proyecto_id) AND creado_por = auth.uid()
    );

CREATE POLICY "Los miembros pueden actualizar tareas" ON public.tareas
    FOR UPDATE USING (public.es_miembro_proyecto(proyecto_id));

CREATE POLICY "El creador puede eliminar tareas" ON public.tareas
    FOR DELETE USING (
        creado_por = auth.uid() OR 
        public.obtener_rol_usuario_actual() = 'admin'
    );

-- Políticas RLS para comentarios
CREATE POLICY "Los miembros pueden ver comentarios" ON public.comentarios
    FOR SELECT USING (
        (proyecto_id IS NOT NULL AND public.es_miembro_proyecto(proyecto_id)) OR
        (tarea_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.tareas t 
            WHERE t.id = comentarios.tarea_id AND public.es_miembro_proyecto(t.proyecto_id)
        ))
    );

CREATE POLICY "Los miembros pueden crear comentarios" ON public.comentarios
    FOR INSERT WITH CHECK (
        autor_id = auth.uid() AND (
            (proyecto_id IS NOT NULL AND public.es_miembro_proyecto(proyecto_id)) OR
            (tarea_id IS NOT NULL AND EXISTS (
                SELECT 1 FROM public.tareas t 
                WHERE t.id = comentarios.tarea_id AND public.es_miembro_proyecto(t.proyecto_id)
            ))
        )
    );

CREATE POLICY "El autor puede actualizar sus comentarios" ON public.comentarios
    FOR UPDATE USING (autor_id = auth.uid());

CREATE POLICY "El autor puede eliminar sus comentarios" ON public.comentarios
    FOR DELETE USING (autor_id = auth.uid());

-- Políticas RLS para archivos
CREATE POLICY "Los miembros pueden ver archivos" ON public.archivos
    FOR SELECT USING (
        (proyecto_id IS NOT NULL AND public.es_miembro_proyecto(proyecto_id)) OR
        (tarea_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.tareas t 
            WHERE t.id = archivos.tarea_id AND public.es_miembro_proyecto(t.proyecto_id)
        ))
    );

CREATE POLICY "Los miembros pueden subir archivos" ON public.archivos
    FOR INSERT WITH CHECK (subido_por = auth.uid());

CREATE POLICY "El que subió el archivo puede eliminarlo" ON public.archivos
    FOR DELETE USING (subido_por = auth.uid());

-- Políticas RLS para notificaciones
CREATE POLICY "Los usuarios pueden ver sus notificaciones" ON public.notificaciones
    FOR SELECT USING (usuario_id = auth.uid());

CREATE POLICY "Se pueden crear notificaciones para cualquier usuario" ON public.notificaciones
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Los usuarios pueden actualizar sus notificaciones" ON public.notificaciones
    FOR UPDATE USING (usuario_id = auth.uid());

-- Políticas RLS para registros_tiempo
CREATE POLICY "Los usuarios pueden ver registros de sus proyectos" ON public.registros_tiempo
    FOR SELECT USING (
        usuario_id = auth.uid() OR 
        public.es_miembro_proyecto(proyecto_id)
    );

CREATE POLICY "Los usuarios pueden crear sus registros de tiempo" ON public.registros_tiempo
    FOR INSERT WITH CHECK (
        usuario_id = auth.uid() AND 
        public.es_miembro_proyecto(proyecto_id)
    );

CREATE POLICY "Los usuarios pueden actualizar sus registros" ON public.registros_tiempo
    FOR UPDATE USING (usuario_id = auth.uid());

-- Función para actualizar timestamp de actualización
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar timestamps
CREATE TRIGGER actualizar_perfiles_timestamp
    BEFORE UPDATE ON public.perfiles
    FOR EACH ROW
    EXECUTE FUNCTION public.actualizar_timestamp_modificacion();

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

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.manejar_nuevo_usuario()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.perfiles (usuario_id, nombre_completo, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
        NEW.email
    );
    
    INSERT INTO public.roles_usuario (usuario_id, rol)
    VALUES (NEW.id, 'miembro');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER crear_perfil_nuevo_usuario
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.manejar_nuevo_usuario();

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_perfiles_usuario_id ON public.perfiles(usuario_id);
CREATE INDEX idx_proyectos_creado_por ON public.proyectos(creado_por);
CREATE INDEX idx_proyectos_estado ON public.proyectos(estado);
CREATE INDEX idx_miembros_proyecto_usuario ON public.miembros_proyecto(usuario_id);
CREATE INDEX idx_miembros_proyecto_proyecto ON public.miembros_proyecto(proyecto_id);
CREATE INDEX idx_tareas_proyecto_id ON public.tareas(proyecto_id);
CREATE INDEX idx_tareas_asignado_a ON public.tareas(asignado_a);
CREATE INDEX idx_tareas_estado ON public.tareas(estado);
CREATE INDEX idx_comentarios_proyecto_id ON public.comentarios(proyecto_id);
CREATE INDEX idx_comentarios_tarea_id ON public.comentarios(tarea_id);
CREATE INDEX idx_notificaciones_usuario_id ON public.notificaciones(usuario_id);
CREATE INDEX idx_registros_tiempo_usuario ON public.registros_tiempo(usuario_id);
CREATE INDEX idx_registros_tiempo_proyecto ON public.registros_tiempo(proyecto_id);