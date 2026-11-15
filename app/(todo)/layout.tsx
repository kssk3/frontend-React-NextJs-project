import { Suspense } from 'react';
import Header from '@/shared/components/Header';
import HeaderSkeleton from '@/shared/components/HeaderSkeleton';

/**
 * Header만 <Suspense>로 감쌉니다.
 * - Header는 세션(쿠키)을 읽어야 해서 요청 시점까지 기다려야 합니다.
 * - 레이아웃 최상단에서 세션을 기다리면 {children}까지 함께 막히므로,
 *   Header 영역만 스켈레톤을 먼저 보여주고 나중에 스트리밍합니다.
 * - 페이지 영역의 로딩 상태는 같은 폴더의 loading.tsx가 담당합니다.
 */
export default function TodoLayout({
    children,
}: {
    children: React.ReactNode;
}): React.ReactNode {
    return (
        <div className="mx-auto w-full max-w-2xl min-w-xs px-4 pb-10">
            <Suspense fallback={<HeaderSkeleton />}>
                <Header />
            </Suspense>
            <main>{children}</main>
        </div>
    );
}
