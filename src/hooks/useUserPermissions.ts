import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserPermissions {
  canCreateProjects: boolean;
  canCreateTasks: boolean;
  canManageUsers: boolean;
  userRole: 'admin' | 'gerente' | 'miembro' | null;
  loading: boolean;
}

export const useUserPermissions = (): UserPermissions => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>({
    canCreateProjects: false,
    canCreateTasks: false,
    canManageUsers: false,
    userRole: null,
    loading: true,
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setPermissions({
          canCreateProjects: false,
          canCreateTasks: false,
          canManageUsers: false,
          userRole: null,
          loading: false,
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from('roles_usuario')
          .select('rol')
          .eq('usuario_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setPermissions(prev => ({ ...prev, loading: false }));
          return;
        }

        const userRole = data.rol as 'admin' | 'gerente' | 'miembro';
        
        setPermissions({
          canCreateProjects: userRole === 'admin' || userRole === 'gerente',
          canCreateTasks: userRole === 'admin' || userRole === 'gerente',
          canManageUsers: userRole === 'admin',
          userRole,
          loading: false,
        });
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setPermissions(prev => ({ ...prev, loading: false }));
      }
    };

    fetchUserRole();
  }, [user]);

  return permissions;
};

export default useUserPermissions;