import { useListResources, getListResourcesQueryKey } from "@workspace/api-client-react";
import { Loader2, Search, Clock, Tag } from "lucide-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce"; // Will create this

export default function Resources() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const debouncedSearch = useDebounce(search, 300);

  const { data: resources, isLoading } = useListResources({ search: debouncedSearch, category }, { query: { queryKey: getListResourcesQueryKey({ search: debouncedSearch, category }) } });

  const categories = ["Academics", "Life in US", "Visa & Travel", "Housing", "Social"];

  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Resources</h1>
        <p className="text-muted-foreground mt-1 text-sm">Guides written by upperclassmen to help you navigate Harvard.</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search guides..." 
          className="pl-9 bg-card border-border/60 rounded-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar -mx-6 px-6">
        <button 
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!category ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
          onClick={() => setCategory(undefined)}
        >
          All
        </button>
        {categories.map(c => (
          <button 
            key={c}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4">
          {resources?.map((resource) => (
            <Link key={resource.id} href={`/resources/${resource.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer shadow-sm border-border/60 h-full">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-semibold text-base leading-tight">{resource.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{resource.summary}</p>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-2">
                    <div className="flex items-center text-primary/80">
                      <Tag className="w-3 h-3 mr-1" />
                      {resource.category}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {resource.readMinutes} min read
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {resources?.length === 0 && (
            <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
              No resources found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
