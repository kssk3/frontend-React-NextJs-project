# TODO APP — Next.js + Supabase 회원 전용 할일 관리

React로 만들었던 Todo 리스트를 **Next.js(App Router) 16**으로 옮기고, **Supabase Auth/DB**를 연동해 로그인한 사용자만 자신의 할일을 관리할 수 있도록 개선한 프로젝트입니다.

- 배포 주소: https://frontend-react-nextjs-project.vercel.app ← 배포 후 기입
- 저장소: https://github.com/kssk3/frontend-React-NextJs-project

## 주요 기능

| 기능                         | 설명                                                                                                                                     |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 회원가입 / 로그인 / 로그아웃 | Supabase Auth (이메일 + 비밀번호), Zod로 서버 측 입력 검증                                                                               |
| 접근 제어                    | 비로그인 사용자가 `/`, `/todo/**`에 접근하면 `/sign_in?redirectUrl=…`로 이동, 로그인 후 원래 페이지로 복귀                               |
| 할일 CRUD                    | 등록 · 목록 조회 · 상세 조회 · 수정 · 삭제(soft delete) · 상태 변경(대기/진행중/완료)                                                    |
| 상태별 UI                    | 로딩(`loading.tsx`, 스켈레톤) · 성공(목록) · 오류(`error.tsx`, 다시 시도) · 빈 데이터(첫 할일 등록 안내) · 찾을 수 없음(`not-found.tsx`) |
| 필터                         | 상태별 필터 탭 + 개수 표시                                                                                                               |
| 리치 텍스트                  | Tiptap 에디터로 내용 작성, 상세 페이지는 읽기 전용 뷰어로 출력                                                                           |

## 라우트 구조

```
app/
├── layout.tsx                 # 루트 레이아웃 (lang, 메타데이터 템플릿)
└── (todo)/                    # 라우트 그룹 — URL에는 나타나지 않음
    ├── layout.tsx             # Header(<Suspense>) + main
    ├── loading.tsx            # 로딩 상태
    ├── error.tsx              # 오류 상태 (retry)
    ├── page.tsx               # /              할일 목록
    ├── sign_in/page.tsx       # /sign_in       로그인
    ├── sign_up/page.tsx       # /sign_up       회원가입
    └── todo/
        ├── new/page.tsx       # /todo/new      할일 등록
        └── [id]/              # 동적 라우트
            ├── not-found.tsx  # 없는 id → "찾을 수 없음" 화면
            ├── view/page.tsx  # /todo/:id/view 상세
            └── edit/page.tsx  # /todo/:id/edit 수정
proxy.ts                       # (구 middleware) 세션 갱신 + 접근 제어
```

## 폴더 구조 (도메인 단위)

```
domains/
├── auth/   actions · components · queries · schemas · types
└── todo/   actions · components · queries · schemas · types · utils
shared/     components(ui, FormField, Header, TiptapEditor) · hooks · lib · utils · types
```

- `actions/` — `'use server'` Server Action (등록·수정·삭제 등 **변경** 작업, 클라이언트에서 호출)
- `queries/` — `import 'server-only'` 조회 함수 (서버 컴포넌트에서만 호출, 클라이언트 번들에 포함되지 않음)
- `schemas/` — Zod 스키마 (서버 측 입력 검증의 단일 기준)

## 렌더링 전략과 선택 근거

| 영역                                            | 방식                                  | 이유                                                                                                                                                                                                                            |
| ----------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 목록·상세·수정 페이지 (`page.tsx`)              | **서버 컴포넌트**에서 Supabase 조회   | 목록·제목·상태가 서버 응답 HTML에 포함되어 "빈 화면 → 로딩 → 목록" 깜빡임이 없음. DB 접근 코드와 쿼리가 브라우저로 내려가지 않음                                                                                                |
| 상세 본문(리치 텍스트)                          | 클라이언트 Tiptap 읽기 전용 뷰어      | 사용자가 입력한 HTML을 `dangerouslySetInnerHTML`로 그대로 넣지 않고 에디터 스키마로 다시 파싱해 안전하게 출력하기 위한 선택. 대신 본문은 브라우저에서 마운트된 뒤 표시되므로, 같은 높이의 자리를 미리 잡아 레이아웃 밀림을 줄임 |
| `Header`                                        | 서버 컴포넌트 + **`<Suspense>` 분리** | 세션(쿠키)은 요청 시점에만 읽을 수 있음. 레이아웃 최상단에서 기다리면 페이지 전체가 막히므로 헤더만 스트리밍                                                                                                                    |
| `TodoDashBoard`, `TodoForm`, 로그인/회원가입 폼 | **클라이언트 컴포넌트**               | 필터 선택, 입력값, 클릭 이벤트 등 브라우저 상호작용이 필요한 부분만                                                                                                                                                             |
| `DeleteTodoButton`, `SignOutButton`             | 작은 클라이언트 컴포넌트              | 상세 페이지·헤더는 서버 컴포넌트로 유지하고 이벤트가 필요한 버튼만 분리 → 클라이언트 JS 최소화                                                                                                                                  |

빌드 결과 모든 페이지가 **Partial Prerender(◐)** 로 생성됩니다. 레이아웃·스켈레톤 같은 정적인 껍데기는 미리 HTML로 만들어 즉시 보여주고, 세션에 따라 달라지는 부분만 요청 시점에 스트리밍합니다.

### 성능·UX 고려

- **낙관적 업데이트 (`useOptimistic`)**: 상태 변경·삭제 시 서버 응답을 기다리지 않고 즉시 반영하고, 실패하면(네트워크 오류 포함) 자동으로 원래 상태로 되돌린 뒤 오류 메시지를 표시합니다.
- **`useTransition` / `useActionState`**: 요청이 진행되는 동안 제출 버튼·상태 선택·삭제 버튼을 비활성화해 중복 요청을 막습니다.
- **서버 액션에서 `redirect()`**: 저장·삭제·로그인·로그아웃 성공 후 이동을 클라이언트 `useEffect`가 아니라 서버 액션 안에서 처리합니다. Next.js 16은 지난 페이지를 `<Activity>`로 숨겨 보존하므로, effect로 이동하면 그 페이지가 다시 보일 때 effect가 재실행되어 엉뚱하게 이동할 수 있기 때문입니다.
- **`bfcacheId` key**: 할일 폼은 링크로 다시 들어오면 새 폼으로 초기화하고, 브라우저 뒤로 가기로 돌아오면 작성 중이던 내용을 복원합니다.
- **`React.cache`**: `getCurrentUser`, `getTodoById`는 한 요청 안에서 여러 번 호출돼도(Header + page + generateMetadata) DB 조회를 한 번만 합니다.
- **`revalidatePath`**: 변경 후 목록과 상세 경로를 무효화해 다음 화면에 최신 데이터가 보이도록 합니다.
- **`next/link` 프리페칭**: 목록 → 상세 이동 시 미리 받아둔 정적 셸과 `loading.tsx`가 즉시 표시됩니다.
- **시간대 고정 날짜 포맷**: 서버(UTC)와 브라우저(KST)의 출력이 달라 생기는 하이드레이션 불일치를 막기 위해 `Asia/Seoul`로 고정했습니다.

### Hook 사용 원칙

- `useEffect`는 **외부 시스템과 동기화**할 때만 사용합니다. (오류 메시지 자동 숨김 타이머, 에러 로깅)
- 타이머는 클린업 함수에서 `clearTimeout`으로 해제해, 컴포넌트가 사라지거나 새 오류가 생겼을 때 이전 타이머가 상태를 바꾸지 않도록 합니다.
- 의존성 배열에는 effect 안에서 읽는 값만 정확히 넣습니다. (`react-hooks/exhaustive-deps` lint 통과)

## 보안

- **이중 인증 확인**: `proxy.ts`가 페이지 접근을 막고, 모든 Server Action과 조회 함수가 `getCurrentUser()`로 다시 확인합니다. (Server Action은 공개 엔드포인트이므로 proxy만 믿지 않습니다)
- 모든 할일 쿼리에 `.eq('user_id', user.id)` 조건을 겁니다. DB 수준에서도 막으려면 Supabase에서 `todos`, `profiles` 테이블에 **RLS 정책**(`auth.uid() = user_id` / `auth.uid() = id`)을 활성화해야 합니다.
- 오픈 리다이렉트 방지: 로그인 후 이동 경로(`redirectUrl`)는 서버에서 브라우저와 같은 URL 파서로 해석한 뒤 같은 사이트 경로일 때만 허용합니다. (`/\t/evil.com`처럼 문자열 검사를 우회하는 값도 차단)
- 상세 본문은 `dangerouslySetInnerHTML` 대신 Tiptap 읽기 전용 에디터로 출력해, 스키마에 없는 태그(script 등)가 렌더링되지 않습니다.

## 데이터베이스 (Supabase)

| 테이블     | 주요 컬럼                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------- |
| `profiles` | `id`(= auth.users.id), `name`, `created_at`, `updated_at`, `deleted_at`                                                   |
| `todos`    | `id`, `user_id`, `user_name`, `status`(READY/PROGRESS/DONE), `title`, `content`, `created_at`, `updated_at`, `deleted_at` |

## 로컬 실행

```bash
npm install
# .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드 확인
```

## 기술 스택

Next.js 16 (App Router, Cache Components, Turbopack) · React 19 · TypeScript · Supabase (`@supabase/ssr`) · Zod 4 · Tailwind CSS 4 · shadcn/ui · Tiptap
