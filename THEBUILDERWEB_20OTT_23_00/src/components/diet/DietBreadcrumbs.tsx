import { Link } from "react-router-dom";

type Props = { current?: string };

export function DietBreadcrumbs({ current }: Props) {
  return (
    <nav aria-label="breadcrumb" className="text-sm mb-4">
      <ol className="flex items-center gap-2 text-muted-foreground">
        <li>
          <Link to="/" className="hover:underline">Home</Link>
        </li>
        <li className="flex items-center gap-2">
          <span>/</span>
          {current ? (
            <Link to="/dieta" className="hover:underline">Gestionale Diete</Link>
          ) : (
            <span className="text-foreground">Gestionale Diete</span>
          )}
        </li>
        {current && (
          <li className="flex items-center gap-2">
            <span>/</span>
            <span className="text-foreground">{current}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}