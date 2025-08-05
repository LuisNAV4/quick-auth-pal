-- Crear tabla de invitaciones
CREATE TABLE public.invitaciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  proyecto_id UUID NOT NULL REFERENCES public.proyectos(id) ON DELETE CASCADE,
  rol_proyecto TEXT NOT NULL DEFAULT 'miembro',
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aceptada', 'rechazada')),
  token UUID NOT NULL DEFAULT gen_random_uuid(),
  invitado_por UUID NOT NULL,
  mensaje_personalizado TEXT,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fecha_expiracion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  UNIQUE(email, proyecto_id, estado) -- Evitar invitaciones duplicadas pendientes
);

-- Habilitar RLS
ALTER TABLE public.invitaciones ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver las invitaciones que enviaron
CREATE POLICY "Los usuarios pueden ver las invitaciones que enviaron"
ON public.invitaciones 
FOR SELECT 
USING (invitado_por = auth.uid());

-- Política para que los miembros del proyecto puedan crear invitaciones
CREATE POLICY "Los miembros pueden crear invitaciones"
ON public.invitaciones 
FOR INSERT 
WITH CHECK (
  invitado_por = auth.uid() AND 
  es_miembro_proyecto(proyecto_id)
);

-- Política para actualizar invitaciones (cambiar estado)
CREATE POLICY "Los usuarios pueden actualizar sus invitaciones"
ON public.invitaciones 
FOR UPDATE 
USING (invitado_por = auth.uid());

-- Política para que el invitado pueda ver y actualizar su invitación usando el token
CREATE POLICY "Los invitados pueden ver y actualizar con token"
ON public.invitaciones 
FOR ALL 
USING (true); -- Se manejará la seguridad por token en la aplicación

-- Crear índices para mejor rendimiento
CREATE INDEX idx_invitaciones_email ON public.invitaciones(email);
CREATE INDEX idx_invitaciones_token ON public.invitaciones(token);
CREATE INDEX idx_invitaciones_proyecto_id ON public.invitaciones(proyecto_id);
CREATE INDEX idx_invitaciones_invitado_por ON public.invitaciones(invitado_por);

-- Función para aceptar invitación
CREATE OR REPLACE FUNCTION public.aceptar_invitacion(invitation_token UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitacion_record RECORD;
BEGIN
  -- Buscar la invitación por token
  SELECT * INTO invitacion_record 
  FROM public.invitaciones 
  WHERE token = invitation_token 
    AND estado = 'pendiente' 
    AND fecha_expiracion > now();
    
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Agregar al usuario como miembro del proyecto
  INSERT INTO public.miembros_proyecto (
    proyecto_id,
    usuario_id,
    rol_proyecto,
    puede_editar,
    puede_eliminar
  ) VALUES (
    invitacion_record.proyecto_id,
    auth.uid(),
    invitacion_record.rol_proyecto,
    CASE WHEN invitacion_record.rol_proyecto IN ('admin', 'manager') THEN true ELSE false END,
    CASE WHEN invitacion_record.rol_proyecto = 'admin' THEN true ELSE false END
  ) ON CONFLICT DO NOTHING;
  
  -- Marcar invitación como aceptada
  UPDATE public.invitaciones 
  SET estado = 'aceptada' 
  WHERE token = invitation_token;
  
  RETURN TRUE;
END;
$$;