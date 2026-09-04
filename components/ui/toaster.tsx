import { useToast, dismissToast } from './useToast';
import {
  Toast,
  ToastAction,
  ToastDescription,
  ToastTitle,
  ToastViewport,
} from './toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastViewport>
      {toasts.map(({ id, title, message, description, action, actionLabel, onAction, variant, duration, ...props }) => {
        const displayTitle = title || message;

        return (
          <Toast
            key={id}
            variant={variant}
            duration={duration}
            onClose={() => dismissToast(id)}
            {...props}
          >
            <div className="grid gap-1">
              {displayTitle && <ToastTitle>{displayTitle}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>

            {action || (actionLabel && onAction && (
              <div className="mt-2">
                <ToastAction
                  onClick={() => {
                    onAction();
                    dismissToast(id);
                  }}
                >
                  {actionLabel}
                </ToastAction>
              </div>
            ))}
          </Toast>
        );
      })}
    </ToastViewport>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
