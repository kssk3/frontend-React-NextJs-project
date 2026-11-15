'use client';

import Link from 'next/link';
import { useEffect, useOptimistic, useState, useTransition } from 'react';
import { buttonVariants } from '@/shared/components/ui/button';
import type { ActionState } from '@/shared/types/action.types';
import {
    changeTodoStatusAction,
    deleteTodoAction,
} from '../actions/todo.actions';
import type { Todo, TodoStatus } from '../types/todo.types';
import TodoFilter, { type TodoFilterValue } from './TodoFilter';
import TodoItem from './TodoItem';

interface TodoDashBoardProps {
    /** 서버 컴포넌트(page.tsx)가 조회해서 내려준 초기 목록 */
    initialItems: Todo[];
}

type OptimisticAction =
    | { type: 'status'; id: string; status: TodoStatus }
    | { type: 'delete'; id: string };

// 서버 응답을 기다리지 않고 화면에 먼저 반영할 "예상 결과"를 계산하는 순수 함수
function applyOptimisticAction(
    items: Todo[],
    action: OptimisticAction,
): Todo[] {
    switch (action.type) {
        case 'status':
            return items.map((todo) =>
                todo.id === action.id
                    ? { ...todo, status: action.status }
                    : todo,
            );
        case 'delete':
            return items.filter((todo) => todo.id !== action.id);
    }
}

const ERROR_DISMISS_MS = 3000;

/**
 * 클라이언트 컴포넌트: 필터 선택, 상태 변경, 삭제처럼 사용자와 상호작용하는 부분만 담당합니다.
 * 데이터 조회는 서버(page.tsx)에서 끝내고 props로 받으므로, 첫 화면부터 목록이 HTML에 들어 있습니다.
 */
export default function TodoDashBoard({ initialItems }: TodoDashBoardProps) {
    // useOptimistic: 액션이 진행되는 동안에만 낙관적 상태를 보여주고,
    // 액션이 끝나면 서버가 다시 내려준 initialItems로 자동으로 맞춰집니다(실패 시 원래대로 복구).
    const [items, addOptimistic] = useOptimistic(
        initialItems,
        applyOptimisticAction,
    );
    const [filter, setFilter] = useState<TodoFilterValue>('ALL');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // 오류 메시지를 3초 뒤 자동으로 숨깁니다.
    // 클린업에서 타이머를 해제해야, 3초 안에 새 오류가 나거나 화면을 벗어났을 때
    // 이전 타이머가 엉뚱한 시점에 상태를 바꾸지 않습니다.
    useEffect(() => {
        if (!errorMessage) return;
        const timer = window.setTimeout(
            () => setErrorMessage(null),
            ERROR_DISMISS_MS,
        );
        return () => window.clearTimeout(timer);
    }, [errorMessage]);

    const runMutation = (
        optimistic: OptimisticAction,
        mutate: () => Promise<ActionState>,
    ) => {
        setErrorMessage(null);
        startTransition(async () => {
            addOptimistic(optimistic);
            try {
                const result = await mutate();
                if (!result.success) {
                    setErrorMessage(
                        result.message ?? '요청을 처리하지 못했습니다.',
                    );
                }
            } catch {
                // 네트워크 오류 등으로 액션 호출 자체가 실패한 경우에도
                // 목록 전체를 error.tsx로 바꾸지 않고 메시지만 보여줍니다.
                setErrorMessage('서버와 통신하지 못했습니다. 다시 시도해 주세요.');
            }
        });
    };

    const handleStatusChange = (id: string, status: TodoStatus) => {
        runMutation({ type: 'status', id, status }, () =>
            changeTodoStatusAction(id, status),
        );
    };

    const handleDelete = (id: string) => {
        if (!window.confirm('이 할일을 삭제할까요?')) return;
        runMutation({ type: 'delete', id }, () => deleteTodoAction(id));
    };

    const counts: Record<TodoFilterValue, number> = {
        ALL: items.length,
        READY: 0,
        PROGRESS: 0,
        DONE: 0,
    };
    for (const todo of items) counts[todo.status] += 1;

    const visibleItems =
        filter === 'ALL'
            ? items
            : items.filter((todo) => todo.status === filter);

    return (
        <section>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">내 할일</h1>
                <Link href="/todo/new" className={buttonVariants()}>
                    + 새 할일
                </Link>
            </div>

            {errorMessage && (
                <p
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                >
                    {errorMessage}
                </p>
            )}

            {items.length === 0 ? (
                // 빈 데이터 상태: 할일이 하나도 없을 때
                <div className="rounded-xl border border-dashed p-10 text-center text-zinc-500">
                    <p className="mb-3">아직 등록된 할일이 없습니다.</p>
                    <Link
                        href="/todo/new"
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        첫 할일 등록하기
                    </Link>
                </div>
            ) : (
                <>
                    <TodoFilter
                        value={filter}
                        counts={counts}
                        onChange={setFilter}
                    />
                    {visibleItems.length === 0 ? (
                        <p className="p-6 text-center text-zinc-500">
                            해당 상태의 할일이 없습니다.
                        </p>
                    ) : (
                        <ul
                            aria-busy={isPending}
                            className="flex flex-col gap-2"
                        >
                            {/* key는 배열 index가 아니라 고유한 id를 사용합니다. */}
                            {visibleItems.map((todo) => (
                                <TodoItem
                                    key={todo.id}
                                    todo={todo}
                                    onStatusChange={handleStatusChange}
                                    onDelete={handleDelete}
                                    disabled={isPending}
                                />
                            ))}
                        </ul>
                    )}
                </>
            )}
        </section>
    );
}
