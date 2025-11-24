import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";

import { useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import PasswordInput from "@/components/auth/password-input";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuthStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username and password are required");
      return;
    }
    const result = await register(username, password);

    if (!result.ok) {
      setError(result.error || "Registration failed");
    } else {
      setSuccess(true);
      setError("");

      alert("Registration successful! Please log in.");
      navigate({
        to: "/login",
      });
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
      style={{ height: "var(--vh, 100vh)" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Cryptalk</h1>
            <p className="text-gray-500 mt-2">Create your account</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
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
                placeholder="Create a password"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-xl"
            >
              Register
            </button>
          </form>
          {!success && (
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-blue-500 hover:text-blue-600 font-semibold"
                >
                  Login
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
