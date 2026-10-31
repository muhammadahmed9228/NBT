import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginApi, logoutApi } from "../api/authApi";
import { setCredentials } from "../authSlice";
import { Turnstile } from '@marsidev/react-turnstile';
import PasswordInput from "../../../components/PasswordInput";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return user?.role === "admin" ? (
      <Navigate to="/admin" replace />
    ) : (
      <Navigate to="/" replace />
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!turnstileToken) {
      toast.error("Please complete the security check.");
      return;
    }
    
    setSubmitting(true);

    try {
      const response = await loginApi({ ...formData, turnstileToken });
      const loggedInUser = response.data.user;

      if (loggedInUser?.role !== "admin") {
        await logoutApi();
        toast.error("This login is for administrators only.");
        return;
      }

      dispatch(setCredentials(loggedInUser));
      toast.success("Successfully logged in!");
      navigate("/admin");
    } catch (error) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-qala-cream px-4 py-10">
      <div className="w-full max-w-md border border-qala-champagne bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-qala-bronze">
            Qala
          </p>
          <h1 className="text-2xl font-serif font-bold text-qala-espresso">Admin Login</h1>
          <p className="text-sm text-neutral-500 mt-2">
            Sign in to access the admin panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="admin-email">
              Email address
            </label>
            <input
              id="admin-email"
              type="email"
              name="email"
              required
              placeholder="Enter your email address"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="admin-password">
              Password
            </label>
            <PasswordInput
              id="admin-password"
              name="password"
              required
              placeholder="Enter password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
          
          <div className="py-2 flex justify-center">
            <Turnstile 
              siteKey="0x4AAAAAAEyCT9dIF1IcOxCK" 
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-neutral-900 text-white py-2.5 rounded-md hover:bg-neutral-800 transition font-medium disabled:opacity-50"
          >
            {submitting ? "Signing in..." : "Sign in to admin"}
          </button>
        </form>

        <Link
          to="/"
          className="block text-center text-sm text-neutral-500 hover:text-neutral-900 mt-6"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}
