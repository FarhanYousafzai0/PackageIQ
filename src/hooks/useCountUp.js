import { useState, useEffect, useRef } from 'react';

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const useCountUp = (target, options = {}) => {
  const { duration = 800, enabled = true, formatter } = options;
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!enabled || target == null) {
      setValue(target ?? 0);
      return;
    }

    startRef.current = performance.now();
    const animate = (now) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setValue(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, enabled]);

  if (formatter) return formatter(value);
  return value;
};

export default useCountUp;
