import { useState } from "react";
import { useParams, Link } from "wouter";
import { useGetRoom, useListRoomPosts, useCreatePost, getGetRoomQueryKey, getListRoomPostsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Send, User, MessageCircle, Heart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";

export default function RoomDetail() {
  const { id } = useParams<{ id: string }>();
  const roomId = Number(id);
  const queryClient = useQueryClient();

  const { data: room, isLoading: isRoomLoading } = useGetRoom(roomId, { query: { enabled: !!roomId, queryKey: getGetRoomQueryKey(roomId) } });
  const { data: posts, isLoading: isPostsLoading } = useListRoomPosts(roomId, undefined, { query: { enabled: !!roomId, queryKey: getListRoomPostsQueryKey(roomId) } });

  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const createPost = useCreatePost({
    mutation: {
      onSuccess: () => {
        setContent("");
        queryClient.invalidateQueries({ queryKey: getListRoomPostsQueryKey(roomId) });
        queryClient.invalidateQueries({ queryKey: getGetRoomQueryKey(roomId) });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createPost.mutate({ roomId, data: { content, isAnonymous } });
  };

  if (isRoomLoading || isPostsLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!room) return <div className="p-8 text-center text-muted-foreground">Room not found</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Link href="/rooms" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: room.color }} />
            <h1 className="font-semibold text-lg line-clamp-1">{room.name}</h1>
          </div>
        </div>
        <p className="text-xs text-muted-foreground px-1">{room.description}</p>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {posts?.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm bg-secondary/20 rounded-xl border border-dashed border-border">
            No posts yet. Be the first to ask a question!
          </div>
        ) : (
          posts?.map(post => (
            <Link key={post.id} href={`/rooms/${roomId}/posts/${post.id}`}>
              <div className="bg-card border border-border shadow-sm rounded-xl p-4 space-y-3 cursor-pointer hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${post.isAnonymous ? 'bg-secondary' : 'bg-primary/10 text-primary'}`}>
                      <User className="w-4 h-4 opacity-70" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{post.authorName}</div>
                      <div className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
                    </div>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="bg-secondary/50 text-[10px] px-2 py-1 rounded text-muted-foreground flex items-center">
                      <Tag className="w-3 h-3 mr-1" /> {post.tags[0]}
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
                
                <div className="flex gap-4 pt-2 border-t border-border/50 text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-xs">
                    <Heart className="w-4 h-4" /> {post.likeCount}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <MessageCircle className="w-4 h-4" /> {post.replyCount}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="p-4 bg-card border-t border-border mt-auto">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea 
            placeholder="Ask a question or share a thought..." 
            value={content}
            onChange={e => setContent(e.target.value)}
            className="resize-none min-h-[80px] bg-background text-sm"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
              <Label htmlFor="anonymous" className="text-xs text-muted-foreground">Post anonymously</Label>
            </div>
            <Button size="sm" type="submit" disabled={!content.trim() || createPost.isPending} className="rounded-full px-5">
              {createPost.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Post</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
