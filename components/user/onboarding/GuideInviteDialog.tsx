import { FaCompass } from "react-icons/fa6";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "components/ui/dialog";
import type { GuideInviteDialogProps } from "./ui.types";

const TEXTS = {
  "first-feedback": {
    title: "Seu primeiro feedback chegou! 🎉",
    description: "Quer conhecer o sistema em 2 minutos? O guia mostra onde ficam as notas, as perguntas e a análise dos comentários.",
  },
  later: {
    title: "Quer conhecer o sistema?",
    description: "Em 2 minutos, o guia mostra o que cada parte do painel faz.",
  },
} as const;

/**
 * Convite para o guia do sistema. O guia não abre sozinho: a pessoa escolhe
 * começar agora ou deixar para depois (o convite volta numa próxima sessão).
 */
export default function GuideInviteDialog({ variant, onStart, onLater }: GuideInviteDialogProps) {
  const texts = variant ? TEXTS[variant] : null;

  return (
    <Dialog open={variant !== null} onOpenChange={(open) => { if (!open) onLater(); }}>
      <DialogContent className="max-w-lg" showClose={false}>
        {texts && (
          <>
            <DialogHeader>
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-(--primary-color)/15 text-(--primary-color)">
                <FaCompass aria-hidden />
              </div>
              <DialogTitle>{texts.title}</DialogTitle>
              <DialogDescription>{texts.description}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <button type="button" onClick={onLater} className="btn-ghost font-poppins px-5 py-2.5 text-sm">
                Depois
              </button>
              <button type="button" onClick={onStart} className="btn-primary font-poppins px-5 text-sm">
                Começar o guia
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
