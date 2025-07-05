'use client';

import React, { ReactNode, useEffect, useState } from 'react';

interface DeferredRenderProps {
  children: ReactNode;
  delay?: number;
}

/**
 * Component that defers rendering its children until after the component has mounted
 * and an optional delay has passed. Useful for performance optimization.
 */
export const DeferredRender: React.FC<DeferredRenderProps> = ({ 
  children, 
  delay = 0 
}) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldRender(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return shouldRender ? <>{children}</> : null;
};
