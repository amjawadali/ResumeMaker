import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
// Import Ziggy route helper if needed globally, but typically we rely on window.route from @routes directive
// OR we can bind it here if not using @routes.
// Given user has @routes working now, window.route should be available.
// BUT to be safe and "React-like", we often do:
// import { ZiggyVue } from '../../vendor/tightenco/ziggy/dist/vue.m';

import { Toaster } from 'sonner';
import ConfirmDialog from '@/Components/ConfirmDialog';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <Toaster richColors position="bottom-right" />
                <ConfirmDialog />
                <App {...props} />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
