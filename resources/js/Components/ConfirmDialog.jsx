import React, { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AlertCircle, HelpCircle, AlertTriangle, X } from 'lucide-react';

let confirmResolver;

export const confirmAction = (options = {}) => {
    const { title, message, type = 'danger', confirmText = 'Confirm', cancelText = 'Cancel' } = options;

    // Dispatch custom event to show dialog
    window.dispatchEvent(new CustomEvent('show-confirm', {
        detail: { title, message, type, confirmText, cancelText }
    }));

    return new Promise((resolve) => {
        confirmResolver = resolve;
    });
};

export default function ConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        type: 'danger',
        confirmText: 'Confirm',
        cancelText: 'Cancel'
    });

    useEffect(() => {
        const handleShow = (e) => {
            setConfig(e.detail);
            setIsOpen(true);
        };
        window.addEventListener('show-confirm', handleShow);
        return () => window.removeEventListener('show-confirm', handleShow);
    }, []);

    const handleConfirm = () => {
        setIsOpen(false);
        confirmResolver?.(true);
    };

    const handleCancel = () => {
        setIsOpen(false);
        confirmResolver?.(false);
    };

    const icons = {
        danger: <AlertTriangle className="w-10 h-10 text-red-500" />,
        warning: <AlertCircle className="w-10 h-10 text-amber-500" />,
        info: <HelpCircle className="w-10 h-10 text-blue-500" />
    };

    const buttonColors = {
        danger: 'bg-red-600 hover:bg-red-700 shadow-red-200',
        warning: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
        info: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={handleCancel}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-[2rem] bg-white p-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-white/20">
                                <div className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 cursor-pointer p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={handleCancel}>
                                    <X size={20} />
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50">
                                        {icons[config.type]}
                                    </div>
                                    <div className="text-center sm:mt-0">
                                        <Dialog.Title as="h3" className="text-2xl font-black text-slate-900 leading-6 mb-3">
                                            {config.title}
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-slate-500 font-medium px-4">
                                                {config.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-10 grid grid-cols-2 gap-3 w-full">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-2xl bg-white px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all active:scale-95"
                                        onClick={handleCancel}
                                    >
                                        {config.cancelText}
                                    </button>
                                    <button
                                        type="button"
                                        className={`inline-flex justify-center rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${buttonColors[config.type]}`}
                                        onClick={handleConfirm}
                                    >
                                        {config.confirmText}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
