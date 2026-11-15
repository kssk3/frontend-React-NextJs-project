import 'server-only';

import { cache } from 'react';
import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { createServerClient } from '@/shared/lib/supabase';
import type { Todo, TodoResponse } from '../types/todo.types';
import { toTodo } from '../utils/todoConverter';

// PostgreSQL "invalid_text_representation" — 예: uuid 컬럼에 'abc' 같은 값을 넣은 경우
const INVALID_TEXT_REPRESENTATION = '22P02';

/**
 * 할일 한 건을 조회합니다. 없으면 null(→ 페이지에서 notFound())을 반환합니다.
 *
 * React cache()로 감싸서 한 요청 안에서 같은 id로 여러 번 호출해도
 * (generateMetadata + page) Supabase 조회는 한 번만 일어납니다.
 */
export const getTodoById = cache(async (id: string): Promise<Todo | null> => {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .maybeSingle();

    if (error) {
        // 형식이 잘못된 id는 "존재하지 않는 할일"로 취급(404)합니다.
        if (error.code === INVALID_TEXT_REPRESENTATION) return null;

        console.error(`할일 조회 실패 [id: ${id}]:`, error.message);
        throw new Error('할일을 불러오지 못했습니다.');
    }

    return data ? toTodo(data as TodoResponse) : null;
});
