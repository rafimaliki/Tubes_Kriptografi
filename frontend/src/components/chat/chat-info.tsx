import { useState } from "react";

interface ChatInfoProps {
  is_current_user: boolean;
  is_verified: boolean;
}

export default function ChatInfo({
  is_current_user,
  is_verified,
}: ChatInfoProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const textColor = is_current_user ? "text-blue-100" : "text-gray-500";
  const iconColor = is_current_user ? "#e3e3e3" : "#6b7280";

  const text = is_verified ? "verified" : "unverified";
  return (
    <div className="relative inline-flex items-center gap-1 text-xs mt-1 ml-1">
      <span className={`text-xs ${textColor}`}>{text}</span>
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="16px"
          viewBox="0 -960 960 960"
          width="16px"
          fill={iconColor}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
        </svg>

        {/* Tooltip */}
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-10">
            This message has been verified.
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
          </div>
        )}
      </div>
    </div>
  );
}
