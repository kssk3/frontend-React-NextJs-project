import Link from 'next/link';
import { connection } from 'next/server';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import SignOutButton from '@/domains/auth/components/SignOutButton';
import { getCurrentUser } from '@/domains/auth/queries/getCurrentUser.query';
import { buttonVariants } from '@/shared/components/ui/button';

/**
 * 서버 컴포넌트: 쿠키(세션)를 읽어 로그인 상태에 맞는 메뉴를 그립니다.
 * 세션 읽기는 요청 시점에만 가능하므로 layout에서 <Suspense>로 감싸서
 * 이 영역만 나중에 스트리밍되고, 나머지 화면은 기다리지 않게 합니다.
 * 로그아웃 버튼처럼 클릭 이벤트가 필요한 부분만 클라이언트 컴포넌트로 분리합니다.
 */
export default async function Header(): Promise<React.JSX.Element> {
    // 세션 확인 중 Supabase가 Date.now()를 호출하므로, 미리 렌더링(prerender)이 아닌 요청 시점에 실행되도록 미룬다
    await connection();
    const user = await getCurrentUser();

    return (
        <header className="mb-4 flex h-14 items-center justify-between rounded-b-xl bg-indigo-100 px-4">
            <Link href="/" className="text-lg font-bold text-indigo-700">
                TODO APP
            </Link>
            <nav className="flex items-center gap-2 text-sm">
                {user ? (
                    <>
                        <span>
                            <strong>{user.name}</strong>님
                        </span>
                        <SignOutButton />
                    </>
                ) : (
                    <>
                        {/* <a> 안에 <button>을 넣지 않고, 링크 자체에 버튼 스타일을 입힙니다. */}
                        <Link
                            href="/sign_in"
                            className={buttonVariants({ variant: 'outline' })}
                        >
                            <FaSignInAlt /> 로그인
                        </Link>
                        <Link
                            href="/sign_up"
                            className={buttonVariants({
                                variant: 'secondary',
                            })}
                        >
                            <FaUserPlus /> 회원가입
                        </Link>
                    </>
                )}
            </nav>
        </header>
    );
}
