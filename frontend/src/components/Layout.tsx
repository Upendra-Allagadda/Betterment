import { useState, useEffect, type ReactNode, type FC } from 'react';
import {
  Target,
  Sun,
  Moon,
  Sparkles,
  CheckCircle2,
  Map,
  RotateCcw,
  Scale,
  LayoutGrid,
} from 'lucide-react';
import { api } from '../api/client';

interface LayoutProps {
  currentTab: 'overview' | 'goals' | 'daily' | 'review' | 'templates' | 'balance';
  onSelectTab: (tab: 'overview' | 'goals' | 'daily' | 'review' | 'templates' | 'balance') => void;
  pendingCount?: number;
  onDataRefresh: () => void;
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  pendingCount = 0,
  onDataRefresh,
  children,
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSeed = async () => {
    try {
      setSeeding(true);
      await api.seedData();
      onDataRefresh();
    } catch (err) {
      console.error('Failed to seed:', err);
    } finally {
      setSeeding(false);
    }
  };

  interface NavItem {
    id: 'overview' | 'goals' | 'daily' | 'review' | 'templates' | 'balance';
    label: string;
    icon: typeof CheckCircle2;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'goals', label: 'Goal Workspace', icon: Map },
    { id: 'daily', label: 'Daily Focus', icon: CheckCircle2, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'review', label: 'Weekly Review', icon: RotateCcw },
    { id: 'templates', label: 'Templates', icon: Sparkles },
    { id: 'balance', label: 'Balance', icon: Scale },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Top Navbar matching Mockup 1 */}
      <header
        className="glass-panel"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderRadius: 0,
          borderInline: 'none',
          borderTop: 'none',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0.75rem 0',
          background: 'var(--bg-header)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div
          className="app-container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* Brand */}
          <div
            onClick={() => onSelectTab('daily')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer', flexShrink: 0 }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--primary-glow)',
              }}
            >
              <Target size={18} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Goal<span style={{ color: 'var(--primary)' }}>OS</span>
            </span>
          </div>

          {/* Centered Desktop Navigation Tabs */}
          <nav
            className="desktop-nav"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '0.35rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  style={{
                    position: 'relative',
                    padding: '0.4rem 0.65rem',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    transition: 'color var(--transition-fast)',
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span
                      style={{
                        background: 'rgba(59, 130, 246, 0.25)',
                        color: '#60a5fa',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.05rem 0.4rem',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -6,
                        left: '15%',
                        right: '15%',
                        height: 2,
                        background: 'var(--primary)',
                        borderRadius: 2,
                        boxShadow: '0 0 10px var(--primary)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Utility Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="btn btn-secondary"
              title="Reload realistic sample goals and actions"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
            >
              <Sparkles size={14} color="#fbbf24" />
              <span className="seed-text">{seeding ? 'Seeding...' : 'Demo Data'}</span>
            </button>

            <button
              onClick={toggleTheme}
              className="btn btn-icon btn-ghost"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* User Profile Initial Chip (matching mockup) */}
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-main)',
              }}
            >
              ME
            </div>
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main
        className="app-container"
        style={{
          flex: 1,
          paddingTop: '2rem',
          paddingBottom: '6rem',
        }}
      >
        {children}
      </main>

      {/* Mobile Sticky Bottom Nav */}
      <nav
        className="mobile-bottom-nav glass-panel"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderRadius: 0,
          borderInline: 'none',
          borderBottom: 'none',
          display: 'none',
          justifyContent: 'space-around',
          padding: '0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom))',
          background: 'rgba(12, 16, 23, 0.95)',
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '0.35rem',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.72rem',
                flex: 1,
                minHeight: 'var(--min-tap)',
              }}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
          .seed-text { display: none; }
        }
      `}</style>
    </div>
  );
};
