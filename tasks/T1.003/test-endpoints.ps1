# test-endpoints.ps1
# Script para testar endpoints da T1.003

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Testando endpoints T1.003 - RBAC e Convites" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3333"

# 1. Login como admin
Write-Host "`n1. Fazendo login como admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@brsistemas.com.br"
    password = "Master@Admin2025"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.accessToken
    Write-Host "✅ Login bem-sucedido! User: $($loginResponse.user.email)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro no login: $_" -ForegroundColor Red
    exit 1
}

# 2. Criar um convite
Write-Host "`n2. Criando convite para novo usuário..." -ForegroundColor Yellow
$inviteBody = @{
    email = "teste.novo@empresa.com"
    name = "Teste Novo"
    role = "CLIENT"
    department = "Vendas"
    message = "Bem-vindo ao Sysdesk!"
    maxUses = 1
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $inviteResponse = Invoke-RestMethod -Uri "$baseUrl/api/invites" -Method POST -Body $inviteBody -Headers $headers
    $inviteToken = $inviteResponse.token
    Write-Host "✅ Convite criado! Token: $inviteToken" -ForegroundColor Green
    Write-Host "   Link: $($inviteResponse.inviteLink)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erro ao criar convite: $_" -ForegroundColor Red
}

# 3. Validar token do convite (público)
Write-Host "`n3. Validando token do convite (endpoint público)..." -ForegroundColor Yellow
try {
    $validateResponse = Invoke-RestMethod -Uri "$baseUrl/api/invites/validate?token=$inviteToken" -Method GET
    if ($validateResponse.valid) {
        Write-Host "✅ Token válido!" -ForegroundColor Green
    } else {
        Write-Host "❌ Token inválido: $($validateResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erro ao validar token: $_" -ForegroundColor Red
}

# 4. Listar convites (requer admin)
Write-Host "`n4. Listando todos os convites..." -ForegroundColor Yellow
try {
    $invitesResponse = Invoke-RestMethod -Uri "$baseUrl/api/invites" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Total de convites: $($invitesResponse.Count)" -ForegroundColor Green
    foreach ($invite in $invitesResponse | Select-Object -First 3) {
        Write-Host "   - $($invite.email) | Status: $($invite.status) | Uses: $($invite.uses)/$($invite.maxUses)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao listar convites: $_" -ForegroundColor Red
}

# 5. Listar usuários (requer operator+)
Write-Host "`n5. Listando usuários da empresa..." -ForegroundColor Yellow
try {
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/api/users" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Total de usuários: $($usersResponse.Count)" -ForegroundColor Green
    foreach ($user in $usersResponse | Select-Object -First 3) {
        Write-Host "   - $($user.name) ($($user.email)) | Role: $($user.role)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao listar usuários: $_" -ForegroundColor Red
}

# 6. Testar registro via convite
Write-Host "`n6. Registrando novo usuário via convite..." -ForegroundColor Yellow
$registerBody = @{
    token = $inviteToken
    name = "Usuário Teste Completo"
    password = "SenhaForte@123"
    phone = "+5511999999999"
    position = "Vendedor"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register-by-invite" -Method POST -Body $registerBody -ContentType "application/json"
    if ($registerResponse.success) {
        Write-Host "✅ Usuário registrado com sucesso!" -ForegroundColor Green
        Write-Host "   ID: $($registerResponse.user.id)" -ForegroundColor Gray
        Write-Host "   Email: $($registerResponse.user.email)" -ForegroundColor Gray
        Write-Host "   Nome: $($registerResponse.user.name)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao registrar usuário: $_" -ForegroundColor Red
}

# 7. Testar proteção RBAC - tentar criar convite como CLIENT
Write-Host "`n7. Testando proteção RBAC (tentando criar convite como CLIENT)..." -ForegroundColor Yellow
$clientLoginBody = @{
    email = "teste.novo@empresa.com"
    password = "SenhaForte@123"
} | ConvertTo-Json

try {
    $clientLogin = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $clientLoginBody -ContentType "application/json"
    $clientToken = $clientLogin.accessToken
    
    # Tentar criar convite como CLIENT (deve falhar)
    $inviteAsClient = @{
        email = "outro@teste.com"
        role = "CLIENT"
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/invites" -Method POST -Body $inviteAsClient -Headers @{"Authorization"="Bearer $clientToken"; "Content-Type"="application/json"}
        Write-Host "❌ FALHA DE SEGURANÇA: Cliente conseguiu criar convite!" -ForegroundColor Red
    } catch {
        Write-Host "✅ RBAC funcionando: Cliente não pode criar convites" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Não foi possível testar RBAC: $_" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testes concluídos!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
