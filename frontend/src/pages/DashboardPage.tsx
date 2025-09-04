import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, MessageSquare, Users, Settings } from 'lucide-react';

export function DashboardPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Cards de estatísticas baseados no role do usuário
  const getStatsCards = () => {
    const baseCards = [
      {
        title: 'Tickets Abertos',
        value: '12',
        description: 'Aguardando atendimento',
        icon: MessageSquare,
      },
    ];

    if (user?.role === 'support' || user?.role === 'admin' || user?.role === 'master') {
      baseCards.push({
        title: 'Clientes Ativos',
        value: '48',
        description: 'Últimos 30 dias',
        icon: Users,
      });
    }

    if (user?.role === 'admin' || user?.role === 'master') {
      baseCards.push({
        title: 'Agentes Online',
        value: '5',
        description: 'Disponíveis agora',
        icon: Users,
      });
    }

    return baseCards;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-xl font-bold">SysDesk</h1>
          
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.name} ({user?.role})
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>

        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo de volta, {user?.name}!</CardTitle>
            <CardDescription>
              {user?.role === 'client' && 'Aqui você pode abrir tickets e acompanhar seus atendimentos.'}
              {user?.role === 'support' && 'Você tem acesso aos tickets atribuídos a você.'}
              {user?.role === 'admin' && 'Você pode gerenciar usuários, tickets e visualizar relatórios.'}
              {user?.role === 'master' && 'Você tem acesso completo a todas as funcionalidades do sistema.'}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {getStatsCards().map((card, index) => {
            const Icon = card.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse as principais funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user?.role === 'client' && (
              <Button className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Abrir Novo Ticket
              </Button>
            )}
            
            {(user?.role === 'support' || user?.role === 'admin' || user?.role === 'master') && (
              <Button className="w-full" variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Ver Fila de Tickets
              </Button>
            )}
            
            {(user?.role === 'admin' || user?.role === 'master') && (
              <>
                <Button className="w-full" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Usuários
                </Button>
                <Button className="w-full" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
