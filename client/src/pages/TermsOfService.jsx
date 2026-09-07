import React from 'react';
import SEO from '../components/SEO';

const TermsOfService = () => (
  <div className="min-h-screen bg-slate-50 py-16">
    <SEO
      title="Terms of Service | Gulab Enterprises"
      description="Read the Gulab Enterprises terms of service."
      path="/terms"
    />
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-extrabold text-slate-800">Terms of Service</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: September 8, 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600">
          <p>By using the Gulab Enterprises website, you agree to provide accurate information and use the service for lawful purposes.</p>
          <p>Booking requests are subject to technician availability and confirmation. Service timing, pricing, and scope may be confirmed or adjusted before work begins.</p>
          <p>You are responsible for providing safe access to the appliance and accurate contact and address details. We may decline requests that cannot be safely or reasonably fulfilled.</p>
          <p>For questions about these terms, email info@gulabenterprises.com.</p>
        </div>
      </article>
    </main>
  </div>
);

export default TermsOfService;
