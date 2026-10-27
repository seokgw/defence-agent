[Setup]
AppId=CodexStudent021
AppName=코덱스
AppVersion=@@VERSION@@
AppPublisher=코덱스 학생 프로젝트
DefaultDirName={localappdata}\Programs\Codex-@@VERSION@@
DefaultGroupName=코덱스 @@VERSION@@
PrivilegesRequired=lowest
OutputDir=@@OUTPUT@@
OutputBaseFilename=setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
UninstallDisplayName=코덱스 @@VERSION@@
DisableProgramGroupPage=yes
SetupLogging=yes

[Tasks]
Name: desktopicon; Description: "바탕 화면 바로가기 만들기"; Flags: unchecked

[Files]
Source: "@@PACKAGE@@\*"; DestDir: "{app}\package"; Flags: ignoreversion

[Icons]
Name: "{group}\코덱스"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{%USERPROFILE}\.aleph-alekov-host\start-installed-normal-app.ps1"" -InstallRoot ""{app}\application"""; WorkingDir: "{app}\application\education\on-client"; IconFilename: "{app}\application\education\on-client\package-assets\app.ico"
Name: "{userdesktop}\코덱스 @@VERSION@@"; Filename: "{sys}\WindowsPowerShell\v1.0\powershell.exe"; Parameters: "-NoProfile -ExecutionPolicy Bypass -File ""{%USERPROFILE}\.aleph-alekov-host\start-installed-normal-app.ps1"" -InstallRoot ""{app}\application"""; WorkingDir: "{app}\application\education\on-client"; IconFilename: "{app}\application\education\on-client\package-assets\app.ico"; Tasks: desktopicon

[UninstallDelete]
@@DELETE@@

[Code]
function InitializeSetup(): Boolean;
begin
 Result := FileExists(ExpandConstant('{%USERPROFILE}\.aleph-alekov-host\start-installed-normal-app.ps1'));
 if Result then
  Result := CompareText(GetSHA256OfFile(ExpandConstant('{%USERPROFILE}\.aleph-alekov-host\start-installed-normal-app.ps1')), '34c5bd928222230a8f20f3ded1a607c8b6909710683eb9a6284e4955e1991c18') = 0;
 if not Result then
  MsgBox('공식 R7 실행 호스트를 먼저 설치하세요. 이 설치 파일은 호스트 인증 설정을 변경하지 않습니다.', mbError, MB_OK);
end;

function PrepareToInstall(var NeedsRestart: Boolean): String;
begin
 Result := '';
 if DirExists(ExpandConstant('{app}\application')) then
  Result := '기존 앱을 보존하려면 새로운 설치 폴더를 선택하세요.';
end;

procedure CurStepChanged(CurStep: TSetupStep);
var
 Code: Integer;
 Args: String;
begin
 if CurStep = ssPostInstall then begin
  Args := '-NoProfile -ExecutionPolicy Bypass -File "' + ExpandConstant('{app}\package\install-app.ps1') + '" -Destination "' + ExpandConstant('{app}\application') + '" -ManifestSha256 @@MANIFEST@@';
  if not Exec(ExpandConstant('{sys}\WindowsPowerShell\v1.0\powershell.exe'), Args, ExpandConstant('{app}'), SW_HIDE, ewWaitUntilTerminated, Code) then
   RaiseException('공식 패키지 설치 프로세스를 시작하지 못했습니다.');
  if (Code <> 0) or not FileExists(ExpandConstant('{app}\application\INSTALL_RECEIPT.json')) then
   RaiseException('공식 패키지 검증 또는 설치가 실패했습니다. 기존 프로젝트는 보존됩니다.');
 end;
end;