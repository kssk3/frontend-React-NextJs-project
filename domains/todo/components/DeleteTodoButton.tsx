'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/shared/components/ui/button';
import { deleteTodoAndRedirectAction } from '../actions/todo.actions';

interface DeleteTodoButtonProps {
    id: string;
}

/**
 * 상세 페이지(서버 컴포넌트) 안에서 클릭 이벤트가 필요한 삭제 버튼만 클라이언트로 분리했습니다.
 * 페이지 전체를 'use client'로 만들지 않아도 됩니다.
 */
export default function DeleteTodoButton({ id }: DeleteTodoButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const onClick = () => {
        if (!window.confirm('이 할일을 삭제할까요?')) return;

        startTransition(async () => {
            // 성공하면 서버 액션이 목록('/')으로 redirect하므로 실패만 처리합니다.
            const result = await deleteTodoAndRedirectAction(id);
            if (!result.success) {
                setError(result.message ?? '삭제에 실패했습니다.');
            }
        });
    };

    return (
        <>
            <Button
                type="button"
                variant="destructive"
                disabled={isPending}
                onClick={onClick}
            >
                {isPending ? '삭제중...' : '삭제'}
            </Button>
            {error && (
                <p role="alert" className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </>
    );
}
