import "./BottomNav.css";

const TABS = [
  { id: "home",    label: "Home",    icon: HomeIcon },
  { id: "search",  label: "Search",  icon: SearchIcon },
  { id: "add",     label: "Add",     icon: AddIcon },
  { id: "reels",   label: "Reels",   icon: ReelsIcon },
  { id: "profile", label: "Profile", icon: ProfileIcon },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          className={`nav-btn ${activeTab === id ? "active" : ""}`}
          onClick={() => setActiveTab(id)}
          aria-label={label}
        >
          <Icon active={activeTab === id} />
          {activeTab === id && <span className="nav-dot" />}
        </button>
      ))}
    </nav>
  );
}

function HomeIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline
        points="9 22 9 12 15 12 15 22"
        fill={active ? "var(--bg-primary)" : "none"}
        strokeWidth="2"
      />
    </svg>
  );
}

function SearchIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.8 : 2}
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function AddIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.8 : 2}
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4"/>
      <line x1="12" y1="8" x2="12" y2="16"/>
      <line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  );
}

function ReelsIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={active ? 2.8 : 2}
      strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"/>
      <rect x="1" y="5" width="15" height="14" rx="2"/>
    </svg>
  );
}

function ProfileIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}