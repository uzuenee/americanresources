'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { m, useReducedMotion, AnimatePresence } from 'framer-motion';
import { PortalPageHeader } from '../PortalShell';
import { FormField, Select, Textarea } from '../FormField';
import { ArrowRightIcon } from '../icons';
import { materialMeta } from '@/lib/materials';
import { createPickupRequestAction } from '@/app/actions/requests';

function tomorrowISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const INITIAL_STATE = { fieldErrors: {}, error: null };

export function CustomerRequestPage({ customer }) {
  const reduceMotion = useReducedMotion();
  const defaultStream = customer?.materials?.[0] || 'metal';

  const [material, setMaterial] = useState(defaultStream);
  const [state, formAction, isPending] = useActionState(
    createPickupRequestAction,
    INITIAL_STATE,
  );

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
                  defaultValue={customer?.contact?.phone || ''}
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
    </>
  );
}
