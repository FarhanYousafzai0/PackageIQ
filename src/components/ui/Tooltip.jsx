import React, { useState } from 'react';

const Tooltip = ({ children, text, className = '' }) => {
  const [show, setShow] = useState(false);

  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && text && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 shadow-xl backdrop-blur-xl animate-tooltip">
          {text}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </span>
      )}
    </span>
  );
};

export default Tooltip;
