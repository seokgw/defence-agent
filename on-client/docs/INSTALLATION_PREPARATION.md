# 코덱스 설치 준비·재현 안내

2026-10-26. 선택한 방식은 「과정 포장 묶음과 바로가기」다. setup.exe, 유료 서명, 스토어 등록은 추가하지 않는다.

## 이번에 확인한 준비

- 공식 배포 페이지 `https://aleph-workbench-downloads.vercel.app/alekov-runtime-r7.html`에서 `ALEPH_KESHEV_0.2.19_R7.zip`을 프로젝트 밖에 받았다.
- 공개 ZIP SHA-256과 MANIFEST.json의 파일 크기·SHA-256을 모두 대조했다.
- 공식 `runtime/install-alekov-runtime-0.2.19.ps1`의 미리보기에서 `DRY_RUN_READY`, 적용에서 `INSTALLED`, revision 7을 확인했다. 승인 host와 실행 환경 캐시를 공식 도구로 준비했으며 새 키·계정·AI·SDP 권한을 발급하지 않았다.
- 학생 아이콘은 `student/create-icon.mjs`로 그린 256×256·8비트 RGBA·비인터레이스 PNG다. `student/appearance.json`의 `icon`을 `brand-icon.png`로 지정했다. 인터넷 이미지나 다른 회사 상표를 사용하지 않았다.
- 학생 구문 검사와 대시보드 모의 회귀 검사는 통과했다.

이전 총공세 기록의 PROVIDED_RUNTIME_NOT_INSTALLED는 당시 관찰이다. 위 준비가 끝난 뒤 패키지·설치는 아래 순서로 따로 확인한다. R7 설치 성공만으로 코덱스 설치·기동·계정 연결 성공을 주장하지 않는다.

## 포장·설치 순서

1. 기존 프로젝트의 학생 코드·아이콘·문서를 커밋하고 Git 작업 트리가 깨끗한지 확인한다.
2. on-client에서 제공 도구를 사용한다. `$output`은 프로젝트 밖의 아직 없는 새 폴더 전체 경로로 지정한다. 이 예시는 변수 값을 임의로 채우지 않는다.

```powershell
npm run package-app -- --source . --out $output --finish-materials
```

3. 생성된 APP_PACKAGE_MANIFEST.json, INSTALL.md와 package-app의 실제 출력 해시를 확인한다. app.zip·runtime.zip·finish.commit.raw·finish.archive.tar.gz는 같은 실행에서 생성된 자료만 사용한다.
4. **생성된 INSTALL.md의 명령**에 실제 새 설치 경로를 지정하고 -CreateDesktopShortcut으로 바탕화면 바로가기를 만든다. 이번에 선택한 설치 위치는 사용자 폴더 아래 Apps/코덱스이며 기존 경로·바로가기가 없음을 확인했다. 기존 설치나 원본 프로젝트를 덮어쓰지 않는다.
5. 새 코덱스 바로가기를 실행한다. 바로가기는 `.aleph-alekov-host/start-installed-normal-app.ps1`을 통해 승인된 서명·파일을 검사한다. 설치 폴더의 개발 실행 도구로 바꿔 켜지 않는다.
6. 앱 이름·아이콘·학생 대시보드와 내 PC 조회를 확인한다. SDP 설정이 없으면 「내 PC 점검 모드」이며 로그인·AI·SDP 연결 성공이 아니다.
7. 바로가기의 실행 창에서 종료하고 다시 같은 바로가기로 켜 재현 여부를 확인한다. 개발 서버가 5189를 쓰면 그 서버를 먼저 종료한다. 다른 프로그램은 종료하지 않는다.

실제 패키지 경로·커밋·manifest 해시·설치·기동 결과는 프로젝트 밖의 설치 확인 증거와 생성된 INSTALL.md로 구분해 보관한다. 아직 생성되지 않은 설치 결과를 이 준비 안내에 성공으로 미리 적지 않는다. 최종 제출·업로드는 별도이며 이번 설치 요청에 포함하지 않는다.