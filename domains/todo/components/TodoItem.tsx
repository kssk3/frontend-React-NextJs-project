import Link from 'next/link';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { formatDate } from '@/shared/utils/formatDate';
import {
    TODO_STATUSES,
    TODO_STATUS_LABEL,
    type Todo,
    type TodoStatus,
} from '../types/todo.types';

interface TodoItemProps {
    todo: Todo;
    onStatusChange: (id: string, status: TodoStatus) => void;
    onDelete: (id: string) => void;
    /** 다른 변경 요청이 진행 중일 때 중복 조작을 막습니다. */
    disabled?: boolean;
}

/**
 * 할일 한 줄을 그리는 표시 전용 컴포넌트입니다.
 * 데이터 변경 방법은 모르고, 사용자의 의도만 콜백 props로 부모에게 알립니다.
 * ('use client'가 없어도 클라이언트 컴포넌트(TodoDashBoard)가 import하므로
 *  자동으로 클라이언트 번들에 포함됩니다. 'use client'는 경계가 되는 파일에만 붙입니다.)
 */
export default function TodoItem({
    todo,
    onStatusChange,
    onDelete,
    disabled = false,
}: TodoItemProps) {
    const isDone = todo.status === 'DONE';

    return (
        <li className="flex items-center gap-3 rounded-xl border p-3">
            <select
                aria-label={`"${todo.title}" 상태 변경`}
                value={todo.status}
                disabled={disabled}
                onChange={(e) =>
                    onStatusChange(todo.id, e.target.value as TodoStatus)
                }
                className="rounded-md border bg-white px-2 py-1 text-sm"
            >
                {TODO_STATUSES.map((status) => (
                    <option key={status} value={status}>
                        {TODO_STATUS_LABEL[status]}
                    </option>
                ))}
            </select>

            <div className="min-w-0 grow">
                <Link
                    href={`/todo/${todo.id}/view`}
                    className={cn(
                        'block truncate font-medium hover:underline',
                        isDone && 'text-zinc-400 line-through',
                    )}
                >
                    {todo.title}
                </Link>
                <time
                    dateTime={todo.createdAt}
                    className="text-xs text-zinc-500"
                >
                    {formatDate(todo.createdAt)}
                </time>
            </div>

            <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={disabled}
                onClick={() => onDelete(todo.id)}
                aria-label={`"${todo.title}" 삭제`}
            >
                삭제
            </Button>
        </li>
    );
}
