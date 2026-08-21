$url = "https://xcwcecfveyoavqfktsua.supabase.co"
$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2NlY2Z2ZXlvYXZxZmt0c3VhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzI0NDc1NiwiZXhwIjoyMTAyODIwNzU2fQ.PBUAv0oF1v0rYRybqavCwv-4fVwQWCKwNFSvs_7ngro"

$headers = @{
    "apikey" = $serviceKey
    "Authorization" = "Bearer $serviceKey"
    "Content-Type" = "application/json"
    "Prefer" = "return=representation"
}

$body = @{
    name = "Test Service Insert"
    slug = "test-service-insert-" + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    price = 150000
    status = "published"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "$url/rest/v1/products" -Method Post -Headers $headers -Body $body
    Write-Host "SERVICE ROLE INSERT SUCCESS! Inserted ID:" $res.id
    # Clean up test
    Invoke-RestMethod -Uri "$url/rest/v1/products?id=eq.$($res.id)" -Method Delete -Headers $headers
    Write-Host "CLEANUP SUCCESS!"
} catch {
    Write-Host "SERVICE ROLE FAILED:" $_.Exception.Message
}
