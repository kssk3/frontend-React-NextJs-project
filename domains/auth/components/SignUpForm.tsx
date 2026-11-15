'use client';

import { useActionState } from 'react';
import FormField from '@/shared/components/FormField';
import { Button } from '@/shared/components/ui/button';
import useFormState from '@/shared/hooks/useFormState';
import { INITIAL_ACTION_STATE } from '@/shared/types/action.types';
import { signUpAction } from '../actions/signup.actions';

interface SignUpFormValues {
    name: string;
    email: string;
}

const initialForm: SignUpFormValues = {
    name: '',
    email: '',
};

export default function SignUpForm(): React.JSX.Element {
    const [state, formAction, isPending] = useActionState(
        signUpAction,
        INITIAL_ACTION_STATE,
    );

    // 비밀번호 필드는 비제어(uncontrolled)로 두어 제출 후 자동으로 비워집니다.
    const [form, onChange] = useFormState(initialForm);

    return (
        <form action={formAction} noValidate autoComplete="off">
            {/* 가입이 끝나 세션이 생기면 서버 액션이 redirect합니다.
                여기서는 실패 메시지, 또는 이메일 인증 안내(성공)만 표시합니다. */}
            {state.message && (
                <p
                    role={state.success ? 'status' : 'alert'}
                    className={
                        state.success
                            ? 'mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700'
                            : 'mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600'
                    }
                >
                    {state.message}
                </p>
            )}
            <FormField
                label="이메일"
                type="email"
                name="email"
                placeholder="이메일을 입력하세요."
                value={form.email}
                onChange={onChange}
                error={state.errors?.email}
            />
            <FormField
                label="회원명"
                type="text"
                name="name"
                placeholder="회원명을 입력하세요."
                value={form.name}
                onChange={onChange}
                error={state.errors?.name}
            />
            <FormField
                label="비밀번호"
                type="password"
                name="password"
                placeholder="8자 이상 입력하세요."
                error={state.errors?.password}
            />
            <FormField
                label="비밀번호 확인"
                type="password"
                name="passwordConfirm"
                placeholder="비밀번호를 한 번 더 입력하세요."
                error={state.errors?.passwordConfirm}
            />
            <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? '처리중...' : '가입하기'}
            </Button>
        </form>
    );
}
