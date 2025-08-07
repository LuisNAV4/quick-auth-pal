
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, DollarSign, Users, Target, Building2, ArrowRight } from "lucide-react";
import { differenceInDays, parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

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

interface ProjectGridProps {
  tasks: Task[];
  onProjectSelect: (projectName: string) => void;
  proyectos?: any[];
}

const ProjectGrid = ({ tasks, onProjectSelect, proyectos }: ProjectGridProps) => {
  // Agrupar tareas por proyecto
  const projectsMap = tasks.reduce((acc, task) => {
    if (!acc[task.project]) {
      acc[task.project] = [];
    }
    acc[task.project].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const projects = Object.entries(projectsMap);

  const getProjectStats = (projectTasks: Task[]) => {
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.status === "done").length;
    const inProgress = projectTasks.filter(t => t.status === "in_progress").length;
    const overdue = projectTasks.filter(t => {
      if (t.status === "done" || !t.dueDate) return false;
      return differenceInDays(new Date(), parseISO(t.dueDate)) > 0;
    }).length;

    const progress = total > 0 ? (completed / total) * 100 : 0;
    const client = projectTasks[0]?.client || "Sin cliente";
    // Calcular presupuesto del proyecto (desde la base de datos)
    const proyecto = proyectos?.find(p => p.nombre === projectTasks[0]?.project);
    const budget = proyecto?.presupuesto || 0;
    
    // Próximo vencimiento
    const nextDeadline = projectTasks
      .filter(t => t.dueDate && t.status !== "done")
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())[0];

    return {
      total,
      completed,
      inProgress,
      overdue,
      progress,
      client,
      budget,
      nextDeadline
    };
  };

  const getProjectStatus = (stats: ReturnType<typeof getProjectStats>) => {
    if (stats.overdue > 0) return { color: "destructive", label: "Atrasado" };
    if (stats.progress === 100) return { color: "default", label: "Completado" };
    if (stats.inProgress > 0) return { color: "secondary", label: "En Progreso" };
    return { color: "outline", label: "Pendiente" };
  };

  if (projects.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Target size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay proyectos</h3>
        <p className="text-gray-500">Crea nuevas tareas para comenzar con los proyectos</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {projects.map(([projectName, projectTasks]) => {
        const stats = getProjectStats(projectTasks);
        const status = getProjectStatus(stats);

        return (
          <Card 
            key={projectName} 
            className="group cursor-pointer hover:shadow-xl transition-all duration-300 border hover:border-primary/20 bg-card"
            onClick={() => onProjectSelect(projectName)}
          >
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header del proyecto */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building2 size={24} className="text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-1 truncate">{projectName}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users size={14} />
                        {stats.client}
                      </p>
                    </div>
                  </div>
                  <Badge variant={status.color as any} className="text-xs shrink-0">
                    {status.label}
                  </Badge>
                </div>

                {/* Progreso */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">Progreso General</span>
                    <span className="text-lg font-bold text-primary">{stats.progress.toFixed(0)}%</span>
                  </div>
                  <Progress value={stats.progress} className="h-2" />
                </div>

                {/* Estadísticas en grid compacto */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-primary/5 rounded-lg">
                    <p className="text-lg font-bold text-primary">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-lg font-bold text-green-600">{stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Completadas</p>
                  </div>
                  
                  {stats.overdue > 0 && (
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-lg font-bold text-red-600">{stats.overdue}</p>
                      <p className="text-xs text-muted-foreground">Atrasadas</p>
                    </div>
                  )}
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-lg font-bold text-blue-600">{stats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">En progreso</p>
                  </div>
                </div>

                {/* Próximo vencimiento compacto */}
                {stats.nextDeadline && (
                  <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-orange-600" />
                      <p className="text-xs font-medium text-orange-800">Próximo vencimiento</p>
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{stats.nextDeadline.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(stats.nextDeadline.dueDate!), "dd MMM yyyy", { locale: es })}
                    </p>
                  </div>
                )}

                {/* Presupuesto del proyecto */}
                {stats.budget > 0 && (
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign size={14} className="text-green-600" />
                      <p className="text-xs font-medium text-green-800">Presupuesto</p>
                    </div>
                    <p className="text-lg font-bold text-green-600">${stats.budget.toLocaleString()}</p>
                  </div>
                )}

                {/* Botón de acceso */}
                <Button
                  className="w-full group-hover:bg-primary/90 transition-colors"
                  variant="outline"
                >
                  <span>Abrir Proyecto</span>
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProjectGrid;
