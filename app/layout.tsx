import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    // 하위 페이지가 title을 지정하면 "할일 제목 | TODO APP" 형태로 표시됩니다.
    title: { default: 'TODO APP', template: '%s | TODO APP' },
    description: 'Next.js + Supabase 기반 회원 전용 할일 관리 서비스',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html
            lang="ko"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col">{children}</body>
        </html>
    );
}
