import { useGetMe, useGetRecentActivity, useGetSummaryStats, useGetMePrepPath, useGetMyTeam, useGetLeaderboard, getGetRecentActivityQueryKey, getGetSummaryStatsQueryKey, getGetMePrepPathQueryKey, getGetMyTeamQueryKey, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowRight, Activity, Trophy, Users, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function Home() {
  const { data: user, isLoading: isUserLoading } = useGetMe();
  
  if (isUserLoading || !user) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const isPreArrival = user.phase === "pre_arrival";

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="pt-4">
        <h1 className="text-2xl font-bold text-foreground">Good morning, {user.displayName}.</h1>
        <p className="text-muted-foreground mt-1">We're glad you're here.</p>
      </header>

      {isPreArrival ? <PreArrivalDashboard /> : <OnCampusDashboard />}
    </div>
  );
}

function PreArrivalDashboard() {
  const { data: prepPath, isLoading: isPrepLoading } = useGetMePrepPath({ query: { queryKey: getGetMePrepPathQueryKey() } });
  const { data: activity } = useGetRecentActivity({ query: { queryKey: getGetRecentActivityQueryKey() } });
  const { data: stats } = useGetSummaryStats({ query: { queryKey: getGetSummaryStatsQueryKey() } });

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Your Prep Path</span>
            <span className="text-primary text-sm font-medium">{prepPath?.completedCount || 0}/{prepPath?.totalCount || 0}</span>
          </CardTitle>
          <CardDescription>Small steps to get you ready for Harvard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={prepPath ? (prepPath.completedCount / prepPath.totalCount) * 100 : 0} className="h-2 mb-4" />
          <Link href="/prep-path" className="text-primary text-sm font-medium flex items-center hover:underline">
            Continue preparing <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/rooms">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer shadow-sm h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-full">
              <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="font-medium">Safe Rooms</div>
              <div className="text-xs text-muted-foreground">Ask anything anonymously</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/circles">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer shadow-sm h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-full">
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div className="font-medium">Buddy Circles</div>
              <div className="text-xs text-muted-foreground">Meet your cohort</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-muted-foreground" />
          Community Pulse
        </h3>
        {activity?.slice(0, 3).map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="shadow-xs border-border/50">
              <CardContent className="p-3 text-sm flex gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-primary/40 shrink-0" />
                <div>
                  <span className="font-medium">{item.actorName}</span> <span className="text-muted-foreground">{item.description}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function OnCampusDashboard() {
  const { data: team } = useGetMyTeam({ query: { queryKey: getGetMyTeamQueryKey() } });
  const { data: leaderboard } = useGetLeaderboard({ query: { queryKey: getGetLeaderboardQueryKey() } });

  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/10 shadow-sm overflow-hidden relative">
        <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10" />
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Scavenger Hunt</CardTitle>
          <CardDescription>Explore campus, earn points, find your way.</CardDescription>
        </CardHeader>
        <CardContent>
          {team ? (
            <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 flex justify-between items-center mb-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Your Team</div>
                <div className="font-bold">{team.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-muted-foreground">Points</div>
                <div className="font-bold text-primary">{team.totalPoints}</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mb-4">Join a team to start earning points!</div>
          )}
          <Link href="/hunt" className="text-primary text-sm font-medium flex items-center hover:underline">
            Go to Hunt <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/rooms">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer shadow-sm h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-full">
              <div className="w-10 h-10 rounded-full bg-accent/20 text-accent flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="font-medium">Safe Rooms</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/resources">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer shadow-sm h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2 h-full">
              <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="font-medium">Resources</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {leaderboard && leaderboard.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Top Teams
          </h3>
          <Card className="shadow-sm">
            <div className="divide-y divide-border/50">
              {leaderboard.slice(0, 3).map((entry) => (
                <div key={entry.teamId} className="p-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center font-bold text-muted-foreground">{entry.rank}</div>
                    <div className="font-medium">{entry.teamName}</div>
                  </div>
                  <div className="font-bold">{entry.totalPoints} <span className="text-muted-foreground text-xs font-normal">pts</span></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
