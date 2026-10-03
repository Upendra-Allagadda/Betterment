import { useState, type FC, type FormEvent } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import type { WeeklyReview } from '../types';

interface WeeklyReviewViewProps {
  reviews: WeeklyReview[];
  onStartReview: () => void;
  onCompleteReview: (
    id: string,
    data: {
      whatWorked: string;
      whatDidNotWork: string;
      whatToChangeNextWeek: string;
      keyLearnings: string;
    }
  ) => void;
}

export const WeeklyReviewView: FC<WeeklyReviewViewProps> = ({
  reviews,
  onStartReview,
  onCompleteReview,
}) => {
  const activeDraft = reviews.find((r) => r.status === 'Draft');
  const pastReviews = reviews.filter((r) => r.status === 'Completed');

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [whatWorked, setWhatWorked] = useState('');
  const [whatDidNotWork, setWhatDidNotWork] = useState('');
  const [whatToChange, setWhatToChange] = useState('');
  const [keyLearnings, setKeyLearnings] = useState('');

  const now = new Date();
  const startPeriod = new Date(now);
  startPeriod.setDate(now.getDate() - 7);
  const periodStr = `${startPeriod.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – ${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!activeDraft) return;
    onCompleteReview(activeDraft.id, {
      whatWorked,
      whatDidNotWork,
      whatToChangeNextWeek: whatToChange,
      keyLearnings,
    });
    setWhatWorked('');
    setWhatDidNotWork('');
    setWhatToChange('');
    setKeyLearnings('');
    setActiveStep(1);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner (Matching Mockup 3) */}
      <div style={{ textAlign: 'left', padding: '0.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-active">Weekly Reflection</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FDR §15: Close the Execution Loop</span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em', textAlign: 'left' }}>
          Weekly Review: {periodStr}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', textAlign: 'left' }}>
          Connect weekly execution to long-term outcomes and strategic adjustments.
        </p>

        {/* Stepper Progress Tabs (Matching Mockup 3) */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '0.35rem 0.6rem',
            marginTop: '1.25rem',
            overflowX: 'auto',
          }}
        >
          {[
            { step: 1, label: '1. Wins & Completions' },
            { step: 2, label: '2. Friction & Incomplete' },
            { step: 3, label: '3. Strategic Adjustment' },
            { step: 4, label: '4. Key Insights' },
          ].map((item, index) => {
            const isCurrent = activeStep === item.step;
            return (
              <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <button
                  onClick={() => setActiveStep(item.step as any)}
                  style={{
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.78rem',
                    fontWeight: isCurrent ? 700 : 500,
                    borderRadius: 'var(--radius-full)',
                    background: isCurrent ? 'rgba(59, 130, 246, 0.25)' : 'transparent',
                    color: isCurrent ? '#60a5fa' : 'var(--text-dim)',
                    border: isCurrent ? '1px solid rgba(59, 130, 246, 0.4)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </button>
                {index < 3 && <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>→</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Split Reflection Workspace (Matching Mockup 3) */}
      {activeDraft ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)',
              gap: '1.5rem',
            }}
            className="review-split-grid"
          >
            {/* Left Card: Execution Snapshot */}
            <div
              className="glass-panel"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Execution Snapshot</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} color="var(--success)" />
                  <span style={{ color: 'var(--text-main)' }}>
                    <strong style={{ color: 'var(--success)' }}>{activeDraft.completedActionsCount}</strong> completed actions
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                  <CheckCircle2 size={18} color="var(--success)" />
                  <span style={{ color: 'var(--text-main)' }}>
                    <strong style={{ color: 'var(--success)' }}>{activeDraft.goalsReviewedCount}</strong> active goals reviewed
                  </span>
                </div>

                {activeDraft.missedActionsCount > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <AlertCircle size={18} color="var(--danger)" />
                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                      {activeDraft.missedActionsCount} overdue action{activeDraft.missedActionsCount > 1 ? 's' : ''}
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={18} color="var(--success)" />
                    <span style={{ color: 'var(--text-muted)' }}>Zero overdue actions</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                Honest self-calibration is the cornerstone of sustainable improvement.
              </div>
            </div>

            {/* Right Card: Reflection Journal */}
            <div
              className="glass-panel"
              style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Reflection Journal</h3>

              {/* Prompt 1 */}
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  What worked well this week?
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Uninterrupted 90-minute morning deep work blocks helped implement the gRPC protobuf milestone ahead of schedule."
                  value={whatWorked}
                  onChange={(e) => setWhatWorked(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    lineHeight: 1.45,
                  }}
                />
              </div>

              {/* Prompt 2 */}
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  What did not work?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Late evening screen time caused sluggish morning runs and postponed Thursday's reading block."
                  value={whatDidNotWork}
                  onChange={(e) => setWhatDidNotWork(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    lineHeight: 1.45,
                  }}
                />
              </div>

              {/* Prompt 3 */}
              <div>
                <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  What will you adjust next week?
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Dock phone outside bedroom at 10 PM. Prioritize the Kafka consumer refactor during Tuesday 8-10 AM."
                  value={whatToChange}
                  onChange={(e) => setWhatToChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    lineHeight: 1.45,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Primary Action Button (Matching Mockup 3) */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            <button
              type="submit"
              className="btn btn-primary"
              id="btn-finalize-review"
              style={{
                padding: '0.75rem 2rem',
                fontSize: '0.95rem',
                borderRadius: 'var(--radius-sm)',
                boxShadow: '0 4px 20px var(--primary-glow)',
              }}
            >
              Finalize Review & Calibrate Plan
            </button>
          </div>
        </form>
      ) : (
        <div
          className="glass-panel"
          style={{
            padding: '3rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <RotateCcw size={36} color="var(--primary)" />
          <h2 style={{ fontSize: '1.25rem' }}>Ready for your Weekly Review?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px' }}>
            Close the loop on this week's commitments and calibrate your plan for the upcoming week.
          </p>
          <button onClick={onStartReview} className="btn btn-primary" id="btn-start-review">
            Start Review & Calibration
          </button>
        </div>
      )}

      {/* Historical Reviews Archive */}
      {pastReviews.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <BookOpen size={18} color="var(--primary)" />
            <h2 style={{ fontSize: '1.15rem' }}>Past Reflection Archive ({pastReviews.length})</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pastReviews.map((rev) => (
              <div key={rev.id} className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    {new Date(rev.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
                    {new Date(rev.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span className="badge badge-completed">Completed</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                  {rev.whatWorked && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.04)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '0.2rem' }}>What Worked:</strong>
                      <p style={{ color: 'var(--text-main)' }}>{rev.whatWorked}</p>
                    </div>
                  )}
                  {rev.whatDidNotWork && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '0.2rem' }}>Friction:</strong>
                      <p style={{ color: 'var(--text-main)' }}>{rev.whatDidNotWork}</p>
                    </div>
                  )}
                  {rev.whatToChangeNextWeek && (
                    <div style={{ background: 'rgba(59, 130, 246, 0.04)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.2rem' }}>Adjustment:</strong>
                      <p style={{ color: 'var(--text-main)' }}>{rev.whatToChangeNextWeek}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 800px) {
          .review-split-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
