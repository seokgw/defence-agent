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
    renderDecision({ status, mode, data, error, appId }) {
      const root = document.createElement('section');
      root.className = 'student-decision';

      const addText = (text, className) => {
        const paragraph = document.createElement('p');
        if (className) paragraph.className = className;
        paragraph.textContent = text;
        root.append(paragraph);
      };

      if (status === 'idle') {
        addText('앱을 골라 접속을 요청하세요.');
      } else if (status === 'loading') {
        addText('판정 확인 중');
      } else if (status === 'error') {
        const message = typeof error?.message === 'string' && error.message
          ? error.message
          : '오류 내용을 확인할 수 없습니다.';
        addText(`요청 실패: ${message}`, 'student-decision-error');
        addText('이것은 접근 거부 판정이 아닙니다.');
      } else if (status === 'ok') {
        const labels = {
          allow: '접근 허용',
          deny: '접근 거부',
          challenge: '추가 인증 또는 확인 필요',
          unknown: '판정 확인 불가',
        };
        const receivedDecision = typeof data?.decision === 'string' ? data.decision : 'unknown';
        const decision = Object.hasOwn(labels, receivedDecision) ? receivedDecision : 'unknown';
        const displayAppId = typeof data?.appId === 'string' && data.appId
          ? data.appId
          : typeof appId === 'string' && appId
            ? appId
            : '확인 불가';
        const reason = typeof data?.reason === 'string' && data.reason
          ? data.reason
          : '확인 불가';
        const checkedAt = typeof data?.checkedAt === 'string' && data.checkedAt
          ? data.checkedAt
          : '확인 불가';

        addText(`업무 앱 ID: ${displayAppId}`);
        addText(`접근 판정: ${labels[decision]} (${decision})`, decision === 'deny' || decision === 'unknown' ? 'student-decision-unavailable' : undefined);
        if (decision === 'allow') {
          addText('정책상 접근 허용이며 실제 앱 접속 성공을 보장하지 않습니다.');
        } else if (decision === 'challenge') {
          addText('이 앱은 추가 인증 또는 확인 절차를 대신 수행하지 않습니다.');
        } else if (decision === 'unknown') {
          addText('판정을 허용으로 간주하지 마세요.', 'student-decision-unavailable');
        }
        addText(`판정 이유: ${reason}`);
        addText(`판정 시각: ${checkedAt}`);
      } else {
        addText('판정 확인 불가 (unknown)', 'student-decision-unavailable');
        addText('허용으로 간주하지 마세요.', 'student-decision-unavailable');
      }

      return root;
    },
    renderEvents({ status, mode, data, error }) {
      const root = document.createElement('section');
      root.className = 'student-events';
      const addText = (parent, tag, text, className) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        node.textContent = text;
        parent.append(node);
        return node;
      };
      const showState = (kind, value) => {
        const labels = {
          access: { allowed: '허용됨', denied: '거부됨', unknown: '확인 불가' },
          session: { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' },
          device: { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' },
        };
        const code = typeof value === 'string' && Object.hasOwn(labels[kind], value) ? value : 'unknown';
        return `${labels[kind][code]}(${code})`;
      };
      const displayMessage = (value) => typeof value === 'string' && value.length > 0
        ? value
        : '오류 내용을 확인할 수 없습니다.';

      if (status === 'loading') {
        addText(root, 'p', '불러오는 중', 'student-events-loading');
        return root;
      }
      if (status === 'error') {
        if (['CONTRACT_MISMATCH', 'ENGINE_RESULT_UNVERIFIED'].includes(error?.code)) {
          addText(root, 'p', `확인 불가: ${displayMessage(error?.message)}`, 'student-events-unverified');
        } else {
          addText(root, 'p', `기록을 불러오지 못했습니다: ${displayMessage(error?.message)}`, 'student-events-error');
        }
        return root;
      }
      if (status !== 'ok' || !Array.isArray(data)) {
        addText(root, 'p', '확인 불가: 기록 응답을 확인할 수 없습니다.', 'student-events-unverified');
        return root;
      }

      // 서버가 전달한 배열은 복사해 정렬한다. 원본 기록과 순서는 바꾸지 않는다.
      const events = [...data].sort((left, right) => Date.parse(right.at) - Date.parse(left.at));
      const filterBar = document.createElement('div');
      filterBar.className = 'student-event-filters';
      const listRegion = document.createElement('div');
      listRegion.className = 'student-event-list';
      const detailRegion = document.createElement('div');
      detailRegion.className = 'student-event-detail-region';
      const filters = { kind: 'all', appId: 'all', access: 'all' };

      const distinct = (values) => [...new Set(values)];
      const kindNames = { access: '접속 기록(access)', xdr: 'XDR 경보(xdr)' };
      const accessNames = {
        allowed: '허용됨(allowed)',
        denied: '거부됨(denied)',
        unknown: '확인 불가(unknown)',
      };
      const makeFilter = (key, labelText, id, values, names = {}) => {
        const label = document.createElement('label');
        label.htmlFor = id;
        label.textContent = labelText;
        const select = document.createElement('select');
        select.id = id;
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '전체';
        select.append(allOption);
        for (const value of values) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = names[value] || value;
          select.append(option);
        }
        select.value = filters[key];
        select.addEventListener('change', () => {
          filters[key] = select.value;
          detailRegion.replaceChildren();
          renderList();
        });
        filterBar.append(label, select);
      };

      makeFilter('kind', '기록 종류', 'student-event-kind-filter', distinct(events.map((event) => event.kind)), kindNames);
      makeFilter('appId', '업무 앱', 'student-event-app-filter', distinct(events.map((event) => event.appId).filter((appId) => typeof appId === 'string' && appId.length > 0)));
      makeFilter('access', '접속 상태', 'student-event-access-filter', distinct(events.map((event) => event.state?.access)), accessNames);
      root.append(filterBar, listRegion, detailRegion);

      const addDetailList = (detail, title, items, emptyText) => {
        addText(detail, 'h4', title);
        if (!Array.isArray(items) || items.length === 0) {
          addText(detail, 'p', emptyText);
          return;
        }
        const list = document.createElement('ul');
        for (const item of items) {
          const row = document.createElement('li');
          row.textContent = `${item?.id ?? '확인 불가'}: ${item?.text ?? '확인 불가'}`;
          list.append(row);
        }
        detail.append(list);
      };

      const showDetail = (event) => {
        detailRegion.replaceChildren();
        const detail = document.createElement('section');
        detail.setAttribute('data-student-event-detail', event.id);
        addText(detail, 'h3', `${event.id} 상세`);
        addText(detail, 'p', `사건 ID: ${event.id}`);
        addText(detail, 'p', `업무 앱 ID: ${event.appId || '앱을 확인할 수 없음'}`);
        addDetailList(detail, '근거', event.evidence, '근거가 없습니다.');
        addDetailList(detail, '규칙', event.rules, '규칙이 없습니다.');
        addText(detail, 'h4', '상태');
        addText(detail, 'p', `접속 상태: ${showState('access', event.state?.access)}`);
        addText(detail, 'p', `세션 상태: ${showState('session', event.state?.session)}`);
        addText(detail, 'p', `기기 상태: ${showState('device', event.state?.device)}`);
        detailRegion.append(detail);
      };

      function renderList() {
        listRegion.replaceChildren();
        const visibleEvents = events.filter((event) =>
          (filters.kind === 'all' || event.kind === filters.kind)
          && (filters.appId === 'all' || event.appId === filters.appId)
          && (filters.access === 'all' || event.state?.access === filters.access),
        );
        if (visibleEvents.length === 0) {
          addText(listRegion, 'p', events.length === 0 ? '표시할 기록이 없습니다.' : '필터 조건에 맞는 기록이 없습니다.');
          return;
        }

        const list = document.createElement('ul');
        for (const event of visibleEvents) {
          const row = document.createElement('li');
          row.setAttribute('data-student-event-id', event.id);
          const kind = kindNames[event.kind] || `확인 불가(${event.kind ?? 'unknown'})`;
          row.textContent = `사건 ID: ${event.id} · 시각: ${event.at} · 종류: ${kind} · 앱: ${event.appId || '앱을 확인할 수 없음'} · 요약: ${event.summary} `;
          const button = document.createElement('button');
          button.type = 'button';
          button.textContent = `${event.id} 상세`;
          button.addEventListener('click', () => showDetail(event));
          row.append(button);
          list.append(row);
        }
        listRegion.append(list);
      }

      renderList();
      return root;
    },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
