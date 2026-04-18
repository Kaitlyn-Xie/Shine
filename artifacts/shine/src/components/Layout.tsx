import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { QuestionIcon, ChatIcon, SunIcon, MapIcon, LockIcon, UserCircleIcon } from "@/components/Icons";

// Configure API client to always send session ID
setAuthTokenGetter(() => getSessionId());

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useGetMe({
    query: { retry: false, staleTime: Infinity },
  });

  const isPreArrival = user?.phase === "pre_arrival";

  const leftTabs = [
    { href: "/rooms", label: "Q&A", Icon: QuestionIcon },
    { href: "/chat", label: "Chat", Icon: ChatIcon },
  ];
  const rightTabs = [
    { href: "/hunt", label: "Map", Icon: isPreArrival ? LockIcon : MapIcon, locked: isPreArrival },
    { href: "/profile", label: "Profile", Icon: UserCircleIcon },
  ];

  const navTabStyle = (href: string, locked = false) => {
    const isActive = location === href || location.startsWith(`${href}/`);
    return {
      display: "flex", flexDirection: "column" as const, alignItems: "center",
      gap: 3, background: "none", border: "none",
      cursor: locked ? "default" : "pointer",
      flex: 1, padding: "6px 0", textDecoration: "none",
      color: isActive ? "#FF9A3C" : "#9A9A9A",
      opacity: locked ? 0.35 : 1,
      transition: "color 0.15s",
    };
  };

  const labelStyle = { fontSize: 10, fontWeight: 600, marginTop: 1 };

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", height: "100dvh", background: "var(--bg)", display: "flex", flexDirection: "column", boxShadow: "0 0 40px rgba(0,0,0,0.12)", overflow: "hidden", position: "relative" }}>
      <main style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav style={{
        flexShrink: 0,
        background: "#fff",
        borderTop: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-around",
        height: 68, paddingBottom: 8,
        boxShadow: "0 -2px 20px rgba(0,0,0,0.07)",
        zIndex: 100,
        position: "relative",
      }}>
        {/* Left tabs */}
        {leftTabs.map(({ href, label, Icon }) => {
          const isActive = location === href || location.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} style={navTabStyle(href)}>
              <Icon size={22} color={isActive ? "#FF9A3C" : "#9A9A9A"} />
              <span style={{ ...labelStyle, color: isActive ? "#FF9A3C" : "#9A9A9A" }}>{label}</span>
            </Link>
          );
        })}

        {/* Center Home button */}
        <Link href="/home" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, textDecoration: "none", flex: 1, padding: "4px 0" }}>
          <div style={{
            width: 48, height: 48,
            background: location === "/home" || location.startsWith("/home/")
              ? "linear-gradient(135deg, #FFC94A, #FF9A3C)"
              : "linear-gradient(135deg, #FFE8A0, #FFC94A)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: location === "/home" || location.startsWith("/home/")
              ? "0 4px 16px rgba(255,154,60,0.5)"
              : "0 2px 8px rgba(255,154,60,0.2)",
            transform: location === "/home" || location.startsWith("/home/") ? "scale(1.08)" : "scale(1)",
            transition: "all 0.2s ease",
            marginTop: -4,
          }}>
            <SunIcon size={22} color="#fff" />
          </div>
          <span style={{ ...labelStyle, color: location === "/home" ? "#FF9A3C" : "#9A9A9A" }}>Home</span>
        </Link>

        {/* Right tabs */}
        {rightTabs.map(({ href, label, Icon, locked }) => {
          const isActive = location === href || location.startsWith(`${href}/`);
          return (
            <Link key={href} href={locked ? "#" : href} style={navTabStyle(href, locked)}>
              <Icon size={22} color={isActive ? "#FF9A3C" : "#9A9A9A"} />
              <span style={{ ...labelStyle, color: isActive ? "#FF9A3C" : "#9A9A9A" }}>
                {locked ? "Soon" : label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
