import { ChevronUp, ChevronDown, Eye, EyeOff, Lock, Unlock, Copy, Trash2, Plus } from 'lucide-react';

export default function PageToolbar({
    pageNumber = 1,
    title = '',
    onTitleChange,
    onMoveUp,
    onMoveDown,
    onHide,
    onLock,
    onDuplicate,
    onDelete,
    onAddPage,
    isLocked = false,
    isHidden = false,
    style = {}
}) {
    return (
        <div
            className="absolute flex items-center justify-between px-3 select-none pointer-events-auto"
            style={{
                ...style,
                height: '40px',
                minWidth: 'max-content',
                transform: 'translateY(-110%)',
            }}
        >
            {/* Page Info Section - Enhanced Title Editor */}
            <div className={`flex items-center gap-3 bg-white/95 backdrop-blur-md border border-black/5 px-3 py-1.5 rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] transition-all duration-300 ${isHidden ? 'ring-1 ring-gray-300 opacity-80' : ''}`}>
                <div className="flex items-center gap-2">
                    <div className={`flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-colors ${isLocked ? 'bg-amber-100 text-amber-700' : 'bg-gray-900 text-white'}`}>
                        Page {pageNumber}
                    </div>
                    <div className="h-4 w-px bg-gray-200 mx-1"></div>
                    <div className="relative group/title pb-0.5">
                        <input
                            type="text"
                            placeholder="Add page title"
                            value={title || ''}
                            onChange={(e) => onTitleChange?.(e.target.value)}
                            className="bg-transparent border-none outline-none shadow-none ring-0 focus:ring-0 text-[13px] font-bold text-gray-700 hover:text-gray-950 focus:text-purple-600 placeholder:text-gray-300 p-0 w-[140px] transition-all duration-200"
                        />
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-100 transition-all duration-300 group-hover/title:bg-gray-200 group-focus-within/title:bg-purple-500 group-focus-within/title:h-[1.5px]"></div>
                    </div>
                </div>
            </div>

            {/* Actions Section - Premium Button Group */}
            <div className="flex items-center gap-0.5 bg-white/95 backdrop-blur-md border border-black/5 px-1.5 py-1 rounded-full shadow-[0_2px_8px_-2px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] transition-all duration-300">
                <ToolbarButton onClick={onMoveUp} title="Move up">
                    <ChevronUp size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={onMoveDown} title="Move down">
                    <ChevronDown size={16} />
                </ToolbarButton>
                <div className="h-4 w-px bg-gray-200 mx-1.5"></div>
                <ToolbarButton
                    onClick={onHide}
                    title={isHidden ? "Show page" : "Hide page"}
                    isHighlight={isHidden}
                    activeColor="text-blue-600 bg-blue-50/50 hover:bg-blue-600"
                >
                    {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                </ToolbarButton>
                <ToolbarButton
                    onClick={onLock}
                    title={isLocked ? "Unlock page" : "Lock page"}
                    isHighlight={isLocked}
                    activeColor="text-amber-600 bg-amber-50/50 hover:bg-amber-600"
                >
                    {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
                </ToolbarButton>
                <ToolbarButton onClick={onDuplicate} title="Duplicate page">
                    <Copy size={16} />
                </ToolbarButton>
                <ToolbarButton onClick={onDelete} title="Delete page" isDanger>
                    <Trash2 size={16} />
                </ToolbarButton>
                <div className="h-4 w-px bg-gray-200 mx-1.5"></div>
                <ToolbarButton onClick={onAddPage} title="Add page" isHighlight>
                    <Plus size={16} />
                </ToolbarButton>
            </div>
        </div>
    );
}

const ToolbarButton = ({ children, onClick, title, isDanger, isHighlight, activeColor }) => {
    const defaultHighlight = 'text-purple-600 bg-purple-50/50 hover:bg-purple-600 hover:text-white shadow-sm';
    const activeStyles = activeColor ? `${activeColor} hover:text-white shadow-sm` : defaultHighlight;

    return (
        <button
            onClick={onClick}
            title={title}
            className={`
                w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 group
                ${isDanger
                    ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm hover:shadow-red-100'
                    : isHighlight
                        ? activeStyles
                        : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 hover:shadow-sm'}
            `}
        >
            <div className="transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                {children}
            </div>
        </button>
    );
};
