import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-16 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Error 404</p>
        <h1 className="mt-4 font-serif text-5xl font-bold text-neutral-900">Page not found</h1>
        <p className="mt-4 text-neutral-600">The page you are looking for does not exist or may have moved.</p>
        <Link to="/" className="mt-8 inline-flex bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700">
          Return home
        </Link>
      </div>
    </main>
  );
}
