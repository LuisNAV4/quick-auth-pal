import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Building2, Upload, FileText, Settings } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useRef } from "react";
import TaskReportsDialog from "./TaskReportsDialog";

interface SubTask {
  id: string;
  description: string;
  isCompleted: boolean;
  files?: { name: string; url: string; uploadedAt: string }[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  assigned?: string;
  assigneeAvatar?: string;
  assigneeRole?: string;
  dueDate?: string;
  status: "pending" | "in_progress" | "done";
  project: string;
  client?: string;
  budget?: number;
  actualCost?: number;
  startDate?: string;
  priority?: "low" | "medium" | "high";
  subTasks?: SubTask[];
}

interface TaskCardProps {
  task: Task;
  showDetails: boolean;
  progress: number;
  status: { color: string; label: string };
  onStatusChange: (taskId: string, newStatus: string) => void;
  onSubTaskToggle: (taskId: string, subTaskId: string, completed: boolean) => void;
  onFileUpload?: (taskId: string, subTaskId: string, file: File) => void;
  onUpdateTask?: (taskId: string, updates: any) => Promise<void>;
  getPriorityColor: (priority?: string) => string;
  getProgressColor: (progress: number, task: Task) => string;
  canEditTask: (task: Task) => boolean;
  userRole?: string;
}

const TaskCard = ({ 
  task, 
  showDetails, 
  progress, 
  status, 
  onStatusChange, 
  onSubTaskToggle,
  onFileUpload,
  onUpdateTask,
  getPriorityColor, 
  getProgressColor,
  canEditTask,
  userRole
}: TaskCardProps) => {
  const { user } = useAuth();
  const [showReports, setShowReports] = useState(false);
  const canEdit = canEditTask(task);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleFileUpload = (subTaskId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      onFileUpload(task.id, subTaskId, file);
      // Reset the input
      if (fileInputRefs.current[subTaskId]) {
        fileInputRefs.current[subTaskId]!.value = '';
      }
    }
  };

  const triggerFileUpload = (subTaskId: string) => {
    fileInputRefs.current[subTaskId]?.click();
  };

  return (
    <Card className="p-4 md:p-6">
      <div className="space-y-4">
        {/* Header de la tarea - responsive */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h4 className="font-medium text-foreground truncate">{task.title}</h4>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority === "high" ? "Alta" : 
                   task.priority === "medium" ? "Media" : 
                   task.priority === "low" ? "Baja" : "Normal"}
                </Badge>
                {canEdit && (
                  <Select value={task.status} onValueChange={(value) => onStatusChange(task.id, value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="in_progress">En progreso</SelectItem>
                      <SelectItem value="done">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
            {showDetails && task.description && (
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {task.dueDate ? format(parseISO(task.dueDate), "dd MMM yyyy", { locale: es }) : "Sin fecha"}
              </span>
              <span className="truncate">{task.project}</span>
              {showDetails && task.client && (
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {task.client}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            {/* Botón de gestión de informes */}
            {canEdit && onUpdateTask && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowReports(true)}
                className="h-8 px-3"
                title="Gestionar tarea"
              >
                <Settings size={14} className="mr-1" />
                Gestionar
              </Button>
            )}
            
            {task.assigned && (
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarImage src={task.assigneeAvatar} />
                  <AvatarFallback>{task.assigned[0]}</AvatarFallback>
                </Avatar>
                {showDetails && <span className="text-sm truncate">{task.assigned}</span>}
              </div>
            )}
            
            <Badge 
              variant="outline" 
              className={
                status.color === "green" ? "bg-green-50 text-green-700 border-green-200" :
                status.color === "red" ? "bg-red-50 text-red-700 border-red-200" :
                status.color === "orange" ? "bg-orange-50 text-orange-700 border-orange-200" :
                status.color === "yellow" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                "bg-blue-50 text-blue-700 border-blue-200"
              }
            >
              {status.label}
            </Badge>
          </div>
        </div>
        
        {/* Sub-tareas - siempre visibles si existen */}
        {task.subTasks && task.subTasks.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-foreground">
              Sub-tareas ({task.subTasks.filter(st => st.isCompleted).length}/{task.subTasks.length})
            </h5>
            <div className="space-y-3 bg-secondary/50 p-3 md:p-4 rounded-md">
              {task.subTasks.map((subTask) => (
                <div key={subTask.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={subTask.isCompleted}
                      onCheckedChange={(checked) => 
                        onSubTaskToggle(task.id, subTask.id, checked as boolean)
                      }
                      disabled={!canEdit}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <span className={`text-sm block ${subTask.isCompleted ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                        {subTask.description && subTask.description.trim() !== '' ? subTask.description : 'Subtarea sin nombre'}
                      </span>
                    </div>
                    
                    {/* Botón de subida de archivo - visible para persona asignada y director */}
                    {canEdit && onFileUpload && (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={(el) => fileInputRefs.current[subTask.id] = el}
                          onChange={(e) => handleFileUpload(subTask.id, e)}
                          className="hidden"
                          accept="*/*"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => triggerFileUpload(subTask.id)}
                          className="h-8 px-2"
                          title="Subir archivo"
                        >
                          <Upload size={14} />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {/* Mostrar archivos subidos */}
                  {subTask.files && subTask.files.length > 0 && (
                    <div className="ml-6 space-y-1">
                      {subTask.files.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-gray-600 bg-white p-2 rounded border">
                          <FileText size={12} />
                          <span className="flex-1">{file.name}</span>
                          <span className="text-gray-400">
                            {format(new Date(file.uploadedAt), "dd/MM/yyyy HH:mm")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {!canEdit && task.subTasks.some(st => !st.isCompleted) && (
                <p className="text-xs text-gray-400 italic mt-2 border-t pt-2">
                  Solo {task.assigned} o el director pueden modificar las sub-tareas y subir archivos
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progreso</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress, task)}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        {/* Información adicional - solo se muestra si showDetails está activo */}
        {showDetails && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm pt-3 border-t">
            {task.client && (
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">
                  Cliente: <span className="font-medium text-foreground">{task.client}</span>
                </span>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              {task.budget && (
                <span className="text-muted-foreground">
                  Presupuesto: <span className="font-medium text-foreground">${task.budget}</span>
                </span>
              )}
              {task.actualCost && (
                <span className="text-muted-foreground">
                  Costo real: <span className="font-medium text-foreground">${task.actualCost}</span>
                </span>
                )}
            </div>
          </div>
        )}
      </div>
      
      {/* Dialog de gestión de tareas */}
      {onUpdateTask && (
        <TaskReportsDialog
          open={showReports}
          onOpenChange={setShowReports}
          task={task}
          onUpdateTask={onUpdateTask}
          userRole={userRole}
        />
      )}
    </Card>
  );
};

export default TaskCard;
