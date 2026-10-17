import { useEffect, useRef, useState } from 'react';
import { FaCalendarDays, FaCheck, FaChevronDown } from 'react-icons/fa6';
import {
  METRICS_PERIOD_OPTIONS,
  hasMetricsPeriod,
  isValidCustomPeriod,
  periodText,
  toLocalDateInput,
  type MetricsPeriodPreset,
} from 'src/lib/utils/metricsPeriod';
import type { PeriodSelectorDropdownProps } from './ui.types';

/**
 * Seletor de período das métricas (etapa 02), ao lado do escopo. As janelas são
 * móveis e incluem hoje; "Personalizado" pede as duas datas e só aplica quando o
 * início não passa do fim.
 */
export function PeriodSelectorDropdown({ value, onChange }: PeriodSelectorDropdownProps) {
  const [open, setOpen] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [from, setFrom] = useState(value.from ?? '');
  const [to, setTo] = useState(value.to ?? '');
  const containerRef = useRef<HTMLDivElement>(null);

  const today = toLocalDateInput(new Date());
  const active = hasMetricsPeriod(value);
  const selectedPreset: MetricsPeriodPreset = active ? value.preset : 'ALL';
  const customValid = isValidCustomPeriod(from, to);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const toggle = () => {
    setOpen((prev) => !prev);
    setCustomOpen(selectedPreset === 'CUSTOM');
  };

  const handleSelect = (preset: MetricsPeriodPreset) => {
    if (preset === 'CUSTOM') {
      setCustomOpen(true);
      return;
    }
    if (preset !== selectedPreset) onChange({ preset });
    setCustomOpen(false);
    setOpen(false);
  };

  const applyCustom = () => {
    if (!customValid) return;
    if (!(value.preset === 'CUSTOM' && value.from === from && value.to === to)) {
      onChange({ preset: 'CUSTOM', from, to });
    }
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`inline-flex h-9 items-center gap-2 rounded-lg border bg-(--bg-secondary) px-3 py-1.5 text-xs font-medium text-(--text-primary) shadow-sm backdrop-blur-md transition-all duration-200 hover:border-(--quaternary-color)/35 hover:bg-(--seventh-color) focus:border-(--primary-color) focus:ring-2 focus:ring-(--primary-color)/20 focus:outline-none ${
          active ? 'border-(--primary-color)/45' : 'border-(--quaternary-color)/18'
        }`}
      >
        <FaCalendarDays className="h-3 w-3 shrink-0 text-(--primary-color)" aria-hidden />
        <span className="font-poppins font-medium flex items-center gap-1">
          <span className="hidden sm:inline text-(--text-tertiary)">Período:</span>
          <span className="truncate max-w-[170px] sm:max-w-[220px]">{periodText(value).label}</span>
        </span>
        <FaChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-(--text-tertiary) transition-transform duration-200 ${
            open ? 'rotate-180 text-(--primary-color)' : 'rotate-0'
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-60 origin-top-left rounded-xl border border-(--quaternary-color)/16 bg-(--bg-secondary) p-1.5 shadow-xl backdrop-blur-md animate-in fade-in-50 zoom-in-95">
          <div className="px-2.5 py-1 text-[10px] font-semibold tracking-wider text-(--text-tertiary) uppercase">
            Período das métricas
          </div>
          <div role="listbox" aria-label="Selecionar período" className="mt-1 space-y-0.5">
            {METRICS_PERIOD_OPTIONS.map(({ preset, label }) => {
              const isSelected = preset === 'CUSTOM' ? customOpen || selectedPreset === 'CUSTOM' : !customOpen && preset === selectedPreset;
              return (
                <button
                  key={preset}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(preset)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-(--seventh-color) text-(--text-primary) font-medium'
                      : 'text-(--text-secondary) hover:bg-(--seventh-color)/60 hover:text-(--text-primary)'
                  }`}
                >
                  <span className="font-poppins">{label}</span>
                  {isSelected && <FaCheck className="h-3.5 w-3.5 shrink-0 text-(--primary-color) ml-2" />}
                </button>
              );
            })}
          </div>

          {customOpen && (
            <div className="mt-2 space-y-2 border-t border-(--quaternary-color)/12 px-2.5 pt-2.5 pb-1">
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1 text-[11px] text-(--text-tertiary)">
                  <span>De</span>
                  <input
                    type="date"
                    value={from}
                    max={to || today}
                    onChange={(event) => setFrom(event.target.value)}
                    className="w-full rounded-md border border-(--quaternary-color)/18 bg-(--bg-primary) px-2 py-1 text-xs text-(--text-primary) focus:border-(--primary-color) focus:outline-none"
                  />
                </label>
                <label className="space-y-1 text-[11px] text-(--text-tertiary)">
                  <span>Até</span>
                  <input
                    type="date"
                    value={to}
                    min={from || undefined}
                    max={today}
                    onChange={(event) => setTo(event.target.value)}
                    className="w-full rounded-md border border-(--quaternary-color)/18 bg-(--bg-primary) px-2 py-1 text-xs text-(--text-primary) focus:border-(--primary-color) focus:outline-none"
                  />
                </label>
              </div>
              {from && to && !customValid && (
                <p className="text-[11px] text-(--negative)">A data inicial precisa ser antes da final.</p>
              )}
              <button
                type="button"
                onClick={applyCustom}
                disabled={!customValid}
                className="btn-primary w-full px-3 py-1.5 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              >
                Aplicar período
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
