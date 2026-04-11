'use client';
import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { services } from '@/data/services';
import { cn } from '@/utils/cn';

const initialState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  service: '',
  message: '',
};

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function ContactForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name);
  };

  const validateField = (name) => {
    const value = form[name];
    let error = '';

    if (name === 'name' && !value.trim()) error = 'Name is required';
    if (name === 'company' && !value.trim()) error = 'Company name is required';
    if (name === 'email') {
      if (!value.trim()) error = 'Email is required';
      else if (!validateEmail(value)) error = 'Please enter a valid email';
    }
    if (name === 'service' && !value) error = 'Please select a service';

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fields = ['name', 'company', 'email', 'service'];
    const allTouched = {};
    fields.forEach((f) => { allTouched[f] = true; });
    setTouched(allTouched);

    const allValid = fields.every((f) => validateField(f));
    if (allValid) {
      setSubmitted(true);
    }
  };

  const inputClasses =
    'w-full font-sans text-base bg-white border border-border rounded-lg px-4 py-3.5 text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-navy-light focus:ring-2 focus:ring-navy-light/20 transition-colors';

  const errorClasses = 'font-sans text-[0.8125rem] text-danger mt-1.5';

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <m.div
          key="success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-16 text-center"
          role="status"
        >
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-serif text-2xl text-text-primary mb-3">
            Thank you for reaching out.
          </h3>
          <p className="font-sans text-base text-text-muted max-w-md">
            We&apos;ve received your inquiry and will get back to you within one business day.
          </p>
        </m.div>
      ) : (
        <m.form
          key="form"
          onSubmit={handleSubmit}
          className="space-y-5"
          noValidate
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="name" className="block font-sans text-sm font-medium text-text-primary mb-1.5">
                Full Name <span className="text-accent" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-required="true"
                aria-invalid={touched.name && !!errors.name}
                aria-describedby={touched.name && errors.name ? 'name-error' : undefined}
                className={cn(inputClasses, touched.name && errors.name && 'border-danger focus:ring-danger/20')}
                placeholder="John Smith"
              />
              {touched.name && errors.name && <p id="name-error" className={errorClasses} role="alert">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="company" className="block font-sans text-sm font-medium text-text-primary mb-1.5">
                Company Name <span className="text-accent" aria-hidden="true">*</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-required="true"
                aria-invalid={touched.company && !!errors.company}
                aria-describedby={touched.company && errors.company ? 'company-error' : undefined}
                className={cn(inputClasses, touched.company && errors.company && 'border-danger focus:ring-danger/20')}
                placeholder="Acme Industries"
              />
              {touched.company && errors.company && <p id="company-error" className={errorClasses} role="alert">{errors.company}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="email" className="block font-sans text-sm font-medium text-text-primary mb-1.5">
                Email Address <span className="text-accent" aria-hidden="true">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                aria-required="true"
                aria-invalid={touched.email && !!errors.email}
                aria-describedby={touched.email && errors.email ? 'email-error' : undefined}
                className={cn(inputClasses, touched.email && errors.email && 'border-danger focus:ring-danger/20')}
                placeholder="john@company.com"
              />
              {touched.email && errors.email && <p id="email-error" className={errorClasses} role="alert">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block font-sans text-sm font-medium text-text-primary mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className={inputClasses}
                placeholder="(555) 555-5555"
              />
            </div>
          </div>

          <div>
            <label htmlFor="service" className="block font-sans text-sm font-medium text-text-primary mb-1.5">
              Service Interest <span className="text-accent" aria-hidden="true">*</span>
            </label>
            <select
              id="service"
              name="service"
              value={form.service}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              aria-required="true"
              aria-invalid={touched.service && !!errors.service}
              aria-describedby={touched.service && errors.service ? 'service-error' : undefined}
              className={cn(inputClasses, 'appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%236B7280%22%20d%3D%22M6%208L1%203h10z%22/%3E%3C/svg%3E")] bg-no-repeat bg-[right_16px_center]', touched.service && errors.service && 'border-danger focus:ring-danger/20')}
            >
              <option value="">Select a service...</option>
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.shortTitle}
                </option>
              ))}
              <option value="multiple">Multiple Services</option>
              <option value="not-sure">Not Sure</option>
            </select>
            {touched.service && errors.service && <p id="service-error" className={errorClasses} role="alert">{errors.service}</p>}
          </div>

          <div>
            <label htmlFor="message" className="block font-sans text-sm font-medium text-text-primary mb-1.5">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              className={cn(inputClasses, 'resize-none')}
              placeholder="Tell us about your recycling needs..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-accent text-white font-sans font-semibold text-base py-4 rounded-lg hover:bg-accent-hover active:scale-[0.99] transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy-light"
          >
            Send Your Inquiry
          </button>
        </m.form>
      )}
    </AnimatePresence>
  );
}
