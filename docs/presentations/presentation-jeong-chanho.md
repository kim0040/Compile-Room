# 정찬호 발표 메모 (자료/게시판 인터랙션)

## 범위와 책임
- 자료 상세: 미리보기 분기(PDF/이미지/미지원), 다운로드/즐겨찾기/좋아요, 댓글 쓰기.
- 게시판: 카테고리 필터, 글 작성, 조회수 집계, 댓글 흐름.
- 권한 처리: 삭제/작성/토글 시 로그인·작성자·관리자 권한 확인.

## 라이브 데모 시나리오
1) 자료 상세: `/materials/{id}` → 파일 미리보기 동작 확인 → 다운로드 클릭 후 카운트 증가 확인.
2) 상호작용: 좋아요/즐겨찾기 토글 → 수치 반영 확인 → 새로고침 후 상태 유지 확인.
3) 댓글: 내용 입력 후 등록 → 목록 즉시 추가 → 로그아웃 상태에서 작성 시 401 응답 확인.
4) 게시판: `/posts`에서 카테고리 전환 → 필터된 목록 확인 → 새 글 작성 후 목록 상단 반영 → 조회수 증가 확인.

## 핵심 코드 포인트
- 자료 상세: `src/app/materials/[id]/page.jsx`(미리보기, 댓글 UI, 삭제 권한).
- 다운로드: `src/components/material-download-button.jsx`, `src/app/api/materials/[id]/download/route.js`.
- 선호도: `src/components/material-preferences.jsx`, `src/app/api/materials/[id]/preference/route.js`.
- 게시판: `src/app/posts/page.jsx`, `src/components/create-post-form.jsx`, `src/components/post-preferences.jsx`, `src/app/api/posts/[id]/preference/route.js`.

## 품질 체크리스트
- 비로그인 상태에서 모든 쓰기/토글 요청이 401로 막히는지 확인.
- 다운로드/즐겨찾기/좋아요 수가 Prisma와 UI 모두에서 일관되게 증가·감소하는지 확인.
- 카테고리 필터 URL 파라미터가 브라우저 뒤로 가기와 동기화되는지 확인.
