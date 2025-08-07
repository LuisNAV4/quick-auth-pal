
import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import ProjectGrid from "../components/projects/ProjectGrid";
import ProjectDetailView from "../components/projects/ProjectDetailView";
import ProjectImageManager from "../components/projects/ProjectImageManager";
import { useSupabaseData } from "../hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

interface SubTask {
  id: string;
  description: string;
  isCompleted: boolean;
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

const TaskTrackingPage = () => {
  const { user } = useAuth();
  const { 
    tasks, 
    proyectos, 
    perfiles, 
    actualizarTarea, 
    actualizarEstadoTarea 
  } = useSupabaseData();
  
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showImageManager, setShowImageManager] = useState(false);

  // Map Supabase data to component interfaces
  const mappedTasks = tasks?.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || '',
    assigned: task.assigned,
    dueDate: task.dueDate || undefined,
    status: task.status,
    project: task.project,
    priority: task.priority,
    startDate: task.startDate || undefined,
    budget: task.budget || 0,
    actualCost: task.actualCost || 0,
    client: task.client || 'Cliente General',
    subTasks: task.subTasks || []
  })) || [];

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const supabaseStatus = newStatus === 'pending' ? 'planificacion' : 
                           newStatus === 'in_progress' ? 'en_progreso' : 
                           'completado';
      
      await actualizarEstadoTarea(taskId, supabaseStatus);
      
      if (newStatus === 'done') {
        toast({
          title: "Tarea completada",
          description: "La tarea se ha marcado como completada",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la tarea",
        variant: "destructive"
      });
    }
  };

  const handleSubTaskToggle = async (taskId: string, subTaskId: string, completed: boolean) => {
    toast({
      title: "Funcionalidad en desarrollo",
      description: "Las subtareas se implementarán próximamente",
    });
  };

  const handleFileUpload = async (taskId: string, subTaskId: string, file: File) => {
    toast({
      title: "Funcionalidad en desarrollo",
      description: "La subida de archivos se implementará próximamente",
    });
  };

  const getTaskProgress = (task: any) => {
    if (!task.subTasks || task.subTasks.length === 0) {
      return task.status === "done" ? 100 : task.status === "in_progress" ? 50 : 0;
    }
    const completed = task.subTasks.filter((st: any) => st.isCompleted).length;
    return (completed / task.subTasks.length) * 100;
  };

  const getTaskStatus = (task: any) => {
    const today = new Date();
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    const isOverdue = dueDate && dueDate < today && task.status !== "done";

    if (isOverdue) return { color: "red", label: "Atrasada" };
    if (task.status === "done") return { color: "green", label: "Completada" };
    if (task.status === "in_progress") return { color: "blue", label: "En progreso" };
    return { color: "orange", label: "Pendiente" };
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high": return "border-red-500 text-red-700";
      case "medium": return "border-yellow-500 text-yellow-700";
      case "low": return "border-green-500 text-green-700";
      default: return "border-gray-500 text-gray-700";
    }
  };

  const getProgressColor = (progress: number, task: any) => {
    if (progress === 100) return "bg-green-500";
    if (progress > 50) return "bg-blue-500";
    return "bg-orange-500";
  };

  const canEditTask = (task: any) => {
    // En el área de seguimiento, los usuarios pueden ver todos los proyectos
    return true;
  };

  // Verificar si el usuario es director del proyecto seleccionado
  const isProjectDirector = () => {
    if (!selectedProject || !user) return false;
    
    const proyecto = proyectos?.find(p => p.nombre === selectedProject);
    if (!proyecto) return false;
    
    // Es director si es creador, responsable, o tiene rol admin/manager
    return proyecto.creado_por === user.id || 
           proyecto.responsable_id === user.id;
  };

  const getSelectedProjectId = () => {
    if (!selectedProject) return null;
    const proyecto = proyectos?.find(p => p.nombre === selectedProject);
    return proyecto?.id || null;
  };

  // Filtrar tareas por proyecto seleccionado
  const projectTasks = selectedProject 
    ? mappedTasks.filter(task => task.project === selectedProject)
    : mappedTasks;

  if (selectedProject) {
    const projectId = getSelectedProjectId();
    
    return (
      <AppLayout title={`Proyecto: ${selectedProject}`}>
        <ProjectDetailView
          projectName={selectedProject}
          tasks={projectTasks}
          onBack={() => setSelectedProject(null)}
          onUpdateTask={async (taskId: string, updates: any) => {
            try {
              await actualizarTarea(taskId, updates);
            } catch (error) {
              console.error('Error actualizando tarea:', error);
            }
          }}
          onStatusChange={handleTaskStatusChange}
          onSubTaskToggle={handleSubTaskToggle}
          onFileUpload={handleFileUpload}
          getTaskProgress={getTaskProgress}
          getTaskStatus={getTaskStatus}
          getPriorityColor={getPriorityColor}
          getProgressColor={getProgressColor}
          canEditTask={canEditTask}
          projectId={projectId}
          isProjectDirector={isProjectDirector()}
          onManageImages={() => setShowImageManager(true)}
        />
        
        {/* Manager de imágenes */}
        {projectId && (
          <ProjectImageManager
            open={showImageManager}
            onOpenChange={setShowImageManager}
            projectId={projectId}
            projectName={selectedProject}
          />
        )}
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Seguimiento de Proyectos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Seguimiento de Proyectos</h1>
            <p className="text-muted-foreground mt-1">
              Vista general de todos los proyectos y su progreso
            </p>
          </div>
        </div>

        <ProjectGrid 
          tasks={mappedTasks} 
          onProjectSelect={setSelectedProject}
        />
      </div>
    </AppLayout>
  );
};

export default TaskTrackingPage;
