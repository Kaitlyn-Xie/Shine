import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetPost, useListPostReplies, useCreateReply, useReactToPost, getGetPostQueryKey, getListPostRepliesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Send, User, Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";

export default function PostDetail() {
  const { roomId, id } = useParams<{ roomId: string, id: string }>();
  const postId = Number(id);
  const queryClient = useQueryClient();

  const { data: post, isLoading: isPostLoading } = useGetPost(postId, { query: { enabled: !!postId, queryKey: getGetPostQueryKey(postId) } });
  const { data: replies, isLoading: isRepliesLoading } = useListPostReplies(postId, { query: { enabled: !!postId, queryKey: getListPostRepliesQueryKey(postId) } });

  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const reactToPost = useReactToPost({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
      }
    }
  });

  const createReply = useCreateReply({
    mutation: {
      onSuccess: () => {
        setContent("");
        queryClient.invalidateQueries({ queryKey: getListPostRepliesQueryKey(postId) });
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(postId) });
      }
    }
  });

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createReply.mutate({ postId, data: { content, isAnonymous } });
  };

  if (isPostLoading || isRepliesLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!post) return <div className="p-8 text-center text-muted-foreground">Post not found</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href={`/rooms/${roomId}`} className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold text-base">Thread</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Original Post */}
        <div className="p-4 bg-card border-b border-border shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${post.isAnonymous ? 'bg-secondary' : 'bg-primary/10 text-primary'}`}>
              <User className="w-5 h-5 opacity-70" />
            </div>
            <div>
              <div className="text-sm font-semibold">{post.authorName}</div>
              <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
            </div>
          </div>
          <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="rounded-full h-8 text-xs gap-1.5 border-border/50 bg-secondary/20 hover:bg-secondary"
              onClick={() => reactToPost.mutate({ postId, data: { type: "like" } })}
              disabled={reactToPost.isPending}
            >
              <Heart className={`w-3.5 h-3.5 ${post.likeCount > 0 ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
              <span className={post.likeCount > 0 ? 'text-accent font-medium' : 'text-muted-foreground'}>{post.likeCount}</span>
            </Button>
          </div>
        </div>

        {/* Replies */}
        <div className="p-4 space-y-4 pb-24">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Replies ({post.replyCount})</h3>
          
          {replies?.map(reply => (
            <div key={reply.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                <User className="w-4 h-4 opacity-50" />
              </div>
              <div className="flex-1 bg-card border border-border/50 rounded-2xl rounded-tl-none p-3 shadow-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm font-medium">{reply.authorName}</span>
                  {reply.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
                  <span className="text-[10px] text-muted-foreground ml-auto">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-foreground/90 whitespace-pre-wrap">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Input */}
      <div className="p-3 bg-card border-t border-border mt-auto shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleReply} className="flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <Textarea 
              placeholder="Write a reply..." 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="resize-none min-h-[44px] max-h-[120px] bg-background text-sm rounded-xl py-3"
            />
            <Button size="icon" type="submit" disabled={!content.trim() || createReply.isPending} className="rounded-full shrink-0 h-11 w-11">
              {createReply.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center gap-2 px-1">
            <Switch id="anonymous-reply" checked={isAnonymous} onCheckedChange={setIsAnonymous} className="scale-75" />
            <Label htmlFor="anonymous-reply" className="text-xs text-muted-foreground">Reply anonymously</Label>
          </div>
        </form>
      </div>
    </div>
  );
}
