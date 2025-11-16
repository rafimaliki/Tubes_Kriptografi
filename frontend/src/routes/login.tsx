import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import PasswordInput from "@/components/auth/password-input";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState("alice");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (!success) {
      setError("Invalid username or password");
    } else {
      navigate({
        to: "/chat",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Cryptalk</h1>
            <p className="text-gray-500 mt-2">Connect with friends instantly</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full rounded-xl border border-gray-300 py-1 px-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <PasswordInput
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl"
            >
              Login
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-600 font-semibold"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
