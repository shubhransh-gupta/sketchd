import { useEffect, useRef } from 'react';
import styles from './PropertiesPanel.module.css';
import { useDrawing } from '../../context/drawing-context-value';
import { STROKE_COLORS, BACKGROUND_COLORS, STROKE_WIDTHS } from '../../types';
import { ArrowUp, ArrowDown } from 'lucide-react';

export function PropertiesPanel() {
  const { state, updateElement } = useDrawing();
  const panelRef = useRef<HTMLDivElement>(null);
  const selectedIds = state.document.appState.selectedElementIds;
  const selected = state.document.elements.filter((el) => selectedIds.includes(el.id));

  useEffect(() => {
    // animate in when selection changes
  }, [selectedIds]);

  if (selected.length === 0) return null;

  const el = selected[0];
  const isMulti = selected.length > 1;

  return (
    <aside
      ref={panelRef}
      className={styles.panel}
      aria-label="Properties"
    >
      {isMulti && (
        <p className={styles.multiLabel}>{selected.length} items selected — press Delete</p>
      )}

      <div className={styles.section}>
        <label className={styles.label}>Stroke</label>
        <div className={styles.colors}>
          {STROKE_COLORS.map((color) => (
            <button
              key={color}
              className={`${styles.colorSwatch} ${el.strokeColor === color ? styles.active : ''}`}
              style={{ background: color }}
              onClick={() => selected.forEach((s) => updateElement(s.id, { strokeColor: color }))}
              aria-label={`Stroke color ${color}`}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Width</label>
        <div className={styles.widths}>
          {STROKE_WIDTHS.map((w) => (
            <button
              key={w}
              className={`${styles.widthButton} ${el.strokeWidth === w ? styles.active : ''}`}
              onClick={() => selected.forEach((s) => updateElement(s.id, { strokeWidth: w }))}
              aria-label={`Stroke width ${w}`}
            >
              <span style={{ width: w * 3, height: w, background: 'currentColor', borderRadius: 1 }} />
            </button>
          ))}
        </div>
      </div>

      {el.type !== 'text' && el.type !== 'line' && el.type !== 'arrow' && (
        <div className={styles.section}>
          <label className={styles.label}>Fill</label>
          <div className={styles.colors}>
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color}
                className={`${styles.colorSwatch} ${el.backgroundColor === color ? styles.active : ''}`}
                style={{
                  background: color === 'transparent' ? 'var(--bg-hover)' : color,
                  backgroundImage: color === 'transparent'
                    ? 'linear-gradient(45deg, var(--border-subtle) 25%, transparent 25%, transparent 75%, var(--border-subtle) 75%)'
                    : undefined,
                  backgroundSize: '8px 8px',
                }}
                onClick={() => selected.forEach((s) => updateElement(s.id, { backgroundColor: color }))}
                aria-label={`Fill color ${color}`}
              />
            ))}
          </div>
        </div>
      )}

      {el.type === 'rectangle' && (
        <div className={styles.section}>
          <label className={styles.label}>Corners</label>
          <div className={styles.corners}>
            <button
              className={`${styles.cornerButton} ${!el.roundness ? styles.active : ''}`}
              onClick={() => updateElement(el.id, { roundness: 0 })}
            >
              □ Sharp
            </button>
            <button
              className={`${styles.cornerButton} ${el.roundness ? styles.active : ''}`}
              onClick={() => updateElement(el.id, { roundness: 12 })}
            >
              ▢ Rounded
            </button>
          </div>
        </div>
      )}

      <div className={styles.section}>
        <label className={styles.label}>Layer</label>
        <div className={styles.layerButtons}>
          <button className={styles.layerButton} aria-label="Bring forward">
            <ArrowUp size={14} /> Forward
          </button>
          <button className={styles.layerButton} aria-label="Send backward">
            <ArrowDown size={14} /> Back
          </button>
        </div>
      </div>
    </aside>
  );
}
