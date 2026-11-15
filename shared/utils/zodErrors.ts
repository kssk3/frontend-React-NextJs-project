import { z } from 'zod';

/**
 * Zod 검증 에러를 `{ 필드명: 첫 번째 에러 메시지 }` 형태로 변환합니다.
 * 폼 컴포넌트는 필드마다 메시지 하나만 보여주면 되므로 첫 메시지만 남깁니다.
 */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
    const { fieldErrors } = z.flattenError(error);
    const result: Record<string, string> = {};

    for (const [field, messages] of Object.entries(fieldErrors)) {
        const first = (messages as string[] | undefined)?.[0];
        if (first) result[field] = first;
    }

    return result;
}
