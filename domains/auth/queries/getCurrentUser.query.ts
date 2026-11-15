// 서버 전용 조회 함수 — 'use server'(클라이언트 호출용 액션)가 아니라 'server-only'로 보호합니다.
import 'server-only';

import { cache } from 'react';
import { createServerClient } from '@/shared/lib/supabase';
import type { UserProfile } from '../types/auth.types';

/**
 * 현재 로그인한 사용자 프로필을 반환합니다. (Data Access Layer)
 * React cache()로 감싸서 한 번의 렌더링 안에서 Header, 페이지, generateMetadata가
 * 여러 번 불러도 인증 확인과 profiles 조회는 한 번만 실행됩니다.
 * (Server Action 안에서는 cache가 적용되지 않아 호출할 때마다 조회합니다.)
 */
export const getCurrentUser = cache(async (): Promise<UserProfile | null> => {
    const supabase = createServerClient();

    // getSession()은 쿠키 값을 그대로 믿지만, getUser()는 Supabase Auth 서버에서 토큰을 검증합니다.
    const {
        data: { user: authUser },
        error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) return null;

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .is('deleted_at', null)
        .maybeSingle();

    if (!profile) return null;

    return {
        id: profile.id,
        name: profile.name,
        email: authUser.email,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
        deletedAt: profile.deleted_at,
    };
});
