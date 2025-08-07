-- Create storage bucket for project images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true);

-- Create policies for project images
CREATE POLICY "Miembros pueden ver imágenes del proyecto" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'project-images' AND es_miembro_proyecto((storage.foldername(name))[1]::uuid));

CREATE POLICY "Directores pueden subir imágenes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'project-images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.miembros_proyecto mp 
      WHERE mp.proyecto_id = (storage.foldername(name))[1]::uuid 
      AND mp.usuario_id = auth.uid() 
      AND mp.rol_proyecto IN ('admin', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM public.proyectos p
      WHERE p.id = (storage.foldername(name))[1]::uuid
      AND (p.creado_por = auth.uid() OR p.responsable_id = auth.uid())
    )
  )
);

CREATE POLICY "Directores pueden eliminar imágenes" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'project-images' 
  AND (
    EXISTS (
      SELECT 1 FROM public.miembros_proyecto mp 
      WHERE mp.proyecto_id = (storage.foldername(name))[1]::uuid 
      AND mp.usuario_id = auth.uid() 
      AND mp.rol_proyecto IN ('admin', 'manager')
    )
    OR EXISTS (
      SELECT 1 FROM public.proyectos p
      WHERE p.id = (storage.foldername(name))[1]::uuid
      AND (p.creado_por = auth.uid() OR p.responsable_id = auth.uid())
    )
  )
);