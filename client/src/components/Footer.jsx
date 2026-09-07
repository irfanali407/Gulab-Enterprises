import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Shield, CheckCircle } from 'lucide-react';
import { FaInstagram } from 'react-icons/fa';

const Footer = () => {
  const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/yourprofile';

  return (
    <footer className="bg-slate-900 text-slate-350 mt-auto border-t border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 text-white">
              <div className="bg-primary-600 p-2 rounded-lg text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight leading-none text-white">
                  GULAB
                </span>
                <span className="text-xs text-primary-400 font-bold tracking-wider">
                  ENTERPRISES
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Trusted home appliance services in Mirgunj for RO water purifiers, ACs, geysers, washing machines, and refrigerators.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <CheckCircle className="w-4 h-4 text-accent-green" />
              <span>Certified Technicians</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/book" className="hover:text-primary-400 transition">
                  Book Repair Service
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-primary-400 transition">
                  Customer Reviews
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary-400 transition">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Services Offered */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Our Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/services/ro-repair" className="hover:text-primary-400 transition">RO Purifier Installation & Service</Link></li>
              <li><Link to="/services/ac-repair" className="hover:text-primary-400 transition">Air Conditioner (AC) Wet Service</Link></li>
              <li><Link to="/services/washing-machine-repair" className="hover:text-primary-400 transition">Washing Machine Repair</Link></li>
              <li><Link to="/services/refrigerator-repair" className="hover:text-primary-400 transition">Refrigerator / Fridge Service</Link></li>
              <li><Link to="/services/geyser-repair" className="hover:text-primary-400 transition">Geyser Repair & Descaling</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Get in Touch
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 text-primary-500 mr-2 shrink-0 mt-0.5" />
                <span>Near Hiralal Cycle Store Mirganj, Gopalganj Bihar - 841438</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 text-accent-green mr-2 shrink-0" />
                <a href="tel:+916299063855" className="hover:text-primary-400 transition">
                  +91 6299063855
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 text-primary-500 mr-2 shrink-0" />
                <a href="mailto:info@gulabenterprises.com" className="hover:text-primary-400 transition">
                  info@gulabenterprises.com
                </a>
              </li>
              <li>
                <a href={instagramUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-slate-300 hover:text-pink-400 transition" aria-label="Follow Gulab Enterprises on Instagram">
                  <FaInstagram className="w-5 h-5" />
                  Follow us on Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} Gulab Enterprises Mirgunj. All rights reserved.</p>
          <p>Designed &amp; Developed by Irfan Ali</p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-slate-400 transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-400 transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
