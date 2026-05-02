# Bloomary-frontend

## 협업 방식

이 프로젝트는 **GitHub Flow**를 기반으로 협업합니다.

1. `main` 브랜치는 항상 배포 가능한 상태를 유지합니다.
2. 새 작업은 `main`에서 브랜치를 생성합니다.
3. 작업이 완료되면 Pull Request를 열고 코드 리뷰를 진행합니다.
4. 리뷰 승인 후 `main`으로 병합합니다.
5. 병합 즉시 배포합니다.

---

## Git Convention

### 브랜치 네이밍

```
<type>/<issue-number>-<short-description>

예시:
feat/12-add-login-page
fix/34-fix-button-style
chore/56-update-dependencies
```

| 타입 | 설명 |
|------|------|
| `feat` | 새로운 기능 |
| `fix` | 버그 수정 |
| `refactor` | 리팩토링 |
| `style` | 코드 포맷, 스타일 변경 (기능 변경 없음) |
| `chore` | 빌드, 설정, 의존성 등 기타 작업 |
| `docs` | 문서 수정 |
| `test` | 테스트 코드 |

### 커밋 메시지

```
<type>: <subject>

예시:
feat: 로그인 페이지 추가
fix: 버튼 클릭 시 스타일 깨짐 수정
chore: eslint 설정 업데이트
```

- 제목은 **명령문 형태**로 작성합니다.
- 제목은 **50자 이내**로 작성합니다.
- 제목 끝에 마침표를 붙이지 않습니다.

### Pull Request

- PR 제목은 커밋 메시지 형식과 동일하게 작성합니다.
- 변경 사항, 구현 방법, 스크린샷(UI 변경 시)을 포함합니다.
- 최소 1명의 리뷰어 승인 후 병합합니다.
- 병합 후 작업 브랜치는 삭제합니다.
