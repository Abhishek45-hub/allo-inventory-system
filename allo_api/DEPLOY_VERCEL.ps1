<#
PowerShell helper to assist deploying this API to Vercel.

USAGE:
  1. Install Vercel CLI: npm i -g vercel
  2. From this folder, run: .\DEPLOY_VERCEL.ps1

NOTES:
  - This project is not directly compatible with Vercel long-running processes.
  - The script automates environment variable creation and triggers a deploy.
  - You must provide a reachable production `DATABASE_URL` (not localhost).
#>

param()

function Ask-Secret([string]$name) {
  Write-Host "Enter value for $name (will not be echoed):"
  $secure = Read-Host -AsSecureString
  return [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
}

# Ensure vercel CLI is available
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  Write-Host "vercel CLI not found. Install with: npm i -g vercel" -ForegroundColor Yellow
  exit 1
}

Write-Host "This script will help set required environment variables and deploy to Vercel." -ForegroundColor Cyan

# Login step
Write-Host "Logging into Vercel..." -NoNewline
vercel login

# Prompt for required env vars
$databaseUrl = Ask-Secret "DATABASE_URL"
$redisUrl = Read-Host "REDIS_URL (optional, press Enter to skip)"
$jwtAccess = Ask-Secret "JWT_ACCESS_SECRET"
$jwtRefresh = Ask-Secret "JWT_REFRESH_SECRET"

# Add env vars to Vercel (production)
Write-Host "Adding environment variables to Vercel (production)..."
# Pipe the secret values into the interactive vercel prompts (PowerShell-compatible)
$databaseUrl | vercel env add DATABASE_URL production --yes
if ($redisUrl -ne "") { $redisUrl | vercel env add REDIS_URL production --yes }
$jwtAccess | vercel env add JWT_ACCESS_SECRET production --yes
$jwtRefresh | vercel env add JWT_REFRESH_SECRET production --yes
"production" | vercel env add NODE_ENV production --yes

# Run migrations remotely during build by ensuring DATABASE_URL exists in project
Write-Host "Triggering a Vercel deploy (this will run your build steps)"
vercel --prod

Write-Host "Deploy command issued. Check Vercel dashboard or run 'vercel logs --prod' to monitor." -ForegroundColor Green
