import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import { WorldTile } from "@/components/WorldTile";
import { getAllWorlds } from "@/services/world/getAllWorlds.service";
import { useUserStore } from "@/stores/UserStore";
import type { World } from "@/types/models";

const PAGE_SIZE = 10;

const SORT_OPTIONS = [
  { label: "Users: descending", ordering: "-distinct_user_count" },
  { label: "Users: ascending", ordering: "distinct_user_count" },
];

export default function MainPage() {
  const { worldsVersion } = useUserStore();

  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeSort, setActiveSort] = useState(SORT_OPTIONS[0]);

  const [worlds, setWorlds] = useState<World[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const isLoadingRef = useRef(false);
  const offsetRef = useRef(0);
  const generationRef = useRef(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const hasMore = worlds.length < totalCount;

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchPage = useCallback(
    async (offset: number, search: string, ordering: string, generation: number) => {
      if (isLoadingRef.current) return;
      isLoadingRef.current = true;
      setIsLoading(true);
      try {
        const data = await getAllWorlds({
          search: search || undefined,
          ordering,
          offset,
          limit: PAGE_SIZE,
        });
        if (generationRef.current !== generation) return;
        offsetRef.current = offset + data.results.length;
        setTotalCount(data.count);
        setWorlds((prev) => (offset === 0 ? data.results : [...prev, ...data.results]));
      } catch {
        // network errors are swallowed — the list just stays empty / unchanged
      } finally {
        if (generationRef.current === generation) {
          isLoadingRef.current = false;
          setIsLoading(false);
        }
      }
    },
    []
  );

  // Reset and reload when filters change
  useEffect(() => {
    generationRef.current += 1;
    isLoadingRef.current = false;
    offsetRef.current = 0;
    setWorlds([]);
    setTotalCount(0);
    fetchPage(0, debouncedSearch, activeSort.ordering, generationRef.current);
  }, [debouncedSearch, activeSort.ordering, worldsVersion, fetchPage]);

  // Infinite scroll: recreate observer when loading/hasMore changes so it re-fires
  // if the sentinel is still in the viewport after a page loads
  useEffect(() => {
    if (!sentinelRef.current || isLoading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPage(offsetRef.current, debouncedSearch, activeSort.ordering, generationRef.current);
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isLoading, hasMore, debouncedSearch, activeSort.ordering, fetchPage]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background border-2 border-primary rounded-2xl overflow-hidden p-4 pt-18 sm:p-6 lg:p-8 m-2 sm:m-4 lg:ml-0">
      <div className="flex flex-col gap-4 mb-6 lg:mb-8 z-10 relative xl:flex-row xl:justify-between xl:items-start">
        <div className="flex items-center gap-3 px-4 py-2.5 w-full xl:w-96 rounded-xl border border-primary/50 bg-background focus-within:border-primary transition-colors">
          <Search className="w-5 h-5 text-white" />
          <input
            type="text"
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-transparent text-white placeholder-white/80 outline-none"
          />
        </div>

        <div className="flex flex-col gap-2 relative sm:flex-row sm:items-center sm:gap-3">
          <span className="shrink-0">Sort By:</span>

          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setIsSortOpen((o) => !o)}
              className="flex items-center justify-between gap-3 w-full sm:w-64 px-4 py-2.5 border border-primary/50 rounded-xl bg-background hover:border-primary transition-colors"
            >
              {activeSort.label}
              <ChevronDown className="w-4 h-4" />
            </button>

            {isSortOpen && (
              <div className="absolute top-full left-0 right-0 sm:left-auto mt-2 sm:w-64 bg-background border border-primary rounded-xl overflow-hidden shadow-2xl flex flex-col">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.ordering}
                    onClick={() => {
                      setActiveSort(option);
                      setIsSortOpen(false);
                    }}
                    className="flex items-center justify-between px-4 py-3 text-left hover:bg-primary/20 transition-colors"
                  >
                    {option.label}
                    {activeSort.ordering === option.ordering && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-0 sm:pr-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
        <div className="flex flex-col gap-6">
          {worlds.map((world) => (
            <WorldTile key={world.id} world={world} />
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        {!isLoading && worlds.length === 0 && (
          <div className="flex justify-center py-16 text-white/50">No worlds found.</div>
        )}

        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  );
}
