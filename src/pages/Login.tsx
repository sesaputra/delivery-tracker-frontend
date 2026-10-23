import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../hooks/useAuth";

function Login() {
  const { login, token } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();
  setError("");

  if (!email.trim() || !password) {
    setError("Email dan password wajib diisi.");
    return;
  }

  try {
    setLoading(true);

    await login(email.trim(), password);

    navigate(from, { replace: true });
  } catch (error: unknown) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401
    ) {
      setError("Email atau password salah.");
    } else if (
      axios.isAxiosError(error) &&
      error.response?.status === 422
    ) {
      setError("Format email atau password tidak valid.");
    } else {
      setError(
        "Tidak dapat terhubung ke server. Silakan coba lagi."
      );
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 shadow-sm">
              <span className="text-xl font-bold text-white">
                DT
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Delivery Tracker
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Masuk untuk mengakses dashboard.
            </p>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Masukkan email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Masukkan password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    aria-label={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Delivery Tracker
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;