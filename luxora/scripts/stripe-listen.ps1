# Forward Stripe webhooks to local Luxora dev server.
# Requires STRIPE_SECRET_KEY in .env.local (stripe listen --api-key mode).

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

$envPath = Join-Path (Get-Location) ".env.local"
if (-not (Test-Path $envPath)) {
  Write-Error ".env.local not found. Copy .env.example first."
}

$content = Get-Content $envPath -Raw
if ($content -notmatch 'STRIPE_SECRET_KEY="(sk_[^"]+)"') {
  Write-Error "STRIPE_SECRET_KEY missing in .env.local"
}
$stripeKey = $Matches[1]

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "Starting Stripe webhook forwarder -> http://localhost:3000/api/v1/webhooks/stripe"
Write-Host "Keep this window open while testing checkout."
Write-Host ""

& stripe listen --forward-to "http://localhost:3000/api/v1/webhooks/stripe" --api-key $stripeKey
