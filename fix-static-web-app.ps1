# Fix Azure Static Web Apps Deployment
# Run this script to create a new Static Web App and fix the deployment

# Login to Azure
Write-Host "🔐 Logging into Azure..." -ForegroundColor Yellow
az login

# Set variables
$resourceGroup = "code-docgen-rg"
$staticWebAppName = "code-docgen-frontend"
$location = "East US 2"
$githubRepo = "https://github.com/Bhautikgauswami33/code-docgen"
$branch = "main"

# Create resource group if it doesn't exist
Write-Host "📦 Creating resource group..." -ForegroundColor Yellow
az group create --name $resourceGroup --location $location

# Create Static Web App
Write-Host "🌐 Creating Azure Static Web App..." -ForegroundColor Yellow
$deploymentToken = az staticwebapp create `
    --name $staticWebAppName `
    --resource-group $resourceGroup `
    --source $githubRepo `
    --location $location `
    --branch $branch `
    --app-location "frontend" `
    --output-location "build" `
    --login-with-github `
    --query "deploymentToken" `
    --output tsv

Write-Host "✅ Static Web App created successfully!" -ForegroundColor Green
Write-Host "📋 Deployment Token: $deploymentToken" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to your GitHub repository settings" -ForegroundColor White
Write-Host "2. Go to Secrets and variables > Actions" -ForegroundColor White
Write-Host "3. Update or create the secret with name: AZURE_STATIC_WEB_APPS_API_TOKEN_BRAVE_BUSH_0E706DE00" -ForegroundColor White
Write-Host "4. Set the value to: $deploymentToken" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Your Static Web App URL will be:" -ForegroundColor Cyan
$appUrl = az staticwebapp show --name $staticWebAppName --resource-group $resourceGroup --query "defaultHostname" --output tsv
Write-Host "https://$appUrl" -ForegroundColor White
