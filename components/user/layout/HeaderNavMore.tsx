import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa6";
import type { HeaderNavMoreProps } from "./ui.types";

/**
 * Botão "Mais" do menu do cabeçalho: guarda as páginas que não couberam na
 * largura da tela. Fica destacado quando a página aberta está dentro dele.
 */
export default function HeaderNavMore({ entries }: HeaderNavMoreProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasActive = entries.some((entry) => entry.active);

  // Fecha ao clicar fora e com Esc, como o menu da conta.
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-semibold transition-colors ${
          hasActive
            ? "bg-(--seventh-color) text-(--text-primary)"
            : "text-(--text-secondary) hover:bg-(--seventh-color) hover:text-(--text-primary)"
        }`}
      >
        Mais
        <FaChevronDown aria-hidden className={`h-2.5 w-2.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-50 mt-2 w-60 rounded-lg border border-(--quaternary-color)/12 bg-(--bg-secondary) p-1.5 shadow-lg ring-1 ring-(--quaternary-color)/10"
        >
          {entries.map((entry) => (
            <Link
              key={entry.label}
              to={entry.to}
              role="menuitem"
              data-tour={entry.tourAttr}
              aria-current={entry.active ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                entry.active
                  ? "bg-(--seventh-color) font-semibold text-(--text-primary)"
                  : "text-(--text-secondary) hover:bg-(--seventh-color) hover:text-(--text-primary)"
              }`}
            >
              {entry.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
