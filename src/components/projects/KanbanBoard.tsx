import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, User, AlertTriangle, CheckCircle2, MoreHorizontal } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onTaskEdit?: (task: Task) => void;
  getTaskProgress: (task: Task) => number;
  getPriorityColor: (priority?: string) => string;
  canEditTask: (task: Task) => boolean;
}

const KanbanBoard = ({ 
  tasks, 
  onStatusChange, 
  onTaskEdit,
  getTaskProgress, 
  getPriorityColor, 
  canEditTask 
}: KanbanBoardProps) => {
  const columns = [
    { 
      id: "pending", 
      title: "Pendientes", 
      color: "bg-orange-100 border-orange-200",
      headerColor: "text-orange-800",
      icon: <Clock className="h-5 w-5" />
    },
    { 
      id: "in_progress", 
      title: "En Progreso", 
      color: "bg-blue-100 border-blue-200",
      headerColor: "text-blue-800",
      icon: <AlertTriangle className="h-5 w-5" />
    },
    { 
      id: "done", 
      title: "Completadas", 
      color: "bg-green-100 border-green-200",
      headerColor: "text-green-800",
      icon: <CheckCircle2 className="h-5 w-5" />
    }
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getTaskStatusInfo = (task: Task) => {
    if (!task.dueDate) return { color: "gray", label: "Sin fecha", isOverdue: false };
    
    const today = new Date();
    const dueDate = parseISO(task.dueDate);
    const daysUntilDue = differenceInDays(dueDate, today);
    
    if (task.status === "done") return { color: "green", label: "Completada", isOverdue: false };
    if (daysUntilDue < 0) return { color: "red", label: "Atrasada", isOverdue: true };
    if (daysUntilDue === 0) return { color: "orange", label: "Hoy", isOverdue: false };
    if (daysUntilDue <= 3) return { color: "yellow", label: "Próxima", isOverdue: false };
    return { color: "blue", label: "En tiempo", isOverdue: false };
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("application/json", JSON.stringify(task));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskData = JSON.parse(e.dataTransfer.getData("application/json"));
    
    if (taskData.status !== newStatus && canEditTask(taskData)) {
      onStatusChange(taskData.id, newStatus);
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const progress = getTaskProgress(task);
    const statusInfo = getTaskStatusInfo(task);
    const priorityClasses = getPriorityColor(task.priority);

    return (
      <Card 
        className="mb-3 cursor-move hover:shadow-lg transition-all duration-200 border-l-4"
        style={{ borderLeftColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#10b981' }}
        draggable={canEditTask(task)}
        onDragStart={(e) => handleDragStart(e, task)}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header de la tarea */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-foreground mb-1 line-clamp-2">{task.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
              </div>
              
              {canEditTask(task) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onTaskEdit?.(task)}>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(task.id, "pending")}>
                      Marcar como Pendiente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(task.id, "in_progress")}>
                      Marcar como En Progreso
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onStatusChange(task.id, "done")}>
                      Marcar como Completada
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Prioridad */}
            {task.priority && (
              <Badge variant="outline" className={`text-xs ${priorityClasses}`}>
                {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
              </Badge>
            )}

            {/* Progreso */}
            {task.subTasks && task.subTasks.length > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Progreso</span>
                  <span className="text-xs font-medium">{progress.toFixed(0)}%</span>
                </div>
                <Progress value={progress} className="h-1" />
                <p className="text-xs text-muted-foreground">
                  {task.subTasks.filter(st => st.isCompleted).length} de {task.subTasks.length} subtareas
                </p>
              </div>
            )}

            {/* Fecha de vencimiento */}
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className={`text-xs ${statusInfo.isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                  {format(parseISO(task.dueDate), "dd MMM", { locale: es })}
                </span>
                {statusInfo.isOverdue && (
                  <Badge variant="destructive" className="text-xs py-0">
                    Atrasada
                  </Badge>
                )}
              </div>
            )}

            {/* Asignado a */}
            {task.assigned && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={task.assigneeAvatar} />
                  <AvatarFallback className="text-xs">
                    {task.assigned.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">{task.assigned}</span>
              </div>
            )}

            {/* Proyecto */}
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-xs text-muted-foreground truncate">{task.project}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        
        return (
          <div key={column.id} className="flex flex-col h-full">
            <Card className={`${column.color} mb-4`}>
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 text-lg ${column.headerColor}`}>
                  {column.icon}
                  {column.title}
                  <Badge variant="secondary" className="ml-auto">
                    {columnTasks.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>
            
            <div 
              className="flex-1 min-h-[400px] p-2 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {columnTasks.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <div className="text-center">
                    {column.icon}
                    <p className="text-sm mt-2">No hay tareas</p>
                  </div>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default KanbanBoard;