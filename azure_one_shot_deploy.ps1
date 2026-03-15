#requires -Version 7.0
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# ------------------------------------------------------------
# EDIT THESE VALUES
# ------------------------------------------------------------
$tenantId          = "07c84191-a8a8-4913-9951-241061735e70"
$subscriptionId    = "73ef7308-e2fa-42f2-90bd-79fa9aba6e44"
$projectSlug       = "stjudeshub"
$environment       = "dev"
$regionCode        = "uks"
$location          = "uksouth"

# Optional: set this to a fixed value if you prefer deterministic naming.
# Keep blank to auto-generate a unique suffix on each run.
$nameSuffix = ""

$resourceGroupName = "rg-$projectSlug-$environment-$regionCode"

# Must be globally unique, lowercase, 3-24 chars
if ([string]::IsNullOrWhiteSpace($nameSuffix)) {
  $nameSuffix = (Get-Random -Minimum 1000 -Maximum 9999).ToString()
}
$storageAccountName = ("stjhub" + $environment + $nameSuffix).ToLower()
$staticWebAppName   = ("swa-" + $projectSlug + "-" + $environment + "-" + $nameSuffix).ToLower()

$repoUrl  = "https://github.com/v-m-g-d/stjudes"
$branch   = "main"
$ghToken  = "<GITHUB_PAT_WITH_REPO_WORKFLOW_SCOPE>"

# Comma-separated moderator emails for approve actions
$adminEmails = "pablogilberto2@hotmail.com"

# Optional app setting names (keep defaults unless needed)
$tableUsers    = "Users"
$tableThreads  = "Threads"
$tableComments = "Comments"
$tableNews     = "News"
$tablePlans    = "Plans"

# ------------------------------------------------------------
# Preflight checks
# ------------------------------------------------------------
Write-Host "Checking Azure CLI..." -ForegroundColor Cyan
az --version | Out-Null

if ($ghToken -like "<*" -and -not [string]::IsNullOrWhiteSpace($env:GITHUB_PAT)) {
  $ghToken = $env:GITHUB_PAT
}

if ($tenantId -like "<*" -or $subscriptionId -like "<*" -or $ghToken -like "<*") {
  throw "Please update placeholder values at the top of this script before running."
}

if ($storageAccountName -cmatch "[^a-z0-9]" -or $storageAccountName.Length -lt 3 -or $storageAccountName.Length -gt 24) {
  throw "storageAccountName must be lowercase alphanumeric and 3-24 characters."
}

Write-Host "Using resource names:" -ForegroundColor Cyan
Write-Host "- Resource Group : $resourceGroupName"
Write-Host "- Storage        : $storageAccountName"
Write-Host "- Static Web App : $staticWebAppName"

# ------------------------------------------------------------
# Azure login + subscription
# ------------------------------------------------------------
Write-Host "Logging in to Azure tenant..." -ForegroundColor Cyan
az login --tenant $tenantId | Out-Null

Write-Host "Setting subscription context..." -ForegroundColor Cyan
az account set --subscription $subscriptionId

# ------------------------------------------------------------
# Resource group
# ------------------------------------------------------------
Write-Host "Creating resource group..." -ForegroundColor Cyan
az group create `
  --name $resourceGroupName `
  --location $location `
  --output none

# ------------------------------------------------------------
# Storage account + tables
# ------------------------------------------------------------
Write-Host "Creating storage account..." -ForegroundColor Cyan
az storage account create `
  --name $storageAccountName `
  --resource-group $resourceGroupName `
  --location $location `
  --sku Standard_LRS `
  --kind StorageV2 `
  --min-tls-version TLS1_2 `
  --allow-blob-public-access false `
  --output none

Write-Host "Fetching storage connection string..." -ForegroundColor Cyan
$storageConnectionString = az storage account show-connection-string `
  --name $storageAccountName `
  --resource-group $resourceGroupName `
  --query connectionString `
  --output tsv

Write-Host "Creating table storage tables..." -ForegroundColor Cyan
$tables = @($tableUsers, $tableThreads, $tableComments, $tableNews, $tablePlans)
foreach ($tableName in $tables) {
  az storage table create `
    --name $tableName `
    --connection-string $storageConnectionString `
    --output none
}

# ------------------------------------------------------------
# Application Insights
# ------------------------------------------------------------
$appInsightsName = "ai-$projectSlug-$environment-$nameSuffix"
Write-Host "Creating Application Insights..." -ForegroundColor Cyan
az monitor app-insights component create `
  --app $appInsightsName `
  --location $location `
  --resource-group $resourceGroupName `
  --kind web `
  --application-type web `
  --retention-time 30 `
  --output none

$instrumentationKey = az monitor app-insights component show `
  --app $appInsightsName `
  --resource-group $resourceGroupName `
  --query instrumentationKey `
  --output tsv

Write-Host "Application Insights key: $instrumentationKey"

# ------------------------------------------------------------
# Budget alerts
# ------------------------------------------------------------
Write-Host "Creating budget alerts at £10, £25, £50..." -ForegroundColor Cyan

$budgetName = "budget-$projectSlug-$environment"
$startDate  = (Get-Date -Day 1).ToString("yyyy-MM-01")
$endDate    = (Get-Date).AddYears(1).ToString("yyyy-MM-01")

az consumption budget create `
  --budget-name $budgetName `
  --amount 50 `
  --category Cost `
  --resource-group $resourceGroupName `
  --time-grain Monthly `
  --start-date $startDate `
  --end-date $endDate `
  --output none 2>$null

Write-Host "Budget created (£50/month cap). Configure email notifications in Azure Portal > Cost Management > Budgets."

# ------------------------------------------------------------
# Static Web App
# ------------------------------------------------------------
Write-Host "Creating Azure Static Web App and linking GitHub repo..." -ForegroundColor Cyan
az staticwebapp create `
  --name $staticWebAppName `
  --resource-group $resourceGroupName `
  --location $location `
  --source $repoUrl `
  --branch $branch `
  --app-location "web" `
  --api-location "api" `
  --output-location "dist" `
  --token $ghToken `
  --output none

# ------------------------------------------------------------
# App settings for integrated API
# ------------------------------------------------------------
Write-Host "Applying Static Web App app settings..." -ForegroundColor Cyan
az staticwebapp appsettings set `
  --name $staticWebAppName `
  --resource-group $resourceGroupName `
  --setting-names `
    AZURE_TABLES_CONNECTION_STRING="$storageConnectionString" `
    APPINSIGHTS_INSTRUMENTATIONKEY="$instrumentationKey" `
    ADMIN_EMAILS="$adminEmails" `
    TABLE_USERS="$tableUsers" `
    TABLE_THREADS="$tableThreads" `
    TABLE_COMMENTS="$tableComments" `
    TABLE_NEWS="$tableNews" `
    TABLE_PLANS="$tablePlans" `
  --output none

# ------------------------------------------------------------
# Result summary
# ------------------------------------------------------------
$defaultHostName = az staticwebapp show `
  --name $staticWebAppName `
  --resource-group $resourceGroupName `
  --query defaultHostname `
  --output tsv

Write-Host "" 
Write-Host "Deployment complete." -ForegroundColor Green
Write-Host "Static Web App URL: https://$defaultHostName" -ForegroundColor Green
Write-Host "" 
Write-Host "Next: validate sign-in, posting, and admin approve flow." -ForegroundColor Yellow
