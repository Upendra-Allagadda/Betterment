import { useState, type FC } from 'react';
import {
  ArrowRight,
  Plus,
  BookOpen,
  Activity,
  Briefcase,
  DollarSign,
  Heart,
  Target,
  Compass,
} from 'lucide-react';
import type { Goal, Area } from '../types';
import { GOAL_TEMPLATES, type GoalTemplate } from '../data/templates';
import { TemplateModal } from './TemplateModal';
import { CustomAreaModal } from './CustomAreaModal';

interface OverviewViewProps {
  goals: Goal[];
  areas: Area[];
  onSelectGoal: (id: string) => void;
  onOpenNewGoal: () => void;
  onAdoptTemplate: (data: any) => Promise<void>;
  onCreateArea: (data: { name: string; description: string; color: string; icon: string }) => Promise<void>;
  onNavigateToTab: (tab: 'daily' | 'goals') => void;
}

const AREA_ICON_MAP: Record<string, any> = {
  'activity': Activity,
  'book-open': BookOpen,
  'briefcase': Briefcase,
  'dollar-sign': DollarSign,
  'heart': Heart,
  'target': Target,
};

export const OverviewView: FC<OverviewViewProps> = ({
  goals,
  areas,
  onSelectGoal,
  onOpenNewGoal,
  onAdoptTemplate,
  onCreateArea,
  onNavigateToTab,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [showCustomAreaModal, setShowCustomAreaModal] = useState(false);

  const activeGoals = goals.filter((g) => g.status === 'Active');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header (Matching Mockup 1) */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.25rem',
          background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(25, 35, 55, 0.9))',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-active">Overview & Life Hub</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Personal Growth Made Approachable</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
              Life Overview: Elevate What Matters
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '650px' }}>
              GoalOS bridges the gap between everyday actions and meaningful life outcomes. Start with a proven template or define your own life vision below.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => setShowCustomAreaModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '0.84rem' }}
            >
              <Plus size={15} />
              <span>New Life Area</span>
            </button>
            <button
              onClick={onOpenNewGoal}
              className="btn btn-primary"
              style={{ fontSize: '0.84rem' }}
            >
              <Target size={15} />
              <span>Custom Goal</span>
            </button>
          </div>
        </div>

        {/* Life Dimensions Card (Matching Mockup 1) */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Life Dimensions
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{areas.length} Dimensions Tracked</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '1rem',
            }}
          >
            {areas.map((area) => {
              const areaGoals = goals.filter((g) => g.areaId === area.id && g.status === 'Active');
              const IconComp = AREA_ICON_MAP[area.icon] || Target;

              return (
                <div
                  key={area.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '0.6rem',
                    transition: 'all var(--transition-fast)',
                  }}
                  className="interactive-card"
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: `${area.color}20`,
                      border: `1px solid ${area.color}40`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: area.color,
                    }}
                  >
                    <IconComp size={20} />
                  </div>

                  <div>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {area.name}
                    </span>
                    <div style={{ marginTop: 2 }}>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          color: areaGoals.length > 0 ? area.color : 'var(--text-dim)',
                          fontWeight: 600,
                        }}
                      >
                        {areaGoals.length > 0 ? `${areaGoals.length} Active in Motion` : 'Open Dimension'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Outcomes Quick Strip (if user already has active goals) */}
      {activeGoals.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Your Active Intentions ({activeGoals.length})</h2>
            <button
              onClick={() => onNavigateToTab('goals')}
              className="btn btn-ghost"
              style={{ fontSize: '0.82rem', color: 'var(--primary)' }}
            >
              <span>View Full Roadmaps</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {activeGoals.map((g) => (
              <div
                key={g.id}
                onClick={() => onSelectGoal(g.id)}
                className="glass-panel interactive-card"
                style={{
                  padding: '1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-active">{g.status}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>{g.progress}%</span>
                </div>
                <h3 style={{ fontSize: '1rem', lineHeight: 1.35 }}>{g.title}</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  "{g.why}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Choose a Proven Template or Build Your Own (Matching Mockup 1) */}
      <div>
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            Choose a Proven Template or Build Your Own
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Selected high-impact life goals crafted for everyday balance. Click any template to inspect or adopt in 1-click.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {GOAL_TEMPLATES.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => setSelectedTemplate(tpl)}
              className="glass-panel interactive-card"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: `3px solid ${tpl.areaColor}`,
                gap: '1rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <span
                    style={{
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      color: tpl.areaColor,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {tpl.category}
                  </span>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>{tpl.targetDays} Days</span>
                </div>

                <h3 style={{ fontSize: '1.12rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.5rem' }}>
                  {tpl.title}
                </h3>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  {tpl.why}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  {tpl.suggestedCheckpoints.length} Checkpoints included
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  Adopt <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}

          {/* "+ Create Custom Goal or Define New Life Area" Card (Matching Mockup 1) */}
          <div
            onClick={onOpenNewGoal}
            className="glass-panel interactive-card"
            style={{
              padding: '1.5rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              border: '2px dashed rgba(59, 130, 246, 0.4)',
              background: 'rgba(59, 130, 246, 0.03)',
              minHeight: '200px',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}
            >
              <Compass size={24} />
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                + Create Custom Goal or Define New Life Area
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
                Have a unique ambition? Define your own outcome, timeline, and life dimension from scratch.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Template Modal Dialog */}
      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          areas={areas}
          onClose={() => setSelectedTemplate(null)}
          onAdoptTemplate={onAdoptTemplate}
        />
      )}

      {/* Custom Life Area Modal Dialog */}
      {showCustomAreaModal && (
        <CustomAreaModal
          onClose={() => setShowCustomAreaModal(false)}
          onCreateArea={onCreateArea}
        />
      )}
    </div>
  );
};
