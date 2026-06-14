import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Calendar } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="loader-container">
        <div className="loader"></div>
      </div>
    );
  }

  // Format date if available, otherwise just show a placeholder or handle gracefully
  const joinDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Recently';

  return (
    <div className="profile-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 className="section-title"><span className="gradient-text">My Profile</span></h1>
        <p className="section-subtitle">Manage your account details and preferences.</p>
      </div>

      <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Profile Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '30px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 'bold', color: 'white'
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', margin: '0 0 5px 0' }}>{user.name}</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                {user.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
          <div className="info-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '5px' }}>
              <User size={16} />
              <span style={{ fontSize: '0.9rem' }}>Full Name</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.name}</div>
          </div>

          <div className="info-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '5px' }}>
              <Mail size={16} />
              <span style={{ fontSize: '0.9rem' }}>Email Address</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{user.email}</div>
          </div>

          <div className="info-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '5px' }}>
              <Shield size={16} />
              <span style={{ fontSize: '0.9rem' }}>Account Role</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '500', textTransform: 'capitalize' }}>{user.role}</div>
          </div>

          <div className="info-group" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', marginBottom: '5px' }}>
              <Calendar size={16} />
              <span style={{ fontSize: '0.9rem' }}>Joined On</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: '500' }}>{joinDate}</div>
          </div>

        </div>

      </div>
    </div>
  );
};
