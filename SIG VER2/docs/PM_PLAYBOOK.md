# Studio SIG — PM 플레이북

> 이 문서는 Studio SIG 서비스를 "운영되는 프로덕트"로 관리하기 위한 PM 운영 체계를 정의합니다.
> 관리자(`/admin`)의 **지표 · A/B 실험 · 리서치 · SQL** 탭이 이 체계를 실행하는 도구입니다.

---

## 1. 프로덕트 정의

| 항목 | 내용 |
|---|---|
| 프로덕트 | 디자인 스튜디오 Studio SIG의 포트폴리오 & 리드 확보 웹사이트 |
| 타깃 | 디자인 구독·브랜딩 프로젝트를 검토 중인 스타트업/중소기업 담당자 |
| 핵심 가치 | 작업물 신뢰 형성 → **문의(리드) 전환** |
| 비즈니스 모델 | 문의 → 상담 → 구독/프로젝트 계약 |

## 2. 지표 체계 (Metrics Framework)

### North Star Metric
**주간 문의 제출 수 (`contact_submit`)** — 사이트가 만들어내는 실질 비즈니스 가치.

### 지표 트리 (Input Metrics)
```
문의 제출 수
├─ 방문자 수 (Acquisition)         ← 유입 채널 분포로 진단
├─ 탐색 깊이 (Activation/Engagement)
│   ├─ 세션당 PV, 이탈률
│   └─ Work 상세 조회율 (work_view)
└─ 문의 전환율 (Conversion)
    ├─ 퍼널: 방문 → Work → 상세 → Contact → 제출
    └─ CTA 클릭률 (cta_click)      ← A/B 실험 대상
```

### AARRR 매핑
| 단계 | 지표 | 수집 이벤트 |
|---|---|---|
| Acquisition | 순 방문자, 유입 채널 | `page_view` + referrer |
| Activation | 이탈률, 세션당 PV | `page_view` (세션 단위) |
| Retention | 재방문 (visitor_id 기준) | `page_view` |
| Referral | NPS (추천 의향) | `survey_response` |
| Revenue | 문의 제출, 예산대 분포 | `contact_submit` (budget props) |

### 가드레일 지표
실험/개편 시 함께 감시: 이탈률, 세션당 PV — 전환만 쫓다 탐색 경험을 해치지 않기 위함.

## 3. 실험 프로세스 (A/B Testing)

1. **가설 수립** — `[변경]하면 [지표]가 [폭]만큼 개선될 것이다. 근거: [데이터/리서치]`
2. **설계** — 대상 페이지, 변형(control 포함), 트래픽 분배, 성공 지표(goalEvent), 가드레일 지표 정의
3. **표본 계획** — 실험 탭이 기준 전환율로 필요 표본 수 자동 계산 (α=0.05, power 80%)
4. **실행** — 결정적 해시 버킷팅으로 동일 방문자는 항상 동일 변형 노출 (SRM 방지)
5. **판정** — two-proportion z-test, p < 0.05 && lift > 0 일 때만 승자 선언. 표본 미달 시 "판단 유보"
6. **의사결정 기록** — 실험 종료 시 결정 메모 필수 (채택/기각/재실험 + 근거)

### 실험 백로그 (우선순위: ICE)
| # | 가설 | 지표 | Impact | Confidence | Ease |
|---|---|---|---|---|---|
| 1 | CTA 문구를 행동 결과형으로 바꾸면 문의 전환 +15% | contact_submit | 4 | 3 | 5 ✅ 진행 중 |
| 2 | 홈 Featured에 성과 수치를 노출하면 상세 조회율 상승 | work_view | 4 | 3 | 3 |
| 3 | Contact 폼 필드 축소(전화 선택화)로 제출 완료율 상승 | contact_submit | 5 | 4 | 4 |
| 4 | 상세 페이지 하단 '다음 프로젝트' → 'CTA' 교체 시 전환 상승 | contact_submit | 3 | 2 | 4 |

## 4. UX 리서치 운영

- **정량**: NPS 마이크로 서베이 (방문자당 1회, 샘플링·노출 지연 조절 가능)
  - NPS ≥ 30 우수 / 0~30 보통 / < 0 개선 필요
- **정성**: 서베이 코멘트 → 주간 리뷰에서 태깅(탐색/신뢰/속도/콘텐츠) 후 백로그 반영
- **행동 데이터**: 퍼널 이탈 구간 → 해당 페이지 리서치 질문 설계로 연결

## 5. 데이터 스택

```
공개 사이트 (React)
  └─ track() ──→ localStorage 링버퍼 (오프라인/미연결 폴백)
        └────→ Supabase analytics_events (통합 수집)
관리자 /admin
  ├─ 지표 대시보드  ← metrics.ts 집계 (양쪽 소스 동일 코드)
  ├─ A/B 실험      ← experiments.ts (배정·노출·z-test)
  ├─ 리서치        ← survey_response 이벤트 + stats.calcNps
  └─ SQL 콘솔      ← run_admin_query RPC (읽기 전용)
```

- 개인정보: 익명 visitor_id(랜덤 UUID)만 사용, PII 미수집. `/admin` 트래픽 수집 제외.
- 설정: `supabase/pm_analytics_migration.sql`을 SQL Editor에서 1회 실행.

## 6. 운영 리듬

| 주기 | 액티비티 |
|---|---|
| 주간 | 지표 대시보드 리뷰 (North Star + 퍼널), 실험 중간 점검(피킹 금지 — 표본 도달 전 종료하지 않음) |
| 격주 | 리서치 코멘트 태깅, 실험 백로그 우선순위 재조정 (ICE) |
| 월간 | 실험 회고 (채택률, learning 정리), NPS 추이 리뷰 |

## 7. 로드맵 (Next)

- [ ] 스크롤 깊이·체류시간 이벤트 추가 → 콘텐츠 단위 인게이지먼트 측정
- [ ] UTM 파라미터 파싱 → 캠페인 단위 ROI 분석
- [ ] 실험 다중 지표 지원 (주 지표 + 가드레일 자동 판정)
- [ ] Supabase Auth 기반 관리자 권한 강화 (RLS를 anon → authenticated로)
- [ ] 주간 지표 이메일 리포트 자동화
