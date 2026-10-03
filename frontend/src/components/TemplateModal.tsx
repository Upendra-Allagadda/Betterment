import { useState, type FC, type FormEvent } from 'react';
import { X, Check, Sparkles, Sliders } from 'lucide-react';
import type { GoalTemplate } from '../data/templates';
import type { Area } from '../types';

interface TemplateModalProps {
  template: GoalTemplate;
  areas: Area[];
  onClose: () => void;
  onAdoptTemplate: (data: {
    areaId: string;
    areaName: string;
    areaColor: string;
    areaIcon: string;
    title: string;
    why: string;
    targetDate: string;
    successDefinition: string;
    milestones: string[];
  }) => Promise<void>;
}

export const TemplateModal: FC<TemplateModalProps> = ({
  template,
  areas,
  onClose,
  onAdoptTemplate,
}) => {
  const [title, setTitle] = useState(template.title);
  const [why, setWhy] = useState(template.why);
  const [days, setDays] = useState(template.targetDays);
  const [successDef, setSuccessDef] = useState(template.successDefinition);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedMilestones, setSelectedMilestones] = useState<string[]>(template.suggestedCheckpoints);
  const [submitting, setSubmitting] = useState(false);

  // Match existing area by name or fallback
  const matchingArea = areas.find(
    (a) => a.name.toLowerCase().includes(template.category.toLowerCase().split('&')[0].trim())
  );

  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() + days);
  const targetDateStr = targetDateObj.toISOString();

  const handleToggleMilestone = (ms: string) => {
    if (selectedMilestones.includes(ms)) {
      setSelectedMilestones(selectedMilestones.filter((m) => m !== ms));
    } else {
      setSelectedMilestones([...selectedMilestones, ms]);
    }
  };

  const handleAdopt = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !why.trim() || !successDef.trim()) return;

    try {
      setSubmitting(true);
      await onAdoptTemplate({
        areaId: matchingArea ? matchingArea.id : '',
        areaName: template.areaName,
        areaColor: template.areaColor,
        areaIcon: template.areaIcon,
        title: title.trim(),
        why: why.trim(),
        targetDate: targetDateStr,
        successDefinition: successDef.trim(),
        milestones: selectedMilestones,
      });
      onClose();
    } catch (err) {
      console.error('Failed to adopt template:', err);
      alert('Could not adopt template: ' + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '680px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          padding: '2rem',
        }}
      >
        {/* Header (Matching Mockup 2) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: `${template.areaColor}20`,
                border: `1px solid ${template.areaColor}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: template.areaColor,
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', lineHeight: 1.3 }}>
                Adopt Goal Template: {template.title}
              </h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Answer a few simple questions to make this goal yours.
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-icon btn-ghost" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleAdopt} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Question 1: What */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              1. What outcome are you creating?
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
              }}
              required
            />
          </div>

          {/* Question 2: Why */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              2. Why is this important to you?
            </label>
            <textarea
              rows={2}
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                resize: 'vertical',
                lineHeight: 1.45,
              }}
              required
            />
          </div>

          {/* Question 3: Target Timeline */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-main)' }}>
                3. Target Timeline: {days} Days
              </label>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Target: {targetDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="180"
              step="15"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: template.areaColor,
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Question 4: Success Definition */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              4. How will you know you succeeded?
            </label>
            <textarea
              rows={2}
              value={successDef}
              onChange={(e) => setSuccessDef(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 0.85rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
                resize: 'vertical',
                lineHeight: 1.45,
              }}
              required
            />
          </div>

          {/* Suggested Checkpoints (Matching Mockup 2) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              Suggested Checkpoints & Milestones:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {template.suggestedCheckpoints.map((ms, idx) => {
                const isChecked = selectedMilestones.includes(ms);
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleMilestone(ms)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.65rem 0.85rem',
                      background: isChecked ? `${template.areaColor}10` : 'rgba(255, 255, 255, 0.03)',
                      border: isChecked ? `1px solid ${template.areaColor}35` : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: isChecked ? template.areaColor : 'transparent',
                        border: isChecked ? 'none' : '1px solid var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isChecked && <Check size={12} color="#ffffff" />}
                    </div>
                    <span style={{ color: isChecked ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {ms}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions (Matching Mockup 2) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.75rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <button
              type="button"
              onClick={() => setIsCustomizing(!isCustomizing)}
              className="btn btn-secondary"
              style={{ fontSize: '0.84rem' }}
            >
              <Sliders size={15} />
              <span>{isCustomizing ? 'Lock Template' : '+ Or Customize into My Own Words'}</span>
            </button>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} className="btn btn-ghost">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  background: template.areaColor,
                  color: '#ffffff',
                  boxShadow: `0 4px 16px ${template.areaColor}40`,
                }}
              >
                <span>{submitting ? 'Adopting Goal...' : 'Start with this Goal (1-Click)'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
