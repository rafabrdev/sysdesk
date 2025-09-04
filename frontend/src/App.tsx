import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Rotas Protegidas */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Rotas para Support, Admin e Master */}
            <Route element={<PrivateRoute allowedRoles={['support']} />}>
              {/* Adicionar rotas específicas de support aqui */}
            </Route>
            
            {/* Rotas apenas para Admin e Master */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              {/* Adicionar rotas de administração aqui */}
            </Route>
            
            {/* Rotas apenas para Master */}
            <Route element={<PrivateRoute allowedRoles={['master']} />}>
              {/* Adicionar rotas master aqui */}
            </Route>
          </Route>
          
          {/* Rota padrão - redireciona para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Rota 404 */}
          <Route path="*" element={
            <div className="flex min-h-screen items-center justify-center">
              <h1 className="text-2xl font-bold">404 - Página não encontrada</h1>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App
