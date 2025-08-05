import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, CheckSquare } from "lucide-react";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTask: (taskData: any) => void;
  proyectos: any[];
  miembros: any[];
}

const CreateTaskDialog = ({ open, onOpenChange, onCreateTask, proyectos, miembros }: CreateTaskDialogProps) => {
  const { obtenerMiembrosProyecto } = useSupabaseData();
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assigned: "",
    dueDate: "",
    project: "",
    priority: "medium" as "low" | "medium" | "high",
  });
  const [miembrosProyecto, setMiembrosProyecto] = useState<any[]>([]);

  // Cargar miembros cuando se selecciona un proyecto
  useEffect(() => {
    const cargarMiembrosDelProyecto = async () => {
      if (newTask.project) {
        const proyecto = proyectos.find(p => p.nombre === newTask.project);
        if (proyecto) {
          const miembros = await obtenerMiembrosProyecto(proyecto.id);
          setMiembrosProyecto(miembros);
        }
      } else {
        setMiembrosProyecto([]);
      }
    };

    cargarMiembrosDelProyecto();
  }, [newTask.project, proyectos, obtenerMiembrosProyecto]);

  // Limpiar asignación cuando cambia el proyecto (separado del useEffect anterior)
  useEffect(() => {
    setNewTask(prev => ({ ...prev, assigned: "" }));
  }, [newTask.project]);

  const handleSubmit = () => {
    if (!newTask.title?.trim() || !newTask.assigned || !newTask.dueDate || !newTask.project) {
      return;
    }
    
    onCreateTask(newTask);
    setNewTask({
      title: "",
      description: "",
      assigned: "",
      dueDate: "",
      project: "",
      priority: "medium",
    });
    setMiembrosProyecto([]);
    onOpenChange(false);
  };

  const isValid = newTask.title?.trim() && newTask.assigned && newTask.dueDate && newTask.project;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          <CheckSquare className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Tarea</DialogTitle>
          <DialogDescription>
            Completa la información para crear una nueva tarea
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="taskTitle">Título de la tarea *</Label>
            <Input
              id="taskTitle"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              placeholder="Título de la tarea"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taskDescription">Descripción</Label>
            <Textarea
              id="taskDescription"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              placeholder="Describe la tarea"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskProject">Proyecto *</Label>
              <Select value={newTask.project} onValueChange={(value) => setNewTask({...newTask, project: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar proyecto" />
                </SelectTrigger>
                <SelectContent>
                  {proyectos.map((proyecto) => (
                    <SelectItem key={proyecto.id} value={proyecto.nombre}>
                      {proyecto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskAssigned">Asignado a *</Label>
              <Select value={newTask.assigned} onValueChange={(value) => setNewTask({...newTask, assigned: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Asignar persona" />
                </SelectTrigger>
                <SelectContent>
                  {miembrosProyecto.length > 0 ? (
                    miembrosProyecto.map((miembro) => (
                      <SelectItem key={miembro.usuario_id} value={miembro.nombre_completo}>
                        {miembro.nombre_completo}
                        {miembro.puesto && <span className="text-muted-foreground ml-2">({miembro.puesto})</span>}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-members" disabled>
                      {newTask.project ? 'Cargando miembros...' : 'Selecciona un proyecto primero'}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskDueDate">Fecha de entrega *</Label>
              <Input
                id="taskDueDate"
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskPriority">Prioridad</Label>
              <Select value={newTask.priority} onValueChange={(value: "low" | "medium" | "high") => setNewTask({...newTask, priority: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Crear Tarea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog;