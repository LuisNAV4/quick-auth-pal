import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Mail, Check, X, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseData } from "@/hooks/useSupabaseData";

interface Invitation {
  id: string;
  email: string;
  proyecto_id: string;
  rol_proyecto: string;
  estado: "pendiente" | "aceptada" | "rechazada";
  token: string;
  invitado_por: string;
  fecha_creacion: string;
  fecha_expiracion: string;
  mensaje_personalizado?: string;
}

interface InvitationManagerProps {
  proyectoId?: string;
}

const InvitationManager = ({ proyectoId }: InvitationManagerProps) => {
  const { user } = useAuth();
  const { proyectos } = useSupabaseData();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [newInvitation, setNewInvitation] = useState({
    email: "",
    proyecto_id: proyectoId || "",
    rol_proyecto: "miembro",
    mensaje_personalizado: ""
  });

  // Cargar invitaciones desde Supabase
  useEffect(() => {
    cargarInvitaciones();
  }, []);

  const cargarInvitaciones = async () => {
    try {
      const { data, error } = await supabase
        .from('invitaciones')
        .select('*')
        .eq('invitado_por', user?.id)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setInvitations((data || []) as Invitation[]);
    } catch (error) {
      console.error('Error cargando invitaciones:', error);
      toast.error("Error cargando las invitaciones");
    }
  };

  const sendInvitation = async () => {
    if (!newInvitation.email || !newInvitation.proyecto_id || !newInvitation.rol_proyecto) {
      toast.error("Por favor completa todos los campos obligatorios");
      return;
    }

    // Verificar si ya existe una invitación pendiente para este email y proyecto
    const existingInvitation = invitations.find(
      inv => inv.email === newInvitation.email && 
             inv.proyecto_id === newInvitation.proyecto_id && 
             inv.estado === "pendiente"
    );
    
    if (existingInvitation) {
      toast.error("Ya existe una invitación pendiente para este correo en este proyecto");
      return;
    }

    setLoading(true);

    try {
      // Llamar a la función edge para enviar la invitación
      const { data, error } = await supabase.functions.invoke('enviar-invitacion', {
        body: {
          email: newInvitation.email,
          proyecto_id: newInvitation.proyecto_id,
          rol_proyecto: newInvitation.rol_proyecto,
          mensaje_personalizado: newInvitation.mensaje_personalizado || undefined
        }
      });

      if (error) throw error;

      // Recargar invitaciones
      await cargarInvitaciones();
      
      // Limpiar formulario
      setNewInvitation({
        email: "",
        proyecto_id: proyectoId || "",
        rol_proyecto: "miembro",
        mensaje_personalizado: ""
      });
      
      setIsOpen(false);
      toast.success(`Invitación enviada exitosamente a ${newInvitation.email}`);

    } catch (error: any) {
      console.error('Error enviando invitación:', error);
      toast.error(error.message || "Error enviando la invitación");
    } finally {
      setLoading(false);
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('invitaciones')
        .update({ estado: 'rechazada' })
        .eq('id', invitationId);

      if (error) throw error;

      await cargarInvitaciones();
      toast.success("Invitación cancelada");
    } catch (error) {
      console.error('Error cancelando invitación:', error);
      toast.error("Error cancelando la invitación");
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Clock size={16} className="text-yellow-500" />;
      case "aceptada":
        return <Check size={16} className="text-green-500" />;
      case "rechazada":
        return <X size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (estado: string) => {
    const variants = {
      pendiente: "bg-yellow-50 text-yellow-700 border-yellow-200",
      aceptada: "bg-green-50 text-green-700 border-green-200",
      rechazada: "bg-red-50 text-red-700 border-red-200"
    };

    const labels = {
      pendiente: "Pendiente",
      aceptada: "Aceptada",
      rechazada: "Rechazada"
    };

    return (
      <Badge variant="outline" className={variants[estado as keyof typeof variants]}>
        {labels[estado as keyof typeof labels]}
      </Badge>
    );
  };

  const getProyectoNombre = (proyectoId: string) => {
    const proyecto = proyectos.find(p => p.id === proyectoId);
    return proyecto?.nombre || "Proyecto no encontrado";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Gestión de Invitaciones</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus size={16} className="mr-2" />
              Invitar Integrante
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invitar nuevo integrante</DialogTitle>
              <DialogDescription>
                Envía una invitación por correo electrónico para unirse al proyecto
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newInvitation.email}
                  onChange={(e) => setNewInvitation({...newInvitation, email: e.target.value})}
                  placeholder="ejemplo@correo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proyecto">Proyecto *</Label>
                <Select
                  value={newInvitation.proyecto_id}
                  onValueChange={(value) => setNewInvitation({...newInvitation, proyecto_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proyecto" />
                  </SelectTrigger>
                  <SelectContent>
                    {proyectos.map((proyecto) => (
                      <SelectItem key={proyecto.id} value={proyecto.id}>
                        {proyecto.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rol">Rol en el proyecto *</Label>
                <Select
                  value={newInvitation.rol_proyecto}
                  onValueChange={(value) => setNewInvitation({...newInvitation, rol_proyecto: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="miembro">Miembro</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mensaje">Mensaje personalizado (opcional)</Label>
                <Textarea
                  id="mensaje"
                  value={newInvitation.mensaje_personalizado}
                  onChange={(e) => setNewInvitation({...newInvitation, mensaje_personalizado: e.target.value})}
                  placeholder="Agrega un mensaje personalizado para el invitado..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                Cancelar
              </Button>
              <Button onClick={sendInvitation} disabled={loading}>
                {loading ? (
                  <Loader2 size={16} className="mr-2 animate-spin" />
                ) : (
                  <Mail size={16} className="mr-2" />
                )}
                {loading ? "Enviando..." : "Enviar Invitación"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium mb-4">Invitaciones Enviadas</h3>
        
        {invitations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <UserPlus size={48} className="mx-auto mb-4 opacity-50" />
            <p>No hay invitaciones enviadas</p>
            <p className="text-sm">Invita a integrantes para formar tu equipo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Correo electrónico</TableHead>
                  <TableHead className="min-w-[120px] hidden sm:table-cell">Proyecto</TableHead>
                  <TableHead className="min-w-[80px] hidden md:table-cell">Rol</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead className="min-w-[120px] hidden lg:table-cell">Fecha</TableHead>
                  <TableHead className="min-w-[80px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="truncate">{invitation.email}</span>
                        <span className="text-xs text-gray-500 sm:hidden">{getProyectoNombre(invitation.proyecto_id)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{getProyectoNombre(invitation.proyecto_id)}</TableCell>
                    <TableCell className="capitalize hidden md:table-cell">{invitation.rol_proyecto}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(invitation.estado)}
                        <span className="hidden sm:inline">{getStatusBadge(invitation.estado)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500 text-xs hidden lg:table-cell">
                      {new Date(invitation.fecha_creacion).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      {invitation.estado === "pendiente" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={16} />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvitationManager;