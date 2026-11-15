import { connection } from 'next/server';
import TodoDashBoard from '@/domains/todo/components/TodoDashBoard';
import { getTodos } from '@/domains/todo/queries/getTodos.query';

// 세션에 따라 결과가 달라지는 페이지라 즉시 네비게이션(instant navigation) 검증에서 제외합니다.
// 요청마다 렌더링되게 만드는 것은 아래 connection() 호출입니다.
export const instant = false;

/**
 * 서버 컴포넌트: 할일 목록을 서버에서 조회해 HTML에 포함시켜 보냅니다.
 * - 브라우저에서 useEffect로 조회하면 "빈 화면 → 로딩 → 목록" 순서가 되지만,
 *   서버에서 조회하면 첫 응답부터 목록이 들어 있습니다.
 * - Supabase 키와 쿼리가 클라이언트 번들에 포함되지 않습니다.
 * - 로딩 중에는 loading.tsx, 실패하면 error.tsx가 대신 보입니다.
 */
export default async function TodoPage(): Promise<React.JSX.Element> {
    // 요청 시점에 동적으로 렌더링되도록 선언
    await connection();
    const todos = await getTodos();

    return <TodoDashBoard initialItems={todos} />;
}
