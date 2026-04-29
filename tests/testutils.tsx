import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router'
import { rootReducer, store } from '../src/store';
import { configureStore } from "@reduxjs/toolkit";
import type { RootState } from "../src/store";

const Wrapper = ({ children }: { children: ReactNode }) => (
  <HelmetProvider>
    <MemoryRouter>
      <Provider store={store}>{children}</Provider>
    </MemoryRouter>
  </HelmetProvider>
);

function customRender(ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: Wrapper, ...options });
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { customRender as render };

type ExtendedRenderOptions = {
  preloadedState?: Partial<RootState>;
};

// Fresh Redux store per test with optional preloaded state
export function renderWithStore(
  ui: React.ReactElement,
  { preloadedState }: ExtendedRenderOptions = {}
) {
  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
  });

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <HelmetProvider>
      <MemoryRouter>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    </HelmetProvider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper }),
  };
}
