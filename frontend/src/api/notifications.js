import api from './axios';

// Utility functions to hit backend email endpoints
export const sendTestEmail = (payload) => api.post('/api/email/test', payload);

export const sendOrderConfirmation = (payload) => api.post('/api/email/order-confirmation', payload);

export const sendPasswordReset = (payload) => api.post('/api/email/password-reset', payload);

export const sendContactReply = (payload) => api.post('/api/email/contact-reply', payload);

export const sendNewsletterWelcome = (payload) => api.post('/api/email/newsletter-welcome', payload);

export const sendOrderStatusUpdate = (payload) => api.post('/api/email/order-status', payload);

export const sendAccountWelcome = (payload) => api.post('/api/email/account-welcome', payload);

export default {
  sendTestEmail,
  sendAccountWelcome,
  sendOrderConfirmation,
  sendPasswordReset,
  sendContactReply,
  sendNewsletterWelcome,
  sendOrderStatusUpdate,
};
