import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateProject: (projectData: any) => void;
  miembros: any[];
  showTrigger?: boolean;
}

const CreateProjectDialog = ({ open, onOpenChange, onCreateProject, miembros, showTrigger = true }: CreateProjectDialogProps) => {
  const [newProject, setNewProject] = useState({
    nombre: "",
    descripcion: "",
    fecha_inicio: "",
    fecha_fin_estimada: "",
    fecha_fin: "",
    presupuesto: "",
    responsable: "",
    cliente: "",
    miembros_seleccionados: [] as string[],
  });

  const handleMemberToggle = (usuarioId: string, checked: boolean) => {
    if (checked) {
      setNewProject({
        ...newProject,
        miembros_seleccionados: [...newProject.miembros_seleccionados, usuarioId]
      });
    } else {
      setNewProject({
        ...newProject,
        miembros_seleccionados: newProject.miembros_seleccionados.filter(id => id !== usuarioId)
      });
    }
  };

  const handleSubmit = () => {
    if (!newProject.nombre?.trim() || !newProject.fecha_inicio || !newProject.fecha_fin_estimada) {
      return;
    }
    
    const projectData = {
      nombre: newProject.nombre,
      descripcion: newProject.descripcion,
      fechaInicio: newProject.fecha_inicio,
      fechaFinEstimada: newProject.fecha_fin_estimada,
      fechaFin: newProject.fecha_fin,
      presupuesto: newProject.presupuesto ? parseFloat(newProject.presupuesto) : null,
      responsable: newProject.responsable || null,
      cliente: newProject.cliente,
      miembros: newProject.miembros_seleccionados.map(id => ({ usuario_id: id }))
    };
    
    onCreateProject(projectData);
    setNewProject({
      nombre: "",
      descripcion: "",
      fecha_inicio: "",
      fecha_fin_estimada: "",
      fecha_fin: "",
      presupuesto: "",
      responsable: "",
      cliente: "",
      miembros_seleccionados: [],
    });
    onOpenChange(false);
  };

  const isValid = newProject.nombre?.trim() && newProject.fecha_inicio && newProject.fecha_fin_estimada;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo proyecto
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Nombre del proyecto *</Label>
            <Input
              id="projectName"
              value={newProject.nombre}
              onChange={(e) => setNewProject({...newProject, nombre: e.target.value})}
              placeholder="Nombre del proyecto"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="projectDescription">Descripción</Label>
            <Textarea
              id="projectDescription"
              value={newProject.descripcion}
              onChange={(e) => setNewProject({...newProject, descripcion: e.target.value})}
              placeholder="Describe el proyecto"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cliente">Cliente</Label>
            <Input
              id="cliente"
              value={newProject.cliente}
              onChange={(e) => setNewProject({...newProject, cliente: e.target.value})}
              placeholder="Nombre del cliente"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha inicio *</Label>
              <Input
                id="startDate"
                type="date"
                value={newProject.fecha_inicio}
                onChange={(e) => setNewProject({...newProject, fecha_inicio: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha fin estimada *</Label>
              <Input
                id="endDate"
                type="date"
                value={newProject.fecha_fin_estimada}
                onChange={(e) => setNewProject({...newProject, fecha_fin_estimada: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDateActual">Fecha fin real</Label>
              <Input
                id="endDateActual"
                type="date"
                value={newProject.fecha_fin}
                onChange={(e) => setNewProject({...newProject, fecha_fin: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Presupuesto</Label>
              <Input
                id="budget"
                type="number"
                min="0"
                step="0.01"
                value={newProject.presupuesto}
                onChange={(e) => setNewProject({...newProject, presupuesto: e.target.value})}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsable">Responsable del proyecto</Label>
            <Select
              value={newProject.responsable}
              onValueChange={(value) => setNewProject({...newProject, responsable: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un responsable" />
              </SelectTrigger>
              <SelectContent>
                {miembros.map((miembro) => (
                  <SelectItem key={miembro.usuario_id} value={miembro.usuario_id}>
                    {miembro.nombre_completo}
                    {miembro.puesto && ` (${miembro.puesto})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Miembros del proyecto</Label>
            <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
              {miembros.length > 0 ? (
                miembros.map((miembro) => (
                  <div key={miembro.usuario_id} className="flex items-center space-x-2">
                    <Checkbox
                      id={miembro.usuario_id}
                      checked={newProject.miembros_seleccionados.includes(miembro.usuario_id)}
                      onCheckedChange={(checked) => handleMemberToggle(miembro.usuario_id, checked as boolean)}
                    />
                    <Label htmlFor={miembro.usuario_id} className="text-sm font-normal cursor-pointer">
                      {miembro.nombre_completo}
                      {miembro.puesto && (
                        <span className="text-muted-foreground ml-2">({miembro.puesto})</span>
                      )}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No hay miembros disponibles</p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Crear Proyecto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;