// API configuration
export const apiEndpoint = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Authentication configuration
export const authConfig = {
  tokenKey: 'tc_auth_token',
  refreshTokenKey: 'tc_refresh_token',
  tokenExpiryKey: 'tc_token_expiry'
};

// Feature flags
export const features = {
  enableNotifications: true,
  enableRealTimeChat: true,
  enableLocationServices: true,
  enableProfileVerification: true
};

// App settings
export const appSettings = {
  defaultProfileImage: '/images/default-profile.png',
  maxUploadSizeMB: 5,
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp']
};

// Social configuration
export const social = {
  shareUrl: 'https://trueconnect.example.com/share',
  appStoreUrl: '#',
  playStoreUrl: '#',
  facebookUrl: '#',
  twitterUrl: '#',
  instagramUrl: '#'
};
