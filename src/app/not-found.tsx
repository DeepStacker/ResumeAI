import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <div className="relative flex items-center justify-center w-24 h-24 mb-8 rounded-full bg-primary/10 text-primary">
        <SearchX size={48} className="absolute inset-0 m-auto animate-pulse" />
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
        Page Not Found
      </h1>
      <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 mb-8">
        We couldn&apos;t find the page you were looking for. It might have been moved, deleted, or perhaps didn&apos;t exist in the first place.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button variant="default" className="gap-2 w-full sm:w-auto h-11 px-8">
            <Sparkles size={16} /> Let&apos;s build a Resume
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2 w-full sm:w-auto h-11 px-8">
            <ArrowLeft size={16} /> Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
