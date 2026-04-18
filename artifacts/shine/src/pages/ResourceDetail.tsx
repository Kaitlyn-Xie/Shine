import { useParams, Link } from "wouter";
import { useGetResource, getGetResourceQueryKey } from "@workspace/api-client-react";
import { Loader2, ArrowLeft, Clock, Tag } from "lucide-react";

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const resourceId = Number(id);

  const { data: resource, isLoading } = useGetResource(resourceId, { query: { enabled: !!resourceId, queryKey: getGetResourceQueryKey(resourceId) } });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!resource) return <div className="p-8 text-center text-muted-foreground">Resource not found</div>;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3">
        <Link href="/resources" className="p-2 -ml-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold text-base line-clamp-1">Guide</h1>
      </header>

      <article className="p-6 pb-24 max-w-prose mx-auto w-full">
        <div className="space-y-4 mb-8">
          <h1 className="text-3xl font-bold leading-tight">{resource.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{resource.summary}</p>
          
          <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground border-y border-border/50 py-3">
            <div className="flex items-center text-primary/80">
              <Tag className="w-4 h-4 mr-1.5" />
              {resource.category}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1.5" />
              {resource.readMinutes} min read
            </div>
          </div>
        </div>

        <div className="prose prose-sm md:prose-base prose-neutral dark:prose-invert max-w-none">
          {/* Using a simple whitespace split for basic formatting of text content */}
          {resource.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
