import type { ReactNode } from "react";
import type { TabId } from "../types/navigation";
import type { createTranslator } from "../i18n/translations";
import { BottomNav } from "./BottomNav";
import { TopNav } from "./TopNav";

interface Props {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  t: ReturnType<typeof createTranslator>;
  children: ReactNode;
}

export function AppLayout({ currentTab, onTabChange, t, children }: Props) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>JTrain</h1>
          <p>{t("subtitle")}</p>
        </div>
        <TopNav currentTab={currentTab} onTabChange={onTabChange} t={t} />
      </header>
      <main className="app-main">{children}</main>
      <BottomNav currentTab={currentTab} onTabChange={onTabChange} t={t} />
    </div>
  );
}
