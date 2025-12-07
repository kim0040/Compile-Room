# 이은우 발표 메모 (DB/백엔드 로직)

## 범위와 책임
- 데이터 모델: Prisma 스키마, 자료/게시판/선호도/댓글 관계 정의.
- 조회/검색: 자료 검색/정렬(`searchMaterials`), 통계 집계, 작성자 데이터 후처리.
- 쓰기 로직: 업로드 검증·저장, 좋아요/즐겨찾기 토글 트랜잭션, 다운로드 카운트.
- 시드/운영: 초기 데이터 생성, 마이그레이션 적용.

## 라이브 데모 시나리오
1) 검색/정렬 API: `/api/materials?sort=popular&keyword=` 호출 → 즐겨찾기·다운로드 기반 정렬 확인, 응답 JSON 구조 설명.
2) 선호도 토글: `/materials/{id}`에서 좋아요/즐겨찾기 요청 → `favoriteCount` 업데이트가 Prisma와 응답에서 일관되는지 확인.
3) 업로드 검증: 4MB 파일 업로드 시 400 응답, 허용 MIME 외 파일 차단 메시지 확인.
4) 데이터 확인: Prisma Studio에서 토글/다운로드 후 집계 수가 실제 필드와 맞는지 확인.

## 핵심 코드 포인트
- 자료 헬퍼: `src/lib/materials.js`(`searchMaterials`, 통계 집계, 작성자 학번 복호화).
- API: `src/app/api/materials/route.js`(검색/정렬), `src/app/api/materials/[id]/preference/route.js`, `src/app/api/posts/[id]/preference/route.js`(트랜잭션 토글), `src/app/api/materials/[id]/download/route.js`.
- 업로드: `src/app/api/upload/route.js`(매직넘버/MIME/용량 3MB, rate limit).
- 데이터: `scripts/seed.mjs`, `prisma/schema.prisma`.

## 품질 체크리스트
- 모든 토글이 트랜잭션으로 처리되어 중복/경합 없이 카운트가 맞는지 확인.
- 검색/정렬 파라미터가 누락·오입력 시 기본값(`latest`)으로 동작하는지 확인.
- 업로드 실패 케이스가 명확한 한국어 메시지와 함께 4xx로 응답하는지 확인.
