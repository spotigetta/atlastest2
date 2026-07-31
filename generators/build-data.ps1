$ErrorActionPreference = 'Stop'
$generator = Join-Path $PSScriptRoot 'build-data.mjs'
node $generator
if ($LASTEXITCODE -ne 0) {
    throw 'Atlas data generation failed.'
}
Write-Output 'Metadata catalog generated. Run build-fulltext.mjs when source documents change.'
