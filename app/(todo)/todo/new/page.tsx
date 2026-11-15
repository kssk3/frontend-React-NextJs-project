import type { Metadata } from 'next';
import TodoForm from '@/domains/todo/components/TodoForm';

export const metadata: Metadata = {
    title: '새 할일',
};

export default function AddTodoPage(): React.JSX.Element {
    return (
        <>
            <h1 className="mb-4 text-xl font-bold">새 할일</h1>
            <TodoForm />
        </>
    );
}
