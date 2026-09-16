import type { ReactNode } from "react";

import { ToolsShell } from "@/components/tools/tools-shell";

export default function ToolsLayout({ children }: { children: ReactNode }) {
  return <ToolsShell>{children}</ToolsShell>;
}
