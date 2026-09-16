"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/lib/i18n";
import { DocumentIcon, RefreshIcon } from "@/components/tools/icons";

export function PanelHeader({
  icon,
  title,
  onReset,
}: {
  icon: ReactNode;
  title: string;
  onReset: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between">
      <h1 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        {icon}
        {title}
      </h1>
      <button
        type="button"
        aria-label={t.reset}
        onClick={onReset}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted"
      >
        <RefreshIcon />
      </button>
    </div>
  );
}

export function SummaryBlock({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="mt-8">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <DocumentIcon />
        {t.summary}
      </h2>
      {children}
    </div>
  );
}

export function EmptyCopy({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-sm text-muted-foreground">{children}</p>;
}
