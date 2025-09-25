import React from "react";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md border px-3 py-2 text-sm font-medium disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`border rounded px-3 py-2 ${props.className ?? ""}`} />;
}


