import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Languages } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { changeLanguage } from '../i18n';
import SEO from '../components/SEO';

const faqs = [
  {
    question_en: 'How do I create an account?',
    question_hi: 'अकाउंट कैसे बनाएं?',
    answer_en: 'Click Sign Up, enter your name, email, and password, then verify your email with the verification code sent to you.',
    answer_hi: 'Sign Up पर क्लिक करें, अपना नाम, ईमेल और पासवर्ड भरें, फिर भेजे गए verification code से अपना ईमेल सत्यापित करें।',
  },
  {
    question_en: 'How do I log in?',
    question_hi: 'लॉगिन कैसे करें?',
    answer_en: 'Enter your registered email and password, then click Login. Your email must be verified first.',
    answer_hi: 'अपना रजिस्टर्ड ईमेल और पासवर्ड भरें, फिर Login पर क्लिक करें। आपका ईमेल पहले सत्यापित होना चाहिए।',
  },
  {
    question_en: 'Is email verification required?',
    question_hi: 'क्या ईमेल सत्यापन जरूरी है?',
    answer_en: 'Yes. You must verify your email before you can log in or access protected features.',
    answer_hi: 'हां। लॉगिन करने या सुरक्षित सुविधाओं का उपयोग करने से पहले ईमेल सत्यापित करना जरूरी है।',
  },
  {
    question_en: 'How do I reset my forgotten password?',
    question_hi: 'Forgot Password कैसे रीसेट करें?',
    answer_en: 'Click Forgot Password on the Login page, enter your email, and use the password reset link sent to you.',
    answer_hi: 'Login पेज पर Forgot Password पर क्लिक करें, अपना ईमेल भरें और भेजे गए password reset link से पासवर्ड बदलें।',
  },
  {
    question_en: 'How does an admin log in?',
    question_hi: 'एडमिन लॉगिन कैसे करें?',
    answer_en: 'The admin uses the email and password provided by the system. Admin accounts cannot be created through public signup.',
    answer_hi: 'एडमिन सिस्टम द्वारा दिए गए ईमेल और पासवर्ड का उपयोग करता है। एडमिन अकाउंट public signup से नहीं बनाया जा सकता।',
  },
  {
    question_en: 'Can I use a fake email address?',
    question_hi: 'क्या fake email इस्तेमाल कर सकते हैं?',
    answer_en: 'No. You need access to a valid email address because verification is required before login.',
    answer_hi: 'नहीं। आपके पास valid ईमेल का access होना चाहिए, क्योंकि लॉगिन से पहले verification जरूरी है।',
  },
  {
    question_en: 'What RO service does Gulab Enterprises provide in Mirgunj?',
    question_hi: 'Gulab Enterprises मीरगंज में कौन-सी RO सेवा देता है?',
    answer_en: 'We provide RO repair and water purifier service in Mirgunj, including filter and membrane replacement, TDS checks, pump repairs, faucet repairs, and leakage fixes.',
    answer_hi: 'हम मीरगंज में RO रिपेयर और वाटर प्यूरीफायर सेवा देते हैं, जिसमें फिल्टर और मेम्ब्रेन बदलना, TDS जांच, पंप, नल और लीकेज की मरम्मत शामिल है।',
  },
  {
    question_en: 'Do you offer AC repair and servicing in Mirgunj?',
    question_hi: 'क्या आप मीरगंज में AC रिपेयर और सर्विसिंग करते हैं?',
    answer_en: 'Yes. Our AC service includes wet cleaning, cooling diagnosis, gas pressure checks, condenser cleaning, and common AC component repairs for homes in Mirgunj and nearby areas.',
    answer_hi: 'हां। हमारी AC सेवा में वेट क्लीनिंग, कूलिंग जांच, गैस प्रेशर जांच, कंडेनसर सफाई और सामान्य AC पार्ट्स की मरम्मत शामिल है।',
  },
  {
    question_en: 'How do I book a home appliance repair service?',
    question_hi: 'होम अप्लायंस रिपेयर सेवा कैसे बुक करें?',
    answer_en: 'Create an account, open the Book Service page, select your appliance service, enter your address and preferred date, then submit the request. Our team will contact you to confirm the visit.',
    answer_hi: 'खाता बनाएं, सेवा बुक करें पेज खोलें, अपने उपकरण की सेवा चुनें, पता और पसंदीदा तारीख भरकर अनुरोध भेजें। हमारी टीम विजिट की पुष्टि के लिए आपसे संपर्क करेगी।',
  },
  {
    question_en: 'Which appliances can you repair?',
    question_hi: 'आप किन उपकरणों की मरम्मत करते हैं?',
    answer_en: 'Gulab Enterprises repairs RO water purifiers, air conditioners, washing machines, refrigerators, and geysers. Service availability depends on the issue and location.',
    answer_hi: 'Gulab Enterprises RO वाटर प्यूरीफायर, AC, वॉशिंग मशीन, फ्रिज और गीजर की मरम्मत करता है। सेवा समस्या और स्थान पर निर्भर करती है।',
  },
  {
    question_en: 'How quickly can a technician visit?',
    question_hi: 'टेक्नीशियन कितनी जल्दी आ सकता है?',
    answer_en: 'We aim to respond quickly to service requests in Mirgunj. After you submit a booking, our team contacts you to confirm technician availability and the service time.',
    answer_hi: 'हम मीरगंज में सेवा अनुरोधों का जल्दी जवाब देने का प्रयास करते हैं। बुकिंग के बाद हमारी टीम टेक्नीशियन की उपलब्धता और सेवा समय की पुष्टि करने के लिए संपर्क करेगी।',
  },
  {
    question_en: 'Can I track my repair booking online?',
    question_hi: 'क्या मैं अपनी रिपेयर बुकिंग ऑनलाइन देख सकता हूं?',
    answer_en: 'Yes. Sign in and open My Bookings to view your service request, scheduled date, and current status, including approved, in-progress, or completed updates.',
    answer_hi: 'हां। लॉग इन करके मेरी बुकिंग खोलें और अपना सेवा अनुरोध, तारीख और स्वीकृत, प्रगति में या पूरी हुई स्थिति देखें।',
  },
  {
    question_en: 'Do you repair washing machines and refrigerators at home?',
    question_hi: 'क्या आप घर पर वॉशिंग मशीन और फ्रिज की मरम्मत करते हैं?',
    answer_en: 'Yes. We provide on-site washing machine and refrigerator repair in Mirgunj for issues such as drainage, spinning, cooling, compressor, thermostat, and door-seal problems.',
    answer_hi: 'हां। हम मीरगंज में घर पर वॉशिंग मशीन और फ्रिज की मरम्मत करते हैं, जैसे ड्रेनेज, स्पिन, कूलिंग, कंप्रेसर, थर्मोस्टेट और डोर सील की समस्याएं।',
  },
  {
    question_en: 'How can I contact Gulab Enterprises?',
    question_hi: 'Gulab Enterprises से संपर्क कैसे करें?',
    answer_en: 'Call us at +91 6299063855 or book a service online. We serve customers in Mirgunj, Gopalganj, Bihar and nearby locations.',
    answer_hi: '+91 6299063855 पर कॉल करें या ऑनलाइन सेवा बुक करें। हम मीरगंज, गोपालगंज, बिहार और आसपास के क्षेत्रों में सेवा देते हैं।',
  },
];

const FAQ = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language === 'hi' ? 'hi' : 'en');
  const [openIndex, setOpenIndex] = useState(0);
  const isHindi = language === 'hi';
  const currentFaqs = faqs.map((faq) => ({
    question: faq[`question_${language}`],
    answer: faq[`answer_${language}`],
  }));
  const toggleLanguage = () => {
    const nextLanguage = isHindi ? 'en' : 'hi';
    setLanguage(nextLanguage);
    changeLanguage(nextLanguage);
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: language,
    mainEntity: currentFaqs.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 py-14 sm:py-20">
      <SEO
        title={isHindi ? 'FAQ | मीरगंज में RO और AC सेवा | Gulab Enterprises' : 'FAQ | RO Service and AC Repair in Mirgunj | Gulab Enterprises'}
        description={isHindi ? 'मीरगंज में RO सेवा, AC रिपेयर, बुकिंग और घरेलू उपकरणों की मरम्मत के बारे में अक्सर पूछे जाने वाले सवाल।' : 'Find answers about RO service, AC repair, appliance bookings, technician visits, and home appliance repair in Mirgunj from Gulab Enterprises.'}
        path="/faq"
      />
      <Helmet>
        <meta name="keywords" content="RO service Mirgunj, AC repair Mirgunj, मीरगंज RO सेवा, मीरगंज AC रिपेयर, Gulab Enterprises FAQ" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <header className="text-center">
          <div className="flex justify-end">
            <button type="button" onClick={toggleLanguage} aria-label={isHindi ? 'Switch FAQ to English' : 'हिंदी में FAQ देखें'} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-primary-600 shadow-sm hover:bg-primary-50">
              <Languages className="h-4 w-4" /> {isHindi ? 'EN' : 'हिंदी'}
            </button>
          </div>
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-600">{isHindi ? 'मीरगंज ग्राहकों के लिए सहायता' : 'Help for Mirgunj customers'}</p>
          <h1 className="text-3xl font-extrabold leading-tight text-slate-800 sm:text-5xl">{isHindi ? 'अक्सर पूछे जाने वाले सवाल' : 'Frequently Asked Questions'}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
            {isHindi ? 'Gulab Enterprises की RO सेवा, AC रिपेयर, बुकिंग और घरेलू उपकरणों की मरम्मत के बारे में जानें।' : 'Learn more about RO service, AC repair, booking visits, and appliance repairs from Gulab Enterprises.'}
          </p>
        </header>

        <section className="mt-10" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="mb-4 text-xl font-extrabold text-slate-800 sm:text-2xl">{isHindi ? 'सेवा से जुड़े सवाल और जवाब' : 'Service questions and answers'}</h2>
          <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {currentFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const answerId = `faq-answer-${index}`;
              return (
                <article key={faq.question}>
                  <h3 className="text-base font-bold text-slate-800">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 sm:px-6"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={`h-5 w-5 shrink-0 text-primary-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </h3>
                  {isOpen && (
                    <div id={answerId} className="px-5 pb-5 text-sm leading-7 text-slate-600 sm:px-6" role="region">
                      {faq.answer}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-primary-100 bg-primary-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-3">
            <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
            <p className="text-sm leading-6 text-slate-700">{isHindi ? 'किसी खास उपकरण की समस्या में मदद चाहिए?' : 'Need help with a specific appliance issue?'}</p>
          </div>
          <Link to="/book" className="rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700">{isHindi ? 'सेवा बुक करें' : 'Book a service'}</Link>
        </aside>
      </div>
    </div>
  );
};

export default FAQ;
