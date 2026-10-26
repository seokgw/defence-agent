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
        if (Array.isArray(event.supportedActions) && event.supportedActions.length > 0) {
          addText(detail, 'h4', '미지원 조치');
          for (const action of event.supportedActions) {
            const actionId = typeof action === 'string' ? action : '확인 불가';
            const button = document.createElement('button');
            button.type = 'button';
            button.textContent = `${actionId} 미지원`;
            button.disabled = true;
            button.setAttribute('aria-label', `${actionId} 미지원`);
            detail.append(button);
          }
          addText(detail, 'p', '아직 지원하지 않는 조치입니다. 조치 실행 연결은 준비 중입니다.');
        }
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
    renderStatus({ devices, sessions, notifications, diagnostics, mode }) {
      const root = document.createElement('section');
      root.className = 'student-status';
      const addText = (parent, tag, text, className) => {
        const node = document.createElement(tag);
        if (className) node.className = className;
        node.textContent = text;
        parent.append(node);
        return node;
      };
      const modeLabel = (value) => ({
        connected: '연결됨 (connected)',
        demo: '예제 자료 (demo)',
        disconnected: '연결 없음 (disconnected)',
        unknown: '확인 불가 (unknown)',
      })[value] || '확인 불가 (unknown)';
      const statusLabel = (kind, value) => {
        const labels = kind === 'device'
          ? { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' }
          : { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
        const code = typeof value === 'string' ? value : 'unknown';
        return `${Object.hasOwn(labels, code) ? labels[code] : '확인 불가'} (${code})`;
      };
      const getErrorMessage = (resource) => typeof resource?.error?.message === 'string' && resource.error.message
        ? resource.error.message
        : '오류 내용을 확인할 수 없습니다.';
      const isTimeout = (resource) => /TIMEOUT|시간\s*초과|초과됐/i.test(
        `${resource?.error?.code ?? ''} ${resource?.error?.message ?? ''}`,
      );
      addText(root, 'p', `실행 모드: ${modeLabel(mode)}`, 'student-status-mode');

      const addCollection = (title, resource, kind) => {
        const section = document.createElement('section');
        addText(section, 'h3', title);
        addText(section, 'p', `자료 모드: ${modeLabel(resource?.mode)}`, 'student-status-mode');
        if (resource?.status === 'loading') {
          addText(section, 'p', '불러오는 중', 'student-status-loading');
        } else if (resource?.status === 'error') {
          const subject = kind === 'device' ? '기기 정보' : '세션 정보';
          const message = getErrorMessage(resource);
          addText(section, 'p', isTimeout(resource)
            ? `${subject} 요청 시간 초과: ${message}`
            : `${subject}를 불러오지 못했습니다: ${message}`, 'student-status-error');
          addText(section, 'p', '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.');
        } else if (resource?.status === 'ok' && Array.isArray(resource.data)) {
          if (resource.data.length === 0) {
            addText(section, 'p', kind === 'device' ? '등록된 기기가 없습니다.' : '현재 연결이 없습니다.');
          } else {
            const list = document.createElement('ul');
            for (const item of resource.data) {
              const row = document.createElement('li');
              row.textContent = kind === 'device'
                ? `${typeof item?.label === 'string' ? item.label : '확인 불가'} · 상태: ${statusLabel('device', item?.status)}`
                : `세션 ID: ${typeof item?.id === 'string' ? item.id : '확인 불가'} · 상태: ${statusLabel('session', item?.status)}`;
              list.append(row);
            }
            section.append(list);
          }
        } else if (resource?.status === 'ok') {
          addText(section, 'p', kind === 'device' ? '기기 목록을 확인할 수 없습니다.' : '세션 목록을 확인할 수 없습니다.');
        } else {
          addText(section, 'p', '확인 불가');
        }
        root.append(section);
      };

      addCollection('등록 기기', devices, 'device');
      addCollection('현재 연결 세션', sessions, 'session');
      addText(root, 'p', '세션 목록은 현재 검증된 연결 하나를 대상으로 하며 과거 세션 전체 목록이 아닙니다.');

      const notificationSection = document.createElement('section');
      addText(notificationSection, 'h3', '알림');
      if (!Array.isArray(notifications)) {
        addText(notificationSection, 'p', '알림 자료를 확인할 수 없습니다.');
      } else if (notifications.length === 0) {
        addText(notificationSection, 'p', '주의할 알림이 없습니다.');
      } else {
        const list = document.createElement('ul');
        for (const notification of notifications) {
          const item = document.createElement('li');
          const code = typeof notification?.code === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(notification.code)
            ? notification.code
            : '확인 불가';
          item.textContent = `자료: ${typeof notification?.resource === 'string' ? notification.resource : '확인 불가'} · 코드: ${code} · 메시지: ${typeof notification?.message === 'string' ? notification.message : '확인 불가'}`;
          list.append(item);
        }
        notificationSection.append(list);
      }
      root.append(notificationSection);

      const diagnosticSection = document.createElement('section');
      addText(diagnosticSection, 'h3', '진단 정보');
      addText(diagnosticSection, 'p', `자료 모드: ${modeLabel(diagnostics?.mode)}`, 'student-status-mode');
      const diagnosticData = diagnostics?.status === 'ok' ? diagnostics.data : undefined;
      const safeDiagnostic = {
        requestId: typeof diagnosticData?.requestId === 'string' ? diagnosticData.requestId : '확인 불가',
        component: typeof diagnosticData?.component === 'string' ? diagnosticData.component : '확인 불가',
        version: typeof diagnosticData?.version === 'string' ? diagnosticData.version : '확인 불가',
        checkedAt: typeof diagnosticData?.checkedAt === 'string' ? diagnosticData.checkedAt : '확인 불가',
        engine: {
          mode: typeof diagnosticData?.engine?.mode === 'string' ? diagnosticData.engine.mode : '확인 불가',
          code: typeof diagnosticData?.engine?.code === 'string' ? diagnosticData.engine.code : '확인 불가',
        },
      };
      if (diagnostics?.status === 'loading') {
        addText(diagnosticSection, 'p', '진단 정보를 불러오는 중입니다.');
      } else if (diagnostics?.status === 'error') {
        addText(diagnosticSection, 'p', `진단 정보를 불러오지 못했습니다: ${getErrorMessage(diagnostics)}`, 'student-status-error');
        addText(diagnosticSection, 'p', '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요.');
      } else if (diagnostics?.status === 'ok') {
        addText(diagnosticSection, 'p', `요청 ID: ${safeDiagnostic.requestId}`);
        addText(diagnosticSection, 'p', `구성 요소: ${safeDiagnostic.component}`);
        addText(diagnosticSection, 'p', `버전: ${safeDiagnostic.version}`);
        addText(diagnosticSection, 'p', `확인 시각: ${safeDiagnostic.checkedAt}`);
        addText(diagnosticSection, 'p', `엔진 모드: ${safeDiagnostic.engine.mode}`);
        addText(diagnosticSection, 'p', `엔진 코드: ${safeDiagnostic.engine.code}`);
      } else {
        addText(diagnosticSection, 'p', '진단 정보를 확인할 수 없습니다.');
      }

      addText(diagnosticSection, 'p', '도움 요청에 사용할 비밀 없는 진단 항목만 복사합니다.');
      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.textContent = '도움정보 복사';
      copyButton.disabled = diagnostics?.status !== 'ok';
      const copyResult = addText(diagnosticSection, 'p', '');
      copyButton.addEventListener('click', async () => {
        if (diagnostics?.status !== 'ok') return;
        const copyText = JSON.stringify(safeDiagnostic, null, 2);
        try {
          if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            throw new Error('CLIPBOARD_UNAVAILABLE');
          }
          await navigator.clipboard.writeText(copyText);
          copyResult.textContent = '도움정보를 클립보드에 복사했습니다. 외부로 자동 전송하지 않습니다.';
        } catch {
          copyResult.textContent = '도움정보를 복사하지 못했습니다. 브라우저의 클립보드 권한을 확인하세요.';
        }
      });
      diagnosticSection.append(copyButton);
      root.append(diagnosticSection);
      return root;
    },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection({ status, mode, data, error, checkedAt } = {}) {
      const root = document.createElement('section');
      root.className = 'student-ai-connection';
      const addText = (text, className) => {
        const node = document.createElement('p');
        if (className) node.className = className;
        node.textContent = text;
        root.append(node);
      };
      const engineModes = {
        connected: '보안 이벤트 엔진: 연결됨 (connected)',
        demo: '보안 이벤트 엔진: 예제 자료 (demo)',
        disconnected: '보안 이벤트 엔진: 연결 없음 (disconnected)',
        unknown: '보안 이벤트 엔진: 확인 불가 (unknown)',
      };

      if (status === 'idle') {
        addText('AI 연결 점검 전', 'student-ai-connection-idle');
      } else if (status === 'loading') {
        addText('AI 연결 점검 중', 'student-ai-connection-loading');
      } else if (status === 'ok') {
        const authorization = data?.audienceAuthorization;
        if (authorization === 'test') {
          addText('시험 연결 점검(test)', 'student-ai-connection-ok');
        } else if (authorization === 'verified') {
          addText('AI 연결 정상 · 앱 권한 확인 후 점검(verified)', 'student-ai-connection-ok');
        } else {
          addText('연결 점검 결과 확인 불가 (unknown)', 'student-ai-connection-unverified');
        }
        const modelCount = Number.isInteger(data?.modelCount) && data.modelCount >= 0
          ? String(data.modelCount)
          : '확인 불가';
        addText(`응답 모델 수: ${modelCount}`);
        addText(`점검 시각: ${typeof checkedAt === 'string' && checkedAt ? checkedAt : '확인 불가'}`);
        addText('이 점검은 AI 연결과 모델 응답만 확인했습니다. 보안 이벤트 설명은 아직 실행하지 않았습니다.', 'student-ai-connection-separate');
      } else if (status === 'error') {
        const rawCode = error?.code;
        const code = typeof rawCode === 'string' && /^[A-Z][A-Z0-9_]{1,63}$/.test(rawCode)
          ? rawCode
          : 'AI_REQUEST_UNVERIFIED';
        const rawMessage = error?.message;
        const messageIsSafe = typeof rawMessage === 'string' && rawMessage.length > 0 && rawMessage.length <= 500
          && !/(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(rawMessage)
          && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(rawMessage);
        const message = messageIsSafe ? rawMessage : '안전한 오류 메시지를 확인할 수 없습니다.';
        addText(`AI 연결 점검 실패 · 오류 코드: ${code}`, 'student-ai-connection-error');
        addText(`오류 메시지: ${message}`, 'student-ai-connection-error');

        if (['ON_AI_PROVISIONING_PENDING', 'ON_AI_AUTHORIZATION_CHANGED', 'SUBJECT_SCOPE_UNVERIFIED'].includes(code)) {
          addText('담당자에게 계정 연결과 앱 권한 준비 상태를 확인해 달라고 요청하세요. 이는 학생의 잘못으로 표시되는 오류가 아닙니다.');
        } else if (code === 'WB_CLCO_AUTH_REQUIRED') {
          addText('계정 연결을 다시 확인하고, 계속되면 담당자에게 확인을 요청하세요. Workbench 열쇠를 복사하지 마세요.');
        } else if (code === 'WB_CLCO_ACCESS_BLOCKED') {
          addText('앱 사용 권한을 담당자에게 확인해 달라고 요청하세요.');
        } else if (['WB_CLCO_COHORT_BUDGET_EXHAUSTED', 'WB_CLCO_LIMIT_REACHED'].includes(code)) {
          addText('반 사용량 또는 이용 한도를 담당자에게 확인해 달라고 요청하세요.');
        } else if (code === 'WB_CLCO_SESSION_CLOSED') {
          addText('정해진 AI 이용 시간을 확인하세요.');
        } else if (['WB_CLCO_RATE_LIMITED', 'WB_CLCO_TIMEOUT', 'REQUEST_TIMEOUT', 'ENGINE_TIMEOUT', 'TIMEOUT', 'NETWORK_ERROR', 'WB_CLCO_NETWORK_ERROR'].includes(code)) {
          addText('요청 제한·시간 초과·네트워크 문제일 수 있습니다. 자동 재점검은 하지 않습니다. 잠시 뒤 사용자가 직접 다시 점검하세요.');
        } else if (['WB_CLCO_CANCELLED', 'CANCELLED', 'REQUEST_CANCELLED'].includes(code)) {
          addText('점검이 취소됐습니다. 이전 결과는 현재 결과가 아닙니다.');
        } else if (['ON_AI_MODEL_LIST_EMPTY', 'MODEL_NOT_CONFIGURED'].includes(code)) {
          addText('사용할 수 있는 모델이 없습니다. 담당자에게 모델 허용 설정을 확인해 달라고 요청하세요.');
        } else {
          addText('점검 원인을 확인할 수 없습니다. 연결과 권한 상태를 담당자에게 확인해 달라고 요청하세요.');
        }
        addText('다시 점검하려면 제공 화면의 「AI 연결 점검」 또는 「현재 API 연결 점검」 버튼을 직접 누르세요.');
      } else {
        addText('AI 연결 점검 상태를 확인할 수 없습니다. 성공으로 간주하지 마세요.', 'student-ai-connection-unverified');
      }

      addText(engineModes[mode] || engineModes.unknown, 'student-ai-connection-mode');
      addText('보안 이벤트 엔진 상태는 AI 연결 점검 결과와 별도입니다.', 'student-ai-connection-separate');
      return root;
    },
    renderExplanation({ event, explanation, checkedAt } = {}) {
      const root = document.createElement('section');
      root.className = 'student-explanation';
      const addText = (text, className) => {
        const node = document.createElement('p');
        if (className) node.className = className;
        node.textContent = text;
        root.append(node);
        return node;
      };
      const addHeading = (text) => {
        const heading = document.createElement('h3');
        heading.textContent = text;
        root.append(heading);
        return heading;
      };
      const safeCode = (value) => typeof value === 'string' && /^[A-Z][A-Z0-9_]{1,63}$/.test(value)
        ? value
        : 'AI_REQUEST_UNVERIFIED';
      const safeMessage = (value) => {
        const isSafe = typeof value === 'string' && value.length > 0 && value.length <= 500
          && !/(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(value)
          && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
        return isSafe ? value : '안전한 오류 메시지를 확인할 수 없습니다.';
      };
      const showFailure = (heading, message, code) => {
        addText(heading, 'student-explanation-error');
        if (code) addText(`오류 코드: ${safeCode(code)}`, 'student-explanation-error');
        if (message) addText(`오류 메시지: ${safeMessage(message)}`, 'student-explanation-error');
        addText('기록은 그대로입니다. 이 설명 실패는 과제 실패를 뜻하지 않습니다.');
      };
      const status = explanation?.status;

      // 요청 실패를 이벤트 선택 여부보다 먼저 표시해 event=null이어도 원인을 잃지 않는다.
      if (status === 'error') {
        showFailure('AI 설명 실패', explanation?.error?.message, explanation?.error?.code);
        return root;
      }
      if (!event) {
        addText('보안 기록에서 기록을 먼저 고르세요.');
        return root;
      }
      if (status === 'idle') {
        addText('AI 설명 요청 전입니다. 선택한 보안 기록에서 설명을 요청하세요.');
      } else if (status === 'loading') {
        addText('AI 설명 요청 중입니다.', 'student-explanation-loading');
      } else if (status === 'ok') {
        const eventId = typeof event.id === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(event.id)
          ? event.id
          : null;
        const data = explanation?.data;
        const failUnverified = (reason, code) => {
          showFailure('AI 설명을 사용할 수 없습니다.', reason, code);
        };
        if (eventId === null) {
          failUnverified('선택한 보안 기록의 ID를 확인할 수 없습니다.');
          return root;
        }
        if (data?.executed === true) {
          failUnverified('AI가 조치가 이미 실행됐다고 답했으므로 이 설명은 사용할 수 없습니다.', explanation?.error?.code);
          return root;
        }
        if (data?.executed !== false || data?.requiresHumanConfirmation !== true) {
          failUnverified('실행되지 않았고 사람 확인이 필요하다는 응답을 검증할 수 없습니다.', explanation?.error?.code);
          return root;
        }
        if (typeof data.summary !== 'string' || data.summary.trim().length === 0) {
          failUnverified('AI 요약이 없어 설명을 표시할 수 없습니다.', explanation?.error?.code);
          return root;
        }
        if (!Array.isArray(event.evidence) || event.evidence.length === 0) {
          failUnverified('근거가 없어 설명을 확인할 수 없습니다.');
          return root;
        }
        const evidenceById = new Map();
        for (const item of event.evidence) {
          if (!item || typeof item.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(item.id)
            || typeof item.text !== 'string' || evidenceById.has(item.id)) {
            failUnverified('현재 기록의 근거 자료 형식이 맞지 않습니다.');
            return root;
          }
          evidenceById.set(item.id, item.text);
        }
        const evidenceIds = data.evidenceIds;
        if (!Array.isArray(evidenceIds) || evidenceIds.length !== evidenceById.size
          || new Set(evidenceIds).size !== evidenceIds.length
          || evidenceIds.some((id) => typeof id !== 'string' || !evidenceById.has(id))) {
          failUnverified('인용한 근거 ID가 현재 기록의 근거와 맞지 않습니다. 내용을 지어내지 않았습니다.', explanation?.error?.code);
          return root;
        }
        if (!Array.isArray(data.proposals)) {
          failUnverified('조치 제안 자료를 확인할 수 없습니다.');
          return root;
        }
        const supportedActions = Array.isArray(event.supportedActions) ? event.supportedActions : [];
        for (const proposal of data.proposals) {
          if (!proposal || typeof proposal.action !== 'string' || !supportedActions.includes(proposal.action)
            || typeof proposal.reason !== 'string' || !Array.isArray(proposal.evidenceIds)
            || proposal.evidenceIds.length === 0 || new Set(proposal.evidenceIds).size !== proposal.evidenceIds.length
            || proposal.evidenceIds.some((id) => typeof id !== 'string' || !evidenceById.has(id))) {
            failUnverified('제안의 조치 또는 근거가 현재 기록과 맞지 않습니다.');
            return root;
          }
        }

        // 성공 표시와 data-* 표식은 모든 연결 검증을 통과한 뒤에만 부여한다.
        root.setAttribute('data-student-explanation-event', eventId);
        addText(`사건 ID: ${eventId}`);
        addHeading('AI 설명(참고용)');
        addText(data.summary);

        addHeading('인용 근거');
        const evidenceList = document.createElement('ul');
        for (const id of evidenceIds) {
          const row = document.createElement('li');
          row.textContent = `근거 ${id} — ${evidenceById.get(id)}`;
          evidenceList.append(row);
        }
        root.append(evidenceList);

        addHeading('규칙');
        if (Array.isArray(event.rules) && event.rules.length > 0) {
          const rulesList = document.createElement('ul');
          for (const rule of event.rules) {
            const row = document.createElement('li');
            row.textContent = `${rule?.id ?? '확인 불가'} — ${rule?.text ?? '확인 불가'}`;
            rulesList.append(row);
          }
          root.append(rulesList);
        } else {
          addText('규칙이 없습니다.');
        }

        const stateLabels = {
          access: { allowed: '허용됨', denied: '거부됨', unknown: '확인 불가' },
          session: { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' },
          device: { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' },
        };
        const stateNames = { access: '접속', session: '세션', device: '기기' };
        const state = event.state ?? {};
        const unknownStates = [];
        addHeading('현재 상태');
        for (const key of ['access', 'session', 'device']) {
          const value = typeof state[key] === 'string' ? state[key] : 'unknown';
          const labels = stateLabels[key];
          const label = Object.hasOwn(labels, value) ? labels[value] : '확인 불가';
          addText(`${stateNames[key]}: ${label} (${value})`);
          if (value === 'unknown' || !Object.hasOwn(labels, value)) {
            unknownStates.push(`${stateNames[key]}: 확인 불가(${value})`);
          }
        }
        addHeading('확인 불가 상태');
        if (unknownStates.length > 0) {
          for (const value of unknownStates) addText(value);
        } else {
          addText('없음');
        }

        addHeading('조치 제안');
        if (data.proposals.length === 0) {
          addText(supportedActions.length === 0
            ? '연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상).'
            : 'AI가 제안한 조치가 없습니다.');
        } else {
          const proposalsList = document.createElement('ul');
          for (const proposal of data.proposals) {
            const row = document.createElement('li');
            row.textContent = `${proposal.action}: ${proposal.reason} 사람 확인이 필요하며 실행되지 않았습니다.`;
            proposalsList.append(row);
          }
          root.append(proposalsList);
        }
      } else {
        addText('AI 설명 상태를 확인할 수 없습니다. 기록은 그대로입니다.', 'student-explanation-unverified');
      }

      return root;
    },
    renderAction({ status, event, actionId, target, receipt, observation, message, confirmationExpiresAt, error } = {}) {
      const root = document.createElement('section');
      root.className = 'student-action';
      const addText = (text, className) => {
        const node = document.createElement('p');
        if (className) node.className = className;
        node.textContent = text;
        root.append(node);
        return node;
      };
      const safeMessage = (value) => {
        const safe = typeof value === 'string' && value.length > 0 && value.length <= 500
          && !/(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|비밀번호|토큰)\s*[:=]\s*\S+)/i.test(value)
          && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value);
        return safe ? value : '안전한 메시지를 확인할 수 없습니다.';
      };
      const displayValue = (value) => {
        if (typeof value === 'string' && value.length > 0) return value;
        if (typeof value === 'number' && Number.isFinite(value)) return String(value);
        return null;
      };
      const appendValue = (label, value) => {
        const shown = displayValue(value);
        if (shown !== null) addText(`${label}: ${shown}`);
      };
      const safeCode = (value) => typeof value === 'string' && /^[A-Z][A-Z0-9_]{1,63}$/.test(value)
        ? value
        : 'ACTION_REQUEST_UNVERIFIED';
      const eventId = displayValue(event?.id);
      const requestId = displayValue(receipt?.requestId);
      if (eventId !== null) root.setAttribute('data-student-action-event', eventId);
      if (requestId !== null) root.setAttribute('data-student-action-request', requestId);

      if (status === 'idle') {
        addText('아직 미실행(idle). 보안 조치 요청은 전송되지 않았습니다.');
      } else if (status === 'loading') {
        addText('조치 준비 또는 결과 조회 중(loading). 처리 결과는 아직 확인되지 않았습니다.');
      } else if (status === 'prepared') {
        addText('준비됨·미실행(prepared). 서버에 전달되지 않았습니다.');
        appendValue('확인 기한', confirmationExpiresAt);
      } else if (status === 'executing') {
        addText('서버에 전달 중(executing). 처리 결과는 아직 확인되지 않았으며 완료나 성공을 뜻하지 않습니다.');
      } else if (status === 'pending') {
        addText('서버 접수·처리 중(pending). ACK는 서버 접수 확인이며 효과 확인이 아닙니다.');
        addText('처리 결과는 아직 확인되지 않았습니다.');
      } else if (status === 'succeeded' && observation?.effectApplied === true) {
        addText('효과 확인(succeeded).');
        appendValue('관측 시각', observation.observedAt);
        addText('effectApplied: true');
      } else if (status === 'succeeded') {
        addText('결과 불명(unknown). effectApplied: true가 관측되지 않아 효과를 확인할 수 없습니다.');
        addText('제공 화면의 「연동 시스템 결과만 재조회」를 사용해 결과를 확인하세요.');
      } else if (status === 'denied') {
        addText('연동 시스템 거절(denied).');
        if (displayValue(message) !== null) addText(`사유: ${safeMessage(message)}`);
      } else if (status === 'failed') {
        addText('연동 시스템 실패(failed).');
        if (displayValue(message) !== null) addText(`실패 사유: ${safeMessage(message)}`);
      } else if (status === 'unknown') {
        addText('결과 불명(unknown). 효과가 없다고도 성공했다고도 판단할 수 없습니다.');
        addText('제공 화면의 「연동 시스템 결과만 재조회」를 사용해 결과를 확인하세요.');
      } else if (status === 'expired') {
        addText('확인 기한 지남(expired). 조치를 다시 준비하세요.');
      } else if (status === 'error') {
        addText('요청 처리 안 됨(error). 보안 조치가 처리되지 않았습니다.');
        addText(`오류 코드: ${safeCode(error?.code)}`);
        addText(`오류 메시지: ${safeMessage(error?.message)}`);
      } else {
        const receivedStatus = typeof status === 'string' && /^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(status)
          ? status
          : 'unknown';
        addText(`결과 불명(unknown). 알 수 없는 상태(${receivedStatus})입니다.`);
        addText('효과가 없다고 단정하지 마세요. 제공 화면의 「연동 시스템 결과만 재조회」를 사용해 결과를 확인하세요.');
      }

      appendValue('사건 ID', eventId);
      if (Array.isArray(event?.evidence) && event.evidence.length > 0) {
        const evidenceIds = event.evidence
          .map((item) => displayValue(item?.id))
          .filter((value) => value !== null);
        if (evidenceIds.length > 0) addText(`근거 ID: ${evidenceIds.join(', ')}`);
      }
      appendValue('조치 ID', actionId);
      appendValue('대상 ID', target?.id);
      appendValue('대상 세대', target?.generation);
      appendValue('요청 ID', requestId);
      appendValue('접수 ID', receipt?.receiptId);
      appendValue('버전', receipt?.version);

      return root;
    },
  };
}
