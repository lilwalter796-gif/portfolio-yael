// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  Mail,
  Menu,
  Play,
  Scissors,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import {
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaWhatsapp,
} from 'react-icons/fa6';
import MuxPlayer from '@mux/mux-player-react';
import { supabase } from './lib/supabase';

const ACCENT = '#e10600';

const PORTFOLIO_DATA = {
  name: 'Yaël Noukimi',
  brand: 'LORIK.NK',
  shortName: 'LN',
  email: 'hello@yaelnoukimi.com',
  socials: {
    instagram: 'https://instagram.com/',
    tiktok: 'https://tiktok.com/',
    linkedin: 'https://linkedin.com/',
  },
};

const FALLBACK_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=85&w=2200&auto=format&fit=crop';

const DEFAULT_SETTINGS = {
  showreel_url: '',
  hero_title: 'DES HISTOIRES VISUELLES\nQUI PRENNENT VIE.',
  hero_roles: 'VIDÉASTE · RÉALISATEUR · CRÉATEUR DE CONTENU',
  hero_location_line: 'BASÉ À PARME · DISPONIBLE EN ITALIE ET À L’INTERNATIONAL',
  hero_primary_cta: 'TRAVAILLONS ENSEMBLE',
  hero_secondary_cta: 'PROJETS SÉLECTIONNÉS',
  about_heading:
    'Je suis Yaël Noukimi, vidéaste et directeur créatif derrière LORIK.NK.',
  about_body: [
    'Je crée des contenus audiovisuels pour les événements, les marques, les artistes et les plateformes sociales : de l’idée et du tournage jusqu’au montage, à la couleur et à la livraison finale.',
    'Mon approche est cinématographique mais concrète : chaque plan doit servir l’atmosphère, le message et la plateforme sur laquelle le contenu sera diffusé.',
    'LORIK.NK est mon univers personnel : réalisation, storytelling visuel et direction créative.',
    'J’étudie actuellement l’Ingegneria Gestionale en Italie, avec une approche qui relie créativité, technologie et business.',
  ].join('\n\n'),
  about_image_url: '',
  contact_heading: 'CRÉONS\nQUELQUE CHOSE\nDE MÉMORABLE.',
  contact_description:
    'Disponible pour des productions freelance, événements, contenus de marque et collaborations créatives.',
  contact_email: PORTFOLIO_DATA.email,
  whatsapp_number: '',
  instagram_url: PORTFOLIO_DATA.socials.instagram,
  tiktok_url: PORTFOLIO_DATA.socials.tiktok,
  linkedin_url: PORTFOLIO_DATA.socials.linkedin,
};

const IT_SETTINGS_DEFAULTS = {
  hero_title: 'STORIE VISIVE\nCHE PRENDONO VITA.',
  hero_roles: 'VIDEOMAKER · FILMMAKER · CONTENT CREATOR',
  hero_location_line: 'BASE A PARMA · DISPONIBILE IN ITALIA E ALL’ESTERO',
  hero_primary_cta: 'LAVORIAMO INSIEME',
  hero_secondary_cta: 'LAVORI SELEZIONATI',
  about_heading:
    'Sono Yaël Noukimi, filmmaker e creative director dietro LORIK.NK.',
  about_body: [
    'Creo contenuti audiovisivi per eventi, brand, artisti e piattaforme social: dall’idea e dalle riprese fino al montaggio, al colore e alla consegna finale.',
    'Il mio approccio è cinematografico ma concreto: ogni inquadratura deve servire l’atmosfera, il messaggio e la piattaforma su cui il contenuto verrà visto.',
    'LORIK.NK è il mio universo personale: filmmaking, storytelling visivo e direzione creativa.',
    'Studio Ingegneria Gestionale in Italia e porto questa visione tra creatività, tecnologia e business.',
  ].join('\n\n'),
  contact_heading: 'CREIAMO\nQUALCOSA\nDA RICORDARE.',
  contact_description:
    'Disponibile per produzioni freelance, eventi, branded content e collaborazioni creative.',
};

const UI_COPY = {
  fr: {
    nav: { work: 'projets', about: 'à propos', services: 'services', contact: 'contact' },
    available: 'Disponible pour des projets sélectionnés',
    heroFooter: 'Vidéaste / Monteur / Créateur de contenu',
    scrollWork: 'Voir les projets',
    selectedWork: 'Projets sélectionnés',
    selectedWorkTitle: 'La vidéo d’abord.\nLe reste ensuite.',
    selectedWorkDescription:
      'Une sélection de films événementiels, campagnes, contenus sociaux et histoires visuelles.',
    creativeDigital: 'Creative & Digital',
    creativeTitle: 'Au-delà du film.\nUn univers complet.',
    creativeDescription:
      'Sites web, campagnes visuelles, affiches et identités digitales qui prolongent le projet au-delà de la vidéo.',
    creativeEmpty: 'Les projets design et digitaux arrivent bientôt.',
    website: 'Site web',
    visualDesign: 'Visual Design',
    campaign: 'Campagne',
    photography: 'Photographie',
    visitSite: 'Visiter le site',
    viewCaseStudy: 'Voir le projet',
    technologies: 'Technologies',
    digitalExperience: 'Expérience digitale',
    campaignVisuals: 'Visuels de campagne',
    designGallery: 'Design sélectionné',
    loadingWork: 'Chargement des travaux sélectionnés…',
    unavailableWork: 'Les projets sont momentanément indisponibles.',
    retry: 'Réessayer',
    comingSoon: 'De nouveaux projets arrivent bientôt.',
    showreel: 'Showreel',
    showreelTitle: '60 secondes\nen mouvement.',
    playShowreel: 'Lire le showreel',
    whatIDo: 'Ce que je fais',
    servicesTitle: 'Pensé autour\nde l’image en mouvement.',
    servicesDescription:
      'La vidéo est au cœur de mon travail. La photographie et le design complètent l’histoire quand le projet le demande.',
    about: 'À propos',
    contact: 'Contact',
    based: 'Basé',
    haveProject: 'Un projet ?',
    letsTalk: 'Parlons-en.',
    backToWork: '← Retour aux projets',
    selectedWorkBack: '← Projets sélectionnés',
    projectNotFound: 'Projet introuvable.',
    project: 'Projet',
    projectDetailsSoon: 'Les détails du projet arrivent bientôt.',
    selectedFilms: 'Films sélectionnés',
    moreFromProject: 'Plus de contenus\nde ce projet.',
    additionalFilm: 'film supplémentaire',
    additionalFilms: 'films supplémentaires',
    frames: 'Images',
    nextProject: 'Projet suivant',
    previewPlaying: 'Aperçu en lecture',
    loadingPreview: 'Chargement de l’aperçu',
    viewProject: 'Voir le projet',
    playingPreview: 'Lecture',
    film: 'film',
    films: 'films',
    photoAlt: 'portrait de Yaël Noukimi',
    footerRole: 'Vidéaste · Monteur · Créateur de contenu',
    services: [
      ['01', 'Production vidéo', 'Aftermovies, films événementiels, branded content, interviews, visuels musicaux et campagnes promotionnelles.'],
      ['02', 'Post-production', 'Montage, rythme, étalonnage, sound design et déclinaisons adaptées à chaque format.'],
      ['03', 'Contenu social', 'Reels verticaux, teasers, formats courts et contenus pensés pour le mobile.'],
      ['04', 'Photographie', 'Photographie événementielle, portrait et lifestyle lorsque le projet demande un univers visuel complet.'],
    ],
    process: [
      ['01', 'Brief', 'Objectif, audience, références et livrables.'],
      ['02', 'Direction', 'Concept, langage visuel, plan de tournage et préparation de production.'],
      ['03', 'Tournage', 'Capturer le mouvement, les moments et l’atmosphère.'],
      ['04', 'Post-prod', 'Montage, couleur, son et versions pour chaque plateforme.'],
      ['05', 'Livraison', 'Exports propres pour réseaux, web, écrans ou campagnes.'],
    ],
  },
  it: {
    nav: { work: 'progetti', about: 'chi sono', services: 'servizi', contact: 'contatti' },
    available: 'Disponibile per progetti selezionati',
    heroFooter: 'Videomaker / Editor / Content Creator',
    scrollWork: 'Scopri i progetti',
    selectedWork: 'Lavori selezionati',
    selectedWorkTitle: 'Prima i film.\nTutto il resto dopo.',
    selectedWorkDescription:
      'Una selezione di film di eventi, campagne, contenuti social e storie visive.',
    creativeDigital: 'Design & Digital',
    creativeTitle: 'Oltre il film.\nUn universo completo.',
    creativeDescription:
      'Siti web, campagne visive, poster e identità digitali che estendono il progetto oltre il video.',
    creativeEmpty: 'I progetti design e digitali arriveranno presto.',
    website: 'Sito web',
    visualDesign: 'Visual Design',
    campaign: 'Campagna',
    photography: 'Fotografia',
    visitSite: 'Visita il sito',
    viewCaseStudy: 'Vedi progetto',
    technologies: 'Tecnologie',
    digitalExperience: 'Esperienza digitale',
    campaignVisuals: 'Visual di campagna',
    designGallery: 'Design selezionato',
    loadingWork: 'Caricamento dei lavori selezionati…',
    unavailableWork: 'I progetti sono momentaneamente non disponibili.',
    retry: 'Riprova',
    comingSoon: 'Nuovi progetti in arrivo.',
    showreel: 'Showreel',
    showreelTitle: '60 secondi\ndi movimento.',
    playShowreel: 'Riproduci showreel',
    whatIDo: 'Cosa faccio',
    servicesTitle: 'Costruito attorno\nall’immagine in movimento.',
    servicesDescription:
      'Il video è il centro del mio lavoro. Fotografia e design supportano la storia quando il progetto lo richiede.',
    about: 'Chi sono',
    contact: 'Contatti',
    based: 'Base',
    haveProject: 'Hai un progetto?',
    letsTalk: 'Parliamone.',
    backToWork: '← Torna ai progetti',
    selectedWorkBack: '← Lavori selezionati',
    projectNotFound: 'Progetto non trovato.',
    project: 'Progetto',
    projectDetailsSoon: 'I dettagli del progetto saranno disponibili presto.',
    selectedFilms: 'Film selezionati',
    moreFromProject: 'Altri contenuti\ndi questo progetto.',
    additionalFilm: 'film aggiuntivo',
    additionalFilms: 'film aggiuntivi',
    frames: 'Fotogrammi',
    nextProject: 'Progetto successivo',
    previewPlaying: 'Anteprima in riproduzione',
    loadingPreview: 'Caricamento anteprima',
    viewProject: 'Vedi progetto',
    playingPreview: 'In riproduzione',
    film: 'film',
    films: 'film',
    photoAlt: 'ritratto di Yaël Noukimi',
    footerRole: 'Videomaker · Editor · Content Creator',
    services: [
      ['01', 'Produzione video', 'Event film, aftermovie, branded content, interviste, visual musicali e campagne promozionali.'],
      ['02', 'Post-produzione', 'Montaggio, ritmo, color grading, sound design e versioni ottimizzate per ogni formato.'],
      ['03', 'Contenuti social', 'Reel verticali, teaser, short-form storytelling e contenuti pensati per il mobile.'],
      ['04', 'Fotografia', 'Fotografia di eventi, ritratto e lifestyle quando il progetto richiede un pacchetto visivo completo.'],
    ],
    process: [
      ['01', 'Brief', 'Obiettivi, pubblico, riferimenti e deliverable.'],
      ['02', 'Direzione', 'Concept, linguaggio visivo, shot list e preparazione della produzione.'],
      ['03', 'Riprese', 'Catturare movimento, momenti e atmosfera.'],
      ['04', 'Post', 'Montaggio, colore, audio e versioni per ogni piattaforma.'],
      ['05', 'Consegna', 'Export pronti per social, web, schermi e campagne.'],
    ],
  },
};

function localizeProject(project, language) {
  if (!project || language !== 'it') return project;

  return {
    ...project,
    category: project.category_it || project.category,
    description: project.description_it || project.description,
    roles:
      Array.isArray(project.roles_it) && project.roles_it.length > 0
        ? project.roles_it
        : project.roles,
  };
}

function LanguageSwitch({ language, onChange, compact = false }) {
  return (
    <div
      className={`notranslate flex items-center rounded-full border border-white/10 bg-white/[0.035] p-1 ${
        compact ? 'w-fit' : ''
      }`}
      aria-label="Language"
      translate="no"
      data-no-translation
    >
      {[
        ['it', 'IT'],
        ['fr', 'FR'],
      ].map(([code, label]) => (
        <button
          key={code}
          type="button"
          onClick={() => onChange(code)}
          className={`notranslate rounded-full ${
            compact ? 'px-2.5 py-2 text-[8px]' : 'px-3 py-2 text-[9px]'
          } uppercase tracking-[0.16em] transition-colors ${
            language === code
              ? 'bg-[var(--accent)] text-white'
              : 'text-white/45 hover:text-white'
          }`}
          translate="no"
          lang={code}
          aria-label={code === 'it' ? 'Italiano' : 'Français'}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const SERVICES = [
  {
    number: '01',
    title: 'Film & Video Production',
    description:
      'Event films, aftermovies, branded content, interviews, music visuals and promotional campaigns.',
    icon: Video,
  },
  {
    number: '02',
    title: 'Post-production',
    description:
      'Editing, pacing, color grading, sound design and platform-ready versions for every format.',
    icon: Scissors,
  },
  {
    number: '03',
    title: 'Social Content',
    description:
      'Vertical reels, teasers, short-form stories and content designed to perform on mobile.',
    icon: Sparkles,
  },
  {
    number: '04',
    title: 'Photography',
    description:
      'Event, portrait and lifestyle photography when a project needs a complete visual package.',
    icon: Camera,
  },
];

const PROCESS = [
  ['01', 'Brief', 'Objective, audience, references and deliverables.'],
  ['02', 'Direction', 'Concept, visual language, shot plan and production setup.'],
  ['03', 'Shoot', 'Capture with an emphasis on movement, moments and atmosphere.'],
  ['04', 'Post', 'Edit, color, sound and versions for each platform.'],
  ['05', 'Deliver', 'Clean exports ready for social, web, screens or campaigns.'],
];

const PROJECTS_CACHE_KEY = 'yn-portfolio-projects-v2';

function readCachedProjects() {
  try {
    const cached = JSON.parse(localStorage.getItem(PROJECTS_CACHE_KEY) || '[]');
    return Array.isArray(cached) ? cached : [];
  } catch {
    return [];
  }
}

function writeCachedProjects(projects) {
  try {
    localStorage.setItem(PROJECTS_CACHE_KEY, JSON.stringify(projects));
  } catch {
    // Safari private mode / storage limitations: ignore and keep the network data.
  }
}

function cleanRoleLabel(value = '') {
  return String(value)
    .trim()
    .replace(/^[\s·•|/—–-]+/, '')
    .replace(/[\s·•|/—–-]+$/, '')
    .replace(/\s*[·•|]\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanRoleList(values) {
  return Array.isArray(values)
    ? values.map(cleanRoleLabel).filter(Boolean)
    : [];
}

function isRealLinkedInProfile(url = '') {
  if (!url) return false;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, '');

    if (!host.endsWith('linkedin.com')) return false;

    // Ignore LinkedIn home/login/share URLs. Show the icon only for a real
    // profile/company-style destination configured by the user.
    return (
      /^\/in\/[^/]+/i.test(path) ||
      /^\/company\/[^/]+/i.test(path) ||
      /^\/school\/[^/]+/i.test(path)
    );
  } catch {
    return false;
  }
}

function normalizeProject(project) {
  const databaseVideos = Array.isArray(project.project_videos)
    ? [...project.project_videos].sort(
        (a, b) =>
          Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) ||
          String(a.created_at ?? '').localeCompare(String(b.created_at ?? '')),
      )
    : [];

  const legacyVideos =
    databaseVideos.length === 0 && project.video_url
      ? [
          {
            id: `legacy-${project.id}`,
            title: 'Main Film',
            video_url: project.video_url,
            video_type: 'Main Film',
            orientation: 'horizontal',
            is_featured: true,
            sort_order: 0,
          },
        ]
      : [];

  const videos = databaseVideos.length > 0 ? databaseVideos : legacyVideos;
  const featuredVideo =
    videos.find((video) => video.is_featured) || videos[0] || null;

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    category: project.category ?? '',
    category_it: project.category_it ?? '',
    project_type: project.project_type || 'film',
    project_types:
      Array.isArray(project.project_types) && project.project_types.length > 0
        ? project.project_types
        : [project.project_type || 'film'],
    website_url: project.website_url ?? '',
    technologies: Array.isArray(project.technologies) ? project.technologies : [],
    year: project.year ? String(project.year) : '',
    location: project.location ?? '',
    thumbnail: project.thumbnail_url || FALLBACK_PROJECT_IMAGE,
    previewVideo: project.preview_video_url || '',
    video: featuredVideo?.video_url || '',
    orientation: featuredVideo?.orientation || 'horizontal',
    videos,
    description: project.description ?? '',
    description_it: project.description_it ?? '',
    roles: cleanRoleList(project.roles),
    roles_it: cleanRoleList(project.roles_it),
    gallery: Array.isArray(project.gallery) ? project.gallery : [],
  };
}

function muxPlaybackId(url = '') {
  return typeof url === 'string' && url.startsWith('mux://')
    ? url.replace('mux://', '').trim()
    : '';
}

function getYouTubeEmbedUrl(url = '') {
  try {
    const parsed = new URL(url);
    let id = '';

    if (parsed.hostname.includes('youtu.be')) {
      id = parsed.pathname.replace('/', '');
    } else if (parsed.hostname.includes('youtube.com')) {
      if (parsed.pathname.startsWith('/embed/')) {
        id = parsed.pathname.split('/embed/')[1]?.split('/')[0] || '';
      } else if (parsed.pathname.startsWith('/shorts/')) {
        id = parsed.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      } else {
        id = parsed.searchParams.get('v') || '';
      }
    }

    return id ? `https://www.youtube.com/embed/${id}` : '';
  } catch {
    return '';
  }
}

function getVimeoEmbedUrl(url = '') {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes('vimeo.com')) return '';

    const id = parsed.pathname
      .split('/')
      .filter(Boolean)
      .find((part) => /^\d+$/.test(part));

    return id ? `https://player.vimeo.com/video/${id}` : '';
  } catch {
    return '';
  }
}

function ProjectVideoPlayer({ url, poster, title }) {
  if (!url) return null;

  const playbackId = muxPlaybackId(url);

  if (playbackId) {
    return (
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        poster={poster}
        videoTitle={title}
        accentColor={ACCENT}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full project-detail-player"
        style={{
          width: '100%',
          height: '100%',
          '--media-object-fit': 'contain',
          backgroundColor: '#050505',
        }}
      />
    );
  }

  const youtubeEmbed = getYouTubeEmbedUrl(url);
  const vimeoEmbed = getVimeoEmbedUrl(url);

  if (youtubeEmbed || vimeoEmbed) {
    return (
      <iframe
        src={youtubeEmbed || vimeoEmbed}
        title={`${title} video`}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <video
      src={url}
      controls
      playsInline
      preload="metadata"
      poster={poster}
      className="w-full h-full object-contain bg-black"
    />
  );
}

function useInView(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, ...options },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useInView();

  return (
    <div
      ref={ref}
      className={`${className} transition-[opacity,transform] duration-1000 ease-[cubic-bezier(.16,1,.3,1)] ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SectionLabel({ index, children, light = false }) {
  return (
    <div
      className={`flex items-center gap-3 text-[10px] md:text-[11px] uppercase tracking-[0.22em] ${
        light ? 'text-black/45' : 'text-white/45'
      }`}
    >
      {index && <span>{index}</span>}
      {index && <span className={`h-px w-8 ${light ? 'bg-black/20' : 'bg-[var(--accent)]'}`} />}
      <span>{children}</span>
    </div>
  );
}

function PreviewMedia({ project, active, t }) {
  const playbackId = muxPlaybackId(project.video);
  const muxRef = useRef(null);
  const videoRef = useRef(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);

  useEffect(() => {
    setMediaReady(false);
    setMediaFailed(false);
  }, [project.id, project.video, project.previewVideo]);

  useEffect(() => {
    if (!active) {
      setMediaReady(false);
      muxRef.current?.pause?.();
      videoRef.current?.pause?.();
      return;
    }

    const player = muxRef.current;

    if (playbackId && player) {
      try {
        player.muted = true;
      } catch {}

      const playPromise = player.play?.();
      if (playPromise?.catch) {
        playPromise.catch(() => {
          // iOS peut refuser l'autoplay dans certains cas.
          // On garde alors simplement la couverture visible.
          setMediaReady(false);
        });
      }
      return;
    }

    if (videoRef.current && project.previewVideo) {
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => {
        setMediaReady(false);
      });
    }
  }, [active, playbackId, project.previewVideo]);

  const hasVideo = Boolean(playbackId || project.previewVideo);
  const showVideo = active && mediaReady && !mediaFailed;

  return (
    <>
      <img
        src={project.thumbnail}
        alt={project.title}
        onError={(event) => {
          event.currentTarget.src = FALLBACK_PROJECT_IMAGE;
        }}
        className={`absolute inset-0 w-full h-full object-cover transition-[opacity,transform] duration-500 ${
          showVideo
            ? 'opacity-0 scale-[1.015]'
            : 'opacity-100 scale-100'
        }`}
        loading="eager"
        decoding="async"
      />

      {active && playbackId && !mediaFailed && (
        <MuxPlayer
          ref={muxRef}
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay="muted"
          muted
          loop
          playsInline
          preload="auto"
          poster={project.thumbnail}
          videoTitle={`${project.title} preview`}
          onPlaying={() => setMediaReady(true)}
          onCanPlay={() => {
            if (active) setMediaReady(true);
          }}
          onError={() => {
            setMediaFailed(true);
            setMediaReady(false);
          }}
          className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300 ${
            showVideo ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: '100%',
            height: '100%',
            '--controls': 'none',
            '--media-object-fit': 'cover',
            '--media-object-position': 'center',
            backgroundColor: '#080808',
          }}
        />
      )}

      {active && !playbackId && project.previewVideo && !mediaFailed && (
        <video
          ref={videoRef}
          src={project.previewVideo}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          poster={project.thumbnail}
          onPlaying={() => setMediaReady(true)}
          onCanPlay={() => setMediaReady(true)}
          onError={() => {
            setMediaFailed(true);
            setMediaReady(false);
          }}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 pointer-events-none ${
            showVideo ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {active && hasVideo && !mediaReady && !mediaFailed && (
        <div className="absolute inset-0 z-[4] pointer-events-none flex items-end justify-start p-4 md:p-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 backdrop-blur-md px-3 py-2 text-[8px] uppercase tracking-[0.16em] text-white/65">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
            {t.loadingPreview}
          </span>
        </div>
      )}
    </>
  );
}

function ProjectCard({ project, index, t }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [touch, setTouch] = useState(false);
  const [mobileActive, setMobileActive] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(
      '(hover: none), (pointer: coarse), (max-width: 767px)',
    );

    const sync = () => setTouch(media.matches);
    sync();

    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    if (!touch || !cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setMobileActive(entry.isIntersecting);
      },
      {
        // La carte devient active lorsqu'elle traverse la zone centrale.
        // Cela évite d'avoir deux previews Mux actives en même temps sur iPhone.
        threshold: 0.01,
        rootMargin: '-24% 0px -30% 0px',
      },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [touch]);

  const active = touch ? mobileActive : hovered;
  const filmCount = project.videos?.length || (project.video ? 1 : 0);
  const orientation = project.orientation || 'horizontal';

  const mediaFrameClass =
    orientation === 'vertical'
      ? 'aspect-[9/16] w-[72vw] max-w-[340px] md:w-full md:max-w-[440px] mx-auto'
      : orientation === 'square'
        ? 'aspect-square w-full max-w-[720px] mx-auto'
        : 'aspect-video md:aspect-[16/7.6] md:max-h-[620px] w-full';

  const orientationLabel =
    orientation === 'vertical'
      ? '9:16'
      : orientation === 'square'
        ? '1:1'
        : '16:9';

  return (
    <article
      ref={cardRef}
      className="group border-t border-white/10 hover:border-[#e10600]/45 transition-colors duration-500 pt-5 md:pt-7"
    >
        <a
          href={`#work/${project.slug}`}
          className="block"
          onPointerEnter={(event) => {
            if (event.pointerType !== 'touch') setHovered(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType !== 'touch') setHovered(false);
          }}
        >
          <div className="flex items-start justify-between gap-4 mb-4 md:mb-5">
            <div className="flex items-start gap-5 md:gap-8 min-w-0">
              <span className="text-[10px] md:text-xs text-white/35 tracking-[0.18em] pt-1">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h3 className="text-[clamp(1.45rem,3vw,3.25rem)] leading-[0.96] tracking-[-0.045em] uppercase font-semibold truncate md:whitespace-normal">
                  {project.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] md:text-xs uppercase tracking-[0.15em] text-white/45">
                  {project.category && <span>{project.category}</span>}
                  {project.year && <span>· {project.year}</span>}
                  {filmCount > 0 && (
                    <span>· {String(filmCount).padStart(2, '0')} {filmCount > 1 ? t.films : t.film}</span>
                  )}
                </div>
              </div>
            </div>

            <span className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/15 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-white group-hover:rotate-45 transition-all duration-500">
              <ArrowUpRight size={18} />
            </span>
          </div>

          <div
            className={`project-media signal-frame relative overflow-hidden bg-[#111] rounded-[1.1rem] md:rounded-[1.8rem] ${mediaFrameClass}`}
          >
            <PreviewMedia project={project} active={active} t={t} />

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5 pointer-events-none" />

            <div className="absolute top-4 left-4 md:top-6 md:left-6 pointer-events-none flex items-center gap-2 text-[8px] md:text-[9px] uppercase tracking-[0.18em] text-white/55">
              <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-[var(--accent)] pulse-dot' : 'bg-white/35'}`} />
              <span>{active ? t.previewPlaying : `Film ${String(index + 1).padStart(2, '0')}`}</span>
            </div>

            <div className="absolute top-4 right-4 md:top-6 md:right-6 pointer-events-none rounded-full border border-white/15 bg-black/30 backdrop-blur-md px-3 py-2 text-[8px] md:text-[9px] uppercase tracking-[0.16em] text-white/55">
              {orientationLabel}
            </div>

            <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-6 md:bottom-5 flex items-end justify-between gap-4 pointer-events-none">
              <div className="max-w-[70%]">
                {project.roles.length > 0 && (
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.16em] text-white/70 line-clamp-2">
                    {project.roles.slice(0, 3).join(' · ')}
                  </p>
                )}
              </div>

              <span className="rounded-full border border-white/25 bg-black/25 backdrop-blur-md px-3 py-2 text-[9px] md:text-[10px] uppercase tracking-[0.17em] text-white/85">
                {active ? t.playingPreview : t.viewProject}
              </span>
            </div>
          </div>
        </a>
    </article>
  );
}


function projectHasType(project, type) {
  const types =
    Array.isArray(project.project_types) && project.project_types.length > 0
      ? project.project_types
      : [project.project_type || 'film'];

  return types.includes(type);
}

function projectTypeLabelByType(type, project, t) {
  switch (type) {
    case 'website':
      return t.website;
    case 'visual_design':
      return t.visualDesign;
    case 'campaign':
      return t.campaign;
    case 'photography':
      return t.photography;
    case 'film':
      return t.film || project.category || t.project;
    default:
      return project.category || t.project;
  }
}

function projectTypeLabels(project, t) {
  const types =
    Array.isArray(project.project_types) && project.project_types.length > 0
      ? project.project_types
      : [project.project_type || 'film'];

  return types.map((type) => projectTypeLabelByType(type, project, t));
}

function projectTypeLabel(project, t) {
  return projectTypeLabelByType(project.project_type || 'film', project, t);
}

function CreativeCard({ project, index, t }) {
  const creativeType =
    (projectHasType(project, 'website') && project.website_url && 'website') ||
    (projectHasType(project, 'visual_design') && 'visual_design') ||
    (projectHasType(project, 'photography') && 'photography') ||
    (projectHasType(project, 'campaign') && 'campaign') ||
    project.project_type ||
    'film';
  const type = creativeType;
  const typeLabel = projectTypeLabelByType(type, project, t);
  const gallery = Array.isArray(project.gallery) ? project.gallery : [];
  const technologies = Array.isArray(project.technologies)
    ? project.technologies.slice(0, 4)
    : [];

  const websiteHost = (() => {
    try {
      return project.website_url
        ? new URL(project.website_url).hostname.replace(/^www\./, '')
        : '';
    } catch {
      return '';
    }
  })();

  return (
    <article className="group border-t border-white/10 hover:border-[#e10600]/45 transition-colors duration-500 pt-5 md:pt-7">
      <div className="flex items-start justify-between gap-5 mb-5">
        <div className="flex gap-5 md:gap-7 min-w-0">
          <span className="text-[10px] md:text-xs text-white/30 tracking-[0.18em] pt-1">
            {String(index + 1).padStart(2, '0')}
          </span>
          <div className="min-w-0">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-[var(--accent)] mb-2">
              {typeLabel}
            </p>
            <h3 className="text-2xl md:text-4xl lg:text-5xl uppercase tracking-[-0.045em] leading-[0.95] font-semibold">
              {project.title}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-[9px] uppercase tracking-[0.14em] text-white/35">
              {project.year && <span>{project.year}</span>}
              {project.location && <span>· {project.location}</span>}
              {technologies.map((technology) => (
                <span
                  key={technology}
                  className="rounded-full border border-white/10 px-2.5 py-1 text-white/45"
                >
                  {technology}
                </span>
              ))}
            </div>
          </div>
        </div>

        <a
          href={`#work/${project.slug}`}
          className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/15 flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:rotate-45 transition-all duration-500"
          aria-label={t.viewCaseStudy}
        >
          <ArrowUpRight size={18} />
        </a>
      </div>

      {type === 'website' ? (
        <div className="signal-frame overflow-hidden rounded-[1.1rem] md:rounded-[1.6rem] bg-[#0b0b0b]">
          <div className="h-10 md:h-12 border-b border-white/10 flex items-center gap-3 px-4 md:px-5 bg-[#101010]">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]/75" />
              <span className="w-2 h-2 rounded-full bg-white/15" />
              <span className="w-2 h-2 rounded-full bg-white/10" />
            </div>
            <div className="flex-1 max-w-lg rounded-full border border-white/8 bg-black/25 px-4 py-1.5 text-[9px] uppercase tracking-[0.12em] text-white/30 truncate">
              {websiteHost || project.title}
            </div>
          </div>

          <a href={`#work/${project.slug}`} className="block aspect-[16/10] overflow-hidden bg-[#111]">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-700"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_PROJECT_IMAGE;
              }}
            />
          </a>
        </div>
      ) : type === 'visual_design' ? (
        <a
          href={`#work/${project.slug}`}
          className="signal-frame grid grid-cols-12 gap-2 md:gap-4 p-2 md:p-4 rounded-[1.1rem] md:rounded-[1.6rem] bg-[#0b0b0b] overflow-hidden"
        >
          <div className="col-span-8 aspect-[4/5] bg-[#111] overflow-hidden rounded-[.7rem] md:rounded-[1rem]">
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-contain bg-[#080808] group-hover:scale-[1.015] transition-transform duration-700"
              loading="lazy"
            />
          </div>
          <div className="col-span-4 grid grid-rows-2 gap-2 md:gap-4">
            {[gallery[0], gallery[1]].map((image, imageIndex) => (
              <div
                key={image || imageIndex}
                className="min-h-0 bg-[#111] overflow-hidden rounded-[.7rem] md:rounded-[1rem]"
              >
                {image ? (
                  <img
                    src={image}
                    alt={`${project.title} ${imageIndex + 2}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] uppercase tracking-[0.16em] text-white/15">
                    LORIK.NK
                  </div>
                )}
              </div>
            ))}
          </div>
        </a>
      ) : (
        <a
          href={`#work/${project.slug}`}
          className="signal-frame block relative overflow-hidden rounded-[1.1rem] md:rounded-[1.6rem] bg-[#111] aspect-[16/9]"
        >
          <img
            src={project.thumbnail}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10" />
          <div className="absolute left-4 right-4 bottom-4 md:left-6 md:right-6 md:bottom-6 flex items-end justify-between gap-4">
            <p className="text-[9px] md:text-[10px] uppercase tracking-[0.16em] text-white/65">
              {type === 'campaign' && project.video ? 'Film · Visual · Digital' : typeLabel}
            </p>
            <span className="rounded-full border border-white/20 bg-black/30 backdrop-blur-md px-3 py-2 text-[9px] uppercase tracking-[0.16em] text-white/75">
              {t.viewCaseStudy}
            </span>
          </div>
        </a>
      )}

      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="max-w-2xl text-sm text-white/40 leading-relaxed line-clamp-2">
          {project.description}
        </p>

        {project.website_url && (
          <a
            href={project.website_url}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/65 hover:text-[var(--accent)] transition-colors"
          >
            {t.visitSite}
            <ArrowUpRight size={13} />
          </a>
        )}
      </div>
    </article>
  );
}

function ProjectDetail({ project, projects, t }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [project?.id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050505] text-white px-5 md:px-10 pt-36">
        <button
          onClick={() => {
            window.location.hash = '';
          }}
          className="text-xs uppercase tracking-[0.18em] text-white/55 hover:text-white"
        >
          {t.backToWork}
        </button>
        <p className="mt-20 text-white/45">{t.projectNotFound}</p>
      </div>
    );
  }

  const currentIndex = projects.findIndex((item) => item.id === project.id);
  const nextProject =
    projects.length > 1 ? projects[(currentIndex + 1) % projects.length] : null;

  const additionalVideos = (project.videos || []).filter(
    (video) => video.video_url !== project.video,
  );

  const mainOrientation = project.orientation || 'horizontal';
  const mainFrameClass =
    mainOrientation === 'vertical'
      ? 'aspect-[9/16] w-[84vw] max-w-[460px] md:w-full md:max-w-[500px] mx-auto'
      : mainOrientation === 'square'
        ? 'aspect-square w-full max-w-[760px] mx-auto'
        : 'aspect-video md:aspect-[16/7.8] md:max-h-[760px] w-full';

  const mainOrientationLabel =
    mainOrientation === 'vertical'
      ? '9:16'
      : mainOrientation === 'square'
        ? '1:1'
        : '16:9';

  const projectType = project.project_type || 'film';
  const allTypeLabels = projectTypeLabels(project, t);
  const isWebsite = projectType === 'website';
  const isVisualDesign = projectType === 'visual_design';
  const isCampaign = projectType === 'campaign';
  const isCreativeProject = ['website', 'visual_design', 'campaign', 'photography'].includes(projectType);
  const typeLabel = projectTypeLabel(project, t);
  const technologies = Array.isArray(project.technologies) ? project.technologies : [];

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-28 md:pt-36 pb-24">
      <div className="px-5 md:px-10 lg:px-14 max-w-[1600px] mx-auto">
        <button
          onClick={() => {
            window.location.hash = '';
          }}
          className="text-[10px] md:text-xs uppercase tracking-[0.18em] text-white/45 hover:text-white transition-colors"
        >
          {t.selectedWorkBack}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-10 md:mt-16 mb-10 md:mb-14 items-end">
          <div className="lg:col-span-9">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.18em] text-white/40 mb-5">
              {[project.category, project.year, project.location].filter(Boolean).join(' · ')}
            </p>
            <h1 className="text-[clamp(2.8rem,7.4vw,7rem)] leading-[0.84] tracking-[-0.065em] font-semibold uppercase break-words">
              {project.title}
            </h1>
          </div>

          <div className="lg:col-span-3 lg:pb-2 text-sm text-white/50 leading-relaxed">
            <div className="flex flex-wrap gap-2 mb-4">
              {allTypeLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-[var(--accent)]/35 px-2.5 py-1 text-[8px] uppercase tracking-[0.16em] text-[var(--accent)]"
                >
                  {label}
                </span>
              ))}
            </div>
            {project.roles.length > 0 && project.roles.slice(0, 5).map((role) => (
              <p key={role}>{role}</p>
            ))}
            {project.website_url && (
              <a
                href={project.website_url}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#e10600]/45 px-4 py-2.5 text-[9px] uppercase tracking-[0.16em] text-white/75 hover:bg-[var(--accent)] hover:text-white transition-colors"
              >
                {t.visitSite}
                <ArrowUpRight size={12} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="px-3 md:px-8 lg:px-12 max-w-[1500px] mx-auto">
        {isWebsite ? (
          <div className="signal-frame overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem] bg-[#0b0b0b]">
            <div className="h-11 md:h-13 border-b border-white/10 flex items-center gap-3 px-4 md:px-6 bg-[#101010]">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[var(--accent)]/80" />
                <span className="w-2 h-2 rounded-full bg-white/15" />
                <span className="w-2 h-2 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 max-w-xl rounded-full border border-white/8 bg-black/25 px-4 py-1.5 text-[9px] uppercase tracking-[0.12em] text-white/30 truncate">
                {project.website_url || project.title}
              </div>
            </div>
            <div className="aspect-[16/10] bg-[#111] overflow-hidden">
              <img
                src={project.thumbnail}
                alt={project.title}
                className="w-full h-full object-cover object-top"
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_PROJECT_IMAGE;
                }}
              />
            </div>
          </div>
        ) : (
          <div
            className={`signal-frame relative bg-black overflow-hidden rounded-[1.15rem] md:rounded-[1.5rem] ${
              isVisualDesign ? 'aspect-[4/5] max-w-[620px] mx-auto' : mainFrameClass
            }`}
          >
            {project.video ? (
              <ProjectVideoPlayer
                url={project.video}
                poster={project.thumbnail}
                title={project.title}
              />
            ) : (
              <img
                src={project.thumbnail}
                alt={project.title}
                className={`w-full h-full ${isVisualDesign ? 'object-contain bg-[#080808]' : 'object-cover'}`}
                onError={(event) => {
                  event.currentTarget.src = FALLBACK_PROJECT_IMAGE;
                }}
              />
            )}

            {!isVisualDesign && (
              <div className="absolute top-4 right-4 md:top-5 md:right-5 z-20 pointer-events-none rounded-full border border-white/15 bg-black/35 backdrop-blur-md px-3 py-2 text-[8px] md:text-[9px] uppercase tracking-[0.16em] text-white/55">
                {mainOrientationLabel}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-5 md:px-10 lg:px-14 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 py-16 md:py-22 border-b border-white/10">
          <div className="lg:col-span-3">
            <SectionLabel index="01">{t.project}</SectionLabel>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-xl md:text-3xl lg:text-4xl leading-[1.14] tracking-[-0.035em] text-white/90">
              {project.description || t.projectDetailsSoon}
            </p>

            {technologies.length > 0 && (
              <div className="mt-8">
                <p className="text-[9px] uppercase tracking-[0.18em] text-white/30 mb-3">
                  {t.technologies}
                </p>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((technology) => (
                    <span
                      key={technology}
                      className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-2 text-[9px] uppercase tracking-[0.13em] text-white/55"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {additionalVideos.length > 0 && (
          <section className="red-divider py-16 md:py-22 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
              <div>
                <SectionLabel index="02">{t.selectedFilms}</SectionLabel>
                <h2 className="mt-5 text-3xl md:text-5xl lg:text-6xl tracking-[-0.05em] uppercase font-semibold leading-[0.9]">
                  {String(t.moreFromProject).split('\n').map((line, i, arr) => (<React.Fragment key={line}>{line}{i < arr.length - 1 && <br />}</React.Fragment>))}
                </h2>
              </div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                {String(additionalVideos.length).padStart(2, '0')} {additionalVideos.length > 1 ? t.additionalFilms : t.additionalFilm}
              </p>
            </div>

            <div className="film-strip -mx-5 px-5 flex gap-5 overflow-x-auto pb-3 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-6 lg:gap-10 md:overflow-visible md:snap-none items-start">
              {additionalVideos.map((film, index) => {
                const orientation = film.orientation || 'horizontal';
                const aspectClass =
                  orientation === 'vertical'
                    ? 'aspect-[9/16] md:max-w-[320px]'
                    : orientation === 'square'
                      ? 'aspect-square'
                      : 'aspect-video';

                return (
                  <article
                    key={film.id || `${film.video_url}-${index}`}
                    className={`shrink-0 snap-center ${
                      orientation === 'vertical'
                        ? 'w-[64vw] max-w-[300px] md:w-auto'
                        : orientation === 'square'
                          ? 'w-[70vw] max-w-[360px] md:w-auto'
                          : 'w-[82vw] max-w-[620px] md:w-auto'
                    } ${index % 2 === 1 ? 'md:mt-10' : ''}`}
                  >
                    <div className={`signal-frame bg-black overflow-hidden rounded-[1.2rem] ${aspectClass}`}>
                      <ProjectVideoPlayer
                        url={film.video_url}
                        poster={project.thumbnail}
                        title={`${project.title} — ${film.title || `Film ${index + 2}`}`}
                      />
                    </div>
                    <div className="flex items-start justify-between gap-4 mt-4">
                      <div>
                        <h3 className="text-base md:text-lg uppercase tracking-[-0.01em]">
                          {film.title || `Film ${index + 2}`}
                        </h3>
                        {film.video_type && (
                          <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/35">
                            {film.video_type}
                          </p>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                        {orientation === 'vertical' ? '9:16' : orientation === 'square' ? '1:1' : '16:9'}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {project.gallery.length > 0 && (
          <section className="red-divider py-16 md:py-22 border-b border-white/10">
            <SectionLabel index={additionalVideos.length > 0 ? '03' : '02'}>
              {isWebsite
                ? t.digitalExperience
                : isCampaign
                  ? t.campaignVisuals
                  : isVisualDesign
                    ? t.designGallery
                    : t.frames}
            </SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-10">
              {project.gallery.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className={`overflow-hidden rounded-[1rem] bg-[#111] ${
                    index % 3 === 0
                      ? 'md:col-span-8 aspect-[16/10]'
                      : 'md:col-span-4 aspect-[4/5]'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${project.title} frame ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-[1.025] transition-transform duration-700"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_PROJECT_IMAGE;
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {nextProject && (
          <section className="pt-24 md:pt-36">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.18em] text-white/35 mb-7">
              {t.nextProject}
            </p>
            <a href={`#work/${nextProject.slug}`} className="group flex items-end justify-between gap-6 border-b border-white/10 hover:border-[#e10600]/55 pb-8 transition-colors duration-500">
              <h2 className="text-[clamp(2.7rem,8vw,8rem)] leading-[0.82] tracking-[-0.06em] uppercase font-semibold group-hover:text-[var(--accent)] transition-colors">
                {nextProject.title}
              </h2>
              <ArrowUpRight className="shrink-0 mb-2 group-hover:rotate-45 transition-transform duration-500" size={34} />
            </a>
          </section>
        )}
      </div>
    </div>
  );
}

export default function Portfolio() {
  const [projects, setProjects] = useState(() => readCachedProjects());
  const [projectsLoading, setProjectsLoading] = useState(
    () => readCachedProjects().length === 0,
  );
  const [projectsError, setProjectsError] = useState('');
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);
  const [route, setRoute] = useState({ path: 'home', slug: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showreelPlaying, setShowreelPlaying] = useState(false);
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('yn-language') || 'it';
    } catch {
      return 'it';
    }
  });
  const scrollProgressRef = useRef(null);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.setAttribute('translate', 'no');
    document.documentElement.classList.add('notranslate');

    let noTranslateMeta = document.querySelector(
      'meta[name="google"][content="notranslate"]',
    );

    if (!noTranslateMeta) {
      noTranslateMeta = document.createElement('meta');
      noTranslateMeta.setAttribute('name', 'google');
      noTranslateMeta.setAttribute('content', 'notranslate');
      document.head.appendChild(noTranslateMeta);
    }

    try {
      localStorage.setItem('yn-language', language);
    } catch {}
  }, [language]);

  useEffect(() => {
    let active = true;
    let requestInFlight = false;
    let lastRefreshAt = 0;

    async function loadProjects({ background = false } = {}) {
      if (requestInFlight) return;
      requestInFlight = true;

      if (!background) {
        setProjectsLoading(true);
        setProjectsError('');
      }

      try {
        const baseQuery = supabase
          .from('projects')
          .select('*')
          .eq('published', true)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: false });

        // Empêche Safari mobile de rester éternellement sur "Loading…"
        // si une requête réseau se bloque.
        const baseResult = await Promise.race([
          baseQuery,
          new Promise((resolve) =>
            window.setTimeout(
              () =>
                resolve({
                  data: null,
                  error: { message: 'Project request timed out' },
                }),
              12000,
            ),
          ),
        ]);

        if (!active) return;

        const { data: baseProjects, error: baseError } = baseResult;

        if (baseError) {
          console.error(
            'Unable to load portfolio projects:',
            baseError?.message || baseError,
          );

          // Une actualisation en arrière-plan ne doit jamais masquer
          // les projets qui sont déjà affichés.
          if (!background) {
            setProjectsError(baseError.message || 'Unable to load projects');
          }
          return;
        }

        const rawProjects = baseProjects ?? [];
        const baseNormalized = rawProjects.map(normalizeProject);

        if (!active) return;

        setProjects(baseNormalized);
        writeCachedProjects(baseNormalized);
        lastRefreshAt = Date.now();

        if (rawProjects.length === 0) return;

        const projectIds = rawProjects
          .map((project) => project.id)
          .filter(Boolean);

        const videosQuery = supabase
          .from('project_videos')
          .select(`
            id,
            project_id,
            title,
            video_url,
            mux_asset_id,
            video_type,
            orientation,
            is_featured,
            sort_order,
            created_at
          `)
          .in('project_id', projectIds)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true });

        const videosResult = await Promise.race([
          videosQuery,
          new Promise((resolve) =>
            window.setTimeout(
              () =>
                resolve({
                  data: null,
                  error: { message: 'Project videos request timed out' },
                }),
              12000,
            ),
          ),
        ]);

        if (!active) return;

        const { data: projectVideos, error: videosError } = videosResult;

        if (videosError) {
          // Les cartes restent déjà visibles grâce aux données de base.
          console.warn(
            'Unable to enrich projects with videos:',
            videosError?.message || videosError,
          );
          return;
        }

        const videosByProject = new Map();

        for (const video of projectVideos ?? []) {
          const current = videosByProject.get(video.project_id) ?? [];
          current.push(video);
          videosByProject.set(video.project_id, current);
        }

        const enrichedProjects = rawProjects.map((project) =>
          normalizeProject({
            ...project,
            project_videos: videosByProject.get(project.id) ?? [],
          }),
        );

        if (!active) return;

        setProjects(enrichedProjects);
        writeCachedProjects(enrichedProjects);
      } finally {
        requestInFlight = false;

        if (active && !background) {
          setProjectsLoading(false);
        }
      }
    }

    loadProjects({ background: projects.length > 0 });

    const refreshInBackground = () => {
      // Safari peut envoyer plusieurs visibility/pageshow rapprochés.
      // On limite donc les rechargements à un maximum toutes les 20 secondes.
      if (Date.now() - lastRefreshAt < 20000) return;
      loadProjects({ background: true });
    };

    const handlePageShow = (event) => {
      if (event.persisted) {
        refreshInBackground();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshInBackground();
      }
    };

    const handleOnline = () => {
      refreshInBackground();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      active = false;
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      const { data, error } = await supabase
        .from('site_settings')
        .select(`
          showreel_url,
          hero_title,
          hero_roles,
          hero_location_line,
          hero_primary_cta,
          hero_secondary_cta,
          hero_title_it,
          hero_roles_it,
          hero_location_line_it,
          hero_primary_cta_it,
          hero_secondary_cta_it,
          about_heading,
          about_body,
          about_heading_it,
          about_body_it,
          about_image_url,
          contact_heading,
          contact_description,
          contact_heading_it,
          contact_description_it,
          contact_email,
          whatsapp_number,
          instagram_url,
          tiktok_url,
          linkedin_url
        `)
        .eq('id', 'main')
        .maybeSingle();

      if (!active || error) {
        if (error) console.error('Unable to load site settings:', error);
        return;
      }

      setSiteSettings((current) => ({
        ...current,
        ...Object.fromEntries(
          Object.entries(data ?? {}).filter(([, value]) => value !== null),
        ),
      }));
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('work/')) {
        setRoute({ path: 'project', slug: hash.split('/')[1] });
      } else {
        setRoute({ path: 'home', slug: null });
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    let frame = null;
    let lastScrolled = window.scrollY > 40;

    setIsScrolled(lastScrolled);

    const updateScrollUI = () => {
      frame = null;

      const nextScrolled = window.scrollY > 40;
      if (nextScrolled !== lastScrolled) {
        lastScrolled = nextScrolled;
        setIsScrolled(nextScrolled);
      }

      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const progress = Math.min(
        1,
        Math.max(0, window.scrollY / maxScroll),
      );

      if (scrollProgressRef.current) {
        scrollProgressRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const requestScrollUIUpdate = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(updateScrollUI);
    };

    requestScrollUIUpdate();
    window.addEventListener('scroll', requestScrollUIUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUIUpdate, { passive: true });

    return () => {
      window.removeEventListener('scroll', requestScrollUIUpdate);
      window.removeEventListener('resize', requestScrollUIUpdate);

      if (frame !== null) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

  const t = UI_COPY[language] || UI_COPY.it;

  const localizedSettings = useMemo(() => {
    if (language !== 'it') return siteSettings;

    return {
      ...siteSettings,
      hero_title: siteSettings.hero_title_it || IT_SETTINGS_DEFAULTS.hero_title,
      hero_roles: siteSettings.hero_roles_it || IT_SETTINGS_DEFAULTS.hero_roles,
      hero_location_line:
        siteSettings.hero_location_line_it || IT_SETTINGS_DEFAULTS.hero_location_line,
      hero_primary_cta:
        siteSettings.hero_primary_cta_it || IT_SETTINGS_DEFAULTS.hero_primary_cta,
      hero_secondary_cta:
        siteSettings.hero_secondary_cta_it || IT_SETTINGS_DEFAULTS.hero_secondary_cta,
      about_heading:
        siteSettings.about_heading_it || IT_SETTINGS_DEFAULTS.about_heading,
      about_body: siteSettings.about_body_it || IT_SETTINGS_DEFAULTS.about_body,
      contact_heading:
        siteSettings.contact_heading_it || IT_SETTINGS_DEFAULTS.contact_heading,
      contact_description:
        siteSettings.contact_description_it || IT_SETTINGS_DEFAULTS.contact_description,
    };
  }, [siteSettings, language]);

  const displayProjects = useMemo(
    () => projects.map((project) => localizeProject(project, language)),
    [projects, language],
  );

  const filmProjects = useMemo(
    () =>
      displayProjects.filter((project) => {
        const belongsToFilm =
          projectHasType(project, 'film') || projectHasType(project, 'campaign');

        return belongsToFilm && Boolean(project.video || project.videos?.length);
      }),
    [displayProjects],
  );

  const creativeProjects = useMemo(
    () =>
      displayProjects.filter((project) => {
        if (
          projectHasType(project, 'website') ||
          projectHasType(project, 'visual_design') ||
          projectHasType(project, 'photography')
        ) {
          return true;
        }

        if (projectHasType(project, 'campaign')) {
          return Boolean(project.website_url || project.gallery?.length);
        }

        return false;
      }),
    [displayProjects],
  );

  const showreelPlaybackId = muxPlaybackId(localizedSettings.showreel_url);
  const showreelPoster = showreelPlaybackId
    ? `https://image.mux.com/${showreelPlaybackId}/thumbnail.jpg?width=1800&fit_mode=smartcrop`
    : FALLBACK_PROJECT_IMAGE;

  const whatsappDigits = String(siteSettings.whatsapp_number || '').replace(/\D/g, '');
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : '';

  const aboutParagraphs = useMemo(
    () =>
      String(localizedSettings.about_body || '')
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    [localizedSettings.about_body],
  );

  const renderMultilineTitle = (value) =>
    String(value || '')
      .split('\n')
      .map((line, index, lines) => (
        <React.Fragment key={`${line}-${index}`}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ));

  function handleLanguageChange(nextLanguage) {
    if (!['it', 'fr'].includes(nextLanguage)) return;
    setLanguage(nextLanguage);
    setMobileMenuOpen(false);

    // Browser translation engines can leave stale DOM mutations behind.
    // Returning to the top-level native UI avoids keeping an old translated overlay.
    requestAnimationFrame(() => {
      document.documentElement.lang = nextLanguage;
    });
  }

  function scrollToSection(id) {
    setMobileMenuOpen(false);

    const go = () => {
      const element = document.getElementById(id);
      if (!element) return;
      const nav = document.getElementById('site-nav');
      const offset = nav?.getBoundingClientRect().height ?? 72;
      const y = element.getBoundingClientRect().top + window.scrollY - offset - 8;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    };

    if (route.path !== 'home') {
      window.location.hash = '';
      window.setTimeout(go, 180);
    } else {
      requestAnimationFrame(go);
    }
  }

  function handlePrimaryCta() {
    if (whatsappHref) {
      window.open(whatsappHref, '_blank', 'noopener,noreferrer');
    } else {
      scrollToSection('contact');
    }
  }

  const selectedProject = displayProjects.find((project) => project.slug === route.slug);

  return (
    <div
      className="notranslate min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-[var(--accent)] selection:text-white"
      style={{ '--accent': ACCENT }}
      translate="no"
      data-native-language-switch="it-fr"
    >
      <style>{`
        html {
          background: #050505;
          scroll-behavior: auto;
          overscroll-behavior-y: auto;
        }
        body {
          background: #050505;
          overscroll-behavior-y: auto;
        }
        @keyframes heroIn {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: .45; transform: scale(.8); }
          50% { opacity: 1; transform: scale(1); }
        }
        .hero-in { animation: heroIn 1s cubic-bezier(.16,1,.3,1) both; }
        .hero-delay-1 { animation-delay: 120ms; }
        .hero-delay-2 { animation-delay: 220ms; }
        .hero-delay-3 { animation-delay: 340ms; }
        .grain::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .09;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(255,255,255,.45) 0 .6px, transparent .8px),
            radial-gradient(circle at 80% 70%, rgba(255,255,255,.35) 0 .5px, transparent .7px);
          background-size: 5px 5px, 7px 7px;
          mix-blend-mode: soft-light;
        }
        .pulse-dot { animation: pulseDot 1.8s ease-in-out infinite; }

        @keyframes signalOrbit {
          from { offset-distance: 0%; }
          to { offset-distance: 100%; }
        }

        .signal-frame {
          position: relative;
          border: 1px solid rgba(225, 6, 0, .20);
          box-shadow:
            0 0 0 1px rgba(255,255,255,.018) inset,
            0 18px 56px rgba(0,0,0,.24);
          isolation: isolate;
        }

        .signal-frame::before {
          content: '';
          position: absolute;
          z-index: 30;
          width: 58px;
          height: 2px;
          left: 0;
          top: 0;
          border-radius: 999px;
          pointer-events: none;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(225, 6, 0, .55),
            #ff3b36,
            var(--accent),
            transparent
          );
          box-shadow: 0 0 12px rgba(225, 6, 0, .45);
          offset-path: inset(2px round 18px);
          offset-distance: 0%;
          offset-rotate: auto;
          animation: signalOrbit 5.4s linear infinite;
          will-change: offset-distance;
        }

        .signal-frame::after {
          content: '';
          position: absolute;
          z-index: 29;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
          box-shadow: inset 0 0 0 1px rgba(225, 6, 0, .05);
        }

        .signal-frame:hover::before {
          animation-duration: 3.2s;
        }

        @supports not (offset-path: inset(2px round 18px)) {
          .signal-frame::before {
            width: 28%;
            left: 7%;
            top: -1px;
            offset-path: none;
            animation: none;
          }
        }

        .red-rule {
          position: relative;
        }

        .red-rule::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 2px;
          width: min(34vw, 420px);
          background: var(--accent);
          box-shadow: 0 0 16px rgba(225, 6, 0, .34);
          pointer-events: none;
        }

        .red-rule-right::after {
          content: '';
          position: absolute;
          right: 0;
          bottom: 0;
          height: 2px;
          width: min(18vw, 240px);
          background: var(--accent);
          pointer-events: none;
        }

        .red-divider {
          position: relative;
        }
        .red-divider::before {
          content: '';
          position: absolute;
          left: 0;
          top: -1px;
          width: clamp(72px, 12vw, 180px);
          height: 2px;
          background: var(--accent);
          box-shadow: 0 0 18px rgba(225, 6, 0, .35);
        }
        .project-media {
          transition: border-color .55s ease, box-shadow .55s ease, transform .7s cubic-bezier(.16,1,.3,1);
        }
        .group:hover .project-media {
          border-color: rgba(225, 6, 0, .68);
          box-shadow: 0 24px 80px rgba(0,0,0,.5), 0 0 0 1px rgba(225,6,0,.08);
          transform: translateY(-3px);
        }
        .cta-red {
          background: var(--accent);
          color: white;
          box-shadow: 0 12px 36px rgba(225,6,0,.18);
        }
        .cta-red:hover {
          background: white;
          color: black;
          box-shadow: 0 14px 42px rgba(255,255,255,.08);
        }
        .hud-corner {
          position: absolute;
          width: 34px;
          height: 34px;
          border-color: rgba(225, 6, 0, .78);
          pointer-events: none;
        }
        .hud-corner.tl {
          top: 0;
          left: 0;
          border-top: 1px solid;
          border-left: 1px solid;
        }
        .hud-corner.br {
          right: 0;
          bottom: 0;
          border-right: 1px solid;
          border-bottom: 1px solid;
        }

        @media (prefers-reduced-motion: reduce) {
          .signal-frame::before {
            animation: none;
          }
        }

        .film-strip {
          scrollbar-width: none;
          -ms-overflow-style: none;
          scroll-snap-type: x proximity;
          overscroll-behavior-inline: contain;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-x pan-y pinch-zoom;
        }
        .film-strip::-webkit-scrollbar {
          display: none;
        }
        .play-ring {
          box-shadow: 0 0 0 0 rgba(225,6,0,.28);
          animation: playRing 2.6s ease-out infinite;
        }
        @keyframes playRing {
          0% { box-shadow: 0 0 0 0 rgba(225,6,0,.30); }
          70%, 100% { box-shadow: 0 0 0 18px rgba(225,6,0,0); }
        }
        @media (max-width: 767px) {
          .project-media {
            contain: layout paint;
            backface-visibility: hidden;
          }

          .project-media.aspect-\[9\/16\] {
            max-height: 72svh;
          }

          .project-media mux-player,
          .project-media video,
          .project-media img {
            transform: translateZ(0);
          }

          .project-detail-player {
            --controls: auto;
            touch-action: manipulation;
          }

          html, body {
            width: 100%;
            max-width: 100%;
            overflow-x: hidden;
          }

          .project-media {
            min-height: 0;
            transform: translateZ(0);
          }

          .signal-frame::before {
            animation-duration: 7s;
          }

          .grain::after {
            opacity: .055;
          }
        }

        @media (hover: none) and (pointer: coarse) {
          .signal-frame:hover::before {
            animation-duration: 5.4s;
          }
          .project-media {
            transform: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero-in, .pulse-dot, .play-ring { animation: none !important; }
          .project-media { transform: none !important; }
          * { scroll-behavior: auto !important; }
        }
      `}</style>

      <div
        ref={scrollProgressRef}
        aria-hidden="true"
        className="fixed left-0 right-0 top-0 z-[80] h-[2px] origin-left scale-x-0 bg-[var(--accent)] shadow-[0_0_14px_rgba(225,6,0,.55)] will-change-transform pointer-events-none"
      />

      <nav
        id="site-nav"
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          isScrolled || route.path === 'project' ? 'pt-3 md:pt-4' : 'pt-4 md:pt-6'
        }`}
      >
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
          <div
            className={`h-14 md:h-16 rounded-full px-4 md:px-6 flex items-center justify-between border transition-all duration-500 ${
              isScrolled || route.path === 'project'
                ? 'bg-black/65 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20'
                : 'bg-black/20 backdrop-blur-sm border-white/10'
            }`}
          >
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                window.location.hash = '';
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-3 min-w-0"
            >
              <span className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-bold tracking-[-0.03em] shadow-[0_0_24px_rgba(225,6,0,.22)]">
                {PORTFOLIO_DATA.shortName}
              </span>
              <span className="hidden sm:flex flex-col leading-none min-w-0">
                <span className="text-[10px] md:text-xs uppercase tracking-[0.17em] text-white/95 truncate font-semibold">
                  {PORTFOLIO_DATA.brand}
                </span>
                <span className="mt-1 text-[7px] md:text-[8px] uppercase tracking-[0.15em] text-white/35 truncate">
                  {PORTFOLIO_DATA.name}
                </span>
              </span>
            </a>

            <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] p-1">
              {['work', 'about', 'services'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-white/55 hover:text-white transition-colors rounded-full"
                >
                  {t.nav[item]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <LanguageSwitch language={language} onChange={handleLanguageChange} compact />
              </div>
              <button
                onClick={handlePrimaryCta}
                className="cta-red hidden sm:inline-flex items-center gap-2 rounded-full px-4 md:px-5 py-2.5 text-[9px] md:text-[10px] uppercase tracking-[0.15em] font-semibold transition-all duration-300"
              >
                {t.nav.contact}
                <ArrowUpRight size={13} />
              </button>

              <div className="md:hidden">
                <LanguageSwitch
                  language={language}
                  onChange={handleLanguageChange}
                  compact
                />
              </div>

              <button
                className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={language === 'it' ? 'Apri menu' : 'Ouvrir le menu'}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[-1] bg-[#050505] md:hidden px-5 pt-28 pb-8 flex flex-col justify-between">
            <div className="flex flex-col">
              {['work', 'about', 'services', 'contact'].map((item, index) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="flex items-center justify-between border-b border-white/10 py-5 text-left text-4xl uppercase tracking-[-0.04em] hover:text-[var(--accent)] hover:border-[#e10600]/45 transition-colors"
                >
                  <span>{t.nav[item]}</span>
                  <span className="text-xs text-white/30">0{index + 1}</span>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              <LanguageSwitch language={language} onChange={handleLanguageChange} compact />
              <div className="flex gap-5 text-white/50">
              <a href={siteSettings.instagram_url} target="_blank" rel="noreferrer"><FaInstagram /></a>
              <a href={siteSettings.tiktok_url} target="_blank" rel="noreferrer"><FaTiktok /></a>
              {isRealLinkedInProfile(siteSettings.linkedin_url) && (
                <a href={siteSettings.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <FaLinkedinIn />
                </a>
              )}
              {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer"><FaWhatsapp /></a>}
              </div>
            </div>
          </div>
        )}
      </nav>

      {route.path === 'home' ? (
        <main>
          <section className="relative min-h-[100svh] bg-black overflow-hidden grain flex items-end">
            <div className="absolute inset-0 pointer-events-none">
              {showreelPlaybackId ? (
                <MuxPlayer
                  playbackId={showreelPlaybackId}
                  streamType="on-demand"
                  autoPlay="muted"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  videoTitle="Yaël Noukimi Showreel"
                  className="w-full h-full opacity-75"
                  style={{
                    width: '100%',
                    height: '100%',
                    '--controls': 'none',
                    '--media-object-fit': 'cover',
                    '--media-object-position': 'center',
                  }}
                />
              ) : (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-70"
                  poster={FALLBACK_PROJECT_IMAGE}
                >
                  <source src="/assets/videos/hero-showreel.mp4" type="video/mp4" />
                </video>
              )}

              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/95" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/10" />

              {/* The showreel can contain burned-in subtitles. This lower scrim
                  keeps them visually behind the hero copy instead of competing
                  with the headline. */}
              <div className="absolute inset-x-0 bottom-0 h-[48%] md:h-[44%] bg-gradient-to-b from-transparent via-black/55 to-black pointer-events-none" />

              <div className="absolute inset-x-5 md:inset-x-10 lg:inset-x-14 top-24 md:top-28 bottom-6 md:bottom-8 pointer-events-none opacity-80">
                <span className="hud-corner tl" />
                <span className="hud-corner br" />
                <div className="absolute top-0 right-0 flex items-center gap-2 text-[8px] md:text-[9px] uppercase tracking-[0.2em] text-white/45">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
                  <span>REC</span>
                  <span className="text-white/25">4K · 25FPS</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 w-full max-w-[1600px] mx-auto px-5 md:px-10 lg:px-14 pb-10 md:pb-10 pt-28 sm:pt-32 md:pt-36">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 md:mb-8 hero-in hero-delay-1">
                <div className="flex items-center gap-3 text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-white/65">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] pulse-dot" />
                  <span>{t.available}</span>
                </div>
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-white/45">
                  {localizedSettings.hero_location_line}
                </span>
              </div>

              <h1 className="hero-in text-[clamp(3.35rem,8.6vw,8.7rem)] leading-[0.79] tracking-[-0.075em] font-semibold uppercase max-w-[1450px]">
                {renderMultilineTitle(localizedSettings.hero_title)}
              </h1>

              <div className="hero-in hero-delay-2 mt-5 md:mt-7 grid grid-cols-1 md:grid-cols-12 gap-7 md:items-end">
                <p className="md:col-span-5 lg:col-span-4 text-xs md:text-sm uppercase tracking-[0.16em] text-white/65 leading-relaxed">
                  {localizedSettings.hero_roles}
                </p>

                <div className="md:col-span-7 lg:col-span-5 lg:col-start-8 flex flex-col sm:flex-row gap-3 md:justify-end">
                  <button
                    onClick={handlePrimaryCta}
                    className="cta-red min-h-12 px-5 rounded-full flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.16em] font-semibold transition-all duration-300"
                  >
                    <span>{localizedSettings.hero_primary_cta}</span>
                    <ArrowUpRight size={16} />
                  </button>
                  <button
                    onClick={() => scrollToSection('work')}
                    className="min-h-12 px-5 rounded-full border border-[#e10600]/55 bg-black/30 backdrop-blur-md flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.16em] hover:border-[#e10600] hover:bg-[#e10600]/10 transition-all duration-300"
                  >
                    <span>{localizedSettings.hero_secondary_cta}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="red-divider hero-in hero-delay-3 mt-7 md:mt-9 border-t border-white/15 pt-5 flex items-center justify-between text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-white/35">
                <span>{t.heroFooter}</span>
                <button onClick={() => scrollToSection('work')} className="flex items-center gap-2 hover:text-white transition-colors">
                  {t.scrollWork} <span>↓</span>
                </button>
              </div>
            </div>
          </section>

          <section id="work" className="red-rule px-5 md:px-10 lg:px-14 py-18 md:py-24 bg-[#050505]">
            <div className="max-w-[1600px] mx-auto">
              <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10 md:mb-14">
                <div className="lg:col-span-8">
                  <SectionLabel index="01">{t.selectedWork}</SectionLabel>
                  <h2 className="mt-5 text-[clamp(2.5rem,5.8vw,5.7rem)] leading-[0.86] tracking-[-0.065em] font-semibold uppercase">
                    {String(t.selectedWorkTitle).split('\n').map((line, i, arr) => (<React.Fragment key={line}>{line}{i < arr.length - 1 && <br />}</React.Fragment>))}
                  </h2>
                </div>
                <div className="lg:col-span-3 lg:col-start-10 lg:pb-2">
                  <p className="text-sm md:text-base text-white/45 leading-relaxed">
                    {t.selectedWorkDescription}
                  </p>
                </div>
              </Reveal>

              {projectsLoading && projects.length === 0 ? (
                <div className="border-y border-white/10 py-16 text-center text-sm text-white/35">
                  {t.loadingWork}
                </div>
              ) : projectsError && projects.length === 0 ? (
                <div className="border-y border-white/10 py-16 text-center">
                  <p className="text-sm text-white/40">
                    {t.unavailableWork}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-5 rounded-full border border-[#e10600]/45 px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-white/75 hover:bg-[var(--accent)] hover:text-white transition-colors"
                  >
                    {t.retry}
                  </button>
                </div>
              ) : filmProjects.length === 0 ? (
                <div className="border-y border-white/10 py-20 text-center text-sm text-white/35">
                  {t.comingSoon}
                </div>
              ) : (
                <div className="space-y-12 md:space-y-18">
                  {filmProjects.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} t={t} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section id="creative" className="red-rule red-rule-right px-5 md:px-10 lg:px-14 py-18 md:py-24 bg-[#090909]">
            <div className="max-w-[1600px] mx-auto">
              <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-10 md:mb-14">
                <div className="lg:col-span-8">
                  <SectionLabel index="02">{t.creativeDigital}</SectionLabel>
                  <h2 className="mt-5 text-[clamp(2.4rem,5.4vw,5.4rem)] leading-[0.88] tracking-[-0.06em] font-semibold uppercase">
                    {String(t.creativeTitle).split('\n').map((line, i, arr) => (
                      <React.Fragment key={`${line}-${i}`}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h2>
                </div>

                <div className="lg:col-span-3 lg:col-start-10 lg:pb-2">
                  <p className="text-sm md:text-base text-white/45 leading-relaxed">
                    {t.creativeDescription}
                  </p>
                </div>
              </Reveal>

              {creativeProjects.length === 0 ? (
                <div className="border-y border-white/10 py-16 text-center text-sm text-white/30">
                  {t.creativeEmpty}
                </div>
              ) : (
                <div className="space-y-12 md:space-y-18">
                  {creativeProjects.map((project, index) => (
                    <CreativeCard
                      key={`creative-${project.id}`}
                      project={project}
                      index={index}
                      t={t}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="px-3 md:px-6 py-10 md:py-20 bg-[#050505]">
            <Reveal className="max-w-[1800px] mx-auto">
              <div className="signal-frame relative overflow-hidden rounded-[1.4rem] md:rounded-[2.3rem] bg-[#111] aspect-[16/10] sm:aspect-video md:aspect-[16/7.5] md:max-h-[720px]">
                {showreelPlaybackId && showreelPlaying ? (
                  <MuxPlayer
                    playbackId={showreelPlaybackId}
                    streamType="on-demand"
                    autoPlay
                    poster={showreelPoster}
                    videoTitle="Yaël Noukimi Showreel"
                    accentColor={ACCENT}
                    className="w-full h-full"
                    style={{ width: '100%', height: '100%' }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => showreelPlaybackId && setShowreelPlaying(true)}
                    className="absolute inset-0 w-full h-full group"
                    aria-label={t.playShowreel}
                  >
                    <img
                      src={showreelPoster}
                      alt="Showreel"
                      className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:scale-[1.025] transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/15" />

                    <div className="absolute inset-x-5 md:inset-x-10 bottom-6 md:bottom-9 flex items-end justify-between gap-4 text-left">
                      <div>
                        <p className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-white/50 mb-3">{t.showreel}</p>
                        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl uppercase leading-[0.82] tracking-[-0.065em] font-semibold">
                          {String(t.showreelTitle).split('\n').map((line, i, arr) => (<React.Fragment key={line}>{line}{i < arr.length - 1 && <br />}</React.Fragment>))}
                        </h2>
                      </div>

                      <span className="play-ring shrink-0 w-14 h-14 md:w-20 md:h-20 rounded-full bg-[var(--accent)] text-white flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:scale-105 transition-all duration-500">
                        <Play size={28} fill="currentColor" className="ml-1" />
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </Reveal>
          </section>

          <section id="services" className="px-5 md:px-10 lg:px-14 py-18 md:py-24 bg-[#050505]">
            <div className="max-w-[1600px] mx-auto">
              <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 md:mb-24">
                <div className="lg:col-span-7">
                  <SectionLabel index="03">{t.whatIDo}</SectionLabel>
                  <h2 className="mt-5 text-4xl md:text-6xl lg:text-6xl uppercase tracking-[-0.06em] leading-[0.84] font-semibold">
                    {String(t.servicesTitle).split('\n').map((line, i, arr) => (<React.Fragment key={line}>{line}{i < arr.length - 1 && <br />}</React.Fragment>))}
                  </h2>
                </div>
                <p className="lg:col-span-3 lg:col-start-10 lg:self-end text-sm md:text-base text-white/45 leading-relaxed">
                  {t.servicesDescription}
                </p>
              </Reveal>

              <div className="red-rule border-t border-white/10 pt-1">
                {t.services.map(([number, title, description], index) => {
                  const serviceIcons = [Video, Scissors, Sparkles, Camera];
                  const Icon = serviceIcons[index] || Video;
                  return (
                    <Reveal key={number} delay={index * 80}>
                      <div className="group grid grid-cols-[44px_1fr] md:grid-cols-12 gap-5 md:gap-8 border-b border-white/10 py-5 md:py-7 items-start">
                        <span className="md:col-span-1 text-[10px] uppercase tracking-[0.18em] text-white/30 pt-1">
                          {number}
                        </span>
                        <div className="md:col-span-4 flex items-center gap-4">
                          <Icon size={19} className="text-white/35 group-hover:text-[var(--accent)] transition-colors" />
                          <h3 className="text-lg md:text-2xl uppercase tracking-[-0.025em]">
                            {title}
                          </h3>
                        </div>
                        <p className="col-start-2 md:col-span-5 md:col-start-8 text-sm md:text-base text-white/45 leading-relaxed max-w-xl">
                          {description}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="about" className="red-rule red-rule-right bg-[#090909] text-white px-5 md:px-10 lg:px-14 py-18 md:py-24">
            <div className="max-w-[1600px] mx-auto">
              <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                <div className="lg:col-span-5">
                  <SectionLabel index="04">{t.about}</SectionLabel>
                  <div className="signal-frame mt-7 aspect-[4/5] max-w-[430px] rounded-[1.15rem] overflow-hidden bg-white/[0.03] sticky top-28">
                    <img
                      src={siteSettings.about_image_url || 'https://images.unsplash.com/photo-1552168324-d612d77725e3?q=85&w=1600&auto=format&fit=crop'}
                      alt={t.photoAlt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 lg:col-start-7 lg:pt-20">
                  <h2 className="text-[clamp(2rem,4.4vw,4.3rem)] leading-[1.0] tracking-[-0.055em] font-medium">
                    {localizedSettings.about_heading}
                  </h2>

                  <div className="mt-9 md:mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 text-white/50 leading-relaxed text-sm md:text-base">
                    {aboutParagraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="mt-16 md:mt-10 border-t border-white/10">
                    {t.process.map(([number, title, description]) => (
                      <div key={number} className="grid grid-cols-[38px_1fr] md:grid-cols-[60px_180px_1fr] gap-4 border-b border-white/10 py-5 items-start">
                        <span className="text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">{number}</span>
                        <h3 className="text-sm uppercase tracking-[0.08em]">{title}</h3>
                        <p className="col-start-2 md:col-start-auto text-sm text-white/45 leading-relaxed">{description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <section id="contact" className="red-rule red-rule-right bg-[#050505] text-white px-5 md:px-10 lg:px-14 pt-18 md:pt-24 pb-8">
            <div className="max-w-[1600px] mx-auto">
              <Reveal>
                <SectionLabel index="05">{t.contact}</SectionLabel>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 md:mt-12 items-end">
                  <div className="lg:col-span-9">
                    <h2 className="text-[clamp(3rem,7.8vw,7.5rem)] leading-[0.8] tracking-[-0.075em] uppercase font-semibold">
                      {renderMultilineTitle(localizedSettings.contact_heading)}
                    </h2>
                  </div>

                  <div className="lg:col-span-3 lg:pb-2">
                    <p className="text-white/75 leading-relaxed text-sm md:text-base mb-7">
                      {localizedSettings.contact_description}
                    </p>

                    <div className="space-y-3">
                      {whatsappHref && (
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noreferrer"
                          className="min-h-14 w-full rounded-full bg-[var(--accent)] text-white px-5 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] font-semibold hover:bg-white hover:text-black transition-colors shadow-[0_10px_35px_rgba(225,6,0,.18)]"
                        >
                          <span className="flex items-center gap-3"><FaWhatsapp size={18} /> WhatsApp</span>
                          <ArrowUpRight size={15} />
                        </a>
                      )}

                      <a
                        href={`mailto:${siteSettings.contact_email}`}
                        className="min-h-14 w-full rounded-full border border-[#e10600]/60 px-5 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] hover:bg-[var(--accent)] hover:text-white transition-colors"
                      >
                        <span className="flex items-center gap-3"><Mail size={17} /> Email</span>
                        <ArrowUpRight size={15} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-14 md:mt-20 border-t border-[#e10600]/35 pt-7 grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] uppercase tracking-[0.16em] text-white/70">
                  <div>
                    <p className="text-white/45 mb-2">{t.based}</p>
                    <p>{localizedSettings.hero_location_line}</p>
                  </div>
                  <div>
                    <p className="text-white/45 mb-2">Email</p>
                    <a href={`mailto:${siteSettings.contact_email}`} className="hover:text-white">{siteSettings.contact_email}</a>
                  </div>
                  <div className="flex md:justify-end items-end gap-4 text-base">
                    <a href={siteSettings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
                    <a href={siteSettings.tiktok_url} target="_blank" rel="noreferrer" aria-label="TikTok"><FaTiktok /></a>
                    {isRealLinkedInProfile(siteSettings.linkedin_url) && (
                      <a href={siteSettings.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                        <FaLinkedinIn />
                      </a>
                    )}
                    {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#e10600]/25 flex flex-col sm:flex-row justify-between gap-2 text-[9px] uppercase tracking-[0.15em] text-white/50">
                  <p>© {new Date().getFullYear()} {PORTFOLIO_DATA.name}</p>
                  <p>{t.footerRole}</p>
                </div>
              </Reveal>
            </div>
          </section>
        </main>
      ) : (
        <main>
          <ProjectDetail project={selectedProject} projects={displayProjects} t={t} />
          <section id="contact" className="red-rule red-rule-right bg-[#050505] text-white px-5 md:px-10 lg:px-14 py-20">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/55 mb-4">{t.haveProject}</p>
                <h2 className="text-5xl md:text-7xl uppercase tracking-[-0.055em] leading-[0.85] font-semibold">{t.letsTalk}</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {whatsappHref && (
                  <a href={whatsappHref} target="_blank" rel="noreferrer" className="rounded-full bg-[var(--accent)] text-white px-6 py-4 text-[10px] uppercase tracking-[0.16em] font-semibold flex items-center gap-3 hover:bg-white hover:text-black transition-colors">
                    <FaWhatsapp size={17} /> WhatsApp
                  </a>
                )}
                <a href={`mailto:${siteSettings.contact_email}`} className="rounded-full border border-[#e10600]/60 px-6 py-4 text-[10px] uppercase tracking-[0.16em] flex items-center gap-3 hover:bg-[var(--accent)] transition-colors">
                  <Mail size={16} /> Email
                </a>
              </div>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
