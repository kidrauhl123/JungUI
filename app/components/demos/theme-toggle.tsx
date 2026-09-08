"use client";
import { useState } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
export default function Demo() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <div className="demo-theme" data-theme={theme}>
      <span>{theme === "light" ? "Day" : "Night"}</span>
      <ThemeToggle value={theme} onValueChange={setTheme} />
    </div>
  );
}
