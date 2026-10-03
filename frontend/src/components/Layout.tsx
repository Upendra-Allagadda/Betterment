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
} from 'lucide-react';
import { api } from '../api/client';

interface LayoutProps {
  currentTab: 'daily' | 'goals' | 'review' | 'balance';
  onSelectTab: (tab: 'daily' | 'goals' | 'review' | 'balance') => void;
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
    id: 'daily' | 'goals' | 'review' | 'balance';
    label: string;
    icon: typeof CheckCircle2;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'daily', label: 'Daily Focus', icon: CheckCircle2, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'goals', label: 'Goal Roadmap', icon: Map },
    { id: 'review', label: 'Weekly Review', icon: RotateCcw },
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
          padding: '0.85rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(12, 16, 23, 0.92)',
        }}
      >
        {/* Brand */}
        <div
          onClick={() => onSelectTab('daily')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', cursor: 'pointer' }}
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
            gap: '1.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '0.35rem 1rem',
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
                  fontSize: '0.9rem',
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
                      left: '20%',
                      right: '20%',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn btn-secondary"
            title="Reload realistic sample goals and actions"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: 'var(--radius-full)' }}
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
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-main)',
            }}
          >
            ME
          </div>
        </div>
      </header>

      {/* Main View Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '1180px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem 1.5rem 6rem 1.5rem',
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
