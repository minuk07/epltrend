# P4 관리자 검수

## 목표

관리자가 AI 판단을 확인하고, 한국어 문구를 수정하고, 승인/반려를 처리하고, 수동 수집을 실행할 수 있는 최소 관리자 화면을 만든다.

## 관리자 라우트

- `/admin`: React 관리자 대시보드.
- `GET /api/admin/items`: 큐와 대시보드 데이터 조회.
- `POST /api/admin/review`: 승인, 반려, 수정 저장.

## 필수 UI 영역

- 토큰 입력: `ADMIN_TOKEN`, `CRON_SECRET`
- 대시보드 지표: 발행, 검수, 폐기, 반려, 전체 로드 수
- source 상태: handle, tier, 마지막 체크 시각, 마지막 오류
- 큐 필터: review, published, discarded, rejected, all
- 검수 카드:
  - 원본 X 텍스트
  - 원본 URL
  - 팀 태그
  - AI decision/status/confidence
  - evidence
  - review reason
  - 수정 가능한 제목
  - 수정 가능한 short/detail summary
  - approve/reject/save 버튼

## 작업 목록

| ID | 작업 | 완료 조건 |
|---|---|---|
| P4-T1 | UI 필드를 P1/P2와 정렬 | 관리자 화면이 short/detail summary와 briefing status를 표시함 |
| P4-T2 | empty/error 상태 추가 | 토큰 없음, API 오류, 빈 큐 상태가 이해 가능하게 보임 |
| P4-T3 | approve flow 추가 | 승인 시 published 필드가 갱신되고 Slack 발행 알림이 감 |
| P4-T4 | reject flow 추가 | 반려 시 `rejected`가 되고 reviewer note가 저장됨 |
| P4-T5 | update flow 추가 | save가 발행 없이 한국어 문구만 수정함 |
| P4-T6 | 반응형 레이아웃 검증 | desktop/mobile 폭에서 화면 겹침이 없음 |

## 종료 조건

- 관리자가 DB에 직접 접근하지 않고 review item을 발행할 수 있다.
- 관리자가 DB에 직접 접근하지 않고 부적절한 item을 반려할 수 있다.
- item이 없어도 관리자 페이지가 정상 로드된다.
