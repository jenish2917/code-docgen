# Azure Deployment Script for Django Backend with Ollama Integration
# This script deploys your Django app to Azure App Service

param(
    [string]$ResourceGroup = "code-docgen-rg",
    [string]$AppName = "code-docgen-api",
    [string]$Location = "East US",
    [string]$OllamaApiUrl = "http://20.2.84.243:11434/api/generate",
    [string]$OllamaModel = "qwen:0.5b"
)

Write-Host "🚀 Deploying Code Documentation Generator with Ollama Integration" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Yellow

# Login to Azure
Write-Host "🔐 Logging into Azure..." -ForegroundColor Yellow
az account show > $null
if ($LASTEXITCODE -ne 0) {
    az login
}

# Create resource group
Write-Host "📦 Creating resource group: $ResourceGroup..." -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

# Create App Service plan
Write-Host "🏗️ Creating App Service plan..." -ForegroundColor Yellow
az appservice plan create --name "$AppName-plan" --resource-group $ResourceGroup --sku B1 --is-linux

# Create web app
Write-Host "🌐 Creating web app: $AppName..." -ForegroundColor Yellow
az webapp create --resource-group $ResourceGroup --plan "$AppName-plan" --name $AppName --runtime "PYTHON|3.11" --deployment-local-git

# Set startup command
Write-Host "⚙️ Setting startup command..." -ForegroundColor Yellow
az webapp config set --resource-group $ResourceGroup --name $AppName --startup-file "startup.sh"

# Configure app settings for Django and Ollama
Write-Host "🔧 Configuring app settings..." -ForegroundColor Yellow
az webapp config appsettings set --resource-group $ResourceGroup --name $AppName --settings `
    DJANGO_SETTINGS_MODULE="backend.settings_azure" `
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" `
    PYTHON_VERSION="3.11" `
    OLLAMA_API_URL="$OllamaApiUrl" `
    OLLAMA_MODEL="$OllamaModel" `
    OLLAMA_TIMEOUT="30" `
    SECRET_KEY="$(Get-Random -SetSeed (Get-Date).Ticks)" `
    DEBUG="False" `
    SECURE_SSL_REDIRECT="True"

# Configure CORS for frontend
Write-Host "🌍 Configuring CORS settings..." -ForegroundColor Yellow
az webapp cors add --resource-group $ResourceGroup --name $AppName --allowed-origins "https://*azurestaticapps.net" "http://localhost:3000" "http://localhost:5173"

# Enable logging
Write-Host "📊 Enabling application logging..." -ForegroundColor Yellow
az webapp log config --resource-group $ResourceGroup --name $AppName --application-logging filesystem --detailed-error-messages true --failed-request-tracing true --web-server-logging filesystem

# Get deployment credentials
Write-Host "🔑 Getting deployment credentials..." -ForegroundColor Yellow
$gitUrl = az webapp deployment source config-local-git --name $AppName --resource-group $ResourceGroup --query url --output tsv
$deploymentUser = az webapp deployment list-publishing-credentials --name $AppName --resource-group $ResourceGroup --query publishingUserName --output tsv

Write-Host "✅ Backend deployment setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Deployment Information:" -ForegroundColor Cyan
Write-Host "App URL: https://$AppName.azurewebsites.net" -ForegroundColor White
Write-Host "Git URL: $gitUrl" -ForegroundColor White
Write-Host "Deployment User: $deploymentUser" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Add the remote Git URL: git remote add azure $gitUrl" -ForegroundColor White
Write-Host "2. Copy requirements_azure.txt to requirements.txt: Copy-Item requirements_azure.txt requirements.txt" -ForegroundColor White
Write-Host "3. Deploy your code: git add . && git commit -m 'Deploy to Azure' && git push azure main" -ForegroundColor White
Write-Host "4. Test your API: https://$AppName.azurewebsites.net/api/ai-status/" -ForegroundColor White
Write-Host "5. Test Ollama integration: https://$AppName.azurewebsites.net/api/generate/" -ForegroundColor White
Write-Host ""
Write-Host "🤖 Ollama Configuration:" -ForegroundColor Magenta
Write-Host "API URL: $OllamaApiUrl" -ForegroundColor White
Write-Host "Model: $OllamaModel" -ForegroundColor White
Write-Host ""
Write-Host "⚠️ Important Notes:" -ForegroundColor Red
Write-Host "- Ensure your Ollama server at $OllamaApiUrl is accessible from Azure" -ForegroundColor White
Write-Host "- Configure network security groups if using Azure VM for Ollama" -ForegroundColor White
Write-Host "- Update CORS settings with your actual frontend URL after deployment" -ForegroundColor White
