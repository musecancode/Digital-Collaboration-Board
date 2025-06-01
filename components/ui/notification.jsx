"use client";

import { useEffect } from "react";

export default function Notification({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  return (
    <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 bg-black/80 text-white text-sm px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
      {message}
    </div>
  );
}