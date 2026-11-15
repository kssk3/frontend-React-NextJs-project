'use client';

import Placeholder from '@tiptap/extension-placeholder';
import {
    EditorContent,
    useEditor,
    useEditorState,
    type Editor,
} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { IconType } from 'react-icons';
import {
    FiBold,
    FiCode,
    FiItalic,
    FiList,
    FiRotateCcw,
    FiRotateCw,
} from 'react-icons/fi';
import { cn } from '@/shared/lib/utils';

interface TiptapEditorProps {
    content?: string;
    placeholder?: string;
    onChange?: (html: string) => void;
    /** false면 툴바 없이 읽기 전용 뷰어로 동작합니다. (상세 페이지 본문 출력) */
    editable?: boolean;
    /** 편집 영역의 접근 가능한 이름 (스크린리더용 라벨) */
    ariaLabel?: string;
    /** 에러 메시지 요소의 id */
    ariaDescribedBy?: string;
    className?: string;
}

interface ToolbarButtonProps {
    label: string;
    icon: IconType;
    onClick: () => void;
    /** 토글 버튼(굵게 등)만 지정합니다. 지정하지 않으면 일반 버튼입니다. */
    active?: boolean;
    disabled?: boolean;
}

function ToolbarButton({
    label,
    icon: Icon,
    onClick,
    active,
    disabled = false,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            aria-pressed={active}
            className={cn(
                'rounded-lg p-2 text-xs font-semibold text-gray-600 hover:bg-white hover:text-gray-900 disabled:opacity-30',
                active && 'bg-white text-blue-600 shadow-sm',
            )}
        >
            <Icon className="h-3.5 w-3.5" />
        </button>
    );
}

function Toolbar({ editor }: { editor: Editor }) {
    // Tiptap 3은 기본적으로 에디터 트랜잭션마다 React를 리렌더링하지 않습니다.
    // useEditorState로 필요한 값만 구독해야 커서 이동·입력 시 버튼 상태가 갱신됩니다.
    const state = useEditorState({
        editor,
        selector: ({ editor }) => ({
            isBold: editor.isActive('bold'),
            isItalic: editor.isActive('italic'),
            isBulletList: editor.isActive('bulletList'),
            isCodeBlock: editor.isActive('codeBlock'),
            canUndo: editor.can().undo(),
            canRedo: editor.can().redo(),
        }),
    });

    return (
        <div
            role="toolbar"
            aria-label="서식"
            className="flex flex-wrap items-center gap-1 border-b border-gray-100 bg-gray-50/70 p-2"
        >
            <ToolbarButton
                label="굵게"
                icon={FiBold}
                active={state.isBold}
                onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
                label="기울임"
                icon={FiItalic}
                active={state.isItalic}
                onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
                label="글머리 목록"
                icon={FiList}
                active={state.isBulletList}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <ToolbarButton
                label="코드 블록"
                icon={FiCode}
                active={state.isCodeBlock}
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            />
            <div className="mx-1 h-4 w-px bg-gray-200" />
            <ToolbarButton
                label="실행 취소"
                icon={FiRotateCcw}
                disabled={!state.canUndo}
                onClick={() => editor.chain().focus().undo().run()}
            />
            <ToolbarButton
                label="다시 실행"
                icon={FiRotateCw}
                disabled={!state.canRedo}
                onClick={() => editor.chain().focus().redo().run()}
            />
        </div>
    );
}

export default function TiptapEditor({
    content = '',
    placeholder = '내용을 작성하세요.',
    onChange,
    editable = true,
    ariaLabel,
    ariaDescribedBy,
    className,
}: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit, Placeholder.configure({ placeholder })],
        content,
        editable,
        immediatelyRender: false, // Next.js SSR 환경에서 Hydration mismatch 방지 핵심 옵션
        onUpdate: ({ editor }) => {
            onChange?.(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: editable
                    ? 'prose-editor min-h-[180px] p-3 outline-none'
                    : 'prose-editor outline-none',
                ...(editable && {
                    role: 'textbox',
                    'aria-multiline': 'true',
                }),
                ...(ariaLabel && { 'aria-label': ariaLabel }),
                ...(ariaDescribedBy && { 'aria-describedby': ariaDescribedBy }),
            },
        },
    });

    if (!editor) {
        // immediatelyRender:false라서 첫 렌더(서버 포함)에는 에디터가 없습니다.
        // 같은 높이의 자리를 미리 잡아 마운트 후 레이아웃이 밀리지 않게 합니다.
        return (
            <div
                aria-hidden
                className={cn(
                    editable
                        ? 'min-h-[230px] rounded-2xl border border-gray-200'
                        : 'min-h-24',
                    className,
                )}
            />
        );
    }

    // 읽기 전용: 저장된 HTML을 Tiptap 스키마로 다시 파싱해서 출력합니다.
    // dangerouslySetInnerHTML과 달리 스키마에 없는 태그(script 등)와 속성은 버려집니다.
    if (!editable) {
        return <EditorContent editor={editor} className={className} />;
    }

    return (
        <div
            className={cn(
                'overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors focus-within:border-blue-600',
                className,
            )}
        >
            <Toolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
