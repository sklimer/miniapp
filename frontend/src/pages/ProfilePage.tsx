import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { useTelegram } from '@telegram-apps/sdk-react';

import { authAPI, orderAPI, bonusAPI } from '../services/api';
import { User, Order } from '../types';
import '../App.css';

interface ProfilePageProps {
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { user: telegramUser, theme, webApp } = useTelegram();
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'bonuses'>('profile');
  
  const { data: profileData, isLoading: profileLoading, refetch: refetchProfile } = useQuery(
    'profile',
    () => authAPI.getUserProfile().then(res => res.data),
    {
      onSuccess: (data) => {
        // Update any local state if needed
      }
    }
  );
  
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    'orders',
    () => orderAPI.getOrders().then(res => res.data),
    { enabled: activeTab === 'orders' }
  );
  
  const { data: bonusesData, isLoading: bonusesLoading } = useQuery(
    'bonuses',
    () => bonusAPI.getBonuses().then(res => res.data),
    { enabled: activeTab === 'bonuses' }
  );

  const handleLogout = () => {
    if (webApp) {
      webApp.showConfirm('Are you sure you want to logout?', (confirmed) => {
        if (confirmed) {
          onLogout();
        }
      });
    } else {
      onLogout();
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (profileLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  const profile = profileData?.data as User;

  return (
    <div className="container">
      <div className="header">
        <h1 className="header-title">Profile</h1>
        <button 
          className="button button-secondary"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', marginBottom: '16px' }}>
        <button
          className={`button ${activeTab === 'profile' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setActiveTab('profile')}
          style={{ flex: 1, borderRadius: '8px 0 0 8px' }}
        >
          Profile
        </button>
        <button
          className={`button ${activeTab === 'orders' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setActiveTab('orders')}
          style={{ flex: 1 }}
        >
          Orders
        </button>
        <button
          className={`button ${activeTab === 'bonuses' ? 'button-primary' : 'button-secondary'}`}
          onClick={() => setActiveTab('bonuses')}
          style={{ flex: 1, borderRadius: '0 8px 8px 0' }}
        >
          Bonuses
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div>
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '50%', 
              backgroundColor: 'var(--secondary-color)', 
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              {profile?.first_name?.charAt(0) || telegramUser?.firstName?.charAt(0) || 'U'}
            </div>
            <h2 style={{ margin: '8px 0' }}>
              {profile?.first_name} {profile?.last_name}
            </h2>
            <p style={{ color: 'var(--primary-color)', fontSize: '1.2rem', margin: '8px 0' }}>
              Bonus Points: {profile?.bonus_points || 0}
            </p>
            <p style={{ margin: '4px 0' }}>
              Total Spent: {(profile?.total_spent || 0).toFixed(2)} RUB
            </p>
            <p style={{ margin: '4px 0' }}>
              Orders: {profile?.orders_count || 0}
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">First Name</label>
            <input
              type="text"
              className="form-input"
              value={profile?.first_name || ''}
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              type="text"
              className="form-input"
              value={profile?.last_name || ''}
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              value={profile?.phone_number || ''}
              disabled
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={profile?.email || ''}
              disabled
            />
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          {ordersLoading ? (
            <div className="loading">Loading orders...</div>
          ) : ordersData?.data?.orders?.length === 0 ? (
            <div className="loading">No orders yet</div>
          ) : (
            <div>
              {ordersData?.data?.orders?.map((order: Order) => (
                <div key={order.id} className="menu-item-card" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0' }}>Order #{order.order_number}</h3>
                      <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                        {formatDateTime(order.created_at)} • {order.status}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: '0', fontWeight: 'bold' }}>
                        {order.total_amount.toFixed(2)} RUB
                      </p>
                      <p style={{ margin: '0', fontSize: '0.8rem' }}>
                        {order.order_type}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '8px' }}>
                    {order.items.slice(0, 2).map((item, index) => (
                      <p key={index} style={{ margin: '4px 0', fontSize: '0.9rem' }}>
                        {item.quantity}x {item.menu_item_name}
                        {item.variation_name && ` (${item.variation_name})`}
                      </p>
                    ))}
                    {order.items.length > 2 && (
                      <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#666' }}>
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bonuses Tab */}
      {activeTab === 'bonuses' && (
        <div>
          {bonusesLoading ? (
            <div className="loading">Loading bonuses...</div>
          ) : (
            <div>
              <div className="order-summary" style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h3>Total Bonus Points</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  {bonusesData?.data?.total_bonus_points || 0}
                </p>
                <p style={{ margin: '4px 0' }}>
                  Available: {bonusesData?.data?.available_bonus_points || 0}
                </p>
                <p style={{ margin: '4px 0' }}>
                  Pending: {bonusesData?.data?.pending_bonus_points || 0}
                </p>
              </div>

              <h3>Recent Bonuses</h3>
              {bonusesData?.data?.bonuses?.length === 0 ? (
                <div className="loading">No bonuses yet</div>
              ) : (
                <div>
                  {bonusesData?.data?.bonuses?.map((bonus: any) => (
                    <div key={bonus.id} className="menu-item-card" style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: '0 0 4px 0' }}>{bonus.description}</h4>
                          <p style={{ margin: '0', fontSize: '0.9rem', color: '#666' }}>
                            {formatDateTime(bonus.created_at)} • Type: {bonus.type}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: '0', fontWeight: 'bold', color: bonus.is_used ? '#999' : 'var(--primary-color)' }}>
                            {bonus.is_used ? 'USED' : `+${bonus.amount}`}
                          </p>
                          {bonus.expires_at && !bonus.is_used && (
                            <p style={{ margin: '0', fontSize: '0.8rem' }}>
                              Exp: {new Date(bonus.expires_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;