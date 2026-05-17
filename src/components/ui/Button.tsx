import "./Button.css";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline";
  children: ReactNode;
};

function getButtonClassName(variant: "default" | "outline", className?: string) {
  const classes = ["ui-button", variant === "outline" ? "ui-button--outline" : "ui-button--default"];

  if (className) {
    classes.push(className);
  }

  return classes.join(" ");
}

export function Button({
  variant = "default",
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={getButtonClassName(variant, className)} {...props}>
      {children}
    </button>
  );
}
