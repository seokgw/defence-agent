// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions }) {
      const root = document.createElement('section');
      root.className = 'student-identity';

      const makeElement = (tag, text, className) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        node.textContent = text;
        return node;
      };
      const appendMode = (section, resource) => {
        const labels = {
          connected: '연결됨 (connected)',
          demo: '예제 자료 (demo)',
          disconnected: '연결 없음 (disconnected)',
          unknown: '확인 불가 (unknown)',
        };
        const mode = labels[resource?.mode] ? resource.mode : 'unknown';
        section.append(makeElement('p', labels[mode], 'student-identity-mode'));
      };
      const statusLabel = (kind, value) => {
        const labels = kind === 'device'
          ? { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' }
          : { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
        const code = typeof value === 'string' ? value : 'unknown';
        const label = Object.hasOwn(labels, code) ? labels[code] : '확인 불가';
        return `${label} (${code})`;
      };
      const errorMessage = (resource) => {
        const message = typeof resource?.error?.message === 'string' ? resource.error.message : '오류 내용을 확인할 수 없습니다.';
        return ['CONTRACT_MISMATCH', 'ENGINE_RESULT_UNVERIFIED'].includes(resource?.error?.code)
          ? `확인 불가: ${message}`
          : `연결 실패: ${message}`;
      };
      const addResourceSection = (title, resource, renderData) => {
        const section = document.createElement('section');
        section.append(makeElement('h3', title));
        appendMode(section, resource);

        if (resource?.status === 'loading') {
          section.append(makeElement('p', '불러오는 중'));
        } else if (resource?.status === 'error') {
          section.append(makeElement('p', errorMessage(resource), 'student-identity-error'));
        } else if (resource?.status === 'ok') {
          renderData(section, resource.data);
        } else {
          section.append(makeElement('p', '확인 불가'));
        }

        root.append(section);
      };

      addResourceSection('계정·현재 기기·로그인 세션', me, (section, data) => {
        const user = data?.user;
        const device = data?.device;
        const session = data?.session;
        section.append(makeElement('p', `사용자: ${user?.label ?? '확인 불가'} · ID: ${user?.id ?? '확인 불가'}`));
        section.append(makeElement('p', `현재 기기: ${device?.label ?? '확인 불가'} · ID: ${device?.id ?? '확인 불가'} · ${statusLabel('device', device?.status)}`));
        section.append(makeElement('p', `로그인 세션: ID ${session?.id ?? '확인 불가'} · ${statusLabel('session', session?.status)}`));
      });

      addResourceSection('내 기기 목록', devices, (section, data) => {
        if (!Array.isArray(data) || data.length === 0) {
          section.append(makeElement('p', '표시할 기기가 없습니다.'));
          return;
        }
        const list = document.createElement('ul');
        for (const device of data) {
          const item = document.createElement('li');
          item.textContent = `${device?.label ?? '확인 불가'} · ID: ${device?.id ?? '확인 불가'} · ${statusLabel('device', device?.status)}`;
          list.append(item);
        }
        section.append(list);
      });

      addResourceSection('내 세션 목록', sessions, (section, data) => {
        if (!Array.isArray(data) || data.length === 0) {
          section.append(makeElement('p', '표시할 세션이 없습니다.'));
          return;
        }
        const list = document.createElement('ul');
        for (const session of data) {
          const item = document.createElement('li');
          item.textContent = `ID: ${session?.id ?? '확인 불가'} · ${statusLabel('session', session?.status)}`;
          list.append(item);
        }
        section.append(list);
      });

      return root;
    },
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
