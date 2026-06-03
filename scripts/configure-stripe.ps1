$ErrorActionPreference = "Stop"

$envPath = Join-Path $PSScriptRoot "..\.env"
$envPath = [System.IO.Path]::GetFullPath($envPath)

function Read-RequiredValue($prompt, $placeholder) {
  $value = Read-Host $prompt
  if ([string]::IsNullOrWhiteSpace($value)) {
    return $placeholder
  }
  return $value.Trim()
}

Write-Host "TicketReady Stripe local setup"
Write-Host "Use Stripe test mode values first. Do not share these values in chat."
Write-Host ""

$secretKey = Read-RequiredValue "Stripe secret key (sk_test_...)" "sk_test_replace_me"
$priceId = Read-RequiredValue "Stripe recurring price ID (price_...), or leave blank before running npm run setup:stripe" "price_replace_me"
$webhookSecret = Read-RequiredValue "Webhook secret (whsec_...), optional for now" "whsec_replace_me"

@"
PORT=8788
SITE_URL=http://127.0.0.1:8788
STRIPE_SECRET_KEY=$secretKey
STRIPE_PRICE_ID=$priceId
STRIPE_WEBHOOK_SECRET=$webhookSecret
"@ | Set-Content -LiteralPath $envPath -Encoding UTF8

Write-Host ""
Write-Host "Saved .env at $envPath"
Write-Host "Restart the payment server with: npm run dev"
