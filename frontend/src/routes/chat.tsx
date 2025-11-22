import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";

import ChatSidebar from "@/components/chat/chat-sidebar";
import ChatRoom from "@/components/chat/chat-room";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  const { currentUser, logout } = useAuthStore();
  if (!currentUser) return null;

  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const { chats, loadChat, connect, disconnect } = useChatStore();

  useEffect(() => {
    connect(currentUser);
    return () => {
      disconnect();
    };
  }, [currentUser]);

  useEffect(() => {
    if (selectedChatId) {
      loadChat(selectedChatId);
    }
  }, [selectedChatId]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        onLogout={() => {
          logout();
          navigate({
            to: "/login",
          });
        }}
      />

      {/* Chatroom */}
      {selectedChatId ? (
        <ChatRoom
          chat={chats.find((chat) => chat.room_id === selectedChatId)!}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 text-lg">
              Select a chat to get started
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
