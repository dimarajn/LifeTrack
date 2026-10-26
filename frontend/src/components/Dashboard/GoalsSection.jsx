import { useState } from 'react';
import styles from './GoalsSection.module.css';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const GOAL_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6'
];

export default function GoalsSection({
  goals = [],
  onAddGoal,
  onDepositGoal,
  onDeleteGoal
}) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const currency = user?.currency || 'PLN';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState(GOAL_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  // Active inline deposit state: { [goalId]: amountString }
  const [activeDepositId, setActiveDepositId] = useState(null);
  const [depositVal, setDepositVal] = useState('');

  const formatDeadline = (dateStr) => {
    if (!dateStr) return t('goals_no_deadline');
    try {
      const d = new Date(dateStr);
      const locale = language === 'pl' ? 'pl-PL' : language === 'es' ? 'es-ES' : 'en-US';
      const formatted = d.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      return `${t('goals_deadline_prefix')} ${formatted}`;
    } catch {
      return t('goals_no_deadline');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetAmount || Number(targetAmount) <= 0) return;

    setSubmitting(true);
    try {
      await onAddGoal({
        title: title.trim(),
        targetAmount: Number(targetAmount),
        currentAmount: currentAmount ? Number(currentAmount) : 0,
        deadline: deadline || null,
        color
      });
      setTitle('');
      setTargetAmount('');
      setCurrentAmount('');
      setDeadline('');
      setIsModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDepositSubmit = async (e, goalId) => {
    e.preventDefault();
    const val = Number(depositVal);
    if (!val || isNaN(val)) return;

    await onDepositGoal(goalId, val);
    setActiveDepositId(null);
    setDepositVal('');
  };

  const handleDelete = (id) => {
    if (window.confirm(t('goals_delete_confirm'))) {
      onDeleteGoal(id);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.headerRow}>
        <div className={styles.titleLeft}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          <h3 className={styles.title}>{t('goals_title')}</h3>
          <span className={styles.countBadge}>{goals.length}</span>
        </div>

        <button
          type="button"
          className={styles.addGoalBtn}
          onClick={() => setIsModalOpen(true)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>{t('goals_add_btn')}</span>
        </button>
      </div>

      {goals.length === 0 ? (
        <div className={styles.emptyBanner}>
          <span>{t('goals_empty')}</span>
        </div>
      ) : (
        <div className={styles.goalsGrid}>
          {goals.map((g) => {
            const pct = g.targetAmount > 0 ? Math.min(Math.round((g.currentAmount / g.targetAmount) * 100), 100) : 0;
            const isCompleted = g.currentAmount >= g.targetAmount;

            return (
              <div key={g.id} className={styles.goalCard}>
                <div className={styles.cardTop}>
                  <div className={styles.goalTitleWrap}>
                    <span className={styles.colorDot} style={{ backgroundColor: g.color || '#3B82F6' }} />
                    <span className={styles.goalTitle}>{g.title}</span>
                  </div>

                  <div className={styles.cardActions}>
                    <span className={styles.deadlineTag}>{formatDeadline(g.deadline)}</span>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(g.id)}
                      title={t('delete_tx_tooltip')}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className={styles.amountsRow}>
                  <div className={styles.savedText}>
                    <strong>{g.currentAmount.toFixed(2)}</strong>
                    <span className={styles.targetMuted}> / {g.targetAmount.toFixed(2)} {currency}</span>
                  </div>
                  <span
                    className={`${styles.pctBadge} ${isCompleted ? styles.pctDone : ''}`}
                    style={!isCompleted ? { color: g.color || '#60a5fa' } : undefined}
                  >
                    {isCompleted ? `✓ ${t('goals_completed')}` : `${pct}%`}
                  </span>
                </div>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isCompleted ? '#10b981' : (g.color || '#3B82F6')
                    }}
                  />
                </div>

                <div className={styles.cardFooter}>
                  {activeDepositId === g.id ? (
                    <form className={styles.depositForm} onSubmit={(e) => handleDepositSubmit(e, g.id)}>
                      <input
                        type="number"
                        step="0.01"
                        placeholder={`+ ${currency}`}
                        className={styles.depositInput}
                        value={depositVal}
                        onChange={(e) => setDepositVal(e.target.value)}
                        autoFocus
                        required
                      />
                      <button type="submit" className={styles.depositConfirmBtn}>OK</button>
                      <button
                        type="button"
                        className={styles.depositCancelBtn}
                        onClick={() => { setActiveDepositId(null); setDepositVal(''); }}
                      >
                        ✕
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      className={styles.depositTriggerBtn}
                      onClick={() => { setActiveDepositId(g.id); setDepositVal(''); }}
                    >
                      {t('goals_deposit_btn')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for adding a new Goal */}
      {isModalOpen && (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t('goals_modal_title')}</h3>
              <button type="button" className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form className={styles.modalForm} onSubmit={handleCreate}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>{t('goals_name_label')}</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder={t('goals_name_placeholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>{t('goals_target_label')} ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="0.00"
                    className={styles.input}
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>{t('goals_initial_label')}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={styles.input}
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>{t('goals_deadline_label')}</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>{t('goals_color_label')}</label>
                  <div className={styles.swatches}>
                    {GOAL_COLORS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`${styles.swatch} ${color === c ? styles.swatchActive : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>
                  {t('btn_cancel')}
                </button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? '...' : t('goals_add_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
