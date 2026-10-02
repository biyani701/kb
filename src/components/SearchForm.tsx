import { cn } from '@/lib/cn'

/** A plain GET form to /search, so search works without JavaScript. */
export function SearchForm({ defaultValue, className }: { defaultValue?: string; className?: string }) {
  return (
    <form action="/search" role="search" className={cn('flex gap-2', className)}>
      <label htmlFor="q" className="sr-only">
        Search terms and topics
      </label>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Search terms and topics, e.g. CAVV or settlement"
        maxLength={200}
        className="min-h-11 flex-1 rounded-md border border-rule bg-background px-3"
      />
      <button type="submit" className="min-h-11 rounded-md bg-foreground px-4 text-background">
        Search
      </button>
    </form>
  )
}
