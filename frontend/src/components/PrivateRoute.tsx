import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  allowedRoles?: string[];
  redirectTo?: string;
}

export function PrivateRoute({ 
  allowedRoles = [], 
  redirectTo = '/login' 
}: PrivateRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se há roles permitidas definidas, verificar se o usuário tem uma delas
  if (allowedRoles.length > 0) {
    const userRole = user?.role || '';
    
    // Hierarquia de roles: master > admin > support > client
    const roleHierarchy: { [key: string]: number } = {
      client: 1,
      support: 2,
      admin: 3,
      master: 4,
    };

    const userRoleLevel = roleHierarchy[userRole] || 0;
    
    // Verifica se o usuário tem pelo menos o nível de acesso necessário
    const hasAccess = allowedRoles.some(role => {
      const requiredLevel = roleHierarchy[role] || 0;
      return userRoleLevel >= requiredLevel;
    });

    if (!hasAccess) {
      // Se não tem permissão, redireciona para página de acesso negado ou dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Se está autenticado e tem permissão, renderiza a rota protegida
  return <Outlet />;
}
