$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
Write-Host 'PlotRelay local setup. Secrets stay in this process and are never printed or saved.'
$env:TWITCH_CLIENT_ID = Read-Host 'Twitch application client ID (Enter for rehearsal)'
if ($env:TWITCH_CLIENT_ID) {
    $taskToken = Read-Host 'Twitch USER access token with user:read:chat' -AsSecureString
    $env:TWITCH_USER_TOKEN = [System.Net.NetworkCredential]::new('', $taskToken).Password
    $env:TWITCH_BROADCASTER_ID = Read-Host 'Numeric broadcaster user ID'
}
try { & node --env-file-if-exists=.env server.mjs }
finally { Remove-Item Env:TWITCH_USER_TOKEN -ErrorAction SilentlyContinue }
