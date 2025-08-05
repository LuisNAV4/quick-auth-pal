import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Perfil {
  usuario_id: string;
  nombre_completo: string;
  email: string;
  avatar_url?: string;
  puesto?: string;
  telefono?: string;
  bio?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string;
  estado: 'planificacion' | 'en_progreso' | 'en_revision' | 'completado' | 'pausado' | 'cancelado';
  prioridad: 'low' | 'medium' | 'high';
  presupuesto?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_fin_estimada?: string;
  progreso: number;
  creado_por: string;
  responsable_id?: string;
  color?: string;
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Tarea {
  id: string;
  proyecto_id: string;
  titulo: string;
  descripcion?: string;
  estado: 'planificacion' | 'en_progreso' | 'en_revision' | 'completado' | 'pausado' | 'cancelado';
  prioridad: 'low' | 'medium' | 'high';
  asignado_a?: string;
  creado_por: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_limite?: string;
  tiempo_estimado?: number;
  tiempo_real?: number;
  progreso: number;
  orden_posicion: number;
  tarea_padre_id?: string;
  etiquetas?: string[];
  activa: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// Interface para Task (compatibilidad con interfaz existente)
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
  subTasks?: any[];
}

// Adaptadores para mapear entre interfaces
const mapearTareaATask = (tarea: Tarea, perfiles: Perfil[] = [], proyectos: Proyecto[] = []): Task => {
  const perfil = perfiles.find(p => p.usuario_id === tarea.asignado_a);
  const proyecto = proyectos.find(p => p.id === tarea.proyecto_id);
  return {
    id: tarea.id,
    title: tarea.titulo,
    description: tarea.descripcion || '',
    assigned: perfil?.nombre_completo,
    assigneeAvatar: perfil?.avatar_url,
    dueDate: tarea.fecha_limite,
    status: tarea.estado === 'planificacion' ? 'pending' : 
            tarea.estado === 'en_progreso' ? 'in_progress' : 'done',
    project: proyecto?.nombre || tarea.proyecto_id,
    startDate: tarea.fecha_inicio,
    priority: tarea.prioridad === 'low' ? 'low' : 
              tarea.prioridad === 'medium' ? 'medium' : 
              tarea.prioridad === 'high' ? 'high' : 'low',
    subTasks: []
  };
};

export const useSupabaseData = () => {
  const { user, session } = useAuth();
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar proyectos
  const cargarProyectos = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .eq('activo', true)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        throw error;
      }

      setProyectos(data as Proyecto[] || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error cargando proyectos:', err);
    }
  };

  // Función para cargar tareas
  const cargarTareas = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('tareas')
        .select('*')
        .eq('activa', true)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        throw error;
      }

      setTareas(data as Tarea[] || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error cargando tareas:', err);
    }
  };

  // Función para cargar perfiles
  const cargarPerfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .eq('activo', true)
        .order('fecha_creacion', { ascending: false });

      if (error) {
        throw error;
      }

      // Si no hay perfiles, crear algunos de ejemplo
      if (!data || data.length === 0) {
        await crearPerfilesEjemplo();
        return;
      }

      setPerfiles(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error cargando perfiles:', err);
    }
  };

  // Función para crear perfiles de ejemplo
  const crearPerfilesEjemplo = async () => {
    if (!user) return;
    
    try {
      const perfilesEjemplo = [
        {
          usuario_id: user.id,
          nombre_completo: user.email?.split('@')[0] || 'Usuario Principal',
          email: user.email || '',
          puesto: 'Director',
          activo: true
        },
        {
          usuario_id: crypto.randomUUID(),
          nombre_completo: 'Ana García',
          email: 'ana.garcia@empresa.com',
          puesto: 'Desarrolladora Frontend',
          activo: true
        },
        {
          usuario_id: crypto.randomUUID(),
          nombre_completo: 'Carlos Ruiz',
          email: 'carlos.ruiz@empresa.com',
          puesto: 'Desarrollador Backend',
          activo: true
        },
        {
          usuario_id: crypto.randomUUID(),
          nombre_completo: 'María López',
          email: 'maria.lopez@empresa.com',
          puesto: 'Diseñadora UX/UI',
          activo: true
        }
      ];

      const { data, error } = await supabase
        .from('perfiles')
        .upsert(perfilesEjemplo, { onConflict: 'usuario_id' })
        .select();

      if (error) {
        console.warn('Error creando perfiles de ejemplo:', error);
        return;
      }

      setPerfiles(data || []);
    } catch (err: any) {
      console.error('Error creando perfiles de ejemplo:', err);
    }
  };

  // Función para crear un proyecto usando RPC
  const crearProyecto = async (projectData: any) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // Preparar descripción con cliente si existe
      let descripcion = projectData.descripcion || '';
      if (projectData.cliente) {
        descripcion = `Cliente: ${projectData.cliente}${descripcion ? '\n\n' + descripcion : ''}`;
      }

      // Extraer IDs de miembros
      const miembrosIds = projectData.miembros?.map((m: any) => m.usuario_id) || [];

      const { data: projectId, error } = await supabase
        .rpc('crear_proyecto_con_miembro', {
          p_nombre: projectData.nombre,
          p_descripcion: descripcion,
          p_fecha_inicio: projectData.fechaInicio || null,
          p_fecha_fin_estimada: projectData.fechaFinEstimada || null,
          p_presupuesto: projectData.presupuesto ? parseFloat(projectData.presupuesto) : null,
          p_responsable_id: projectData.responsable || null,
          p_miembros_ids: miembrosIds
        });

      if (error) {
        throw error;
      }

      await cargarProyectos();
      return projectId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Función para crear una tarea
  const crearTarea = async (taskData: any) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      // Buscar el proyecto por nombre para obtener el ID
      const proyecto = proyectos.find(p => p.nombre === taskData.project);
      if (!proyecto) {
        throw new Error('Proyecto no encontrado');
      }

      // Buscar el usuario asignado por nombre para obtener el ID
      const miembros = await obtenerMiembrosProyecto(proyecto.id);
      const usuarioAsignado = miembros.find(m => m.nombre_completo === taskData.assigned);
      
      if (!usuarioAsignado) {
        throw new Error('Usuario asignado no encontrado en el proyecto');
      }

      // Verificar que el usuario sea miembro del proyecto
      const { data: miembro } = await supabase
        .from('miembros_proyecto')
        .select('*')
        .eq('proyecto_id', proyecto.id)
        .eq('usuario_id', user.id)
        .single();

      // Si no es miembro, agregarlo automáticamente
      if (!miembro) {
        const { error: memberError } = await supabase
          .from('miembros_proyecto')
          .insert({
            proyecto_id: proyecto.id,
            usuario_id: user.id,
            rol_proyecto: 'miembro',
            puede_editar: true,
            puede_eliminar: false
          });

        if (memberError) {
          console.warn('Error agregando usuario como miembro:', memberError);
        }
      }

      const tareaCompleta = {
        titulo: taskData.title,
        descripcion: taskData.description || '',
        proyecto_id: proyecto.id,
        asignado_a: usuarioAsignado.usuario_id,
        creado_por: user.id,
        fecha_limite: taskData.dueDate,
        prioridad: taskData.priority || 'medium',
        estado: 'planificacion' as const,
        progreso: 0,
        orden_posicion: 0,
        activa: true
      };

      const { data, error } = await supabase
        .from('tareas')
        .insert(tareaCompleta)
        .select()
        .single();

      if (error) {
        throw error;
      }

      await cargarTareas();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Función para actualizar una tarea
  const actualizarTarea = async (tareaId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('tareas')
        .update(updates)
        .eq('id', tareaId);

      if (error) {
        throw error;
      }

      await cargarTareas();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Función para actualizar el estado de una tarea
  const actualizarEstadoTarea = async (tareaId: string, estado: 'planificacion' | 'en_progreso' | 'completado') => {
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ estado })
        .eq('id', tareaId);

      if (error) {
        throw error;
      }

      await cargarTareas();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Función para eliminar una tarea
  const eliminarTarea = async (tareaId: string) => {
    try {
      const { error } = await supabase
        .from('tareas')
        .update({ activa: false })
        .eq('id', tareaId);

      if (error) {
        throw error;
      }

      await cargarTareas();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Función para obtener tareas de un usuario específico
  const obtenerTareasDelUsuario = (userId?: string) => {
    if (!userId) return [];
    return tareas.filter(tarea => tarea.asignado_a === userId);
  };

  // Función para obtener estadísticas
  const obtenerEstadisticas = () => {
    const tareasCompletadas = tareas.filter(t => t.estado === 'completado').length;
    const tareasPendientes = tareas.filter(t => t.estado === 'planificacion' || t.estado === 'en_progreso').length;
    const proyectosActivos = proyectos.filter(p => p.estado !== 'completado' && p.estado !== 'cancelado').length;

    return {
      tareasCompletadas,
      tareasPendientes,
      proyectosActivos,
      totalTareas: tareas.length,
      totalProyectos: proyectos.length,
      tasaCompletacion: tareas.length > 0 ? Math.round((tareasCompletadas / tareas.length) * 100) : 0
    };
  };

  // Función para obtener miembros de un proyecto específico
  const obtenerMiembrosProyecto = async (proyectoId: string) => {
    try {
      // Primero obtenemos los miembros del proyecto
      const { data: miembros, error: miembrosError } = await supabase
        .from('miembros_proyecto')
        .select('usuario_id, rol_proyecto')
        .eq('proyecto_id', proyectoId);

      if (miembrosError) {
        throw miembrosError;
      }

      if (!miembros || miembros.length === 0) {
        return [];
      }

      // Luego obtenemos los perfiles de esos usuarios
      const usuarioIds = miembros.map(m => m.usuario_id);
      const { data: perfilesData, error: perfilesError } = await supabase
        .from('perfiles')
        .select('usuario_id, nombre_completo, email, puesto')
        .in('usuario_id', usuarioIds);

      if (perfilesError) {
        throw perfilesError;
      }

      // Combinamos los datos
      return miembros.map(miembro => {
        const perfil = perfilesData?.find(p => p.usuario_id === miembro.usuario_id);
        return {
          usuario_id: miembro.usuario_id,
          nombre_completo: perfil?.nombre_completo || 'Usuario desconocido',
          email: perfil?.email || '',
          puesto: perfil?.puesto || '',
          rol_proyecto: miembro.rol_proyecto
        };
      });
    } catch (err: any) {
      console.error('Error obteniendo miembros del proyecto:', err);
      return [];
    }
  };

  // Getter para tareas como Task[]
  const tareasComoTasks = (): Task[] => {
    return tareas.map(tarea => mapearTareaATask(tarea, perfiles, proyectos));
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (session) {
      setLoading(true);
      Promise.all([cargarProyectos(), cargarTareas(), cargarPerfiles()])
        .finally(() => setLoading(false));
    }
  }, [session]);

  return {
    proyectos,
    tareas,
    perfiles,
    tasks: tareasComoTasks(), // Alias para compatibilidad
    loading,
    error,
    crearProyecto,
    crearTarea,
    actualizarTarea,
    actualizarEstadoTarea,
    eliminarTarea,
    obtenerTareasDelUsuario,
    obtenerEstadisticas,
    obtenerMiembrosProyecto,
    cargarProyectos,
    cargarTareas,
    cargarPerfiles
  };
};