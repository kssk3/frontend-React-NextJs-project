import type { Metadata } from 'next';
import Link from 'next/link';
import SignUpForm from '@/domains/auth/components/SignUpForm';

export const metadata: Metadata = {
    title: '회원가입',
};

export default function SignUpPage(): React.JSX.Element {
    return (
        <section className="mx-auto max-w-sm">
            <h1 className="mb-4 text-xl font-bold">회원가입</h1>
            <SignUpForm />
            <p className="mt-4 text-center text-sm text-zinc-500">
                이미 회원이신가요?{' '}
                <Link href="/sign_in" className="text-indigo-600 hover:underline">
                    로그인
                </Link>
            </p>
        </section>
    );
}
