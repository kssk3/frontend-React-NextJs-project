// 로딩 상태 UI: 이 폴더의 page가 데이터를 기다리는 동안 Next.js가 자동으로
// <Suspense fallback={<Loading />}>로 감싸서 보여줍니다. 링크를 누르면 즉시 이 화면이 뜹니다.
export default function Loading() {
    return (
        <div role="status" aria-label="불러오는 중" className="flex flex-col gap-2">
            <div className="mb-2 h-8 w-32 animate-pulse rounded-md bg-zinc-200" />
            {Array.from({ length: 3 }, (_, i) => (
                <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-zinc-100"
                />
            ))}
            <span className="sr-only">불러오는 중...</span>
        </div>
    );
}
