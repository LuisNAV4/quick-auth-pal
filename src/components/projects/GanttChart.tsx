
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, differenceInDays, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";

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

interface GanttChartProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onSubTaskToggle: (taskId: string, subTaskId: string, completed: boolean) => void;
  getTaskProgress: (task: Task) => number;
}

const GanttChart = ({ 
  tasks, 
  onStatusChange, 
  onSubTaskToggle, 
  getTaskProgress 
}: GanttChartProps) => {
  const { user, profile } = useAuth();
  const today = new Date();
  const startDate = new Date(Math.min(...tasks.map(t => t.startDate ? new Date(t.startDate).getTime() : today.getTime())));
  const endDate = new Date(Math.max(...tasks.map(t => t.dueDate ? new Date(t.dueDate).getTime() : today.getTime())));
  
  const totalDays = differenceInDays(endDate, startDate) || 30;
  const dayWidth = Math.max(20, 800 / totalDays);

  return (
    <div className="overflow-x-auto bg-white border rounded-lg">
      <div className="min-w-max">
        {/* Header del calendario */}
        <div className="flex border-b bg-gray-50 sticky top-0">
          <div className="w-64 p-3 border-r font-medium">Tarea</div>
          <div className="flex">
            {Array.from({ length: totalDays + 1 }, (_, i) => {
              const date = new Date(startDate);
              date.setDate(date.getDate() + i);
              return (
                <div 
                  key={i} 
                  className="border-r px-1 py-2 text-xs text-center bg-gray-50"
                  style={{ width: dayWidth }}
                >
                  {format(date, "dd/MM", { locale: es })}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Filas de tareas */}
        {tasks.map((task) => {
          const taskStart = task.startDate ? parseISO(task.startDate) : startDate;
          const taskEnd = task.dueDate ? parseISO(task.dueDate) : new Date(taskStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const startOffset = differenceInDays(taskStart, startDate);
          const duration = differenceInDays(taskEnd, taskStart) + 1;
          const progress = getTaskProgress(task);
          const canEdit = task.assigned === profile?.nombre_completo;
          
          return (
            <div key={task.id}>
              {/* Tarea principal */}
              <div className="flex border-b hover:bg-gray-50">
                <div className="w-64 p-3 border-r">
                  <div className="font-medium text-sm">{task.title}</div>
                  <div className="text-xs text-gray-500">{task.assigned}</div>
                  {canEdit && (
                    <Select value={task.status} onValueChange={(value) => onStatusChange(task.id, value)}>
                      <SelectTrigger className="w-full mt-1 h-6 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="in_progress">En progreso</SelectItem>
                        <SelectItem value="done">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className="flex items-center relative" style={{ height: '80px' }}>
                  <div 
                    className="absolute bg-blue-200 h-6 rounded flex items-center justify-center text-xs font-medium"
                    style={{ 
                      left: startOffset * dayWidth,
                      width: duration * dayWidth,
                      minWidth: '60px'
                    }}
                  >
                    <div 
                      className="bg-blue-500 h-full rounded"
                      style={{ width: `${progress}%` }}
                    />
                    <span className="absolute text-blue-800 px-2">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Sub-tareas en Gantt */}
              {task.subTasks && task.subTasks.length > 0 && task.subTasks.map((subTask) => (
                <div key={subTask.id} className="flex border-b bg-gray-25">
                  <div className="w-64 p-3 border-r pl-8">
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        checked={subTask.isCompleted}
                        onCheckedChange={(checked) => 
                          onSubTaskToggle(task.id, subTask.id, checked as boolean)
                        }
                        disabled={!canEdit}
                      />
                      <span className={`text-sm ${subTask.isCompleted ? 'line-through text-gray-500' : ''}`}>
                        {subTask.description}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center relative" style={{ height: '40px' }}>
                    <div 
                      className={`absolute h-3 rounded ${subTask.isCompleted ? 'bg-green-400' : 'bg-gray-300'}`}
                      style={{ 
                        left: startOffset * dayWidth,
                        width: Math.max(dayWidth * 2, 40)
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GanttChart;
