import type { ReactNode } from 'react'

export type Tab = { id: string; label: string; content: ReactNode }

export function Tabs({ tabs, activeId, onChange }: { tabs: Tab[]; activeId: string; onChange: (id: string) => void }) {
  return (
    <div className="ui-tabs">
      <div className="ui-tabs__list" role="tablist">
        {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={tab.id === activeId} className={tab.id === activeId ? 'is-active' : ''} onClick={() => onChange(tab.id)}>{tab.label}</button>)}
      </div>
      <div role="tabpanel" className="ui-tabs__panel">{tabs.find((tab) => tab.id === activeId)?.content}</div>
    </div>
  )
}
