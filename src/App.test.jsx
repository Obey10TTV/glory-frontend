import { render, screen } from '@testing-library/react';
import App from './App';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';

test('renders Glory home page', () => {
  render(
    <UserProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </UserProvider>
  );
  expect(screen.getByRole('heading', { name: /glow\. shine\. glory\./i })).toBeInTheDocument();
});
