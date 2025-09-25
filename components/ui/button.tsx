"use client";

import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 
          text-white text-sm font-medium rounded-lg shadow 
          focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:ring-offset-1 transition ${className ?? ""}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
