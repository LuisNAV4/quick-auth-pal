import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Target, Clock, CheckCircle2, AlertTriangle, Plus, Filter } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import TaskList from "./TaskList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { differenceInDays, parseISO, startOfDay } from "date-fns";

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

interface TaskTrackingProps {
  tasks: Task[];
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
}

const TaskTracking = ({ tasks, onUpdateTask }: TaskTrackingProps) => {
  const { user, profile } = useAuth();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "done">("all");
  const [showDetails, setShowDetails] = useState(false);

  // Función para verificar si el usuario puede editar la tarea
  const canEditTask = (task: Task) => {
    if (!user) return false;
    return task.assigned === (profile?.nombre_completo || user?.email) || profile?.puesto === "director";
  };

  const handleSubTaskToggle = (taskId: string, subTaskId: string, completed: boolean) => {
    if (!onUpdateTask) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subTasks) return;
    
    // Verificar que la persona asignada o el director puedan modificar las sub-tareas
    if (!canEditTask(task)) {
      console.log("Solo la persona asignada o el director pueden modificar las sub-tareas");
      return;
    }
    
    const updatedSubTasks = task.subTasks.map(st => 
      st.id === subTaskId ? { ...st, isCompleted: completed } : st
    );
    
    onUpdateTask(taskId, { subTasks: updatedSubTasks });
  };

  const handleFileUpload = (taskId: string, subTaskId: string, file: File) => {
    if (!onUpdateTask) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.subTasks) return;
    
    // Verificar que la persona asignada o el director puedan subir archivos
    if (!canEditTask(task)) {
      toast({
        title: "Error",
        description: "Solo la persona asignada o el director pueden subir archivos a esta sub-tarea",
        variant: "destructive"
      });
      return;
    }
    
    // Simular la subida del archivo (en un caso real, aquí subirías a un servidor)
    const fileUrl = URL.createObjectURL(file);
    const newFile = {
      name: file.name,
      url: fileUrl,
      uploadedAt: new Date().toISOString()
    };
    
    const updatedSubTasks = task.subTasks.map(st => 
      st.id === subTaskId 
        ? { ...st, files: [...(st.files || []), newFile] }
        : st
    );
    
    onUpdateTask(taskId, { subTasks: updatedSubTasks });
    
    toast({
      title: "Archivo subido",
      description: `${file.name} se ha subido correctamente a la sub-tarea`,
    });
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    if (!onUpdateTask) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Verificar que la persona asignada o el director puedan cambiar el estado
    if (!canEditTask(task)) {
      console.log("Solo la persona asignada o el director pueden cambiar el estado de la tarea");
      return;
    }
    
    onUpdateTask(taskId, { status: newStatus as "pending" | "in_progress" | "done" });
  };

  const getTaskProgress = (task: Task) => {
    if (task.status === "done") return 100;
    
    // Si tiene sub-tareas, calcular progreso basado en ellas
    if (task.subTasks && task.subTasks.length > 0) {
      const completedSubTasks = task.subTasks.filter(st => st.isCompleted).length;
      const progress = (completedSubTasks / task.subTasks.length) * 100;
      return progress;
    }
    
    if (task.status === "in_progress") {
      if (!task.dueDate) return 50;
      
      const today = startOfDay(new Date());
      const startDate = task.startDate ? parseISO(task.startDate) : today;
      const dueDate = parseISO(task.dueDate);
      
      const totalDays = differenceInDays(dueDate, startDate);
      const daysPassed = differenceInDays(today, startDate);
      
      if (totalDays <= 0) return 50;
      const progress = Math.min((daysPassed / totalDays) * 100, 90);
      return Math.max(progress, 10);
    }
    return 0;
  };

  const getTaskStatus = (task: Task) => {
    if (task.status === "done") return { color: "green", label: "Completada" };
    
    if (!task.dueDate) return { color: "gray", label: "Sin fecha" };
    
    const today = startOfDay(new Date());
    const dueDate = startOfDay(parseISO(task.dueDate));
    const daysUntilDue = differenceInDays(dueDate, today);
    
    if (daysUntilDue < 0) return { color: "red", label: "Atrasada" };
    if (daysUntilDue === 0) return { color: "orange", label: "Hoy" };
    if (daysUntilDue <= 3) return { color: "yellow", label: "Próxima" };
    return { color: "blue", label: "En tiempo" };
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "bg-red-50 text-red-700 border-red-200";
      case "medium": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "low": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getProgressColor = (progress: number, task: Task) => {
    if (task.status === "done") return "bg-green-500";
    const status = getTaskStatus(task);
    if (status.color === "red") return "bg-red-500";
    if (status.color === "orange") return "bg-orange-500";
    if (status.color === "yellow") return "bg-yellow-500";
    return "bg-blue-500";
  };

  // Estadísticas generales
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "done").length,
    inProgress: tasks.filter(t => t.status === "in_progress").length,
    overdue: tasks.filter(t => {
      if (t.status === "done" || !t.dueDate) return false;
      return differenceInDays(startOfDay(new Date()), startOfDay(parseISO(t.dueDate))) > 0;
    }).length
  };

  const overallProgress = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  // Obtener lista de proyectos únicos
  const projects = Array.from(new Set(tasks.map(task => task.project)));

  // Filtrar tareas
  const filteredTasks = tasks.filter(task => {
    const matchesProject = selectedProject === "all" || task.project === selectedProject;
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesProject && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header con estadísticas responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <Target className="h-6 w-6 md:h-8 md:w-8 text-primary shrink-0" />
            <div className="ml-3 min-w-0">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Total</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-green-500 shrink-0" />
            <div className="ml-3 min-w-0">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Completadas</p>
              <p className="text-xl md:text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 md:h-8 md:w-8 text-blue-500 shrink-0" />
            <div className="ml-3 min-w-0">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">En Progreso</p>
              <p className="text-xl md:text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-orange-500 shrink-0" />
            <div className="ml-3 min-w-0">
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Pendientes</p>
              <p className="text-xl md:text-2xl font-bold text-orange-600">{stats.total - stats.completed - stats.inProgress}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controles responsive con tabs */}
      <Tabs defaultValue="filters" className="w-full">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <TabsList className="grid w-full lg:w-auto grid-cols-2">
            <TabsTrigger value="filters">Filtros</TabsTrigger>
            <TabsTrigger value="view">Vista</TabsTrigger>
          </TabsList>
          
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="lg:hidden"
          >
            {showDetails ? "Vista Simple" : "Vista Detallada"}
          </Button>
        </div>

        <TabsContent value="filters" className="mt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <Filter className="h-4 w-4 shrink-0" />
              <Label className="shrink-0">Estado:</Label>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="done">Completadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2 min-w-0">
              <Label className="shrink-0">Proyecto:</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proyectos</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project} value={project}>
                      {project}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="view" className="mt-4">
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Vista Simple" : "Vista Detallada"}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Lista de tareas */}
      <TaskList
        tasks={filteredTasks}
        showDetails={showDetails}
        selectedProject={selectedProject}
        onStatusChange={handleStatusChange}
        onSubTaskToggle={handleSubTaskToggle}
        onFileUpload={handleFileUpload}
        getTaskProgress={getTaskProgress}
        getTaskStatus={getTaskStatus}
        getPriorityColor={getPriorityColor}
        getProgressColor={getProgressColor}
        canEditTask={canEditTask}
      />
    </div>
  );
};

export default TaskTracking;
