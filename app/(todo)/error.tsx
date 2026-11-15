'use client'; // 에러 경계(Error Boundary)는 반드시 클라이언트 컴포넌트여야 합니다.

import { useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';

interface ErrorProps {
    error: unknown;
    /** 이 경계 안의 페이지를 다시 요청·렌더링합니다. (Next.js 16: reset → retry) */
    retry: () => void;
}

// 오류 상태 UI: 서버 컴포넌트의 조회 함수(getTodos 등)가 던진 에러를 여기서 받습니다.
export default function TodoError({ error, retry }: ErrorProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-8 text-center"
        >
            <h2 className="mb-2 font-bold text-red-700">
                데이터를 불러오지 못했습니다.
            </h2>
            <p className="mb-4 text-sm text-red-600">
                네트워크 상태를 확인한 뒤 다시 시도해 주세요.
            </p>
            <Button variant="outline" onClick={() => retry()}>
                다시 시도
            </Button>
        </div>
    );
}
