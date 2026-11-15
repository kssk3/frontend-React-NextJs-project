import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import TodoForm from '@/domains/todo/components/TodoForm';
import { getTodoById } from '@/domains/todo/queries/getTodoById.query';

export const instant = false;

export const metadata: Metadata = {
    title: '할일 수정',
};

/** 서버에서 기존 값을 조회해 폼(클라이언트)의 초기값으로 넘깁니다. */
export default async function EditTodoPage({
    params,
}: PageProps<'/todo/[id]/edit'>): Promise<React.JSX.Element> {
    await connection();
    const { id } = await params;
    const todo = await getTodoById(id);

    if (!todo) notFound();

    return (
        <>
            <h1 className="mb-4 text-xl font-bold">할일 수정</h1>
            <TodoForm
                todo={{ id: todo.id, title: todo.title, content: todo.content }}
            />
        </>
    );
}
