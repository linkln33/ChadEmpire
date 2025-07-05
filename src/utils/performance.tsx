import React, { lazy, Suspense, ComponentType } from 'react';
import { useInView } from 'react-intersection-observer';

// Lazy load any component with a loading fallback
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <div className="animate-pulse bg-gray-200 rounded-md h-40 w-full"></div>
) {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Only render component when it's in viewport
export function DeferredRender({ 
  children, 
  threshold = 0.1,
  placeholder = <div className="animate-pulse bg-gray-200 rounded-md h-40 w-full"></div>
}: { 
  children: React.ReactNode, 
  threshold?: number,
  placeholder?: React.ReactNode
}) {
  const { ref, inView } = useInView({
    threshold,
    triggerOnce: true,
  });

  return (
    <div ref={ref}>
      {inView ? children : placeholder}
    </div>
  );
}

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Cache expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>;
    }
    
    const result = func(...args);
    cache.set(key, result);
    return result;
  } as T;
}
