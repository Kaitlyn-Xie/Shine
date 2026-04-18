import { useState } from "react";
import { useGetMyTeam, useCreateTeam, useJoinTeam, useListTeams, getGetMyTeamQueryKey, getListTeamsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Users, Trophy, Star, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function Team() {
  const queryClient = useQueryClient();
  const { data: team, isLoading: isTeamLoading } = useGetMyTeam({ query: { queryKey: getGetMyTeamQueryKey() } });
  const { data: teams, isLoading: isTeamsLoading } = useListTeams({ query: { queryKey: getListTeamsQueryKey() } });

  const [newTeamName, setNewTeamName] = useState("");

  const createTeam = useCreateTeam({
    mutation: {
      onSuccess: () => {
        toast.success("Team created!");
        queryClient.invalidateQueries({ queryKey: getGetMyTeamQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListTeamsQueryKey() });
      },
      onError: (err: any) => toast.error(err.message || "Failed to create team")
    }
  });

  const joinTeam = useJoinTeam({
    mutation: {
      onSuccess: () => {
        toast.success("Joined team!");
        queryClient.invalidateQueries({ queryKey: getGetMyTeamQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListTeamsQueryKey() });
      },
      onError: (err: any) => toast.error(err.message || "Failed to join team")
    }
  });

  if (isTeamLoading || isTeamsLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  if (team) {
    return (
      <div className="p-6 space-y-6 pb-24">
        <header>
          <h1 className="text-2xl font-bold text-foreground">Your Team</h1>
          <p className="text-muted-foreground mt-1 text-sm">Work together to complete missions.</p>
        </header>

        <Card className="bg-primary/5 border-primary/20 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">{team.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-background rounded-xl p-3 shadow-xs border border-border flex flex-col items-center justify-center text-center">
                <Trophy className="w-5 h-5 text-amber-500 mb-1" />
                <div className="font-bold text-xl">{team.totalPoints}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Total Points</div>
              </div>
              <div className="bg-background rounded-xl p-3 shadow-xs border border-border flex flex-col items-center justify-center text-center">
                <Target className="w-5 h-5 text-emerald-500 mb-1" />
                <div className="font-bold text-xl">{team.completedMissions}</div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold">Missions Done</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" /> 
                Roster ({team.memberCount})
              </h3>
              <div className="space-y-2">
                {team.members.map(member => (
                  <div key={member.userId} className="flex items-center justify-between bg-background border border-border p-3 rounded-lg shadow-xs">
                    <div>
                      <div className="font-medium text-sm">{member.displayName}</div>
                      {member.country && <div className="text-[10px] text-muted-foreground">{member.country}</div>}
                    </div>
                    <div className="flex items-center text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">
                      <Star className="w-3 h-3 mr-1 fill-primary" /> {member.totalPoints}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 pb-24">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Join a Team</h1>
        <p className="text-muted-foreground mt-1 text-sm">Teams work together in the scavenger hunt.</p>
      </header>

      <Card className="shadow-sm border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg">Create a new team</CardTitle>
          <CardDescription>Start your own group and invite others.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Team Name" 
              value={newTeamName}
              onChange={e => setNewTeamName(e.target.value)}
              className="bg-background"
            />
            <Button 
              onClick={() => createTeam.mutate({ data: { name: newTeamName } })}
              disabled={!newTeamName.trim() || createTeam.isPending}
            >
              {createTeam.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="font-semibold text-lg mb-4">Or join an existing team</h3>
        <div className="space-y-3">
          {teams?.map(t => (
            <Card key={t.id} className="shadow-sm">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{t.name}</h4>
                  <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                    <span className="flex items-center"><Users className="w-3 h-3 mr-1" /> {t.memberCount} members</span>
                    <span className="flex items-center"><Trophy className="w-3 h-3 mr-1" /> {t.totalPoints} pts</span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => joinTeam.mutate({ teamId: t.id })}
                  disabled={joinTeam.isPending}
                >
                  Join
                </Button>
              </CardContent>
            </Card>
          ))}
          {teams?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No teams found. Create one!</div>
          )}
        </div>
      </div>
    </div>
  );
}
