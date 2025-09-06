import dayjs from 'dayjs';

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (date) => {
  return dayjs(date).format('MMM DD, YYYY');
};

export const formatDateTime = (date) => {
  return dayjs(date).format('MMM DD, YYYY HH:mm');
};