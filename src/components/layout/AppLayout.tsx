import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Kanban, Calendar as CalendarIcon, MessageSquare, LogOut, Users, Menu, ChartGantt } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import InvitationManager from "@/components/invitations/InvitationManager";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AppLayout = ({ children, title }: AppLayoutProps) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard" },
    { label: "Proyectos", icon: <Kanban size={20} />, href: "/projects" },
    { label: "Seguimiento", icon: <ChartGantt size={20} />, href: "/task-tracking" },
    { label: "Calendario", icon: <CalendarIcon size={20} />, href: "/calendar" },
    { label: "Chat", icon: <MessageSquare size={20} />, href: "/chat" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold text-blue-600">Marketing Ágil</h1>
      </div>
      
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-medium">{profile?.nombre_completo?.charAt(0) || user?.email?.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{profile?.nombre_completo || user?.email}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.puesto || 'Usuario'}</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  window.location.pathname === item.href && "bg-blue-50 text-blue-600"
                )}
                onClick={() => {
                  navigate(item.href);
                  if (isMobile) setMobileMenuOpen(false);
                }}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      
      {profile && (
        <div className="p-4 border-t">
          <InvitationManager />
        </div>
      )}
      
      <div className="p-4 border-t">
        <Button variant="outline" className="w-full justify-start text-red-500" onClick={handleLogout}>
          <LogOut size={20} />
          <span className="ml-2">Cerrar sesión</span>
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar para escritorio */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <SidebarContent />
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          )}
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;