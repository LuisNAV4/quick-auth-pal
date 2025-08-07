import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ProjectImage {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
}

interface ProjectImageManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectName: string;
}

const ProjectImageManager = ({ 
  open, 
  onOpenChange, 
  projectId, 
  projectName 
}: ProjectImageManagerProps) => {
  const { user } = useAuth();
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open, projectId]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.storage
        .from('project-images')
        .list(`${projectId}/`, {
          limit: 100,
          offset: 0,
        });

      if (error) throw error;

      const imageFiles = data?.filter(file => 
        file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)
      ) || [];

      const imagesWithUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const { data: urlData } = supabase.storage
            .from('project-images')
            .getPublicUrl(`${projectId}/${file.name}`);

          return {
            id: file.id || file.name,
            name: file.name,
            url: urlData.publicUrl,
            uploadedAt: file.created_at || new Date().toISOString(),
          };
        })
      );

      setImages(imagesWithUrls);
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploading(true);
      
      for (const file of Array.from(files)) {
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Error",
            description: `${file.name} no es una imagen válida`,
            variant: "destructive"
          });
          continue;
        }

        // Generar nombre único
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${projectId}/${fileName}`;

        const { error } = await supabase.storage
          .from('project-images')
          .upload(filePath, file);

        if (error) {
          console.error('Upload error:', error);
          toast({
            title: "Error",
            description: `Error al subir ${file.name}: ${error.message}`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Éxito",
            description: `${file.name} subida correctamente`,
          });
        }
      }

      // Recargar imágenes
      await loadImages();
      
      // Limpiar input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Error al subir las imágenes",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageName: string) => {
    try {
      const { error } = await supabase.storage
        .from('project-images')
        .remove([`${projectId}/${imageName}`]);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Imagen eliminada correctamente",
      });

      // Recargar imágenes
      await loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image size={20} />
            Gestión de Imágenes - {projectName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload section */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <div className="mt-2">
                <label htmlFor="image-upload" className="cursor-pointer">
                  <span className="text-sm font-medium text-primary hover:text-primary/80">
                    Subir imágenes
                  </span>
                  <Input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, GIF, WEBP hasta 50MB cada una
                </p>
              </div>
              {uploading && (
                <div className="mt-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-xs text-muted-foreground mt-1">Subiendo...</p>
                </div>
              )}
            </div>
          </div>

          {/* Images grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={image.url}
                      alt={image.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Overlay con información y acciones */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(image.name)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  
                  {/* Nombre del archivo */}
                  <p className="text-xs text-muted-foreground mt-1 truncate" title={image.name}>
                    {image.name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">No hay imágenes en este proyecto</p>
              <p className="text-xs">Sube algunas imágenes para comenzar</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectImageManager;