import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle, PhoneCall } from 'lucide-react';
import SEO from '../components/SEO';

const serviceData = {
  'ro-repair': {
    name: 'RO Repair & Water Purifier Service',
    description: 'Book reliable RO repair in Mirgunj for filter replacement, membrane cleaning, TDS adjustment, and water leakage repair.',
    points: ['Filter and membrane replacement', 'TDS and water quality checks', 'Leak, pump, and faucet repairs'],
  },
  'ac-repair': {
    name: 'AC Service & Repair',
    description: 'Get dependable AC service in Mirgunj for cooling problems, wet washing, gas charging, and condenser repairs.',
    points: ['AC wet service and cleaning', 'Cooling and gas pressure checks', 'Condenser and component repairs'],
  },
  'washing-machine-repair': {
    name: 'Washing Machine Repair',
    description: 'Professional washing machine repair in Mirgunj for spin, drainage, inlet, drum, wiring, and noise issues.',
    points: ['Top-load and front-load repairs', 'Drainage and spin issue diagnosis', 'PCB, wiring, and inlet repairs'],
  },
  'refrigerator-repair': {
    name: 'Refrigerator Repair',
    description: 'Local refrigerator repair in Mirgunj for cooling issues, gas leaks, compressors, thermostats, and door seals.',
    points: ['Cooling and gas leak diagnosis', 'Compressor and thermostat checks', 'Door seal and electrical repairs'],
  },
  'geyser-repair': {
    name: 'Geyser Repair & Service',
    description: 'Book geyser repair in Mirgunj for heating elements, thermostats, descaling, and pressure valve maintenance.',
    points: ['Heating element replacement', 'Thermostat and safety checks', 'Tank descaling and valve service'],
  },
};

const ServicePage = () => {
  const { serviceSlug } = useParams();
  const service = serviceData[serviceSlug] || serviceData['ro-repair'];
  const bookingType = service.name.split(' &')[0];

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <SEO title={`${service.name} in Mirgunj | Gulab Enterprises`} description={service.description} path={`/services/${serviceSlug}`} />
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <header className="rounded-3xl bg-primary-700 px-6 py-12 text-white sm:px-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary-200">Mirgunj home service</p>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">{service.name}</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-primary-100 sm:text-lg">{service.description}</p>
          <Link to={`/book?type=${encodeURIComponent(bookingType)}`} className="mt-8 inline-flex items-center rounded-xl bg-accent-green px-5 py-3 text-sm font-bold text-white shadow-lg">
            <CalendarDays className="mr-2 h-5 w-5" /> Book this service
          </Link>
        </header>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10" aria-labelledby="service-includes">
          <h2 id="service-includes" className="text-2xl font-extrabold text-slate-800">What this service includes</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {service.points.map((point) => (
              <li key={point} className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-accent-green" /> {point}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-col gap-4 border-t border-slate-100 pt-6 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span className="flex items-center gap-2 font-semibold"><PhoneCall className="h-5 w-5 text-primary-600" /> Call +91 6299063855</span>
            <Link to="/reviews" className="font-bold text-primary-600 hover:text-primary-800">Read customer reviews</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ServicePage;
