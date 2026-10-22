import React, { useState } from 'react';

type Choice = readonly [value: string, fr: string, it: string];

type PlannerProject = {
  id: string | number;
  slug: string;
  title: string;
  thumbnail: string;
};

type EventPlannerProps = {
  language: string;
  projects: PlannerProject[];
  whatsappNumber?: string | number | null;
};

type EventDetails = {
  date: string;
  city: string;
  budget: string;
  notes: string;
};

type DetailField = {
  key: 'date' | 'city';
  title: string;
  type: 'date' | 'text';
};

export default function EventPlanner({
  language,
  projects,
  whatsappNumber,
}: EventPlannerProps) {
  const it = language === 'it';
  const tr = (fr: string, italian: string) => (it ? italian : fr);

  const [step, setStep] = useState<number>(0);
  const [kind, setKind] = useState<string>('party');
  const [mood, setMood] = useState<string>('energy');
  const [services, setServices] = useState<string[]>(['aftermovie']);
  const [details, setDetails] = useState<EventDetails>({
    date: '',
    city: '',
    budget: '',
    notes: '',
  });

  const kinds: Choice[] = [
    ['party', 'Soirée DJ', 'Serata DJ'],
    ['show', 'Showcase / concert', 'Showcase / concerto'],
    ['gala', 'Gala / événement privé', 'Gala / evento privato'],
  ];

  const moods: Choice[] = [
    ['energy', 'Énergique', 'Energico'],
    ['cinema', 'Cinématographique', 'Cinematografico'],
    ['elegant', 'Élégant', 'Elegante'],
  ];

  const offers: Choice[] = [
    ['teaser', 'Teaser promotionnel', 'Teaser promozionale'],
    ['coverage', 'Couverture vidéo', 'Riprese video'],
    ['aftermovie', 'Aftermovie', 'Aftermovie'],
    ['photo', 'Reportage photo', 'Reportage fotografico'],
    ['reels', 'Reels verticaux', 'Reel verticali'],
  ];

  const detailFields: DetailField[] = [
    { key: 'date', title: tr('Date (facultative)', 'Data (facoltativa)'), type: 'date' },
    { key: 'city', title: tr('Ville *', 'Città *'), type: 'text' },
  ];

  const label = (items: Choice[], value: string) => {
    const item = items.find((choice) => choice[0] === value);
    return item ? item[it ? 2 : 1] : value;
  };

  const refs = projects
    .filter((project) => /red cup|concours.*dj|golden|destroy/i.test(project.title))
    .sort((a, b) => {
      const re = kind === 'show' ? /golden|showcase/i : /red cup|concours.*dj/i;
      return Number(re.test(b.title)) - Number(re.test(a.title));
    })
    .slice(0, 2);

  const message = [
    tr('Bonjour Yaël ! Voici mon projet :', 'Ciao Yaël! Ecco il mio progetto:'),
    `${tr('Événement', 'Evento')} : ${label(kinds, kind)}`,
    `${tr('Ambiance', 'Atmosfera')} : ${label(moods, mood)}`,
    `${tr('Prestations', 'Servizi')} : ${services.map((service) => label(offers, service)).join(', ')}`,
    `${tr('Date', 'Data')} : ${details.date || tr('À définir', 'Da definire')}`,
    `${tr('Ville', 'Città')} : ${details.city}`,
    `${tr('Budget indicatif', 'Budget indicativo')} : ${details.budget || tr('À discuter', 'Da concordare')}`,
    details.notes,
    tr(
      'Peux-tu me confirmer ta disponibilité et me proposer un devis ?',
      'Puoi confermare la disponibilità e preparare un preventivo?',
    ),
  ]
    .filter(Boolean)
    .join('\n');

  const digits = String(whatsappNumber || '').replace(/\D/g, '');
  const valid = services.length > 0 && details.city.trim().length > 0;

  const toggle = (value: string) => {
    setServices((previous) =>
      previous.includes(value)
        ? previous.filter((item) => item !== value)
        : [...previous, value],
    );
  };

  return (
    <section id="imagine-event" className="event-planner">
      <style>{`.event-planner{background:#080808;color:white;padding:80px 24px;border-top:1px solid #ffffff20;scroll-margin-top:100px}.ep-wrap{max-width:1200px;margin:auto}.ep-kicker{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#ff3434}.event-planner h2{font-size:clamp(36px,6vw,76px);line-height:1;letter-spacing:-.05em;margin:20px 0}.ep-muted{color:#aaa;max-width:680px;line-height:1.6}.ep-progress{display:flex;gap:8px;margin:30px 0}.ep-progress span{height:3px;flex:1;background:#333}.ep-progress .on{background:#f01818}.ep-panel{border:1px solid #ffffff24;border-radius:20px;padding:clamp(20px,4vw,40px);background:linear-gradient(130deg,#1b1010,#0c0c0c)}.event-planner h3{font-size:24px;margin:0 0 22px}.ep-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.ep-choice{padding:22px 16px;border:1px solid #ffffff35;border-radius:12px;background:#111;color:white;text-align:left;cursor:pointer}.ep-choice[aria-pressed=true]{border-color:#ff2525;background:#351010;box-shadow:inset 0 0 0 1px #ff2525}.ep-choice:focus-visible,.ep-btn:focus-visible,.ep-field:focus-visible{outline:2px solid white;outline-offset:4px}.ep-actions{display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap;margin-top:30px}.ep-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:40px;padding:14px 24px;border:1px solid #ffffff40;background:transparent;color:white;cursor:pointer;text-decoration:none}.ep-primary{background:#e00;border-color:#e00}.ep-btn:disabled{opacity:.4;cursor:not-allowed}.ep-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px}.ep-fields label{display:grid;gap:8px;font-size:14px}.ep-field{width:100%;background:#080808;border:1px solid #555;color:white;border-radius:8px;padding:12px;color-scheme:dark}.ep-summary{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;line-height:1.7;color:#ddd}.ep-refs{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin:24px 0}.ep-ref{border:1px solid #333;border-radius:12px;overflow:hidden;color:white;text-decoration:none}.ep-ref img{width:100%;height:160px;object-fit:cover}.ep-ref span{display:block;padding:16px}.ep-note{font-size:12px;color:#aaa;margin-top:18px}.ep-error{color:#ff9292;font-size:14px}`}</style>

      <div className="ep-wrap">
        <p className="ep-kicker">
          LORIK.NK / {tr('Votre prochain événement', 'Il tuo prossimo evento')}
        </p>
        <h2>{tr('Imagine ton événement.', 'Immagina il tuo evento.')}</h2>
        <p className="ep-muted">
          {tr(
            'Choisis ton univers. Découvre mes références et préparons une création qui te ressemble.',
            'Scegli il tuo stile. Scopri i miei lavori e prepariamo un progetto su misura per te.',
          )}
        </p>

        <div
          className="ep-progress"
          aria-label={tr(`Étape ${step + 1} sur 4`, `Passaggio ${step + 1} di 4`)}
        >
          {[0, 1, 2, 3].map((index) => (
            <span key={index} className={index <= step ? 'on' : ''} />
          ))}
        </div>

        <div className="ep-panel">
          <div aria-live="polite">
            <p className="ep-kicker">0{step + 1} / 04</p>
            <h3>
              {[
                tr('Qu’organises-tu ?', 'Cosa stai organizzando?'),
                tr('Quelle ambiance veux-tu créer ?', 'Quale atmosfera vuoi creare?'),
                tr('De quoi as-tu besoin ?', 'Di cosa hai bisogno?'),
                tr('Ton projet, prêt à partager.', 'Il tuo progetto, pronto da condividere.'),
              ][step]}
            </h3>
          </div>

          {step === 0 && (
            <div className="ep-grid">
              {kinds.map((item) => (
                <button
                  type="button"
                  key={item[0]}
                  className="ep-choice"
                  aria-pressed={kind === item[0]}
                  onClick={() => setKind(item[0])}
                >
                  {item[it ? 2 : 1]}
                </button>
              ))}
            </div>
          )}

          {step === 1 && (
            <>
              <div className="ep-grid">
                {moods.map((item) => (
                  <button
                    type="button"
                    key={item[0]}
                    className="ep-choice"
                    aria-pressed={mood === item[0]}
                    onClick={() => setMood(item[0])}
                  >
                    {item[it ? 2 : 1]}
                  </button>
                ))}
              </div>

              <p className="ep-muted" style={{ marginTop: 24 }}>
                {tr(
                  'Quelques références pour te projeter — le style final sera défini ensemble.',
                  'Alcuni lavori per ispirarti — lo stile finale verrà definito insieme.',
                )}
              </p>

              <div className="ep-refs">
                {refs.map((project) => (
                  <a className="ep-ref" href={`#work/${project.slug}`} key={project.id}>
                    <img loading="lazy" src={project.thumbnail} alt="" />
                    <span>{project.title} ↗</span>
                  </a>
                ))}
              </div>

              {kind === 'gala' && (
                <p className="ep-note">
                  {tr(
                    'Ces références montrent mon approche événementielle ; elles ne sont pas des exemples de gala.',
                    'Questi lavori mostrano il mio approccio agli eventi; non sono esempi di gala.',
                  )}
                </p>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="ep-grid">
                {offers.map((item) => (
                  <button
                    type="button"
                    key={item[0]}
                    className="ep-choice"
                    aria-pressed={services.includes(item[0])}
                    onClick={() => toggle(item[0])}
                  >
                    {services.includes(item[0]) ? '✓ ' : '+ '}
                    {item[it ? 2 : 1]}
                  </button>
                ))}
              </div>

              <div className="ep-fields" style={{ marginTop: 28 }}>
                {detailFields.map(({ key, title, type }) => (
                  <label key={key}>
                    {title}
                    <input
                      className="ep-field"
                      type={type}
                      required={key === 'city'}
                      maxLength={100}
                      value={details[key]}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDetails({ ...details, [key]: event.target.value })
                      }
                    />
                  </label>
                ))}

                <label>
                  {tr('Budget indicatif', 'Budget indicativo')}
                  <select
                    className="ep-field"
                    value={details.budget}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      setDetails({ ...details, budget: event.target.value })
                    }
                  >
                    <option value="">{tr('À discuter', 'Da concordare')}</option>
                    {['< 300 €', '300–600 €', '600–1 000 €', '> 1 000 €'].map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label style={{ display: 'grid', gap: 8, marginTop: 18 }}>
                {tr(
                  'Quelques mots sur ton projet (facultatif)',
                  'Qualche dettaglio sul progetto (facoltativo)',
                )}
                <textarea
                  className="ep-field"
                  rows={3}
                  maxLength={1500}
                  value={details.notes}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setDetails({ ...details, notes: event.target.value })
                  }
                />
              </label>

              {!valid && (
                <p className="ep-error">
                  {tr(
                    'Choisis au moins une prestation et indique la ville.',
                    'Scegli almeno un servizio e indica la città.',
                  )}
                </p>
              )}

              <p className="ep-note">
                {tr(
                  'Le budget sert à préparer l’échange : il ne constitue pas un tarif ni une réservation.',
                  'Il budget serve a preparare il confronto: non è un prezzo né una prenotazione.',
                )}
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <div className="ep-summary">{message}</div>
              <p className="ep-note">
                {tr(
                  'Aucun message n’est envoyé automatiquement. Tu pourras le modifier dans WhatsApp avant de l’envoyer. La disponibilité reste à confirmer.',
                  'Nessun messaggio viene inviato automaticamente. Potrai modificarlo in WhatsApp prima di inviarlo. La disponibilità deve essere confermata.',
                )}
              </p>
            </>
          )}

          <div className="ep-actions">
            <button
              type="button"
              className="ep-btn"
              disabled={step === 0}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
            >
              {tr('Retour', 'Indietro')}
            </button>

            {step < 3 ? (
              <button
                type="button"
                className="ep-btn ep-primary"
                disabled={step === 2 && !valid}
                onClick={() => setStep((current) => Math.min(3, current + 1))}
              >
                {tr('Continuer', 'Continua')} →
              </button>
            ) : digits ? (
              <a
                className="ep-btn ep-primary"
                href={`https://wa.me/${digits}?text=${encodeURIComponent(message)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {tr('Préparer sur WhatsApp', 'Prepara su WhatsApp')} ↗
              </a>
            ) : (
              <a
                className="ep-btn ep-primary"
                href={`mailto:hello@yaelnoukimi.com?subject=Projet%20LORIK.NK&body=${encodeURIComponent(message)}`}
              >
                {tr('Préparer par email', 'Prepara via email')} ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
