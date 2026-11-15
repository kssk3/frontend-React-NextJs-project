// 서버(Vercel, UTC)와 브라우저(KST)의 시간대가 달라도 같은 문자열이 나오도록
// 시간대를 고정합니다. 고정하지 않으면 SSR 결과와 하이드레이션 결과가 달라질 수 있습니다.
const dateFormatter = new Intl.DateTimeFormat('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Seoul',
});

export function formatDate(value?: string): string {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}
