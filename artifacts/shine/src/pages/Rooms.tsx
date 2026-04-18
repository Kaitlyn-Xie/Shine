import { useListRooms, getListRoomsQueryKey } from "@workspace/api-client-react";
import { Loader2, MessageSquare } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function Rooms() {
  const { data: rooms, isLoading } = useListRooms({ query: { queryKey: getListRoomsQueryKey() } });

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Safe Rooms</h1>
        <p className="text-muted-foreground mt-1 text-sm">No question is too basic. Ask anonymously if you prefer.</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-4">
          {rooms?.map((room, i) => (
            <motion.div key={room.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link href={`/rooms/${room.id}`}>
                <Card className="hover:border-primary/30 transition-colors cursor-pointer shadow-sm border-border/60 overflow-hidden">
                  <CardContent className="p-0 flex">
                    <div className="w-2" style={{ backgroundColor: room.color }} />
                    <div className="p-4 flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-lg">{room.name}</h3>
                        <div className="flex items-center text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          {room.postCount}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
