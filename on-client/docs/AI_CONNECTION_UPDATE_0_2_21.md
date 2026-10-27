# AI 연결 0.2.21 업데이트와 실제 재검증

확인일: 2026-10-27(KST). 이전 누적 커밋 dbed6d3ebff4a59f8376aea3a309425bd19e9037에서 시작했다. 공식 안내: https://aleph-workbench-downloads.vercel.app/alekov-connect-0.2.21.html

## 변경 범위와 보존

- 제공 시작 틀 0.2.19 → 0.2.21. ZIP과 도구의 공개 SHA-256을 검증했다.
- 공식 미리보기 결과 DRY_RUN_READY 후 -Apply로 적용했다. 결과 UPDATED, 백업 번호 20261027-094348-f8670d.
- 변경된 제공 파일 7개: .on-starter-manifest.json, README.md, package.json, public/ai-connect.mjs, src/ai/connection.mjs, tools/app-credentials.ps1, tools/package-app-support.mjs.
- 각 변경 파일을 공식 ZIP과 바이트 해시로 대조했다. 임시 진단 코드를 심거나 제공 검증기를 수정하지 않았다.
- student 폴더 파일들의 적용 전후 SHA-256이 모두 일치했다. 「내 PC 확인」만 남긴 UI, 기존 8개 렌더러, 아이콘을 보존했다. 인증 자료를 복사·삭제하지 않았다.

## 수정 내용을 현재 소스에서 확인

- app-credentials.ps1의 권한 읽기는 모듈 자동 로드가 필요한 Get-Acl 대신 Directory/File.GetAccessControl을 사용한다.
- WithLockRetry는 공유·잠금 위반의 HRESULT에만 적용한다. 총 시도 최대 8회, 시도 사이 250ms이며 매 시도 직전에 기한을 확인한다. 연결 승인·grant 교환을 자동 재시도하는 기능이 아니다.
- 고정 실패 코드를 ALEKOV_VAULT_FILE_LOCKED, ALEKOV_VAULT_ACCESS_DENIED, ALEKOV_VAULT_DPAPI_FAILED, ALEKOV_VAULT_COMPILE_BLOCKED 등으로 분리한다. 예외 원문·개인 경로·자격 값은 오류 응답에 넣지 않는다.
- package-app-support.mjs에는 제공 파일의 혼합 줄바꿈으로 원문 동등성을 확인하지 못하던 문제의 공식 수정도 포함됐다. 이번 AI 재검증에서는 재포장을 실행하지 않았다.

## 이번에 실제 수행한 순서

1. 현재 5189 설치본을 보존하고 원래 프로젝트에서 제공 도구로 별도 포트 5190을 실행했다.
2. 명령: on-client에서 powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1 -Port 5190 -Background.
3. 기존 서버 로그인 세션이 없어 계정 연결 시작 → 공식 포털 번호 확인 → 로그인 확인 완료로 재연결했다.
4. AI 연결 시작 → 공식 승인 화면의 확인번호·프로젝트 일치와 기존 등록 상태 확인 → 연결 재승인 → 승인했으며 연결 확인을 한 번 수행했다.
5. 화면에서 「연결이 완료됐습니다」를 확인한 뒤 현재 API 연결 점검을 수행했다.
6. AI 점검은 verified, 응답 모델 수 1. 서버 점검 시각 2026-10-27T00:49:27.931Z(09:49:27 KST).
7. 원래 프로젝트의 Vault에서 .credential 파일 1개, 수정 시각 2026-10-27T00:48:25.7683949Z를 메타데이터로 확인했다. 암호화된 파일 내용은 읽지 않았다. 루트 .json 메타데이터 파일을 자격 저장 파일로 계산하지 않았다.

## ACK와 컨텍스트 확인의 증거 수준

| 항목 | 확인 결과 | 근거·제한 |
|---|---|---|
| connector.complete 결과 | connected 전환 확인 | 앱의 실제 연결 완료 표시. 내부 반환 객체나 private handle을 출력하지 않음 |
| persistCredential 저장 | 이번 시도에서 저장 구간 통과 | 새 .credential 수정 시각과 이후 verified 모델 목록 응답 |
| vaultAck | connected가 되려면 true여야 하는 조건을 충족한 것으로 간접 확인 | manager.mjs가 result.ok와 vaultAck를 확인한 뒤에만 최종 컨텍스트 검증·connected를 수행. 내부 값 자체를 별도 로그로 읽지는 않음 |
| Native Host 컨텍스트 연속성 | 이번 연결에서 검증 오류 없이 완료 | 저장 전후 current 및 최종 read/assertNativeHostOperation을 통과해야 하는 실제 코드 경로와 완료 표시를 대조. 모든 경합 조건을 재현한 것은 아님 |
| AI 권한·모델 목록 | verified / 1 | 실제 브라우저 점검 결과 |
| SDP 엔진 | disconnected | 설정 미제공. AI 성공과 별도이며 SDP 연결을 합성하지 않음 |

이전 증상의 원인 설명은 전달받은 배포 안내 및 이번에 읽은 공식 수정과 구분한다. 이번 성공만으로 과거 실패가 모듈 로드와 백신 잠금 중 어느 하나 때문이었는지를 따로 재현해 증명한 것은 아니다.

## 확인한 검사와 미확인 범위

- npm run check 통과. 변경된 JavaScript 파일의 node --check와 PowerShell 파서 확인을 수행한다.
- 실제 승인 후 저장·연결 완료·verified 점검을 확인했다. 새 빈 Vault·새 PC·다른 계정 및 백신 잠금·권한 거부·암호화·컴파일 실패를 각각 강제 재현하지 않았다.
- 유료 사건 설명 생성, 보안 조치 집행, grant 회수, 강제 connected, 단계 제출을 실행하지 않았다.
- 설치된 기존 앱은 별도 서명 실행 환경의 0.2.19 내 PC 점검 모드로 보존했다. 프로젝트 소스 업데이트만으로 설치본이나 바탕화면 바로가기가 0.2.21로 바뀐 것은 아니다.
- 5190의 원래 프로젝트는 계정·AI 연결 화면을 제공한다. 설치본의 연결 활성화와 공식 실행 환경 업데이트는 별도 운영 절차가 필요하다.
- 최신 안내는 마무리 과제를 정규 과제의 저장소 URL·40자리 커밋으로 제출하며 파일 첨부는 선택이라고 명시한다. 과거 포장 네 파일 안내를 현재 필수 제출 조건으로 추가하지 않는다. 이번 작업은 제출을 수행하지 않는다.

비밀값·사용자 식별정보·확인번호·private handle은 학생 문서와 증거 파일에 기록하지 않는다. 저장한 증거는 단계 성공 여부·고정 오류 코드·버전·시각·모델 수와 암호화 파일 개수만 포함한다.