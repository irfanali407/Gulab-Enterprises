import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  Calendar,
  Wrench,
} from 'lucide-react';
import SEO from '../components/SEO';

const Home = () => {
  const defaultServices = [
    {
      slug: 'ro-repair',
      name: 'RO Service',
      description: 'Filter replacement, membrane cleaning, water TDS adjustment, and leaks repair for all RO brands.',
    },
    {
      slug: 'ac-repair',
      name: 'AC Repair',
      description: 'Wet wash servicing, gas charging, condenser coil repairs, and cooling issues resolution.',
    },
    {
      slug: 'washing-machine-repair',
      name: 'Washing Machine Repair',
      description: 'Drum issues, inlet/outlet blockages, PCB wiring, spin issues, and noise reduction for top & front loads.',
    },
    {
      slug: 'refrigerator-repair',
      name: 'Refrigerator Repair',
      description: 'Gas leakage fixing, compressor check, thermostat replacements, and door seal updates.',
    },
    {
      slug: 'geyser-repair',
      name: 'Geyser Repair',
      description: 'Heating element replacements, thermostat checks, descaling service, and pressure valve maintenance.',
    },
  ];
  const [services, setServices] = useState(defaultServices);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await axios.get('/api/services');
        const servicesBySlug = Object.fromEntries(
          data
            .filter((service) => defaultServices.some((item) => item.slug === service.slug))
            .map((service) => [service.slug, service])
        );

        setServices(defaultServices.map((defaultService) => ({
          ...defaultService,
          ...servicesBySlug[defaultService.slug],
          name: servicesBySlug[defaultService.slug]?.name || defaultService.name,
          description: servicesBySlug[defaultService.slug]?.description || defaultService.description,
        })));
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen">
      <SEO
        title="Gulab Enterprises Mirgunj | RO Repair & Appliance Services"
        description="Gulab Enterprises offers trusted RO repair, AC service, washing machine, refrigerator, and geyser repair in Mirgunj, Gopalganj, Bihar."
        path="/"
      />
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary-700 via-primary-600 to-primary-800 text-white py-20 lg:py-28 overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-primary-500 opacity-20 blur-xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-accent-green opacity-25 blur-xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <span className="bg-white/10 text-primary-200 px-3.5 py-1 rounded-full text-sm font-semibold tracking-wider uppercase border border-white/10">
                🛠️ Trustworthy Local Service
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
                Quick Appliance Repair & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">
                  RO Purifier Services
                </span>
              </h1>
              <p className="text-lg text-primary-100 max-w-lg leading-relaxed">
                Gulab Enterprises provides reliable, expert on-site repair services for RO systems, ACs, Geysers, Washers, and Fridges in Mirgunj and nearby areas.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/book"
                  className="bg-accent-green hover:bg-accent-green-dark text-white px-6 py-3.5 rounded-xl font-bold transition duration-200 flex items-center shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  Book a Service
                </Link>
              </div>
            </div>

            {/* Hero Quick Info Box */}
            <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden border border-slate-100 max-w-md mx-auto lg:ml-auto">
              <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs px-3 py-1 font-bold rounded-bl-lg">
                Fast Support
              </div>
              <h3 className="text-xl font-extrabold text-slate-800 mb-4 flex items-center">
                <PhoneCall className="w-5 h-5 text-accent-green mr-2" />
                Contact Details
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Call</p>
                  <a
                    href="tel:+916299063855"
                    className="text-lg font-bold text-primary-600 hover:underline"
                  >
                    +91 6299063855
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Service Location</p>
                  <p className="font-semibold text-slate-700">Near Hiralal Cycle Store Mirganj, Gopalganj, Bihar</p>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-sm font-medium text-slate-500">
                    Response time: <span className="font-semibold text-accent-green">Under 2 Hrs</span>
                  </div>
                </div>
                <a
                  href="https://wa.me/916299063855"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#1ebe5d] text-white px-4 py-3 rounded-xl font-bold transition flex items-center justify-center shadow-sm hover:shadow-md"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-extrabold text-slate-800">Our Professional Services</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Book certified technicians for reliable home repair services in Mirgunj. Same day service guaranteed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service._id || service.slug || index}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition duration-300 hover:shadow-lg"
            >
              <h3 className="text-xl font-bold text-slate-800">{service.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{service.description}</p>
            </div>
          ))}

        </div>
      </section>

      {/* Trust & Guarantee Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">100% Satisfaction</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Not happy with the repair? Our technicians will re-visit and resolve the issue free of charge.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-600">
              <Wrench className="w-6 h-6" />
            </div>
              <h4 className="text-lg font-bold text-slate-800">Reliable Repairs</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Our technicians provide careful, dependable service for your home appliances.
            </p>
          </div>
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-600">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-800">Local Support</h4>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              Based directly in Mirgunj, ensuring super-fast responses and neighborhood credibility.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
