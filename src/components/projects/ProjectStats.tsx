
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CalendarClock, ChartBar, KanbanSquare, CheckCircle2 } from "lucide-react";

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
}

interface ProjectStatsProps {
  tasks: Task[];
}

const ProjectStats: React.FC<ProjectStatsProps> = ({ tasks }) => {
  // Calculate various project statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === "done").length;
  const inProgressTasks = tasks.filter(task => task.status === "in_progress").length;
  const pendingTasks = tasks.filter(task => task.status === "pending").length;
  
  // Calculate completion percentage
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Count unique projects
  const uniqueProjects = new Set(tasks.map(task => task.project)).size;
  
  // Find upcoming deadlines (tasks due in the next 7 days)
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingDeadlines = tasks.filter(task => {
    if (!task.dueDate || task.status === "done") return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= nextWeek;
  }).length;

  const statItems = [
    {
      title: "Total de tareas",
      value: totalTasks.toString(),
      icon: <KanbanSquare className="h-4 w-4" />,
      color: "bg-blue-500"
    },
    {
      title: "Tareas completadas",
      value: `${completedTasks} (${completionPercentage}%)`,
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "bg-green-500"
    },
    {
      title: "En progreso",
      value: inProgressTasks.toString(),
      icon: <ChartBar className="h-4 w-4" />,
      color: "bg-purple-500"
    },
    {
      title: "Próximos vencimientos",
      value: upcomingDeadlines.toString(),
      icon: <CalendarClock className="h-4 w-4" />,
      color: "bg-amber-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
      {statItems.map((stat, index) => (
        <Card key={index} className="overflow-hidden">
          <div className={`h-1 ${stat.color}`} />
          <CardContent className="pt-4">
            <div className="flex flex-col">
              <div className="flex items-center text-sm text-muted-foreground mb-1">
                {stat.icon}
                <span className="ml-2">{stat.title}</span>
              </div>
              <span className="text-2xl font-semibold">{stat.value}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ProjectStats;
