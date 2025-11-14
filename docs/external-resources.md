# 외부 자료 사용 가이드

## 1. 구상도(기획 자료) 보관 위치
- **로컬 전용 경로**: `~/Compile-Room-external/구상도` 처럼 저장소 바깥 디렉터리에 두고 관리하세요.
- 저장소 내부 `구상도/` 폴더는 삭제되었으며 `.gitignore`에 등록되어 있어도, 과거에 커밋된 파일은 이력을 정리하지 않으면 계속 노출됩니다.
- 필요 시 특정 문서를 참고하려면 임시로 `구상도` 폴더를 복사해 넣고 작업한 뒤, 다시 폴더를 삭제한 다음 `git status`가 비지 않도록 정리하세요.

## 2. Git 이력에서 기획 자료 삭제하기
1. **현재 커밋에서 제거**
   ```bash
   chflags -R nouchg .git && chmod -R u+rw .git   # macOS에서 .git 잠금 해제
   git rm -r --cached -- 구상도
   git commit -m "chore: remove gujangdo assets"
   git push
   ```
2. **기존 원격 이력에서도 완전히 제거** (선택)
   - [`git filter-repo`](https://github.com/newren/git-filter-repo) 또는 BFG Repo-Cleaner로 `구상도/` 폴더를 제거한 뒤 force push가 필요합니다.
   - 예시:
     ```bash
     pip install git-filter-repo
     git filter-repo --path '구상도' --path-rename '구상도:'
     git push origin --force
     ```
   - force push 전에는 팀원들과 반드시 상의하세요.

## 3. 로컬 HTTPS 인증서
- `scripts/setup-local-https.sh`가 생성하는 `certs/localhost*.pem` 역시 `.gitignore`에 포함되어 있으므로, Git 상태에 나타나면 `git rm --cached`로 제거한 뒤 다시 생성하세요.

## 4. 기타 대용량/민감 자료
- 디자인 PSD, 원본 사진, 문서 스캔 등은 한 곳에 모아 `external/README.md` 형태로 위치만 문서화하고, 저장소에는 포함하지 않는 것을 권장합니다.

이 문서를 팀 위키에 복사해 두면 외부 자료가 우발적으로 커밋되는 일을 줄일 수 있습니다.
