import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    nombre_completo: ""
  });
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verificarInvitacion();
    }
  }, [token]);

  const verificarInvitacion = async () => {
    try {
      // Acceder a la tabla invitaciones
      const { data, error } = await supabase
        .from('invitaciones')
        .select(`
          *,
          proyectos(nombre)
        `)
        .eq('token', token)
        .eq('estado', 'pendiente')
        .single();

      if (error || !data) {
        setError("Invitación no válida o expirada");
        return;
      }

      // Verificar si la invitación no ha expirado
      const now = new Date();
      const expiration = new Date(data.fecha_expiracion);
      
      if (expiration < now) {
        setError("Esta invitación ha expirado");
        return;
      }

      setInvitation(data);
      setFormData(prev => ({ ...prev, email: data.email }));
    } catch (error) {
      console.error("Error verificando invitación:", error);
      setError("Error al verificar la invitación");
    }
  };

  const handleAcceptInvitation = async () => {
    if (!formData.nombre_completo || !formData.password || !formData.confirmPassword) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // 1. Registrar usuario con confirmación de email deshabilitada para desarrollo
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: formData.nombre_completo
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Este correo ya está registrado. Intenta iniciar sesión en su lugar.");
          return;
        }
        throw authError;
      }

      if (authData.user) {
        // 2. Usar la función RPC para aceptar la invitación automáticamente
        const { data: aceptacionExitosa, error: rpcError } = await supabase.rpc(
          'aceptar_invitacion', 
          { invitation_token: invitation.token }
        );

        if (rpcError || !aceptacionExitosa) {
          console.error("Error usando RPC aceptar_invitacion:", rpcError);
          
          // Fallback: hacerlo manualmente
          // 3. Actualizar perfil
          const { error: profileError } = await supabase
            .from('perfiles')
            .upsert({
              usuario_id: authData.user.id,
              nombre_completo: formData.nombre_completo,
              email: formData.email
            });

          if (profileError) console.error("Error actualizando perfil:", profileError);

          // 4. Agregar usuario al proyecto
          const { error: memberError } = await supabase
            .from('miembros_proyecto')
            .insert({
              proyecto_id: invitation.proyecto_id,
              usuario_id: authData.user.id,
              rol_proyecto: invitation.rol_proyecto,
              puede_editar: invitation.rol_proyecto !== 'miembro',
              puede_eliminar: invitation.rol_proyecto === 'admin'
            });

          if (memberError) {
            console.error("Error agregando al proyecto:", memberError);
            throw memberError;
          }

          // 5. Marcar invitación como aceptada
          const { error: invitationError } = await supabase
            .from('invitaciones')
            .update({ estado: 'aceptada' })
            .eq('id', invitation.id);

          if (invitationError) console.error("Error actualizando invitación:", invitationError);
        }

        toast({
          title: "¡Bienvenido!",
          description: `Te has unido exitosamente al proyecto ${invitation.proyectos?.nombre}`,
        });

        // Redirigir al dashboard
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error: any) {
      console.error("Error aceptando invitación:", error);
      
      // Manejo de errores específicos
      if (error.message?.includes("duplicate key value violates unique constraint")) {
        setError("Ya eres miembro de este proyecto. Puedes iniciar sesión normalmente.");
      } else if (error.message?.includes("User already registered")) {
        setError("Este correo ya está registrado. Intenta iniciar sesión en su lugar.");
      } else {
        setError(error.message || "Error al aceptar la invitación");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRejectInvitation = async () => {
    try {
      const { error } = await supabase
        .from('invitaciones')
        .update({ estado: 'rechazada' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: "Invitación rechazada",
        description: "Has rechazado la invitación al proyecto",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Error rechazando invitación:", error);
      toast({
        title: "Error",
        description: "Error al rechazar la invitación",
        variant: "destructive"
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Enlace no válido</CardTitle>
            <CardDescription>
              No se proporcionó un token de invitación válido
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Ir al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Verificando invitación...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Invitación al proyecto
          </CardTitle>
          <CardDescription>
            Has sido invitado a unirte al proyecto <strong>{invitation.proyectos?.nombre}</strong> 
            como <strong>{invitation.rol_proyecto}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {invitation.mensaje_personalizado && (
            <Alert>
              <AlertDescription>
                <strong>Mensaje:</strong> {invitation.mensaje_personalizado}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                placeholder="Tu nombre completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirma tu contraseña"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleAcceptInvitation}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {loading ? "Procesando..." : "Aceptar invitación"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleRejectInvitation}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Rechazar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;