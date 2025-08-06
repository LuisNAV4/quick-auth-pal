-- Create table for personal calendar notes
CREATE TABLE public.notas_personales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  contenido TEXT,
  fecha_nota DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_creacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notas_personales ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Los usuarios pueden ver sus propias notas" 
ON public.notas_personales 
FOR SELECT 
USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden crear sus propias notas" 
ON public.notas_personales 
FOR INSERT 
WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden actualizar sus propias notas" 
ON public.notas_personales 
FOR UPDATE 
USING (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias notas" 
ON public.notas_personales 
FOR DELETE 
USING (auth.uid() = usuario_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notas_personales_updated_at
BEFORE UPDATE ON public.notas_personales
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_timestamp_modificacion();