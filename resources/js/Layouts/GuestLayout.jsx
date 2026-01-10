import { Link } from '@inertiajs/react';

export default function Guest({ children }) {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-[#050505] text-white font-sans selection:bg-purple-500/30">
            <style>{`
                :root {
                    --primary-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                }
                body {
                    background-image: 
                        radial-gradient(circle at 15% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 25%),
                        radial-gradient(circle at 85% 30%, rgba(168, 85, 247, 0.08) 0%, transparent 25%);
                }
                .bg-logo {
                    background: var(--primary-gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>

            <Link href="/" className="mb-8 block text-decoration-none">
                <span className="font-bold text-3xl bg-logo font-['Outfit'] tracking-tight">ResumeMaker</span>
            </Link>

            <div className="w-full max-w-[450px] bg-white/5 border border-white/10 rounded-3xl p-10 backdrop-blur-xl shadow-2xl animate-[fadeUp_0.5s_ease-out]">
                {children}
            </div>
        </div>
    );
}
