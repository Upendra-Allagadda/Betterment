import { useState, type FC, type FormEvent } from 'react';
import { X, Plus, Palette } from 'lucide-react';

interface CustomAreaModalProps {
  onClose: () => void;
  onCreateArea: (data: { name: string; description: string; color: string; icon: string }) => Promise<void>;
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

export const CustomAreaModal: FC<CustomAreaModalProps> = ({ onClose, onCreateArea }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await onCreateArea({
        name: name.trim(),
        description: description.trim(),
        color,
        icon: 'target',
      });
      onClose();
    } catch (err) {
      console.error('Failed to create life area:', err);
      alert('Could not create life area: ' + (err as Error).message);
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
          maxWidth: '520px',
          background: 'var(--bg-surface)',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `${color}25`,
                border: `1px solid ${color}50`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: color,
              }}
            >
              <Palette size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Define Custom Goal Type / Life Area</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Create a personalized dimension for your life
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-icon btn-ghost" aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Area / Category Name:
            </label>
            <input
              type="text"
              placeholder="e.g. Creative Writing, Travel & Adventure, Parenting, Mindfulness"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
              }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Brief Purpose (optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Daily creative expression and novel drafting"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-main)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, marginBottom: '0.45rem' }}>
              Accent Theme Color:
            </label>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: color === c ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    boxShadow: color === c ? `0 0 10px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
              style={{ background: color, color: '#ffffff' }}
            >
              <Plus size={16} />
              <span>{submitting ? 'Creating...' : 'Create Life Area'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
