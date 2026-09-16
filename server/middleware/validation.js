const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phonePattern = /^[+]?[0-9 ()-]{8,20}$/;

const isValidEmail = (email) => typeof email === 'string' && emailPattern.test(email.trim());

const validatePassword = (password) => typeof password === 'string' && password.length >= 8 && password.length <= 128;

const validateBooking = ({ name, phone, address, serviceType, date, language }) => {
  const allowedServices = [
    'RO Service',
    'Washing Machine Repair',
    'AC Service',
    'Refrigerator Repair',
    'Microwave Repair',
  ];
  const parsedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 100
    && typeof phone === 'string' && phonePattern.test(phone.trim())
    && typeof address === 'string' && address.trim().length >= 5 && address.trim().length <= 500
    && allowedServices.includes(serviceType)
    && !Number.isNaN(parsedDate.getTime()) && parsedDate >= today
    && (language === undefined || ['en', 'hi'].includes(language));
};

module.exports = { isValidEmail, validatePassword, validateBooking };