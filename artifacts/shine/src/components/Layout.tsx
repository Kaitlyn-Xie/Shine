import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Home, MessageSquare, BookOpen, Map, UserCircle } from "lucide-react";
import { useGetMe } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { setAuthTokenGetter } from "@workspace/api-client-react";

// Configure API client to always send session ID
setAuthTokenGetter(() => getSessionId());

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useGetMe({ 
    query: { 
      retry: false,
      staleTime: Infinity 
    } 
  });

  const isPreArrival = user?.phase === "pre_arrival";

  const tabs = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/rooms", label: "Rooms", icon: MessageSquare },
    { href: "/resources", label: "Resources", icon: BookOpen },
    { href: "/hunt", label: "Hunt", icon: Map, disabled: isPreArrival },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ];

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">...</div>;
  }

  return (
    <div className="mx-auto max-w-[430px] h-[100dvh] bg-background flex flex-col shadow-xl overflow-hidden relative">
      <main className="flex-1 overflow-y-auto pb-2 no-scrollbar relative z-10">
        {children}
      </main>

      <nav className="shrink-0 w-full bg-card border-t border-border z-50 flex items-center justify-around px-2 py-3 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.href || location.startsWith(`${tab.href}/`);
          
          if (tab.disabled) {
            return (
              <div key={tab.href} className="flex flex-col items-center justify-center w-16 opacity-40">
                <Icon size={24} className="mb-1" />
                <span className="text-[10px] font-medium">Soon</span>
              </div>
            );
          }

          return (
            <Link key={tab.href} href={tab.href} className={`flex flex-col items-center justify-center w-16 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon size={24} className={`mb-1 ${isActive ? "fill-primary/20" : ""}`} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
