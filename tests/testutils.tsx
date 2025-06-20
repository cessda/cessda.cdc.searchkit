import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router'
import { store } from '../src/store';

const Wrapper = ({ children }: { children: ReactNode }) => (<HelmetProvider><MemoryRouter><Provider store={store}>{children}</Provider></MemoryRouter></HelmetProvider>);

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Wrapper, ...options });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { customRender as render };
