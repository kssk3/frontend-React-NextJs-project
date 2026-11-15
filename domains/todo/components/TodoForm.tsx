'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, useState } from 'react';
import FormField from '@/shared/components/FormField';
import TiptapEditor from '@/shared/components/TiptapEditor';
import { Button, buttonVariants } from '@/shared/components/ui/button';
import { INITIAL_ACTION_STATE } from '@/shared/types/action.types';
import { addTodoAction, updateTodoAction } from '../actions/todo.actions';
import type { Todo } from '../types/todo.types';

interface TodoFormProps {
    /** 전달하면 수정 모드, 없으면 등록 모드로 동작합니다. */
    todo?: Pick<Todo, 'id' | 'title' | 'content'>;
}

/**
 * 등록과 수정 화면이 함께 쓰는 폼입니다.
 *
 * Next.js는 이전 페이지를 언마운트하지 않고 <Activity>로 숨겨 두기 때문에
 * "+ 새 할일"을 다시 눌러도 지난번 입력값과 결과 메시지가 그대로 남아 있습니다.
 * bfcacheId를 key로 주면 링크 이동(push/replace) 때는 폼을 새로 만들고,
 * 브라우저 뒤로/앞으로 가기 때는 작성 중이던 내용을 그대로 복원합니다.
 */
export default function TodoForm(props: TodoFormProps) {
    const { bfcacheId } = useRouter();
    return <TodoFormFields key={bfcacheId} {...props} />;
}

function TodoFormFields({ todo }: TodoFormProps) {
    const isEdit = todo !== undefined;

    // 수정 모드에서는 bind로 id를 첫 번째 인자에 미리 묶어
    // useActionState가 요구하는 (prevState, formData) 형태로 맞춥니다.
    const action = isEdit ? updateTodoAction.bind(null, todo.id) : addTodoAction;
    const [state, formAction, isPending] = useActionState(
        action,
        INITIAL_ACTION_STATE,
    );

    const [title, setTitle] = useState(todo?.title ?? '');
    // 에디터 HTML은 hidden input으로 FormData에 실어 보냅니다.
    const [content, setContent] = useState(todo?.content ?? '');

    // 저장에 성공하면 서버 액션이 redirect하므로, 여기서는 실패 결과만 표시합니다.

    const cancelHref = isEdit ? `/todo/${todo.id}/view` : '/';

    return (
        <form action={formAction} noValidate autoComplete="off">
            {state.message && !state.success && (
                <p
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                >
                    {state.message}
                </p>
            )}

            <input type="hidden" name="content" value={content} />

            <FormField
                label="할일"
                type="text"
                name="title"
                placeholder="할일을 입력하세요..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={state.errors?.title}
            />

            <div className="mb-4">
                <span className="mb-1 block text-sm font-medium">내용</span>
                <TiptapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="할일의 상세 내용을 입력하세요..."
                    ariaLabel="내용"
                    // 에디터 속성은 생성 시 한 번만 적용되므로 고정 id를 연결합니다.
                    // (에러가 없을 때는 해당 id 요소가 없어 아무것도 읽히지 않습니다)
                    ariaDescribedBy="content-error"
                />
                {state.errors?.content && (
                    <p id="content-error" className="mt-1 text-sm text-red-600">
                        {state.errors.content}
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-2">
                <Link
                    href={cancelHref}
                    className={buttonVariants({ variant: 'outline' })}
                >
                    취소
                </Link>
                <Button type="submit" disabled={isPending}>
                    {isPending ? '저장중...' : isEdit ? '수정하기' : '등록하기'}
                </Button>
            </div>
        </form>
    );
}
