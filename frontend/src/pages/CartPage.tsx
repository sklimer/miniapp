import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTelegram } from '@telegram-apps/sdk-react';

import useCart from '../hooks/useCart';
import '../App.css';

const CartPage: React.FC = () => {
  const { theme, webApp } = useTelegram();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cart.items.length === 0) {
      if (webApp) {
        webApp.showAlert('Your cart is empty!');
        return;
      }
    }
    navigate('/order');
  };

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <div className="header">
          <h1 className="header-title">Your Cart</h1>
        </div>
        <div className="loading">
          <p>Your cart is empty</p>
          <Link to="/menu" className="button button-primary" style={{ marginTop: '16px' }}>
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="header-title">Your Cart</h1>
      </div>

      <div>
        {cart.items.map(item => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-details">
              <h3 className="cart-item-name">
                {item.menu_item_name}
                {item.variation_name && ` (${item.variation_name})`}
              </h3>
              <p className="cart-item-price">{item.unit_price.toFixed(2)} RUB</p>
            </div>
            
            <div className="cart-controls">
              <button 
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span className="quantity-display">{item.quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
              <button 
                className="button button-secondary"
                onClick={() => removeFromCart(item.id)}
                style={{ marginLeft: '8px' }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="cart-total">
          <span>Total:</span>
          <span>{cart.total.toFixed(2)} RUB</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="button button-secondary"
            onClick={clearCart}
            style={{ flex: 1 }}
          >
            Clear Cart
          </button>
          <button 
            className="button button-primary"
            onClick={handleCheckout}
            style={{ flex: 1 }}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;