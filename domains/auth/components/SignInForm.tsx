'use client';

import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { signInAction } from '@/domains/auth/actions/login.action';
import FormField from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import useFormState from '@/shared/hooks/useFormState';
import { INITIAL_ACTION_STATE } from '@/shared/types/action.types';

interface SignInFormValues {
    email: string;
}

const initialForm: SignInFormValues = {
    email: '',
};

export default function SignInForm(): React.JSX.Element {
    const searchParams = useSearchParams();
    // proxy가 붙여준 ?redirectUrl= 값을 hidden input으로 서버 액션에 넘깁니다.
    // 안전한 경로인지는 서버(signInAction)에서 검증한 뒤 redirect 합니다.
    const redirectUrl = searchParams.get('redirectUrl') ?? '';

    const [state, formAction, isPending] = useActionState(
        signInAction,
        INITIAL_ACTION_STATE,
    );

    // 이메일은 제어 컴포넌트로 두어 실패해도 입력값이 유지되고,
    // 비밀번호는 비제어로 두어 제출 후 React가 폼을 초기화할 때 비워집니다.
    const [form, onChange] = useFormState(initialForm);

    return (
        <form action={formAction} noValidate autoComplete="off">
            <input type="hidden" name="redirectUrl" value={redirectUrl} />
            {state.message && !state.success && (
                <p
                    role="alert"
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                >
                    {state.message}
                </p>
            )}
            <FormField
                label="이메일"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                error={state.errors?.email}
            />
            <FormField
                label="비밀번호"
                type="password"
                name="password"
                placeholder="비밀번호"
                error={state.errors?.password}
            />
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? '처리중...' : '로그인'}
            </Button>
        </form>
    );
}
