import { render, screen } from '@testing-library/react';
import { LoginForm } from '@/components/forms/login-form';
import { AppProvider } from '@/providers/app-provider';

describe('LoginForm', () => {
  it('renders fields', () => {
    render(
      <AppProvider>
        <LoginForm />
      </AppProvider>,
    );

    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });
});
