// 상태 목록을 한 곳에서 정의하고, 타입·검증 스키마·화면 라벨이 모두 여기서 파생되게 합니다.
export const TODO_STATUSES = ['READY', 'PROGRESS', 'DONE'] as const;

export type TodoStatus = (typeof TODO_STATUSES)[number];

export const TODO_STATUS_LABEL: Record<TodoStatus, string> = {
    READY: '대기',
    PROGRESS: '진행중',
    DONE: '완료',
};

// 화면(컴포넌트)에서 사용하는 camelCase 모델
export interface Todo {
    id: string;
    status: TodoStatus;
    userId: string;
    userName: string;
    title: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string;
}

// Supabase `todos` 테이블 행(snake_case) — toTodo()로 Todo로 변환합니다.
export interface TodoResponse {
    id: string;
    user_id: string;
    user_name: string;
    status: TodoStatus;
    title: string;
    content: string;
    created_at: string;
    updated_at: string | null;
    deleted_at?: string | null;
}
