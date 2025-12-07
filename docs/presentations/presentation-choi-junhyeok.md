# 최준혁 발표 메모 (프론트엔드 UX)

## 범위와 책임
- 공통 UI: 헤더/내비게이션, 업로드 CTA, 모바일 메뉴.
- 검색 경험: 홈 히어로의 검색 입력, `/materials` 목록 검색/정렬 UI.
- 리스트/카드: 자료 카드, 인기 TOP5 카드, 반응형 레이아웃.
- 전반적인 톤앤매너: 여백/타이포/색상 일관성 유지.

## 라이브 데모 시나리오
1) 내비게이션: 헤더에서 `/materials`, `/posts`, `/department` 이동 → 활성 상태와 모바일 토글 확인.
2) 검색 흐름: 홈(`src/app/page.jsx`) 검색어 입력 후 엔터 → `/materials`로 이동 → URL 파라미터가 입력과 동기화되는지 확인.
3) 정렬/필터: `/materials`에서 최신 ↔ 인기 전환 → 카드 목록과 TOP5 사이드바가 즉시 재정렬되는지 확인. 키워드 필터 추가 후 상태 확인.
4) 반응형: 브라우저 폭 375px/768px/1280px에서 헤더 메뉴, 카드 레이아웃 변화 확인.

## 핵심 코드 포인트
- 헤더: `src/components/header.jsx`(알림 제거, 업로드 CTA, 모바일 메뉴).
- 검색: `src/app/page.jsx`, `src/components/material-search-bar.jsx`(URL 파라미터 관리, Suspense).
- 자료 목록: `src/app/materials/page.jsx`(정렬 옵션, 빈 상태, 인기 TOP5 사이드바).
- 카드: `src/components/material-card.jsx`, `src/components/popular-material-card.jsx`.

## 품질 체크리스트
- 라우팅: 검색/정렬 시 브라우저 뒤로 가기 동작이 올바른지 확인.
- 접근성: 버튼/링크에 라벨 존재 여부, 키보드 포커스 이동 확인.
- 성능: `/materials` 초기 로드시 불필요한 리렌더 없는지 DevTools Performance로 간단 검증.
