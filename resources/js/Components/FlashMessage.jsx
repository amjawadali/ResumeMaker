import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function FlashMessage() {
    const { flash, errors } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState(null);
    const [type, setType] = useState('success');

    useEffect(() => {
        if (flash.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
        } else if (flash.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
        } else if (Object.keys(errors).length > 0) {
            setMessage(errors);
            setType('error');
            setVisible(true);
        }

        if (flash.success || flash.error || Object.keys(errors).length > 0) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [flash, errors]);

    if (!visible || !message) return null;

    return (
        <div className="fixed bottom-10 right-10 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500">
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                <div className={`p-2 rounded-xl ${type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                    }`}>
                    {type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                </div>

                <div className="flex-1">
                    {typeof message === 'string' ? (
                        <p className="text-sm font-bold tracking-wide">{message}</p>
                    ) : (
                        <ul className="list-disc list-inside text-xs font-bold tracking-wide">
                            {Object.values(message).flat().map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <button
                    onClick={() => setVisible(false)}
                    className="p-1 hover:bg-white/5 rounded-lg transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-2xl">
                <div className={`h-full animate-progress-shrink origin-left ${type === 'success' ? 'bg-emerald-500/50' : 'bg-red-500/50'
                    }`} />
            </div>

            <style>{`
                @keyframes progress-shrink {
                    from { transform: scaleX(1); }
                    to { transform: scaleX(0); }
                }
                .animate-progress-shrink {
                    animation: progress-shrink 5000ms linear forwards;
                }
            `}</style>
        </div>
    );
}
