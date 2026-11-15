'use server';

import { createServerClient } from '@/shared/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/shared/types/action.types';

export async function logoutAction(): Promise<ActionState> {
    const supabase = createServerClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
        return {
            success: false,
            message: `로그아웃 처리 중 오류가 발생했습니다: ${error.message}`,
        };
    }

    revalidatePath('/', 'layout');
    // 서버에서 바로 이동시켜, 로그아웃된 상태로 현재 페이지가 잠깐 다시 그려지는 일을 막습니다.
    redirect('/sign_in');
}
