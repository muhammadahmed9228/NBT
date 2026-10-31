export default function ServerErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-6 py-16 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-500">Error 500</p>
        <h1 className="mt-4 font-serif text-5xl font-bold text-neutral-900">Something went wrong</h1>
        <p className="mt-4 text-neutral-600">We could not complete that request. Please try again or return to the homepage.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-700">
            Try again
          </button>
          <a href="/" className="border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100">
            Return home
          </a>
        </div>
      </div>
    </main>
  );
}
