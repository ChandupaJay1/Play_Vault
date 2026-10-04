"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Gamepad2 } from "lucide-react";

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Replace this with the actual admin WhatsApp number
  const WHATSAPP_NUMBER = "94773729462";

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
    setMessage("");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[320px] bg-[#0a0a1a] border border-[#f97316]/30 rounded-2xl shadow-[0_0_30px_rgba(249,115,22,0.15)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#f97316] to-[#eab308] p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">
                    PlayVault Support
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-white/80 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-[#0a0a1a] min-h-[120px] flex flex-col justify-end">
              <div className="bg-[#111127] border border-white/5 p-3 rounded-xl rounded-tl-sm text-sm text-gray-200 mb-2 w-11/12 shadow-sm">
                Hey Player 1! 🎮 Need help with an order or have a question? Drop a message!
              </div>
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-[#111127] border-t border-white/5 flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-[#0a0a1a] border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#f97316] transition-colors"
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="w-9 h-9 rounded-full bg-[#f97316] flex items-center justify-center text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#ea580c] transition-colors"
              >
                <Send className="w-4 h-4 ml-[-2px]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-shadow text-white relative group"
      >
        <MessageCircle className="w-7 h-7" />
        
        {/* Gaming accent rings */}
        <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-75" style={{ animationDuration: '3s' }} />
        
        <span className="absolute right-full mr-4 bg-[#111127] border border-[#25D366]/30 text-[#25D366] text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
          Chat with Admin
        </span>
      </motion.button>
    </div>
  );
}
