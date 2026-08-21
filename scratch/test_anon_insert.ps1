$envFile = Get-Content ".env"
$anonKey = ""
$serviceKey = ""
$url = ""
foreach ($line in $envFile) {
    if ($line -match "SUPABASE_ANON_KEY=(.+)") { $anonKey = $matches[1].Trim() }
    if ($line -match "SUPABASE_SERVICE_ROLE_KEY=(.+)") { $serviceKey = $matches[1].Trim() }
    if ($line -match "VITE_SUPABASE_URL=(.+)") { $url = $matches[1].Trim() }
}

Write-Host "Testing Supabase REST insert with ANON key..."
$headers = @{
    "apikey" = $anonKey
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

$body = @{
    name = "Test Anon Insert"
    slug = "test-anon-insert-" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    price = 100000
    status = "published"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$url/rest/v1/products" -Method Post -Headers $headers -Body $body
    Write-Host "ANON INSERT SUCCESS! Inserted ID:" $res.id
    # Clean up test
    $delHeaders = @{ "apikey" = $serviceKey; "Authorization" = "Bearer $serviceKey" }
    Invoke-RestMethod -Uri "$url/rest/v1/products?id=eq.$($res.id)" -Method Delete -Headers $delHeaders
} catch {
    Write-Host "ANON INSERT FAILED with error:" $_.Exception.Message
    if ($_.ErrorDetails) { Write-Host "Details:" $_.ErrorDetails.Message }
}
