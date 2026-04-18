import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { Loader2, Trophy, Medal } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Leaderboard() {
  const { data: leaderboard, isLoading } = useGetLeaderboard({ query: { queryKey: getGetLeaderboardQueryKey() } });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-6 space-y-6 pb-24">
      <header className="text-center py-6">
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">Top teams navigating campus together.</p>
      </header>

      <div className="space-y-3">
        {leaderboard?.map((entry, i) => (
          <motion.div key={entry.teamId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={`shadow-sm border-border overflow-hidden relative ${i === 0 ? 'bg-amber-500/5 border-amber-500/20' : i === 1 ? 'bg-slate-300/10' : i === 2 ? 'bg-orange-800/10' : 'bg-card'}`}>
              <div className="p-4 flex items-center gap-4">
                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full shrink-0 ${
                  i === 0 ? 'bg-amber-500 text-white' : 
                  i === 1 ? 'bg-slate-300 text-slate-700' : 
                  i === 2 ? 'bg-orange-800 text-white' : 
                  'bg-secondary text-muted-foreground'
                }`}>
                  {entry.rank}
                </div>
                
                <div className="flex-1">
                  <div className="font-bold text-base flex items-center gap-2">
                    {entry.teamName}
                    {i === 0 && <Medal className="w-4 h-4 text-amber-500" />}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{entry.memberCount} members</span>
                    <span>·</span>
                    <span>{entry.completedMissions} missions</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-lg text-primary">{entry.totalPoints}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Points</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}

        {leaderboard?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm bg-secondary/20 rounded-xl border border-dashed border-border">
            No teams on the leaderboard yet. Be the first!
          </div>
        )}
      </div>
    </div>
  );
}
