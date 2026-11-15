import { z } from 'zod';
import { stripHtml } from '@/shared/utils/html';
import { TODO_STATUSES } from '../types/todo.types';

const TITLE_REQUIRED = '할일 제목을 입력해 주세요.';
const CONTENT_REQUIRED = '할일 내용을 입력해 주세요.';

export const todoInputSchema = z.object({
    title: z
        .string({ error: TITLE_REQUIRED })
        .trim()
        .min(1, { error: TITLE_REQUIRED })
        .max(100, { error: '제목은 100자 이하로 입력해 주세요.' }),
    // 빈 에디터도 '<p></p>'를 보내므로 태그를 제거한 텍스트로 비었는지 판단합니다.
    content: z
        .string({ error: CONTENT_REQUIRED })
        .refine((html) => stripHtml(html).length > 0, {
            error: CONTENT_REQUIRED,
        }),
});

// 클라이언트가 보낸 값은 신뢰하지 않습니다. 상태값과 id는 서버에서 다시 검증합니다.
export const todoStatusSchema = z.enum(TODO_STATUSES);
export const todoIdSchema = z.string().trim().min(1);

export type TodoInput = z.infer<typeof todoInputSchema>;
