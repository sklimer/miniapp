import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { useTelegram } from '@telegram-apps/sdk-react';

import { menuAPI } from '../services/api';
import { Category, MenuItem } from '../types';
import useCart from '../hooks/useCart';
import '../App.css';

const MenuPage: React.FC = () => {
  const { theme, webApp } = useTelegram();
  const { cart, addToCart, isInCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  const { data: menuData, isLoading, error } = useQuery(
    ['menu', selectedCategory],
    () => menuAPI.getMenuItems({ 
      category_id: selectedCategory || undefined,
      is_available: true 
    }).then(res => res.data)
  );

  const { data: categoriesData } = useQuery(
    'categories',
    () => menuAPI.getCategories().then(res => res.data)
  );

  const handleAddToCart = (item: MenuItem, variationId?: number) => {
    const variation = variationId 
      ? item.variations.find(v => v.id === variationId)
      : null;
    
    const unitPrice = variation 
      ? item.price + variation.price_difference
      : item.price;
    
    const cartItem = {
      menu_item_id: item.id,
      menu_item_name: item.name,
      variation_name: variation?.name,
      quantity: 1,
      unit_price: unitPrice,
      total_price: unitPrice,
      notes: ''
    };

    addToCart(cartItem);
    
    // Show a toast or notification
    if (webApp) {
      webApp.showAlert(`Added ${item.name} to cart!`);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading menu...</div>;
  }

  if (error) {
    return <div className="error">Error loading menu. Please try again later.</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="header-title">Menu</h1>
        <Link to="/cart" className="nav-link">
          Cart ({cart.items.length})
        </Link>
      </div>

      {/* Categories */}
      <div className="category-grid">
        {categoriesData?.data?.map((category: Category) => (
          <div 
            key={category.id} 
            className={`menu-item-card ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(
              selectedCategory === category.id ? null : category.id
            )}
            style={{ 
              cursor: 'pointer',
              border: selectedCategory === category.id ? '2px solid var(--primary-color)' : 'none'
            }}
          >
            <div className="menu-item-info">
              <h3 className="menu-item-name">{category.name}</h3>
              <p className="menu-item-description">
                {category.item_count} items
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Menu Items */}
      <div className="menu-grid">
        {menuData?.data?.categories?.flatMap((category: Category) => 
          category.items?.map((item: MenuItem) => (
            <div key={item.id} className="menu-item-card">
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.name} 
                  className="menu-item-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              <div className="menu-item-info">
                <h3 className="menu-item-name">{item.name}</h3>
                <p className="menu-item-description">
                  {item.description}
                </p>
                <p className="menu-item-price">
                  {item.price.toFixed(2)} RUB
                  {item.preparation_time && ` • ${item.preparation_time} min`}
                </p>
                
                {/* Variations */}
                {item.variations && item.variations.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    {item.variations.map(variation => (
                      <div key={variation.id} style={{ marginBottom: '4px' }}>
                        <button
                          className="button button-secondary"
                          style={{ 
                            width: '100%', 
                            marginBottom: '4px',
                            fontSize: '0.8rem'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(item, variation.id);
                          }}
                          disabled={!variation.is_available}
                        >
                          {variation.name} (+{variation.price_difference.toFixed(2)} RUB)
                          {!variation.is_available && ' (Not available)'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Add to cart button for base item */}
                {!item.variations || item.variations.length === 0 ? (
                  <button
                    className={`button ${isInCart(item.id) ? 'button-secondary' : 'button-primary'}`}
                    style={{ width: '100%', marginTop: '8px' }}
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.is_available || item.is_on_stop_list}
                  >
                    {isInCart(item.id) ? 'In Cart' : 'Add to Cart'}
                    {!item.is_available && !item.is_on_stop_list && ' (Not available)'}
                    {item.is_on_stop_list && ' (Out of stock)'}
                  </button>
                ) : (
                  <button
                    className={`button ${isInCart(item.id) ? 'button-secondary' : 'button-primary'}`}
                    style={{ width: '100%', marginTop: '8px' }}
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.is_available || item.is_on_stop_list}
                  >
                    {isInCart(item.id) ? 'In Cart' : 'Add Base Item'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MenuPage;