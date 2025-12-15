import { useState, useEffect } from 'react';
import { CartItem, CartState } from '../types';

const useCart = () => {
  const [cart, setCart] = useState<CartState>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.items.findIndex(
        cartItem => 
          cartItem.menu_item_id === item.menu_item_id && 
          cartItem.variation_name === item.variation_name
      );

      let updatedItems = [...prevCart.items];
      
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
          total_price: updatedItems[existingItemIndex].total_price + item.total_price
        };
      } else {
        // Add new item with unique ID
        const newItem = {
          ...item,
          id: Date.now() // Simple ID generation
        };
        updatedItems = [...updatedItems, newItem];
      }

      const newTotal = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
      
      return {
        items: updatedItems,
        total: parseFloat(newTotal.toFixed(2))
      };
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item => {
        if (item.id === id) {
          const newTotalPrice = item.unit_price * quantity;
          return {
            ...item,
            quantity,
            total_price: parseFloat(newTotalPrice.toFixed(2))
          };
        }
        return item;
      });

      const newTotal = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
      
      return {
        items: updatedItems,
        total: parseFloat(newTotal.toFixed(2))
      };
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.id !== id);
      const newTotal = updatedItems.reduce((sum, item) => sum + item.total_price, 0);
      
      return {
        items: updatedItems,
        total: parseFloat(newTotal.toFixed(2))
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };

  const isInCart = (menuItemId: number, variationName?: string) => {
    return cart.items.some(item => 
      item.menu_item_id === menuItemId && 
      item.variation_name === variationName
    );
  };

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    isInCart
  };
};

export default useCart;