import { useGetMe } from "@workspace/api-client-react";

export function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoading } = useGetMe({ query: { retry: false } });

  if (isLoading) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 32, height: 32, border: "3px solid #FFC94A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );

  return <Component />;
}
