// app/api/layout.tsx
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // stop static optimization at build

export default function ApiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
