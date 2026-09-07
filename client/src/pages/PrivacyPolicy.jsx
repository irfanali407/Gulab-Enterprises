import React from 'react';
import SEO from '../components/SEO';

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-slate-50 py-16">
    <SEO
      title="Privacy Policy | Gulab Enterprises"
      description="Read the Gulab Enterprises privacy policy."
      path="/privacy"
    />
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-extrabold text-slate-800">Privacy Policy</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated: September 8, 2026</p>
        <div className="mt-8 space-y-6 text-sm leading-7 text-slate-600">
          <p>Gulab Enterprises respects your privacy. We collect the contact and service details you provide when you register, request a service, or contact us.</p>
          <p>We use this information to manage bookings, communicate about services, improve our website, and provide customer support. We do not sell your personal information.</p>
          <p>We retain information only as long as needed for these purposes and apply reasonable measures to protect it. You may contact us to ask about your personal information or request a correction.</p>
          <p>For privacy questions, email info@gulabenterprises.com.</p>
        </div>
      </article>
    </main>
  </div>
);

export default PrivacyPolicy;
