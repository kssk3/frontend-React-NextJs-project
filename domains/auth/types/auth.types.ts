// 입력 타입(SignInInput, SignUpInput)은 schemas/auth.schemas.ts 에서 z.infer로 파생합니다.
export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    createdAt: string;
    updatedAt: string | null;
    deletedAt: string | null;
}
