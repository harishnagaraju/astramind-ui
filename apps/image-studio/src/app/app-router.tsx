import { createBrowserRouter, RouterProvider } from 'react-router';

import { AppShell } from '../components/layout/app-shell';
import { ImageStudioPage } from '../features/image-studio/image-studio-page';
import { NotFoundPage } from '../features/not-found/not-found-page';

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <ImageStudioPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export function AppRouter(): React.ReactElement {
  return <RouterProvider router={router} />;
}
