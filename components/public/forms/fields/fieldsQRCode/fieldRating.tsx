import type { FieldRatingProps } from './ui.types';

export default function FieldRating({ rating, onRatingChange }: FieldRatingProps) {
  const ratingLabels = {
    1: 'Muito insatisfeito',
    2: 'Insatisfeito',
    3: 'Neutro',
    4: 'Satisfeito',
    5: 'Muito satisfeito',
  };

  return (
    <section className="rounded-[18px] border border-(--quaternary-color)/15 bg-(--bg-secondary) p-4 sm:p-[18px]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-work-sans text-[15px] font-bold text-(--text-primary)">Qual sua nota geral?</h2>
          <p className="mt-0.5 text-xs text-(--text-tertiary)">Toque em uma estrela</p>
        </div>
        <span className="rounded-full bg-(--primary-color)/12 px-2 py-1 text-[10px] font-semibold text-(--primary-color)">Obrigatório</span>
      </div>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2" role="radiogroup" aria-label="Nota geral">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={rating === star}
            aria-label={`${star} estrela${star > 1 ? 's' : ''}: ${ratingLabels[star as keyof typeof ratingLabels]}`}
            onClick={() => onRatingChange(star)}
            className={`flex min-h-[52px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-color) ${
              star === rating
                ? 'border-(--primary-color) bg-(--primary-color)/15 text-(--primary-color) shadow-[0_0_0_1px_var(--primary-color)]'
                : 'border-(--quaternary-color)/18 bg-(--bg-tertiary) text-(--text-tertiary) hover:border-(--primary-color)/45 hover:bg-(--primary-color)/8 hover:text-(--primary-color)'
            }`}>
            <svg
              className="h-5 w-5"
              fill={star <= rating ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[10px] font-semibold">{star}</span>
          </button>
        ))}
      </div>
      {rating > 0 && (
        <p className="mt-3 text-center text-xs font-medium text-(--primary-color)" aria-live="polite">
          {ratingLabels[rating as keyof typeof ratingLabels]}
        </p>
      )}
    </section>
  );
}
