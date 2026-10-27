/*
  EcoRetrofit24 website.
  Source file. After editing, rebuild app.js (see src/README.md).
*/
const { useState, useEffect, useRef, useMemo } = React;

const EMAIL = 'tebaiwaqar@gmail.com';
const JSPDF_URL = 'https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js';

/* ======================================================================
   Small helpers
   ====================================================================== */

const prefersReducedMotion = () =>
  window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const canAutoplay = () =>
  !prefersReducedMotion() && !(navigator.connection && navigator.connection.saveData);

const eur = (n) => '€' + Math.round(n).toLocaleString('en-IE');
const num = (n) => Math.round(n).toLocaleString('en-IE');

function Tick() {
  return <svg className="tick" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 4.8" /></svg>;
}

function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size * 26 / 30} viewBox="0 0 30 26" aria-hidden="true">
      <path d="M0 0h14l4 4-4 4H0z" fill="#00965A" />
      <path d="M0 9h19l4 4-4 4H0z" fill="#4CAF4A" />
      <path d="M0 18h24l4 4-4 4H0z" fill="#B8D333" />
    </svg>
  );
}

const BER_COLOURS = {
  A: ['var(--ber-a)', '#fff'],
  B: ['var(--ber-b)', 'var(--ink)'],
  C: ['var(--ber-c)', 'var(--ink)'],
  D: ['var(--ber-d)', 'var(--ink)'],
  E: ['var(--ber-e)', 'var(--ink)'],
  F: ['var(--ber-f)', '#fff'],
  G: ['var(--ber-g)', '#fff']
};
function berStyle(rating) {
  if (!rating) return null;
  const pair = BER_COLOURS[rating[0]];
  return pair ? { '--c': pair[0], '--t': pair[1] } : null;
}

/* ======================================================================
   Video (stock footage streamed from Pexels, credited in the footer)
   ====================================================================== */

const PX = 'https://videos.pexels.com/video-files/';
const PI = 'https://images.pexels.com/videos/';
const POSTER_L = '?auto=compress&cs=tinysrgb&w=1440';
const POSTER_M = '?auto=compress&cs=tinysrgb&w=750';

const REEL = [
  { label: 'Lifting panels onto the roof', src: PX + '8853491/8853491-hd_1280_720_24fps.mp4', poster: PI + '8853491/adult-alternative-appoint-architecture-8853491.jpeg' + POSTER_L },
  { label: 'Fixing panels to the rails', src: PX + '8853490/8853490-hd_1280_720_24fps.mp4', poster: PI + '8853490/adult-appoint-building-construction-8853490.jpeg' + POSTER_L },
  { label: 'Securing the array', src: PX + '8853529/8853529-hd_1280_720_24fps.mp4', poster: PI + '8853529/adult-appoint-architecture-builder-8853529.jpeg' + POSTER_L },
  { label: 'The finished roof', src: PX + '9790190/9790190-hd_1280_720_30fps.mp4', poster: PI + '9790190/4-k-aerial-shot-alternative-alternative-energy-9790190.jpeg' + POSTER_L }
];

const CLIPS = {
  solar: { src: PX + '8853485/8853485-sd_960_540_24fps.mp4', poster: PI + '8853485/action-adult-airplane-appoint-8853485.jpeg' + POSTER_M },
  heatPump: { src: PX + '35999366/15264817_960_540_60fps.mp4', poster: PI + '35999366/pexels-photo-35999366.jpeg' + POSTER_M },
  insulation: { src: PX + '31466248/13416696_960_540_25fps.mp4', poster: PI + '31466248/builder-construction-nailgun-31466248.jpeg' + POSTER_M },
  windows: { src: PX + '32078278/13674011_960_540_60fps.mp4', poster: PI + '32078278/air-sealing-window-airtight-window-close-closing-double-pane-window-closing-glass-window-32078278.jpeg' + POSTER_M },
  led: { src: PX + '5391403/5391403-sd_960_540_30fps.mp4', poster: PI + '5391403/pexels-photo-5391403.jpeg' + POSTER_M },
  smartControls: { src: PX + '39857556/17001946_960_540_24fps.mp4', poster: PI + '39857556/action-adjusting-appliance-closeup-39857556.jpeg' + POSTER_M },
  audit: { src: PX + '29296279/12633832_1280_720_24fps.mp4', poster: PI + '29296279/inspection-29296279.jpeg' + POSTER_L }
};

function useInView(ref, threshold) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return inView;
}

function startVideo(v) {
  if (!v) return;
  v.muted = true;
  const p = v.play();
  if (p && p.catch) p.catch(() => {});
}

const PlayIcon = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2v12l10-6z" /></svg>;
const PauseIcon = () => <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 2h3.5v12H3zM9.5 2H13v12H9.5z" /></svg>;

// A short muted loop that plays only while it is on screen
function LoopVideo({ clip, label }) {
  const box = useRef(null);
  const vid = useRef(null);
  const inView = useInView(box, 0.35);
  const [wantPlay, setWantPlay] = useState(canAutoplay);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (inView && wantPlay) startVideo(vid.current);
    else if (vid.current) vid.current.pause();
  }, [inView, wantPlay]);

  const toggle = () => {
    if (playing) { setWantPlay(false); vid.current.pause(); }
    else { setWantPlay(true); startVideo(vid.current); }
  };

  return (
    <div className="clip" ref={box}>
      <video ref={vid} src={clip.src} poster={clip.poster} muted loop playsInline preload="none" aria-hidden="true"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button type="button" className="vid-toggle" onClick={toggle} aria-label={`${playing ? 'Pause' : 'Play'} ${label} video`}>
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
    </div>
  );
}

// Four solar clips played in order, with a chapter bar under each
function InstallReel() {
  const box = useRef(null);
  const vid = useRef(null);
  const fills = useRef([]);
  const inView = useInView(box, 0.4);
  const [idx, setIdx] = useState(0);
  const [wantPlay, setWantPlay] = useState(canAutoplay);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (inView && wantPlay) startVideo(vid.current);
    else if (vid.current) vid.current.pause();
  }, [inView, wantPlay, idx]);

  useEffect(() => {
    const paint = () => {
      const v = vid.current;
      const now = v && v.duration ? Math.min(1, v.currentTime / v.duration) : 0;
      fills.current.forEach((el, i) => {
        if (el) el.style.setProperty('--p', i < idx ? 1 : i > idx ? 0 : now);
      });
    };
    paint();
    if (!playing) return;
    let raf;
    const loop = () => { paint(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [idx, playing]);

  const toggle = () => {
    if (playing) { setWantPlay(false); vid.current.pause(); }
    else { setWantPlay(true); startVideo(vid.current); }
  };

  return (
    <div ref={box}>
      <div className="reel">
        <video ref={vid} src={REEL[idx].src} poster={REEL[idx].poster} muted playsInline preload="metadata"
          aria-label="Stock footage of a rooftop solar installation"
          onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
          onEnded={() => setIdx(i => (i + 1) % REEL.length)} />
        <button type="button" className="vid-toggle" onClick={toggle}>
          {playing ? <PauseIcon /> : <PlayIcon />}{playing ? 'Pause' : 'Play'}
        </button>
      </div>
      <ol className="chapters">
        {REEL.map((c, i) => (
          <li key={c.label}>
            <button type="button" className="chapter" aria-current={i === idx ? 'step' : undefined}
              onClick={() => { setWantPlay(true); setIdx(i); }}>
              <div className="chapter-track"><div className="chapter-fill" ref={el => (fills.current[i] = el)}></div></div>
              <div className="chapter-label"><b>{i + 1}</b><span>{c.label}</span></div>
            </button>
          </li>
        ))}
      </ol>
      <p className="credit">Stock footage from <a href="https://www.pexels.com/@los-muertos-crew/" target="_blank" rel="noopener">Los Muertos Crew</a> and <a href="https://www.pexels.com/@kindelmedia/" target="_blank" rel="noopener">Kindel Media</a> on Pexels, shown for illustration.</p>
    </div>
  );
}

/* ======================================================================
   Content
   ====================================================================== */

const BANDS = [
  { l: 'A', w: 34 }, { l: 'B', w: 42 }, { l: 'C', w: 50 }, { l: 'D', w: 58 },
  { l: 'E', w: 68 }, { l: 'F', w: 80 }, { l: 'G', w: 92 }
];

const SERVICES = [
  { title: 'Upgrade plan and costing', text: 'A ranked list of upgrades for your building, each with an estimated cost, energy saving and payback, so you can decide what to do now and what can wait.' },
  { title: 'Funding and tax relief', text: 'We match your plan to the SEAI grants and tax reliefs that apply, and help you prepare the applications before any work starts.' },
  { title: 'Delivery and handover', text: 'We coordinate registered installers, check the work against the design, and hand over a complete operation and maintenance file.' }
];

const MEASURES = [
  { key: 'solar', title: 'Solar PV', text: 'Tier 1 monocrystalline panels with string inverters, sized to how much power the building uses.' },
  { key: 'heatPump', title: 'Heat pumps', text: 'A+++ air-to-water units that replace gas or oil boilers and heat through your radiators.' },
  { key: 'insulation', title: 'Insulation', text: 'Wall and roof insulation laid as one continuous layer to cut heat loss and thermal bridging.' },
  { key: 'windows', title: 'Windows and doors', text: 'Triple glazing with a low-E coating and argon fill, rated at a U-value of 1.0 or better.' },
  { key: 'led', title: 'LED lighting', text: 'A full LED retrofit with daylight and occupancy sensors, so lights only run when they are needed.' },
  { key: 'smartControls', title: 'Smart controls', text: 'Heating and lighting controls set around how the building is actually used, room by room.' }
];

const PHASES = [
  { n: 1, title: 'Survey and design', weeks: '4 to 6 weeks', s: 0, d: 5, text: 'We audit the building, model the options and agree the scope and budget with you.' },
  { n: 2, title: 'Funding and procurement', weeks: '2 to 3 weeks', s: 5, d: 2.5, text: 'Grant applications go in, equipment is ordered and permits are in place before work starts.' },
  { n: 3, title: 'Installation and commissioning', weeks: '6 to 8 weeks', s: 7.5, d: 7, text: 'Registered installers fit each upgrade and every system is commissioned on site.' },
  { n: 4, title: 'Testing and handover', weeks: '1 to 2 weeks', s: 14.5, d: 1.5, text: 'Systems are checked against the design and you receive the full operation and maintenance file.' }
];

const SCHEMES = [
  {
    name: 'Energy audit voucher',
    key: '€2,000 towards an energy audit',
    text: 'For SMEs that spend at least €10,000 a year on energy at the site and use less than 2.8 GWh a year. The audit must be carried out by an SEAI registered energy auditor taking part in the scheme.',
    url: 'https://www.seai.ie/grants/business-grants/energy-audits'
  },
  {
    name: 'Non-Domestic Microgen grant',
    key: 'Up to 45% of the cost of business solar PV',
    text: 'Covers systems from 1 kWp to 1,000 kWp, up to €325,200. The 45% rate applies to new applications from 6 October 2026 to 6 July 2027. You need an SEAI registered installer and a letter of offer before work starts.',
    url: 'https://www.seai.ie/grants/business-grants/commercial-solar-pv'
  },
  {
    name: 'Business energy upgrades',
    key: 'Grants for a range of business upgrades',
    text: 'Open to all business types. The standard route pays a fixed amount based on your business type and floor area, and a tailored route pays a share of the investment for larger projects.',
    url: 'https://www.seai.ie/grants/business-grants/rapid-approval'
  },
  {
    name: 'EXEED grant',
    key: 'Design and capital support for large energy users',
    text: 'Aimed at organisations using more than about 100,000 kWh a year, for new builds, major renovations and major plant upgrades designed to the EXEED standard.',
    url: 'https://www.seai.ie/grants/business-grants/exeed-certified-grant/'
  },
  {
    name: 'Accelerated Capital Allowance',
    key: '100% tax write-off in year one',
    text: 'Equipment listed on SEAI’s Triple E register can be deducted from profits in the year you buy it, instead of over eight years. The scheme runs to 31 December 2030.',
    url: 'https://www.seai.ie/grants/business-grants/accelerated-capital-allowance'
  }
];

const PRINCIPLES = [
  { title: 'Numbers before commitments', text: 'Every recommendation comes with an estimated cost, saving and payback, so you can see what each upgrade is worth before you spend anything.' },
  { title: 'Upgrades in the right order', text: 'We look at the building fabric and controls before new plant, so heat pumps and solar arrays are sized for the building you will have, not the one you have now.' },
  { title: 'Funding sorted before work starts', text: 'Most grant schemes will not pay for work that has already begun, so applications are part of the plan from day one.' }
];

const SECTORS = ['Offices', 'Retail', 'Industrial and warehouses', 'Hotels and hospitality', 'Healthcare', 'Schools and colleges'];

const BUILDING_TYPES = [
  'Commercial office', 'Retail or shopping centre', 'Industrial facility', 'Warehouse or distribution',
  'Hotel or hospitality', 'Healthcare facility', 'School or college', 'Mixed use', 'Other'
];

/* ======================================================================
   Home page
   ====================================================================== */

function RatingLadder() {
  return (
    <figure className="ladder-fig">
      <div className="ladder-end ladder-end-top">Most efficient</div>
      <div className="ladder" role="img" aria-label="Building Energy Rating scale from A to G, showing an example building rated D2 today with a target of A2 after a retrofit.">
        {BANDS.map((b, i) => (
          <div className="ladder-row" key={b.l}>
            <div className="ber" style={{ ...berStyle(b.l), '--w': b.w + '%', '--i': i }}>{b.l}</div>
          </div>
        ))}
        <div className="marker marker-now" aria-hidden="true"><small>Today</small><strong>D2</strong></div>
        <div className="marker marker-target" aria-hidden="true"><small>Target</small><strong>A2</strong></div>
      </div>
      <div className="ladder-end ladder-end-bottom">Least efficient</div>
      <figcaption className="ladder-caption">Building Energy Rating scale. The example is illustrative: your audit sets the real starting point and the target.</figcaption>
    </figure>
  );
}

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div>
          <h1 id="hero-title">Take your building from D to A.</h1>
          <p className="hero-lede">EcoRetrofit24 plans energy upgrades for commercial buildings. We find where your building wastes energy, cost the upgrades worth making, and line up the grants and tax relief that apply.</p>
          <div className="hero-actions">
            <a className="btn btn-ink" href="#contact">Request an energy audit</a>
            <a className="btn btn-line" href="#estimate">Get an instant estimate</a>
          </div>
          <ul className="hero-points">
            <li><Tick />Costed upgrade plan</li>
            <li><Tick />SEAI grant support</li>
            <li><Tick />Managed to handover</li>
          </ul>
        </div>
        <RatingLadder />
      </div>
    </section>
  );
}

function Services() {
  return (
    <section className="section section-surface" id="services" aria-labelledby="services-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="services-title">What we do</h2>
          <p>We take a commercial building from first survey to finished upgrade, with one plan that covers the work, the costs and the funding.</p>
        </div>

        <div className="feature">
          <div>
            <div className="service-num">1</div>
            <h3>Energy audit</h3>
            <p>A site survey of how your building uses energy, where heat escapes and which systems are past their best. It is the starting point for every project.</p>
            <ul className="checklist">
              <li><Tick /><span>Thermal imaging of walls, roof and glazing</span></li>
              <li><Tick /><span>Review of 12 months of energy bills and meter data</span></li>
              <li><Tick /><span>Heating, lighting and controls checked on site</span></li>
              <li><Tick /><span>Written report with prioritised recommendations</span></li>
            </ul>
          </div>
          <figure className="feature-fig">
            <LoopVideo clip={CLIPS.audit} label="Thermal imaging" />
            <figcaption>A thermal camera shows where heat escapes through walls and windows.</figcaption>
          </figure>
        </div>

        <div className="services">
          {SERVICES.map((s, i) => (
            <div className="service" key={s.title}>
              <div className="service-num">{i + 2}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Upgrades() {
  return (
    <section className="section" aria-labelledby="upgrades-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="upgrades-title">The upgrades we plan</h2>
          <p>Every building is different, so the audit decides the mix. Solar PV is often the quickest win on a flat commercial roof.</p>
        </div>
        <InstallReel />
        <div className="measures">
          {MEASURES.map(m => (
            <div className="measure" key={m.key}>
              <LoopVideo clip={CLIPS[m.key]} label={m.title} />
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Process() {
  return (
    <section className="section section-surface" id="process" aria-labelledby="process-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="process-title">How a project runs</h2>
          <p>Four phases, usually 13 to 19 weeks from the first survey to handover, depending on the size of the building and the upgrades chosen.</p>
        </div>
        <div className="gantt">
          {PHASES.map(ph => (
            <div className="g-row" key={ph.n}>
              <div className="g-text">
                <div className="g-title"><span className="g-num">{ph.n}</span><h3>{ph.title}</h3></div>
                <p>{ph.text}</p>
              </div>
              <div className="g-chart">
                <div className="g-track">
                  <div className="g-bar" style={{ '--s': ph.s, '--d': ph.d }}>
                    <span className="g-weeks">{ph.weeks}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="g-row g-axis" aria-hidden="true">
            <div></div>
            <div className="g-scale">
              {[0, 4, 8, 12, 16, 20].map(n => (
                <span key={n} style={{ left: (n / 20 * 100) + '%' }}>{n === 20 ? '20 weeks' : n}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Funding() {
  return (
    <section className="section" id="funding" aria-labelledby="funding-title">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" id="funding-title">Grants and tax relief</h2>
          <p>Several SEAI schemes can bring the cost of a retrofit down. Which ones apply depends on your business, your energy use and the upgrades you choose.</p>
        </div>
        <div className="schemes">
          {SCHEMES.map(s => (
            <div className="scheme" key={s.name}>
              <div>
                <h3>{s.name}</h3>
                <div className="scheme-key">{s.key}</div>
              </div>
              <p>{s.text}</p>
              <a className="link link-ext" href={s.url} target="_blank" rel="noopener" aria-label={`${s.name} on the SEAI website (opens in a new tab)`}>SEAI details</a>
            </div>
          ))}
        </div>
        <p className="note">Summaries checked against SEAI and Revenue guidance in October 2026. Scheme rules and rates change, so always confirm the current terms before you apply. This is general information, not tax advice.</p>
      </div>
    </section>
  );
}

function About() {
  return (
    <section className="section section-surface" id="about" aria-labelledby="about-title">
      <div className="wrap">
        <div className="about">
          <div className="about-text">
            <h2 className="h2" id="about-title">About EcoRetrofit24</h2>
            <p>EcoRetrofit24 helps owners, landlords and facility managers cut the energy use of commercial buildings and improve their Building Energy Rating.</p>
            <p>The company was founded by Waqar Lund to make retrofits easier to plan and easier to fund, with clear numbers at every step.</p>
          </div>
          <div className="principles">
            {PRINCIPLES.map(p => (
              <div className="principle" key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="sectors">
          <h3>Buildings we work on</h3>
          <ul className="sector-list">
            {SECTORS.map(s => <li key={s}>{s}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Field({ label, optional, hint, error, full, children }) {
  return (
    <label className={`field ${full ? 'field-full' : ''}`}>
      <span className="field-label">{label}{optional && <span className="opt">(optional)</span>}</span>
      {children}
      {error ? <span className="field-error">{error}</span> : hint ? <span className="field-hint">{hint}</span> : null}
    </label>
  );
}

function ContactForm() {
  const [f, setF] = useState({ name: '', company: '', email: '', phone: '', building: '', area: '', message: '' });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (!f.name.trim()) err.name = 'Enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) err.email = 'Enter an email address, like name@company.ie';
    if (!f.message.trim()) err.message = 'Tell us a little about the building';
    setErrors(err);
    if (Object.keys(err).length) return;

    const subject = `Energy audit enquiry${f.company ? ': ' + f.company : ''}`;
    const body = [
      `Name: ${f.name}`,
      f.company ? `Company: ${f.company}` : null,
      `Email: ${f.email}`,
      f.phone ? `Phone: ${f.phone}` : null,
      f.building ? `Building type: ${f.building}` : null,
      f.area ? `Floor area: ${f.area} m²` : null,
      '',
      f.message
    ].filter(x => x !== null).join('\n');
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <form className="panel" onSubmit={submit} noValidate aria-label="Enquiry form">
      <div className="fields">
        <Field label="Your name" error={errors.name}>
          <input className="input" autoComplete="name" value={f.name} onChange={set('name')} aria-invalid={!!errors.name} />
        </Field>
        <Field label="Company" optional>
          <input className="input" autoComplete="organization" value={f.company} onChange={set('company')} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="input" type="email" autoComplete="email" value={f.email} onChange={set('email')} aria-invalid={!!errors.email} />
        </Field>
        <Field label="Phone" optional>
          <input className="input" type="tel" autoComplete="tel" value={f.phone} onChange={set('phone')} />
        </Field>
        <Field label="Building type" optional>
          <select className="input" value={f.building} onChange={set('building')}>
            <option value="">Select a type</option>
            {BUILDING_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Floor area (m²)" optional>
          <input className="input" type="number" min="0" inputMode="numeric" value={f.area} onChange={set('area')} />
        </Field>
        <Field label="About the building" error={errors.message} full>
          <textarea className="input" value={f.message} onChange={set('message')} aria-invalid={!!errors.message}
            placeholder="Where it is, how it is heated, roughly what you spend on energy, and what you would like to improve" />
        </Field>
      </div>
      <div className="form-foot">
        <button type="submit" className="btn btn-ink">Email your enquiry</button>
        <p>This opens your email app with your details filled in. Nothing is sent until you press send.</p>
      </div>
      {sent && (
        <div className="status" role="status">
          <strong>Your email app should now be open</strong>
          If it didn’t open, email us directly at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
        </div>
      )}
    </form>
  );
}

function Contact() {
  return (
    <section className="section contact" id="contact" aria-labelledby="contact-title">
      <div className="wrap contact-grid">
        <div className="contact-intro">
          <h2 className="h2" id="contact-title">Tell us about your building</h2>
          <p>Send a few details and we will come back to you about an energy audit and the next steps for your building.</p>
          <a className="contact-mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <ol className="contact-steps">
            <li>We reply to arrange a call about the building.</li>
            <li>We visit the site and carry out the energy audit.</li>
            <li>You receive a costed upgrade plan with the funding that applies.</li>
          </ol>
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Upgrades />
      <Process />
      <Funding />
      <About />
      <Contact />
    </>
  );
}

/* ======================================================================
   Estimate calculator (shared by the on-page summary and the PDF)
   ====================================================================== */

const MEASURE_OPTIONS = [
  ['solar', 'Solar PV'],
  ['heatPump', 'Heat pump'],
  ['insulation', 'Insulation'],
  ['windows', 'Windows and doors'],
  ['led', 'LED lighting'],
  ['smartControls', 'Smart controls']
];

const CO2_KG_PER_KWH = 0.233;
const SOLAR_YIELD = 900; // kWh per kWp per year, typical for Ireland

// SEAI Non-Domestic Microgen grant table for applications from 6 Oct 2026 to 6 Jul 2027
function microgenGrantTable(kwp) {
  const k = Math.min(1000, Math.max(0, Math.floor(kwp)));
  if (k <= 0) return 0;
  if (k === 1) return 1800;
  if (k === 2) return 3600;
  if (k === 3) return 4200;
  if (k <= 6) return 4800;
  if (k <= 20) return 4800 + (k - 6) * 600;
  if (k <= 200) return 13200 + (k - 20) * 400;
  return 85200 + (k - 200) * 300;
}

function heatPumpSaving(heating) {
  if (heating === 'Electric') return 0.25;
  if (heating === 'Natural gas' || heating === 'Oil') return 0.2;
  return 0.05;
}

function calcEstimate(f) {
  const area = parseFloat(f.floorArea);
  const kwh = parseFloat(f.annualKwh);
  const bill = parseFloat(f.currentEnergyCost);
  const ready = area > 0 && kwh > 0 && bill > 0;
  const chosen = MEASURE_OPTIONS.filter(([k]) => f.measures[k]).map(([k]) => k);
  if (!ready || chosen.length === 0) return { ready: false, chosen };

  const solarKw = Math.max(8, Math.round(area / 50));
  const heatPumpKw = Math.max(6, Math.round(area / 15));
  const insulationArea = Math.round(area * 1.3);
  const solarGen = solarKw * SOLAR_YIELD;

  const catalogue = {
    solar: { label: `Solar PV system, ${solarKw} kWp`, basis: `€1,500 per kWp`, cost: solarKw * 1500, saving: Math.min(0.3, solarGen / kwh), install: true },
    heatPump: { label: `Air-to-water heat pump, ${heatPumpKw} kW`, basis: `€900 per kW`, cost: heatPumpKw * 900, saving: heatPumpSaving(f.heatingType), install: true },
    insulation: { label: `Wall and roof insulation, ${num(insulationArea)} m²`, basis: `€40 per m²`, cost: insulationArea * 40, saving: 0.15, install: true },
    windows: { label: 'Triple-glazed windows and doors', basis: `€200 per m² of floor area`, cost: area * 200, saving: 0.06 },
    led: { label: 'LED lighting with sensors', basis: `€18 per m² of floor area`, cost: area * 18, saving: 0.06 },
    smartControls: { label: 'Smart heating and lighting controls', basis: 'Fixed allowance', cost: 3500, saving: 0.08 }
  };

  const lines = chosen.map(k => ({ key: k, ...catalogue[k] }));
  const installBase = lines.filter(l => l.install).reduce((s, l) => s + l.cost, 0);
  const installation = Math.round(installBase * 0.15);
  const total = lines.reduce((s, l) => s + l.cost, 0) + installation;

  const solarInvoiced = f.measures.solar ? catalogue.solar.cost * 1.15 : 0;
  const solarGrant = f.measures.solar ? Math.min(microgenGrantTable(solarKw), solarInvoiced * 0.45) : 0;
  const otherPct = Math.min(100, Math.max(0, parseFloat(f.grantPct) || 0));
  const otherGrant = (total - solarInvoiced) * otherPct / 100;
  const grants = solarGrant + otherGrant;
  const net = Math.max(0, total - grants);

  const remaining = lines.reduce((r, l) => r * (1 - l.saving), 1);
  const savingPct = Math.min(0.6, 1 - remaining);
  const annualSaving = bill * savingPct;
  const kwhSaved = kwh * savingPct;
  const payback = annualSaving > 0 ? net / annualSaving : null;
  const co2Tonnes = kwhSaved * CO2_KG_PER_KWH / 1000;

  return {
    ready: true, chosen, lines, installation, total, solarKw, solarGen, solarGrant, otherPct, otherGrant, grants, net,
    savingPct, annualSaving, kwhSaved, payback, co2Tonnes, area, kwh, bill, intensity: kwh / area
  };
}

/* ======================================================================
   PDF report
   ====================================================================== */

let jspdfPromise = null;
function loadJsPDF() {
  if (window.jspdf) return Promise.resolve(window.jspdf);
  if (!jspdfPromise) {
    jspdfPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = JSPDF_URL;
      s.onload = () => resolve(window.jspdf);
      s.onerror = () => { jspdfPromise = null; reject(new Error('Could not load the PDF library')); };
      document.head.appendChild(s);
    });
  }
  return jspdfPromise;
}

async function buildPdf(f, est) {
  const { jsPDF } = await loadJsPDF();
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  // The built-in PDF fonts have no superscript 2, so write square metres out
  const fix = (t) => Array.isArray(t) ? t.map(fix) : typeof t === 'string' ? t.replace(/ ?m²/g, ' sq m') : t;
  const rawText = doc.text.bind(doc), rawSplit = doc.splitTextToSize.bind(doc);
  doc.text = (t, ...rest) => rawText(fix(t), ...rest);
  doc.splitTextToSize = (t, ...rest) => rawSplit(fix(t), ...rest);
  const W = 210, M = 18, R = W - M;
  const INK = [18, 48, 42], INK2 = [61, 81, 75], MUTED = [102, 119, 114], LINE = [210, 219, 215], SOFT = [227, 241, 233];
  const today = new Date();
  const ref = 'ER24-' + today.toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 900) + 100);
  const company = f.companyName.trim() || 'Your company';
  let y = 0;

  const color = (c) => doc.setTextColor(c[0], c[1], c[2]);
  const font = (size, style = 'normal', c = INK) => { doc.setFont('helvetica', style); doc.setFontSize(size); color(c); };
  const rule = (yy, c = LINE, w = 0.3) => { doc.setDrawColor(c[0], c[1], c[2]); doc.setLineWidth(w); doc.line(M, yy, R, yy); };
  const ensure = (h) => { if (y + h > 272) { doc.addPage(); y = 22; } };
  const heading = (text) => {
    ensure(22);
    y += 6;
    font(13, 'bold');
    doc.text(text, M, y);
    y += 3;
    rule(y, INK, 0.5);
    y += 7;
  };
  const para = (text, size = 10, c = INK2, gap = 5) => {
    font(size, 'normal', c);
    const lines = doc.splitTextToSize(text, R - M);
    ensure(lines.length * gap + 2);
    doc.text(lines, M, y);
    y += lines.length * gap;
  };
  const kvRows = (rows) => {
    rows.forEach(([k, v]) => {
      const vLines = doc.splitTextToSize(String(v), 100);
      ensure(vLines.length * 5 + 3);
      font(9.5, 'normal', MUTED); doc.text(k, M, y);
      font(10, 'normal', INK); doc.text(vLines, M + 62, y);
      y += vLines.length * 5 + 1.6;
    });
  };
  const moneyRow = (label, value, opts = {}) => {
    ensure(8);
    font(opts.size || 10, opts.bold ? 'bold' : 'normal', opts.color || INK);
    doc.text(label, M + (opts.indent || 0), y);
    if (opts.basis) { font(9, 'normal', MUTED); doc.text(opts.basis, M + 104, y); font(opts.size || 10, opts.bold ? 'bold' : 'normal', opts.color || INK); }
    doc.text(value, R, y, { align: 'right' });
    y += opts.after || 6.5;
  };

  // Header band and logo
  doc.setFillColor(INK[0], INK[1], INK[2]);
  doc.rect(0, 0, W, 40, 'F');
  [[0, 14, [0, 150, 90]], [4.5, 19, [76, 175, 74]], [9, 24, [184, 211, 51]]].forEach(([dy, w, c]) => {
    const bx = M, by = 11 + dy, h = 3.6, s = w * 0.22;
    doc.setFillColor(c[0], c[1], c[2]);
    doc.rect(bx, by, s, h, 'F');
    doc.triangle(bx + s, by, bx + s + 1.8, by + h / 2, bx + s, by + h, 'F');
  });
  font(11, 'bold', [255, 255, 255]); doc.text('EcoRetrofit24', M + 9, 15);
  font(20, 'bold', [255, 255, 255]); doc.text('Retrofit project estimate', M, 31);
  font(9, 'normal', [196, 211, 205]);
  doc.text(`Reference ${ref}`, R, 15, { align: 'right' });
  doc.text(today.toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' }), R, 20.5, { align: 'right' });

  y = 52;
  font(15, 'bold'); doc.text(company, M, y);
  y += 6.5;
  font(10, 'normal', INK2);
  doc.text(`${f.buildingType || 'Commercial building'}, ${num(est.area)} m²`, M, y);
  y += 10;

  // Key figures
  const boxes = [
    ['Estimated cost', eur(est.total)],
    ['After grants', eur(est.net)],
    ['Annual saving', eur(est.annualSaving)],
    ['Simple payback', est.payback ? `${est.payback.toFixed(1)} years` : 'n/a']
  ];
  const bw = (R - M - 3 * 4) / 4;
  boxes.forEach(([label, value], i) => {
    const bx = M + i * (bw + 4);
    doc.setFillColor(SOFT[0], SOFT[1], SOFT[2]);
    doc.roundedRect(bx, y, bw, 22, 1.5, 1.5, 'F');
    font(8.5, 'normal', INK2); doc.text(label, bx + 4, y + 7);
    font(14, 'bold'); doc.text(value, bx + 4, y + 16);
  });
  y += 30;
  font(8.5, 'normal', MUTED);
  doc.text(doc.splitTextToSize('Indicative figures based on the details provided and typical installed costs. Not a quotation. A site survey is needed to confirm the scope, costs and savings.', R - M), M, y);
  y += 10;

  // 1. Building
  heading('1. Client and building');
  kvRows([
    ['Company', company],
    ['Contact', f.contactPerson || 'Not provided'],
    ['Email', f.email || 'Not provided'],
    ['Site address', f.address || 'Not provided'],
    ['Building type', f.buildingType || 'Not provided'],
    ['Floor area', `${num(est.area)} m²`],
    ['Year built', f.yearBuilt || 'Not provided'],
    ['Floors', f.floors || 'Not provided'],
    ['Current BER', f.berRating || 'Not provided'],
    ['Main heating', f.heatingType || 'Not provided'],
    ['Annual energy use', `${num(est.kwh)} kWh (${num(est.intensity)} kWh per m²)`],
    ['Annual energy cost', eur(est.bill)]
  ]);

  // 2. Costs (kept together on one page)
  ensure(est.lines.length * 6.5 + 62);
  heading('2. Proposed upgrades and estimated cost');
  font(8.5, 'bold', MUTED);
  doc.text('Upgrade', M, y); doc.text('Rate used', M + 104, y); doc.text('Estimate', R, y, { align: 'right' });
  y += 2.5; rule(y); y += 5.5;
  est.lines.forEach(l => moneyRow(l.label, eur(l.cost), { basis: l.basis }));
  if (est.installation > 0) moneyRow('Installation and commissioning', eur(est.installation), { basis: '15% of main works' });
  y -= 2; rule(y); y += 6;
  moneyRow('Total estimated cost (excl. VAT)', eur(est.total), { bold: true, size: 11 });
  if (est.solarGrant > 0) moneyRow('Less SEAI Non-Domestic Microgen grant (solar PV)', '-' + eur(est.solarGrant), { color: INK2 });
  if (est.otherGrant > 0) moneyRow(`Less other grant support (${est.otherPct}% of other costs)`, '-' + eur(est.otherGrant), { color: INK2 });
  if (est.grants > 0) { y -= 2; rule(y); y += 6; moneyRow('Estimated net cost', eur(est.net), { bold: true, size: 11 }); }

  // 3. Savings
  heading('3. Savings, payback and carbon');
  kvRows([
    ['Estimated energy saving', `${Math.round(est.savingPct * 100)}% (about ${num(est.kwhSaved)} kWh a year)`],
    ['Estimated annual bill saving', eur(est.annualSaving)],
    ['Simple payback on net cost', est.payback ? `${est.payback.toFixed(1)} years` : 'n/a'],
    ['Carbon saving', `about ${est.co2Tonnes.toFixed(1)} tonnes of CO2 a year`],
    ...(f.measures.solar ? [['Solar generation', `about ${num(est.solarGen)} kWh a year`]] : [])
  ]);

  // 4. Funding
  heading('4. Grants and tax relief to check');
  const schemesForPdf = [
    ['SEAI energy audit voucher', '€2,000 towards an audit by an SEAI registered energy auditor, for SMEs spending at least €10,000 a year on energy at the site.'],
    ['SEAI Non-Domestic Microgen grant', 'Solar PV from 1 kWp to 1,000 kWp. For applications from 6 October 2026 to 6 July 2027, the lower of the SEAI table amount or 45% of the invoiced cost. A letter of offer is needed before work starts.'],
    ['SEAI Business energy upgrades', 'Fixed grants based on business type and floor area, or a share of the investment for larger tailored projects.'],
    ['SEAI EXEED grant', 'Design and capital support for larger energy users, typically using more than 100,000 kWh a year.'],
    ['Accelerated Capital Allowance', '100% of the cost of equipment on SEAI’s Triple E register can be deducted from profits in year one. Runs to 31 December 2030.']
  ];
  schemesForPdf.forEach(([name, text]) => {
    const lines = doc.splitTextToSize(text, R - M - 62);
    ensure(lines.length * 4.8 + 4);
    font(10, 'bold'); doc.text(doc.splitTextToSize(name, 58), M, y);
    font(9.5, 'normal', INK2); doc.text(lines, M + 62, y);
    y += Math.max(lines.length * 4.8, 9) + 2.5;
  });
  font(8.5, 'normal', MUTED);
  ensure(10);
  doc.text(doc.splitTextToSize('Scheme terms checked in October 2026 and subject to change. Eligibility must be confirmed with SEAI or Revenue before you apply. This is not tax advice.', R - M), M, y);
  y += 9;

  // 5. Programme and next steps
  heading('5. Programme and next steps');
  kvRows(PHASES.map(p => [`${p.n}. ${p.title}`, p.weeks]));
  y += 2;
  para('Next steps: book an energy audit so the scope, costs and savings can be confirmed on site. We will then prepare a costed upgrade plan and the grant applications that apply to your project.');
  if (f.projectNotes && f.projectNotes.trim()) { y += 3; font(10, 'bold'); ensure(10); doc.text('Your notes', M, y); y += 5.5; para(f.projectNotes.trim()); }

  // 6. Assumptions
  heading('6. How these figures are worked out');
  const assumptions = [
    `Solar PV is sized at 1 kWp per 50 m² of floor area (minimum 8 kWp) and generates about ${SOLAR_YIELD} kWh per kWp a year.`,
    'Heat pump size is 1 kW per 15 m² of floor area (minimum 6 kW). Insulation area is 1.3 times the floor area.',
    'Indicative savings by upgrade: insulation 15%, heat pump 5 to 25% depending on current heating, smart controls 8%, windows 6%, LED lighting 6%, solar up to 30%. Savings are combined so they do not double count, and capped at 60%.',
    `Bill savings use your current average energy price. Carbon uses ${CO2_KG_PER_KWH} kg of CO2 per kWh saved.`,
    'Costs exclude VAT, structural work, planning and grid connection charges.'
  ];
  assumptions.forEach(a => { para('•  ' + a, 9.5, INK2, 4.6); y += 1.5; });

  // Prepared by
  ensure(30);
  y += 6;
  doc.setFillColor(SOFT[0], SOFT[1], SOFT[2]);
  doc.roundedRect(M, y, R - M, 22, 1.5, 1.5, 'F');
  font(10, 'bold'); doc.text('EcoRetrofit24', M + 5, y + 8);
  font(9.5, 'normal', INK2);
  doc.text(`Waqar Lund, Founder  |  ${EMAIL}`, M + 5, y + 14);
  doc.text('tebaiwaqar-design.github.io/ecotech-website', M + 5, y + 19);

  // Footers
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.3); doc.line(M, 283, R, 283);
    font(8, 'normal', MUTED);
    doc.text(`EcoRetrofit24 project estimate, reference ${ref}`, M, 288);
    doc.text(`Page ${i} of ${pages}`, R, 288, { align: 'right' });
  }

  const slug = company.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '') || 'building';
  doc.save(`EcoRetrofit24-estimate-${slug}-${today.toISOString().slice(0, 10)}.pdf`);
}

/* ======================================================================
   Estimate page
   ====================================================================== */

function EstimatePage() {
  const [f, setF] = useState({
    companyName: '', contactPerson: '', email: '', address: '',
    buildingType: '', floorArea: '', yearBuilt: '', floors: '', berRating: '', heatingType: '',
    annualKwh: '', currentEnergyCost: '', grantPct: '0',
    measures: { solar: true, heatPump: true, insulation: true, windows: true, led: true, smartControls: true },
    projectNotes: ''
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState('');

  const set = (k) => (e) => setF(prev => ({ ...prev, [k]: e.target.value }));
  const toggleMeasure = (k) => (e) => setF(prev => ({ ...prev, measures: { ...prev.measures, [k]: e.target.checked } }));
  const est = useMemo(() => calcEstimate(f), [f]);
  const ber = berStyle(f.berRating);
  const maxYear = new Date().getFullYear();

  useEffect(() => { loadJsPDF().catch(() => {}); }, []);

  const generate = async () => {
    const err = {};
    if (!(parseFloat(f.floorArea) > 0)) err.floorArea = 'Enter the floor area in m²';
    if (!(parseFloat(f.annualKwh) > 0)) err.annualKwh = 'Enter your yearly energy use in kWh';
    if (!(parseFloat(f.currentEnergyCost) > 0)) err.currentEnergyCost = 'Enter your yearly energy cost in euro';
    if (est.chosen.length === 0) err.measures = 'Choose at least one upgrade';
    setErrors(err);
    setDone(false); setFailed('');
    if (Object.keys(err).length) {
      requestAnimationFrame(() => {
        const first = document.querySelector('[aria-invalid="true"], .measures-error');
        if (first) first.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        if (first && first.focus && first.tagName === 'INPUT') first.focus({ preventScroll: true });
      });
      return;
    }
    setBusy(true);
    try {
      await buildPdf(f, est);
      setDone(true);
    } catch (e) {
      console.error(e);
      setFailed('The PDF could not be created. Check your internet connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="wrap page-head">
        <h1>Project estimate</h1>
        <p>Enter a few details about your building to see indicative costs, savings and payback, then download them as a PDF. It takes about five minutes.</p>
      </div>
      <div className="wrap page-body">
        <div className="est-layout">
          <div className="panel">
            <fieldset className="fieldset">
              <legend className="fieldset-title"><span>1</span>Your building</legend>
              <div className="fields">
                <Field label="Building type" optional>
                  <select className="input" value={f.buildingType} onChange={set('buildingType')}>
                    <option value="">Select a type</option>
                    {BUILDING_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Floor area (m²)" error={errors.floorArea}>
                  <input className="input" type="number" min="1" inputMode="numeric" placeholder="e.g. 450" value={f.floorArea} onChange={set('floorArea')} aria-invalid={!!errors.floorArea} />
                </Field>
                <Field label="Year built" optional>
                  <input className="input" type="number" min="1800" max={maxYear} inputMode="numeric" placeholder="e.g. 1998" value={f.yearBuilt} onChange={set('yearBuilt')} />
                </Field>
                <Field label="Number of floors" optional>
                  <select className="input" value={f.floors} onChange={set('floors')}>
                    <option value="">Select floors</option>
                    {['1', '2', '3', '4', '5 or more'].map(n => <option key={n}>{n}</option>)}
                  </select>
                </Field>
                <Field label={<>Current BER {ber && <span className="ber-tag" style={ber}>{f.berRating}</span>}</>} optional>
                  <select className="input" value={f.berRating} onChange={set('berRating')}>
                    <option value="">Select a rating</option>
                    {['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'E1', 'E2', 'F', 'G'].map(r => <option key={r}>{r}</option>)}
                  </select>
                </Field>
                <Field label="Main heating" optional>
                  <select className="input" value={f.heatingType} onChange={set('heatingType')}>
                    <option value="">Select heating</option>
                    {['Natural gas', 'Oil', 'Electric', 'Heat pump', 'District heating', 'Biomass'].map(h => <option key={h}>{h}</option>)}
                  </select>
                </Field>
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-title"><span>2</span>Energy use</legend>
              <p className="hint">Take these from the last 12 months of electricity and fuel bills. Add all fuels together.</p>
              <div className="fields">
                <Field label="Yearly energy use (kWh)" error={errors.annualKwh}>
                  <input className="input" type="number" min="1" inputMode="numeric" placeholder="e.g. 60000" value={f.annualKwh} onChange={set('annualKwh')} aria-invalid={!!errors.annualKwh} />
                </Field>
                <Field label="Yearly energy cost (€)" error={errors.currentEnergyCost}>
                  <input className="input" type="number" min="1" inputMode="numeric" placeholder="e.g. 18000" value={f.currentEnergyCost} onChange={set('currentEnergyCost')} aria-invalid={!!errors.currentEnergyCost} />
                </Field>
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-title"><span>3</span>Upgrades to include</legend>
              <div className="chips">
                {MEASURE_OPTIONS.map(([k, label]) => (
                  <label key={k} className={`chip ${f.measures[k] ? 'is-on' : ''}`}>
                    <input type="checkbox" checked={f.measures[k]} onChange={toggleMeasure(k)} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
              {errors.measures && <p className="field-error measures-error" style={{ marginTop: 10 }}>{errors.measures}</p>}
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-title"><span>4</span>Grants</legend>
              <p className="hint">If you include solar PV, the SEAI Non-Domestic Microgen grant is worked out for you. For other upgrades, add any grant you expect as a percentage, or leave it at 0.</p>
              <div className="fields">
                <Field label="Other grant support (%)" hint="Applied to the cost of upgrades other than solar PV.">
                  <input className="input" type="number" min="0" max="100" inputMode="numeric" value={f.grantPct} onChange={set('grantPct')} />
                </Field>
              </div>
            </fieldset>

            <fieldset className="fieldset">
              <legend className="fieldset-title"><span>5</span>Your details</legend>
              <p className="hint">Optional. These only appear on your PDF.</p>
              <div className="fields">
                <Field label="Company name" optional>
                  <input className="input" autoComplete="organization" value={f.companyName} onChange={set('companyName')} />
                </Field>
                <Field label="Contact name" optional>
                  <input className="input" autoComplete="name" value={f.contactPerson} onChange={set('contactPerson')} />
                </Field>
                <Field label="Email" optional>
                  <input className="input" type="email" autoComplete="email" value={f.email} onChange={set('email')} />
                </Field>
                <Field label="Site address" optional>
                  <input className="input" autoComplete="street-address" value={f.address} onChange={set('address')} />
                </Field>
                <Field label="Notes" optional full>
                  <textarea className="input" value={f.projectNotes} onChange={set('projectNotes')} placeholder="Anything we should know, such as planned works, listed status or timing" />
                </Field>
              </div>
            </fieldset>

            <button type="button" className="btn btn-ink generate" onClick={generate} disabled={busy}>
              {busy ? 'Creating your PDF…' : 'Download PDF estimate'}
            </button>
            {done && (
              <div className="status" role="status">
                <strong>Your estimate has downloaded</strong>
                Want firm numbers? <a href="#contact">Request an energy audit</a> and we will confirm the scope on site.
              </div>
            )}
            {failed && <p className="field-error" role="alert" style={{ marginTop: 14 }}>{failed}</p>}
          </div>

          <aside className="est-aside">
            <div className="panel">
              <h2 className="summary-title">Your estimate</h2>
              <p className="summary-sub">Updates as you type</p>
              {est.ready ? (
                <dl className="figures">
                  <div className="figure figure-total"><dt>Estimated cost</dt><dd>{eur(est.total)}</dd></div>
                  {est.grants > 0 && <div className="figure"><dt>Grants</dt><dd>-{eur(est.grants)}</dd></div>}
                  {est.grants > 0 && <div className="figure"><dt>Net cost</dt><dd>{eur(est.net)}</dd></div>}
                  <div className="figure"><dt>Annual saving</dt><dd>{eur(est.annualSaving)}</dd></div>
                  <div className="figure"><dt>Simple payback</dt><dd>{est.payback ? `${est.payback.toFixed(1)} yrs` : 'n/a'}</dd></div>
                  <div className="figure"><dt>CO₂ saved a year</dt><dd>{est.co2Tonnes.toFixed(1)} t</dd></div>
                </dl>
              ) : (
                <p className="summary-empty">Enter the floor area, yearly energy use and yearly cost to see your figures.</p>
              )}
            </div>
            <div className="panel">
              <h2 className="summary-title">What’s in the PDF</h2>
              <ul className="aside-list">
                <li><Tick /><span>Cost of each upgrade and the rate used</span></li>
                <li><Tick /><span>Solar PV grant worked out from SEAI’s current rates</span></li>
                <li><Tick /><span>Savings, payback and carbon</span></li>
                <li><Tick /><span>Grants and tax relief worth checking</span></li>
                <li><Tick /><span>Every assumption, so you can check the numbers</span></li>
              </ul>
            </div>
            <p className="aside-note">Your details stay on your device. The PDF is created in your browser and nothing is sent to us.</p>
          </aside>
        </div>
      </div>
    </>
  );
}

/* ======================================================================
   App shell and routing
   ====================================================================== */

const NAV = [
  { href: '#services', label: 'Services' },
  { href: '#process', label: 'How we work' },
  { href: '#funding', label: 'Funding' },
  { href: '#about', label: 'About' },
  { href: '#estimate', label: 'Estimate tool' }
];
const SECTION_IDS = ['services', 'process', 'funding', 'about', 'contact'];
const LEGACY = { apva: 'estimate', audit: 'services', projects: '', dashboard: '', portal: '' };

function readHash() {
  let h = window.location.hash.replace('#', '');
  if (h in LEGACY) h = LEGACY[h];
  return h;
}

function App() {
  const [hash, setHash] = useState(readHash);
  const [menuOpen, setMenuOpen] = useState(false);
  const view = hash === 'estimate' ? 'estimate' : 'home';
  const prevView = useRef(view);
  const firstRun = useRef(true);

  useEffect(() => {
    const onHash = () => { setHash(readHash()); setMenuOpen(false); };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Move to the right place after a route change
  useEffect(() => {
    const switched = prevView.current !== view;
    prevView.current = view;
    if (view === 'home' && SECTION_IDS.includes(hash)) {
      if (switched || firstRun.current) {
        const go = () => {
          const el = document.getElementById(hash);
          if (el) el.scrollIntoView({ behavior: 'instant' });
        };
        requestAnimationFrame(go);
        // Fonts can shift the layout on first load, so settle the position again
        if (firstRun.current && document.fonts) document.fonts.ready.then(() => requestAnimationFrame(go));
      }
    } else if (switched) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    firstRun.current = false;
    document.title = view === 'estimate'
      ? 'Project estimate | EcoRetrofit24'
      : 'EcoRetrofit24 | Energy retrofits for commercial buildings';
  }, [hash, view]);

  const navLinks = NAV.map(n => (
    <a key={n.href} href={n.href} aria-current={n.href === '#estimate' && view === 'estimate' ? 'page' : undefined}
      onClick={() => setMenuOpen(false)}>{n.label}</a>
  ));

  return (
    <>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); const m = document.getElementById('main'); if (m) m.focus(); }}>Skip to content</a>
      <header className="topbar">
        <div className="wrap topbar-inner">
          <a className="brand" href="#" onClick={() => { setMenuOpen(false); if (view === 'home') window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }); }} aria-label="EcoRetrofit24 home">
            <Logo />
            <span className="brand-name">EcoRetrofit24</span>
          </a>
          <nav className="nav" aria-label="Main">{navLinks}</nav>
          <a className="btn btn-ink btn-sm header-cta" href="#contact">Request an audit</a>
          <button className="menu-btn" aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(o => !o)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
            {menuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        {menuOpen && (
          <nav id="mobile-nav" className="mobile-nav" aria-label="Main">
            {navLinks}
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>
        )}
      </header>

      <main id="main" tabIndex="-1">
        {view === 'estimate' ? <EstimatePage /> : <HomePage />}
      </main>

      <footer className="footer">
        <div className="wrap">
          <div className="footer-grid">
            <div>
              <div className="footer-brand"><Logo size={22} /> EcoRetrofit24</div>
              <p className="footer-about">Energy audits, costed upgrade plans and funding support for commercial buildings.</p>
            </div>
            <div>
              <h2>Explore</h2>
              <ul>
                <li><a href="#services">Services</a></li>
                <li><a href="#process">How we work</a></li>
                <li><a href="#funding">Grants and tax relief</a></li>
                <li><a href="#estimate">Estimate tool</a></li>
              </ul>
            </div>
            <div>
              <h2>Contact</h2>
              <ul>
                <li><a href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
                <li><a href="#contact">Request an energy audit</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-base">
            <span>© {new Date().getFullYear()} EcoRetrofit24. Founded by Waqar Lund.</span>
            <span>Stock video from <a href="https://www.pexels.com" target="_blank" rel="noopener">Pexels</a> by Los Muertos Crew, Kindel Media, UrbanGrid, Daniel Coetsee, Rec Everywhere, Gustavo Fring, Jakub Bukowski and Frank Schrader.</span>
          </div>
        </div>
      </footer>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
