import { Spinner } from 'components/ui/spinner';

export default function FeedbacksAllLoadingOverlay() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-(--bg-primary)/40 backdrop-blur-[2px] transition-all">
      <div className="flex items-center gap-3 rounded-2xl border border-(--quaternary-color)/14 bg-(--bg-secondary)/95 px-6 py-4 shadow-xl backdrop-blur-md">
        <Spinner size={18} />
        <span className="font-work-sans text-sm font-medium text-(--text-primary)">
          Carregando feedbacks...
        </span>
      </div>
    </div>
  );
}
