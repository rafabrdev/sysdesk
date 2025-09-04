#!/usr/bin/env node

/**
 * Script de teste de integração para validar o sistema de autenticação
 * Sprint 2 - SysDesk
 */

const http = require('http');
const crypto = require('crypto');

// Configuração
const API_BASE_URL = 'http://localhost:5000';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// Helper para fazer requisições HTTP
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Funções de teste
async function testHealthCheck() {
  console.log(`${colors.cyan}1. Testando Health Check...${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/health');
    if (response.statusCode === 200 && response.data.status === 'healthy') {
      console.log(`${colors.green}✓ Health check OK${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Health check falhou${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro no health check: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testRegistration() {
  console.log(`${colors.cyan}2. Testando Registro de Usuário...${colors.reset}`);
  try {
    const userData = {
      name: 'Test User Sprint 2',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      organizationId: 'org-001'
    };

    const response = await makeRequest('POST', '/api/auth/register', userData);
    
    if (response.statusCode === 201 && response.data.token) {
      console.log(`${colors.green}✓ Registro bem-sucedido${colors.reset}`);
      console.log(`  - Email: ${TEST_EMAIL}`);
      console.log(`  - Token recebido: ${response.data.token.substring(0, 20)}...`);
      return response.data.token;
    } else {
      console.log(`${colors.red}✗ Registro falhou: ${JSON.stringify(response.data)}${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro no registro: ${error.message}${colors.reset}`);
    return null;
  }
}

async function testLogin() {
  console.log(`${colors.cyan}3. Testando Login...${colors.reset}`);
  try {
    const loginData = {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    };

    const response = await makeRequest('POST', '/api/auth/login', loginData);
    
    if (response.statusCode === 200 && response.data.token) {
      console.log(`${colors.green}✓ Login bem-sucedido${colors.reset}`);
      console.log(`  - User ID: ${response.data.user.id}`);
      console.log(`  - Role: ${response.data.user.role}`);
      return {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        user: response.data.user
      };
    } else {
      console.log(`${colors.red}✗ Login falhou: ${JSON.stringify(response.data)}${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro no login: ${error.message}${colors.reset}`);
    return null;
  }
}

async function testProtectedRoute(token) {
  console.log(`${colors.cyan}4. Testando Rota Protegida (/api/auth/me)...${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/auth/me', null, token);
    
    if (response.statusCode === 200 && response.data.user) {
      console.log(`${colors.green}✓ Acesso autorizado à rota protegida${colors.reset}`);
      console.log(`  - User: ${response.data.user.name}`);
      console.log(`  - Email: ${response.data.user.email}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Acesso negado: ${JSON.stringify(response.data)}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro ao acessar rota protegida: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testRefreshToken(refreshToken) {
  console.log(`${colors.cyan}5. Testando Refresh Token...${colors.reset}`);
  try {
    const response = await makeRequest('POST', '/api/auth/refresh', { refreshToken });
    
    if (response.statusCode === 200 && response.data.token) {
      console.log(`${colors.green}✓ Token renovado com sucesso${colors.reset}`);
      console.log(`  - Novo token: ${response.data.token.substring(0, 20)}...`);
      return response.data.token;
    } else {
      console.log(`${colors.red}✗ Refresh token falhou: ${JSON.stringify(response.data)}${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro no refresh token: ${error.message}${colors.reset}`);
    return null;
  }
}

async function testLogout(token) {
  console.log(`${colors.cyan}6. Testando Logout...${colors.reset}`);
  try {
    const response = await makeRequest('POST', '/api/auth/logout', null, token);
    
    if (response.statusCode === 200) {
      console.log(`${colors.green}✓ Logout bem-sucedido${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Logout falhou: ${JSON.stringify(response.data)}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro no logout: ${error.message}${colors.reset}`);
    return false;
  }
}

async function testUnauthorizedAccess(token) {
  console.log(`${colors.cyan}7. Testando Acesso Não Autorizado após Logout...${colors.reset}`);
  try {
    const response = await makeRequest('GET', '/api/auth/me', null, token);
    
    if (response.statusCode === 401) {
      console.log(`${colors.green}✓ Acesso negado corretamente (token inválido)${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Token ainda válido após logout!${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Erro ao testar acesso não autorizado: ${error.message}${colors.reset}`);
    return false;
  }
}

// Função principal
async function runTests() {
  console.log(`${colors.yellow}========================================${colors.reset}`);
  console.log(`${colors.yellow}   TESTES DE INTEGRAÇÃO - SPRINT 2${colors.reset}`);
  console.log(`${colors.yellow}========================================${colors.reset}\n`);

  let allTestsPassed = true;

  // 1. Health Check
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log(`${colors.red}\n❌ Sistema não está respondendo. Abortando testes.${colors.reset}`);
    process.exit(1);
  }

  console.log();

  // 2. Registro
  const registrationToken = await testRegistration();
  if (!registrationToken) {
    allTestsPassed = false;
    console.log(`${colors.yellow}⚠ Continuando com login de usuário existente...${colors.reset}`);
  }

  console.log();

  // 3. Login
  const loginResult = await testLogin();
  if (!loginResult) {
    console.log(`${colors.red}\n❌ Login falhou. Abortando testes.${colors.reset}`);
    process.exit(1);
  }

  console.log();

  // 4. Rota Protegida
  const protectedAccess = await testProtectedRoute(loginResult.token);
  if (!protectedAccess) allTestsPassed = false;

  console.log();

  // 5. Refresh Token
  const newToken = await testRefreshToken(loginResult.refreshToken);
  if (!newToken) allTestsPassed = false;

  console.log();

  // 6. Logout
  const logoutSuccess = await testLogout(newToken || loginResult.token);
  if (!logoutSuccess) allTestsPassed = false;

  console.log();

  // 7. Acesso Não Autorizado
  const unauthorizedCorrect = await testUnauthorizedAccess(loginResult.token);
  if (!unauthorizedCorrect) allTestsPassed = false;

  // Resultado final
  console.log(`\n${colors.yellow}========================================${colors.reset}`);
  if (allTestsPassed) {
    console.log(`${colors.green}✅ TODOS OS TESTES PASSARAM!${colors.reset}`);
    console.log(`${colors.green}Sprint 2 - Sistema de Autenticação OK${colors.reset}`);
  } else {
    console.log(`${colors.red}⚠️  ALGUNS TESTES FALHARAM${colors.reset}`);
    console.log(`${colors.yellow}Verifique os erros acima para correção${colors.reset}`);
  }
  console.log(`${colors.yellow}========================================${colors.reset}`);

  process.exit(allTestsPassed ? 0 : 1);
}

// Executar testes
runTests().catch(error => {
  console.error(`${colors.red}Erro fatal: ${error.message}${colors.reset}`);
  process.exit(1);
});
