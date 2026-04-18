import { useGetMePrepPath, getGetMePrepPathQueryKey } from "@workspace/api-client-react";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function PrepPath() {
  const { data: prepPath, isLoading } = useGetMePrepPath({ query: { queryKey: getGetMePrepPathQueryKey() } });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!prepPath) return <div className="p-8 text-center text-muted-foreground">No prep path available</div>;

  // Group milestones by category
  const categories = [...new Set(prepPath.milestones.map(m => m.category))];

  return (
    <div className="p-6 space-y-6 pb-24">
      <header className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prep Path</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your personalized checklist for arriving at Harvard.</p>
        </div>

        <Card className="bg-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span className="text-primary/80">Overall Progress</span>
              <span>{prepPath.completedCount} / {prepPath.totalCount}</span>
            </div>
            <Progress value={(prepPath.completedCount / prepPath.totalCount) * 100} className="h-2.5" />
          </CardContent>
        </Card>
      </header>

      <div className="space-y-8">
        {categories.map(category => {
          const categoryMilestones = prepPath.milestones.filter(m => m.category === category);
          const completedInCategory = categoryMilestones.filter(m => m.completed).length;
          
          return (
            <div key={category} className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <h2 className="font-semibold text-lg capitalize">{category.replace('_', ' ')}</h2>
                <span className="text-xs font-medium bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                  {completedInCategory}/{categoryMilestones.length}
                </span>
              </div>
              
              <div className="space-y-2">
                {categoryMilestones.map(milestone => (
                  <Card key={milestone.id} className={`shadow-sm transition-colors ${milestone.completed ? 'bg-secondary/30 border-border/50' : 'bg-card'}`}>
                    <CardContent className="p-3.5 flex gap-3">
                      <div className="shrink-0 mt-0.5">
                        {milestone.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div>
                        <div className={`font-medium text-sm ${milestone.completed ? 'text-muted-foreground line-through decoration-muted-foreground/30' : 'text-foreground'}`}>
                          {milestone.title}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {milestone.description}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
