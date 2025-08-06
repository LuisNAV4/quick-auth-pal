
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, Cell, XAxis, YAxis, PieChart, Pie, ResponsiveContainer } from "recharts";
import { Milestone, ChartColumnStacked, CalendarCheck } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  assigned?: string;
  assignedName?: string;
  assigneeAvatar?: string;
  assigneeRole?: string;
  dueDate?: string;
  status: "pending" | "in_progress" | "done";
  project: string;
  attachmentName?: string;
  attachmentData?: string;
}

interface ProjectChartsProps {
  tasks: Task[];
}

const ProjectCharts: React.FC<ProjectChartsProps> = ({ tasks }) => {
  // Calculate project status statistics
  const statusCounts = tasks.reduce((acc: Record<string, number>, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});
  
  const statusData = [
    { name: "Pendiente", value: statusCounts["pending"] || 0, color: "#E5E7EB" },
    { name: "En progreso", value: statusCounts["in_progress"] || 0, color: "#93C5FD" },
    { name: "Completado", value: statusCounts["done"] || 0, color: "#86EFAC" },
  ];
  
  // Calculate project distribution by team member - use assignedName instead of UUID
  const memberTaskCounts: Record<string, number> = {};
  tasks.forEach(task => {
    if (task.assignedName) {
      const displayName = task.assignedName || 'Sin asignar';
      memberTaskCounts[displayName] = (memberTaskCounts[displayName] || 0) + 1;
    }
  });
  
  const memberData = Object.entries(memberTaskCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Show top 5 members with most tasks
  
  // Calculate project completion timeline (tasks completed by month)
  const completedTasks = tasks.filter(task => task.status === "done" && task.dueDate);
  const currentYear = new Date().getFullYear();
  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  const completionByMonth = Array(12).fill(0).map((_, i) => ({
    name: monthNames[i],
    value: completedTasks.filter(task => {
      const date = new Date(task.dueDate!);
      return date.getMonth() === i && date.getFullYear() === currentYear;
    }).length
  }));
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div className="space-y-4 mt-6">
      <h2 className="text-xl font-semibold mb-4">Análisis de proyectos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Distribution Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <Milestone className="mr-2" size={18} />
              Estado de tareas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-72" config={{
              pending: { color: "#E5E7EB", label: "Pendiente" },
              in_progress: { color: "#93C5FD", label: "En progreso" },
              done: { color: "#86EFAC", label: "Completado" }
            }}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Team Member Distribution Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <ChartColumnStacked className="mr-2" size={18} />
              Distribución de tareas por equipo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-72" config={{
              tasks: { color: "#8B5CF6", label: "Tareas" }
            }}>
              <BarChart data={memberData}>
                <XAxis dataKey="name" tickFormatter={(value) => value.split(' ')[0]} />
                <YAxis allowDecimals={false} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]}>
                  {memberData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* Completion Timeline Chart */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <CalendarCheck className="mr-2" size={18} />
              Tareas completadas por mes ({currentYear})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-72" config={{
              completed: { color: "#22C55E", label: "Tareas completadas" }
            }}>
              <BarChart data={completionByMonth}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Bar dataKey="value" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectCharts;
