import { FaCheck, FaTriangleExclamation } from "react-icons/fa6";
import type { SetupOrbProps } from "./ui.types";

/**
 * Núcleo 3D com três anéis em órbita (CSS em styles/user/onboarding.css).
 * Gira enquanto a configuração roda, recolhe os anéis ao concluir e para na falha.
 */
export default function SetupOrb({ status }: SetupOrbProps) {
  return (
    <div className="setup-orb" data-state={status} data-testid="setup-orb" aria-hidden>
      <div className="setup-orb__float">
        <div className="setup-orb__tilt"><div className="setup-orb__ring" /></div>
        <div className="setup-orb__tilt"><div className="setup-orb__ring" /></div>
        <div className="setup-orb__tilt"><div className="setup-orb__ring" /></div>
        <div className="setup-orb__core">
          <span className="setup-orb__icon">
            {status === "failed" ? <FaTriangleExclamation /> : <FaCheck />}
          </span>
        </div>
      </div>
    </div>
  );
}
