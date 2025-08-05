import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  proyecto_id: string;
  rol_proyecto: string;
  mensaje_personalizado?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar que la API key de Resend esté configurada
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("RESEND_API_KEY no está configurada");
      return new Response(JSON.stringify({ error: 'Configuración de email no válida' }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const resend = new Resend(resendApiKey);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user info
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Error de autenticación:', authError);
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { email, proyecto_id, rol_proyecto, mensaje_personalizado }: InvitationRequest = await req.json();

    // Verificar que el usuario sea miembro del proyecto
    const { data: esMiembro } = await supabaseClient.rpc('es_miembro_proyecto', { proyecto_uuid: proyecto_id });
    if (!esMiembro) {
      console.error('Usuario no es miembro del proyecto:', user.id, proyecto_id);
      return new Response(JSON.stringify({ error: 'No tienes permisos para invitar a este proyecto' }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Obtener información del proyecto
    const { data: proyecto, error: proyectoError } = await supabaseClient
      .from('proyectos')
      .select('nombre')
      .eq('id', proyecto_id)
      .single();

    if (proyectoError) {
      console.error('Error obteniendo proyecto:', proyectoError);
      return new Response(JSON.stringify({ error: 'Proyecto no encontrado' }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Obtener información del remitente
    const { data: perfil, error: perfilError } = await supabaseClient
      .from('perfiles')
      .select('nombre_completo')
      .eq('usuario_id', user.id)
      .single();

    const nombreRemitente = perfil?.nombre_completo || user.email;

    // Generar token único
    const token = crypto.randomUUID();

    // Crear la invitación en la base de datos
    const { data: invitacion, error: invitacionError } = await supabaseClient
      .from('invitaciones')
      .insert({
        email,
        proyecto_id,
        rol_proyecto,
        token,
        invitado_por: user.id,
        mensaje_personalizado
      })
      .select()
      .single();

    if (invitacionError) {
      console.error('Error creando invitación:', invitacionError);
      return new Response(JSON.stringify({ error: 'Error creando la invitación' }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Crear el enlace de aceptación
    const origin = req.headers.get('origin') || 'http://localhost:8080';
    const acceptUrl = `${origin}/accept-invitation?token=${token}`;

    // Enviar email
    const emailResponse = await resend.emails.send({
      from: "Marketing Ágil <onboarding@resend.dev>",
      to: [email],
      subject: `Invitación al proyecto: ${proyecto.nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; text-align: center;">¡Te han invitado a unirte al proyecto!</h1>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #374151; margin-top: 0;">Detalles de la invitación:</h2>
            <p><strong>Proyecto:</strong> ${proyecto.nombre}</p>
            <p><strong>Rol:</strong> ${rol_proyecto}</p>
            <p><strong>Invitado por:</strong> ${nombreRemitente}</p>
            ${mensaje_personalizado ? `<p><strong>Mensaje:</strong> ${mensaje_personalizado}</p>` : ''}
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${acceptUrl}" 
               style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Aceptar Invitación
            </a>
          </div>

          <div style="background-color: #e5e7eb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">
              Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:<br>
              <a href="${acceptUrl}" style="color: #2563eb; word-break: break-all;">${acceptUrl}</a>
            </p>
          </div>

          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
            Si no esperabas esta invitación, puedes ignorar este email.
          </p>
        </div>
      `,
    });

    console.log("Email enviado exitosamente:", emailResponse);

    // Verificar si hay errores en la respuesta de Resend
    if (emailResponse.error) {
      console.error("Error de Resend:", emailResponse.error);
      
      // Manejo específico del error de dominio no verificado
      if (emailResponse.error.message && emailResponse.error.message.includes("verify a domain")) {
        return new Response(JSON.stringify({ 
          error: 'Para poder enviar emails a otros destinatarios, debes verificar un dominio en resend.com/domains. Por ahora solo puedes enviar emails de prueba a tu propio correo.',
          details: emailResponse.error.message
        }), {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      
      return new Response(JSON.stringify({ 
        error: 'Error enviando el email',
        details: emailResponse.error.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      invitacion_id: invitacion.id,
      email_id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error en enviar-invitacion:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);