
import { Card } from "@/components/ui/card";
import { User, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TaskStatsProps {
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
  overallProgress: number;
}

const TaskStats = ({ stats, overallProgress }: TaskStatsProps) => {
  return (
    <>
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <User className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En progreso</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Atrasadas</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Progreso general */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Progreso General</h3>
          <span className="text-sm text-gray-500">{overallProgress.toFixed(1)}% completado</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
      </Card>
    </>
  );
};

export default TaskStats;
