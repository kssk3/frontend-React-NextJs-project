'use client';

import { useTransition } from 'react';
import { Button } from '@/shared/components/ui/button';
import { logoutAction } from '../actions/logout.action';

export default function SignOutButton() {
    // useTransition: 액션이 진행되는 동안 isPending으로 버튼을 비활성화합니다.
    const [isPending, startTransition] = useTransition();

    const onClick = () => {
        startTransition(async () => {
            // 성공하면 서버 액션이 /sign_in 으로 redirect하므로 실패만 처리합니다.
            const result = await logoutAction();
            if (!result.success) {
                alert(result.message ?? '로그아웃 처리에 실패했습니다.');
            }
        });
    };

    return (
        <Button variant="outline" disabled={isPending} onClick={onClick}>
            {isPending ? '처리중...' : '로그아웃'}
        </Button>
    );
}
