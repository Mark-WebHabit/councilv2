import { useEffect, useRef } from "react";

const useIntersectionObserver = (callback: (element: Element) => void) => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
        }
      });
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback]);

  const observe = (element: Element | null) => {
    if (observerRef.current && element) {
      observerRef.current.observe(element);
    }
  };

  return observe;
};

export default useIntersectionObserver;
