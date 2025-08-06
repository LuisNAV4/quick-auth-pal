export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      archivos: {
        Row: {
          comentario_id: string | null
          fecha_subida: string
          id: string
          nombre: string
          nombre_archivo_original: string
          proyecto_id: string | null
          ruta_archivo: string
          subido_por: string
          tamaño: number | null
          tarea_id: string | null
          tipo_mime: string | null
        }
        Insert: {
          comentario_id?: string | null
          fecha_subida?: string
          id?: string
          nombre: string
          nombre_archivo_original: string
          proyecto_id?: string | null
          ruta_archivo: string
          subido_por: string
          tamaño?: number | null
          tarea_id?: string | null
          tipo_mime?: string | null
        }
        Update: {
          comentario_id?: string | null
          fecha_subida?: string
          id?: string
          nombre?: string
          nombre_archivo_original?: string
          proyecto_id?: string | null
          ruta_archivo?: string
          subido_por?: string
          tamaño?: number | null
          tarea_id?: string | null
          tipo_mime?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "archivos_comentario_id_fkey"
            columns: ["comentario_id"]
            isOneToOne: false
            referencedRelation: "comentarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archivos_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "archivos_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios: {
        Row: {
          autor_id: string
          comentario_padre_id: string | null
          contenido: string
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          proyecto_id: string | null
          tarea_id: string | null
        }
        Insert: {
          autor_id: string
          comentario_padre_id?: string | null
          contenido: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          proyecto_id?: string | null
          tarea_id?: string | null
        }
        Update: {
          autor_id?: string
          comentario_padre_id?: string | null
          contenido?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          proyecto_id?: string | null
          tarea_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_comentario_padre_id_fkey"
            columns: ["comentario_padre_id"]
            isOneToOne: false
            referencedRelation: "comentarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
      invitaciones: {
        Row: {
          email: string
          estado: string
          fecha_creacion: string
          fecha_expiracion: string
          id: string
          invitado_por: string
          mensaje_personalizado: string | null
          proyecto_id: string
          rol_proyecto: string
          token: string
        }
        Insert: {
          email: string
          estado?: string
          fecha_creacion?: string
          fecha_expiracion?: string
          id?: string
          invitado_por: string
          mensaje_personalizado?: string | null
          proyecto_id: string
          rol_proyecto?: string
          token?: string
        }
        Update: {
          email?: string
          estado?: string
          fecha_creacion?: string
          fecha_expiracion?: string
          id?: string
          invitado_por?: string
          mensaje_personalizado?: string | null
          proyecto_id?: string
          rol_proyecto?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitaciones_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      miembros_proyecto: {
        Row: {
          fecha_union: string
          id: string
          proyecto_id: string
          puede_editar: boolean | null
          puede_eliminar: boolean | null
          rol_proyecto: string
          usuario_id: string
        }
        Insert: {
          fecha_union?: string
          id?: string
          proyecto_id: string
          puede_editar?: boolean | null
          puede_eliminar?: boolean | null
          rol_proyecto?: string
          usuario_id: string
        }
        Update: {
          fecha_union?: string
          id?: string
          proyecto_id?: string
          puede_editar?: boolean | null
          puede_eliminar?: boolean | null
          rol_proyecto?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "miembros_proyecto_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      notas_personales: {
        Row: {
          contenido: string | null
          fecha_actualizacion: string
          fecha_creacion: string
          fecha_nota: string
          id: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          contenido?: string | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          fecha_nota?: string
          id?: string
          titulo: string
          usuario_id: string
        }
        Update: {
          contenido?: string | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          fecha_nota?: string
          id?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: []
      }
      notificaciones: {
        Row: {
          fecha_creacion: string
          id: string
          leida: boolean | null
          mensaje: string
          proyecto_id: string | null
          remitente_id: string | null
          tarea_id: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Insert: {
          fecha_creacion?: string
          id?: string
          leida?: boolean | null
          mensaje: string
          proyecto_id?: string | null
          remitente_id?: string | null
          tarea_id?: string | null
          tipo: string
          titulo: string
          usuario_id: string
        }
        Update: {
          fecha_creacion?: string
          id?: string
          leida?: boolean | null
          mensaje?: string
          proyecto_id?: string | null
          remitente_id?: string | null
          tarea_id?: string | null
          tipo?: string
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificaciones_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfiles: {
        Row: {
          activo: boolean
          avatar_url: string | null
          bio: string | null
          email: string
          fecha_actualizacion: string
          fecha_creacion: string
          id: string
          nombre_completo: string
          puesto: string | null
          telefono: string | null
          usuario_id: string
        }
        Insert: {
          activo?: boolean
          avatar_url?: string | null
          bio?: string | null
          email: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          nombre_completo: string
          puesto?: string | null
          telefono?: string | null
          usuario_id: string
        }
        Update: {
          activo?: boolean
          avatar_url?: string | null
          bio?: string | null
          email?: string
          fecha_actualizacion?: string
          fecha_creacion?: string
          id?: string
          nombre_completo?: string
          puesto?: string | null
          telefono?: string | null
          usuario_id?: string
        }
        Relationships: []
      }
      proyectos: {
        Row: {
          activo: boolean
          color: string | null
          creado_por: string
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_proyecto"]
          fecha_actualizacion: string
          fecha_creacion: string
          fecha_fin: string | null
          fecha_fin_estimada: string | null
          fecha_inicio: string | null
          id: string
          nombre: string
          presupuesto: number | null
          prioridad: Database["public"]["Enums"]["prioridad"]
          progreso: number | null
          responsable_id: string | null
        }
        Insert: {
          activo?: boolean
          color?: string | null
          creado_por: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_proyecto"]
          fecha_actualizacion?: string
          fecha_creacion?: string
          fecha_fin?: string | null
          fecha_fin_estimada?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre: string
          presupuesto?: number | null
          prioridad?: Database["public"]["Enums"]["prioridad"]
          progreso?: number | null
          responsable_id?: string | null
        }
        Update: {
          activo?: boolean
          color?: string | null
          creado_por?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_proyecto"]
          fecha_actualizacion?: string
          fecha_creacion?: string
          fecha_fin?: string | null
          fecha_fin_estimada?: string | null
          fecha_inicio?: string | null
          id?: string
          nombre?: string
          presupuesto?: number | null
          prioridad?: Database["public"]["Enums"]["prioridad"]
          progreso?: number | null
          responsable_id?: string | null
        }
        Relationships: []
      }
      registros_tiempo: {
        Row: {
          descripcion: string | null
          fecha_creacion: string
          fecha_trabajo: string
          horas_trabajadas: number
          id: string
          proyecto_id: string
          tarea_id: string
          usuario_id: string
        }
        Insert: {
          descripcion?: string | null
          fecha_creacion?: string
          fecha_trabajo?: string
          horas_trabajadas: number
          id?: string
          proyecto_id: string
          tarea_id: string
          usuario_id: string
        }
        Update: {
          descripcion?: string | null
          fecha_creacion?: string
          fecha_trabajo?: string
          horas_trabajadas?: number
          id?: string
          proyecto_id?: string
          tarea_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_tiempo_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_tiempo_tarea_id_fkey"
            columns: ["tarea_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
      roles_usuario: {
        Row: {
          asignado_por: string | null
          fecha_asignacion: string
          id: string
          rol: Database["public"]["Enums"]["rol_usuario"]
          usuario_id: string
        }
        Insert: {
          asignado_por?: string | null
          fecha_asignacion?: string
          id?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          usuario_id: string
        }
        Update: {
          asignado_por?: string | null
          fecha_asignacion?: string
          id?: string
          rol?: Database["public"]["Enums"]["rol_usuario"]
          usuario_id?: string
        }
        Relationships: []
      }
      tareas: {
        Row: {
          activa: boolean
          asignado_a: string | null
          creado_por: string
          descripcion: string | null
          estado: Database["public"]["Enums"]["estado_proyecto"]
          etiquetas: string[] | null
          fecha_actualizacion: string
          fecha_creacion: string
          fecha_fin: string | null
          fecha_inicio: string | null
          fecha_limite: string | null
          id: string
          orden_posicion: number | null
          prioridad: Database["public"]["Enums"]["prioridad"]
          progreso: number | null
          proyecto_id: string
          tarea_padre_id: string | null
          tiempo_estimado: number | null
          tiempo_real: number | null
          titulo: string
        }
        Insert: {
          activa?: boolean
          asignado_a?: string | null
          creado_por: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_proyecto"]
          etiquetas?: string[] | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fecha_limite?: string | null
          id?: string
          orden_posicion?: number | null
          prioridad?: Database["public"]["Enums"]["prioridad"]
          progreso?: number | null
          proyecto_id: string
          tarea_padre_id?: string | null
          tiempo_estimado?: number | null
          tiempo_real?: number | null
          titulo: string
        }
        Update: {
          activa?: boolean
          asignado_a?: string | null
          creado_por?: string
          descripcion?: string | null
          estado?: Database["public"]["Enums"]["estado_proyecto"]
          etiquetas?: string[] | null
          fecha_actualizacion?: string
          fecha_creacion?: string
          fecha_fin?: string | null
          fecha_inicio?: string | null
          fecha_limite?: string | null
          id?: string
          orden_posicion?: number | null
          prioridad?: Database["public"]["Enums"]["prioridad"]
          progreso?: number | null
          proyecto_id?: string
          tarea_padre_id?: string | null
          tiempo_estimado?: number | null
          tiempo_real?: number | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "tareas_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tareas_tarea_padre_id_fkey"
            columns: ["tarea_padre_id"]
            isOneToOne: false
            referencedRelation: "tareas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aceptar_invitacion: {
        Args: { invitation_token: string }
        Returns: boolean
      }
      crear_proyecto_con_miembro: {
        Args:
          | {
              p_nombre: string
              p_descripcion?: string
              p_fecha_inicio?: string
              p_fecha_fin_estimada?: string
              p_fecha_fin?: string
              p_presupuesto?: number
              p_responsable_id?: string
              p_miembros_ids?: string[]
            }
          | {
              p_nombre: string
              p_descripcion?: string
              p_fecha_inicio?: string
              p_fecha_fin_estimada?: string
              p_presupuesto?: number
              p_responsable_id?: string
            }
          | {
              p_nombre: string
              p_descripcion?: string
              p_fecha_inicio?: string
              p_fecha_fin_estimada?: string
              p_presupuesto?: number
              p_responsable_id?: string
              p_miembros_ids?: string[]
            }
        Returns: string
      }
      es_miembro_proyecto: {
        Args: { proyecto_uuid: string }
        Returns: boolean
      }
      obtener_rol_usuario_actual: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["rol_usuario"]
      }
    }
    Enums: {
      estado_proyecto:
        | "planificacion"
        | "en_progreso"
        | "en_revision"
        | "completado"
        | "pausado"
        | "cancelado"
      estado_tarea:
        | "pending"
        | "in_progress"
        | "done"
        | "pendiente"
        | "en_progreso"
        | "completada"
      prioridad: "low" | "medium" | "high"
      rol_usuario: "admin" | "gerente" | "miembro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      estado_proyecto: [
        "planificacion",
        "en_progreso",
        "en_revision",
        "completado",
        "pausado",
        "cancelado",
      ],
      estado_tarea: [
        "pending",
        "in_progress",
        "done",
        "pendiente",
        "en_progreso",
        "completada",
      ],
      prioridad: ["low", "medium", "high"],
      rol_usuario: ["admin", "gerente", "miembro"],
    },
  },
} as const
