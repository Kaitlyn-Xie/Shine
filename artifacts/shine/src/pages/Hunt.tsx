import { useGetMyTeam, useListSubmissions, getGetMyTeamQueryKey, getListSubmissionsQueryKey } from "@workspace/api-client-react";
import { Loader2, Map, Trophy, Target, ArrowRight, Camera } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Hunt() {
  const { data: team, isLoading: isTeamLoading } = useGetMyTeam({ query: { queryKey: getGetMyTeamQueryKey() } });
  const { data: submissions, isLoading: isSubmissionsLoading } = useListSubmissions({ query: { queryKey: getListSubmissionsQueryKey() } });

  if (isTeamLoading || isSubmissionsLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const missionTypes = [
    { id: "resource_discovery", name: "Resource Discovery", icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "academic_support", name: "Academic Support", icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { id: "mental_health", name: "Mental Health", icon: Heart, color: "text-rose-500", bg: "bg-rose-500/10" },
    { id: "social_integration", name: "Social Integration", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "hidden_curriculum", name: "Hidden Curriculum", icon: Compass, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="p-6 space-y-6 pb-24">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Scavenger Hunt</h1>
        <p className="text-muted-foreground mt-1 text-sm">Explore campus, complete missions, earn points.</p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/hunt/team">
          <Card className="hover:border-primary/30 transition-colors cursor-pointer shadow-sm h-full border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="font-semibold">{team ? team.name : "Join a Team"}</div>
              {team && <div className="text-xs text-muted-foreground">{team.totalPoints} points</div>}
            </CardContent>
          </Card>
        </Link>
        <Link href="/hunt/leaderboard">
          <Card className="hover:bg-accent/5 transition-colors cursor-pointer shadow-sm h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="font-semibold">Leaderboard</div>
              <div className="text-xs text-muted-foreground">See rankings</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Missions</h2>
          <Link href="/hunt/missions" className="text-primary text-sm font-medium flex items-center">
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid gap-3">
          {missionTypes.map(type => (
            <Link key={type.id} href={`/hunt/missions?type=${type.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer shadow-sm border-border/60">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${type.bg} ${type.color}`}>
                      <type.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{type.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {submissions && submissions.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-lg">Recent Submissions</h2>
          <div className="space-y-3">
            {submissions.slice(0, 3).map(sub => (
              <Card key={sub.id} className="shadow-sm">
                <CardContent className="p-3.5 flex gap-3">
                  <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center shrink-0">
                    {sub.photoUrl ? <Camera className="w-4 h-4 text-muted-foreground" /> : <Map className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm">Mission #{sub.missionId}</div>
                      <div className="text-xs font-bold text-primary">+{sub.pointsEarned} pts</div>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">{sub.reflection}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Needed imports that were missed above
import { BookOpen, Heart, Users, Compass } from "lucide-react";
