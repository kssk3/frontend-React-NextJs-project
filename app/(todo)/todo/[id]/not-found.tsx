import Link from 'next/link';
import { buttonVariants } from '@/shared/components/ui/button';

// /todo/[id]/view, /todo/[id]/edit 에서 notFound()를 호출하면 표시됩니다.
export default function TodoNotFound() {
    return (
        <div className="rounded-xl border border-dashed p-10 text-center">
            <h2 className="mb-2 font-bold">할일을 찾을 수 없습니다.</h2>
            <p className="mb-4 text-sm text-zinc-500">
                삭제되었거나 존재하지 않는 할일입니다.
            </p>
            <Link href="/" className={buttonVariants({ variant: 'outline' })}>
                목록으로
            </Link>
        </div>
    );
}
