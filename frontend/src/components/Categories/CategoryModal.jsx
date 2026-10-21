import { useState } from 'react';
import styles from './CategoryModal.module.css';
import { useLanguage } from '../../context/LanguageContext';

const PRESET_COLORS = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
  '#9966FF', '#FF9F40', '#10B981', '#EC4899', 
  '#6366F1', '#F59E0B', '#14B8A6', '#8B5CF6'
];

export default function CategoryModal({ isOpen, onClose, categories, onAddCategory, onDeleteCategory }) {
  const { t, translateCategory } = useLanguage();
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'income'
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const currentCategories = activeTab === 'expense'
    ? categories?.expense || []
    : categories?.income || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setError('');
    setLoading(true);
    try {
      await onAddCategory({
        name: newCatName.trim(),
        type: activeTab,
        color: selectedColor
      });
      setNewCatName('');
    } catch (err) {
      setError(err.message || t('cat_create_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cat) => {
    if (cat.isDefault) return;
    if (!window.confirm(`${t('cat_delete_confirm')} "${cat.name}"?`)) return;

    try {
      await onDeleteCategory(cat.id);
    } catch (err) {
      setError(err.message || t('cat_delete_error'));
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t('cat_modal_title')}</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.content}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'expense' ? styles.tabBtnActive : ''}`}
              onClick={() => { setActiveTab('expense'); setError(''); }}
            >
              {t('cat_tab_expense')}
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'income' ? styles.tabBtnActive : ''}`}
              onClick={() => { setActiveTab('income'); setError(''); }}
            >
              {t('cat_tab_income')}
            </button>
          </div>

          {error && <div className={styles.errorBanner}>{error}</div>}

          {/* Add Category Form */}
          <form className={styles.addForm} onSubmit={handleAdd}>
            <div className={styles.formRow}>
              <input
                className={styles.nameInput}
                type="text"
                placeholder={t('cat_name_placeholder')}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
              />
              <div className={styles.colorPickerWrapper}>
                <input
                  className={styles.colorInput}
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  title={t('cat_color_tooltip')}
                />
              </div>
              <button className={styles.addBtn} type="submit" disabled={loading}>
                {loading ? '...' : t('cat_add_btn')}
              </button>
            </div>

            <div className={styles.swatches}>
              {PRESET_COLORS.map((c) => (
                <span
                  key={c}
                  className={`${styles.swatch} ${selectedColor.toLowerCase() === c.toLowerCase() ? styles.swatchActive : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setSelectedColor(c)}
                />
              ))}
            </div>
          </form>

          {/* List of existing categories */}
          <ul className={styles.categoryList}>
            {currentCategories.map((cat, idx) => (
              <li key={cat.id || idx} className={styles.categoryItem}>
                <div className={styles.categoryLeft}>
                  <span
                    className={styles.colorDot}
                    style={{ backgroundColor: cat.color || '#3B82F6' }}
                  />
                  <span className={styles.categoryName}>{translateCategory(cat.name)}</span>
                </div>

                <div>
                  {cat.isDefault ? (
                    <span className={styles.categoryBadge}>{t('cat_badge_default')}</span>
                  ) : (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(cat)}
                      title={t('cat_delete_tooltip')}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
