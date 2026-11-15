import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import DeleteTodoButton from '@/domains/todo/components/DeleteTodoButton';
import { getTodoById } from '@/domains/todo/queries/getTodoById.query';
import { TODO_STATUS_LABEL } from '@/domains/todo/types/todo.types';
import TiptapEditor from '@/shared/components/TiptapEditor';
import { buttonVariants } from '@/shared/components/ui/button';
import { formatDate } from '@/shared/utils/formatDate';
import { stripHtml } from '@/shared/utils/html';

export const instant = false;

// 동적 라우트 파라미터: /todo/[id]/view 의 [id] 값은 Promise로 전달됩니다.
export async function generateMetadata({
    params,
}: PageProps<'/todo/[id]/view'>): Promise<Metadata> {
    await connection();
    const { id } = await params;
    // getTodoById는 cache()로 감싸져 있어 아래 페이지 본문과 조회를 공유합니다.
    const todo = await getTodoById(id);

    if (!todo) return { title: '할일을 찾을 수 없습니다' };

    return {
        title: todo.title,
        description: stripHtml(todo.content).slice(0, 120),
    };
}

/** 서버 컴포넌트: 할일 상세. 삭제 버튼과 본문 뷰어만 클라이언트 컴포넌트입니다. */
export default async function TodoViewPage({
    params,
}: PageProps<'/todo/[id]/view'>): Promise<React.JSX.Element> {
    await connection();
    const { id } = await params;
    const todo = await getTodoById(id);

    // 존재하지 않거나 다른 사람의 할일이면 404 (같은 폴더 위의 not-found.tsx 표시)
    if (!todo) notFound();

    return (
        <article>
            <Link
                href="/"
                className="mb-4 inline-block text-sm text-zinc-500 hover:underline"
            >
                ← 목록으로
            </Link>

            <header className="mb-4 border-b pb-4">
                <span className="mb-2 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                    {TODO_STATUS_LABEL[todo.status]}
                </span>
                <h1 className="text-2xl font-bold break-words">{todo.title}</h1>
                <p className="mt-1 text-xs text-zinc-500">
                    작성 {formatDate(todo.createdAt)}
                    {todo.updatedAt && ` · 수정 ${formatDate(todo.updatedAt)}`}
                </p>
            </header>

            <TiptapEditor
                content={todo.content}
                editable={false}
                className="mb-8 min-h-24"
            />

            <div className="flex justify-end gap-2">
                <Link
                    href={`/todo/${todo.id}/edit`}
                    className={buttonVariants({ variant: 'outline' })}
                >
                    수정
                </Link>
                <DeleteTodoButton id={todo.id} />
            </div>
        </article>
    );
}
