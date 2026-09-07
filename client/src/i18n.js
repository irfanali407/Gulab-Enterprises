import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const savedLanguage = localStorage.getItem('language');

const translations = {
  en: {
    translation: {
      nav: { home: 'Home', book: 'Book Service', reviews: 'Reviews', myBookings: 'My Bookings', admin: 'Admin Panel', signIn: 'Sign In', signUp: 'Sign Up', logout: 'Logout', language: 'Language' },
      booking: { title: 'Schedule a Repair Service', subtitle: 'Provide appliance details and preferred repair date.', signIn: 'Please sign in to confirm and submit your repair booking.', login: 'Login', name: 'Contact Person Name', namePlaceholder: 'Enter customer name', phone: 'Mobile Phone Number', phonePlaceholder: '10-digit mobile number', service: 'Type of Service Required', date: 'Preferred Service Date', address: 'Service Address', addressPlaceholder: 'Enter complete service address', submit: 'Confirm & Book Service', submitting: 'Submitting...', success: 'Booking Placed Successfully!', successText: 'Thank you for choosing Gulab Enterprises. Our support team will call you shortly to confirm your booking slot.', myBookings: 'Go to My Bookings', another: 'Book Another Service', required: 'Please fill in all the required fields.', authRequired: 'You must be signed in to submit a service booking.', futureDate: 'Please select a current or future date for the booking.', serviceLabel: 'Service:', dateLabel: 'Date:', status: 'Status:', pending: 'Pending Approval' },
      auth: { email: 'Email Address', password: 'Password', fullName: 'Full Name', confirmPassword: 'Confirm Password', signIn: 'Sign In', signingIn: 'Signing in...', create: 'Create Account', creating: 'Creating Account...', signUp: 'Sign Up', newUser: 'New to Gulab Enterprises?', existingUser: 'Already have an account?', signUpHere: 'Sign up here', signInHere: 'Sign in here' },
      common: { loading: 'Loading...', error: 'Something went wrong. Please try again.', all: 'All', filter: 'Filter', reviewsTitle: 'Service Reviews', reviewsIntro: 'Real experiences from Gulab Enterprises customers.', noReviews: 'No reviews match these filters.', previous: 'Previous', next: 'Next', page: 'Page', edit: 'Edit', delete: 'Delete', deleteReview: 'Delete this review?', cancel: 'Cancel', save: 'Save changes' }
    }
  },
  hi: {
    translation: {
      nav: { home: 'होम', book: 'सेवा बुक करें', reviews: 'समीक्षाएं', myBookings: 'मेरी बुकिंग', admin: 'एडमिन पैनल', signIn: 'लॉग इन', signUp: 'साइन अप', logout: 'लॉग आउट', language: 'भाषा' },
      booking: { title: 'मरम्मत सेवा का समय तय करें', subtitle: 'उपकरण की जानकारी और पसंदीदा तारीख दें।', signIn: 'बुकिंग करने के लिए कृपया लॉग इन करें।', login: 'लॉग इन', name: 'संपर्क व्यक्ति का नाम', namePlaceholder: 'ग्राहक का नाम लिखें', phone: 'मोबाइल फोन नंबर', phonePlaceholder: '10 अंकों का मोबाइल नंबर', service: 'आवश्यक सेवा का प्रकार', date: 'सेवा की पसंदीदा तारीख', address: 'सेवा का पता', addressPlaceholder: 'पूरा सेवा पता लिखें', submit: 'पुष्टि करें और सेवा बुक करें', submitting: 'जमा हो रहा है...', success: 'बुकिंग सफलतापूर्वक हो गई!', successText: 'Gulab Enterprises चुनने के लिए धन्यवाद। हमारी टीम बुकिंग की पुष्टि के लिए जल्द ही कॉल करेगी।', myBookings: 'मेरी बुकिंग देखें', another: 'दूसरी सेवा बुक करें', required: 'कृपया सभी आवश्यक फ़ील्ड भरें।', authRequired: 'सेवा बुक करने के लिए लॉग इन करना आवश्यक है।', futureDate: 'कृपया वर्तमान या भविष्य की तारीख चुनें।', serviceLabel: 'सेवा:', dateLabel: 'तारीख:', status: 'स्थिति:', pending: 'पुष्टि लंबित' },
      auth: { email: 'ईमेल पता', password: 'पासवर्ड', fullName: 'पूरा नाम', confirmPassword: 'पासवर्ड की पुष्टि करें', signIn: 'लॉग इन', signingIn: 'लॉग इन हो रहा है...', create: 'खाता बनाएं', creating: 'खाता बन रहा है...', signUp: 'साइन अप', newUser: 'Gulab Enterprises पर नए हैं?', existingUser: 'पहले से खाता है?', signUpHere: 'यहां साइन अप करें', signInHere: 'यहां लॉग इन करें' },
      common: { loading: 'लोड हो रहा है...', error: 'कुछ गलत हुआ। कृपया फिर कोशिश करें।', all: 'सभी', filter: 'फ़िल्टर', reviewsTitle: 'सेवा समीक्षाएं', reviewsIntro: 'Gulab Enterprises ग्राहकों के वास्तविक अनुभव।', noReviews: 'इन फ़िल्टर से कोई समीक्षा नहीं मिली।', previous: 'पिछला', next: 'अगला', page: 'पृष्ठ', edit: 'संपादित करें', delete: 'हटाएं', deleteReview: 'यह समीक्षा हटाएं?', cancel: 'रद्द करें', save: 'बदलाव सेव करें' }
    }
  }
};

i18n.use(initReactI18next).init({
  resources: translations,
  lng: savedLanguage === 'hi' ? 'hi' : 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export const changeLanguage = (language) => {
  const nextLanguage = language === 'hi' ? 'hi' : 'en';
  localStorage.setItem('language', nextLanguage);
  return i18n.changeLanguage(nextLanguage);
};

export default i18n;
