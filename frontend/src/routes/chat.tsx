import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";

import ChatSidebar from "@/components/chat/chat-sidebar";
import ChatRoom from "@/components/chat/chat-room";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

function ChatPage() {
  const { currentUser, logout } = useAuthStore();
  const { getChatsForUser } = useChatStore();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate({
      to: "/login",
    });
  };

  if (!currentUser) {
    return null;
  }

  const userChats = getChatsForUser(currentUser.username);
  const selectedChat = userChats.find((chat) => chat.id === selectedChatId);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <ChatSidebar
        selectedChatId={selectedChatId}
        onSelectChat={setSelectedChatId}
        onLogout={handleLogout}
      />

      {/* Chatroom */}
      {selectedChat ? (
        <ChatRoom chat={selectedChat} />
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
