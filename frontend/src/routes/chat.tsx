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
  const [showChatRoom, setShowChatRoom] = useState(false);
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

  const handleSelectChat = (room_id: number) => {
    setSelectedChatId(room_id);
    setShowChatRoom(true);
  };

  const handleBackToSidebar = () => {
    setShowChatRoom(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar  */}
      <div
        className={`${
          showChatRoom ? "hidden md:flex" : "flex"
        } w-full md:w-72 flex-col h-screen`}
      >
        <ChatSidebar
          selectedChatId={selectedChatId}
          onSelectChat={handleSelectChat}
          onLogout={() => {
            logout();
            navigate({
              to: "/login",
            });
          }}
        />
      </div>

      {/* Chatroom */}
      {selectedChatId ? (
        <div
          className={`${
            showChatRoom ? "flex" : "hidden md:flex"
          } flex-1 flex-col`}
        >
          <ChatRoom
            chat={chats.find((chat) => chat.room_id === selectedChatId)!}
            onBack={handleBackToSidebar}
            showBackButton={true}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
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
