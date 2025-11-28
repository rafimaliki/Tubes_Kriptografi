import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import { LocalStorage } from "@/lib/LocalStorage";

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
  
  const [debugMode, setDebugMode] = useState(false);
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [originalPrivateKey, setOriginalPrivateKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedKey = LocalStorage.load("private_key");
    const keyStr = typeof storedKey === "string" ? storedKey : "";
    setPrivateKeyInput(keyStr);
    setOriginalPrivateKey(keyStr);
  }, []);

  const refreshChatMessages = () => {
    if (selectedChatId) {
      // Force reload by resetting the loaded flag
      const chatState = useChatStore.getState();
      chatState.chats = chatState.chats.map((c) => {
        if (c.room_id === selectedChatId) {
          return { ...c, loaded: false };
        }
        return c;
      });
      loadChat(selectedChatId);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSavePrivateKey = () => {
    LocalStorage.save("private_key", privateKeyInput);
    setOriginalPrivateKey(privateKeyInput);
    setIsEditing(false);
    refreshChatMessages();
  };

  const handleCancelEdit = () => {
    setPrivateKeyInput(originalPrivateKey);
    setIsEditing(false);
    refreshChatMessages();
  };

  const handleResetPrivateKey = () => {
    const storedKey = LocalStorage.load("original_private_key");
    const keyStr = typeof storedKey === "string" ? storedKey : "";
    setPrivateKeyInput(keyStr);
    setOriginalPrivateKey(keyStr);
    LocalStorage.save("private_key", keyStr);
    setIsEditing(false);
    refreshChatMessages();
  };

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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Debug Panel */}
      {debugMode && (
        <div className="w-full p-4 border-b border-gray-200 bg-yellow-50">
          <div className="flex items-center gap-2 max-w-7xl mx-auto">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Private Key:
            </label>
            <input
              type="text"
              value={privateKeyInput}
              onChange={(e) => setPrivateKeyInput(e.target.value)}
              disabled={!isEditing}
              className={`flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
              }`}
              placeholder="Enter private key"
            />
            {!isEditing ? (
              <button
                onClick={handleEditClick}
                className="px-4 py-2 text-sm font-semibold rounded bg-blue-500 hover:bg-blue-600 text-white"
              >
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSavePrivateKey}
                  className="px-4 py-2 text-sm font-semibold rounded bg-green-500 hover:bg-green-600 text-white"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-semibold rounded bg-gray-300 hover:bg-gray-400 text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResetPrivateKey}
                  className="px-4 py-2 text-sm font-semibold rounded bg-red-500 hover:bg-red-600 text-white"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar  */}
        <div
          className={`${
            showChatRoom ? "hidden md:flex" : "flex"
          } w-full md:w-72 flex-col h-full`}
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
            debugMode={debugMode}
            setDebugMode={setDebugMode}
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
    </div>
  );
}
