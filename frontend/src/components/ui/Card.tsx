import React, { HTMLAttributes } from "react";

export const Card: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
