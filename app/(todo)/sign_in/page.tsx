import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import SignInForm from '@/domains/auth/components/SignInForm';

export const metadata: Metadata = {
    title: '로그인',
};

export default function SignInPage(): React.JSX.Element {
    return (
        <section className="mx-auto max-w-sm">
            <h1 className="mb-4 text-xl font-bold">로그인</h1>
            {/* SignInForm은 useSearchParams()로 요청마다 다른 값을 읽으므로 가장 가까운
                Suspense까지 렌더링이 미뤄집니다. 폼 바로 바깥에 경계를 두어 정적 셸에
                제목과 폼 자리가 포함되게 합니다. (없으면 loading.tsx의 목록 스켈레톤이 보입니다) */}
            <Suspense fallback={<SignInFormSkeleton />}>
                <SignInForm />
            </Suspense>
            <p className="mt-4 text-center text-sm text-zinc-500">
                아직 회원이 아니신가요?{' '}
                <Link href="/sign_up" className="text-indigo-600 hover:underline">
                    회원가입
                </Link>
            </p>
        </section>
    );
}

function SignInFormSkeleton() {
    return (
        <div aria-hidden className="flex flex-col gap-3">
            <div className="h-14 animate-pulse rounded-md bg-zinc-100" />
            <div className="h-14 animate-pulse rounded-md bg-zinc-100" />
            <div className="h-8 animate-pulse rounded-lg bg-zinc-200" />
        </div>
    );
}
