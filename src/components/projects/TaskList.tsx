
import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import TaskCard from "./TaskCard";

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

interface TaskListProps {
  tasks: Task[];
  showDetails: boolean;
  selectedProject: string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onSubTaskToggle: (taskId: string, subTaskId: string, completed: boolean) => void;
  onFileUpload?: (taskId: string, subTaskId: string, file: File) => void;
  getTaskProgress: (task: Task) => number;
  getTaskStatus: (task: Task) => { color: string; label: string };
  getPriorityColor: (priority?: string) => string;
  getProgressColor: (progress: number, task: Task) => string;
  canEditTask: (task: Task) => boolean;
}

const TaskList = ({
  tasks,
  showDetails,
  selectedProject,
  onStatusChange,
  onSubTaskToggle,
  onFileUpload,
  getTaskProgress,
  getTaskStatus,
  getPriorityColor,
  getProgressColor,
  canEditTask
}: TaskListProps) => {
  if (tasks.length === 0) {
    return (
      <Card className="p-12 text-center">
        <TrendingUp size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay tareas para mostrar</h3>
        <p className="text-gray-500">
          {selectedProject === "all" 
            ? "Crea nuevas tareas para comenzar el seguimiento"
            : `No hay tareas en el proyecto "${selectedProject}"`
          }
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const progress = getTaskProgress(task);
        const status = getTaskStatus(task);
        
        return (
          <TaskCard
            key={task.id}
            task={task}
            showDetails={showDetails}
            progress={progress}
            status={status}
            onStatusChange={onStatusChange}
            onSubTaskToggle={onSubTaskToggle}
            onFileUpload={onFileUpload}
            getPriorityColor={getPriorityColor}
            getProgressColor={getProgressColor}
            canEditTask={canEditTask}
          />
        );
      })}
    </div>
  );
};

export default TaskList;
