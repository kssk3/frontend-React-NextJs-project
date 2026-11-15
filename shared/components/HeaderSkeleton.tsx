// Header가 세션을 확인하는 동안 보여주는 자리표시자입니다.
// Header와 같은 높이를 유지해 스트리밍 후 레이아웃이 밀리지 않게 합니다(CLS 방지).
export default function HeaderSkeleton() {
    return (
        <div
            aria-hidden
            className="mb-4 h-14 animate-pulse rounded-b-xl bg-indigo-100"
        />
    );
}
