'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/shared/lib/supabase';
import { resolveRedirectPath } from '@/shared/constants/routes';
import type { ActionState } from '@/shared/types/action.types';
import { toFieldErrors } from '@/shared/utils/zodErrors';
import { signInSchema } from '../schemas/auth.schemas';

export async function signInAction(
    _prevState: ActionState,
    formData: FormData,
): Promise<ActionState> {
    // 입력값 유효성 검사 (Zod 스키마 — 클라이언트 검증과 별개로 서버에서 반드시 다시 검사)
    const parsed = signInSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!parsed.success) {
        return { success: false, errors: toFieldErrors(parsed.error) };
    }

    const supabase = createServerClient();

    const { data: authData, error: signError } =
        await supabase.auth.signInWithPassword(parsed.data);

    if (signError || !authData.user) {
        return {
            success: false,
            message: '이메일 또는 비밀번호가 일치하지 않습니다.',
        };
    }

    const user = authData.user;
    const { data: profile } = await supabase
        .from('profiles')
        .select('id, deleted_at')
        .eq('id', user.id)
        .maybeSingle();

    if (profile?.deleted_at) {
        await supabase.auth.signOut();
        return { success: false, message: '탈퇴한 회원입니다.' };
    }

    // 이메일 인증을 거쳐 처음 로그인한 경우처럼 프로필이 아직 없으면,
    // 가입 때 저장한 user_metadata.name 으로 지금 만듭니다. (트리거가 있으면 이미 존재)
    if (!profile) {
        const name =
            (user.user_metadata?.name as string | undefined) ??
            user.email?.split('@')[0] ??
            '회원';
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert(
                { id: user.id, name },
                { onConflict: 'id', ignoreDuplicates: true },
            );

        if (profileError) {
            console.error('프로필 생성 실패:', profileError.message);
            await supabase.auth.signOut();
            return {
                success: false,
                message: '회원 프로필을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.',
            };
        }
    }

    revalidatePath('/', 'layout'); // layout: 하위 전체 경로, page: 해당 페이지만

    // 원래 가려던 페이지로 이동합니다. 값은 클라이언트가 보낸 것이므로 서버에서 다시 검증합니다.
    const redirectTo = formData.get('redirectUrl');
    redirect(
        resolveRedirectPath(typeof redirectTo === 'string' ? redirectTo : null),
    );
}
