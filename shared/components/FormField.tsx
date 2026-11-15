import { Input } from '@/shared/components/ui/input';

interface FormFieldProps extends React.ComponentProps<typeof Input> {
    /** input의 name이자 id로 사용합니다. */
    name: string;
    label: string;
    error?: string;
}

/**
 * 라벨 + 입력칸 + 에러 메시지를 묶은 재사용 컴포넌트입니다.
 * label의 htmlFor와 input의 id를 연결하고, 에러가 있으면 aria-invalid와
 * aria-describedby로 스크린리더에게도 알립니다.
 */
export default function FormField({
    name,
    label,
    error,
    ...inputProps
}: FormFieldProps) {
    const errorId = `${name}-error`;

    return (
        <div className="mb-3">
            <label htmlFor={name} className="mb-1 block text-sm font-medium">
                {label}
            </label>
            <Input
                id={name}
                name={name}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                {...inputProps}
            />
            {error && (
                <p id={errorId} className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
