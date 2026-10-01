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

const PROJECTS = [
  {
    id: 1,
    slug: "project-01",
    title: "PROJECT 01",
    category: "Event Coverage",
    year: "2026",
    location: "Italy",
    thumbnail: "/assets/images/project-01.jpg",
    video: "/assets/videos/project-01.mp4",
    description: "A comprehensive look at the energy and atmosphere of one of the most anticipated events of the year. From tight crowd shots to wide architectural setups, this project encapsulates the dynamic environment.",
    roles: ["Videography", "Editing", "Color Grading"],
    gallery: [
      "/assets/images/project-01.jpg",
      "/assets/images/project-02.jpg"
    ]
  },
  {
    id: 2,
    slug: "project-02",
    title: "PROJECT 02",
    category: "Brand Campaign",
    year: "2026",
    location: "Milan, Italy",
    thumbnail: "/assets/images/project-02.jpg",
    video: "/assets/videos/project-02.mp4",
    description: "A visually striking campaign focusing on dynamic movement and raw energy, designed to elevate the brand's digital presence and engage a younger demographic.",
    roles: ["Direction", "Cinematography", "Editing"],
    gallery: [
      "/assets/images/project-03.jpg",
      "/assets/images/project-04.jpg"
    ]
  },
  {
    id: 3,
    slug: "project-03",
    title: "PROJECT 03",
    category: "Fashion Editorial",
    year: "2025",
    location: "Paris, France",
    thumbnail: "/assets/images/project-03.jpg",
    video: "/assets/videos/project-03.mp4",
    description: "High-contrast fashion film blending urban environments with avant-garde styling. An exploration of texture, light, and movement.",
    roles: ["Creative Direction", "Photography"],
    gallery: []
  },
  {
    id: 4,
    slug: "project-04",
    title: "PROJECT 04",
    category: "Music Video",
    year: "2025",
    location: "Rome, Italy",
    thumbnail: "/assets/images/project-04.jpg",
    video: "",
    description: "Narrative-driven music video with a distinct color palette and moody lighting, crafted to match the emotional weight of the artist's track.",
    roles: ["Cinematography", "Color Grading"],
    gallery: []
  },
  {
    id: 5,
    slug: "project-05",
    title: "PROJECT 05",
    category: "Commercial",
    year: "2025",
    location: "Turin, Italy",
    thumbnail: "/assets/images/project-05.jpg",
    video: "/assets/videos/project-05.mp4",
    description: "Product commercial emphasizing texture, light, and sleek design. Developed specifically for high-conversion social media campaigns.",
    roles: ["Direction", "Post-Production"],
    gallery: []
  },
  {
    id: 6,
    slug: "project-06",
    title: "PROJECT 06",
    category: "Short Doc",
    year: "2024",
    location: "Naples, Italy",
    thumbnail: "/assets/images/project-06.jpg",
    video: "",
    description: "Intimate portrait of an artisan at work, focusing on detail and sound design to tell a compelling human story without voiceover.",
    roles: ["Full Production"],
    gallery: []
  }
];

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
const ProjectDetail = ({ project }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [project]);

  if (!project) return null;

  const currentIndex = PROJECTS.findIndex(p => p.id === project.id);
  const nextProject = PROJECTS[(currentIndex + 1) % PROJECTS.length];

  const handleImgError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop';
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 md:pt-32 pb-20 animate-hero-fade">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-12">
        <a href="#" onClick={(e) => { e.preventDefault(); window.location.hash = ''; }} className="inline-flex items-center text-xs tracking-[0.15em] uppercase text-gray-400 hover:text-white transition-colors">
          &larr; Back to Work
        </a>
      </div>

      <header className="max-w-7xl mx-auto px-6 md:px-12 mb-12 md:mb-20">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter mb-6">{project.title}</h1>
        <p className="text-xs md:text-sm text-gray-400 tracking-[0.2em] uppercase">
          {project.category} &middot; {project.year} &middot; {project.location}
        </p>
      </header>

      <div className="w-full aspect-video md:aspect-[21/9] bg-zinc-900 mb-20 overflow-hidden relative">
        {project.video ? (
          <video src={project.video} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={project.thumbnail} alt={project.title} onError={handleImgError} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 mb-32">
        <div className="lg:col-span-8">
          <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-6">Overview</h2>
          <p className="text-lg md:text-xl font-light leading-relaxed text-gray-200">{project.description}</p>
        </div>
        <div className="lg:col-span-4 lg:col-start-9 border-t border-white/10 pt-8 lg:border-t-0 lg:pt-0 lg:border-l lg:pl-12">
          <h2 className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-6">My Role</h2>
          <ul className="space-y-3">
            {project.roles.map((role, i) => (
              <li key={i} className="text-sm tracking-wide text-gray-300">{role}</li>
            ))}
          </ul>
        </div>
      </div>

      {project.gallery && project.gallery.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-32">
          {project.gallery.map((img, i) => (
            <div key={i} className={`w-full bg-zinc-900 overflow-hidden ${i % 3 === 0 ? 'md:col-span-2 aspect-video' : 'aspect-square'}`}>
              <img src={img} alt={`${project.title} Gallery ${i + 1}`} onError={handleImgError} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
            </div>
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 md:px-12 border-t border-white/10 pt-20 text-center">
        <p className="text-xs tracking-[0.2em] text-gray-500 uppercase mb-6">Next Project</p>
        <a href={`#work/${nextProject.slug}`} className="inline-block group">
          <h3 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tighter mb-4 group-hover:text-gray-300 transition-colors">{nextProject.title}</h3>
          <span className="text-xs tracking-[0.15em] uppercase flex justify-center items-center text-gray-400 group-hover:text-white transition-colors">
            View Project <ArrowRight size={14} className="ml-2 transform group-hover:translate-x-2 transition-transform" />
          </span>
        </a>
      </div>
    </div>
  );
};
// ----------------------------------------

export default function Portfolio() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState({ path: 'home', slug: null });

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
          {/* Cinematic Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        {/* Main Content - Bottom Left Aligned */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-start text-left">
          <h1 className="text-[clamp(3rem,8vw,8rem)] font-bold text-white mb-6 tracking-tighter leading-[0.9] uppercase animate-hero-fade">
            Visual Stories<br />That Feel Alive.
          </h1>
          
          <div className="animate-hero-fade delay-100">
            <p className="text-sm md:text-lg text-gray-200 font-light tracking-wide mb-2 uppercase">
              {PORTFOLIO_DATA.roles.join(' · ')}
            </p>
            <p className="text-xs md:text-sm text-gray-400 tracking-[0.1em] uppercase">
              Based in {PORTFOLIO_DATA.location} · Available worldwide
            </p>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-8 animate-hero-fade delay-300 w-full sm:w-auto">
            <button 
              onClick={() => scrollTo('contact')}
              className="w-full sm:w-auto px-10 py-4 bg-white text-black hover:bg-gray-200 transition-all duration-300 tracking-[0.15em] text-xs uppercase font-medium flex items-center justify-center gap-3"
            >
              Let's Work Together <ArrowRight size={14} />
            </button>
            <button 
              onClick={() => scrollTo('work')}
              className="text-xs tracking-[0.15em] uppercase text-white border-b border-white/30 pb-1 hover:border-white transition-all duration-300"
            >
              View My Work
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
    
    const projectYears = PROJECTS.map(p => parseInt(p.year)).filter(y => !isNaN(y));
    const minYear = Math.min(...projectYears);
    const maxYear = Math.max(...projectYears);
    
    const handleImgError = (e) => {
      e.target.src = 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2071&auto=format&fit=crop';
    };

    return (
      <section id="work" className="py-32 px-6 md:px-12 bg-black text-white" ref={ref}>
        <div className="max-w-7xl mx-auto">
          
          {/* Header de la section */}
          <div className={`flex flex-col md:flex-row md:items-end md:justify-between mb-20 gap-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="max-w-xl">
              <SectionHeading className="!mb-4">Selected Work</SectionHeading>
              <p className="text-gray-400 text-sm md:text-base font-light tracking-wide">
                A selection of projects across film, photography, events and digital content.
              </p>
            </div>
            <div className="text-left md:text-right text-xs tracking-[0.2em] text-gray-500 uppercase flex flex-row md:flex-col gap-6 md:gap-1">
              <p>{String(PROJECTS.length).padStart(2, '0')} PROJECTS</p>
              <p>{minYear} &mdash; {maxYear}</p>
            </div>
          </div>
          
          {/* Grille de projets asymétrique */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-24 md:gap-y-32 md:gap-x-12 lg:gap-x-20">
            {PROJECTS.map((project, index) => {
              const isEven = index % 2 === 0;
              const videoRef = React.useRef(null);
              
              const handleMouseEnter = () => {
                if (videoRef.current) {
                  videoRef.current.play().catch(() => {});
                }
              };
              
              const handleMouseLeave = () => {
                if (videoRef.current) {
                  videoRef.current.pause();
                  videoRef.current.currentTime = 0;
                }
              };

              return (
                <div 
                  key={project.id} 
                  className={isEven ? "md:col-span-7 md:col-start-1" : "md:col-span-5 md:col-start-8 md:mt-40"}
                >
                  <a 
                    href={`#work/${project.slug}`}
                    className={`group block w-full transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
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
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-60"
                        loading="lazy"
                      />
                      {project.video && (
                        <video 
                          ref={videoRef}
                          src={project.video}
                          muted 
                          playsInline 
                          loop 
                          className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        />
                      )}
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div>
                        <h3 className="text-xl md:text-2xl font-medium tracking-wide mb-1 uppercase">{project.title}</h3>
                        <p className="text-xs text-gray-400 tracking-[0.15em] uppercase">{project.category} &middot; {project.year}</p>
                      </div>
                      <div className="md:text-right flex flex-col md:items-end">
                        <p className="text-xs text-gray-500 tracking-[0.1em] uppercase mb-3">{project.roles.join(' · ')}</p>
                        <span className="text-xs font-medium tracking-[0.15em] uppercase flex items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-4 group-hover:translate-x-0">
                          View Project <ArrowRight size={14} className="ml-2" />
                        </span>
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  };

  const ShowreelSection = () => {
    const [ref, isVisible] = useScrollFade();
    
    return (
      <section className="py-20 bg-zinc-950 relative overflow-hidden" ref={ref}>
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className={`relative aspect-video w-full group cursor-pointer overflow-hidden transition-all duration-1000 transform ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
            <img 
              src="https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop" 
              alt="Showreel Thumbnail"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-60 group-hover:opacity-40"
              loading="lazy"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 tracking-tighter">60 SECONDS OF MY WORK</h2>
              
              <button className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-black group-hover:scale-110 transition-transform duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                <Play className="w-8 h-8 md:w-10 md:h-10 ml-2" fill="currentColor" />
              </button>
              
              <span className="mt-8 text-xs tracking-[0.2em] uppercase text-white font-medium">Watch Showreel</span>
            </div>
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
                  src="https://images.unsplash.com/photo-1552168324-d612d77725e3?q=80&w=2036&auto=format&fit=crop" 
                  alt="Yaël Noukimi"
                  className="w-full h-full object-cover grayscale opacity-80"
                  loading="lazy"
                />
                <div className="absolute inset-0 border border-white/20 m-4"></div>
              </div>
            </div>
            
            <div className={`lg:col-span-7 space-y-6 transition-all duration-1000 delay-200 transform ${isVisibleAbout ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
              <h2 className="text-3xl md:text-4xl font-light mb-8 leading-tight">
                {PORTFOLIO_DATA.about.p1} {PORTFOLIO_DATA.about.p2}
              </h2>
              <div className="text-gray-400 font-light leading-relaxed space-y-6 text-base md:text-lg">
                <p>{PORTFOLIO_DATA.about.p3}</p>
                <p>{PORTFOLIO_DATA.about.p4}</p>
                <p>{PORTFOLIO_DATA.about.p5}</p>
                <p>{PORTFOLIO_DATA.about.p6}</p>
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
              Let's Create<br/>Something<br/>Memorable.
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-light mb-12 max-w-xl mx-auto">
              Available for freelance projects, collaborations and professional opportunities.
            </p>
            
            <a 
              href={`mailto:${PORTFOLIO_DATA.email}`}
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
              <a href={`mailto:${PORTFOLIO_DATA.email}`} className="text-gray-400 hover:text-white transition-colors p-2 border border-white/10 rounded-full hover:bg-white/5">
                <Mail size={18} />
              </a>
              <a href={PORTFOLIO_DATA.socials.instagram} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 border border-white/10 rounded-full hover:bg-white/5">
                <FaInstagram size={18} />
              </a>
              <a href={PORTFOLIO_DATA.socials.linkedin} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 border border-white/10 rounded-full hover:bg-white/5">
                <FaLinkedinIn size={18} />
              </a>
               <a href={PORTFOLIO_DATA.socials.tiktok} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 border border-white/10 rounded-full hover:bg-white/5 flex items-center justify-center w-[36px] h-[36px]">
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
          <ProjectDetail project={PROJECTS.find(p => p.slug === currentRoute.slug)} />
        </main>
      )}
      <ContactSection />
    </div>
  );
}