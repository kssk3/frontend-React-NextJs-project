// 로그인(또는 회원가입) 직후 기본으로 이동할 경로
export const DEFAULT_AFTER_LOGIN = '/todo/new';

// 실제로 존재하지 않는 기준 origin. 상대 경로를 해석할 때만 사용합니다.
const INTERNAL_ORIGIN = 'http://internal.invalid';

/**
 * 로그인 후 이동할 경로를 결정합니다.
 * - 원래 가려던 특정 페이지(예: /todo/123/view)는 그대로 존중합니다.
 * - 값이 없거나 '/' 이면 DEFAULT_AFTER_LOGIN 으로 보냅니다.
 * - 외부 사이트로 보내는 값은 차단합니다. (오픈 리다이렉트 방지)
 *
 * 문자열 검사(startsWith('//') 등)만으로는 부족합니다. 예를 들어 "/\t/evil.com"은
 * 검사를 통과하지만, 브라우저 URL 파서는 탭 문자를 지워서 "//evil.com"(외부 주소)으로 해석합니다.
 * 그래서 브라우저와 같은 URL 파서로 실제 해석 결과의 origin을 비교합니다.
 */
export function resolveRedirectPath(raw: string | null | undefined): string {
    if (!raw || !raw.startsWith('/')) return DEFAULT_AFTER_LOGIN;

    let url: URL;
    try {
        url = new URL(raw, INTERNAL_ORIGIN);
    } catch {
        return DEFAULT_AFTER_LOGIN;
    }

    if (url.origin !== INTERNAL_ORIGIN) return DEFAULT_AFTER_LOGIN;

    const path = `${url.pathname}${url.search}${url.hash}`;
    return path === '/' ? DEFAULT_AFTER_LOGIN : path;
}
