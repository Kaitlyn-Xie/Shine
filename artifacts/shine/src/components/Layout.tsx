import { Link, useLocation } from "wouter";
import { ChatIcon, SunIcon, UserCircleIcon } from "@/components/Icons";

function PostIcon({ size = 22, color = "#9A9A9A" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const isHome = location === "/" || location.startsWith("/?");
  const isPost = location === "/post" || location.startsWith("/post/");
  const isChat = location === "/chat" || location.startsWith("/chat/");
  const isProfile = location === "/profile" || location.startsWith("/profile/");

  const tabColor = (active: boolean) => (active ? "#FF9A3C" : "#9A9A9A");
  const labelStyle = { fontSize: 10, fontWeight: 600, marginTop: 1 } as const;

  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", height: "100dvh",
      background: "var(--bg)", display: "flex", flexDirection: "column",
      boxShadow: "0 0 40px rgba(0,0,0,0.12)", overflow: "hidden", position: "relative",
    }}>
      <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {children}
      </main>

      <nav style={{
        flexShrink: 0, background: "#fff",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-around",
        height: 68, paddingBottom: 8,
        boxShadow: "0 -2px 20px rgba(0,0,0,0.07)",
        zIndex: 100, position: "relative",
      }}>
        {/* Post */}
        <Link href="/post" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", padding: "6px 0" }}>
          <PostIcon size={22} color={tabColor(isPost)} />
          <span style={{ ...labelStyle, color: tabColor(isPost) }}>Post</span>
        </Link>

        {/* Chat */}
        <Link href="/chat" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", padding: "6px 0" }}>
          <ChatIcon size={22} color={tabColor(isChat)} />
          <span style={{ ...labelStyle, color: tabColor(isChat) }}>Chat</span>
        </Link>

        {/* Center sun — Home/Map */}
        <Link href="/" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", padding: "4px 0" }}>
          <div style={{
            width: 48, height: 48,
            background: isHome
              ? "linear-gradient(135deg, #FFC94A, #FF9A3C)"
              : "linear-gradient(135deg, #FFE8A0, #FFC94A)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: isHome
              ? "0 4px 16px rgba(255,154,60,0.5)"
              : "0 2px 8px rgba(255,154,60,0.2)",
            transform: isHome ? "scale(1.08)" : "scale(1)",
            transition: "all 0.2s ease",
            marginTop: -4,
          }}>
            <SunIcon size={22} color="#fff" />
          </div>
          
        </Link>

        {/* Profile */}
        <Link href="/profile" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", padding: "6px 0" }}>
          <UserCircleIcon size={22} color={tabColor(isProfile)} />
          <span style={{ ...labelStyle, color: tabColor(isProfile) }}>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
