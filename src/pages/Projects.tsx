import React, { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { useUserPermissions } from "@/hooks/useUserPermissions";
import KanbanBoard from "../components/projects/KanbanBoard";
import CreateProjectDialog from "../components/projects/CreateProjectDialog";
import CreateTaskDialog from "../components/projects/CreateTaskDialog";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Projects = () => {
  const { user, profile } = useAuth();
  const { canCreateProjects, canCreateTasks, canDeleteTasks, userRole } = useUserPermissions();
  const { 
    tasks, 
    proyectos, 
    perfiles, 
    crearTarea, 
    actualizarTarea, 
    crearProyecto,
    actualizarEstadoTarea,
    eliminarTarea
  } = useSupabaseData();
  
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeView, setActiveView] = useState("kanban");

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
      console.log('Datos de tarea recibidos en Projects:', taskData);
      
      // Buscar el proyecto por nombre
      const proyecto = proyectos?.find(p => p.nombre === taskData.project);
      if (!proyecto) {
        throw new Error(`Proyecto "${taskData.project}" no encontrado`);
      }

      // Buscar el usuario asignado por nombre
      const usuarioAsignado = perfiles?.find(p => p.nombre_completo === taskData.assigned);
      if (!usuarioAsignado) {
        throw new Error(`Usuario "${taskData.assigned}" no encontrado`);
      }

      // Preparar datos en el formato correcto para Supabase
      const supabaseTaskData = {
        titulo: taskData.title,
        descripcion: taskData.description || '',
        proyecto_id: proyecto.id,
        asignado_a: usuarioAsignado.usuario_id,
        fecha_limite: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : null,
        fecha_inicio: new Date().toISOString().split('T')[0],
        prioridad: taskData.priority,
        estado: 'planificacion' as const,
        creado_por: user?.id
      };

      console.log('Datos preparados para Supabase:', supabaseTaskData);

      await crearTarea(supabaseTaskData);
      setShowCreateTask(false);
      toast({
        title: "Tarea creada",
        description: "La tarea se ha creado exitosamente",
      });
    } catch (error: any) {
      console.error('Error en handleCreateTask:', error);
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
    // Admins y gerentes pueden editar todas las tareas, miembros solo las asignadas a ellos
    return userRole === 'admin' || userRole === 'gerente' || task.assigned === currentUser;
  };

  const handleTaskDelete = async (taskId: string) => {
    try {
      await eliminarTarea(taskId);
      toast({
        title: "Tarea eliminada",
        description: "La tarea se ha eliminado exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la tarea",
        variant: "destructive"
      });
    }
  };

  const proyectosActivos = proyectos?.filter(p => p.activo) || [];

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
            {canCreateTasks && (
              <CreateTaskDialog
                open={showCreateTask}
                onOpenChange={setShowCreateTask}
                onCreateTask={handleCreateTask}
                proyectos={proyectosActivos}
                miembros={perfiles || []}
                showTrigger={true}
              />
            )}
            
            {canCreateProjects && (
              <CreateProjectDialog
                open={showCreateProject}
                onOpenChange={setShowCreateProject}
                onCreateProject={handleCreateProject}
                miembros={perfiles || []}
                showTrigger={true}
              />
            )}
          </div>
        </div>

        {/* Vista de tareas con metodología Kanban */}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="kanban">Vista Kanban</TabsTrigger>
            <TabsTrigger value="list">Vista Lista</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kanban" className="mt-6">
            <KanbanBoard 
              tasks={mappedTasks}
              onStatusChange={handleTaskStatusChange}
              onTaskDelete={handleTaskDelete}
              getTaskProgress={getTaskProgress}
              getPriorityColor={getPriorityColor}
              canEditTask={canEditTask}
              canDeleteTasks={canDeleteTasks}
            />
          </TabsContent>
          
          <TabsContent value="list" className="mt-6">
            <div className="space-y-4">
              {mappedTasks.map((task) => {
                const progress = getTaskProgress(task);
                const status = getTaskStatus(task);
                
                return (
                  <div key={task.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{task.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            {task.project}
                          </span>
                          {task.assigned && (
                            <span className="text-xs text-muted-foreground">
                              Asignado a: {task.assigned}
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              Vence: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'done' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {task.status === 'done' ? 'Completada' :
                           task.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Projects;