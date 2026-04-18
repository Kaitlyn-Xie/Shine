import { useLocation, Link } from "wouter";
import { useListMissions, getListMissionsQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, MapPin, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Missions() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const typeFilter = searchParams.get("type") || undefined;

  const { data: missions, isLoading } = useListMissions({ type: typeFilter }, { query: { queryKey: getListMissionsQueryKey({ type: typeFilter }) } });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/hunt" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold text-base capitalize">{typeFilter ? typeFilter.replace('_', ' ') : 'All Missions'}</h1>
      </header>

      <div className="p-4 space-y-4 pb-24">
        {missions?.map(mission => (
          <Link key={mission.id} href={`/hunt/missions/${mission.id}`}>
            <Card className={`hover:border-primary/30 transition-colors cursor-pointer shadow-sm ${mission.isCompleted ? 'bg-secondary/20 border-border/50' : 'border-border'}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className={`font-semibold ${mission.isCompleted ? 'text-muted-foreground' : 'text-foreground'}`}>{mission.title}</h3>
                  <Badge variant={mission.isCompleted ? "secondary" : "default"} className="shrink-0">
                    {mission.points} pts
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{mission.description}</p>
                
                <div className="flex items-center justify-between text-xs font-medium">
                  {mission.location ? (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {mission.location}
                    </div>
                  ) : (
                    <div />
                  )}
                  
                  {mission.isCompleted && (
                    <div className="flex items-center text-primary">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Completed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {missions?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm bg-secondary/20 rounded-xl border border-dashed border-border">
            No missions found for this category.
          </div>
        )}
      </div>
    </div>
  );
}
