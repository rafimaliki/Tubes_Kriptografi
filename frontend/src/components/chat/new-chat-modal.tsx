import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export default function NewChatModal({
  isOpen,
  onClose,
  onChatCreated,
}: NewChatModalProps) {
  const { currentUser, users } = useAuthStore();
  const { getOrCreateChat } = useChatStore();
  const [newChatUsername, setNewChatUsername] = useState("");
  const [error, setError] = useState("");

  const handleStartNewChat = () => {
    const otherUser = users.find((u) => u.username === newChatUsername);
    if (!otherUser) {
      setError("User not found");
      return;
    }
    if (otherUser.username === currentUser?.username) {
      setError("Cannot chat with yourself");
      return;
    }

    const chat = getOrCreateChat(currentUser!.username, otherUser.username);
    onChatCreated(chat.id);
    setNewChatUsername("");
    setError("");
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50  flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg p-6 w-96 max-w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Start New Chat
        </h2>
        <p className="text-gray-600 mb-4">
          Enter the username of the person you want to chat with.
        </p>

        <input
          type="text"
          value={newChatUsername}
          onChange={(e) => setNewChatUsername(e.target.value)}
          placeholder="Enter username"
          className="w-full rounded-xl border border-gray-300 py-1 px-2 mb-4"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleStartNewChat();
          }}
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleStartNewChat}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl"
          >
            Start Chat
          </button>
          <button
            onClick={() => {
              onClose();
              setNewChatUsername("");
              setError("");
            }}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-xl"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
