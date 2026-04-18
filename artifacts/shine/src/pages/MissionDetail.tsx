import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useGetMission, useSubmitMission, useGetMyTeam, getGetMissionQueryKey, getListMissionsQueryKey, getListSubmissionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, MapPin, Camera, Edit3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function MissionDetail() {
  const { id } = useParams<{ id: string }>();
  const missionId = Number(id);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: mission, isLoading: isMissionLoading } = useGetMission(missionId, { query: { enabled: !!missionId, queryKey: getGetMissionQueryKey(missionId) } });
  const { data: team, isLoading: isTeamLoading } = useGetMyTeam();

  const [reflection, setReflection] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const submitMission = useSubmitMission({
    mutation: {
      onSuccess: () => {
        toast.success(`Mission complete! Earned ${mission?.points} points.`);
        queryClient.invalidateQueries({ queryKey: getGetMissionQueryKey(missionId) });
        queryClient.invalidateQueries({ queryKey: getListMissionsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListSubmissionsQueryKey() });
        setLocation("/hunt");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to submit mission");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mission?.requiresReflection && !reflection.trim()) {
      toast.error("Reflection is required");
      return;
    }
    if (mission?.requiresPhoto && !photoUrl.trim()) {
      toast.error("Photo URL is required");
      return;
    }

    submitMission.mutate({
      missionId,
      data: {
        reflection,
        photoUrl: photoUrl || undefined,
        teamId: team?.id
      }
    });
  };

  if (isMissionLoading || isTeamLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!mission) return <div className="p-8 text-center text-muted-foreground">Mission not found</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href={`/hunt/missions?type=${mission.type}`} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold text-base line-clamp-1">Mission Details</h1>
      </header>

      <div className="p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">{mission.type.replace('_', ' ')}</span>
            <span className="font-bold text-primary">{mission.points} pts</span>
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-3">{mission.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{mission.description}</p>
        </div>

        {mission.location && (
          <Card className="bg-secondary/30 border-border/50 shadow-sm">
            <CardContent className="p-4 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <div className="font-medium text-sm">Location Hint</div>
                <div className="text-sm text-muted-foreground">{mission.location}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {mission.isCompleted ? (
          <Card className="bg-primary/10 border-primary/20 shadow-sm">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-primary" />
              <div>
                <div className="font-bold text-lg text-primary">Mission Accomplished!</div>
                <div className="text-sm text-muted-foreground">You've already earned points for this mission.</div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-border">
            <h3 className="font-semibold text-lg">Submit Completion</h3>
            
            {!team && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 mb-4">
                Note: You aren't in a team yet. You can still submit, but points won't count toward the team leaderboard until you join one.
              </div>
            )}

            {mission.requiresReflection && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-muted-foreground" /> Reflection
                  <span className="text-destructive">*</span>
                </Label>
                <Textarea 
                  placeholder="What did you learn or notice?"
                  value={reflection}
                  onChange={e => setReflection(e.target.value)}
                  className="min-h-[100px] bg-card"
                />
              </div>
            )}

            {mission.requiresPhoto && (
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-muted-foreground" /> Photo URL
                  <span className="text-destructive">*</span>
                </Label>
                <Input 
                  placeholder="https://..."
                  value={photoUrl}
                  onChange={e => setPhotoUrl(e.target.value)}
                  className="bg-card"
                />
                <p className="text-[10px] text-muted-foreground">Paste a link to your photo evidence.</p>
              </div>
            )}

            {!mission.requiresReflection && !mission.requiresPhoto && (
              <div className="text-sm text-muted-foreground mb-4">
                Just confirm you've found it to claim your points!
              </div>
            )}

            <Button type="submit" className="w-full h-12 text-base rounded-xl" disabled={submitMission.isPending}>
              {submitMission.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Claim Points"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
