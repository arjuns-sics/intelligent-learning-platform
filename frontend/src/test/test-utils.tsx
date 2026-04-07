import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// All The Providers
function Providers({ children }: { children: ReactNode }) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

function customRender(ui: ReactElement, options?: CustomRenderOptions) {
  const wrapper = options?.wrapper ? options.wrapper : Providers;
  return render(ui, { wrapper, ...options });
}

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
