import { useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children }) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 md:p-6">
      {/* Dark Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-lg bg-white shadow-xl animate-fade-in-up sm:max-h-[90vh] sm:rounded-lg">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 bg-neutral-50 px-4 py-3 sm:px-6 sm:py-4">
          <h3 className="min-w-0 truncate text-lg font-serif font-bold text-neutral-900 sm:text-xl">{title}</h3>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="min-h-0 overflow-y-auto p-4 custom-scrollbar sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}