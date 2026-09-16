'use client';

import {createMemoryRouter, RouterProvider} from 'react-router-dom';
import {routes} from './app/routes';

export default function WorkbookApp({leadId}: {leadId: string}) {
  const router = createMemoryRouter(routes, {
    initialEntries: [`/leads/${encodeURIComponent(leadId)}/settings`],
  });
  return <RouterProvider router={router} />;
}
