'use client';

import { useState, useEffect, useActionState } from 'react';
import Link from 'next/link';
import { m, useReducedMotion, AnimatePresence } from 'framer-motion';
import { PortalPageHeader } from '../PortalShell';
import { FormField, Select, Textarea } from '../FormField';
import { ArrowRightIcon, MapPinIcon, XIcon } from '../icons';
import { materialMeta } from '@/lib/materials';
import { createPickupRequestAction } from '@/app/actions/requests';

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const INITIAL_STATE = { fieldErrors: {}, error: null };

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','DC','FL',
  'GA','HI','ID','IL','IN','IA','KS','KY','LA','ME',
  'MD','MA','MI','MN','MS','MO','MT','NE','NV','NH',
  'NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI',
  'SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
];

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function formatAddr(a) {
  if (!a?.address) return null;
  const parts = [a.address];
  if (a.city || a.state || a.zip) {
    parts.push([a.city, a.state].filter(Boolean).join(', ') + (a.zip ? ` ${a.zip}` : ''));
  }
  return parts.join(', ');
}

/* ── Address Edit Modal ── */
function AddressModal({ open, onClose, onSave, reduceMotion }) {
  const [addr, setAddr] = useState('');
  const [city, setCity] = useState('');
  const [st, setSt] = useState('');
  const [zip, setZip] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setAddr('');
        setCity('');
        setSt('');
        setZip('');
        setErrors({});
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleSave = (e) => {
    e.preventDefault();
    const next = {};
    if (!addr.trim()) next.addr = 'Street address is required.';
    if (!city.trim()) next.city = 'City is required.';
    if (!st) next.st = 'State is required.';
    if (!zip || !/^\d{5}$/.test(zip)) next.zip = 'Enter a 5-digit ZIP.';
    if (Object.keys(next).length) { setErrors(next); return; }
    onSave({ address: addr.trim(), city: city.trim(), state: st, zip });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          key="address-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="address-modal-title"
        >
          <div
            className="absolute inset-0 bg-navy-dark/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <m.div
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md rounded-sm border border-border/70 bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.2)] sm:p-7"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="address-modal-title"
                  className="font-serif text-[1.375rem] font-semibold leading-tight text-text-primary"
                >
                  Custom pickup address
                </h2>
                <p className="mt-1 font-sans text-[0.8125rem] text-text-muted">
                  This address will be used for this request only.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex-shrink-0 rounded-sm p-1 text-text-muted transition-colors hover:bg-offwhite-alt hover:text-text-primary"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate className="space-y-4">
              <FormField
                label="Address"
                placeholder="123 Industrial Blvd"
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                error={errors.addr}
                required
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-[1fr_5.5rem_6.5rem]">
                <FormField
                  label="City"
                  placeholder="Atlanta"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={errors.city}
                  required
                />
                <FormField label="State" required error={errors.st}>
                  {({ id, className }) => (
                    <Select id={id} value={st} onChange={(e) => setSt(e.target.value)} className={className}>
                      <option value="">—</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </Select>
                  )}
                </FormField>
                <FormField label="ZIP" required error={errors.zip}>
                  {({ id, className }) => (
                    <input
                      id={id}
                      inputMode="numeric"
                      placeholder="30301"
                      value={zip}
                      onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      className={className}
                    />
                  )}
                </FormField>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-sm border border-border bg-surface px-4 py-2 font-sans text-[0.8125rem] font-medium text-text-muted transition-colors hover:border-navy hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-sm border-b-2 border-copper bg-accent px-5 py-2 font-sans text-[0.8125rem] font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  Use this address
                </button>
              </div>
            </form>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

export function CustomerRequestPage({ customer }) {
  const reduceMotion = useReducedMotion();
  const defaultStream = customer?.materials?.[0] || 'metal';

  const [material, setMaterial] = useState(defaultStream);
  const [phone, setPhone] = useState(customer?.contact?.phone || '');
  const [addrOverride, setAddrOverride] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createPickupRequestAction,
    INITIAL_STATE,
  );

  const defaultAddr = customer?.pickupAddress ?? {};
  const activeAddr = addrOverride ?? defaultAddr;
  const fieldErrors = state?.fieldErrors ?? {};

  return (
    <>
      <PortalPageHeader
        title="Request a pickup"
        subtitle="Fill this out. We'll confirm within one business day."
      />
      <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 lg:px-8">
        <div className="rounded-sm border border-border/70 bg-surface p-8">
          <AnimatePresence mode="wait">
            <form
              key="form"
              action={formAction}
              noValidate
              className="space-y-5"
            >
              <FormField label="Stream" error={fieldErrors.material}>
                <Select
                  name="material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                >
                  {Object.keys(materialMeta).map((key) => (
                    <option key={key} value={key}>{materialMeta[key].label}</option>
                  ))}
                </Select>
              </FormField>
              {material === 'mixed' && (
                <FormField label="What's in it?" error={fieldErrors.mixedDetails}>
                  <Textarea
                    name="mixedDetails"
                    placeholder="e.g., old server racks, scrap metal, paper"
                  />
                </FormField>
              )}

              <FormField
                label="Estimated weight (lbs)"
                name="estimatedWeight"
                placeholder="e.g., 500"
                helper="Rough is fine — we just need to pick the right truck."
                error={fieldErrors.estimatedWeight}
                type="number"
                min="1"
              />

              <FormField
                label="Preferred pull date"
                helper="Usually scheduled within 2–3 business days."
                error={fieldErrors.preferredDate}
              >
                <input
                  type="date"
                  name="preferredDate"
                  min={tomorrowISO()}
                  className="w-full rounded-sm border border-border bg-surface px-3.5 py-3 font-sans text-[0.9375rem] text-text-primary focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/15"
                />
              </FormField>

              <FormField label="Time window" error={fieldErrors.timeWindow}>
                <Select name="timeWindow" defaultValue="no_preference">
                  <option value="morning">Morning (8 AM – 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM – 5 PM)</option>
                  <option value="no_preference">No preference</option>
                </Select>
              </FormField>

              {/* ── Pickup address ── */}
              <div className="rounded-sm border border-border/50 bg-offwhite-alt px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <MapPinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-text-muted" />
                    <div>
                      <p className="font-sans text-[0.8125rem] font-semibold text-text-muted">
                        Pickup address
                      </p>
                      <p className="mt-0.5 font-sans text-[0.875rem] text-text-primary">
                        {formatAddr(activeAddr) || (
                          <span className="text-text-muted">No address on file</span>
                        )}
                      </p>
                      {addrOverride && (
                        <button
                          type="button"
                          onClick={() => setAddrOverride(null)}
                          className="mt-1 font-sans text-[0.75rem] text-text-muted underline transition-colors hover:text-text-primary"
                        >
                          Reset to default
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="flex-shrink-0 font-sans text-[0.8125rem] font-semibold text-navy-light transition-colors hover:underline"
                  >
                    {formatAddr(activeAddr) ? 'Change' : 'Add address'}
                  </button>
                </div>
              </div>

              <input type="hidden" name="pickupAddress" value={activeAddr.address || ''} />
              <input type="hidden" name="pickupCity" value={activeAddr.city || ''} />
              <input type="hidden" name="pickupState" value={activeAddr.state || ''} />
              <input type="hidden" name="pickupZip" value={activeAddr.zip || ''} />

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <FormField
                  label="On-site contact"
                  name="contactName"
                  placeholder="Who should the driver ask for?"
                  error={fieldErrors.contactName}
                  defaultValue={customer?.contact?.name || ''}
                />
                <FormField
                  label="Phone"
                  name="contactPhone"
                  placeholder="(770) 555-0123"
                  error={fieldErrors.contactPhone}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                />
              </div>

              <FormField
                label="Dock / access notes"
                helper="Gate codes, dock numbers, anything the driver needs."
              >
                <Textarea
                  name="accessInstructions"
                  placeholder="e.g., Use loading dock B on the west side. Gate code: 1234."
                  rows={3}
                />
              </FormField>

              {state?.error && (
                <m.p
                  initial={reduceMotion ? false : { opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-sm border border-accent/30 bg-accent/5 px-3 py-2 font-sans text-[0.8125rem] text-accent"
                  role="alert"
                >
                  {state.error}
                </m.p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-sm border-b-2 border-copper bg-accent font-sans text-[0.9375rem] font-semibold text-white transition-all duration-200 hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isPending ? 'Submitting…' : 'Submit request'}
                  <ArrowRightIcon className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>

              <p className="pt-1 text-center font-sans text-[0.75rem] text-text-muted">
                <Link href="/portal/dashboard" className="hover:text-text-primary">
                  Back to dashboard
                </Link>
              </p>
            </form>
          </AnimatePresence>
        </div>
      </div>
      <AddressModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={setAddrOverride}
        reduceMotion={reduceMotion}
      />
    </>
  );
}
