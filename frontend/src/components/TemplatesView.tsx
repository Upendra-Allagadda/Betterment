import { useState, type FC } from 'react';
import {
  Plus,
  ArrowRight,
  Compass,
  Target,
} from 'lucide-react';
import type { Area } from '../types';
import { GOAL_TEMPLATES, type GoalTemplate } from '../data/templates';
import { TemplateModal } from './TemplateModal';
import { CustomAreaModal } from './CustomAreaModal';

interface TemplatesViewProps {
  areas: Area[];
  onAdoptTemplate: (data: any) => Promise<void>;
  onCreateArea: (data: { name: string; description: string; color: string; icon: string }) => Promise<void>;
  onOpenNewGoal: () => void;
}

export const TemplatesView: FC<TemplatesViewProps> = ({
  areas,
  onAdoptTemplate,
  onCreateArea,
  onOpenNewGoal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [showCustomAreaModal, setShowCustomAreaModal] = useState(false);

  const categories = ['All', ...Array.from(new Set(GOAL_TEMPLATES.map((t) => t.category)))];

  const filteredTemplates = selectedCategory === 'All'
    ? GOAL_TEMPLATES
    : GOAL_TEMPLATES.filter((t) => t.category === selectedCategory);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
      {/* Header Banner */}
      <div
        className="glass-panel"
        style={{
          padding: '2rem 2.25rem',
          background: 'linear-gradient(135deg, rgba(16, 22, 35, 0.95), rgba(30, 25, 55, 0.9))',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-active">Goal Templates & Life Pillars</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>FDR §12: Start Simple</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.4rem', textAlign: 'left' }}>
              Goal Template Library
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.94rem', maxWidth: '640px', textAlign: 'left' }}>
              Proven, human-scale life goals designed for sustainable progress. Adopt any template with 1-click or create your own custom life category.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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

        {/* Life Dimension Category Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.75rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', marginRight: '0.25rem' }}>
            Life Dimensions:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.35rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: isSelected ? 700 : 500,
                  borderRadius: 'var(--radius-full)',
                  background: isSelected ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#ffffff' : 'var(--text-muted)',
                  border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredTemplates.map((tpl) => (
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
              gap: '1.25rem',
              textAlign: 'left',
              minHeight: '220px',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
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
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                  {tpl.targetDays} Days
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.35, marginBottom: '0.5rem', textAlign: 'left' }}>
                {tpl.title}
              </h3>

              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.45, textAlign: 'left' }}>
                {tpl.why}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                {tpl.suggestedCheckpoints.length} Checkpoints included
              </span>
              <span style={{ fontSize: '0.84rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Adopt Template <ArrowRight size={14} />
              </span>
            </div>
          </div>
        ))}

        {/* Custom Goal Card */}
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
            minHeight: '220px',
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
              + Create Custom Goal
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '280px' }}>
              Define your own specific outcome, motivation, and milestone checkpoints from scratch.
            </p>
          </div>
        </div>
      </div>

      {/* Template Adoption Modal Dialog */}
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
