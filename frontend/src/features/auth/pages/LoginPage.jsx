import { GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { googleLoginApi, loginApi, logoutApi } from "../api/authApi";
import { setCredentials } from "../authSlice";
import { Turnstile } from '@marsidev/react-turnstile';
import PasswordInput from "../../../components/PasswordInput";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from
    ? `${location.state.from.pathname}${location.state.from.search || ""}${location.state.from.hash || ""}`
    : "/";

  // This function fires when Google successfully verifies the user on the frontend
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await googleLoginApi(credentialResponse.credential);
      dispatch(setCredentials(response.data.user));

      toast.success("Successfully logged in with Google!");
      navigate(returnTo, { replace: true });
    } catch (error) {
      console.error("Backend validation failed", error);
      toast.error(
        error.response?.data?.message || "Google Login failed on server.",
      );
    }
  };

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
      if (response.data.user?.role === "admin") {
        await logoutApi();
        toast.error("Administrators must use the admin login page.");
        return;
      }

      dispatch(setCredentials(response.data.user));
      toast.success("Successfully logged in!");
      navigate(returnTo, { replace: true });
    } catch (error) {
      toast.error(error.message || "Failed to log in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-lg shadow-sm border border-neutral-200">
      <h2 className="text-2xl font-serif font-bold text-center mb-6">

        Customer Login
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            placeholder="example@gmail.com"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <PasswordInput
            name="password"
            required
            placeholder="Enter password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
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
          className="w-full bg-neutral-900 text-white py-2.5 rounded-md hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50"
        >
          {submitting ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-neutral-900 hover:underline"
        >
          Register
        </Link>
      </p>

      <div className="flex items-center gap-3 my-6 text-neutral-400">
        <div className="flex-1 h-px bg-neutral-200"></div>
        <span className="text-sm">OR</span>
        <div className="flex-1 h-px bg-neutral-200"></div>
      </div>

      {/* The Magic Google Button */}
      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => {
            toast.error("Google Login popup closed or failed.");
          }}
          useOneTap // Optional: Prompts users immediately if they are signed into Chrome
          shape="rectangular"
          theme="outline"
          text="signin_with"
          size="large"
        />
      </div>

      <Link
        to="/"
        className="block text-center text-sm text-neutral-600 hover:text-neutral-900 hover:underline mt-6"
      >
        Back to home
      </Link>
    </div>
  );
}
