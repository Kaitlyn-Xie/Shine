import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { getSessionId } from "@/lib/session";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";

import MapHome from "@/pages/MapHome";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import Onboarding from "@/pages/Onboarding";
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
      {/* Default: map home screen */}
      <Route path="/">
        <Layout><MapHome /></Layout>
      </Route>

      {/* Post feed tab */}
      <Route path="/post">
        <Layout><Home /></Layout>
      </Route>

      {/* Chat tab */}
      <Route path="/chat">
        <Layout><Chat /></Layout>
      </Route>

      {/* Profile tab */}
      <Route path="/profile">
        <Layout><Profile /></Layout>
      </Route>

      {/* Onboarding */}
      <Route path="/onboarding" component={Onboarding} />

      {/* Q&A rooms */}
      <Route path="/rooms">
        <Layout><Rooms /></Layout>
      </Route>
      <Route path="/rooms/:id">
        <Layout><RoomDetail /></Layout>
      </Route>
      <Route path="/rooms/:roomId/posts/:id">
        <Layout><PostDetail /></Layout>
      </Route>

      {/* Resources */}
      <Route path="/resources">
        <Layout><Resources /></Layout>
      </Route>
      <Route path="/resources/:id">
        <Layout><ResourceDetail /></Layout>
      </Route>

      {/* Circles */}
      <Route path="/circles">
        <Layout><Circles /></Layout>
      </Route>

      {/* Prep path */}
      <Route path="/prep-path">
        <Layout><PrepPath /></Layout>
      </Route>

      {/* Hunt / scavenger */}
      <Route path="/hunt">
        <Layout><Hunt /></Layout>
      </Route>
      <Route path="/hunt/missions">
        <Layout><Missions /></Layout>
      </Route>
      <Route path="/hunt/missions/:id">
        <Layout><MissionDetail /></Layout>
      </Route>
      <Route path="/hunt/leaderboard">
        <Layout><Leaderboard /></Layout>
      </Route>
      <Route path="/hunt/team">
        <Layout><Team /></Layout>
      </Route>

      {/* Badges */}
      <Route path="/badges">
        <Layout><Badges /></Layout>
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
