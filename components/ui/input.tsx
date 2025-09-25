"use client";

import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg text-sm shadow-sm 
          focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:border-blue-500 transition ${className ?? ""}`}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
