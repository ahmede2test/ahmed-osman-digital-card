import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────
   DEFAULT FALLBACK VALUES (used if no DB data)
───────────────────────────────────────── */
const DEFAULT_AVATAR = "https://github.com/ahmede2test.png";

interface ProfileData {
  avatar_url: string;
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  skills: string[];
  linkedin: string;
  github: string;
  portfolio: string;
  facebook: string;
  instagram: string;
  email: string;
  phone: string;
  whatsapp: string;
}

const DEFAULT_PROFILE: ProfileData = {
  avatar_url: DEFAULT_AVATAR,
  name: "Ahmed Osman ELsisi",
  title: "IT Specialist",
  subtitle: "IT Technical Support &middot; Orascom Construction (Contrack&nbsp;FM) &middot; Flutter Expert &middot; Mobile App Developer",
  bio: "Architecting and developing smart, high-performance mobile applications with premium, user-centric UI/UX design layouts. Explore my professional networks and connect with me directly.",
  skills: ["Flutter", "App Developer", "MySQL", "API Integration", "IT Support"],
  linkedin: "https://www.linkedin.com/in/ahmed-osman22",
  github: "https://github.com/ahmede2test",
  portfolio: "https://ahmed-osman-portfolio.vercel.app/",
  facebook: "https://www.facebook.com/share/18tkT6hhhc/",
  instagram: "https://www.instagram.com/eng_ahmed_el_sisiy?igsh=dW1pbHU1M2E0cG50",
  email: "ahmed.osmanis.fcai@gmail.com",
  phone: "+201027451231",
  whatsapp: "201027451231",
};

/* ═══════════════════════════════════════════
   SVG ICON COMPONENTS
═══════════════════════════════════════════ */

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      fill="#0077b5"
    />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      fill="#111111"
    />
  </svg>
);

const PortfolioIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="portG" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00f2fe" />
        <stop offset="100%" stopColor="#4facfe" />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" stroke="url(#portG)" strokeWidth="2" />
    <path d="M12 2c0 0-4 5-4 10s4 10 4 10" stroke="url(#portG)" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 2c0 0 4 5 4 10s-4 10-4 10" stroke="url(#portG)" strokeWidth="2" strokeLinecap="round" />
    <line x1="2" y1="12" x2="22" y2="12" stroke="url(#portG)" strokeWidth="2" />
    <line x1="3.5" y1="7" x2="20.5" y2="7" stroke="url(#portG)" strokeWidth="1.4" strokeLinecap="round" />
    <line x1="3.5" y1="17" x2="20.5" y2="17" stroke="url(#portG)" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#1877f2"
    />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="igG" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f09433" />
        <stop offset="25%" stopColor="#e6683c" />
        <stop offset="50%" stopColor="#dc2743" />
        <stop offset="75%" stopColor="#cc2366" />
        <stop offset="100%" stopColor="#bc1888" />
      </linearGradient>
    </defs>
    <path
      d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      fill="url(#igG)"
    />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"
      fill="#ea4335"
      opacity="0.15"
    />
    <path
      d="M22 6.5L12 13.5 2 6.5"
      stroke="#ea4335"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <rect x="2" y="6" width="20" height="14" rx="2" fill="none" stroke="#ea4335" strokeWidth="2" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.02l-2.21 2.2z"
      fill="currentColor"
    />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"
      fill="#25D366"
    />
    <path
      d="M12.004 2.003C6.465 2.003 2 6.467 2 12.005a9.992 9.992 0 001.504 5.297L2 22l4.845-1.491A9.962 9.962 0 0012.004 22c5.537 0 10.002-4.463 10.002-10.001 0-5.535-4.463-10.001-10.002-10.001v.005zM12.004 20.128a8.111 8.111 0 01-4.146-1.137l-.297-.178-3.076.948.983-3.003-.198-.31A8.102 8.102 0 013.876 12c0-4.483 3.647-8.129 8.131-8.129 4.484 0 8.13 3.645 8.13 8.129 0 4.483-3.648 8.128-8.133 8.128z"
      fill="#25D366"
    />
  </svg>
);

/* ═══════════════════════════════════════════
   SKILL PILL COMPONENT
═══════════════════════════════════════════ */

function SkillPill({ label }: { label: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onTouchStart = () => el.classList.add('touched');
    const onTouchEnd = () => {
      setTimeout(() => el.classList.remove('touched'), 340);
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  return (
    <span className="skill-pill" ref={ref}>
      <span className="skill-dot"></span>
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════
   SQUIRCLE LINK COMPONENT
═══════════════════════════════════════════ */

function SquircleLink({
  href,
  label,
  title,
  children,
  external = true,
}: {
  href: string;
  label: string;
  title: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const spawnRipple = useCallback((clientX: number, clientY: number) => {
    const link = ref.current;
    if (!link) return;
    const rect = link.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = clientX - rect.left - size / 2;
    const y = clientY - rect.top - size / 2;
    const el = document.createElement('span');
    el.className = 'ripple';
    Object.assign(el.style, {
      width: size + 'px',
      height: size + 'px',
      left: x + 'px',
      top: y + 'px',
    });
    link.appendChild(el);
    setTimeout(() => el.remove(), 500);
  }, []);

  useEffect(() => {
    const link = ref.current;
    if (!link) return;

    const onMouseDown = (e: MouseEvent) => spawnRipple(e.clientX, e.clientY);
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      spawnRipple(t.clientX, t.clientY);
    };

    link.addEventListener('mousedown', onMouseDown);
    link.addEventListener('touchstart', onTouchStart, { passive: true });

    return () => {
      link.removeEventListener('mousedown', onMouseDown);
      link.removeEventListener('touchstart', onTouchStart);
    };
  }, [spawnRipple]);

  return (
    <a
      ref={ref}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="squircle-link"
      role="listitem"
      aria-label={label}
      title={title}
    >
      {children}
    </a>
  );
}

/* ═══════════════════════════════════════════
   CTA BUTTON COMPONENT
═══════════════════════════════════════════ */

function CtaButton({
  href,
  label,
  variant,
  children,
  external = false,
}: {
  href: string;
  label: string;
  variant: 'call' | 'wa';
  children: React.ReactNode;
  external?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const btn = ref.current;
    if (!btn) return;

    const onTouchStart = () => {
      btn.style.transform = 'scale(0.96)';
    };
    const onTouchEnd = () => {
      btn.style.transform = '';
    };

    btn.addEventListener('touchstart', onTouchStart, { passive: true });
    btn.addEventListener('touchend', onTouchEnd, { passive: true });
    btn.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      btn.removeEventListener('touchstart', onTouchStart);
      btn.removeEventListener('touchend', onTouchEnd);
      btn.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  return (
    <a
      ref={ref}
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`cta-btn cta-btn--${variant}`}
      aria-label={label}
    >
      {children}
    </a>
  );
}

/* ═══════════════════════════════════════════
   MAIN APP COMPONENT (NOW FULLY DYNAMIC FROM SUPABASE)
═══════════════════════════════════════════ */

export default function App() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const openAvatarModal = () => setIsAvatarModalOpen(true);
  const closeAvatarModal = () => setIsAvatarModalOpen(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAvatarModal();
    };
    if (isAvatarModalOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isAvatarModalOpen]);

  /* Load profile from Supabase (or use defaults) */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profile')
          .select('*')
          .eq('id', 'default')
          .single();

        if (data) {
          setProfile({
            avatar_url: data.avatar_url || DEFAULT_PROFILE.avatar_url,
            name: data.name || DEFAULT_PROFILE.name,
            title: data.title || DEFAULT_PROFILE.title,
            subtitle: data.subtitle || DEFAULT_PROFILE.subtitle,
            bio: data.bio || DEFAULT_PROFILE.bio,
            skills: Array.isArray(data.skills) ? data.skills : DEFAULT_PROFILE.skills,
            linkedin: data.linkedin || DEFAULT_PROFILE.linkedin,
            github: data.github || DEFAULT_PROFILE.github,
            portfolio: data.portfolio || DEFAULT_PROFILE.portfolio,
            facebook: data.facebook || DEFAULT_PROFILE.facebook,
            instagram: data.instagram || DEFAULT_PROFILE.instagram,
            email: data.email || DEFAULT_PROFILE.email,
            phone: data.phone || DEFAULT_PROFILE.phone,
            whatsapp: data.whatsapp || DEFAULT_PROFILE.whatsapp,
          });
        }
      } catch (err) {
        console.log('Using default profile (no DB row yet or connection issue)');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  /* Prevent double-tap zoom on iOS */
  useEffect(() => {
    let lastTap = 0;
    const handler = (e: TouchEvent) => {
      const now = Date.now();
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('.squircle-link, .cta-btn, .skill-pill');
      if (now - lastTap < 320 && !isInteractive) e.preventDefault();
      lastTap = now;
    };

    document.addEventListener('touchend', handler, { passive: false } as EventListenerOptions);
    return () => document.removeEventListener('touchend', handler);
  }, []);

  // Derived values for CTAs (keep exact behavior)
  const phoneHref = `tel:${profile.phone}`;
  const waHref = `https://wa.me/${profile.whatsapp}`;

  return (
    <div className="page-wrapper">

      {/* ══ EDITORIAL HEADER ══ */}
      <header className="editorial-header">
        <span className="editorial-label">Digital Business Card</span>
        <span className="editorial-tag">
          <span className="editorial-tag-dot"></span>
          Available Now
        </span>
      </header>

      {/* ══ MAIN CARD ══ */}
      <main className="card" role="main" aria-label="Ahmed Osman ELsisi Business Card">

        <div className="card-accent-bar"></div>

        <div className="card-inner">

          {/* ── AVATAR + NAME ── */}
          <div className="avatar-section">

            <div 
              className="avatar-wrapper avatar-clickable" 
              aria-label={`Click to view full size photo of ${profile.name}`}
              role="button"
              tabIndex={0}
              onClick={openAvatarModal}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAvatarModal(); } }}
            >
              <div className="avatar-outer-ring"></div>
              <div className="avatar-white-ring"></div>

              {/* ── Dynamic Online Image Avatar (NOW FROM DB) ── */}
              <div className="avatar-placeholder" aria-hidden="true">
                <img
                  src={profile.avatar_url || DEFAULT_AVATAR}
                  alt={profile.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                  }}
                  draggable={false}
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                />
              </div>

              {/* Live status indicator */}
              <div className="status-dot" role="img" aria-label="Online — Available"></div>
            </div>

            {/* Name + badge + subtitle (NOW DYNAMIC) */}
            <div className="name-block">
              <h1 className="card-name">
                {profile.name.split(' ').slice(0, -1).join(' ')} <em>{profile.name.split(' ').slice(-1)}</em>
              </h1>
              <div className="card-title-badge">
                <span className="badge-bullet"></span>
                {profile.title}
              </div>
              <p 
                className="card-subtitle"
                dangerouslySetInnerHTML={{ __html: profile.subtitle }} 
              />
            </div>

          </div>

          {/* ── DIVIDER ── */}
          <div className="divider" aria-hidden="true"></div>

          {/* ── BIO (DYNAMIC) ── */}
          <p className="bio-text">
            {profile.bio}
          </p>

          {/* ── SKILL BADGES (DYNAMIC) ── */}
          <div className="skills-section">
            <p className="section-micro-label">Expertise</p>
            <div className="skills-row">
              {profile.skills.map((skill, index) => (
                <SkillPill key={index} label={skill} />
              ))}
            </div>
          </div>

          {/* ── SOCIAL ICON ROW (DYNAMIC LINKS) ── */}
          <div className="section-label-row">
            <span className="section-label">Connect</span>
            <div className="section-label-line"></div>
          </div>

          <div className="icon-row" role="list" aria-label="Social and contact links">
            <SquircleLink href={profile.linkedin} label="LinkedIn" title="LinkedIn">
              <LinkedInIcon />
            </SquircleLink>
            <SquircleLink href={profile.github} label="GitHub" title="GitHub">
              <GitHubIcon />
            </SquircleLink>
            <SquircleLink href={profile.portfolio} label="Portfolio Website" title="Portfolio">
              <PortfolioIcon />
            </SquircleLink>
            <SquircleLink href={profile.facebook} label="Facebook" title="Facebook">
              <FacebookIcon />
            </SquircleLink>
            <SquircleLink href={profile.instagram} label="Instagram" title="Instagram">
              <InstagramIcon />
            </SquircleLink>
            <SquircleLink href={`mailto:${profile.email}`} label="Send Email" title="Email" external={false}>
              <EmailIcon />
            </SquircleLink>
          </div>

          {/* ── DUAL CTA BUTTONS (DYNAMIC) ── */}
          <div className="section-label-row" style={{ marginBottom: '12px' }}>
            <span className="section-label">Direct Contact</span>
            <div className="section-label-line"></div>
          </div>

          <div className="cta-row">
            <CtaButton href={phoneHref} label={`Call ${profile.name}`} variant="call">
              <PhoneIcon />
              <span>Call Now</span>
            </CtaButton>
            <CtaButton href={waHref} label={`WhatsApp Chat with ${profile.name}`} variant="wa" external>
              <WhatsAppIcon />
              <span>WhatsApp</span>
            </CtaButton>
          </div>

        </div>

        {/* ── CARD BASELINE FOOTER (with tiny admin link - non-intrusive) ── */}
        <div className="card-footer" style={{ position: 'relative' }}>
          <span className="card-footer-baseline">
            {profile.name.split(' ')[0]} Osman &nbsp;&bull;&nbsp; 2026 &nbsp;&bull;&nbsp; Digital Card
          </span>
          
          {/* Tiny admin access link (does not change visual UI for visitors) */}
          <Link 
            to="/admin" 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
            style={{ fontSize: '9px', letterSpacing: '0.5px' }}
            title="Admin Panel"
          >
            ⚙
          </Link>
        </div>

      </main>

      {/* ═══════════════════════════════════════════
          FANCY LUXURIOUS AVATAR MODAL (click photo to open)
      ═══════════════════════════════════════════ */}
      {isAvatarModalOpen && (
        <div 
          className="avatar-modal-overlay" 
          onClick={closeAvatarModal}
          role="dialog"
          aria-modal="true"
          aria-label="Full size profile photo"
        >
          <div 
            className="avatar-modal-content" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Elegant close button */}
            <button 
              className="avatar-modal-close" 
              onClick={closeAvatarModal}
              aria-label="Close photo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* The large fancy photo with rings */}
            <div className="avatar-modal-wrapper">
              <div className="avatar-modal-outer-ring"></div>
              <div className="avatar-modal-white-ring"></div>
              
              <div className="avatar-modal-image-container">
                <img
                  src={profile.avatar_url || DEFAULT_AVATAR}
                  alt={`Full size photo of ${profile.name}`}
                  className="avatar-modal-image"
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                />
              </div>
            </div>

            {/* Subtle caption */}
            <div className="avatar-modal-caption">
              {profile.name}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
