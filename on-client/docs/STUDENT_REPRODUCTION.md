> 이 문서는 21·22단계 당시 제출·확인 기록입니다. 현재 0.2.19 총공세의 실행·변경·한계는 [총공세 실행 기록](FINAL_OFFENSIVE_RUNBOOK.md)을 따릅니다. 아래의 ‘현재’는 해당 기록 작성 시점을 뜻합니다.

# 코덱스 — 22단계 새 폴더 재현 기록

상태: **완료(22단계 문서 작성·로컬 재현 확인 범위)**. 앱의 제공 패키지 버전은 `0.2.14`이며 변경하지 않았다. v1.0, 운영 인증 또는 단계 통과를 선언하지 않는다. 19단계 실제 집행 연결은 현재 공식 안내에서도 미준비다.

## 1. 재현 식별 정보와 기록 주체

| 항목 | 확인 내용 |
|---|---|
| 저장소 | `https://github.com/seokgw/defence-agent.git` — 원본 `origin` 설정에서 확인. 공개 여부·원격 최신 커밋 포함 여부는 조회하지 않음 |
| 원본 브랜치 | `master` |
| 새 폴더에 최초로 받은 커밋 | `8c47867daa3ccf9830b6f58a2dad88fb50bf16f8` |
| 복제 방법 | 원본 로컬 Git 저장소를 대상으로 `git clone --no-hardlinks --no-checkout`, 위 커밋으로 detached checkout |
| 작업 위치 | 원본 Git 최상위는 `코덱스-agent`, 실행 위치는 `on-client`. 복제본은 원본 밖의 새 `stage22/reproduction` 폴더이며 그 안의 `on-client`에서 실행 |
| 환경 | 같은 Windows PC·같은 사용자, 다른 폴더. 새 PC·새 Windows 사용자·깨끗한 OS 설치 시험이 아님 |
| 실제 확인 버전 | Git `2.55.0.windows.3`, Node.js `v24.20.0`, npm `11.19.0`, Windows PowerShell `5.1.26100.9711` |
| 기준 버전 | `package.json` Node `24.19.0`, 시작 도구의 허용 주 버전 `22~24`. 권장 버전 자체의 실행은 미확인 |
| 설치 | 앱에 외부 dependencies/devDependencies 및 package-lock.json이 없으므로 npm install을 실행하지 않음 |
| 실제 실행 도구 | `tools/start-alekov.ps1 -Port 5191 -Background` |
| 브라우저 | Codex 앱 내부 브라우저, `http://127.0.0.1:5191/`, 제목 `케셰브 · ZTNA & XDR` |
| 날짜·시간대 | 2026-10-26, KST(UTC+09:00) |
| 주체 | 아래 자동 관찰은 사용자 PC에서 작업한 Codex의 실제 명령·브라우저 확인. 학생이 직접 수행했다고 기록하지 않음 |
| 학생 직접 확인 | 이번 22단계에 대한 학생의 새 폴더 재현 진술은 아직 없음. 학생 확인란은 미확인 |

원본 작업 트리는 시작 시 깨끗했으며 원본 HEAD는 위 40자리 값이었다. 기존 학생 코드·Git 기록·인증 파일을 지우거나 복사하지 않았다. 최초 복제는 원격 업로드 여부에 의존하지 않는 로컬 clone이다. 복제본의 `origin`은 로컬 원본을 가리키므로 이를 제출 저장소 URL로 사용하지 않는다.

### 같은 최종 커밋을 식별하는 방법

이 문서에 자기 커밋 해시를 넣으면 문서 변경으로 해시가 다시 바뀐다. 따라서 위의 **실제 최초 시험 커밋**과 **문서가 포함된 제출 커밋**을 구분한다. 제출할 40자리 해시는 문서 커밋 후 `git rev-parse HEAD`의 실제 출력으로 기록한다. 최종 커밋은 같은 복제본에서 다시 checkout하고 시험한다. 최종 해시·명령 결과는 프로젝트 밖의 `stage22/final-verification.json`과 작업 완료 보고에 남긴다. 그 파일은 자동 제출하지 않는다.

아래 13~21단계 표는 최초 시험 커밋에서 관찰한 범위다. 서로 다른 커밋의 성공을 합쳐 전체 재현 완료로 표시하지 않는다. 문서 커밋 이후에도 실행 코드가 같다는 것은 다음 Git 객체 ID로 대조하고, 최종 커밋의 실제 시작·재시작 결과는 별도 확인한다. 이 원문 기록만으로 최종 커밋 실행 성공을 자동 인정하지 않는다.

| 실행 원문 | 최초 시험 커밋의 Git 객체 ID |
|---|---|
| `on-client/student` | `10a2f5342bccb00a3835ae3cd2b94205a379dc24` |
| `on-client/src` | `ced448585009bc5d9752eb70b2d1313918c79910` |
| `on-client/public` | `8f340762d85d0733fa5800dd6ea607f32bc6d0e6` |
| `on-client/tools` | `071a9732bfd4622e1a79eda16e852f1230734a23` |
| `on-client/vendor` | `03b2a67c3de5ec73f7eb48e8aea97020b34ae71b` |
| `on-client/package.json` | `76c43cca95d9cb847af1d5add2d2f6a5ca2fb0a2` |

## 2. 실제 수행 절차와 관찰

다음 명령은 저장소 최상위에서 시작하는 이동 가능한 예시다. `$sourceRepo`는 보존할 기존 Git 최상위, `$destination`은 프로젝트 밖의 **존재하지 않는 새 폴더**의 실제 위치로 지정한다. 다른 PC의 절대경로를 문서 값으로 고정하지 않는다. 아래 변수 값 지정 자체는 사용자 환경에 맞춰 해야 한다.

```powershell
$sourceRepo = (Get-Location).Path
$destination = Read-Host '프로젝트 밖의 새 복제 폴더 전체 경로'
if (Test-Path -LiteralPath $destination) { throw '새 폴더를 지정하세요.' }
git clone --no-hardlinks --no-checkout -- $sourceRepo $destination
if ($LASTEXITCODE -ne 0) { throw '복제 실패: 다음 명령을 실행하지 마세요.' }
git -C $destination checkout --detach 8c47867daa3ccf9830b6f58a2dad88fb50bf16f8
Set-Location -LiteralPath (Join-Path $destination 'on-client')
node --version
npm run check
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 -Port 5191 -Background
```

이는 기록된 최초 시험 커밋의 재현 명령이다. 최종 제출본을 재현할 때는 checkout의 값을 실제 최종 40자리 커밋으로 바꾼다. 원격 저장소에 그 커밋이 존재하는 것을 별도로 확인했다면 `git clone https://github.com/seokgw/defence-agent.git`을 사용할 수 있다. 이번에는 원격 clone을 실행하지 않았다.

| 시각(KST) | 절차 | 실제 관찰·근거 |
|---|---|---|
| 16:13:02까지 | 새 폴더 clone, checkout, 버전·구문 확인, 시작 | 지정 40자리 HEAD와 깨끗한 clone 상태 확인. `npm run check` 종료 0. 계정 연결 준비 완료와 서버 시작 메시지 출력 |
| 16:13:13 | 브라우저 첫 진입 | 세 메뉴와 제공/학생 영역 표시. 엔진 `disconnected`; 로그인·기기·세션에 연결 실패 안내. AI 점검 전, OSV 조회 전 |
| 16:13:50 | 「설치 패키지 조회」 | `조회 준비 미완료 (not_configured)`, 표시할 패키지 결과 없음. 공개 조회 설정이 없어 실제 OSV 요청 성공으로 세지 않음 |
| 16:13~16:14 | 「업무 앱」「보안 기록」 선택 | 앱·기록 연결 실패 안내. 앱 판정은 요청 전, 사건 설명은 사건 선택 전, 조치는 `idle` 미실행 |
| 16:14:29까지 | 진단용 node 종료 후 같은 명령으로 재실행 | 시작 도구가 안내한 PID의 실행 파일·복제본 서버 경로를 확인한 뒤 해당 node만 종료. 5191 리스너 해제 확인. 재시작 HTTP 200 |
| 16:14:29까지 | 재시작 후 로컬 API 응답에서 허용 필드만 수집 | me/apps/events/devices/sessions: `ok:false`, `mode:disconnected`, `ENGINE_NOT_CONNECTED`. vulnerabilities: `ok:true`, `data.status:not_configured` |
| 16:14 이후 | 재시작 후 브라우저 새로고침 | 세 메뉴 유지. 엔진 미연결, 계정 확인 전·AI 점검 전·OSV 조회 전으로 초기 표시 |

종료는 21단계 설명서의 기본 전경 실행·Ctrl+C 대신, 제공 도구가 지원하는 `-Background`의 안내에 맞춰 해당 PID만 종료했다. **전경 실행 창의 Ctrl+C 동작은 이번 시험에서 미확인**이다. 5189의 기존 서버나 다른 node를 종료하지 않았다. 시험 종료 후 이 작업에서 만든 서버만 정리한다.

## 3. 13~21단계 결과

표의 결과는 전체 단계 통과가 아니다. 시각은 위 최초 시험 커밋의 관찰이며, 학생 직접 확인은 모든 행에서 미확인이다. 예제(demo) 실행과 모의 입력 시험을 이번 작업에서 수행하지 않았다. 앞 대화의 AI verified 결과를 이 새 폴더 결과로 가져오지 않는다.

| 단계·현재 함수/문서 | 확인한 기능·입력 | 결과 | 확인 시각(KST)·근거 | 미확인 원인·범위 |
|---|---|---|---|---|
| 13 `renderIdentity` | `{me,devices,sessions}`와 세 메뉴 | 연결 없음. 메뉴와 실패 표시 확인 | 16:13:13 화면, 16:14:29 API `ENGINE_NOT_CONNECTED` | 실제 계정·기기·세션 자료는 SDP 설정 없음 |
| 14 `renderDecision` | `{status,mode,data,error,appId}` | 연결 없음. 요청 전 안내 확인 | 16:13~16:14 「업무 앱」 화면 | 앱 목록 없음. allow/deny/challenge/unknown 판정 재현 미확인 |
| 15 `renderEvents` | `{status,mode,data,error}` | 연결 없음. 기록 실패 표시 확인 | 16:13~16:14 「보안 기록」 화면 | 실제 사건, 필터·근거·상세, XDR 전달 미확인 |
| 16 `renderStatus` | `{devices,sessions,notifications,diagnostics,mode}` | 연결 없음. 실패 알림과 수동 재시도 안내 확인 | 16:13:13 보호 현황·학생 상태 | 도움정보 복사, 정상 빈 자료, 미지원 조치의 개별 분기 미확인 |
| 17 `renderAiConnection` | `{status,mode,data,error,checkedAt}` | 확인 불가. AI 점검 전 표시만 확인 | 16:13:13 및 재시작 후 화면 | 새 폴더 로그인·앱 승인·Vault 저장·verified 미실행 |
| 18 `renderExplanation` | `{event,explanation,checkedAt}` | 확인 불가. 사건 선택 전 안내 확인 | 16:13~16:14 보안 기록 화면 | 사건 없음. 유료 설명 요청·근거 검증의 동작 시험 미실행 |
| 19 `renderAction` | receipt/observation 등 제공 계약 | 확인 불가. `idle`과 집행 버튼 비활성 확인 | 16:13~16:14 보안 기록 화면 | 실제 집행 미준비. prepare/execute/result 요청 및 효과 관측 미실행 |
| 20 `renderVulnerabilities` | `{status,mode,data,error}` | 설정 미완료. `not_configured` 표시 확인 | 16:13:50 화면, 16:14:29 로컬 API | `complete`/`partial`/패키지 결과·취소·실제 OSV 조회 미확인 |
| 21 학생 실행 설명서·구성도 | README, `docs/STUDENT_CODEX_RUNBOOK.md`, `docs/STUDENT_RUNBOOK.md` | 부분 재현. 별도 폴더 시작·종료·재시작 및 주요 메뉴 확인 | 16:13~16:14 명령·화면 | 권장 Node 24.19.0·전경 Ctrl+C·새 PC 재현 및 학생 직접 확인 미확인 |

현재 원문에는 취약점 결과 표시 함수가 구현돼 있다. 구현 존재와 전체 상태 분기 실행 검증은 구분한다. 이번에는 학생 코드나 제공 서버·public/app.js·인증 설정을 고치지 않았다.

## 4. 이동 가능한 구성과 설정

- Git clone에 포함된 `on-client/package.json`, `student/`, `public/`, `src/`, `tools/`, `vendor/`, 학생 문서와 비밀 없는 `.env.example`를 함께 보존한다. 하드코딩한 개인 PC 경로를 실행 필수값으로 추가하지 않는다.
- 21단계 설명서의 현재 PC 경로는 설치 위치의 예시다. 이동 후에는 새 clone의 `on-client`에서 상대 경로로 실행한다.
- 제공 시작 도구가 새 프로젝트 위치에 맞는 별도 Native 설정을 생성했다. 기존 `native.json`, registry, Vault 내용을 새 폴더에 복사하지 않았다. 이 생성 성공은 승인·자격증명 저장 성공이 아니다.
- `.env.example` 복사만으로 환경변수가 로드되지 않는다. 현재 코드에는 `.env` 자동 로더가 없다. 승인된 SDP·AI·공개 패키지 설정의 실제 값은 담당자 설정 경로에서만 관리하고 문서·Git에 넣지 않는다.
- 이번 시험에는 SDP 설정, 공개 패키지 허용 목록, 실제 조치 설정을 주입하지 않았다. 따라서 엔진 미연결과 패키지 조회 미설정은 관찰된 지원 범위다.
- 같은 Windows 사용자 프로필·설치 Node·Git·브라우저를 재사용했다. 새 폴더 격리는 확인했지만 완전히 깨끗한 기기 시험은 아니다.

## 5. 데이터 보존·백업·복원 계획

이 절은 **계획과 제한**이다. 실제 데이터 복원 시험을 했다고 주장하지 않는다.

| 대상 | 보존·백업 | 복원 절차·제한 |
|---|---|---|
| 학생 코드·문서·Git 기록 | 원본을 보존하고 별도 clone. 로컬 미커밋 변경이 있으면 diff와 파일을 먼저 확인하고 별도 비공개 백업에 보존. 이번 시작 시 미커밋 변경 없음 | 새 폴더에 지정 커밋 checkout 후 `npm run check`와 시작 시험. clone은 미추적·미커밋 파일을 자동 보존하지 않음 |
| 비밀 없는 설정 견본 | `.env.example`와 제공 설정 설명을 Git에 보존 | 새 위치에 맞춰 담당자의 승인된 설정을 별도 준비. 실제 비밀값·개인 설정 파일은 원문 묶음에서 제외 |
| Native registry·Vault·인증 상태 | 원본 사용자 폴더의 자료는 그대로 유지. 읽어서 문서로 옮기거나 제출하지 않음. 별도 비공개 백업이 필요하면 서버 정지 후 담당자가 승인한 접근 제한·암호화 백업 방식으로 관리 | helper는 DPAPI `CurrentUser`와 프로젝트·컨텍스트 및 ACL을 검증하므로 파일 복사만으로 다른 PC/계정/경로에서 복원된다고 보장하지 않음. 새 환경은 공식 로그인·승인을 다시 진행하며, 원본 복원도 담당자 확인과 연결 재검증 필요 |
| 서버 메모리의 진행·점검 상태 | 앱 재시작 전에 필요한 비밀 없는 관찰 결과만 기록 | 재시작으로 진행 상태가 초기화될 수 있음. 화면의 이전 표시를 저장 완료·권한 유효성으로 대신하지 않음 |
| 보안 엔진의 기기·세션·사건과 조치 이력 | 원천 시스템 소유 데이터로 취급. 로컬 화면 결과를 원천 DB 백업으로 간주하지 않음 | 이 앱에는 해당 원천 데이터의 백업·복원 도구가 제공된 것으로 확인되지 않음. 담당 시스템 절차가 필요하며 이번에 실행하지 않음 |

복원 뒤에는 원문 커밋, 실행 환경, 서버 응답, 로그인/AI 권한과 원천 데이터 접근을 순서대로 재검증한다. 실패 시 기존 백업을 덮어쓰거나 grant를 자동 회수하지 않는다. 초기 Vault ACL 문제의 과거 진단은 새 환경 저장 성공의 증거가 아니므로 이 시험에서도 Vault 재연결은 미확인으로 둔다.

## 6. 학생 직접 확인과 다음 순서

**확인 1만 먼저 진행:** 기존 `코덱스-agent` 폴더가 남아 있고 이전 Git 기록과 학생 코드가 보존됐는지 확인한다. Codex가 수행한 위 명령·브라우저 관찰과 학생 본인의 확인을 구분한다.

| 학생 확인 | 결과 | 시각·진술 |
|---|---|---|
| 확인 1: 기존 폴더·기록 보존 | 미확인 | 학생 직접 확인 진술 대기 |
| 확인 2: 완료 범위와 미완료 항목 확인 | 미확인 | 확인 1 후 진행. 실제 집행 등 미완료가 남은 상태를 완료로 바꾸지 않음 |

서버 AI의 원문 검토는 새 환경 실행 인증이 아니다. 22단계 통과를 받더라도 운영 인증이나 v1.0 자동 인증으로 쓰지 않는다. 제출·원문 전달 절차는 21단계 학생 문서를 따른다. 이번 작업에서 push, 과제 제출, 원문 도구 실행·업로드를 하지 않는다.
