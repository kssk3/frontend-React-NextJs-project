import { z } from 'zod';

const requiredString = (message: string) =>
    z.string({ error: message }).trim().min(1, { error: message });

const emailSchema = requiredString('이메일 주소를 입력해 주세요.').pipe(
    z.email({ error: '올바른 이메일이 아닙니다.' }),
);

export const signInSchema = z.object({
    email: emailSchema,
    password: z
        .string({ error: '비밀번호를 입력해주세요' })
        .min(1, { error: '비밀번호를 입력해주세요' })
        .min(6, { error: '비밀번호는 최소 6자 이상이어야합니다.' }),
});

export const signUpSchema = z
    .object({
        name: requiredString('이름(닉네임)을 입력해주세요.').min(2, {
            error: '이름은 최소 2자 이상 입력해야만 합니다.',
        }),
        email: emailSchema,
        password: z
            .string({ error: '비밀번호를 입력해주세요' })
            .min(1, { error: '비밀번호를 입력해주세요' })
            .min(8, { error: '비밀번호는 최소 8자 이상이어야합니다' }),
        passwordConfirm: z
            .string({ error: '비밀번호 확인을 입력해주세요' })
            .min(1, { error: '비밀번호를 입력해주세요' }),
    })
    .refine((d) => d.password === d.passwordConfirm, {
        error: '비밀번호가 일치하지 않습니다.',
        path: ['passwordConfirm'],
    });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
