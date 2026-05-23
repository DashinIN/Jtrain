import type { TabId } from "../types/navigation";
import { tabs } from "../types/navigation";
import type { createTranslator } from "../i18n/translations";

interface Props {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  t: ReturnType<typeof createTranslator>;
}

export function BottomNav({ currentTab, onTabChange, t }: Props) {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={currentTab === tab.id ? "bottom-item active" : "bottom-item"}
          onClick={() => onTabChange(tab.id)}
          type="button"
          aria-label={t(tab.id === "weak" ? "weak" : tab.id)}
        >
          <span>{tab.icon}</span>
          <small>{t(tab.id === "weak" ? "weak" : tab.id)}</small>
        </button>
      ))}
    </nav>
  );
}
