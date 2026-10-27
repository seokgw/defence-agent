param(
 [Parameter(Mandatory=$true)][string]$PackageDir,
 [Parameter(Mandatory=$true)][string]$Compiler,
 [Parameter(Mandatory=$true)][string]$OutputDir
)
$ErrorActionPreference='Stop'
$PackageDir=(Resolve-Path -LiteralPath $PackageDir).Path
$Compiler=(Resolve-Path -LiteralPath $Compiler).Path
if(Test-Path -LiteralPath $OutputDir){throw 'OUTPUT_MUST_BE_NEW'}
New-Item -ItemType Directory -Path $OutputDir | Out-Null
$OutputDir=(Resolve-Path -LiteralPath $OutputDir).Path
$manifestPath=Join-Path $PackageDir 'APP_PACKAGE_MANIFEST.json'
$m=Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
$hash=(Get-FileHash -LiteralPath $manifestPath -Algorithm SHA256).Hash.ToLowerInvariant()
if($m.schema -ne 'alekov.install-package.v2'){throw 'PACKAGE_SCHEMA_UNSUPPORTED'}
foreach($item in @($m.archive,$m.installer,$m.fullAppRuntime.archive)){
 if(-not $item){throw 'PACKAGE_INCOMPLETE'}
 $name=if($item.name){$item.name}else{$item.path}
 if([IO.Path]::GetFileName($name) -ne $name){throw 'PACKAGE_PATH_INVALID'}
 if((Get-FileHash -LiteralPath (Join-Path $PackageDir $name) -Algorithm SHA256).Hash.ToLowerInvariant() -ne $item.sha256){throw 'PACKAGE_HASH_MISMATCH'}
}
$owned=@($m.files)+@($m.fullAppRuntime.files)
$paths=@($owned | ForEach-Object {
 $p=$_.path.Replace('/','\')
 if([IO.Path]::IsPathRooted($p) -or $p.Split('\') -contains '..' -or $p.Contains('"')){throw 'PACKAGE_PATH_INVALID'}
 $p
})+@('INSTALL_RECEIPT.json')
$deleteLines=@()
$dirs=@{}
foreach($p in $paths){
 $deleteLines+='Type: files; Name: "{app}\application\'+$p+'"'
 $d=Split-Path $p -Parent
 while($d){$dirs[$d]=$true; $d=Split-Path $d -Parent}
}
foreach($d in ($dirs.Keys | Sort-Object Length -Descending)){$deleteLines+='Type: dirifempty; Name: "{app}\application\'+$d+'"'}
$deleteLines+='Type: dirifempty; Name: "{app}\application"'
$template=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'codex.iss') -Raw
$template=$template.Replace('@@PACKAGE@@',$PackageDir).Replace('@@OUTPUT@@',$OutputDir).Replace('@@VERSION@@',[string]$m.sourceVersion).Replace('@@MANIFEST@@',$hash).Replace('@@DELETE@@',($deleteLines -join [Environment]::NewLine))
$iss=Join-Path $OutputDir 'build.iss'
[IO.File]::WriteAllText($iss,$template,[Text.UTF8Encoding]::new($true))
& $Compiler $iss
if($LASTEXITCODE -ne 0){throw 'SETUP_COMPILE_FAILED'}
Get-FileHash -LiteralPath (Join-Path $OutputDir 'setup.exe') -Algorithm SHA256 | Format-List