import { useState, type FC, type FormEvent } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Sparkles,
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
  // Find current draft review if one is active
  const activeDraft = reviews.find((r) => r.status === 'Draft');
  const pastReviews = reviews.filter((r) => r.status === 'Completed');

  // Form state for completing the review
  const [whatWorked, setWhatWorked] = useState('');
  const [whatDidNotWork, setWhatDidNotWork] = useState('');
  const [whatToChange, setWhatToChange] = useState('');
  const [keyLearnings, setKeyLearnings] = useState('');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const handleFinalize = (e: FormEvent) => {
    e.preventDefault();
    if (!activeDraft) return;
    onCompleteReview(activeDraft.id, {
      whatWorked,
      whatDidNotWork,
      whatToChangeNextWeek: whatToChange,
      keyLearnings,
    });
    setStep(1);
    setWhatWorked('');
    setWhatDidNotWork('');
    setWhatToChange('');
    setKeyLearnings('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, rgba(14, 20, 34, 0.95), rgba(40, 20, 60, 0.8))',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-active">Review & Adjust</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FDR §10: Reflection Matters</span>
            </div>
            <h1 style={{ fontSize: '1.85rem', marginBottom: '0.4rem' }}>Weekly Review Ritual</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '640px' }}>
              "The system is not successful merely because users complete tasks. It should help users understand whether their actions are producing meaningful progress."
            </p>
          </div>

          {!activeDraft && (
            <button onClick={onStartReview} className="btn btn-primary" id="btn-start-weekly-review">
              <RotateCcw size={17} />
              <span>Start This Week's Review</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Draft Review Flow */}
      {activeDraft ? (
        <div
          className="glass-panel"
          style={{
            padding: '1.75rem',
            border: '1px solid var(--border-focus)',
            background: 'var(--bg-surface)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span className="badge badge-active">In Progress</span>
              <h2 style={{ fontSize: '1.3rem' }}>
                Review for Period {new Date(activeDraft.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} –{' '}
                {new Date(activeDraft.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </h2>
            </div>

            {/* Stepper Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {[1, 2, 3, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setStep(s as any)}
                  className={`btn ${step === s ? 'btn-primary' : 'btn-ghost'}`}
                  style={{
                    width: 32,
                    height: 32,
                    padding: 0,
                    borderRadius: '50%',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Step 1: Wins & Completed Actions */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <CheckCircle2 size={24} color="var(--success)" />
                <h3 style={{ fontSize: '1.15rem' }}>Step 1: Celebrate Completed Actions</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                During this review period, you closed{' '}
                <strong style={{ color: 'var(--success)' }}>{activeDraft.completedActionsCount} concrete execution actions</strong>{' '}
                across your active goals.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  What worked well this week? Which habits, time blocks, or decisions led to success?
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Uninterrupted 90-minute morning deep work blocks helped implement the gRPC protobuf milestone ahead of schedule."
                  value={whatWorked}
                  onChange={(e) => setWhatWorked(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button onClick={() => setStep(2)} className="btn btn-primary">
                  <span>Next: Inspect Friction</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Friction & Missed Commitments */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <AlertCircle size={24} color="var(--warning)" />
                <h3 style={{ fontSize: '1.15rem' }}>Step 2: Honest Reality Check on Friction</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Currently, <strong style={{ color: 'var(--danger)' }}>{activeDraft.missedActionsCount} commitments</strong> were
                overdue or missed. Honest self-reflection is the foundation of realistic planning.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  What did not work? Where did execution break down or get postponed?
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Stayed up late twice, causing morning lethargy and postponing Thursday's reading synthesis block."
                  value={whatDidNotWork}
                  onChange={(e) => setWhatDidNotWork(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button onClick={() => setStep(1)} className="btn btn-secondary">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="btn btn-primary">
                  <span>Next: Adjust Strategy</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Adjustments for Next Week */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <RotateCcw size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem' }}>Step 3: What should change next week?</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Adjust your environment, scope, or daily rhythm rather than relying merely on willpower.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  What specific adjustment or rule will you implement for next week?
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Leave phone outside bedroom at 10 PM. Schedule Kafka consumer work on Tuesday 8-10 AM."
                  value={whatToChange}
                  onChange={(e) => setWhatToChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button onClick={() => setStep(2)} className="btn btn-secondary">
                  Back
                </button>
                <button onClick={() => setStep(4)} className="btn btn-primary">
                  <span>Next: Key Learnings</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Key Insights & Finalize */}
          {step === 4 && (
            <form onSubmit={handleFinalize} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Sparkles size={24} color="#fbbf24" />
                <h3 style={{ fontSize: '1.15rem' }}>Step 4: Key Learnings & Finalize Review</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Distill any overarching insights from this week to retain as historical knowledge.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Key Principles & Insights (optional):
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. When milestones are broken down into sub-45 minute actions, execution resistance drops dramatically."
                  value={keyLearnings}
                  onChange={(e) => setKeyLearnings(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.8rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-main)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setStep(3)} className="btn btn-secondary">
                  Back
                </button>
                <button type="submit" className="btn btn-primary" id="btn-complete-weekly-review">
                  <CheckCircle2 size={17} />
                  <span>Finalize & Archive Weekly Review</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      {/* Historical Reviews Archive */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BookOpen size={18} color="var(--primary)" />
          <h2 style={{ fontSize: '1.2rem' }}>Historical Reflection Archive ({pastReviews.length})</h2>
        </div>

        {pastReviews.length === 0 ? (
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No past reviews completed yet. Complete your first weekly review above to build an ongoing record of personal growth.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pastReviews.map((rev) => {
              const startStr = new Date(rev.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
              const endStr = new Date(rev.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div key={rev.id} className="glass-panel" style={{ padding: '1.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className="badge badge-completed">Completed Review</span>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        Period: {startStr} – {endStr}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <span>
                        <strong style={{ color: 'var(--success)' }}>{rev.completedActionsCount}</strong> completed
                      </span>
                      <span>
                        <strong style={{ color: 'var(--danger)' }}>{rev.missedActionsCount}</strong> missed
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.88rem' }}>
                    {rev.whatWorked && (
                      <div style={{ background: 'rgba(16, 185, 129, 0.04)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
                        <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '0.25rem' }}>What Worked:</strong>
                        <p style={{ color: 'var(--text-main)', lineHeight: 1.45 }}>{rev.whatWorked}</p>
                      </div>
                    )}

                    {rev.whatDidNotWork && (
                      <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                        <strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '0.25rem' }}>What Did Not Work:</strong>
                        <p style={{ color: 'var(--text-main)', lineHeight: 1.45 }}>{rev.whatDidNotWork}</p>
                      </div>
                    )}

                    {rev.whatToChangeNextWeek && (
                      <div style={{ background: 'rgba(99, 102, 241, 0.04)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99, 102, 241, 0.15)' }}>
                        <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>What To Change:</strong>
                        <p style={{ color: 'var(--text-main)', lineHeight: 1.45 }}>{rev.whatToChangeNextWeek}</p>
                      </div>
                    )}
                  </div>

                  {rev.keyLearnings && (
                    <div style={{ marginTop: '0.85rem', fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                      Key Learning: "{rev.keyLearnings}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
