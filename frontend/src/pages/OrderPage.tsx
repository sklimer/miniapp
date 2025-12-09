import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useTelegram } from '@telegram-apps/sdk-react';

import { orderAPI, deliveryAPI, bonusAPI } from '../services/api';
import useCart from '../hooks/useCart';
import { CreateOrderRequest } from '../types';
import '../App.css';

const OrderPage: React.FC = () => {
  const { theme, webApp } = useTelegram();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    building: '',
    apartment: '',
    entrance: '',
    floor: '',
    intercom: '',
    coordinates: { lat: 0, lon: 0 }
  });
  const [paymentMethod, setPaymentMethod] = useState<'yookassa' | 'cash'>('yookassa');
  const [notes, setNotes] = useState('');
  const [useBonus, setUseBonus] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(0);
  
  // Get user's saved addresses
  const { data: addressesData } = useQuery(
    'deliveryAddresses',
    () => deliveryAPI.getAddresses().then(res => res.data),
    { enabled: orderType === 'delivery' }
  );
  
  // Get user's bonus information
  const { data: bonusData } = useQuery(
    'bonuses',
    () => bonusAPI.getBonuses().then(res => res.data),
    { enabled: cart.items.length > 0 }
  );

  // Calculate delivery cost
  const { data: deliveryCostData } = useQuery(
    ['deliveryCost', deliveryAddress.coordinates],
    () => deliveryAPI.calculateDelivery({
      coordinates: deliveryAddress.coordinates,
      order_value: cart.total
    }).then(res => res.data),
    { 
      enabled: orderType === 'delivery' && 
               deliveryAddress.coordinates.lat !== 0 && 
               deliveryAddress.coordinates.lon !== 0 
    }
  );

  const createOrderMutation = useMutation(
    (orderData: CreateOrderRequest) => orderAPI.createOrder(orderData).then(res => res.data),
    {
      onSuccess: (data) => {
        clearCart();
        if (webApp) {
          webApp.showAlert('Order placed successfully!');
        }
        navigate('/profile');
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.message || 'Failed to place order';
        if (webApp) {
          webApp.showAlert(`Error: ${errorMessage}`);
        } else {
          alert(`Error: ${errorMessage}`);
        }
      }
    }
  );

  const handlePlaceOrder = () => {
    if (cart.items.length === 0) {
      if (webApp) {
        webApp.showAlert('Your cart is empty!');
      }
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.street) {
      if (webApp) {
        webApp.showAlert('Please enter delivery address');
      }
      return;
    }

    const orderData: CreateOrderRequest = {
      order_type: orderType,
      items: cart.items.map(item => ({
        menu_item_id: item.menu_item_id,
        variation_id: item.variation_name ? undefined : undefined, // This would need to be updated with actual variation ID
        quantity: item.quantity,
        notes: item.notes
      })),
      notes,
      payment_method: paymentMethod
    };

    if (orderType === 'delivery') {
      orderData.delivery_address = {
        street: deliveryAddress.street,
        building: deliveryAddress.building,
        apartment: deliveryAddress.apartment,
        entrance: deliveryAddress.entrance,
        floor: deliveryAddress.floor,
        intercom: deliveryAddress.intercom,
        coordinates: deliveryAddress.coordinates
      };
    }

    if (useBonus && bonusAmount > 0) {
      orderData.bonus_to_use = bonusAmount;
    }

    createOrderMutation.mutate(orderData);
  };

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <div className="header">
          <h1 className="header-title">Order</h1>
        </div>
        <div className="loading">
          <p>Your cart is empty</p>
          <button 
            className="button button-primary"
            onClick={() => navigate('/menu')}
            style={{ marginTop: '16px' }}
          >
            Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="header-title">Order Summary</h1>
      </div>

      {/* Order Type Selection */}
      <div className="form-group">
        <label className="form-label">Order Type</label>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            className={`button ${orderType === 'delivery' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setOrderType('delivery')}
            style={{ flex: 1 }}
          >
            Delivery
          </button>
          <button
            className={`button ${orderType === 'pickup' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setOrderType('pickup')}
            style={{ flex: 1 }}
          >
            Pickup
          </button>
        </div>
      </div>

      {/* Delivery Address */}
      {orderType === 'delivery' && (
        <div>
          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <select 
              className="form-select"
              onChange={(e) => {
                const address = addressesData?.data?.find((addr: any) => addr.id === parseInt(e.target.value));
                if (address) {
                  setDeliveryAddress({
                    street: address.address,
                    building: '',
                    apartment: address.apartment || '',
                    entrance: address.entrance || '',
                    floor: address.floor || '',
                    intercom: address.intercom || '',
                    coordinates: address.coordinates
                  });
                }
              }}
            >
              <option value="">Select saved address or enter new one</option>
              {addressesData?.data?.map((address: any) => (
                <option key={address.id} value={address.id}>
                  {address.name}: {address.address}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Street</label>
            <input
              type="text"
              className="form-input"
              value={deliveryAddress.street}
              onChange={(e) => setDeliveryAddress({...deliveryAddress, street: e.target.value})}
              placeholder="Street address"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Building</label>
              <input
                type="text"
                className="form-input"
                value={deliveryAddress.building}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, building: e.target.value})}
                placeholder="Building number"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Apartment</label>
              <input
                type="text"
                className="form-input"
                value={deliveryAddress.apartment}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, apartment: e.target.value})}
                placeholder="Apartment"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Entrance</label>
              <input
                type="text"
                className="form-input"
                value={deliveryAddress.entrance}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, entrance: e.target.value})}
                placeholder="Entrance"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Floor</label>
              <input
                type="text"
                className="form-input"
                value={deliveryAddress.floor}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, floor: e.target.value})}
                placeholder="Floor"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Intercom</label>
              <input
                type="text"
                className="form-input"
                value={deliveryAddress.intercom}
                onChange={(e) => setDeliveryAddress({...deliveryAddress, intercom: e.target.value})}
                placeholder="Intercom code"
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="form-group">
        <label className="form-label">Payment Method</label>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            className={`button ${paymentMethod === 'yookassa' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setPaymentMethod('yookassa')}
            style={{ flex: 1 }}
          >
            Online (YooKassa)
          </button>
          <button
            className={`button ${paymentMethod === 'cash' ? 'button-primary' : 'button-secondary'}`}
            onClick={() => setPaymentMethod('cash')}
            style={{ flex: 1 }}
          >
            Cash on Delivery
          </button>
        </div>
      </div>

      {/* Bonus Usage */}
      {bonusData && bonusData.available_bonus_points > 0 && (
        <div className="form-group">
          <label className="form-label">
            <input
              type="checkbox"
              checked={useBonus}
              onChange={(e) => setUseBonus(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Use Bonus Points ({bonusData.available_bonus_points} available)
          </label>
          {useBonus && (
            <div style={{ marginTop: '8px' }}>
              <label className="form-label">Bonus Amount to Use</label>
              <input
                type="number"
                className="form-input"
                min="0"
                max={Math.min(bonusData.available_bonus_points, cart.total)}
                value={bonusAmount}
                onChange={(e) => setBonusAmount(Math.min(parseInt(e.target.value) || 0, Math.min(bonusData.available_bonus_points, cart.total)))}
                placeholder={`Max: ${Math.min(bonusData.available_bonus_points, cart.total)}`}
              />
            </div>
          )}
        </div>
      )}

      {/* Order Notes */}
      <div className="form-group">
        <label className="form-label">Order Notes</label>
        <textarea
          className="form-input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions..."
          rows={3}
        />
      </div>

      {/* Order Summary */}
      <div className="order-summary">
        <h3>Order Summary</h3>
        {cart.items.map((item, index) => (
          <div key={index} className="order-item">
            <span>
              {item.quantity}x {item.menu_item_name}
              {item.variation_name && ` (${item.variation_name})`}
            </span>
            <span>{item.total_price.toFixed(2)} RUB</span>
          </div>
        ))}
        
        {orderType === 'delivery' && deliveryCostData && (
          <div className="order-item">
            <span>Delivery</span>
            <span>{deliveryCostData.data.delivery_cost.toFixed(2)} RUB</span>
          </div>
        )}
        
        {useBonus && bonusAmount > 0 && (
          <div className="order-item">
            <span>Bonus Discount</span>
            <span>-{bonusAmount.toFixed(2)} RUB</span>
          </div>
        )}
        
        <div className="order-item" style={{ borderTop: '1px solid var(--secondary-color)', paddingTop: '8px', marginTop: '8px' }}>
          <strong>Total</strong>
          <strong>
            {(
              cart.total + 
              (orderType === 'delivery' && deliveryCostData ? deliveryCostData.data.delivery_cost : 0) - 
              (useBonus ? bonusAmount : 0)
            ).toFixed(2)} RUB
          </strong>
        </div>
      </div>

      <button
        className="checkout-btn"
        onClick={handlePlaceOrder}
        disabled={createOrderMutation.isLoading}
      >
        {createOrderMutation.isLoading ? 'Processing...' : `Place Order - ${(cart.total + (orderType === 'delivery' && deliveryCostData ? deliveryCostData.data.delivery_cost : 0) - (useBonus ? bonusAmount : 0)).toFixed(2)} RUB`}
      </button>
    </div>
  );
};

export default OrderPage;