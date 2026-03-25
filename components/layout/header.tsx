import { ReactNode } from "react";
import Link from "next/link";

interface HeaderProps {
  children?: ReactNode;
}

export function Header({ children }: HeaderProps) {
  return (
    <header className="border-b border-border bg-bg-card">
      <div className="max-w-8xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="font-serif text-xl tracking-wide text-text-primary">
            Andreas Boutsikas
          </span>
        </Link>
        {children}
      </div>
    </header>
  );
}
