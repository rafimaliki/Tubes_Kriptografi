import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import UserIcon from "./user-icon";
import NewChatModal from "./new-chat-modal";

interface ChatSidebarProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onLogout: () => void;
}

export default function ChatSidebar({
  selectedChatId,
  onSelectChat,
  onLogout,
}: ChatSidebarProps) {
  const { currentUser } = useAuthStore();
  const { getChatsForUser } = useChatStore();
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  if (!currentUser) return null;

  const userChats = getChatsForUser(currentUser.username);

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-bold text-gray-900">Cryptalk</h1>
        </div>
      </div>

      {/* Start New Chat Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={() => setShowNewChatModal(true)}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl"
        >
          Start New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {userChats.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No chats yet</p>
        ) : (
          userChats.map((chat) => {
            const otherUserUsername = chat.participants.find(
              (p) => p !== currentUser.username
            );
            const lastMessage = chat.messages[chat.messages.length - 1];

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`p-4 cursor-pointer border-b border-gray-200 transition ${
                  selectedChatId === chat.id ? "bg-blue-50" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserIcon username={otherUserUsername || ""} size={40} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {otherUserUsername}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {lastMessage
                        ? `${lastMessage.senderUsername}: ${lastMessage.text}`
                        : "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Current User Info */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <UserIcon username={currentUser.username} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Logged in as
            </p>
            <p className="font-semibold text-gray-900">
              {currentUser.username}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-gray-500 hover:text-gray-700 text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </div>

      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onChatCreated={(chatId) => {
          onSelectChat(chatId);
          setShowNewChatModal(false);
        }}
      />
    </div>
  );
}
