import { Link } from 'react-router';

export function NotFoundPage(): React.ReactElement {
  return (
    <main className="not-found-page">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The address does not match an available AstraMind studio.</p>
      <Link to="/">Return to Image Studio</Link>
    </main>
  );
}
