/**
 * 에디터(Tiptap)가 만든 HTML에서 태그를 제거한 순수 텍스트를 돌려줍니다.
 * - 빈 에디터는 `<p></p>`를 내보내므로, "내용이 비었는지" 판단할 때 사용합니다.
 * - 메타데이터 description처럼 텍스트만 필요한 곳에도 사용합니다.
 * (화면 출력용 sanitize 함수가 아닙니다. 출력은 Tiptap 스키마 파싱에 맡깁니다.)
 */
export function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
