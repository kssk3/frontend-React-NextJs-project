'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { createServerClient } from '@/shared/lib/supabase';
import type { ActionState } from '@/shared/types/action.types';
import { toFieldErrors } from '@/shared/utils/zodErrors';
import {
    todoIdSchema,
    todoInputSchema,
    todoStatusSchema,
} from '../schemas/todo.schemas';
import type { TodoStatus } from '../types/todo.types';

function fail(message: string): ActionState {
    return { success: false, message };
}

const LOGIN_REQUIRED = '로그인이 필요한 서비스입니다.';
const INVALID_ID = '잘못된 할일 식별자입니다.';
const NOT_FOUND = '할일을 찾을 수 없거나 권한이 없습니다.';

function parseTodoForm(formData: FormData) {
    return todoInputSchema.safeParse({
        title: formData.get('title'),
        content: formData.get('content'),
    });
}

// 목록과 상세 화면이 모두 최신 데이터를 다시 그리도록 캐시를 무효화합니다.
function revalidateTodo(id?: string) {
    revalidatePath('/');
    if (id) revalidatePath(`/todo/${id}/view`);
}

/**
 * 할일 등록 (useActionState용: (prevState, formData) 시그니처)
 * 성공하면 서버에서 바로 상세 페이지로 redirect 합니다. 실패할 때만 ActionState를 돌려줍니다.
 * (클라이언트 useEffect로 이동하면, Next.js가 숨겨 둔(Activity) 폼 페이지가 다시 보일 때
 *  effect가 재실행되어 엉뚱하게 다시 이동하는 문제가 생깁니다.)
 */
export async function addTodoAction(
    _prevState: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return fail(LOGIN_REQUIRED);

    const parsed = parseTodoForm(formData);
    if (!parsed.success) {
        return { success: false, errors: toFieldErrors(parsed.error) };
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('todos')
        .insert({
            ...parsed.data,
            status: 'READY',
            user_id: user.id,
            user_name: user.name,
        })
        .select('id')
        .single();

    if (error || !data) {
        console.error('할일 등록 실패:', error?.message);
        return fail('할일 등록에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }

    const id = String(data.id);
    revalidateTodo();

    // redirect는 예외를 던져 흐름을 끊으므로, revalidatePath보다 뒤에 와야 합니다.
    redirect(`/todo/${id}/view`);
}

/**
 * 할일 제목·내용 수정
 * 폼에서는 updateTodoAction.bind(null, id) 로 id를 미리 묶어서 사용합니다.
 */
export async function updateTodoAction(
    id: string,
    _prevState: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return fail(LOGIN_REQUIRED);

    const idResult = todoIdSchema.safeParse(id);
    if (!idResult.success) return fail(INVALID_ID);

    const parsed = parseTodoForm(formData);
    if (!parsed.success) {
        return { success: false, errors: toFieldErrors(parsed.error) };
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('todos')
        .update({ ...parsed.data, updated_at: new Date().toISOString() })
        .eq('id', idResult.data)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id')
        .maybeSingle();

    if (error) {
        console.error(`할일 수정 실패 [id: ${id}]:`, error.message);
        return fail('할일 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.');
    }
    if (!data) return fail(NOT_FOUND);

    revalidateTodo(idResult.data);
    redirect(`/todo/${idResult.data}/view`);
}

/** 할일 상태 변경 (목록에서 낙관적 업데이트와 함께 호출) */
export async function changeTodoStatusAction(
    id: string,
    status: TodoStatus,
): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return fail(LOGIN_REQUIRED);

    const idResult = todoIdSchema.safeParse(id);
    const statusResult = todoStatusSchema.safeParse(status);
    if (!idResult.success) return fail(INVALID_ID);
    if (!statusResult.success) return fail('잘못된 할일 상태입니다.');

    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('todos')
        .update({
            status: statusResult.data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', idResult.data)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id')
        .maybeSingle();

    if (error) {
        console.error(`할일 상태 변경 실패 [id: ${id}]:`, error.message);
        return fail('상태 변경에 실패했습니다.');
    }
    if (!data) return fail(NOT_FOUND);

    revalidateTodo(idResult.data);
    return { success: true };
}

/**
 * 할일 삭제 (soft delete)
 * 행을 지우지 않고 deleted_at 을 기록합니다. 모든 조회가 .is('deleted_at', null) 로
 * 걸러내므로 화면에서는 삭제된 것처럼 보이고, 데이터는 복구할 수 있게 남습니다.
 * export하지 않은 내부 함수이므로 클라이언트에서 직접 호출할 수 없습니다.
 */
async function softDeleteTodo(id: string): Promise<ActionState> {
    const user = await getCurrentUser();
    if (!user) return fail(LOGIN_REQUIRED);

    const idResult = todoIdSchema.safeParse(id);
    if (!idResult.success) return fail(INVALID_ID);

    const supabase = createServerClient();
    const { data, error } = await supabase
        .from('todos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', idResult.data)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .select('id')
        .maybeSingle();

    if (error) {
        console.error(`할일 삭제 실패 [id: ${id}]:`, error.message);
        return fail('삭제에 실패했습니다.');
    }
    if (!data) return fail(NOT_FOUND);

    return { success: true, message: '할일이 삭제되었습니다.' };
}

/** 목록에서 삭제: 목록만 다시 그립니다. (낙관적 업데이트와 함께 사용) */
export async function deleteTodoAction(id: string): Promise<ActionState> {
    const result = await softDeleteTodo(id);
    if (result.success) revalidatePath('/');
    return result;
}

/**
 * 상세 페이지에서 삭제: 성공하면 서버에서 바로 목록으로 redirect 합니다.
 * 상세 경로를 다시 렌더링하지 않으므로 "찾을 수 없음" 화면이 잠깐 보이는 일이 없습니다.
 */
export async function deleteTodoAndRedirectAction(
    id: string,
): Promise<ActionState> {
    const result = await softDeleteTodo(id);
    if (!result.success) return result;

    revalidatePath('/');
    redirect('/');
}
