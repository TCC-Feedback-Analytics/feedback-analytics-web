import type { FieldMessageProps } from './ui.types';


export default function FieldMessage({ message, onMessageChange, label }: FieldMessageProps) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="message"
          className="text-sm font-bold text-(--text-primary)">
          {label}
        </label>
        <span className="text-[11px] text-(--text-tertiary)">Opcional</span>
      </div>
      <textarea
        id="message"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Descreva sua experiência, sugestões ou comentários..."
        rows={4}
        maxLength={5000}
        className="min-h-[116px] w-full resize-none rounded-2xl border border-(--quaternary-color)/18 bg-(--seventh-color) px-4 py-3.5 text-base text-(--text-primary) placeholder-(--text-tertiary) transition-colors focus:border-(--primary-color) focus:outline-none focus:ring-2 focus:ring-(--primary-color)/20 md:text-sm"
      />
      <p className="text-right text-[10px] text-(--text-tertiary)">{message.length} / 5000</p>
    </section>
  );
}
