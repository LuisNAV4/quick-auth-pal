
import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import TaskTracking from "../components/projects/TaskTracking";
import { useSupabaseData } from "../hooks/useSupabaseData";

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

const TaskTrackingPage = () => {
  const { tasks, actualizarTarea } = useSupabaseData();

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      // Mapear los campos de la interfaz Task a los campos de Supabase
      const supabaseUpdates: any = {};
      
      if (updates.status) {
        supabaseUpdates.estado = updates.status === 'pending' ? 'pendiente' : 
                                  updates.status === 'in_progress' ? 'en_progreso' : 'completada';
      }
      
      if (updates.title) supabaseUpdates.titulo = updates.title;
      if (updates.description) supabaseUpdates.descripcion = updates.description;
      if (updates.priority) supabaseUpdates.prioridad = updates.priority === 'low' ? 'low' : 
                                                        updates.priority === 'medium' ? 'medium' : 'high';
      
      // Manejar subtareas si están incluidas
      if (updates.subTasks) {
        // Por ahora, las subtareas se manejan en el frontend hasta implementar en BD
        console.log('Actualizando subtareas:', updates.subTasks);
      }
      
      await actualizarTarea(taskId, supabaseUpdates);
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
    }
  };

  return (
    <AppLayout title="Seguimiento de Tareas">
      <TaskTracking 
        tasks={tasks || []} 
        onUpdateTask={handleUpdateTask}
      />
    </AppLayout>
  );
};

export default TaskTrackingPage;
