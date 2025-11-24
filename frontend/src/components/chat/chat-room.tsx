import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import type { Chat } from "@/store/chat.store";
import UserIcon from "./user-icon";

interface ChatRoomProps {
  chat: Chat;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function ChatRoom({
  chat,
  onBack,
  showBackButton = false,
}: ChatRoomProps) {
  const { currentUser } = useAuthStore();
  const { sendMessage } = useChatStore();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherUserUsername = chat.participants.find(
    (p) => p.username !== currentUser?.username
  )?.username;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !currentUser) return;

    sendMessage(chat.room_id, messageText.trim());
    setMessageText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      className="flex-1 flex flex-col bg-white relative"
      style={{ height: "var(--vh, 100vh)" }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={onBack}
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back to chat list"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}
        <UserIcon username={otherUserUsername || ""} size={40} />
        <div>
          <p className="font-semibold text-gray-900">{otherUserUsername}</p>
          {/* <p className="text-sm text-gray-500">Active now</p> */}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {chat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {chat.messages.map((message) => {
              const isCurrentUser =
                message.from_user_id === Number(currentUser?.id);
              return (
                <div
                  key={message.id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      isCurrentUser
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-900"
                    }`}
                  >
                    <p className="break-words">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 bg-white p-4 border-t border-gray-200 flex gap-2 items-end safe-area-inset-bottom">
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="w-full rounded-xl border border-gray-300 py-2 px-3 resize-none overflow-y-auto leading-5 text-base"
          rows={1}
          style={{
            minHeight: "40px",
            maxHeight: "120px",
            height: "auto",
            fontSize: "16px", // Prevents zoom on iOS
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            const newHeight = Math.min(target.scrollHeight, 120);
            target.style.height = `${newHeight}px`;
          }}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-xl shrink-0"
          style={{ minHeight: "40px" }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
