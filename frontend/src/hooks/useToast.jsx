import React, { useState, useEffect } from "react";

export default function useToast() {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        if (toasts.length === 0) return;

        const timers = toasts.map((toast) =>
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }, toast.duration || 3500)
        );

        return () => {
            timers.forEach((timer) => clearTimeout(timer));
        };
    }, [toasts]);

    const push = (message, opts = {}) => {
        const id = crypto.randomUUID(); // safer unique ID
        setToasts((prev) => [
            ...prev,
            {
                id,
                message,
                type: opts.type || "info",
                duration: opts.duration || 3000,
            },
        ]);
    };

    const ToastContainer = () => (
        <div className="fixed right-6 bottom-6 z-9999 flex flex-col gap-3">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`max-w-xs rounded-lg px-4 py-3 shadow-lg text-sm border transition-all duration-300 animate-slide-up
                    ${toast.type === "error"
                            ? "bg-red-100 text-red-800 border-red-300"
                            : toast.type === "success"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-white text-gray-800 border-gray-300"
                        }
                `}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );

    return { push, ToastContainer };
}
