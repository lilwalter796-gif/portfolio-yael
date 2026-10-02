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
  shortName: 'YN',
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
  hero_title: 'VISUAL STORIES\nTHAT FEEL ALIVE.',
  hero_roles: 'VIDEOMAKER · FILMMAKER · CONTENT CREATOR',
  hero_location_line: 'BASED IN ITALY · AVAILABLE WORLDWIDE',
  hero_primary_cta: "LET'S WORK TOGETHER",
  hero_secondary_cta: 'SELECTED WORK',
  about_heading:
    "I'm Yaël — a videomaker focused on movement, emotion and stories built for the screen.",
  about_body: [
    'I create audiovisual content for events, brands, artists and social platforms — from concept and shooting to editing, color and final delivery.',
    'My approach is cinematic but practical: every frame has to serve the atmosphere, the message and the platform where the work will live.',
    'Alongside my personal work, I co-founded Visora, an audiovisual studio focused on video production, photography and visual communication.',
    'I am currently studying Management Engineering in Italy, connecting creativity, technology and business in the way I build projects.',
  ].join('\n\n'),
  about_image_url: '',
  contact_heading: "LET'S MAKE\nSOMETHING\nPEOPLE REMEMBER.",
  contact_description:
    'Available for freelance projects, event coverage, branded content and creative collaborations.',
  contact_email: PORTFOLIO_DATA.email,
  whatsapp_number: '',
  instagram_url: PORTFOLIO_DATA.socials.instagram,
  tiktok_url: PORTFOLIO_DATA.socials.tiktok,
  linkedin_url: PORTFOLIO_DATA.socials.linkedin,
};

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
    year: project.year ? String(project.year) : '',
    location: project.location ?? '',
    thumbnail: project.thumbnail_url || FALLBACK_PROJECT_IMAGE,
    previewVideo: project.preview_video_url || '',
    video: featuredVideo?.video_url || '',
    videos,
    description: project.description ?? '',
    roles: Array.isArray(project.roles) ? project.roles : [],
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
        className="w-full h-full"
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

function PreviewMedia({ project, active }) {
  const playbackId = muxPlaybackId(project.video);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!videoRef.current || playbackId || !project.previewVideo) return;

    if (active) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [active, playbackId, project.previewVideo]);

  return (
    <>
      <img
        src={project.thumbnail}
        alt={project.title}
        onError={(event) => {
          event.currentTarget.src = FALLBACK_PROJECT_IMAGE;
        }}
        className={`absolute inset-0 w-full h-full object-cover transition duration-700 ${
          active && (playbackId || project.previewVideo)
            ? 'opacity-0 scale-[1.03]'
            : 'opacity-100 scale-100'
        }`}
        loading="lazy"
      />

      {playbackId && active && (
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay="muted"
          muted
          loop
          playsInline
          preload="metadata"
          poster={project.thumbnail}
          videoTitle={`${project.title} preview`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            width: '100%',
            height: '100%',
            '--controls': 'none',
            '--media-object-fit': 'cover',
            '--media-object-position': 'center',
          }}
        />
      )}

      {!playbackId && project.previewVideo && (
        <video
          ref={videoRef}
          src={project.previewVideo}
          muted
          playsInline
          loop
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 pointer-events-none ${
            active ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </>
  );
}

function ProjectCard({ project, index }) {
  const cardRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [touch, setTouch] = useState(false);
  const [mobileActive, setMobileActive] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(hover: none)');
    const sync = () => setTouch(media.matches);
    sync();
    media.addEventListener?.('change', sync);
    return () => media.removeEventListener?.('change', sync);
  }, []);

  useEffect(() => {
    if (!touch || !cardRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setMobileActive(entry.isIntersecting && entry.intersectionRatio >= 0.6);
      },
      { threshold: [0, 0.35, 0.6, 0.85, 1], rootMargin: '-7% 0px -7% 0px' },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [touch]);

  const active = touch ? mobileActive : hovered;
  const filmCount = project.videos?.length || (project.video ? 1 : 0);

  return (
    <Reveal delay={Math.min(index * 70, 280)}>
      <article ref={cardRef} className="group border-t border-white/10 hover:border-[#e10600]/45 transition-colors duration-500 pt-5 md:pt-7">
        <a
          href={`#work/${project.slug}`}
          className="block"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="flex items-start justify-between gap-4 mb-5 md:mb-7">
            <div className="flex items-start gap-5 md:gap-8 min-w-0">
              <span className="text-[10px] md:text-xs text-white/35 tracking-[0.18em] pt-1">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h3 className="text-[clamp(1.6rem,4vw,4.7rem)] leading-[0.94] tracking-[-0.045em] uppercase font-semibold truncate md:whitespace-normal">
                  {project.title}
                </h3>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] md:text-xs uppercase tracking-[0.15em] text-white/45">
                  {project.category && <span>{project.category}</span>}
                  {project.year && <span>· {project.year}</span>}
                  {filmCount > 0 && (
                    <span>· {String(filmCount).padStart(2, '0')} film{filmCount > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>
            </div>

            <span className="shrink-0 w-11 h-11 md:w-14 md:h-14 rounded-full border border-white/15 flex items-center justify-center group-hover:bg-white group-hover:text-black group-hover:rotate-45 transition-all duration-500">
              <ArrowUpRight size={18} />
            </span>
          </div>

          <div className="signal-frame relative overflow-hidden bg-[#111] aspect-[16/11] md:aspect-[16/8.7] rounded-[1.1rem] md:rounded-[1.8rem]">
            <PreviewMedia project={project} active={active} />

            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/5 pointer-events-none" />

            <div className="absolute left-4 right-4 bottom-4 md:left-7 md:right-7 md:bottom-6 flex items-end justify-between gap-4 pointer-events-none">
              <div className="max-w-[70%]">
                {project.roles.length > 0 && (
                  <p className="text-[9px] md:text-[10px] uppercase tracking-[0.16em] text-white/70 line-clamp-2">
                    {project.roles.slice(0, 3).join(' · ')}
                  </p>
                )}
              </div>

              <span className="rounded-full border border-white/25 bg-black/25 backdrop-blur-md px-3 py-2 text-[9px] md:text-[10px] uppercase tracking-[0.17em] text-white/85">
                {active ? 'Playing preview' : 'View project'}
              </span>
            </div>
          </div>
        </a>
      </article>
    </Reveal>
  );
}

function ProjectDetail({ project, projects }) {
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
          ← Back to work
        </button>
        <p className="mt-20 text-white/45">Project not found.</p>
      </div>
    );
  }

  const currentIndex = projects.findIndex((item) => item.id === project.id);
  const nextProject =
    projects.length > 1 ? projects[(currentIndex + 1) % projects.length] : null;

  const additionalVideos = (project.videos || []).filter(
    (video) => video.video_url !== project.video,
  );

  return (
    <div className="bg-[#050505] text-white min-h-screen pt-28 md:pt-36 pb-24">
      <div className="px-5 md:px-10 lg:px-14 max-w-[1600px] mx-auto">
        <button
          onClick={() => {
            window.location.hash = '';
          }}
          className="text-[10px] md:text-xs uppercase tracking-[0.18em] text-white/45 hover:text-white transition-colors"
        >
          ← Selected work
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-10 md:mt-16 mb-10 md:mb-14 items-end">
          <div className="lg:col-span-9">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.18em] text-white/40 mb-5">
              {[project.category, project.year, project.location].filter(Boolean).join(' · ')}
            </p>
            <h1 className="text-[clamp(3.3rem,10vw,10rem)] leading-[0.8] tracking-[-0.065em] font-semibold uppercase break-words">
              {project.title}
            </h1>
          </div>

          <div className="lg:col-span-3 lg:pb-2 text-sm text-white/50 leading-relaxed">
            {project.roles.length > 0 && project.roles.slice(0, 5).map((role) => (
              <p key={role}>{role}</p>
            ))}
          </div>
        </div>
      </div>

      <div className="px-0 md:px-5 lg:px-8 max-w-[1800px] mx-auto">
        <div className="signal-frame relative bg-black overflow-hidden md:rounded-[1.8rem] aspect-video md:aspect-[16/8.5]">
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
              className="w-full h-full object-cover"
              onError={(event) => {
                event.currentTarget.src = FALLBACK_PROJECT_IMAGE;
              }}
            />
          )}
        </div>
      </div>

      <div className="px-5 md:px-10 lg:px-14 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 py-24 md:py-32 border-b border-white/10">
          <div className="lg:col-span-3">
            <SectionLabel index="01">Project</SectionLabel>
          </div>
          <div className="lg:col-span-8 lg:col-start-5">
            <p className="text-2xl md:text-4xl lg:text-5xl leading-[1.08] tracking-[-0.035em] text-white/90">
              {project.description || 'Project details coming soon.'}
            </p>
          </div>
        </div>

        {additionalVideos.length > 0 && (
          <section className="py-24 md:py-32 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 md:mb-16">
              <div>
                <SectionLabel index="02">Selected films</SectionLabel>
                <h2 className="mt-5 text-4xl md:text-6xl lg:text-7xl tracking-[-0.055em] uppercase font-semibold leading-[0.9]">
                  More from<br />this project.
                </h2>
              </div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/35">
                {String(additionalVideos.length).padStart(2, '0')} additional film{additionalVideos.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-6 lg:gap-10 items-start">
              {additionalVideos.map((film, index) => {
                const orientation = film.orientation || 'horizontal';
                const aspectClass =
                  orientation === 'vertical'
                    ? 'aspect-[9/16] md:max-w-[460px]'
                    : orientation === 'square'
                      ? 'aspect-square'
                      : 'aspect-video';

                return (
                  <article
                    key={film.id || `${film.video_url}-${index}`}
                    className={index % 2 === 1 ? 'md:mt-20' : ''}
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
          <section className="py-24 md:py-32 border-b border-white/10">
            <SectionLabel index={additionalVideos.length > 0 ? '03' : '02'}>Frames</SectionLabel>
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
              Next project
            </p>
            <a href={`#work/${nextProject.slug}`} className="group flex items-end justify-between gap-6 border-b border-white/10 pb-8">
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
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState('');
  const [siteSettings, setSiteSettings] = useState(DEFAULT_SETTINGS);
  const [route, setRoute] = useState({ path: 'home', slug: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showreelPlaying, setShowreelPlaying] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProjects() {
      setProjectsLoading(true);
      setProjectsError('');

      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_videos (
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
          )
        `)
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        console.error('Unable to load portfolio projects:', error);
        setProjects([]);
        setProjectsError(error.message);
      } else {
        setProjects((data ?? []).map(normalizeProject));
      }

      setProjectsLoading(false);
    }

    loadProjects();
    return () => {
      active = false;
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
          about_heading,
          about_body,
          about_image_url,
          contact_heading,
          contact_description,
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
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileMenuOpen]);

  const showreelPlaybackId = muxPlaybackId(siteSettings.showreel_url);
  const showreelPoster = showreelPlaybackId
    ? `https://image.mux.com/${showreelPlaybackId}/thumbnail.jpg?width=1800&fit_mode=smartcrop`
    : FALLBACK_PROJECT_IMAGE;

  const whatsappDigits = String(siteSettings.whatsapp_number || '').replace(/\D/g, '');
  const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : '';

  const aboutParagraphs = useMemo(
    () =>
      String(siteSettings.about_body || '')
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean),
    [siteSettings.about_body],
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

  const selectedProject = projects.find((project) => project.slug === route.slug);

  return (
    <div
      className="min-h-screen bg-[#050505] text-white font-sans antialiased overflow-x-hidden selection:bg-[var(--accent)] selection:text-white"
      style={{ '--accent': ACCENT }}
    >
      <style>{`
        html { background: #050505; }
        body { background: #050505; }
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

        .signal-frame {
          position: relative;
          border: 1px solid rgba(225, 6, 0, .28);
          box-shadow:
            0 0 0 1px rgba(255,255,255,.018) inset,
            0 20px 70px rgba(0,0,0,.28);
        }

        .signal-frame::before {
          content: '';
          position: absolute;
          z-index: 30;
          left: 7%;
          top: -1px;
          width: 28%;
          height: 2px;
          background: var(--accent);
          box-shadow: 0 0 18px rgba(225, 6, 0, .42);
          pointer-events: none;
        }

        .signal-frame::after {
          content: '';
          position: absolute;
          z-index: 30;
          right: -1px;
          top: 13%;
          width: 2px;
          height: 24%;
          background: var(--accent);
          box-shadow: 0 0 18px rgba(225, 6, 0, .36);
          pointer-events: none;
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
        @media (prefers-reduced-motion: reduce) {
          .hero-in, .pulse-dot { animation: none !important; }
          * { scroll-behavior: auto !important; }
        }
      `}</style>

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
              <span className="hidden sm:block text-[10px] md:text-xs uppercase tracking-[0.17em] text-white/85 truncate">
                {PORTFOLIO_DATA.name}
              </span>
            </a>

            <div className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] p-1">
              {['work', 'about', 'services'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item)}
                  className="px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-white/55 hover:text-white transition-colors rounded-full"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrimaryCta}
                className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white text-black px-4 md:px-5 py-2.5 text-[9px] md:text-[10px] uppercase tracking-[0.15em] font-semibold hover:bg-[var(--accent)] hover:text-white transition-colors"
              >
                Contact
                <ArrowUpRight size={13} />
              </button>

              <button
                className="md:hidden w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label="Toggle menu"
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
                  className="flex items-center justify-between border-b border-white/10 py-5 text-left text-4xl uppercase tracking-[-0.04em]"
                >
                  <span>{item}</span>
                  <span className="text-xs text-white/30">0{index + 1}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-5 text-white/50">
              <a href={siteSettings.instagram_url} target="_blank" rel="noreferrer"><FaInstagram /></a>
              <a href={siteSettings.tiktok_url} target="_blank" rel="noreferrer"><FaTiktok /></a>
              <a href={siteSettings.linkedin_url} target="_blank" rel="noreferrer"><FaLinkedinIn /></a>
              {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer"><FaWhatsapp /></a>}
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

              <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-black/90" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/10" />
            </div>

            <div className="relative z-10 w-full max-w-[1600px] mx-auto px-5 md:px-10 lg:px-14 pb-8 md:pb-10 pt-36">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8 md:mb-12 hero-in hero-delay-1">
                <div className="flex items-center gap-3 text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-white/65">
                  <span className="w-2 h-2 rounded-full bg-[var(--accent)] pulse-dot" />
                  <span>Available for selected projects</span>
                </div>
                <span className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-white/45">
                  {siteSettings.hero_location_line}
                </span>
              </div>

              <h1 className="hero-in text-[clamp(4.2rem,12vw,12.5rem)] leading-[0.73] tracking-[-0.075em] font-semibold uppercase max-w-[1450px]">
                {renderMultilineTitle(siteSettings.hero_title)}
              </h1>

              <div className="hero-in hero-delay-2 mt-7 md:mt-10 grid grid-cols-1 md:grid-cols-12 gap-7 md:items-end">
                <p className="md:col-span-5 lg:col-span-4 text-xs md:text-sm uppercase tracking-[0.16em] text-white/65 leading-relaxed">
                  {siteSettings.hero_roles}
                </p>

                <div className="md:col-span-7 lg:col-span-5 lg:col-start-8 flex flex-col sm:flex-row gap-3 md:justify-end">
                  <button
                    onClick={handlePrimaryCta}
                    className="min-h-14 px-6 rounded-full bg-white text-black flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.16em] font-semibold hover:bg-[var(--accent)] hover:text-white transition-colors"
                  >
                    <span>{siteSettings.hero_primary_cta}</span>
                    <ArrowUpRight size={16} />
                  </button>
                  <button
                    onClick={() => scrollToSection('work')}
                    className="min-h-14 px-6 rounded-full border border-white/20 bg-black/20 backdrop-blur-md flex items-center justify-between gap-6 text-[10px] uppercase tracking-[0.16em] hover:border-white/55 transition-colors"
                  >
                    <span>{siteSettings.hero_secondary_cta}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="hero-in hero-delay-3 mt-10 md:mt-12 border-t border-white/15 pt-5 flex items-center justify-between text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-white/35">
                <span>Videomaker / Editor / Content Creator</span>
                <button onClick={() => scrollToSection('work')} className="flex items-center gap-2 hover:text-white transition-colors">
                  Scroll to work <span>↓</span>
                </button>
              </div>
            </div>
          </section>

          <section id="work" className="px-5 md:px-10 lg:px-14 py-24 md:py-36 bg-[#050505]">
            <div className="max-w-[1600px] mx-auto">
              <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16 md:mb-24">
                <div className="lg:col-span-8">
                  <SectionLabel index="01">Selected work</SectionLabel>
                  <h2 className="mt-5 text-[clamp(3rem,8vw,8rem)] leading-[0.8] tracking-[-0.065em] font-semibold uppercase">
                    Films first.<br />Everything else second.
                  </h2>
                </div>
                <div className="lg:col-span-3 lg:col-start-10 lg:pb-2">
                  <p className="text-sm md:text-base text-white/45 leading-relaxed">
                    A selection of event films, campaigns, social content and visual stories.
                  </p>
                </div>
              </Reveal>

              {projectsLoading ? (
                <div className="border-y border-white/10 py-24 text-center text-sm text-white/35">
                  Loading selected work…
                </div>
              ) : projectsError ? (
                <div className="border-y border-white/10 py-24 text-center text-sm text-white/35">
                  Projects are temporarily unavailable.
                </div>
              ) : projects.length === 0 ? (
                <div className="border-y border-white/10 py-24 text-center text-sm text-white/35">
                  Selected work coming soon.
                </div>
              ) : (
                <div className="space-y-20 md:space-y-28">
                  {projects.map((project, index) => (
                    <ProjectCard key={project.id} project={project} index={index} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="px-3 md:px-6 py-10 md:py-20 bg-[#050505]">
            <Reveal className="max-w-[1800px] mx-auto">
              <div className="signal-frame relative overflow-hidden rounded-[1.4rem] md:rounded-[2.3rem] bg-[#111] aspect-[4/5] sm:aspect-video md:aspect-[16/8]">
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
                    aria-label="Play showreel"
                  >
                    <img
                      src={showreelPoster}
                      alt="Showreel"
                      className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:scale-[1.025] transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/15" />

                    <div className="absolute inset-x-5 md:inset-x-10 bottom-6 md:bottom-9 flex items-end justify-between gap-4 text-left">
                      <div>
                        <p className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] text-white/50 mb-3">Showreel</p>
                        <h2 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl uppercase leading-[0.78] tracking-[-0.065em] font-semibold">
                          60 seconds<br />of motion.
                        </h2>
                      </div>

                      <span className="shrink-0 w-16 h-16 md:w-24 md:h-24 rounded-full bg-white text-black flex items-center justify-center group-hover:bg-[var(--accent)] group-hover:text-white group-hover:scale-105 transition-all duration-500">
                        <Play size={28} fill="currentColor" className="ml-1" />
                      </span>
                    </div>
                  </button>
                )}
              </div>
            </Reveal>
          </section>

          <section id="services" className="px-5 md:px-10 lg:px-14 py-24 md:py-36 bg-[#050505]">
            <div className="max-w-[1600px] mx-auto">
              <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 md:mb-24">
                <div className="lg:col-span-7">
                  <SectionLabel index="02">What I do</SectionLabel>
                  <h2 className="mt-5 text-5xl md:text-7xl lg:text-8xl uppercase tracking-[-0.06em] leading-[0.84] font-semibold">
                    Built around<br />the moving image.
                  </h2>
                </div>
                <p className="lg:col-span-3 lg:col-start-10 lg:self-end text-sm md:text-base text-white/45 leading-relaxed">
                  Video is the core. Photography and design support the story when the project needs them.
                </p>
              </Reveal>

              <div className="red-rule border-t border-white/10 pt-1">
                {SERVICES.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <Reveal key={service.number} delay={index * 80}>
                      <div className="group grid grid-cols-[44px_1fr] md:grid-cols-12 gap-5 md:gap-8 border-b border-white/10 py-7 md:py-10 items-start">
                        <span className="md:col-span-1 text-[10px] uppercase tracking-[0.18em] text-white/30 pt-1">
                          {service.number}
                        </span>
                        <div className="md:col-span-4 flex items-center gap-4">
                          <Icon size={19} className="text-white/35 group-hover:text-[var(--accent)] transition-colors" />
                          <h3 className="text-xl md:text-3xl uppercase tracking-[-0.025em]">
                            {service.title}
                          </h3>
                        </div>
                        <p className="col-start-2 md:col-span-5 md:col-start-8 text-sm md:text-base text-white/45 leading-relaxed max-w-xl">
                          {service.description}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="about" className="red-rule red-rule-right bg-[#090909] text-white px-5 md:px-10 lg:px-14 py-24 md:py-36">
            <div className="max-w-[1600px] mx-auto">
              <Reveal className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                <div className="lg:col-span-5">
                  <SectionLabel index="03">About</SectionLabel>
                  <div className="signal-frame mt-8 aspect-[4/5] rounded-[1.3rem] overflow-hidden bg-white/[0.03] sticky top-28">
                    <img
                      src={siteSettings.about_image_url || 'https://images.unsplash.com/photo-1552168324-d612d77725e3?q=85&w=1600&auto=format&fit=crop'}
                      alt="Yaël Noukimi"
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 lg:col-start-7 lg:pt-20">
                  <h2 className="text-[clamp(2.4rem,5.7vw,6rem)] leading-[0.95] tracking-[-0.055em] font-medium">
                    {siteSettings.about_heading}
                  </h2>

                  <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 text-white/50 leading-relaxed text-sm md:text-base">
                    {aboutParagraphs.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>

                  <div className="mt-16 md:mt-20 border-t border-white/10">
                    {PROCESS.map(([number, title, description]) => (
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

          <section id="contact" className="red-rule red-rule-right bg-[#050505] text-white px-5 md:px-10 lg:px-14 pt-24 md:pt-36 pb-8">
            <div className="max-w-[1600px] mx-auto">
              <Reveal>
                <SectionLabel index="04">Contact</SectionLabel>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 md:mt-12 items-end">
                  <div className="lg:col-span-9">
                    <h2 className="text-[clamp(4rem,11vw,11rem)] leading-[0.73] tracking-[-0.075em] uppercase font-semibold">
                      {renderMultilineTitle(siteSettings.contact_heading)}
                    </h2>
                  </div>

                  <div className="lg:col-span-3 lg:pb-2">
                    <p className="text-white/75 leading-relaxed text-sm md:text-base mb-7">
                      {siteSettings.contact_description}
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

                <div className="mt-20 md:mt-28 border-t border-[#e10600]/35 pt-7 grid grid-cols-1 md:grid-cols-3 gap-6 text-[10px] uppercase tracking-[0.16em] text-white/70">
                  <div>
                    <p className="text-white/45 mb-2">Based</p>
                    <p>{siteSettings.hero_location_line}</p>
                  </div>
                  <div>
                    <p className="text-white/45 mb-2">Email</p>
                    <a href={`mailto:${siteSettings.contact_email}`} className="hover:text-white">{siteSettings.contact_email}</a>
                  </div>
                  <div className="flex md:justify-end items-end gap-4 text-base">
                    <a href={siteSettings.instagram_url} target="_blank" rel="noreferrer" aria-label="Instagram"><FaInstagram /></a>
                    <a href={siteSettings.tiktok_url} target="_blank" rel="noreferrer" aria-label="TikTok"><FaTiktok /></a>
                    <a href={siteSettings.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn"><FaLinkedinIn /></a>
                    {whatsappHref && <a href={whatsappHref} target="_blank" rel="noreferrer" aria-label="WhatsApp"><FaWhatsapp /></a>}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-[#e10600]/25 flex flex-col sm:flex-row justify-between gap-2 text-[9px] uppercase tracking-[0.15em] text-white/50">
                  <p>© {new Date().getFullYear()} {PORTFOLIO_DATA.name}</p>
                  <p>Videomaker · Editor · Content Creator</p>
                </div>
              </Reveal>
            </div>
          </section>
        </main>
      ) : (
        <main>
          <ProjectDetail project={selectedProject} projects={projects} />
          <section id="contact" className="red-rule red-rule-right bg-[#050505] text-white px-5 md:px-10 lg:px-14 py-20">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/55 mb-4">Have a project?</p>
                <h2 className="text-5xl md:text-7xl uppercase tracking-[-0.055em] leading-[0.85] font-semibold">Let's talk.</h2>
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
