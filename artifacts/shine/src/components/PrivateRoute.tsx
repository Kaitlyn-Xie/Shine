import { useEffect } from "react";
import { useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";

export function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      retry: false
    }
  });

  useEffect(() => {
    if (!isLoading && (isError || (user && !user.onboardingCompleted))) {
      setLocation("/");
    }
  }, [isLoading, isError, user, setLocation]);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (isError || !user) return null;

  return <Component />;
}
