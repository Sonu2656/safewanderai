import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Mount heavy children only when they enter the viewport.
 * Drastically reduces initial paint cost for offscreen WebGL canvases.
 */
export const LazyMount = ({
  children,
  fallback = null,
  rootMargin = "200px",
  className = "",
}: {
  children: ReactNode;
  fallback?: ReactNode;
  rootMargin?: string;
  className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {show ? children : fallback}
    </div>
  );
};
