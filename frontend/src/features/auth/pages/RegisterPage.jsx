import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerApi } from "../api/authApi";
import { Turnstile } from '@marsidev/react-turnstile';
import PasswordInput from "../../../components/PasswordInput";

const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const navigate = useNavigate();

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
      await registerApi({ ...formData, turnstileToken });
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nbt-auth-card max-w-md mx-auto my-12 bg-white p-8 rounded-lg shadow-sm border border-neutral-200">
      <h2 className="text-2xl font-serif font-bold text-center mb-6">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone Number (Optional)</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        <div className="py-2 flex justify-center">
          <Turnstile 
            siteKey={turnstileSiteKey}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-neutral-900 text-white py-2.5 rounded-md hover:bg-neutral-800 transition font-medium text-sm disabled:opacity-50"
        >
          {submitting ? "Creating Account..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-neutral-900 hover:underline">
          Sign In
        </Link>
      </p>
      <Link
        to="/"
        className="block text-center text-sm text-neutral-600 hover:text-neutral-900 hover:underline mt-6"
      >
        Back to home
      </Link>
    </div>
  );
}
