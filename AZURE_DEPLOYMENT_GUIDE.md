# 🚀 Complete Azure Deployment Guide - React + Django + Ollama

## 🏗️ Architecture Overview

```
┌─────────────────────┐    ┌─────────────────────┐    ┌─────────────────────┐
│  React Frontend     │    │  Django Backend     │    │  Ollama AI Server   │
│  (Azure Static      │────│  (Azure App         │────│  (Azure VM or       │
│   Web Apps)         │    │   Service)          │    │   External Server)  │
└─────────────────────┘    └─────────────────────┘    └─────────────────────┘
```

Your React app communicates with Django, which then communicates with your Ollama AI model for enhanced documentation generation.

## 📋 Prerequisites

1. **Azure CLI installed** and authenticated
2. **Git repository** with your code
3. **Ollama server** running and accessible
4. **Node.js & npm** for React
5. **Python 3.11+** for Django

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Ollama Server

#### Option A: Azure VM Setup
```bash
# Create Azure VM for Ollama
az vm create \
  --resource-group code-docgen-rg \
  --name ollama-server \
  --image Ubuntu2204 \
  --size Standard_D2s_v3 \
  --generate-ssh-keys

# SSH into VM and install Ollama
ssh azureuser@<vm-public-ip>
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen:0.5b
ollama serve &

# Open port 11434 in Network Security Group
az vm open-port --resource-group code-docgen-rg --name ollama-server --port 11434
```

#### Option B: Use Existing Server
Update your Ollama API URL in the deployment script:
```powershell
$OllamaApiUrl = "http://YOUR_OLLAMA_SERVER:11434/api/generate"
```

### Step 2: Deploy Django Backend

1. **Copy Azure requirements:**
   ```powershell
   Copy-Item requirements_azure.txt requirements.txt
   ```

2. **Run deployment script:**
   ```powershell
   .\deploy-backend-azure.ps1 -OllamaApiUrl "http://YOUR_OLLAMA_SERVER:11434/api/generate"
   ```

3. **Deploy your code:**
   ```bash
   git remote add azure <your-git-url>
   git add .
   git commit -m "Deploy to Azure with Ollama integration"
   git push azure main
   ```

### Step 3: Configure Frontend

1. **Update environment variables:**
   ```bash
   # In frontend/.env.production
   REACT_APP_API_URL=https://code-docgen-api.azurewebsites.net
   ```

2. **Deploy to Azure Static Web Apps:**
   ```powershell
   # Navigate to frontend
   cd frontend
   npm install
   npm run build
   
   # Deploy using Azure CLI
   az staticwebapp create \
     --name code-docgen-frontend \
     --resource-group code-docgen-rg \
     --source https://github.com/YOUR_USERNAME/YOUR_REPO \
     --location "East US 2" \
     --branch main \
     --app-location "frontend" \
     --output-location "build"
   ```

### Step 4: Update CORS Settings

After frontend deployment, update your backend CORS settings:

```bash
# Get your frontend URL
FRONTEND_URL=$(az staticwebapp show --name code-docgen-frontend --resource-group code-docgen-rg --query "defaultHostname" -o tsv)

# Update Django settings
az webapp config appsettings set \
  --resource-group code-docgen-rg \
  --name code-docgen-api \
  --settings FRONTEND_URL="https://$FRONTEND_URL"
```

## 🔧 Configuration Files Summary

### Created Files:
- **`backend/settings_azure.py`** - Production Django settings
- **`startup.sh`** - Azure startup script
- **`requirements_azure.txt`** - Enhanced dependencies
- **`frontend/.env.production`** - React production config
- **`frontend/src/services/api.js`** - Enhanced API service
- **`frontend/src/components/OllamaDocumentationGenerator.jsx`** - Ollama component
- **`deploy-backend-azure.ps1`** - Backend deployment script

## 🌐 Your Deployed URLs

After deployment:
- **Frontend**: `https://code-docgen-frontend.azurestaticapps.net`
- **Backend API**: `https://code-docgen-api.azurewebsites.net`
- **API Endpoints**:
  - Health check: `/api/ai-status/`
  - File upload: `/api/upload/`
  - Ollama generation: `/api/generate/`
  - Documentation export: `/api/export-docs/`

## 🔍 Testing Your Deployment

### 1. Test Backend API
```bash
# Health check
curl https://code-docgen-api.azurewebsites.net/api/ai-status/

# Test Ollama integration
curl -X POST https://code-docgen-api.azurewebsites.net/api/generate/ \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain what a Python function is"}'
```

### 2. Test Frontend
1. Open your Static Web App URL
2. Navigate to the Ollama Documentation Generator
3. Try generating documentation with different models
4. Test file upload and export features

## 🛠️ Advanced Features

### Multiple AI Models
Your setup supports multiple Ollama models:
- `qwen:0.5b` - Fast, lightweight
- `qwen:1.8b` - Balanced performance
- `llama3:8b` - High quality
- `codellama:7b` - Code specialist

### Enhanced API Features
- **Error handling** with specific error types
- **Performance metrics** (duration, token count)
- **Configurable parameters** (temperature, max_tokens)
- **Multiple export formats** (PDF, HTML, MD, TXT, DOCX)

## 📊 Monitoring & Troubleshooting

### Check Logs
```bash
# Backend logs
az webapp log tail --name code-docgen-api --resource-group code-docgen-rg

# Application Insights (if enabled)
az monitor app-insights component show --app code-docgen-api --resource-group code-docgen-rg
```

### Common Issues
1. **Ollama Connection Failed**: Check VM network security groups
2. **CORS Errors**: Update CORS_ALLOWED_ORIGINS in Django settings
3. **Timeout Errors**: Increase OLLAMA_TIMEOUT setting
4. **Memory Issues**: Upgrade App Service plan or optimize Ollama model

## 💰 Cost Optimization

### Estimated Monthly Costs:
- **Frontend**: Free (Azure Static Web Apps free tier)
- **Backend**: ~$13 (B1 App Service plan)
- **Ollama VM**: ~$30-60 (Standard_D2s_v3)
- **Total**: ~$43-73/month

### Cost Savings:
- Use **Spot VMs** for Ollama server (up to 90% savings)
- **Auto-shutdown** VM when not in use
- Use **Container Instances** for occasional use

## 🔄 CI/CD Pipeline (Optional)

Set up automatic deployment with GitHub Actions:

```yaml
# .github/workflows/azure-deploy.yml
name: Deploy to Azure
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Azure App Service
        uses: azure/webapps-deploy@v2
        with:
          app-name: code-docgen-api
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
```

## 📞 Support & Resources

- **Azure Documentation**: https://docs.microsoft.com/azure/
- **Ollama Documentation**: https://ollama.com/docs
- **Django on Azure**: https://docs.microsoft.com/azure/app-service/configure-language-python
- **React Static Web Apps**: https://docs.microsoft.com/azure/static-web-apps/

---

## 🎉 Congratulations!

Your enhanced code documentation generator with AI capabilities is now running on Azure! 

**Key Features:**
✅ AI-powered documentation with multiple models  
✅ File upload and processing  
✅ Real-time code analysis  
✅ Multiple export formats  
✅ Production-ready deployment  
✅ Scalable architecture  

Your application is ready to handle enterprise-level documentation generation with the power of custom AI models!
