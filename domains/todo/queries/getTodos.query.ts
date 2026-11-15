// 조회 함수는 서버 컴포넌트에서만 호출합니다.
// 'use server'를 붙이면 클라이언트가 호출할 수 있는 엔드포인트로 공개되므로,
// 대신 'server-only'로 클라이언트 번들에 포함되는 것 자체를 막습니다.
import 'server-only';

import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { createServerClient } from '@/shared/lib/supabase';
import type { Todo, TodoResponse } from '../types/todo.types';
import { toTodo } from '../utils/todoConverter';

/**
 * 로그인한 사용자의 할일 목록(최신순)을 조회합니다.
 * 조회 실패 시 빈 배열이 아니라 에러를 던져서, "할일 없음"과 "불러오기 실패"를
 * 화면에서 구분할 수 있게 합니다. 던진 에러는 app/(todo)/error.tsx 가 받아 표시합니다.
 */
export async function getTodos(): Promise<Todo[]> {
    const user = await getCurrentUser();
    if (!user) return [];

    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('할일 목록 조회 실패:', error.message);
        throw new Error('할일 목록을 불러오지 못했습니다.');
    }

    return (data as TodoResponse[]).map(toTodo);
}
