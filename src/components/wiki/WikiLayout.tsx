// ============================================================
// TTG Wiki — Content Shell
// Simple content wrapper used within the wiki magazine layout.
// The full magazine shell (header, footer, nav) is provided by
// src/app/wiki/layout.tsx
// ============================================================

interface WikiLayoutProps {
  children: React.ReactNode;
}

export default function WikiLayout({ children }: WikiLayoutProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12">
      {children}
    </div>
  );
}
