import React, { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import ProjectGrid from "../components/projects/ProjectGrid";
import ProjectDetailView from "../components/projects/ProjectDetailView";
import CreateProjectDialog from "../components/projects/CreateProjectDialog";
import CreateTaskDialog from "../components/projects/CreateTaskDialog";
import { toast } from "@/hooks/use-toast";

const Projects = () => {
  const { user, profile } = useAuth();
  const { 
    tasks, 
    proyectos, 
    perfiles, 
    crearTarea, 
    actualizarTarea, 
    crearProyecto,
    actualizarEstadoTarea 
  } = useSupabaseData();
  
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

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

  const handleCreateProject = async (projectData: any) => {
    try {
      await crearProyecto(projectData);
      setShowCreateProject(false);
      toast({
        title: "Proyecto creado",
        description: "El proyecto se ha creado exitosamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear el proyecto: " + error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      const proyecto = proyectos?.find(p => p.nombre === taskData.project);
      if (!proyecto) {
        throw new Error('Proyecto no encontrado');
      }

      const supabaseTaskData = {
        titulo: taskData.title,
        descripcion: taskData.description || '',
        proyecto_id: proyecto.id,
        asignado_a: taskData.assigned ? perfiles?.find(p => p.nombre_completo === taskData.assigned)?.usuario_id : null,
        fecha_limite: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : null,
        fecha_inicio: new Date().toISOString().split('T')[0],
        prioridad: taskData.priority,
        estado: 'planificacion' as const,
      };

      await crearTarea(supabaseTaskData);
      setShowCreateTask(false);
      toast({
        title: "Tarea creada",
        description: "La tarea se ha creado exitosamente",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear la tarea: " + error.message,
        variant: "destructive"
      });
    }
  };

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
    const currentUser = profile?.nombre_completo || user?.email;
    return task.assigned === currentUser || profile?.puesto === 'Director';
  };

  // Filtrar tareas por proyecto seleccionado
  const projectTasks = selectedProject 
    ? mappedTasks.filter(task => task.project === selectedProject)
    : mappedTasks;

  const proyectosActivos = proyectos?.filter(p => p.activo) || [];

  if (selectedProject) {
    return (
      <AppLayout title={`Proyecto: ${selectedProject}`}>
        <ProjectDetailView
          projectName={selectedProject}
          tasks={projectTasks}
          onBack={() => setSelectedProject(null)}
          onUpdateTask={(taskId: string, updates: any) => handleTaskStatusChange(taskId, updates.status)}
          onStatusChange={handleTaskStatusChange}
          onSubTaskToggle={handleSubTaskToggle}
          onFileUpload={handleFileUpload}
          getTaskProgress={getTaskProgress}
          getTaskStatus={getTaskStatus}
          getPriorityColor={getPriorityColor}
          getProgressColor={getProgressColor}
          canEditTask={canEditTask}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Gestión de Proyectos">
      <div className="space-y-6">
        {/* Header responsive */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Gestión de Proyectos</h1>
            <p className="text-muted-foreground mt-1">
              {proyectosActivos.length} proyectos activos • {mappedTasks.length} tareas totales
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <CreateTaskDialog
              open={showCreateTask}
              onOpenChange={setShowCreateTask}
              onCreateTask={handleCreateTask}
              proyectos={proyectosActivos}
              miembros={perfiles || []}
            />
            
            <CreateProjectDialog
              open={showCreateProject}
              onOpenChange={setShowCreateProject}
              onCreateProject={handleCreateProject}
              miembros={perfiles || []}
            />
          </div>
        </div>

        {/* Vista de proyectos */}
        <ProjectGrid 
          tasks={mappedTasks} 
          onProjectSelect={setSelectedProject}
        />
      </div>
    </AppLayout>
  );
};

export default Projects;