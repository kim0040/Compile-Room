# 김현민 발표 메모 (서버/보안/운영)

## 범위와 책임
- 인증/세션: NextAuth 설정, 안전 로그아웃(`signOutSafely`), 세션 쿠키 유효성.
- 업로드 보안: 용량·확장자·매직넘버 검증, rate limit, 파일 저장/Prisma 트랜잭션.
- 개인정보: 학번 암호화/복호화(`src/lib/personal-data.js`), 응답 데이터 최소화.
- 계정/프로필: 프로필 수정·삭제 API와 UI 연결.
- 운영 품질: 알림 기능 제거로 서버 부하 축소 및 UX 단순화.

## 라이브 데모 시나리오
1) 로그인 흐름: `/login`에서 테스트 계정으로 로그인 → Network 탭에서 세션 쿠키 확인 → 새로고침 후 세션 유지 확인.
2) 업로드 성공: `/upload`에서 3MB 이하 PDF 선택 → 제출 → 상세 페이지 이동 및 Prisma에 레코드 생성 확인.
3) 업로드 실패 케이스: 4MB 파일 업로드 시도 → 400 응답 및 한글 에러 메시지 확인. 확장자/JPG 위조 파일도 동일 검증.
4) 인증 우회 차단: 로그아웃 후 업로드/댓글 요청 → 401 응답 확인.
5) 프로필 수정/삭제: `/profile`에서 이름·학번 변경 후 저장 → 다시 로그인 시 반영 여부 확인. 필요 시 계정 삭제 요청 시연.

## 핵심 코드 포인트
- Auth: `src/lib/auth.js`, `src/app/api/auth/[...nextauth]/route.js`, `src/lib/client-signout.js`.
- 업로드: `src/app/api/upload/route.js`(용량 3MB, 확장자+매직넘버, rateLimit), `src/lib/utils.js`(파일 저장).
- 개인정보: `src/lib/personal-data.js`(학번 암호화/복호화).
- 프로필: `src/app/api/profile/route.js`, `src/app/profile/page.jsx`.
- 운영 결정: 알림 관련 코드/엔드포인트 제거로 불필요한 폴링 제거.

## 운영 체크리스트
- 환경 변수: `.env.local`의 `AUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL` 값 점검.
- 보안: 업로드 실패 로그 확인, rate limit 키(`upload:{userId}`) 정상 동작 확인.
- 헬스체크: `npm run build` 통과 여부, `/api/materials?keyword=` 200 응답 확인.
