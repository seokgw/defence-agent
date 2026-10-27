# 코덱스 디자인과 Windows 설치 파일

## 무료로 진행하는 범위

방어전 화면의 참고사항과 설치 방식 안내를 2026-10-27에 확인했다.
학생 화면은 제공된 appearance 계약과 CSS 클래스를 사용하며, 외부 유료 템플릿이나 이미지를 추가하지 않는다.
Inno Setup은 무료로 사용할 수 있는 설치 파일 제작 도구다. 코드 서명과 스토어 등록은 이번 작업에 포함하지 않는다.

## 학생 화면 변경

- student/appearance.json: compact 배치, 남색 강조색과 밝은 배경.
- student/create-icon.mjs 및 student/assets/brand-icon.png: 코드로 생성한 기존 아이콘의 강조색 변경.
- student/extension.mjs: 기존 영역을 카드로 묶고 기존 버튼 스타일과 텍스트 상태 표시를 통일.
- AI의 verified, test, unverified 및 오류를 구분한다. test를 실제 연결 검증 성공으로 표시하지 않는다.
- 공식 「내 PC 확인」 하나를 유지한다. 별도 중복 조회 버튼을 추가하지 않는다.
- 함수 계약, data-* 속성, 버튼 이름과 처리 함수는 유지한다.

## 확인 결과와 한계

2026-10-27 현재 소스에서 npm run check 통과.
변경 전후 34개 모의 렌더링 사례에서 표시 문구, 버튼 이름, data-* 속성을 비교해 일치를 확인했다.
모의 렌더링은 실제 AI·보안 엔진 연결 성공의 증거가 아니다.
실제 로컬 브라우저에서 내 PC 확인을 눌러 PC 측정 결과 표시를 확인했다.
화면의 보안 서버 연결 없음과 AI 점검 전은 각각의 상태이며, PC 측정 성공으로 외부 연결 성공을 추정하지 않는다.

## 포장 경계

공식 npm run package-app 결과를 보존하고 별도 설치 파일 재료로 복사한다.
앱 소스 버전 0.2.21과 승인된 설치 실행 호스트의 버전은 독립적이다.
이 PC의 승인된 R7 실행 호스트는 SDP 설정이 없는 경우 내 PC 점검 모드로 실행한다.
설치 파일을 만든다고 이 조건이 바뀌거나 AI 연결이 자동 활성화되는 것은 아니다.
기존 프로젝트·인증 자료·설치 폴더를 덮어쓰지 않는다.

사용자가 라이선스에 동의한 뒤 공식 Inno Setup 6.7.3 컴파일러를 사용자 전용 도구 폴더에 설치했다.
setup.exe 생성, 새 경로 설치·실행·제거와 SHA-256 기록은 아직 완료하지 않았다.
빌드: powershell -NoProfile -ExecutionPolicy Bypass -File .\student\installer\build-setup.ps1 -PackageDir <공식_패키지_폴더> -Compiler <ISCC.exe_경로> -OutputDir <새_출력_폴더>
