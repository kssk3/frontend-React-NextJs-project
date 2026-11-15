import { cn } from '@/shared/lib/utils';
import {
    TODO_STATUSES,
    TODO_STATUS_LABEL,
    type TodoStatus,
} from '../types/todo.types';

export type TodoFilterValue = 'ALL' | TodoStatus;

interface TodoFilterProps {
    value: TodoFilterValue;
    counts: Record<TodoFilterValue, number>;
    onChange: (value: TodoFilterValue) => void;
}

const FILTERS: { value: TodoFilterValue; label: string }[] = [
    { value: 'ALL', label: '전체' },
    ...TODO_STATUSES.map((status) => ({
        value: status,
        label: TODO_STATUS_LABEL[status],
    })),
];

/** 상태별 필터 탭 — 선택 값은 부모가 소유하는 제어 컴포넌트입니다. */
export default function TodoFilter({ value, counts, onChange }: TodoFilterProps) {
    return (
        <div role="group" aria-label="상태 필터" className="mb-4 flex gap-1">
            {FILTERS.map((filter) => {
                const selected = filter.value === value;
                return (
                    <button
                        key={filter.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onChange(filter.value)}
                        className={cn(
                            'rounded-full px-3 py-1 text-sm transition-colors',
                            selected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
                        )}
                    >
                        {filter.label} {counts[filter.value]}
                    </button>
                );
            })}
        </div>
    );
}
