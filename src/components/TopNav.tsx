import type { TabId } from "../types/navigation";
import { tabs } from "../types/navigation";
import type { createTranslator } from "../i18n/translations";

interface Props {
  currentTab: TabId;
  onTabChange: (tab: TabId) => void;
  t: ReturnType<typeof createTranslator>;
}

export function TopNav({ currentTab, onTabChange, t }: Props) {
  return (
    <nav className="top-nav" aria-label="Primary navigation">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={currentTab === tab.id ? "nav-item active" : "nav-item"}
          onClick={() => onTabChange(tab.id)}
          type="button"
        >
          <span className="nav-icon">{tab.icon}</span>
          <span>{t(tab.id === "weak" ? "weak" : tab.id)}</span>
        </button>
      ))}
    </nav>
  );
}
