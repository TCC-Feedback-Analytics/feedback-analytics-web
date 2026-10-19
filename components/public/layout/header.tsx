import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <nav className="flex items-center justify-between gap-3 border-b border-(--bg-tertiary) bg-[var(--bg-secondary)] p-4 shadow-md sm:p-5">
      <div className="min-w-0">
        <Link to="/">
          <h1 className="font-montserrat text-lg leading-tight font-semibold text-(--text-primary) sm:text-2xl">
            Feedback Analytics
          </h1>
        </Link>
      </div>
      <div>
        <ul className="flex shrink-0 flex-row items-center gap-2 sm:gap-5">
          <li>
            <Link
              to="/register"
              className="font-poppins whitespace-nowrap rounded-lg border border-(--secondary-color) px-3 py-2 text-sm font-medium text-(--text-primary) transition-colors hover:bg-(--secondary-color)/12 sm:px-6 md:px-10">
              Registrar
            </Link>
          </li>
          <li>
            <Link
              to="/login"
              className="font-poppins whitespace-nowrap rounded-lg bg-(--secondary-color) px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 sm:px-6 md:px-10">
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
