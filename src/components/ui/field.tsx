import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`field ${props.className ?? ""}`} {...props} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={`field ${props.className ?? ""}`} {...props} />;
}
