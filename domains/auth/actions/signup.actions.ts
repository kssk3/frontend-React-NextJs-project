'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DEFAULT_AFTER_LOGIN } from '@/shared/constants/routes';
import { createServerClient } from '@/shared/lib/supabase';
import type { ActionState } from '@/shared/types/action.types';
import { toFieldErrors } from '@/shared/utils/zodErrors';
import { signUpSchema } from '../schemas/auth.schemas';

export async function signUpAction(
    _prevState: ActionState,
    formData: FormData,
): Promise<ActionState> {
    // 필드별 유효성 검사
    const parsed = signUpSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        passwordConfirm: formData.get('passwordConfirm'),
    });

    if (!parsed.success) {
        return { success: false, errors: toFieldErrors(parsed.error) };
    }

    const { name, email, password } = parsed.data;
    const supabase = createServerClient();

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        // DB 트리거(handle_new_user)가 있다면 이 메타데이터로 profiles 행을 만듭니다.
        options: { data: { name } },
    });

    if (signUpError || !authData.user) {
        const errorMessage = signUpError?.message?.toLowerCase() ?? '';
        const isDuplicate =
            errorMessage.includes('already registered') ||
            errorMessage.includes('already exists');

        return {
            success: false,
            message: isDuplicate
                ? '이미 가입된 이메일 주소입니다. 다른 이메일을 사용해 주세요.'
                : '회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        };
    }

    // 이메일 인증이 꺼져 있으면 가입 직후 세션이 생깁니다.
    // 세션이 있을 때만 profiles를 보장합니다. (세션이 없으면 RLS 때문에 insert가 거부됩니다)
    if (authData.session) {
        // 트리거가 이미 행을 만들었다면 충돌을 무시합니다 (INSERT ... ON CONFLICT DO NOTHING).
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert(
                { id: authData.user.id, name },
                { onConflict: 'id', ignoreDuplicates: true },
            );

        if (profileError) {
            console.error('프로필 생성 실패:', profileError.message);
            return {
                success: false,
                message: '회원 프로필 생성에 실패했습니다.',
            };
        }
    }

    if (!authData.session) {
        // 이메일 인증 대기: 이동하지 않고 폼에 안내 메시지를 보여줍니다.
        // 프로필은 인증 후 첫 로그인 때 만들어집니다(login.action.ts).
        return {
            success: true,
            message: '가입 확인 메일을 보냈습니다. 메일 인증 후 로그인해 주세요.',
        };
    }

    revalidatePath('/', 'layout');
    redirect(DEFAULT_AFTER_LOGIN);
}
