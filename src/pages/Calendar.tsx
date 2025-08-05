
import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { PlusCircle, XCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Note {
  id: string;
  date: Date;
  title: string;
  content: string;
}

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: "",
    content: "",
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('comentarios')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      const mappedNotes = data?.map(comment => ({
        id: comment.id,
        date: new Date(comment.fecha_creacion),
        title: comment.contenido.split('\n')[0] || 'Sin título',
        content: comment.contenido,
      })) || [];

      setNotes(mappedNotes);
    } catch (error) {
      console.error('Error al cargar notas:', error);
    }
  };
  
  const handleAddNote = async () => {
    if (!newNote.title) {
      toast.error("El título es obligatorio");
      return;
    }
    
    try {
      const { error } = await supabase
        .from('comentarios')
        .insert({
          contenido: `${newNote.title}\n${newNote.content || ''}`,
          autor_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      await fetchNotes();
      
      setNewNote({
        title: "",
        content: "",
      });
      
      setIsAddOpen(false);
      toast.success("Nota añadida al calendario");
    } catch (error) {
      toast.error("Error al añadir la nota");
    }
  };
  
  const handleEditNote = async () => {
    if (!currentNote || !currentNote.title) return;
    
    try {
      const { error } = await supabase
        .from('comentarios')
        .update({
          contenido: `${currentNote.title}\n${currentNote.content || ''}`
        })
        .eq('id', currentNote.id);

      if (error) throw error;

      await fetchNotes();
      setIsEditOpen(false);
      toast.success("Nota actualizada");
    } catch (error) {
      toast.error("Error al actualizar la nota");
    }
  };
  
  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('comentarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchNotes();
      toast.success("Nota eliminada");
    } catch (error) {
      toast.error("Error al eliminar la nota");
    }
  };
  
  // Filtrar las notas para la fecha seleccionada
  const filteredNotes = notes.filter(note => 
    new Date(note.date).toDateString() === date.toDateString()
  );
  
  // Función para determinar si una fecha tiene notas
  const hasNotes = (day: Date) => {
    return notes.some(note => 
      new Date(note.date).toDateString() === day.toDateString()
    );
  };

  return (
    <AppLayout title="Calendario">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card className="p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={(date) => date && setDate(date)}
              locale={es}
              modifiers={{
                hasNote: (date) => hasNotes(date),
              }}
              modifiersClassNames={{
                hasNote: "bg-blue-100 font-bold text-blue-600 rounded-full",
              }}
              className="rounded-md border"
            />
            
            <div className="mt-4">
              <Button className="w-full" onClick={() => setIsAddOpen(true)}>
                <PlusCircle size={16} className="mr-1" /> Añadir nota
              </Button>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Notas para {format(date, "PPPP", { locale: es })}
              </h3>
            </div>
            
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No hay notas para esta fecha</p>
                <Button variant="link" onClick={() => setIsAddOpen(true)}>
                  Crear una nota
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{note.title}</h4>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setCurrentNote(note);
                            setIsEditOpen(true);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <XCircle size={16} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{note.content}</p>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* Modal para añadir nota */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Añadir nota al {format(date, "PPP", { locale: es })}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newNote.title}
                onChange={(e) => setNewNote({...newNote, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                rows={4}
                value={newNote.content}
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddNote}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal para editar nota */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar nota</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={currentNote?.title}
                onChange={(e) => setCurrentNote(currentNote ? {...currentNote, title: e.target.value} : null)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-content">Contenido</Label>
              <Textarea
                id="edit-content"
                rows={4}
                value={currentNote?.content}
                onChange={(e) => setCurrentNote(currentNote ? {...currentNote, content: e.target.value} : null)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
            <Button onClick={handleEditNote}>Actualizar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Calendar;
