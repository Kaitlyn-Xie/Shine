import { useListBadges, useGetMeBadges, getListBadgesQueryKey, getGetMeBadgesQueryKey } from "@workspace/api-client-react";
import { Loader2, Award, Shield, Star, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Badges() {
  const { data: allBadges, isLoading: isBadgesLoading } = useListBadges({ query: { queryKey: getListBadgesQueryKey() } });
  const { data: userBadges, isLoading: isUserBadgesLoading } = useGetMeBadges({ query: { queryKey: getGetMeBadgesQueryKey() } });

  if (isBadgesLoading || isUserBadgesLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge.id) || []);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'award': return Award;
      case 'shield': return Shield;
      case 'star': return Star;
      default: return Award;
    }
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Badges</h1>
        <p className="text-muted-foreground mt-1 text-sm">Your achievements and milestones.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {allBadges?.map(badge => {
          const isEarned = earnedBadgeIds.has(badge.id);
          const Icon = getIcon(badge.icon);

          return (
            <Card key={badge.id} className={`shadow-sm relative overflow-hidden transition-all ${isEarned ? 'bg-card border-primary/30' : 'bg-secondary/20 border-border border-dashed opacity-70 grayscale'}`}>
              <CardContent className="p-4 flex flex-col items-center text-center space-y-3">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isEarned ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {isEarned ? <Icon className="w-7 h-7" /> : <Lock className="w-6 h-6" />}
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight mb-1">{badge.name}</div>
                  <div className="text-[10px] text-muted-foreground">{badge.description}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
