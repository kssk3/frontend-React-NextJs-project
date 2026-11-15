/**
 * Server Action이 클라이언트에 돌려주는 공통 결과 형태입니다.
 * - errors: 필드별 검증 메시지 (폼 입력칸 아래에 표시)
 * - message: 폼 전체에 대한 메시지 (성공 알림 또는 서버 오류)
 */
export interface ActionState<T = unknown> {
    success: boolean;
    message?: string;
    errors?: Record<string, string>;
    data?: T;
}

// data가 없는 초기 상태이므로 어떤 ActionState<T>에도 대입할 수 있도록 never로 둡니다.
export const INITIAL_ACTION_STATE: ActionState<never> = {
    success: false,
};
