import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, DollarSign, Users, Clock, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { differenceInDays, parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import GanttChart from "./GanttChart";
import TaskList from "./TaskList";

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

interface ProjectDetailViewProps {
  projectName: string;
  tasks: Task[];
  onBack: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskDelete?: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onSubTaskToggle: (taskId: string, subTaskId: string, completed: boolean) => void;
  onFileUpload?: (taskId: string, subTaskId: string, file: File) => void;
  getTaskProgress: (task: Task) => number;
  getTaskStatus: (task: Task) => { color: string; label: string };
  getPriorityColor: (priority?: string) => string;
  getProgressColor: (progress: number, task: Task) => string;
  canEditTask: (task: Task) => boolean;
  canDeleteTasks?: boolean;
  userRole?: string;
  projectId?: string | null;
  isProjectDirector?: boolean;
  onManageImages?: () => void;
}

const ProjectDetailView = ({
  projectName,
  tasks,
  onBack,
  onUpdateTask,
  onTaskDelete,
  onStatusChange,
  onSubTaskToggle,
  onFileUpload,
  getTaskProgress,
  getTaskStatus,
  getPriorityColor,
  getProgressColor,
  canEditTask,
  canDeleteTasks = false,
  userRole,
  projectId,
  isProjectDirector,
  onManageImages
}: ProjectDetailViewProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  // Estadísticas del proyecto
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "done").length;
  const inProgressTasks = tasks.filter(t => t.status === "in_progress").length;
  const pendingTasks = tasks.filter(t => t.status === "pending").length;
  const overdueTasks = tasks.filter(t => {
    if (t.status === "done" || !t.dueDate) return false;
    return differenceInDays(new Date(), parseISO(t.dueDate)) > 0;
  }).length;

  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Información del cliente y presupuesto
  const client = tasks[0]?.client || "Sin cliente asignado";
  const totalBudget = tasks.reduce((sum, task) => sum + (task.budget || 0), 0);
  const totalActualCost = tasks.reduce((sum, task) => sum + (task.actualCost || 0), 0);
  const remainingBudget = totalBudget - totalActualCost;
  
  // Datos para el gráfico de torta del presupuesto
  const budgetChartData = [
    { 
      name: "Gastado", 
      value: totalActualCost, 
      color: "#EF4444",
      percentage: totalBudget > 0 ? ((totalActualCost / totalBudget) * 100).toFixed(1) : "0"
    },
    { 
      name: "Restante", 
      value: Math.max(0, remainingBudget), 
      color: "#22C55E",
      percentage: totalBudget > 0 ? ((Math.max(0, remainingBudget) / totalBudget) * 100).toFixed(1) : "0"
    }
  ];

  // Si hay sobrecosto, ajustar los datos
  if (remainingBudget < 0) {
    budgetChartData[0] = {
      name: "Presupuesto original",
      value: totalBudget,
      color: "#22C55E",
      percentage: totalActualCost > 0 ? ((totalBudget / totalActualCost) * 100).toFixed(1) : "0"
    };
    budgetChartData[1] = {
      name: "Sobrecosto",
      value: Math.abs(remainingBudget),
      color: "#DC2626",
      percentage: totalActualCost > 0 ? ((Math.abs(remainingBudget) / totalActualCost) * 100).toFixed(1) : "0"
    };
  }
  
  // Fechas del proyecto
  const startDates = tasks.filter(t => t.startDate).map(t => parseISO(t.startDate!));
  const dueDates = tasks.filter(t => t.dueDate).map(t => parseISO(t.dueDate!));
  const projectStartDate = startDates.length > 0 ? new Date(Math.min(...startDates.map(d => d.getTime()))) : null;
  const projectEndDate = dueDates.length > 0 ? new Date(Math.max(...dueDates.map(d => d.getTime()))) : null;

  const nextDeadlines = tasks
    .filter(t => t.dueDate && t.status !== "done")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{projectName}</h1>
          <p className="text-gray-600">{client}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="tasks">Tareas</TabsTrigger>
          <TabsTrigger value="gantt">Gantt</TabsTrigger>
          <TabsTrigger value="budget">Presupuesto</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Estadísticas generales */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Tareas</p>
                    <p className="text-2xl font-bold">{totalTasks}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completadas</p>
                    <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En Progreso</p>
                    <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Atrasadas</p>
                    <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
                  </div>
                  <Clock className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progreso del proyecto */}
          <Card>
            <CardHeader>
              <CardTitle>Progreso del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completado</span>
                  <span className="text-sm text-gray-500">{completionPercentage.toFixed(1)}%</span>
                </div>
                <Progress value={completionPercentage} className="h-3" />
              </div>
            </CardContent>
          </Card>

          {/* Información del proyecto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  Cronograma
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {projectStartDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Inicio:</span>
                    <span className="text-sm font-medium">
                      {format(projectStartDate, "dd 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                )}
                {projectEndDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fin estimado:</span>
                    <span className="text-sm font-medium">
                      {format(projectEndDate, "dd 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                )}
                {projectStartDate && projectEndDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duración:</span>
                    <span className="text-sm font-medium">
                      {differenceInDays(projectEndDate, projectStartDate)} días
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign size={20} />
                  Presupuesto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {totalBudget > 0 ? (
                    <>
                      <div className="flex items-center gap-6">
                        {/* Gráfico de torta */}
                        <div className="flex-shrink-0">
                          <ChartContainer 
                            className="h-40 w-40" 
                            config={{
                              gastado: { color: budgetChartData[0].color, label: budgetChartData[0].name },
                              restante: { color: budgetChartData[1].color, label: budgetChartData[1].name }
                            }}
                          >
                            <PieChart>
                              <Pie
                                data={budgetChartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={20}
                                outerRadius={60}
                                paddingAngle={2}
                                dataKey="value"
                              >
                                {budgetChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <ChartTooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-white p-2 border rounded shadow">
                                        <p className="font-medium">{data.name}</p>
                                        <p className="text-sm">${data.value.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">{data.percentage}%</p>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                            </PieChart>
                          </ChartContainer>
                        </div>
                        
                        {/* Leyenda al lado derecho */}
                        <div className="flex-1 space-y-3">
                          {budgetChartData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="font-medium">{item.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">${item.value.toLocaleString()}</div>
                                <div className="text-xs text-gray-500">({item.percentage}%)</div>
                              </div>
                            </div>
                          ))}
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Total presupuesto:</span>
                              <span>${totalBudget.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      <DollarSign size={32} className="mx-auto mb-2 opacity-50" />
                      <p>No hay información de presupuesto disponible</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Próximos vencimientos */}
          {nextDeadlines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Próximos Vencimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nextDeadlines.map((task) => {
                    const daysUntilDue = differenceInDays(parseISO(task.dueDate!), new Date());
                    const isOverdue = daysUntilDue < 0;
                    const isToday = daysUntilDue === 0;
                    
                    return (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm text-gray-600">{task.assigned}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={isOverdue ? "destructive" : isToday ? "default" : "secondary"}>
                            {isOverdue ? `${Math.abs(daysUntilDue)} días atrasado` :
                             isToday ? "Hoy" :
                             `${daysUntilDue} días restantes`}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(parseISO(task.dueDate!), "dd/MM/yyyy", { locale: es })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskList
            tasks={tasks}
            showDetails={true}
            selectedProject={projectName}
            onStatusChange={onStatusChange}
            onSubTaskToggle={onSubTaskToggle}
            onFileUpload={onFileUpload}
            onUpdateTask={onUpdateTask}
            onTaskDelete={onTaskDelete}
            getTaskProgress={getTaskProgress}
            getTaskStatus={getTaskStatus}
            getPriorityColor={getPriorityColor}
            getProgressColor={getProgressColor}
            canEditTask={canEditTask}
            canDeleteTasks={canDeleteTasks}
            userRole={userRole}
            projectId={projectId}
            isProjectDirector={isProjectDirector}
            onManageImages={onManageImages}
          />
        </TabsContent>

        <TabsContent value="gantt">
          <Card className="p-4">
            <GanttChart 
              tasks={tasks}
              onStatusChange={onStatusChange}
              onSubTaskToggle={onSubTaskToggle}
              getTaskProgress={getTaskProgress}
            />
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          {/* Resumen de presupuesto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Presupuesto Total</p>
                  <p className="text-2xl font-bold text-blue-600">${totalBudget.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Gastado</p>
                  <p className="text-2xl font-bold text-orange-600">${totalActualCost.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Restante</p>
                  <p className={`text-2xl font-bold ${totalBudget - totalActualCost >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${(totalBudget - totalActualCost).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desglose por tarea */}
          <Card>
            <CardHeader>
              <CardTitle>Desglose por Tarea</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.assigned}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(task.budget || 0).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">
                        Gastado: ${(task.actualCost || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDetailView;
