
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  attachmentName?: string;
  attachmentData?: string;
  publishedToInstagram?: boolean;
  budget?: number;
  actualCost?: number;
}

interface CostAnalysisProps {
  tasks: Task[];
}

const CostAnalysis = ({ tasks }: CostAnalysisProps) => {
  // Calcular métricas de costos
  const totalBudget = tasks.reduce((sum, task) => sum + (task.budget || 0), 0);
  const totalActualCost = tasks.reduce((sum, task) => sum + (task.actualCost || 0), 0);
  const completedTasks = tasks.filter(task => task.status === "done");
  const budgetUsagePercentage = totalBudget > 0 ? (totalActualCost / totalBudget) * 100 : 0;
  
  // Calcular variación presupuestaria
  const variance = totalBudget - totalActualCost;
  const variancePercentage = totalBudget > 0 ? (variance / totalBudget) * 100 : 0;
  
  // Análisis por proyecto
  const projectAnalysis = tasks.reduce((acc, task) => {
    const project = task.project;
    if (!acc[project]) {
      acc[project] = {
        budget: 0,
        actualCost: 0,
        taskCount: 0,
        completedTasks: 0
      };
    }
    acc[project].budget += task.budget || 0;
    acc[project].actualCost += task.actualCost || 0;
    acc[project].taskCount += 1;
    if (task.status === "done") acc[project].completedTasks += 1;
    return acc;
  }, {} as Record<string, {budget: number, actualCost: number, taskCount: number, completedTasks: number}>);

  const getVarianceColor = (percentage: number) => {
    if (percentage > 10) return "text-green-600";
    if (percentage > -10) return "text-yellow-600";
    return "text-red-600";
  };

  const getVarianceIcon = (percentage: number) => {
    if (percentage > 10) return <TrendingUp size={16} className="text-green-600" />;
    if (percentage > -10) return <AlertTriangle size={16} className="text-yellow-600" />;
    return <TrendingDown size={16} className="text-red-600" />;
  };

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Presupuesto Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presupuesto Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {tasks.length} tareas asignadas
            </p>
          </CardContent>
        </Card>

        {/* Costo Real */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Real</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalActualCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length} tareas completadas
            </p>
          </CardContent>
        </Card>

        {/* Uso del Presupuesto */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uso del Presupuesto</CardTitle>
            <div className="h-4 w-4">
              {getVarianceIcon(variancePercentage)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgetUsagePercentage.toFixed(1)}%</div>
            <Progress value={Math.min(budgetUsagePercentage, 100)} className="w-full mt-2" />
          </CardContent>
        </Card>

        {/* Variación */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Variación</CardTitle>
            <div className="h-4 w-4">
              {getVarianceIcon(variancePercentage)}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getVarianceColor(variancePercentage)}`}>
              ${Math.abs(variance).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {variance >= 0 ? "Bajo presupuesto" : "Sobre presupuesto"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Análisis por Proyecto */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis por Proyecto</CardTitle>
          <CardDescription>
            Comparación de presupuesto vs costo real por proyecto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(projectAnalysis).map(([project, data]) => {
              const projectVariance = data.budget - data.actualCost;
              const projectVariancePercentage = data.budget > 0 ? (projectVariance / data.budget) * 100 : 0;
              const completionRate = data.taskCount > 0 ? (data.completedTasks / data.taskCount) * 100 : 0;
              
              return (
                <div key={project} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{project}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{data.taskCount} tareas</span>
                      <Badge variant={completionRate === 100 ? "default" : "secondary"}>
                        {completionRate.toFixed(0)}% completado
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Presupuesto: ${data.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Real: ${data.actualCost.toLocaleString()}</span>
                      <span className={`text-sm font-medium ${getVarianceColor(projectVariancePercentage)}`}>
                        ({projectVariancePercentage >= 0 ? "+" : ""}${projectVariance.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostAnalysis;
