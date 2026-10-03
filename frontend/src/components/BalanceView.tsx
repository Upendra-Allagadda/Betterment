import { type FC } from 'react';
import { AlertTriangle, CheckCircle2, Layers } from 'lucide-react';
import type { CapacityAssessment } from '../types';

interface BalanceViewProps {
  assessment: CapacityAssessment | null;
  onNavigateToGoals: () => void;
}

export const BalanceView: FC<BalanceViewProps> = ({
  assessment,
  onNavigateToGoals,
}) => {
  if (!assessment) {
    return (
      <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
        Loading capacity metrics...
      </div>
    );
  }

  const {
    totalActiveGoals,
    totalPendingTasks,
    totalOverdueTasks,
    isOvercommitted,
    overloadWarning,
    areasBreakdown,
  } = assessment;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, rgba(14, 20, 34, 0.95), rgba(20, 45, 60, 0.8))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-active">Capacity & Trade-offs</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FDR §16: Realistic Execution</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Workload & Life Area Balance</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '640px' }}>
              The system protects you from uncontrolled goal accumulation. High achievement comes from finishing what you start rather than starting everything at once.
            </p>
          </div>
        </div>

        {/* Global Capacity Metrics Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Active Goals (Max recommended: 5)</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: totalActiveGoals > 5 ? 'var(--danger)' : 'var(--text-main)' }}>
                {totalActiveGoals}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/ 5</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pending Execution Actions</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: totalPendingTasks > 20 ? 'var(--warning)' : 'var(--text-main)' }}>
                {totalPendingTasks}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>tasks</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Overdue Commitments</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: totalOverdueTasks > 0 ? 'var(--danger)' : 'var(--success)' }}>
                {totalOverdueTasks}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>lagging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade-off Alert / Capacity Health Indicator */}
      {isOvercommitted ? (
        <div
          className="glass-panel"
          style={{
            borderLeft: '4px solid var(--danger)',
            background: 'rgba(239, 68, 68, 0.06)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <AlertTriangle size={24} color="var(--danger)" />
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Overcommitment Detected</h3>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>{overloadWarning}</p>
            </div>
          </div>

          <button onClick={onNavigateToGoals} className="btn btn-secondary" style={{ fontSize: '0.82rem' }}>
            Review & Pause Goals
          </button>
        </div>
      ) : (
        <div
          className="glass-panel"
          style={{
            borderLeft: '4px solid var(--success)',
            background: 'rgba(16, 185, 129, 0.05)',
            padding: '1.1rem 1.4rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <CheckCircle2 size={22} color="var(--success)" />
          <div>
            <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>
              Execution Capacity in Healthy Range
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Your current active commitments match realistic execution capacity. Focus on advancing today's top milestones.
            </p>
          </div>
        </div>
      )}

      {/* Breakdown by Life Area */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Layers size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '1.2rem' }}>Workload Distribution by Life Area</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {areasBreakdown.map((area) => (
            <div
              key={area.areaId}
              className="glass-panel interactive-card"
              style={{
                padding: '1.4rem',
                borderTop: `3px solid ${area.areaColor || 'var(--primary)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '1.05rem', color: area.areaColor || 'var(--text-main)' }}>
                  {area.areaName}
                </span>
                <span className="badge badge-active">{area.activeGoalsCount} Active Goals</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Pending Actions:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{area.pendingActions}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Overdue Actions:</span>
                <span style={{ fontWeight: 600, color: area.overdueActions > 0 ? 'var(--danger)' : 'var(--success)' }}>
                  {area.overdueActions}
                </span>
              </div>

              {/* Relative Weight Bar */}
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(100, area.pendingActions * 10)}%`,
                    backgroundColor: area.areaColor || 'var(--primary)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
