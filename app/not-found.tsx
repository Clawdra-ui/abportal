import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-accent text-sm tracking-widest uppercase mb-4">
          404
        </p>
        <h1 className="font-serif text-4xl text-text-primary mb-4">
          Page Not Found
        </h1>
        <p className="text-text-secondary mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center h-10 px-6 text-sm font-medium bg-accent text-white rounded-sm transition-colors hover:bg-accent-hover"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
