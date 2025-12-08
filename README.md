# 컴파일룸 (Compile-Room)

전주대학교 컴퓨터공학과 학생들을 위한 자료 아카이브·게시판 서비스입니다. Next.js 16(App Router) + Prisma + NextAuth 기반이며, 현재 모든 코드는 JavaScript로 작성되어 있습니다.

---

### 왜 만들었나요?
- 학과 자료·과제·시험 대비 자료를 한 곳에 모아 검색/다운로드할 수 있도록.
- 스터디 공지, 후기 등을 게시판으로 공유해 지식 순환을 촉진하도록.
- macOS/Ubuntu 어디서든 동일한 JS 스택으로 개발·운영하기 쉽게 단순화.

---

### ✨ 핵심 기능 (현재 버전)
- **자료 목록/검색/정렬**: `/materials`에서 키워드 검색, 최신·인기 정렬, 즐겨찾기/다운로드 집계 확인.
- **자료 업로드**: PDF/PNG/JPG 3MB 이하 업로드, 과목/카테고리/설명 등록 및 미리보기.
- **게시판**: 카테고리별 글 작성, 댓글, 좋아요/즐겨찾기, 조회수 집계.
- **프로필 관리**: 이름/학번/학년 수정, 계정 삭제.
- **학과 정보 허브**: 학과 개요, 학년별 교육과정, 추천 과목/활동, 학칙/수강편람 링크.
- **온보딩·카운트다운**: 첫 방문 안내 모달과 학사 일정 카운트다운 제공.
> 알림 벨 기능은 최신 버전에서 제거되었습니다.

---

### 👤 체험용 계정
| 이름 | 이메일 | 비밀번호 |
| --- | --- | --- |
| 김현민 | `hyunmin@compileroom.com` | `compileroom123` |
| 최준혁 | `junhyeok@compileroom.com` | `compileroom123` |
| 이은우 | `eunwoo@compileroom.com` | `compileroom123` |
| 정찬호 | `chanho@compileroom.com` | `compileroom123` |
> 로그인 후 프로필에서 학번/학년을 자유롭게 수정할 수 있습니다.

---

### 🔐 운영 및 보안
- 개인정보(학번 등)는 암호화해 저장하고 세션은 NextAuth로 관리.
- 업로드: PDF/PNG/JPG 3MB 이하, 파일명 정규화.
- 요청 제한: 메모리 기반 rate limit으로 비정상 트래픽 차단.
- 추가 과금 없음(외부 유료 API 미사용).

---

### 🗂️ 프로젝트 구조 (주요 디렉터리)
```
src/
 ├─ app/                       # App Router 페이지 & API
 │   ├─ page.jsx               # 메인(검색/통계/업로드 CTA)
 │   ├─ about/                 # 서비스 소개
 │   ├─ login/, register/      # 인증 페이지
 │   ├─ upload/                # 자료 업로드
 │   ├─ posts/, posts/[id]/    # 게시판 목록/상세
 │   ├─ materials/, materials/[id]/ # 자료 목록/상세/댓글/다운로드
 │   ├─ profile/               # 프로필 및 계정 삭제
 │   ├─ department/            # 학과 정보 허브
 │   └─ api/                   # auth, upload, materials, posts, comments,
 │                             # profile 등 Route Handlers
 ├─ components/                # Header/Footer, 검색/업로드/작성 폼,
 │                             # 카운트다운, 통계, 카드 등 UI 컴포넌트
 ├─ data/department.js         # 학과/교육과정 정적 데이터
 ├─ lib/                       # Prisma, Auth, 포맷터, 암호화, 자료/게시판 헬퍼
 ├─ constants/material.js      # 자료 타입 라벨/값
 ├─ utils/alias.js             # 익명 닉네임 유틸
 └─ public/                    # 로고 및 정적 자산
prisma/
 ├─ schema.prisma              # DB 스키마
 └─ migrations/                # 마이그레이션 기록
scripts/
 ├─ seed.mjs                   # 초기 데이터 생성
 ├─ setup-local-https.sh       # mkcert로 로컬 HTTPS 인증서 생성
 └─ deploy.sh                  # CI/빌드/pm2 재시작 자동화
```

---

### 📁 주요 파일 역할
| 경로 | 설명 |
| --- | --- |
| `src/app/layout.jsx` | 공통 레이아웃, 폰트/파비콘, 메타 태그 |
| `src/app/page.jsx` | 메인 히어로, 자료 검색, 통계, 업로드 CTA |
| `src/app/posts/*.jsx` | 게시판 목록/상세, 조회수·선호도 API |
| `src/app/materials/page.jsx` | 자료 목록/검색/정렬 페이지 |
| `src/app/materials/[id]/page.jsx` | 자료 상세, 다운로드/댓글/좋아요/즐겨찾기 |
| `src/app/api/*` | 인증, 업로드, 자료/게시판/댓글, 프로필 등 API |
| `src/app/department/page.jsx` | 학과 정보/교육과정/추천 정보 |
| `src/components/header.jsx` | 네비게이션(홈/자료/게시판/학과), 업로드 버튼 |
| `src/components/material-search-bar.jsx` | 자료 검색 입력 및 이동 |
| `src/components/upload-form.jsx` | 자료 업로드 폼 |
| `src/components/create-post-form.jsx` | 게시글 작성 폼 |
| `src/components/countdown-timer.jsx` | 학사 일정 카운트다운 |
| `src/lib/materials.js`, `src/lib/posts.js` | 자료/게시판 조회 및 통계 헬퍼 |
| `scripts/seed.mjs` | 초기 계정·자료·게시글 데이터 생성 |

---

### 👥 기여자 발표 자료
- 김현민: `docs/presentations/presentation-kim-hyunmin.md`
- 최준혁: `docs/presentations/presentation-choi-junhyeok.md`
- 정찬호: `docs/presentations/presentation-jeong-chanho.md`
- 이은우: `docs/presentations/presentation-lee-eunwoo.md`
- 전체 문서 인덱스: `docs/README.md`

---

### 🧑‍💻 로컬 개발 가이드
1) 저장소 받기
   ```bash
   git clone https://github.com/kim0040/Compile-Room.git
   cd Compile-Room
   ```
2) 환경 변수 작성: `.env.local`
   ```
   DATABASE_URL="file:./dev.db"
   AUTH_SECRET="랜덤_32자_이상"
   NEXTAUTH_URL="http://localhost:3000"
   ```
3) 의존성 설치 및 DB 준비
   ```bash
   npm ci
   npx prisma migrate dev
   npm run seed   # 샘플 데이터
   ```
4) 개발 서버
   ```bash
   npm run dev    # http://localhost:3000
   ```
5) 품질 확인
   ```bash
   npm run lint   # 필요 시
   npm run build  # 배포 전 빌드 검증
   ```

### 🚀 서버(프로덕션) 배포 가이드
1) 시스템 준비
   ```bash
   # Node 20.x + PM2 예시
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt-get install -y nodejs build-essential
   npm install -g pm2
   ```
2) 코드 배포
   ```bash
   git clone https://github.com/kim0040/Compile-Room.git /home/web/compile-room
   cd /home/web/compile-room
   cp .env.example .env.local   # 예제가 없으면 직접 작성
   # .env.local: NEXTAUTH_URL을 실제 도메인으로, DATABASE_URL을 운영 DB로 지정
   npm ci
   npx prisma migrate deploy
   npm run build
   ```
3) 실행 (PM2)
   ```bash
   # 프로젝트 경로를 --cwd로 명시해 잘못된 위치에서 기동되는 문제 방지
   pm2 start npm --name compile-room --cwd /home/web/compile-room --time -- run start -- --hostname 0.0.0.0 --port 3000
   pm2 save
   pm2 startup systemd -u <사용자명> --hp /home/<사용자명>   # 출력되는 명령어 실행해 부팅 시 자동 시작
   ```
   - 재배포/환경변수 변경 후: `pm2 restart compile-room --update-env`
   - 경로를 잘못 잡아서 뜨지 않을 때: `pm2 delete compile-room && pm2 start ...`(위 명령 재실행)
   - 동작 확인/로그: `pm2 status`, `pm2 logs compile-room --lines 200`
4) 역방향 프록시/HTTPS (선택)
   - Nginx에서 `proxy_pass http://127.0.0.1:3000;` 설정
   - `certbot --nginx -d your-domain.com`으로 Let’s Encrypt 인증서 발급
5) 배포 후 확인
   - `pm2 status`, `pm2 logs compile-room`
   - `/api/materials?keyword=` 200 응답 여부
   - `/materials`, `/posts` UI 정상 로딩

### ⚙️ 환경 변수 (.env)
| 키 | 설명 |
| --- | --- |
| `DATABASE_URL` | DB 연결 URL (기본 `file:./dev.db`) |
| `AUTH_SECRET` | NextAuth 세션 및 암호화 키 |
| `NEXTAUTH_URL` | 서비스 URL (예: `https://compileroom.space`) |
| `CHAT_ENCRYPTION_KEY` | (선택) 암호화 헬퍼 키, 미설정 시 `AUTH_SECRET` 사용 |

---

### 🧪 로컬 개발
1) 의존성 설치 및 DB 초기화
```bash
npm install
npx prisma migrate dev
npm run seed   # 테스트 데이터
```
2) 개발 서버
```bash
npm run dev    # http://localhost:3000
```
3) 빌드 테스트
```bash
npm run build
```

---

### ⚡️ 주요 스크립트
| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run dev:https` | mkcert 기반 로컬 HTTPS 실행 |
| `npm run seed` | 초기 데이터 생성 |
| `npm run deploy` | 서버 배포 자동화 스크립트 실행 |

---

### 🔐 로컬 HTTPS (선택)
```bash
brew install mkcert nss # macOS
sudo apt install libnss3-tools # Ubuntu
npm run dev:https
```
`scripts/setup-local-https.sh`가 인증서(`certs/localhost.pem`, `localhost-key.pem`)를 생성합니다.

---

### 🚀 배포 요약 (Ubuntu)
1) 필수 패키지 설치: `node 20`, `npm`, `pm2`, `git`  
2) 레포 클론 후 `.env` 작성  
3) `npm run deploy` 실행 (migrate/build/pm2 재시작 자동 진행)  
4) 필요 시 Nginx+Certbot으로 HTTPS 설정
