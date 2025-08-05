import { useState, useEffect, useRef } from "react";
import AppLayout from "../components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Smile, Paperclip, Users, Crown } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { io, Socket } from "socket.io-client";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: Date;
  senderAvatar?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  jobTitle?: string;
  isOnline?: boolean;
  teamId?: string;
}

const WS_URL = "http://localhost:4000"; // Cambia el puerto/host según tu backend

const Chat = () => {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Solo conectar socket una vez por sesión de usuario y mantenerla viva mientras la pestaña esté abierta
  useEffect(() => {
    if (!profile) return;

    // Si ya existe una conexión activa, no crear otra
    if (socketRef.current && socketRef.current.connected) return;

    const socket = io(WS_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", {
        id: profile?.id,
        usuario_id: profile?.usuario_id,
        nombre_completo: profile?.nombre_completo,
        email: profile?.email,
        avatar_url: profile?.avatar_url,
        puesto: profile?.puesto,
        telefono: profile?.telefono,
        bio: profile?.bio,
        activo: profile?.activo,
        fecha_creacion: profile?.fecha_creacion,
        fecha_actualizacion: profile?.fecha_actualizacion,
      });
    });

    socket.on("chat", (data: any) => {
      setMessages((prev) => [
        ...prev,
        {
          id: data.message.id,
          text: data.message.text,
          sender: data.message.sender,
          timestamp: new Date(data.message.timestamp),
          senderAvatar: data.message.senderAvatar,
        },
      ]);
    });

    socket.on("history", (data: any) => {
      setMessages(
        data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
    });

    socket.on("members", (data: any) => {
      setTeamMembers(data.members);
    });

    socket.on("join", (data: any) => {
      setTeamMembers(data.members);
    });

    socket.on("disconnect-user", (data: any) => {
      setTeamMembers(data.members);
    });

    // Limpiar conexión solo al cerrar sesión o cerrar la pestaña
    const cleanup = () => {
      if (socketRef.current) {
        socketRef.current.emit("disconnect-user", { userId: profile?.id });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };

    window.addEventListener("beforeunload", cleanup);

    return () => {
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
    // Solo depende de profile (inicio/cierre de sesión)
    // eslint-disable-next-line
  }, [profile]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (
      newMessage.trim() &&
      profile &&
      socketRef.current &&
      socketRef.current.connected
    ) {
      const message = {
        id: `msg_${Date.now()}`,
        text: newMessage.trim(),
        sender: profile.nombre_completo || profile.email || "Usuario",
        timestamp: new Date().toISOString(),
        senderAvatar: profile.avatar_url,
      };
      socketRef.current.emit("chat", { message });
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ayer";
    } else {
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const dateKey = message.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return Object.entries(groups).map(([dateKey, msgs]) => ({
      date: new Date(dateKey),
      messages: msgs,
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  const getRoleColor = (role: string) => {
    if (role === "director") return "bg-purple-100 text-purple-800 border-purple-200";
    return "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getRoleBadgeText = (role: string) => {
    if (role === "director") return "Director";
    return "Miembro";
  };

  return (
    <AppLayout title="Chat del Equipo">
      <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-4 lg:gap-6">
        {/* Chat principal */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messageGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-medium mb-2">¡Inicia la conversación!</h3>
                <p className="text-center">
                  Este es el chat del equipo. Comparte ideas, actualizaciones y mantente conectado con tu equipo.
                </p>
              </div>
            ) : (
              messageGroups.map(({ date, messages: dayMessages }) => (
                <div key={date.toDateString()}>
                  <div className="flex justify-center my-4">
                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                      {formatDate(date)}
                    </span>
                  </div>

                  {dayMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${
                        message.sender === (profile?.nombre_completo || user?.email)
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-xs lg:max-w-md ${
                          message.sender === (profile?.nombre_completo || user?.email)
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >
                        <Avatar className="h-8 w-8 mx-2">
                          <AvatarImage src={message.senderAvatar} />
                          <AvatarFallback>{message.sender[0]}</AvatarFallback>
                        </Avatar>

                        <div
                          className={`${
                            message.sender === (profile?.nombre_completo || user?.email) ? "mr-2" : "ml-2"
                          }`}
                        >
                          <div
                            className={`text-xs text-gray-500 mb-1 ${
                              message.sender === (profile?.nombre_completo || user?.email) ? "text-right" : "text-left"
                            }`}
                          >
                            {message.sender} • {formatTime(message.timestamp)}
                          </div>

                          <Card
                            className={`p-3 ${
                              message.sender === (profile?.nombre_completo || user?.email)
                                ? "bg-blue-500 text-white"
                                : "bg-white"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          </Card>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )))
            }
            <div ref={messagesEndRef} />
          </div>

          <Card className="m-4 p-4">
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Paperclip size={16} />
              </Button>
              <Button variant="ghost" size="sm">
                <Smile size={16} />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                <Send size={16} />
              </Button>
            </div>
          </Card>
        </div>

        {/* Barra lateral derecha - Miembros del equipo */}
        <Card className="w-full lg:w-80 flex flex-col lg:max-h-full order-first lg:order-last">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground">Equipo</h3>
                <p className="text-sm text-muted-foreground">{teamMembers.length} miembros</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-start space-x-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                        {member.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full shadow-sm"></div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{member.name}</p>
                      {member.role === "director" && (
                        <Crown size={16} className="text-yellow-500 flex-shrink-0" />
                      )}
                    </div>

                    {member.jobTitle && (
                      <p className="text-sm text-muted-foreground truncate">{member.jobTitle}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium ${getRoleColor(member.role)}`}
                      >
                        {getRoleBadgeText(member.role)}
                      </Badge>
                      {member.isOnline && (
                        <span className="text-xs text-green-600 font-medium">En línea</span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
              ))}

              {teamMembers.length === 0 && (
                <div className="text-center text-muted-foreground py-12">
                  <div className="p-4 bg-muted/50 rounded-full inline-block mb-4">
                    <Users size={32} className="opacity-50" />
                  </div>
                  <p className="text-sm font-medium mb-1">No hay miembros del equipo</p>
                  <p className="text-xs">Los miembros aparecerán aquí cuando se unan al equipo</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </AppLayout>
  );
};



export default Chat;
