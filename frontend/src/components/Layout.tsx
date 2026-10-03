import { useState, useEffect, type ReactNode, type FC } from 'react';
import {
  CheckCircle2,
  Target,
  RotateCcw,
  Scale,
  Sun,
  Moon,
  Sparkles,
  Layers,
  ArrowRight,
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Top Navbar */}
      <header
        className="glass-panel"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderRadius: 0,
          borderInline: 'none',
          borderTop: 'none',
          padding: '0.85rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }} onClick={() => onSelectTab('daily')}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px var(--primary-glow)',
              }}
            >
              <Target size={20} color="#ffffff" />
            </div>
            <div>
              <span className="brand-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Goal<span style={{ color: 'var(--primary)' }}>OS</span>
              </span>
              <span
                style={{
                  display: 'block',
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  fontWeight: 600,
                  marginTop: -2,
                }}
              >
                Personal Goal Execution
              </span>
            </div>
          </div>

          {/* Desktop Product Loop Indicator (FDR §1) */}
          <div
            className="loop-badge"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.3rem 0.8rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}
          >
            <span>Define</span> <ArrowRight size={12} />
            <span>Plan</span> <ArrowRight size={12} />
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Execute</span> <ArrowRight size={12} />
            <span>Review</span> <ArrowRight size={12} />
            <span>Adjust</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            onClick={() => onSelectTab('daily')}
            className={`btn ${currentTab === 'daily' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            <CheckCircle2 size={17} />
            <span>Daily Focus</span>
            {pendingCount > 0 && (
              <span
                style={{
                  background: currentTab === 'daily' ? 'rgba(255,255,255,0.25)' : 'rgba(99, 102, 241, 0.2)',
                  color: currentTab === 'daily' ? '#ffffff' : 'var(--primary)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: 'var(--radius-full)',
                  marginLeft: '0.2rem',
                }}
              >
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('goals')}
            className={`btn ${currentTab === 'goals' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Layers size={17} />
            <span>Goals & Planning</span>
          </button>

          <button
            onClick={() => onSelectTab('review')}
            className={`btn ${currentTab === 'review' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            <RotateCcw size={17} />
            <span>Weekly Review</span>
          </button>

          <button
            onClick={() => onSelectTab('balance')}
            className={`btn ${currentTab === 'balance' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Scale size={17} />
            <span>Balance & Trade-offs</span>
          </button>
        </nav>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn btn-secondary"
            title="Reload realistic sample goals and actions"
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
          >
            <Sparkles size={15} color="#fbbf24" />
            <span className="seed-text">{seeding ? 'Seeding...' : 'Demo Data'}</span>
          </button>

          <button
            onClick={toggleTheme}
            className="btn btn-icon btn-ghost"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main
        style={{
          flex: 1,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          padding: '1.75rem 1.25rem 6rem 1.25rem',
        }}
      >
        {children}
      </main>

      {/* Mobile Sticky Bottom Navigation (FDR §3: Touch & responsive contract) */}
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
          padding: '0.4rem 0.5rem calc(0.4rem + env(safe-area-inset-bottom))',
        }}
      >
        <button
          onClick={() => onSelectTab('daily')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '0.4rem',
            color: currentTab === 'daily' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: currentTab === 'daily' ? 600 : 400,
            fontSize: '0.72rem',
            minHeight: 'var(--min-tap)',
            flex: 1,
          }}
        >
          <CheckCircle2 size={20} />
          <span>Daily</span>
        </button>

        <button
          onClick={() => onSelectTab('goals')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '0.4rem',
            color: currentTab === 'goals' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: currentTab === 'goals' ? 600 : 400,
            fontSize: '0.72rem',
            minHeight: 'var(--min-tap)',
            flex: 1,
          }}
        >
          <Layers size={20} />
          <span>Goals</span>
        </button>

        <button
          onClick={() => onSelectTab('review')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '0.4rem',
            color: currentTab === 'review' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: currentTab === 'review' ? 600 : 400,
            fontSize: '0.72rem',
            minHeight: 'var(--min-tap)',
            flex: 1,
          }}
        >
          <RotateCcw size={20} />
          <span>Review</span>
        </button>

        <button
          onClick={() => onSelectTab('balance')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            padding: '0.4rem',
            color: currentTab === 'balance' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: currentTab === 'balance' ? 600 : 400,
            fontSize: '0.72rem',
            minHeight: 'var(--min-tap)',
            flex: 1,
          }}
        >
          <Scale size={20} />
          <span>Balance</span>
        </button>
      </nav>

      {/* Media Query Styling */}
      <style>{`
        @media (min-width: 900px) {
          .loop-badge { display: flex !important; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-bottom-nav { display: flex !important; }
          .seed-text { display: none; }
        }
      `}</style>
    </div>
  );
};
