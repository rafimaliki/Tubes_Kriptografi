interface UserIconProps {
  username: string;
  size?: number;
}

export default function UserIcon({ username, size = 32 }: UserIconProps) {
  const getBackgroundColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-indigo-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-red-500",
      "bg-orange-500",
      "bg-green-500",
      "bg-teal-500",
    ];
    const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
    return colors[hash % colors.length];
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full text-white font-semibold ${getBackgroundColor(
        username
      )}`}
      style={{ width: size, height: size, fontSize: `${size * 0.4}px` }}
    >
      <svg className="w-2/3 h-2/3" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
      </svg>
    </div>
  );
}
