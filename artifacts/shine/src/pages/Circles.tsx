import { useState } from "react";
import { useGetMyCircle, useListCircles, useJoinCircle, useRespondToCirclePrompt, getGetMyCircleQueryKey, getListCirclesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Users, Send, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function Circles() {
  const queryClient = useQueryClient();
  const { data: myCircle, isLoading: isMyCircleLoading } = useGetMyCircle({ query: { queryKey: getGetMyCircleQueryKey() } });
  const { data: circles, isLoading: isCirclesLoading } = useListCircles({ query: { queryKey: getListCirclesQueryKey() } });
  
  const [response, setResponse] = useState("");

  const joinCircle = useJoinCircle({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyCircleQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListCirclesQueryKey() });
      }
    }
  });

  const respondPrompt = useRespondToCirclePrompt({
    mutation: {
      onSuccess: () => {
        setResponse("");
        queryClient.invalidateQueries({ queryKey: getGetMyCircleQueryKey() });
      }
    }
  });

  if (isMyCircleLoading || isCirclesLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Buddy Circles</h1>
        <p className="text-muted-foreground mt-1 text-sm">Small groups of 4-6 students to chat and share experiences.</p>
      </header>

      {myCircle ? (
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center justify-between">
                {myCircle.name}
                <div className="flex items-center text-sm font-normal text-muted-foreground bg-background px-2 py-1 rounded-full shadow-xs">
                  <Users className="w-4 h-4 mr-1" /> {myCircle.memberCount} members
                </div>
              </CardTitle>
              <div className="flex flex-wrap gap-2 mt-3">
                {myCircle.members.map(m => (
                  <div key={m.userId} className="text-xs bg-background border border-border px-2 py-1 rounded shadow-xs">
                    <span className="font-medium">{m.displayName}</span>
                    {m.country && <span className="text-muted-foreground ml-1">· {m.country}</span>}
                  </div>
                ))}
              </div>
            </CardHeader>
          </Card>

          {myCircle.currentPrompt && (
            <Card className="shadow-sm">
              <CardHeader className="bg-secondary/30 pb-4 border-b border-border/50">
                <CardDescription className="font-medium text-foreground flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Weekly Prompt
                </CardDescription>
                <CardTitle className="text-lg leading-snug mt-2">"{myCircle.currentPrompt}"</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50 max-h-[300px] overflow-y-auto">
                  {myCircle.responses.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">No responses yet. Be the first!</div>
                  ) : (
                    myCircle.responses.map(r => (
                      <div key={r.id} className="p-4 space-y-1">
                        <div className="text-sm font-medium">{r.authorName}</div>
                        <p className="text-sm text-foreground/80">{r.response}</p>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="p-4 bg-secondary/10 border-t border-border/50 flex flex-col gap-3">
                  <Textarea 
                    placeholder="Share your thoughts..." 
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                    className="min-h-[80px] text-sm resize-none bg-background"
                  />
                  <Button 
                    className="self-end" 
                    size="sm"
                    onClick={() => respondPrompt.mutate({ circleId: myCircle.id, data: { response } })}
                    disabled={!response.trim() || respondPrompt.isPending}
                  >
                    {respondPrompt.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2"/> Share</>}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-secondary/30 border border-border p-4 rounded-xl text-sm mb-6 text-foreground/80">
            You haven't joined a circle yet. Find one that interests you!
          </div>
          
          {circles?.map(circle => (
            <Card key={circle.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{circle.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center">
                      <Users className="w-3.5 h-3.5 mr-1" /> {circle.memberCount} members (max 6)
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => joinCircle.mutate({ circleId: circle.id })}
                    disabled={joinCircle.isPending || circle.memberCount >= 6}
                  >
                    {joinCircle.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {circle.members.map(m => (
                    <div key={m.userId} className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                      {m.displayName}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
