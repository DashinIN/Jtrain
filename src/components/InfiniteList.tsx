import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface Props<T> {
  items: T[];
  step?: number;
  className?: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  renderItem: (item: T, index: number) => ReactNode;
}

export function InfiniteList<T>({ items, step = 24, className, hasMore, isLoadingMore = false, onLoadMore, renderItem }: Props<T>) {
  const [visibleCount, setVisibleCount] = useState(step);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const canTriggerRef = useRef(true);
  const usesRemotePaging = Boolean(onLoadMore);

  useEffect(() => {
    if (usesRemotePaging) return;
    setVisibleCount(step);
  }, [items, step, usesRemotePaging]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      if (!entry.isIntersecting) {
        canTriggerRef.current = true;
        return;
      }

      if (!canTriggerRef.current) return;

      if (onLoadMore && hasMore && !isLoadingMore) {
        canTriggerRef.current = false;
        onLoadMore();
        return;
      }

      if (usesRemotePaging) return;

      canTriggerRef.current = false;
      setVisibleCount((current) => Math.min(items.length, current + step));
    }, { rootMargin: "160px 0px" });

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, items.length, onLoadMore, step, usesRemotePaging]);

  useEffect(() => {
    if (!isLoadingMore) {
      canTriggerRef.current = true;
    }
  }, [isLoadingMore, items.length]);

  return (
    <div className={className}>
      {(usesRemotePaging ? items : items.slice(0, visibleCount)).map((item, index) => renderItem(item, index))}
      {(hasMore || visibleCount < items.length) && <div ref={sentinelRef} className="list-sentinel" aria-hidden="true" />}
    </div>
  );
}
