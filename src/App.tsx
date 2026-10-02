// @ts-nocheck
import React, { useState, useEffect } from 'react';

import {
  Menu,
  X,
  Play,
  ArrowRight,
  Mail,
  Video,
  Camera,
  Scissors,
  Lightbulb,
  ChevronRight
} from 'lucide-react';

import {
  FaInstagram,
  FaLinkedinIn,
  FaTiktok
} from 'react-icons/fa6';

import { supabase } from './lib/supabase';
import MuxPlayer from '@mux/mux-player-react';

// DATA CONFIGURATION - MODIFY YOUR CONTENT HERE
const PORTFOLIO_DATA = {
  name: "Yaël Noukimi",
  roles: ["Videomaker", "Photographer", "Content Creator"],
  tagline: "I create visual content that makes people stop, watch and remember.",
  location: "Italy",
  email: "hello@yaelnoukimi.com", // Replace with actual email
  socials: {
    instagram: "https://instagram.com/",
    tiktok: "https://tiktok.com/",
    linkedin: "https://linkedin.com/"
  },
  about: {
    p1: "Hi, I'm Yaël.",
    p2: "I'm a videomaker, photographer and content creator based in Italy.",
    p3: "My work combines creativity, storytelling and digital communication to create visual content designed not only to look good, but to communicate an idea, an atmosphere or a brand identity.",
    p4: "I've worked on events, promotional campaigns, social media content and audiovisual projects, handling different stages of production — from concept and shooting to editing and final delivery.",
    p5: "Alongside my personal work, I co-founded Visora, an audiovisual project focused on video production, photography and visual communication.",
    p6: "I'm currently studying Management Engineering (Ingegneria Gestionale) at the University of Modena and Reggio Emilia, developing skills that connect creativity, technology and business."
  }
};

const FALLBACK_PROJECT_IMAGE =
  'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop';

const normalizeProject = (project) => ({
  id: project.id,
  slug: project.slug,
  title: project.title,
  category: project.category ?? '',
  year: project.year ? String(project.year) : '',
  location: project.location ?? '',
  thumbnail: project.thumbnail_url || FALLBACK_PROJECT_IMAGE,
  previewVideo: project.preview_video_url || '',
  video: project.video_url || '',
  description: project.description ?? '',
  roles: Array.isArray(project.roles) ? project.roles : [],
  gallery: Array.isArray(project.gallery) ? project.gallery : [],
});

const getYouTubeEmbedUrl = (url = '') => {
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
};

const getVimeoEmbedUrl = (url = '') => {
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
};

const isDirectVideoUrl = (url = '') =>
  /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);

const ProjectVideoPlayer = ({ url, poster, title }) => {
  if (!url) return null;

  if (url.startsWith('mux://')) {
    const playbackId = url.replace('mux://', '').trim();

    return (
      <MuxPlayer
        playbackId={playbackId}
        streamType="on-demand"
        poster={poster}
        videoTitle={title}
        accentColor="#ffffff"
        className="w-full h-full"
        style={{ width: '100%', height: '100%', aspectRatio: '16 / 9' }}
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
      className="w-full h-full object-cover"
    />
  );
};

const SERVICES = [
  {
    title: "VIDEO PRODUCTION",
    icon: <Video className="w-6 h-6 mb-4 text-gray-400" />,
    items: ["Event Coverage", "Aftermovies", "Promotional Videos", "Interviews", "Teasers", "Social Media Content"]
  },
  {
    title: "PHOTOGRAPHY",
    icon: <Camera className="w-6 h-6 mb-4 text-gray-400" />,
    items: ["Events", "Portraits", "Lifestyle", "Commercial Photography"]
  },
  {
    title: "POST-PRODUCTION",
    icon: <Scissors className="w-6 h-6 mb-4 text-gray-400" />,
    items: ["Video Editing", "Color Grading", "Sound Design", "Short-form Content"]
  },
  {
    title: "CONTENT CREATION",
    icon: <Lightbulb className="w-6 h-6 mb-4 text-gray-400" />,
    items: ["Creative Concepts", "Social Media Campaigns", "Visual Storytelling", "Content Strategy"]
  }
];

const PROCESS = [
  { step: "01", title: "IDEA", desc: "Understanding the project, audience and objective." },
  { step: "02", title: "CREATE", desc: "Concept development and preparation." },
  { step: "03", title: "SHOOT", desc: "Video and photography production." },
  { step: "04", title: "EDIT", desc: "Editing, color grading and sound design." },
  { step: "05", title: "DELIVER", desc: "Content optimized for the intended platform." }
];

const TOOLS = ["Adobe Premiere Pro", "DaVinci Resolve", "Adobe Photoshop", "CapCut", "Sony Alpha"];

// Fade in on scroll hook
const useScrollFade = () => {
  const [isVisible, setVisible] = useState(false);
  const domRef = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setVisible(entry.isIntersecting));
    }, { threshold: 0.1 });
    
    const currentRef = domRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return [domRef, isVisible];
};

const SectionHeading = ({ children, className = "" }) => (
  <h2 className={`text-sm tracking-[0.2em] uppercase text-gray-400 mb-12 font-medium ${className}`}>
    {children}
  </h2>
);

// --- NOUVEAU COMPOSANT : PAGE DÉTAIL DU PROJET ---
const ProjectDetail = ({ project, projects }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-black text-white pt-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.location.hash = '';
            }}
            className="inline-flex items-center text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-white transition-colors"
          >
            &larr; Back to Work
          </a>
          <p className="mt-16 text-gray-500">Project not found.</p>
        </div>
      </div>
    );
  }

  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const nextProject =
    projects.length > 1
      ? projects[(currentIndex + 1) % projects.length]
      : null;

  const handleImgError = (e) => {
    e.currentTarget.src = FALLBACK_PROJECT_IMAGE;
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-20 animate-hero-fade">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.location.hash = '';
          }}
          className="inline-flex items-center text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to Work
        </a>
      </div>

      <header className="max-w-7xl mx-auto px-6 md:px-12 mb-12 md:mb-20">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter mb-6">
          {project.title}
        </h1>
        <p className="text-xs md:text-sm text-gray-400 tracking-[0.2em] uppercase">
          {[project.category, project.year, project.location]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      <div className="w-full aspect-video md:aspect-[21/9] bg-zinc-900 mb-20 overflow-hidden relative">
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
            onError={handleImgError}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32">
        <div className="lg:col-span-8">
          <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-6">
            Overview
          </h2>
          <p className="text-lg md:text-xl font-light leading-relaxed text-gray-200">
            {project.description || 'Project details coming soon.'}
          </p>
        </div>

        <div className="lg:col-span-4 lg:col-start-9 border-t border-white/10 pt-8 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-12">
          <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-6">
            My Role
          </h2>
          {project.roles.length > 0 ? (
            <ul className="space-y-3">
              {project.roles.map((role, i) => (
                <li key={i} className="text-sm tracking-wide text-gray-300">
                  {role}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-600">To be added.</p>
          )}
        </div>
      </div>

      {project.gallery.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-32">
          {project.gallery.map((img, i) => (
            <div
              key={`${img}-${i}`}
              className={`w-full bg-zinc-900 overflow-hidden ${
                i % 3 === 0 ? 'md:col-span-2 aspect-video' : 'aspect-square'
              }`}
            >
              <img
                src={img}
                alt={`${project.title} Gallery ${i + 1}`}
                onError={handleImgError}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {nextProject && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-white/10 pt-20 text-center">
          <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mb-6">
            Next Project
          </p>
          <a href={`#work/${nextProject.slug}`} className="inline-block group">
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter mb-4 group-hover:text-gray-300 transition-colors">
              {nextProject.title}
            </h3>
            <span className="text-xs tracking-[0.15em] uppercase flex justify-center items-center text-gray-400 group-hover:text-white transition-colors">
              View Project
              <ArrowRight
                size={14}
                className="ml-2 transform group-hover:translate-x-2 transition-transform"
              />
            </span>
          </a>
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ project, index, isVisible }) => {
  const videoRef = React.useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const isEven = index % 2 === 0;

  const muxPlaybackId =
    typeof project.video === 'string' && project.video.startsWith('mux://')
      ? project.video.replace('mux://', '').trim()
      : '';

  const handleMouseEnter = () => {
    setIsHovered(true);

    // Compatibilité avec un ancien preview_video_url si un projet en possède déjà un.
    if (!muxPlaybackId && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);

    if (!muxPlaybackId && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleImgError = (e) => {
    e.currentTarget.src = FALLBACK_PROJECT_IMAGE;
  };

  return (
    <div
      className={
        isEven
          ? 'md:col-span-7 md:col-start-1'
          : 'md:col-span-5 md:col-start-8 md:mt-40'
      }
    >
      <a
        href={`#work/${project.slug}`}
        className={`group block w-full transition-all duration-1000 transform ${
          isVisible
            ? 'translate-y-0 opacity-100'
            : 'translate-y-20 opacity-0'
        }`}
        style={{ transitionDelay: `${(index % 2) * 150}ms` }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={`View project ${project.title}`}
      >
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-zinc-900 mb-6">
          <img
            src={project.thumbnail}
            alt={project.title}
            onError={handleImgError}
            className={`w-full h-full object-cover transition-all duration-500 ${
              isHovered && (muxPlaybackId || project.previewVideo)
                ? 'scale-105 opacity-0'
                : 'group-hover:scale-105 opacity-90 group-hover:opacity-60'
            }`}
            loading="lazy"
          />

          {muxPlaybackId && isHovered && (
            <MuxPlayer
              playbackId={muxPlaybackId}
              streamType="on-demand"
              autoPlay
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

          {!muxPlaybackId && project.previewVideo && (
            <video
              ref={videoRef}
              src={project.previewVideo}
              muted
              playsInline
              loop
              preload="none"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            />
          )}
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-medium tracking-wide mb-1 uppercase">
              {project.title}
            </h3>
            <p className="text-xs text-gray-400 tracking-[0.15em] uppercase">
              {[project.category, project.year]
                .filter(Boolean)
                .join(' · ')}
            </p>
          </div>

          <div className="md:text-right flex flex-col md:items-end">
            {project.roles.length > 0 && (
              <p className="text-xs text-gray-500 tracking-[0.1em] uppercase mb-3">
                {project.roles.join(' · ')}
              </p>
            )}
            <span className="text-xs font-medium tracking-[0.15em] uppercase flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0">
              View Project
              <ArrowRight size={14} className="ml-2" />
            </span>
          </div>
        </div>
      </a>
    </div>
  );
};

// ----------------------------------------

export default function Portfolio() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState({ path: 'home', slug: null });
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState('');
  const [siteSettings, setSiteSettings] = useState({
    showreel_url: '',
    hero_title: 'VISUAL STORIES\nTHAT FEEL ALIVE.',
    hero_roles: 'VIDEOMAKER · PHOTOGRAPHER · CONTENT CREATOR',
    hero_location_line: 'BASED IN ITALY · AVAILABLE WORLDWIDE',
    hero_primary_cta: "LET'S WORK TOGETHER",
    hero_secondary_cta: 'VIEW MY WORK',
    about_heading: "Hi, I'm Yaël. I'm a videomaker, photographer and content creator based in Italy.",
    about_body: [
      "My work combines creativity, storytelling and digital communication to create visual content designed not only to look good, but to communicate an idea, an atmosphere or a brand identity.",
      "I've worked on events, promotional campaigns, social media content and audiovisual projects, handling different stages of production — from concept and shooting to editing and final delivery.",
      "Alongside my personal work, I co-founded Visora, an audiovisual project focused on video production, photography and visual communication.",
      "I'm currently studying Management Engineering (Ingegneria Gestionale) at the University of Modena and Reggio Emilia, developing skills that connect creativity, technology and business.",
    ].join('\n\n'),
    about_image_url: '',
    contact_heading: "LET'S CREATE\nSOMETHING\nMEMORABLE.",
    contact_description: 'Available for freelance projects, collaborations and professional opportunities.',
    contact_email: PORTFOLIO_DATA.email,
    instagram_url: PORTFOLIO_DATA.socials.instagram,
    tiktok_url: PORTFOLIO_DATA.socials.tiktok,
    linkedin_url: PORTFOLIO_DATA.socials.linkedin,
  });

  useEffect(() => {
    let active = true;

    const loadPublishedProjects = async () => {
      setProjectsLoading(true);
      setProjectsError('');

      const { data, error } = await supabase
        .from('projects')
        .select('*')
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
    };

    loadPublishedProjects();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadSiteSettings = async () => {
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
          instagram_url,
          tiktok_url,
          linkedin_url
        `)
        .eq('id', 'main')
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.error('Unable to load site settings:', error);
        return;
      }

      setSiteSettings((current) => ({
        ...current,
        showreel_url: data?.showreel_url ?? '',
        hero_title: data?.hero_title || current.hero_title,
        hero_roles: data?.hero_roles || current.hero_roles,
        hero_location_line: data?.hero_location_line || current.hero_location_line,
        hero_primary_cta: data?.hero_primary_cta || current.hero_primary_cta,
        hero_secondary_cta: data?.hero_secondary_cta || current.hero_secondary_cta,
        about_heading: data?.about_heading || current.about_heading,
        about_body: data?.about_body || current.about_body,
        about_image_url: data?.about_image_url ?? '',
        contact_heading: data?.contact_heading || current.contact_heading,
        contact_description: data?.contact_description || current.contact_description,
        contact_email: data?.contact_email || current.contact_email,
        instagram_url: data?.instagram_url || current.instagram_url,
        tiktok_url: data?.tiktok_url || current.tiktok_url,
        linkedin_url: data?.linkedin_url || current.linkedin_url,
      }));
    };

    loadSiteSettings();

    return () => {
      active = false;
    };
  }, []);

  const showreelMuxPlaybackId =
    typeof siteSettings.showreel_url === 'string' &&
    siteSettings.showreel_url.startsWith('mux://')
      ? siteSettings.showreel_url.replace('mux://', '').trim()
      : '';

  const showreelPoster = showreelMuxPlaybackId
    ? `https://image.mux.com/${showreelMuxPlaybackId}/thumbnail.jpg?width=1600&fit_mode=smartcrop`
    : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop';

  const renderMultilineTitle = (value) =>
    String(value || '')
      .split('\n')
      .map((line, index, lines) => (
        <React.Fragment key={`${line}-${index}`}>
          {line}
          {index < lines.length - 1 && <br />}
        </React.Fragment>
      ));

  const aboutParagraphs = String(siteSettings.about_body || '')
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  // Handle routing based on hash change (Single Page routing sans React Router)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('work/')) {
        setCurrentRoute({ path: 'project', slug: hash.split('/')[1] });
      } else {
        setCurrentRoute({ path: 'home', slug: null });
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Execute once on mount
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle scroll for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    if (currentRoute.path !== 'home') {
      window.location.hash = ''; // Return home first
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const Navbar = () => (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${
      isScrolled ? 'bg-black/90 backdrop-blur-md py-4 border-b border-white/5' : 'bg-transparent py-8'
    }`}>
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        {/* Logo */}
        <a 
          href="#" 
          className="text-sm md:text-base tracking-[0.2em] font-medium text-white z-50 uppercase" 
          onClick={(e) => { 
            e.preventDefault(); 
            window.location.hash = ''; 
            window.scrollTo({top:0, behavior:'smooth'});
          }}
        >
          {PORTFOLIO_DATA.name}
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {['work', 'about', 'services'].map((item) => (
            <button 
              key={item}
              onClick={() => scrollTo(item)}
              className="text-xs tracking-[0.15em] uppercase text-gray-300 hover:text-white transition-colors"
            >
              {item}
            </button>
          ))}
          <button 
            onClick={() => scrollTo('contact')}
            className="text-xs tracking-[0.15em] uppercase bg-white text-black px-7 py-3 hover:bg-gray-200 transition-colors font-medium"
          >
            Let's Work Together
          </button>
        </div>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden text-white z-50"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      <div className={`fixed inset-0 bg-black z-40 transition-transform duration-500 ease-in-out md:hidden ${
        mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'
      } flex flex-col items-center justify-center space-y-8`}>
        {['work', 'about', 'services', 'contact'].map((item) => (
          <button 
            key={item}
            onClick={() => scrollTo(item)}
            className="text-2xl tracking-[0.1em] uppercase text-white hover:text-gray-400 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
    </nav>
  );

  const HeroSection = () => {
    return (
      <section className="relative h-screen w-full flex items-end pb-24 md:pb-32 px-6 md:px-12 overflow-hidden bg-black">
        {/* CSS Animations for Hero */}
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-hero-fade { animation: none; opacity: 1; transform: none; }
          }
          .animate-hero-fade {
            animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
          }
          .delay-100 { animation-delay: 100ms; }
          .delay-300 { animation-delay: 300ms; }
          .delay-500 { animation-delay: 500ms; }
        `}</style>

        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          {showreelMuxPlaybackId ? (
            <MuxPlayer
              playbackId={showreelMuxPlaybackId}
              streamType="on-demand"
              autoPlay="muted"
              muted
              loop
              playsInline
              preload="metadata"
              videoTitle="Yaël Noukimi Showreel"
              className="w-full h-full opacity-80 pointer-events-none"
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
              poster="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop"
              className="w-full h-full object-cover opacity-80"
            >
              <source src="/assets/videos/hero-showreel.mp4" type="video/mp4" />
            </video>
          )}
          {/* Cinematic Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Main Content - Bottom Left Aligned */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start text-left">
          <h1 className="text-[clamp(3rem,8vw,8rem)] font-bold text-white mb-6 tracking-tighter leading-[0.9] uppercase animate-hero-fade">
            {renderMultilineTitle(siteSettings.hero_title)}
          </h1>
          
          <div className="animate-hero-fade delay-100">
            <p className="text-sm md:text-lg text-gray-200 font-light tracking-wide mb-2 uppercase">
              {siteSettings.hero_roles}
            </p>
            <p className="text-xs md:text-sm text-gray-400 tracking-[0.1em] uppercase">
              {siteSettings.hero_location_line}
            </p>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-8 animate-hero-fade delay-300 w-full sm:w-auto">
            <button 
              onClick={() => scrollTo('contact')}
              className="w-full sm:w-auto px-10 py-4 bg-white text-black hover:bg-gray-200 transition-all duration-300 tracking-[0.15em] text-xs uppercase font-medium flex items-center justify-center gap-3"
            >
              {siteSettings.hero_primary_cta} <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => scrollTo('work')}
              className="text-xs tracking-[0.15em] uppercase text-white border-b border-white/30 pb-1 hover:border-white transition-all duration-300"
            >
              {siteSettings.hero_secondary_cta}
            </button>
          </div>
        </div>

        {/* Discreet Scroll Indicator */}
        <div className="absolute bottom-8 left-6 md:left-12 animate-hero-fade delay-500">
          <span className="text-[10px] tracking-[0.2em] text-white/50 uppercase flex items-center gap-2">
            Scroll to explore &darr;
          </span>
        </div>
      </section>
    );
  };

  const WorkSection = () => {
    const [ref, isVisible] = useScrollFade();

    const projectYears = projects
      .map((p) => parseInt(p.year))
      .filter((y) => !isNaN(y));

    const minYear =
      projectYears.length > 0 ? Math.min(...projectYears) : null;
    const maxYear =
      projectYears.length > 0 ? Math.max(...projectYears) : null;

    return (
      <section
        id="work"
        className="py-32 px-6 md:px-12 bg-black text-white"
        ref={ref}
      >
        <div className="max-w-7xl mx-auto">
          <div
            className={`flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8 transition-all duration-1000 transform ${
              isVisible
                ? 'translate-y-0 opacity-100'
                : 'translate-y-10 opacity-0'
            }`}
          >
            <div className="max-w-xl">
              <SectionHeading className="!mb-4">
                Selected Work
              </SectionHeading>
              <p className="text-gray-400 text-sm md:text-base font-light tracking-wide">
                A selection of projects across film, photography, events and digital content.
              </p>
            </div>

            <div className="text-left md:text-right text-xs tracking-[0.2em] text-gray-500 uppercase flex flex-row md:flex-col gap-6 md:gap-1">
              <p>{String(projects.length).padStart(2, '0')} PROJECTS</p>
              {minYear !== null && maxYear !== null && (
                <p>
                  {minYear}
                  {minYear !== maxYear ? ` — ${maxYear}` : ''}
                </p>
              )}
            </div>
          </div>

          {projectsLoading ? (
            <div className="min-h-56 flex items-center justify-center border-y border-white/5 text-gray-600 text-sm">
              Loading projects...
            </div>
          ) : projectsError ? (
            <div className="min-h-56 flex items-center justify-center border-y border-white/5 text-gray-600 text-sm text-center">
              Projects are temporarily unavailable.
            </div>
          ) : projects.length === 0 ? (
            <div className="min-h-56 flex items-center justify-center border-y border-white/5 text-gray-600 text-sm">
              Selected work coming soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-y-32 md:gap-x-12 lg:gap-x-20">
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  isVisible={isVisible}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const ShowreelSection = () => {
    const [ref, isVisible] = useScrollFade();
    const [playing, setPlaying] = useState(false);

    return (
      <section className="py-20 bg-zinc-950 relative overflow-hidden" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div
            className={`relative aspect-video w-full overflow-hidden transition-all duration-1000 transform ${
              isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
            }`}
          >
            {showreelMuxPlaybackId && playing ? (
              <MuxPlayer
                playbackId={showreelMuxPlaybackId}
                streamType="on-demand"
                autoPlay
                poster={showreelPoster}
                videoTitle="Yaël Noukimi Showreel"
                accentColor="#ffffff"
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <button
                type="button"
                onClick={() => showreelMuxPlaybackId && setPlaying(true)}
                className={`absolute inset-0 w-full h-full text-left group ${
                  showreelMuxPlaybackId ? 'cursor-pointer' : 'cursor-default'
                }`}
                aria-label={
                  showreelMuxPlaybackId ? 'Watch showreel' : 'Showreel coming soon'
                }
              >
                <img 
                  src={showreelPoster}
                  alt="Showreel Thumbnail"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60 group-hover:opacity-40"
                  loading="lazy"
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tighter">
                    60 SECONDS OF MY WORK
                  </h2>

                  <span className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                    <Play className="w-8 h-8 md:w-10 md:h-10 ml-2" fill="currentColor" />
                  </span>

                  <span className="mt-8 text-xs tracking-[0.2em] uppercase text-white font-medium">
                    {showreelMuxPlaybackId ? 'Watch Showreel' : 'Showreel Coming Soon'}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>
      </section>
    );
  };

  const ServicesSection = () => {
    const [ref, isVisible] = useScrollFade();
    
    return (
      <section id="services" className="py-32 px-6 md:px-12 bg-black text-white border-t border-white/10" ref={ref}>
        <div className="max-w-7xl mx-auto">
          <SectionHeading className={`transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            What I Do
          </SectionHeading>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {SERVICES.map((service, index) => (
              <div 
                key={index} 
                className={`transition-all duration-1000 delay-${index * 100} transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
              >
                {service.icon}
                <h3 className="text-xl font-medium mb-6 tracking-wide">{service.title}</h3>
                <ul className="space-y-3">
                  {service.items.map((item, i) => (
                    <li key={i} className="text-gray-400 text-sm font-light flex items-center">
                      <ChevronRight size={12} className="mr-2 text-gray-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const AboutSection = () => {
    const [refAbout, isVisibleAbout] = useScrollFade();
    const [refProcess, isVisibleProcess] = useScrollFade();
    
    return (
      <section id="about" className="py-32 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* About Editorial */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-40" ref={refAbout}>
            <div className={`lg:col-span-5 relative transition-all duration-1000 transform ${isVisibleAbout ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="aspect-[3/4] w-full bg-zinc-900 relative">
                {/* Replace with your actual portrait */}
                <img 
                  src={siteSettings.about_image_url || "https://images.unsplash.com/photo-1552168324-d612d77725e3?q=80&w=2036&auto=format&fit=crop"} 
                  alt="Yaël Noukimi"
                  className="w-full h-full object-cover grayscale opacity-80"
                  loading="lazy"
                />
                <div className="absolute inset-0 border border-white/20 m-4"></div>
              </div>
            </div>
            
            <div className={`lg:col-span-7 space-y-6 transition-all duration-1000 delay-200 transform ${isVisibleAbout ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <h2 className="text-3xl md:text-4xl font-light mb-8 leading-tight">
                {siteSettings.about_heading}
              </h2>
              <div className="text-gray-400 font-light leading-relaxed space-y-6 text-base md:text-lg">
                {aboutParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Workflow & Tools */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20" ref={refProcess}>
            <div className={`transition-all duration-1000 transform ${isVisibleProcess ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <SectionHeading>My Process</SectionHeading>
              <div className="space-y-12 border-l border-white/10 pl-8 ml-2">
                {PROCESS.map((p, i) => (
                  <div key={i} className="relative">
                    <div className="absolute w-2 h-2 bg-white rounded-full -left-[37px] top-2"></div>
                    <h4 className="text-xs tracking-[0.2em] text-gray-500 mb-2">{p.step} &mdash; {p.title}</h4>
                    <p className="text-gray-300 font-light">{p.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`transition-all duration-1000 delay-200 transform ${isVisibleProcess ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <SectionHeading>Software / Tools</SectionHeading>
              <div className="flex flex-wrap gap-3">
                {TOOLS.map((tool, i) => (
                  <span key={i} className="px-5 py-3 border border-white/20 text-gray-300 rounded-full text-sm font-light hover:bg-white/10 transition-colors">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </section>
    );
  };

  const ContactSection = () => {
    return (
      <section id="contact" className="bg-black text-white border-t border-white/10 flex flex-col min-h-screen justify-between">
        <div className="flex-grow flex items-center justify-center py-32 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-12 uppercase">
              {renderMultilineTitle(siteSettings.contact_heading)}
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-light mb-12 max-w-xl mx-auto">
              {siteSettings.contact_description}
            </p>
            
            <a 
              href={`mailto:${siteSettings.contact_email}`}
              className="inline-block px-12 py-5 bg-white text-black rounded-full text-sm font-medium tracking-[0.1em] uppercase hover:scale-105 transition-transform duration-300"
            >
              Start a Project
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full border-t border-white/10 py-12 px-6 md:px-12 bg-zinc-950">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-xl tracking-[0.15em] font-light mb-2">{PORTFOLIO_DATA.name.toUpperCase()}</h3>
              <p className="text-gray-500 text-sm">{PORTFOLIO_DATA.roles.join(' · ')}</p>
            </div>
            
            <div className="flex gap-6">
              <a href={`mailto:${siteSettings.contact_email}`} className="text-gray-400 hover:text-white transition-colors p-2 border border-white/10 rounded-full hover:bg-white/5">
                <Mail size={18} />
              </a>
              <a href={siteSettings.instagram_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 border border-white/10 rounded-full hover:bg-white/5">
                <FaInstagram size={18} />
              </a>
              <a href={siteSettings.linkedin_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 border border-white/10 rounded-full hover:bg-white/5">
                <FaLinkedinIn size={18} />
              </a>
               <a href={siteSettings.tiktok_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 border border-white/10 rounded-full hover:bg-white/5 flex items-center justify-center w-[36px] h-[36px]">
                <FaTiktok size={16} />
              </a>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
            <p>Based in {PORTFOLIO_DATA.location}</p>
            <p>&copy; {new Date().getFullYear()} {PORTFOLIO_DATA.name}. All rights reserved.</p>
          </div>
        </footer>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans overflow-x-hidden antialiased">
      <Navbar />
      {currentRoute.path === 'home' ? (
        <main>
          <HeroSection />
          <WorkSection />
          <ShowreelSection />
          <ServicesSection />
          <AboutSection />
        </main>
      ) : (
        <main>
          <ProjectDetail
            project={projects.find((p) => p.slug === currentRoute.slug)}
            projects={projects}
          />
        </main>
      )}
      <ContactSection />
    </div>
  );
}