'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { usePortalAuth } from './PortalAuthContext';
import { LogOutIcon, ArrowLeftIcon, XIcon, MenuIcon, MailIcon } from './icons';
import { FormField, Textarea } from './FormField';
import { useToast } from './Toast';

function NavItem({ item, active, collapsed, onClick }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 rounded-sm px-5 py-3 font-sans text-[0.875rem] transition-all duration-200',
        active
          ? 'bg-white/10 text-white'
          : 'text-navy-pale hover:bg-white/5 hover:text-white',
        collapsed && 'justify-center px-0'
      )}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-0 w-[3px] rounded-sm bg-copper"
        />
      )}
      <Icon className="h-5 w-5 flex-shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

function SidebarContent({ navItems, onNavigate, collapsed = false, mode = 'desktop', onContact }) {
  const pathname = usePathname();
  const { user, customer, signOut } = usePortalAuth();

  const initials = user?.name
    ? user.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?';

  const orgLabel =
    user?.role === 'admin'
      ? 'American Resources'
      : customer?.company || user?.name || '';

  const handleSignOut = () => {
    signOut();
  };

  const handleContactClick = () => {
    onContact?.();
    onNavigate?.();
  };

  return (
    <div className="flex h-full min-h-dvh flex-col bg-navy">
      <div className={cn('px-6 pt-7 pb-5', collapsed && 'px-3')}>
        {collapsed ? (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-copper text-white">
              <span className="font-serif text-lg font-bold">A</span>
            </div>
          </div>
        ) : (
          <Link href="/" className="inline-flex items-center" aria-label="American Resources">
            <Image
              src="/American-Resources_realLogo.webp"
              alt="American Resources"
              width={160}
              height={45}
              className="h-9 w-auto brightness-0 invert"
              priority
            />
          </Link>
        )}
      </div>

      <div className={cn('mx-5 mb-5 h-px bg-copper/40', collapsed && 'mx-3')} />

      {user && !collapsed && (
        <div className="mb-4 flex items-center gap-3 px-6">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-copper font-sans text-[0.75rem] font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-[0.875rem] font-semibold text-white">
              {orgLabel}
            </p>
            <p className="truncate font-sans text-[0.6875rem] text-navy-pale/70">
              {user.email}
            </p>
          </div>
        </div>
      )}

      <nav className={cn('flex-1 px-3', collapsed && 'px-2')}>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <li key={item.href}>
                <NavItem item={item} active={active} collapsed={collapsed} onClick={onNavigate} />
              </li>
            );
          })}
          {onContact && (
            <li>
              <button
                type="button"
                onClick={handleContactClick}
                className={cn(
                  'flex w-full items-center gap-3 rounded-sm px-5 py-3 text-left font-sans text-[0.875rem] text-navy-pale transition-all duration-200 hover:bg-white/5 hover:text-white',
                  collapsed && 'justify-center px-0'
                )}
              >
                <MailIcon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="truncate">Contact</span>}
              </button>
            </li>
          )}
        </ul>
      </nav>

      <div className={cn('border-t border-white/5 px-5 py-5', collapsed && 'px-2')}>
        <button
          type="button"
          onClick={handleSignOut}
          className={cn(
            'flex w-full items-center gap-3 rounded-sm px-2 py-2 font-sans text-[0.8125rem] text-navy-pale/80 transition-colors hover:bg-white/5 hover:text-white',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOutIcon className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
        {!collapsed && (
          <Link
            href="/"
            className="mt-2 flex items-center gap-2 rounded-sm px-2 py-2 font-sans text-[0.75rem] text-navy-pale/40 transition-colors hover:text-navy-pale/70"
          >
            <ArrowLeftIcon className="h-3 w-3" />
            Back to website
          </Link>
        )}
      </div>
    </div>
  );
}

export function PortalSidebar({ navItems, mobileOpen, onMobileClose }) {
  const reduceMotion = useReducedMotion();
  const [contactOpen, setContactOpen] = useState(false);
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  return (
    <>
      <aside
        className="hidden lg:flex lg:w-[16.25rem] lg:flex-shrink-0"
        aria-label="Portal navigation"
      >
        <div className="sticky top-0 h-dvh w-full">
          <SidebarContent navItems={navItems} onContact={openContact} />
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <m.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 bg-navy-dark/60 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />
            <m.aside
              key="drawer"
              initial={reduceMotion ? false : { x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] shadow-xl lg:hidden"
              aria-label="Portal navigation"
            >
              <button
                type="button"
                onClick={onMobileClose}
                className="absolute right-3 top-3 z-10 rounded-sm p-2 text-navy-pale transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close navigation"
              >
                <XIcon className="h-5 w-5" />
              </button>
              <SidebarContent
                navItems={navItems}
                onNavigate={onMobileClose}
                onContact={openContact}
                mode="mobile"
              />
            </m.aside>
          </>
        )}
      </AnimatePresence>

      <ContactModal open={contactOpen} onClose={closeContact} />
    </>
  );
}

export function SidebarToggleButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center rounded-sm border border-border bg-surface p-2 text-text-primary transition-colors hover:bg-offwhite-alt lg:hidden"
      aria-label="Open navigation menu"
    >
      <MenuIcon className="h-5 w-5" />
    </button>
  );
}

function ContactModal({ open, onClose }) {
  const { user } = usePortalAuth();
  const { toast } = useToast();
  const reduceMotion = useReducedMotion();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setSubject('');
      setMessage('');
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!subject.trim()) next.subject = "What's this about?";
    if (!message.trim()) next.message = 'Leave us a message.';
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    setTimeout(() => {
      toast({
        title: 'Message sent',
        description: "We'll get back to you within one business day.",
      });
      setSubmitting(false);
      onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      {open && (
        <m.div
          key="contact-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
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
                  id="contact-modal-title"
                  className="font-serif text-[1.375rem] font-semibold leading-tight text-text-primary"
                >
                  Get in touch
                </h2>
                <p className="mt-1 font-sans text-[0.8125rem] text-text-muted">
                  We&apos;ll get back to you within one business day.
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

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {user && (
                <div className="rounded-sm bg-offwhite-alt px-3 py-2 font-sans text-[0.75rem] text-text-muted">
                  From <span className="font-semibold text-text-primary">{user.name}</span>
                  {user.email && <> · {user.email}</>}
                </div>
              )}

              <FormField
                label="Subject"
                placeholder="What's this about?"
                value={subject}
                error={errors.subject}
                onChange={(e) => setSubject(e.target.value)}
              />

              <FormField label="Message" error={errors.message}>
                <Textarea
                  rows={5}
                  placeholder="Tell us what's on your mind…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </FormField>

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
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-sm border-b-2 border-copper bg-accent px-5 py-2 font-sans text-[0.8125rem] font-semibold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </form>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
