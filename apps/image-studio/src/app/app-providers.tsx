import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useEffect, useState } from 'react';

import { useThemeStore } from '../features/theme/theme-store';

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

function ThemeSynchronizer({ children }: PropsWithChildren): React.ReactElement {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return <>{children}</>;
}

export function AppProviders({ children }: PropsWithChildren): React.ReactElement {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeSynchronizer>{children}</ThemeSynchronizer>
    </QueryClientProvider>
  );
}
