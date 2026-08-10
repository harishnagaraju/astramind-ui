import { Image, MoonStar } from 'lucide-react';
import { NavLink, Outlet } from 'react-router';

import { IconButton } from '../ui/icon-button';
import { useThemeStore } from '../../features/theme/theme-store';

export function AppShell(): React.ReactElement {
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Application navigation">
        <div className="brand" aria-label="AstraMind">
          <div className="brand-mark" aria-hidden="true">
            <Image size={18} strokeWidth={2.2} />
          </div>
          <span className="brand-name">AstraMind</span>
        </div>

        <nav className="primary-navigation" aria-label="Studio navigation">
          <NavLink className="navigation-link" to="/" end>
            <Image size={18} aria-hidden="true" />
            <span>Image Studio</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <span className="connection-indicator" aria-hidden="true" />
          <span>Provider ready</span>
        </div>
      </aside>

      <div className="app-content">
        <header className="app-header">
          <div className="breadcrumb" aria-label="Current location">
            <span>Studios</span>
            <span className="breadcrumb-separator">/</span>
            <strong>Image</strong>
          </div>
          <div className="header-actions">
            <IconButton label="Toggle color theme" onClick={toggleTheme}>
              <MoonStar size={18} aria-hidden="true" />
            </IconButton>
          </div>
        </header>
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
