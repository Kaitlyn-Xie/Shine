import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { Layout } from "@/components/Layout";
import { PrivateRoute } from "@/components/PrivateRoute";
import NotFound from "@/pages/not-found";

import Onboarding from "@/pages/Onboarding";
import Home from "@/pages/Home";
import Rooms from "@/pages/Rooms";
import RoomDetail from "@/pages/RoomDetail";
import PostDetail from "@/pages/PostDetail";
import Resources from "@/pages/Resources";
import ResourceDetail from "@/pages/ResourceDetail";
import Circles from "@/pages/Circles";
import PrepPath from "@/pages/PrepPath";
import Hunt from "@/pages/Hunt";
import Missions from "@/pages/Missions";
import MissionDetail from "@/pages/MissionDetail";
import Leaderboard from "@/pages/Leaderboard";
import Team from "@/pages/Team";
import Badges from "@/pages/Badges";
import Profile from "@/pages/Profile";

// Ensure requests have session ID
setAuthTokenGetter(() => getSessionId());

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      
      {/* Protected Routes inside Layout */}
      <Route path="/home">
        <Layout><PrivateRoute component={Home} /></Layout>
      </Route>
      <Route path="/rooms">
        <Layout><PrivateRoute component={Rooms} /></Layout>
      </Route>
      <Route path="/rooms/:id">
        <Layout><PrivateRoute component={RoomDetail} /></Layout>
      </Route>
      <Route path="/rooms/:roomId/posts/:id">
        <Layout><PrivateRoute component={PostDetail} /></Layout>
      </Route>
      <Route path="/resources">
        <Layout><PrivateRoute component={Resources} /></Layout>
      </Route>
      <Route path="/resources/:id">
        <Layout><PrivateRoute component={ResourceDetail} /></Layout>
      </Route>
      <Route path="/circles">
        <Layout><PrivateRoute component={Circles} /></Layout>
      </Route>
      <Route path="/prep-path">
        <Layout><PrivateRoute component={PrepPath} /></Layout>
      </Route>
      <Route path="/hunt">
        <Layout><PrivateRoute component={Hunt} /></Layout>
      </Route>
      <Route path="/hunt/missions">
        <Layout><PrivateRoute component={Missions} /></Layout>
      </Route>
      <Route path="/hunt/missions/:id">
        <Layout><PrivateRoute component={MissionDetail} /></Layout>
      </Route>
      <Route path="/hunt/leaderboard">
        <Layout><PrivateRoute component={Leaderboard} /></Layout>
      </Route>
      <Route path="/hunt/team">
        <Layout><PrivateRoute component={Team} /></Layout>
      </Route>
      <Route path="/badges">
        <Layout><PrivateRoute component={Badges} /></Layout>
      </Route>
      <Route path="/profile">
        <Layout><PrivateRoute component={Profile} /></Layout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
