import { useState, useEffect } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Calendar, CheckCircle2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import InvitationManager from "../components/invitations/InvitationManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  jobTitle: string;
  joinedAt?: string;
  tasksCompleted?: number;
  currentTasks?: number;
}

const TeamMembers = () => {
  const { user, profile } = useAuth();
  const { perfiles, tareas } = useSupabaseData();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    if (!perfiles || !tareas) return;

    const members = perfiles.map((perfil) => {
      const userTasks = tareas.filter((task: any) => task.asignado_a === perfil.usuario_id);
      const completedTasks = userTasks.filter((task: any) => task.estado === "completada").length;
      const currentTasks = userTasks.filter((task: any) => task.estado !== "completada").length;
      
      return {
        id: perfil.usuario_id,
        name: perfil.nombre_completo,
        email: perfil.email,
        avatar: perfil.avatar_url || '',
        role: "integrante",
        jobTitle: perfil.puesto || 'Sin especificar',
        joinedAt: perfil.fecha_creacion,
        tasksCompleted: completedTasks,
        currentTasks: currentTasks
      };
    });
    
    setTeamMembers(members);
  }, [perfiles, tareas]);

  const getRoleColor = (jobTitle: string) => {
    const colors: { [key: string]: string } = {
      "Designer": "bg-purple-50 text-purple-700 border-purple-200",
      "Developer": "bg-blue-50 text-blue-700 border-blue-200",
      "Content Writer": "bg-green-50 text-green-700 border-green-200",
      "Marketing Specialist": "bg-orange-50 text-orange-700 border-orange-200",
      "Project Manager": "bg-red-50 text-red-700 border-red-200",
      "Data Analyst": "bg-indigo-50 text-indigo-700 border-indigo-200"
    };
    
    return colors[jobTitle] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <AppLayout title="Integrantes del Equipo">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={24} />
            <h1 className="text-2xl font-semibold">Integrantes del Equipo</h1>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {teamMembers.length} miembros
          </Badge>
        </div>

        {user?.role === "director" ? (
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="members">Miembros Actuales</TabsTrigger>
              <TabsTrigger value="invitations">Gestionar Invitaciones</TabsTrigger>
            </TabsList>
            
            <TabsContent value="members" className="mt-6">
              <TeamMembersList members={teamMembers} getRoleColor={getRoleColor} />
            </TabsContent>
            
            <TabsContent value="invitations" className="mt-6">
              <InvitationManager />
            </TabsContent>
          </Tabs>
        ) : (
          <TeamMembersList members={teamMembers} getRoleColor={getRoleColor} />
        )}
      </div>
    </AppLayout>
  );
};

const TeamMembersList = ({ members, getRoleColor }: { members: TeamMember[], getRoleColor: (role: string) => string }) => {
  if (members.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Users size={64} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay miembros en el equipo</h3>
        <p className="text-gray-500">
          Los integrantes aparecerán aquí una vez que acepten sus invitaciones
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {members.map((member) => (
        <Card key={member.id} className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-medium text-lg">{member.name}</h3>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Mail size={14} className="mr-1" />
                {member.email}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Badge variant="outline" className={getRoleColor(member.jobTitle)}>
              {member.jobTitle}
            </Badge>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-500">
                <Calendar size={14} className="mr-1" />
                Desde {new Date(member.joinedAt || '').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-3 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                  <CheckCircle2 size={16} />
                  <span className="font-semibold">{member.tasksCompleted || 0}</span>
                </div>
                <p className="text-xs text-gray-500">Completadas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                  <Users size={16} />
                  <span className="font-semibold">{member.currentTasks || 0}</span>
                </div>
                <p className="text-xs text-gray-500">En progreso</p>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TeamMembers;
