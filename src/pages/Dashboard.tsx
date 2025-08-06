
import AppLayout from "../components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, TrendingUp, Loader2, Calendar, Users, BarChart3, ChevronDown, ChevronUp, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import ProjectStats from "../components/projects/ProjectStats";
import ProjectCharts from "../components/projects/ProjectCharts";
import { useSupabaseData } from "../hooks/useSupabaseData";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const { tareas, proyectos, perfiles, obtenerEstadisticas, loading } = useSupabaseData();
  const [activeTab, setActiveTab] = useState("overview");
  const [pendingTasksOpen, setPendingTasksOpen] = useState(true);
  const [completedTasksOpen, setCompletedTasksOpen] = useState(true);
  
  // Convertir tareas de Supabase al formato legacy para compatibilidad
  const convertirTareas = () => {
    return tareas.map(tarea => {
      const perfil = perfiles.find(p => p.usuario_id === tarea.asignado_a);
      const proyecto = proyectos.find(p => p.id === tarea.proyecto_id);
      return {
        id: tarea.id,
        title: tarea.titulo,
        description: tarea.descripcion || '',
        assigned: tarea.asignado_a,
        assignedName: perfil?.nombre_completo || 'Sin asignar',
        dueDate: tarea.fecha_limite,
        status: tarea.estado === 'planificacion' ? 'pending' as const : 
                tarea.estado === 'en_progreso' ? 'in_progress' as const :
                tarea.estado === 'completado' ? 'done' as const : 'pending' as const,
        project: proyecto?.nombre || 'Proyecto desconocido'
      };
    });
  };

  const tasks = convertirTareas();
  const estadisticas = obtenerEstadisticas();
  
  // Filtrar tareas por estado
  const pendingTasks = tasks.filter(task => 
    task.status === "pending" || task.status === "in_progress"
  );
  const completedTasks = tasks.filter(task => task.status === "done");
  
  // Filtrar por usuario si es necesario
  const userPendingTasks = profile?.usuario_id 
    ? pendingTasks.filter(task => task.assigned === profile.usuario_id)
    : pendingTasks;
  const userCompletedTasks = profile?.usuario_id
    ? completedTasks.filter(task => task.assigned === profile.usuario_id) 
    : completedTasks;
  
  // Calcular estadísticas
  const stats = [
    { 
      title: "Proyectos activos", 
      value: estadisticas.proyectosActivos,
      icon: <Users className="w-5 h-5 text-blue-500" />
    },
    { 
      title: "Tareas pendientes", 
      value: userPendingTasks.length,
      icon: <Clock className="w-5 h-5 text-amber-500" />
    },
    { 
      title: "Tareas completadas", 
      value: userCompletedTasks.length,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />
    },
    {
      title: "Tasa de finalización",
      value: `${estadisticas.tasaCompletacion}%`,
      icon: <TrendingUp className="w-5 h-5 text-violet-500" />
    }
  ];
  
  // Formatear fecha para mostrar
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return "-";
    
    const today = new Date();
    const dueDate = new Date(dateString);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Mañana";
    if (diffDays === -1) return "Ayer";
    if (diffDays < 0) return `Hace ${Math.abs(diffDays)} días`;
    if (diffDays > 0 && diffDays < 7) return `En ${diffDays} días`;
    
    return new Date(dateString).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Obtener el color según el estado de la tarea
  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-amber-100 text-amber-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "done": return "bg-emerald-100 text-emerald-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Obtener el texto de estado de la tarea
  const getStatusText = (status: string) => {
    switch(status) {
      case "pending": return "Pendiente";
      case "in_progress": return "En progreso";
      case "done": return "Completado";
      default: return status;
    }
  };
  
  // Obtener el ícono según el estado de la tarea
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "pending": return <Clock size={14} />;
      case "in_progress": return <Loader2 size={14} className="animate-spin" />;
      case "done": return <CheckCircle2 size={14} />;
      default: return null;
    }
  };

  return (
    <AppLayout title="Dashboard">
      <div className="grid gap-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold text-gray-800">Bienvenido, {profile?.nombre_completo || user?.email}</h2>
          <p className="text-gray-500">Aquí tienes un resumen de tus proyectos y tareas actuales.</p>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-50 rounded-3xl" />
          
          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full relative">
            <TabsList className="mb-4 bg-white/70 backdrop-blur">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50">
                <BarChart3 className="w-4 h-4 mr-2" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-50">
                <TrendingUp className="w-4 h-4 mr-2" />
                Análisis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="animate-in fade-in-50 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <Card key={index} className="border-none shadow-sm bg-white/80 backdrop-blur transition-all duration-300 hover:shadow-md">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                        <div className="rounded-full p-2 bg-gray-50">{stat.icon}</div>
                      </div>
                      <p className="text-3xl font-bold mt-2 text-gray-800">{stat.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur transition-all duration-300 hover:shadow-md">
                  <Collapsible open={pendingTasksOpen} onOpenChange={setPendingTasksOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Tareas pendientes</CardTitle>
                          <CardDescription>Tus tareas y actividades actuales</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-amber-50 rounded-full">
                            <Clock size={18} className="text-amber-600" />
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-1 h-auto">
                              {pendingTasksOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-4">
                          {userPendingTasks.length > 0 ? (
                            userPendingTasks.slice(0, 5).map((task) => (
                               <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0 group hover:bg-gray-50/50 p-2 rounded-md transition-colors gap-2">
                                 <div className="flex-1 min-w-0">
                                   <p className="font-medium group-hover:text-blue-700 transition-colors text-sm sm:text-base truncate">{task.title}</p>
                                   <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1 flex-wrap gap-1">
                                     <div className="flex items-center">
                                       <Calendar size={12} className="mr-1" />
                                       <span>{formatDueDate(task.dueDate)}</span>
                                     </div>
                                     <span className="hidden sm:inline-block mx-2">•</span>
                                     <span className="truncate max-w-[100px] sm:max-w-[120px]">{task.project}</span>
                                     {task.assignedName && (
                                       <>
                                         <span className="hidden sm:inline-block mx-2">•</span>
                                         <div className="flex items-center gap-1">
                                           <User size={12} />
                                           <span className="truncate">{task.assignedName}</span>
                                         </div>
                                       </>
                                     )}
                                   </div>
                                 </div>
                                 <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center self-start sm:self-center ${getStatusColor(task.status)}`}>
                                   {getStatusIcon(task.status)}
                                   <span className="ml-1 hidden sm:inline">{getStatusText(task.status)}</span>
                                 </div>
                               </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                              <div className="bg-amber-50 p-3 rounded-full mb-3">
                                <CheckCircle2 size={24} className="text-amber-500" />
                              </div>
                              <p className="text-gray-500 text-center">No hay tareas pendientes</p>
                              <p className="text-gray-400 text-sm text-center">¡Todo al día!</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
                
                <Card className="border-none shadow-sm bg-white/80 backdrop-blur transition-all duration-300 hover:shadow-md">
                  <Collapsible open={completedTasksOpen} onOpenChange={setCompletedTasksOpen}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Tareas completadas</CardTitle>
                          <CardDescription>Tareas finalizadas recientemente</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-50 rounded-full">
                            <CheckCircle2 size={18} className="text-emerald-600" />
                          </div>
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="p-1 h-auto">
                              {completedTasksOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                      </div>
                    </CardHeader>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="space-y-4">
                          {userCompletedTasks.length > 0 ? (
                            userCompletedTasks.slice(0, 5).map((task) => (
                               <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 last:border-0 last:pb-0 group hover:bg-gray-50/50 p-2 rounded-md transition-colors gap-2">
                                 <div className="flex-1 min-w-0">
                                   <p className="font-medium group-hover:text-emerald-700 transition-colors text-sm sm:text-base truncate">{task.title}</p>
                                   <div className="flex items-center text-xs sm:text-sm text-gray-500 mt-1 flex-wrap gap-1">
                                     <div className="flex items-center">
                                       <Calendar size={12} className="mr-1" />
                                       <span>{formatDueDate(task.dueDate)}</span>
                                     </div>
                                     <span className="hidden sm:inline-block mx-2">•</span>
                                     <span className="truncate max-w-[100px] sm:max-w-[120px]">{task.project}</span>
                                     {task.assignedName && (
                                       <>
                                         <span className="hidden sm:inline-block mx-2">•</span>
                                         <div className="flex items-center gap-1">
                                           <User size={12} />
                                           <span className="truncate">{task.assignedName}</span>
                                         </div>
                                       </>
                                     )}
                                   </div>
                                 </div>
                                 <div className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 self-start sm:self-center">
                                   <div className="flex items-center">
                                     <CheckCircle2 size={12} className="mr-1" />
                                     <span className="hidden sm:inline">Completado</span>
                                   </div>
                                 </div>
                               </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                              <div className="bg-emerald-50 p-3 rounded-full mb-3">
                                <Clock size={24} className="text-emerald-500" />
                              </div>
                              <p className="text-gray-500 text-center">No hay tareas completadas</p>
                              <p className="text-gray-400 text-sm text-center">¡Completa alguna tarea para verla aquí!</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="animate-in fade-in-50 duration-300">
              <ProjectStats tasks={tasks} />
              <div className="mt-6">
                <ProjectCharts tasks={tasks} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
