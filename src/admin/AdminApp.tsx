// @ts-nocheck

import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import MuxUploader from '@mux/mux-uploader-react'
import {
  CheckCircle2,
  Clapperboard,
  Edit3,
  Eye,
  EyeOff,
  FolderOpen,
  ImagePlus,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Save,
  Settings2,
  Trash2,
  Upload,
  X,
} from 'lucide-react'

const EMPTY_PROJECT = {
  title: '',
  slug: '',
  category: '',
  year: new Date().getFullYear(),
  location: 'Italy',
  description: '',
  roles: [],
  thumbnail_url: '',
  preview_video_url: '',
  video_url: '',
  gallery: [],
  published: false,
  sort_order: 0,
}

const MEDIA_BUCKET = 'portfolio-media'
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

function sanitizeFileName(name = '') {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

async function uploadImageToSupabase(file) {
  if (!file) throw new Error('Aucun fichier sélectionné.')

  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier sélectionné doit être une image.')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("L'image dépasse 10 Mo.")
  }

  const safeName = sanitizeFileName(file.name)
  const path = `projects/${crypto.randomUUID()}-${safeName}`

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) throw error

  const { data } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

async function uploadSiteImageToSupabase(file) {
  if (!file) throw new Error('Aucun fichier sélectionné.')

  if (!file.type.startsWith('image/')) {
    throw new Error('Le fichier sélectionné doit être une image.')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("L'image dépasse 10 Mo.")
  }

  const safeName = sanitizeFileName(file.name)
  const path = `site/${crypto.randomUUID()}-${safeName}`

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (error) throw error

  const { data } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(path)

  return data.publicUrl
}

function slugify(value = '') {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function muxPlaybackIdFromUrl(url = '') {
  return typeof url === 'string' && url.startsWith('mux://')
    ? url.replace('mux://', '').trim()
    : ''
}

export default function AdminApp() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let active = true

    async function loadRole() {
      if (!session?.user?.id) {
        setRole(null)
        setRoleLoading(false)
        return
      }

      setRoleLoading(true)

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle()

      if (!active) return

      if (error) {
        console.error('Role loading error:', error)
        setRole(null)
      } else {
        setRole(data?.role ?? null)
      }

      setRoleLoading(false)
    }

    loadRole()

    return () => {
      active = false
    }
  }, [session?.user?.id])

  if (loading || (session && roleLoading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="animate-spin" size={28} />
      </div>
    )
  }

  if (!session) return <LoginPage />

  if (!['admin', 'editor'].includes(role)) {
    return <AccessDeniedPage />
  }

  return <Dashboard session={session} role={role} />
}

function AccessDeniedPage() {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-lg border border-white/10 bg-zinc-950 p-8">
        <p className="text-xs tracking-[0.25em] uppercase text-red-400 mb-4">
          Accès refusé
        </p>
        <h1 className="text-3xl font-semibold mb-4">
          Ce compte n’a pas accès à l’administration.
        </h1>
        <p className="text-sm leading-relaxed text-gray-500 mb-8">
          Un rôle admin ou editor doit être attribué à ce compte avant qu’il puisse gérer le portfolio.
        </p>
        <div className="flex gap-3">
          <a
            href="/"
            className="border border-white/10 px-5 py-3 text-sm text-gray-300 hover:text-white hover:border-white/30 transition"
          >
            Voir le portfolio
          </a>
          <button
            onClick={handleLogout}
            className="bg-white text-black px-5 py-3 text-sm hover:bg-gray-200 transition"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] text-gray-500 uppercase mb-4">
            Portfolio Administration
          </p>

          <h1 className="text-4xl font-semibold tracking-tight">
            Welcome back.
          </h1>

          <p className="text-gray-500 mt-3">
            Connectez-vous pour gérer le portfolio de Yaël Noukimi.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="admin-input"
            />
          </Field>

          <Field label="Password">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="admin-input"
            />
          </Field>

          {error && (
            <div className="text-sm text-red-400 border border-red-500/20 bg-red-500/10 p-4">
              {error}
            </div>
          )}

          <button
            disabled={loading}
            className="w-full bg-white text-black py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <a
          href="/"
          className="block text-center mt-8 text-xs text-gray-600 hover:text-white transition"
        >
          ← Retour au portfolio
        </a>
      </div>
    </div>
  )
}

function Dashboard({ session, role }) {
  const [projects, setProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [error, setError] = useState('')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [showreelOpen, setShowreelOpen] = useState(false)
  const [contentOpen, setContentOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = role === 'admin'

  const publishedCount = useMemo(
    () => projects.filter((project) => project.published).length,
    [projects],
  )

  const draftCount = projects.length - publishedCount

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoadingProjects(true)
    setError('')

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
      setProjects([])
    } else {
      setProjects(data ?? [])
    }

    setLoadingProjects(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  function createProject() {
    setEditingProject(null)
    setEditorOpen(true)
  }

  function editProject(project) {
    setEditingProject(project)
    setEditorOpen(true)
  }

  async function deleteProject(project) {
    const confirmed = window.confirm(
      `Supprimer définitivement "${project.title}" ?`,
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id)

    if (error) {
      window.alert(`Erreur : ${error.message}`)
      return
    }

    await loadProjects()
  }

  async function togglePublished(project) {
    const { error } = await supabase
      .from('projects')
      .update({
        published: !project.published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', project.id)

    if (error) {
      window.alert(`Erreur : ${error.message}`)
      return
    }

    await loadProjects()
  }

  return (
    <div className="min-h-screen bg-[#090909] text-white">
      <header className="border-b border-white/10 sticky top-0 z-40 bg-[#090909]/95 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="min-h-[74px] flex justify-between items-center gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <p className="font-medium tracking-[0.13em] text-sm sm:text-base whitespace-nowrap">
                  YAËL NOUKIMI
                </p>

                <span className={`md:hidden text-[9px] uppercase tracking-[0.14em] px-2 py-1 border ${
                  isAdmin
                    ? 'text-amber-300 border-amber-500/20 bg-amber-500/5'
                    : 'text-cyan-300 border-cyan-500/20 bg-cyan-500/5'
                }`}>
                  {role}
                </span>
              </div>

              <div className="hidden md:flex items-center gap-3 mt-1">
                <p className="text-xs text-gray-600">
                  Portfolio Administration
                </p>
                <span className={`text-[10px] uppercase tracking-[0.15em] px-2 py-1 border ${
                  isAdmin
                    ? 'text-amber-300 border-amber-500/20 bg-amber-500/5'
                    : 'text-cyan-300 border-cyan-500/20 bg-cyan-500/5'
                }`}>
                  {role}
                </span>
              </div>

              <p className="md:hidden text-[10px] text-gray-600 mt-1 truncate">
                Portfolio Administration
              </p>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setContentOpen(true)}
                className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm"
              >
                <Settings2 size={16} />
                Contenu
              </button>

              <button
                onClick={() => setShowreelOpen(true)}
                className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm"
              >
                <Clapperboard size={16} />
                Showreel
              </button>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="text-gray-400 hover:text-white transition flex items-center gap-2 text-sm"
              >
                <Eye size={16} />
                Voir le site
              </a>

              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-white transition"
                aria-label="Se déconnecter"
                title="Se déconnecter"
              >
                <LogOut size={19} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="md:hidden w-11 h-11 shrink-0 border border-white/10 bg-white/[0.03] flex items-center justify-center text-gray-300 hover:text-white hover:border-white/20 transition"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4">
              <div className="border border-white/10 bg-[#111] p-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setContentOpen(true)
                  }}
                  className="min-h-12 px-4 flex items-center gap-3 text-sm text-gray-300 bg-white/[0.03] hover:bg-white/[0.06] transition"
                >
                  <Settings2 size={17} />
                  Contenu
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    setShowreelOpen(true)
                  }}
                  className="min-h-12 px-4 flex items-center gap-3 text-sm text-gray-300 bg-white/[0.03] hover:bg-white/[0.06] transition"
                >
                  <Clapperboard size={17} />
                  Showreel
                </button>

                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-h-12 px-4 flex items-center gap-3 text-sm text-gray-300 bg-white/[0.03] hover:bg-white/[0.06] transition"
                >
                  <Eye size={17} />
                  Voir le site
                </a>

                <button
                  onClick={async () => {
                    setMobileMenuOpen(false)
                    await handleLogout()
                  }}
                  className="min-h-12 px-4 flex items-center gap-3 text-sm text-red-300 bg-red-500/[0.05] hover:bg-red-500/[0.09] transition"
                >
                  <LogOut size={17} />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-gray-600 mb-3">
              Dashboard
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Bonjour.
            </h1>

            <p className="text-gray-500 mt-3">
              {session.user.email}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={loadProjects}
              className="border border-white/10 px-5 py-4 text-gray-400 hover:text-white hover:border-white/30 transition"
              title="Actualiser"
            >
              <RefreshCw size={17} />
            </button>

            <button
              onClick={createProject}
              className="bg-white text-black px-6 py-4 flex items-center gap-3 text-xs uppercase tracking-[0.15em] font-medium hover:bg-gray-200 transition"
            >
              <Plus size={17} />
              Nouveau projet
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 border border-red-500/20 bg-red-500/10 text-red-300 p-4 text-sm">
            Erreur Supabase : {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
          <DashboardCard
            label="Projects"
            value={projects.length}
            icon={<FolderOpen />}
          />

          <DashboardCard
            label="Published"
            value={publishedCount}
            icon={<Eye />}
          />

          <DashboardCard
            label="Drafts"
            value={draftCount}
            icon={<LayoutDashboard />}
          />
        </div>

        <div className="border border-white/10 bg-zinc-950">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-medium">Projects</h2>
            <span className="text-xs text-gray-600">
              {projects.length} au total
            </span>
          </div>

          {loadingProjects ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="animate-spin text-gray-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="py-20 text-center">
              <FolderOpen
                size={32}
                className="mx-auto text-gray-700 mb-5"
              />

              <p className="text-gray-400 mb-2">
                Aucun projet enregistré.
              </p>

              <p className="text-sm text-gray-600">
                Clique sur “Nouveau projet” pour commencer.
              </p>
            </div>
          ) : (
            <div>
              {projects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  onEdit={() => editProject(project)}
                  onDelete={() => deleteProject(project)}
                  onTogglePublished={() => togglePublished(project)}
                  canDelete={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {editorOpen && (
        <ProjectEditor
          session={session}
          project={editingProject}
          onClose={() => {
            setEditorOpen(false)
            setEditingProject(null)
          }}
          onSaved={async () => {
            setEditorOpen(false)
            setEditingProject(null)
            await loadProjects()
          }}
        />
      )}

      {contentOpen && (
        <SiteContentManager
          session={session}
          onClose={() => setContentOpen(false)}
        />
      )}

      {showreelOpen && (
        <ShowreelManager
          session={session}
          onClose={() => setShowreelOpen(false)}
        />
      )}

      <style>{`
        .admin-input {
          width: 100%;
          background: rgb(9 9 11);
          border: 1px solid rgba(255,255,255,.1);
          padding: 1rem;
          outline: none;
          transition: border-color .2s ease;
        }

        .admin-input:focus {
          border-color: rgba(255,255,255,.4);
        }

        textarea.admin-input {
          min-height: 140px;
          resize: vertical;
        }
      `}</style>
    </div>
  )
}



function SiteContentManager({ session, onClose }) {
  const [form, setForm] = useState({
    hero_title: '',
    hero_roles: '',
    hero_location_line: '',
    hero_primary_cta: '',
    hero_secondary_cta: '',
    about_heading: '',
    about_body: '',
    about_image_url: '',
    contact_heading: '',
    contact_description: '',
    contact_email: '',
    whatsapp_number: '',
    instagram_url: '',
    tiktok_url: '',
    linkedin_url: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadContent()
  }, [])

  useEffect(() => {
    let active = true

    async function loadProjectVideos() {
      if (!project?.id) {
        const legacyUrl = cleanText(project?.video_url)

        if (legacyUrl) {
          setProjectVideos([
            {
              _client_id: crypto.randomUUID(),
              title: 'Main Film',
              video_url: legacyUrl,
              mux_asset_id: null,
              video_type: 'Main Film',
              orientation: 'horizontal',
              is_featured: true,
              sort_order: 0,
            },
          ])
        }

        setVideosLoading(false)
        return
      }

      setVideosLoading(true)

      const { data, error: videosError } = await supabase
        .from('project_videos')
        .select('*')
        .eq('project_id', project.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true })

      if (!active) return

      if (videosError) {
        setError(videosError.message)
        setVideosLoading(false)
        return
      }

      if ((data ?? []).length > 0) {
        setProjectVideos(
          data.map((video) => ({
            ...video,
            _client_id: video.id,
          })),
        )
      } else if (cleanText(project.video_url)) {
        // Filet de sécurité pendant la migration.
        setProjectVideos([
          {
            _client_id: crypto.randomUUID(),
            title: 'Main Film',
            video_url: project.video_url,
            mux_asset_id: null,
            video_type: 'Main Film',
            orientation: 'horizontal',
            is_featured: true,
            sort_order: 0,
          },
        ])
      }

      setVideosLoading(false)
    }

    loadProjectVideos()

    return () => {
      active = false
    }
  }, [project?.id])

  function updateProjectVideo(clientId, field, value) {
    setProjectVideos((current) =>
      current.map((video) => {
        if (field === 'is_featured') {
          return {
            ...video,
            is_featured: video._client_id === clientId,
          }
        }

        if (video._client_id !== clientId) return video

        return {
          ...video,
          [field]: value,
        }
      }),
    )
  }

  function removeProjectVideo(clientId) {
    setProjectVideos((current) => {
      const removed = current.find((video) => video._client_id === clientId)
      const next = current.filter((video) => video._client_id !== clientId)

      if (removed?.is_featured && next.length > 0) {
        next[0] = {
          ...next[0],
          is_featured: true,
        }
      }

      return next
    })
  }

  function moveProjectVideo(clientId, direction) {
    setProjectVideos((current) => {
      const index = current.findIndex((video) => video._client_id === clientId)
      if (index < 0) return current

      const targetIndex = index + direction
      if (targetIndex < 0 || targetIndex >= current.length) return current

      const next = [...current]
      const [item] = next.splice(index, 1)
      next.splice(targetIndex, 0, item)
      return next
    })
  }

  function appendProjectVideo(videoUrl, muxAssetId = null) {
    const cleanUrl = cleanText(videoUrl)
    if (!cleanUrl) return

    setProjectVideos((current) => {
      const shouldBeFeatured =
        current.length === 0 || Boolean(newVideoMeta.is_featured)

      const nextVideo = {
        _client_id: crypto.randomUUID(),
        title:
          cleanText(newVideoMeta.title) ||
          `Film ${String(current.length + 1).padStart(2, '0')}`,
        video_url: cleanUrl,
        mux_asset_id: cleanText(muxAssetId) || null,
        video_type: cleanText(newVideoMeta.video_type) || null,
        orientation: newVideoMeta.orientation || 'horizontal',
        is_featured: shouldBeFeatured,
        sort_order: current.length,
      }

      const existing = shouldBeFeatured
        ? current.map((video) => ({
            ...video,
            is_featured: false,
          }))
        : current

      return [...existing, nextVideo]
    })

    setNewVideoMeta({
      title: '',
      video_type: '',
      orientation: 'horizontal',
      is_featured: false,
      external_url: '',
    })
    setUploaderKey((value) => value + 1)
  }

  function addExternalVideo() {
    if (!cleanText(newVideoMeta.external_url)) {
      setError("Colle d'abord une URL vidéo.")
      return
    }

    setError('')
    appendProjectVideo(newVideoMeta.external_url)
  }

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function loadContent() {
    setLoading(true)
    setError('')

    const { data, error: loadError } = await supabase
      .from('site_settings')
      .select(`
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
      .maybeSingle()

    if (loadError) {
      setError(loadError.message)
    } else {
      setForm({
        hero_title: data?.hero_title ?? '',
        hero_roles: data?.hero_roles ?? '',
        hero_location_line: data?.hero_location_line ?? '',
        hero_primary_cta: data?.hero_primary_cta ?? '',
        hero_secondary_cta: data?.hero_secondary_cta ?? '',
        about_heading: data?.about_heading ?? '',
        about_body: data?.about_body ?? '',
        about_image_url: data?.about_image_url ?? '',
        contact_heading: data?.contact_heading ?? '',
        contact_description: data?.contact_description ?? '',
        contact_email: data?.contact_email ?? '',
        whatsapp_number: data?.whatsapp_number ?? '',
        instagram_url: data?.instagram_url ?? '',
        tiktok_url: data?.tiktok_url ?? '',
        linkedin_url: data?.linkedin_url ?? '',
      })
    }

    setLoading(false)
  }

  async function handleAboutImage(file) {
    if (!file) return

    setImageUploading(true)
    setError('')

    try {
      const publicUrl = await uploadSiteImageToSupabase(file)
      update('about_image_url', publicUrl)
    } catch (uploadError) {
      setError(uploadError.message || "Impossible d'uploader l'image.")
    } finally {
      setImageUploading(false)
    }
  }

  async function saveContent(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const { error: saveError } = await supabase
      .from('site_settings')
      .update({
        hero_title: cleanText(form.hero_title),
        hero_roles: cleanText(form.hero_roles),
        hero_location_line: cleanText(form.hero_location_line),
        hero_primary_cta: cleanText(form.hero_primary_cta),
        hero_secondary_cta: cleanText(form.hero_secondary_cta),
        about_heading: cleanText(form.about_heading),
        about_body: cleanText(form.about_body),
        about_image_url: cleanText(form.about_image_url) || null,
        contact_heading: cleanText(form.contact_heading),
        contact_description: cleanText(form.contact_description),
        contact_email: cleanText(form.contact_email),
        whatsapp_number: cleanText(form.whatsapp_number) || null,
        instagram_url: cleanText(form.instagram_url),
        tiktok_url: cleanText(form.tiktok_url),
        linkedin_url: cleanText(form.linkedin_url),
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'main')

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen px-4 py-8 md:px-8">
        <div className="max-w-5xl mx-auto border border-white/10 bg-[#111]">
          <div className="px-6 py-5 md:px-8 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#111] z-10">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-600 mb-2">
                Site
              </p>
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                <Settings2 size={22} />
                Contenu du site
              </h2>
            </div>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition"
              aria-label="Fermer"
            >
              <X size={22} />
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-gray-600" />
            </div>
          ) : (
            <form onSubmit={saveContent} className="p-6 md:p-8 space-y-10">
              <section>
                <p className="text-[10px] tracking-[0.2em] uppercase text-cyan-300 mb-5">
                  Hero / Accueil
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Grand titre">
                    <textarea
                      value={form.hero_title}
                      onChange={(e) => update('hero_title', e.target.value)}
                      className="admin-input min-h-28 resize-y"
                      placeholder={"VISUAL STORIES\nTHAT FEEL ALIVE."}
                    />
                    <p className="text-[11px] text-gray-600 mt-2">
                      Une nouvelle ligne dans ce champ crée un saut de ligne sur le site.
                    </p>
                  </Field>

                  <Field label="Métiers">
                    <input
                      value={form.hero_roles}
                      onChange={(e) => update('hero_roles', e.target.value)}
                      className="admin-input"
                      placeholder="VIDEOMAKER · PHOTOGRAPHER · CONTENT CREATOR"
                    />
                  </Field>

                  <Field label="Localisation / disponibilité">
                    <input
                      value={form.hero_location_line}
                      onChange={(e) => update('hero_location_line', e.target.value)}
                      className="admin-input"
                      placeholder="BASED IN ITALY · AVAILABLE WORLDWIDE"
                    />
                  </Field>

                  <Field label="Bouton principal">
                    <input
                      value={form.hero_primary_cta}
                      onChange={(e) => update('hero_primary_cta', e.target.value)}
                      className="admin-input"
                    />
                  </Field>

                  <Field label="Bouton secondaire">
                    <input
                      value={form.hero_secondary_cta}
                      onChange={(e) => update('hero_secondary_cta', e.target.value)}
                      className="admin-input"
                    />
                  </Field>
                </div>
              </section>

              <section className="border-t border-white/10 pt-10">
                <p className="text-[10px] tracking-[0.2em] uppercase text-cyan-300 mb-5">
                  À propos
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-7 items-start">
                  <div>
                    <div className="aspect-[3/4] bg-zinc-950 border border-white/10 overflow-hidden mb-4">
                      {form.about_image_url ? (
                        <img
                          src={form.about_image_url}
                          alt="Portrait About"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 text-sm">
                          Aucune image
                        </div>
                      )}
                    </div>

                    <label className="border border-dashed border-white/20 min-h-28 flex flex-col items-center justify-center cursor-pointer hover:border-white/40 transition p-4 text-center">
                      {imageUploading ? (
                        <>
                          <Loader2 className="animate-spin mb-2" size={20} />
                          <span className="text-xs text-gray-500">Upload...</span>
                        </>
                      ) : (
                        <>
                          <ImagePlus size={20} className="mb-2 text-gray-500" />
                          <span className="text-xs">Changer le portrait</span>
                          <span className="text-[10px] text-gray-600 mt-1">
                            JPG, PNG, WebP ou AVIF · 10 Mo max
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={imageUploading}
                        onChange={(e) => handleAboutImage(e.target.files?.[0])}
                      />
                    </label>
                  </div>

                  <div className="space-y-5">
                    <Field label="Titre / introduction">
                      <textarea
                        value={form.about_heading}
                        onChange={(e) => update('about_heading', e.target.value)}
                        className="admin-input min-h-28 resize-y"
                      />
                    </Field>

                    <Field label="Texte À propos">
                      <textarea
                        value={form.about_body}
                        onChange={(e) => update('about_body', e.target.value)}
                        className="admin-input min-h-72 resize-y"
                      />
                      <p className="text-[11px] text-gray-600 mt-2">
                        Laisse une ligne vide entre deux paragraphes.
                      </p>
                    </Field>
                  </div>
                </div>
              </section>

              <section className="border-t border-white/10 pt-10">
                <p className="text-[10px] tracking-[0.2em] uppercase text-cyan-300 mb-5">
                  Contact
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="Grand titre">
                    <textarea
                      value={form.contact_heading}
                      onChange={(e) => update('contact_heading', e.target.value)}
                      className="admin-input min-h-28 resize-y"
                    />
                  </Field>

                  <Field label="Description">
                    <textarea
                      value={form.contact_description}
                      onChange={(e) => update('contact_description', e.target.value)}
                      className="admin-input min-h-28 resize-y"
                    />
                  </Field>

                  <Field label="Email">
                    <input
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => update('contact_email', e.target.value)}
                      className="admin-input"
                    />
                  </Field>

                  <Field label="WhatsApp">
                    <input
                      value={form.whatsapp_number}
                      onChange={(e) => update('whatsapp_number', e.target.value)}
                      className="admin-input"
                      placeholder="+39 351 234 5678"
                    />
                    <p className="text-[11px] text-gray-600 mt-2">
                      Mets le numéro avec l’indicatif pays. Exemple : +39 pour l’Italie, +237 pour le Cameroun.
                    </p>
                  </Field>

                  <Field label="Instagram">
                    <input
                      value={form.instagram_url}
                      onChange={(e) => update('instagram_url', e.target.value)}
                      className="admin-input"
                      placeholder="https://instagram.com/..."
                    />
                  </Field>

                  <Field label="TikTok">
                    <input
                      value={form.tiktok_url}
                      onChange={(e) => update('tiktok_url', e.target.value)}
                      className="admin-input"
                      placeholder="https://tiktok.com/@..."
                    />
                  </Field>

                  <Field label="LinkedIn">
                    <input
                      value={form.linkedin_url}
                      onChange={(e) => update('linkedin_url', e.target.value)}
                      className="admin-input"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </Field>
                </div>
              </section>

              {error && (
                <div className="border border-red-500/20 bg-red-500/10 text-red-300 p-4 text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-white/10 px-5 py-3 text-sm text-gray-300 hover:text-white transition"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={saving || imageUploading}
                  className="bg-white text-black px-6 py-3 text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  Enregistrer
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


function ShowreelManager({ session, onClose }) {
  const uploadIdRef = useRef('')
  const [showreelUrl, setShowreelUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [videoState, setVideoState] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const playbackId = showreelUrl.startsWith('mux://')
    ? showreelUrl.replace('mux://', '').trim()
    : ''

  const poster = playbackId
    ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1200&fit_mode=smartcrop`
    : ''

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    setError('')

    const { data, error: settingsError } = await supabase
      .from('site_settings')
      .select('showreel_url')
      .eq('id', 'main')
      .maybeSingle()

    if (settingsError) {
      setError(settingsError.message)
    } else {
      setShowreelUrl(data?.showreel_url ?? '')
    }

    setLoading(false)
  }

  async function createMuxUploadUrl() {
    setError('')
    setVideoState('creating')
    setMessage("Préparation de l'upload sécurisé…")

    const { data, error: functionError } = await supabase.functions.invoke(
      'mux-video',
      {
        body: {
          action: 'create',
          origin: window.location.origin,
        },
      },
    )

    if (functionError) {
      setVideoState('error')
      setMessage('')
      throw new Error(
        functionError.message || "Impossible de préparer l'upload Mux.",
      )
    }

    if (!data?.url || !data?.uploadId) {
      setVideoState('error')
      setMessage('')
      throw new Error("Mux n'a pas renvoyé d'URL d'upload valide.")
    }

    uploadIdRef.current = data.uploadId
    setVideoState('uploading')
    setMessage('Upload en cours vers Mux…')

    return data.url
  }

  async function getMuxStatus(uploadId) {
    const { data, error: functionError } = await supabase.functions.invoke(
      'mux-video',
      {
        body: {
          action: 'status',
          uploadId,
        },
      },
    )

    if (functionError) {
      throw new Error(
        functionError.message || "Impossible de vérifier l'état de la vidéo.",
      )
    }

    return data
  }

  async function waitUntilReady(uploadId) {
    setVideoState('processing')
    setMessage('Upload terminé. Mux prépare le showreel…')

    for (let attempt = 0; attempt < 90; attempt += 1) {
      const status = await getMuxStatus(uploadId)

      if (status?.status === 'ready' && status?.playbackId) {
        setShowreelUrl(`mux://${status.playbackId}`)
        setVideoState('ready')
        setMessage('Showreel prêt. Clique sur Enregistrer.')
        return
      }

      if (
        ['errored', 'cancelled', 'timed_out'].includes(status?.uploadStatus) ||
        status?.assetStatus === 'errored'
      ) {
        throw new Error(status?.message || "Mux n'a pas pu traiter le showreel.")
      }

      await new Promise((resolve) => setTimeout(resolve, 4000))
    }

    throw new Error(
      "La vidéo est envoyée mais Mux met plus de temps que prévu à la préparer.",
    )
  }

  async function handleUploadSuccess() {
    try {
      await waitUntilReady(uploadIdRef.current)
    } catch (uploadError) {
      setVideoState('error')
      setMessage('')
      setError(uploadError.message || 'Erreur pendant le traitement Mux.')
    }
  }

  function handleUploadError(event) {
    setVideoState('error')
    setMessage('')
    const uploadMessage =
      event?.detail?.message ||
      event?.detail ||
      "L'upload vidéo a échoué."
    setError(
      typeof uploadMessage === 'string'
        ? uploadMessage
        : "L'upload vidéo a échoué.",
    )
  }

  async function saveSettings() {
    setSaving(true)
    setError('')

    const { error: saveError } = await supabase
      .from('site_settings')
      .update({
        showreel_url: showreelUrl || null,
        updated_by: session.user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 'main')

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen px-4 py-8 md:px-8">
        <div className="max-w-3xl mx-auto border border-white/10 bg-[#111]">
          <div className="px-6 py-5 md:px-8 border-b border-white/10 flex items-center justify-between">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-600 mb-2">
                Site
              </p>
              <h2 className="text-2xl font-semibold flex items-center gap-3">
                <Clapperboard size={22} />
                Showreel général
              </h2>
            </div>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition"
              aria-label="Fermer"
            >
              <X size={22} />
            </button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {loading ? (
              <div className="py-16 flex justify-center">
                <Loader2 className="animate-spin text-gray-600" />
              </div>
            ) : (
              <>
                {poster && (
                  <div className="aspect-video bg-black border border-white/10 overflow-hidden">
                    <img
                      src={poster}
                      alt="Showreel actuel"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="border border-white/10 bg-zinc-950 p-5">
                  <p className="text-sm font-medium mb-2">
                    {playbackId ? 'Remplacer le showreel' : 'Uploader le showreel'}
                  </p>
                  <p className="text-xs text-gray-600 mb-5">
                    Cette vidéo sera utilisée dans le hero de la page d’accueil et dans la section « 60 Seconds of My Work ».
                  </p>

                  <MuxUploader
                    endpoint={createMuxUploadUrl}
                    pausable
                    dynamicChunkSize
                    onSuccess={handleUploadSuccess}
                    onUploadError={handleUploadError}
                  />

                  {message && (
                    <p
                      className={`mt-4 text-xs ${
                        videoState === 'ready'
                          ? 'text-emerald-400'
                          : 'text-gray-400'
                      }`}
                    >
                      {videoState === 'processing' && (
                        <Loader2
                          size={14}
                          className="inline mr-2 animate-spin"
                        />
                      )}
                      {message}
                    </p>
                  )}
                </div>

                {playbackId && (
                  <div className="border border-white/10 p-4">
                    <p className="text-[11px] text-gray-600 break-all">
                      Playback ID : {playbackId}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowreelUrl('')}
                      className="mt-3 text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Retirer le showreel
                    </button>
                  </div>
                )}

                {error && (
                  <div className="border border-red-500/20 bg-red-500/10 text-red-300 p-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    onClick={onClose}
                    className="border border-white/10 px-5 py-3 text-sm text-gray-300 hover:text-white transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveSettings}
                    disabled={saving || videoState === 'processing'}
                    className="bg-white text-black px-6 py-3 text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 size={16} className="animate-spin" />}
                    Enregistrer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


function ProjectRow({
  project,
  onEdit,
  onDelete,
  onTogglePublished,
  canDelete,
}) {
  return (
    <div className="px-6 py-5 border-b border-white/10 last:border-b-0 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
      <div className="flex items-center gap-5 min-w-0">
        <div className="w-20 h-16 bg-zinc-900 overflow-hidden shrink-0">
          {project.thumbnail_url ? (
            <img
              src={project.thumbnail_url}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-700">
              <FolderOpen size={20} />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h3 className="font-medium truncate">
              {project.title}
            </h3>

            <span
              className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 border ${
                project.published
                  ? 'text-green-300 border-green-500/20 bg-green-500/5'
                  : 'text-gray-500 border-white/10'
              }`}
            >
              {project.published ? 'Publié' : 'Brouillon'}
            </span>
          </div>

          <p className="text-sm text-gray-600">
            {[project.category, project.year, project.location]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onTogglePublished}
          className="border border-white/10 px-4 py-2.5 text-xs text-gray-400 hover:text-white hover:border-white/30 transition flex items-center gap-2"
        >
          {project.published ? (
            <>
              <EyeOff size={14} />
              Dépublier
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              Publier
            </>
          )}
        </button>

        <button
          onClick={onEdit}
          className="border border-white/10 px-4 py-2.5 text-xs text-gray-400 hover:text-white hover:border-white/30 transition flex items-center gap-2"
        >
          <Edit3 size={14} />
          Modifier
        </button>

        {canDelete && (
          <button
            onClick={onDelete}
            className="border border-red-500/10 px-4 py-2.5 text-xs text-red-400 hover:text-red-300 hover:border-red-500/30 transition flex items-center gap-2"
          >
            <Trash2 size={14} />
            Supprimer
          </button>
        )}
      </div>
    </div>
  )
}

function ProjectEditor({
  session,
  project,
  onClose,
  onSaved,
}) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_PROJECT,
    ...(project ?? {}),
    roles: project?.roles ?? [],
    gallery: project?.gallery ?? [],
  }))

  const [rolesText, setRolesText] = useState(
    (project?.roles ?? []).join('\n'),
  )

  const [galleryText, setGalleryText] = useState(
    (project?.gallery ?? []).join('\n'),
  )

  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    Boolean(project?.id),
  )

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [coverUploading, setCoverUploading] = useState(false)
  const [galleryUploading, setGalleryUploading] = useState(false)
  const muxUploadIdRef = useRef('')
  const [muxVideoState, setMuxVideoState] = useState('')
  const [muxVideoMessage, setMuxVideoMessage] = useState('')
  const [projectVideos, setProjectVideos] = useState([])
  const [videosLoading, setVideosLoading] = useState(Boolean(project?.id))
  const [uploaderKey, setUploaderKey] = useState(0)
  const [newVideoMeta, setNewVideoMeta] = useState({
    title: '',
    video_type: '',
    orientation: 'horizontal',
    is_featured: false,
    external_url: '',
  })

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleTitleChange(value) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: slugManuallyEdited ? current.slug : slugify(value),
    }))
  }

  async function handleCoverUpload(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setError('')
    setCoverUploading(true)

    try {
      const publicUrl = await uploadImageToSupabase(file)
      update('thumbnail_url', publicUrl)
    } catch (uploadError) {
      setError(uploadError.message || "Impossible d'uploader l'image.")
    } finally {
      setCoverUploading(false)
    }
  }

  async function handleGalleryUpload(event) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''

    if (files.length === 0) return

    setError('')
    setGalleryUploading(true)

    try {
      const uploadedUrls = []

      for (const file of files) {
        const publicUrl = await uploadImageToSupabase(file)
        uploadedUrls.push(publicUrl)
      }

      const nextGallery = [
        ...galleryText
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
        ...uploadedUrls,
      ]

      setGalleryText(Array.from(new Set(nextGallery)).join('\n'))
    } catch (uploadError) {
      setError(uploadError.message || "Impossible d'uploader les images.")
    } finally {
      setGalleryUploading(false)
    }
  }

  function removeGalleryImage(url) {
    const nextGallery = galleryText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
      .filter((item) => item !== url)

    setGalleryText(nextGallery.join('\n'))
  }

  async function createMuxUploadUrl() {
    setError('')
    setMuxVideoState('creating')
    setMuxVideoMessage("Préparation de l'upload sécurisé…")

    const { data, error: functionError } = await supabase.functions.invoke('mux-video', {
      body: {
        action: 'create',
        origin: window.location.origin,
      },
    })

    if (functionError) {
      setMuxVideoState('error')
      setMuxVideoMessage('')
      throw new Error(functionError.message || "Impossible de préparer l'upload Mux.")
    }

    if (!data?.url || !data?.uploadId) {
      setMuxVideoState('error')
      setMuxVideoMessage('')
      throw new Error("Mux n'a pas renvoyé d'URL d'upload valide.")
    }

    muxUploadIdRef.current = data.uploadId
    setMuxVideoState('uploading')
    setMuxVideoMessage('Upload en cours vers Mux…')

    return data.url
  }

  async function getMuxUploadStatus(uploadId) {
    const { data, error: functionError } = await supabase.functions.invoke('mux-video', {
      body: {
        action: 'status',
        uploadId,
      },
    })

    if (functionError) {
      throw new Error(functionError.message || "Impossible de vérifier l'état de la vidéo.")
    }

    return data
  }

  async function waitForMuxVideoReady(uploadId) {
    if (!uploadId) {
      throw new Error("Identifiant d'upload Mux introuvable.")
    }

    setMuxVideoState('processing')
    setMuxVideoMessage('Upload terminé. Mux prépare maintenant la vidéo…')

    for (let attempt = 0; attempt < 90; attempt += 1) {
      const status = await getMuxUploadStatus(uploadId)

      if (status?.status === 'ready' && status?.playbackId) {
        return status
      }

      if (
        ['errored', 'cancelled', 'timed_out'].includes(status?.uploadStatus) ||
        status?.assetStatus === 'errored'
      ) {
        throw new Error(status?.message || "Mux n'a pas pu traiter cette vidéo.")
      }

      await new Promise((resolve) => setTimeout(resolve, 4000))
    }

    throw new Error(
      "La vidéo est bien envoyée, mais Mux met plus de temps que prévu à la préparer. Réessaie dans quelques minutes."
    )
  }

  async function handleMuxUploadSuccess() {
    try {
      const status = await waitForMuxVideoReady(muxUploadIdRef.current)

      appendProjectVideo(
        `mux://${status.playbackId}`,
        status.assetId ?? null,
      )

      setMuxVideoState('ready')
      setMuxVideoMessage(
        'Vidéo prête et ajoutée au projet. Tu peux en ajouter une autre.'
      )
    } catch (muxError) {
      setMuxVideoState('error')
      setMuxVideoMessage('')
      setError(muxError.message || 'Erreur pendant le traitement Mux.')
    }
  }

  function handleMuxUploadError(event) {
    setMuxVideoState('error')
    setMuxVideoMessage('')
    const message =
      event?.detail?.message ||
      event?.detail ||
      "L'upload vidéo a échoué."
    setError(typeof message === 'string' ? message : "L'upload vidéo a échoué.")
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const cleanedVideos = projectVideos
      .filter((video) => cleanText(video.video_url))
      .map((video, index) => ({
        title: cleanText(video.title) || `Film ${String(index + 1).padStart(2, '0')}`,
        video_url: cleanText(video.video_url),
        mux_asset_id: cleanText(video.mux_asset_id) || null,
        video_type: cleanText(video.video_type) || null,
        orientation: ['horizontal', 'vertical', 'square'].includes(video.orientation)
          ? video.orientation
          : 'horizontal',
        is_featured: Boolean(video.is_featured),
        sort_order: index,
      }))

    if (cleanedVideos.length > 0 && !cleanedVideos.some((video) => video.is_featured)) {
      cleanedVideos[0].is_featured = true
    }

    // Une seule vidéo principale.
    let featuredFound = false
    cleanedVideos.forEach((video) => {
      if (video.is_featured && !featuredFound) {
        featuredFound = true
      } else if (video.is_featured) {
        video.is_featured = false
      }
    })

    const featuredVideo =
      cleanedVideos.find((video) => video.is_featured) ||
      cleanedVideos[0] ||
      null

    const payload = {
      title: cleanText(form.title),
      slug: cleanText(form.slug) || slugify(form.title),
      category: cleanText(form.category) || null,
      year: form.year ? Number(form.year) : null,
      location: cleanText(form.location) || null,
      description: cleanText(form.description) || null,
      roles: rolesText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      thumbnail_url: cleanText(form.thumbnail_url) || null,
      preview_video_url: null,
      // On garde ce champ synchronisé pour compatibilité avec les anciens builds.
      video_url: featuredVideo?.video_url || null,
      gallery: galleryText
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean),
      published: Boolean(form.published),
      sort_order: Number(form.sort_order || 0),
      updated_at: new Date().toISOString(),
    }

    if (!payload.title) {
      setError('Le titre du projet est obligatoire.')
      setSaving(false)
      return
    }

    if (!payload.slug) {
      setError('Le slug du projet est obligatoire.')
      setSaving(false)
      return
    }

    let result

    if (project?.id) {
      result = await supabase
        .from('projects')
        .update(payload)
        .eq('id', project.id)
        .select('id')
        .single()
    } else {
      result = await supabase
        .from('projects')
        .insert({
          ...payload,
          created_by: session.user.id,
        })
        .select('id')
        .single()
    }

    if (result.error) {
      setError(result.error.message)
      setSaving(false)
      return
    }

    const projectId = result.data?.id || project?.id

    const { error: videosError } = await supabase.rpc(
      'replace_project_videos',
      {
        p_project_id: projectId,
        p_videos: cleanedVideos,
      },
    )

    if (videosError) {
      setError(
        `Le projet a été enregistré, mais les vidéos n'ont pas pu être synchronisées : ${videosError.message}`,
      )
      setSaving(false)
      return
    }

    setSaving(false)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen px-4 py-6 md:px-8 md:py-10">
        <div className="max-w-4xl mx-auto bg-[#0b0b0b] border border-white/10">
          <div className="px-6 md:px-8 py-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0b0b0b] z-10">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-600 mb-2">
                {project?.id ? 'Modifier' : 'Nouveau projet'}
              </p>
              <h2 className="text-2xl font-semibold">
                {project?.id ? project.title : 'Créer un projet'}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition"
              aria-label="Fermer"
            >
              <X />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
            {error && (
              <div className="border border-red-500/20 bg-red-500/10 text-red-300 p-4 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Titre *">
                <input
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="admin-input"
                  placeholder="Destroy Party"
                />
              </Field>

              <Field label="Slug *" hint="URL du projet">
                <input
                  required
                  value={form.slug}
                  onChange={(e) => {
                    setSlugManuallyEdited(true)
                    update('slug', slugify(e.target.value))
                  }}
                  className="admin-input"
                  placeholder="destroy-party"
                />
              </Field>

              <Field label="Catégorie">
                <input
                  value={form.category ?? ''}
                  onChange={(e) => update('category', e.target.value)}
                  className="admin-input"
                  placeholder="Event Coverage"
                />
              </Field>

              <Field label="Année">
                <input
                  type="number"
                  min="1900"
                  max="2100"
                  value={form.year ?? ''}
                  onChange={(e) => update('year', e.target.value)}
                  className="admin-input"
                />
              </Field>

              <Field label="Lieu">
                <input
                  value={form.location ?? ''}
                  onChange={(e) => update('location', e.target.value)}
                  className="admin-input"
                  placeholder="Parma, Italy"
                />
              </Field>

              <Field label="Ordre d'affichage">
                <input
                  type="number"
                  value={form.sort_order ?? 0}
                  onChange={(e) => update('sort_order', e.target.value)}
                  className="admin-input"
                  placeholder="0"
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                value={form.description ?? ''}
                onChange={(e) => update('description', e.target.value)}
                className="admin-input"
                placeholder="Présente le contexte, l'objectif et le travail réalisé..."
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Image de couverture"
                hint="JPG, PNG, WebP ou AVIF · max 10 Mo"
              >
                <div className="space-y-3">
                  <label className="border border-dashed border-white/15 hover:border-white/35 min-h-36 flex items-center justify-center cursor-pointer transition bg-zinc-950 overflow-hidden relative">
                    {form.thumbnail_url ? (
                      <img
                        src={form.thumbnail_url}
                        alt="Aperçu de la couverture"
                        className="absolute inset-0 w-full h-full object-cover opacity-55"
                      />
                    ) : null}

                    <div className="relative z-10 flex flex-col items-center text-center p-5">
                      {coverUploading ? (
                        <Loader2 className="animate-spin mb-3" size={22} />
                      ) : (
                        <Upload className="mb-3" size={22} />
                      )}

                      <span className="text-sm text-white">
                        {coverUploading
                          ? 'Upload en cours...'
                          : form.thumbnail_url
                            ? 'Remplacer la couverture'
                            : 'Uploader une couverture'}
                      </span>

                      <span className="text-xs text-gray-500 mt-1">
                        Clique pour sélectionner une image
                      </span>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={coverUploading}
                      onChange={handleCoverUpload}
                    />
                  </label>

                  <input
                    value={form.thumbnail_url ?? ''}
                    onChange={(e) => update('thumbnail_url', e.target.value)}
                    className="admin-input"
                    placeholder="Ou colle une URL d'image"
                  />

                  {form.thumbnail_url && (
                    <button
                      type="button"
                      onClick={() => update('thumbnail_url', '')}
                      className="text-xs text-red-400 hover:text-red-300 transition"
                    >
                      Retirer la couverture du projet
                    </button>
                  )}
                </div>
              </Field>

              <Field
                label="Films du projet"
                hint="Ajoute autant de vidéos que nécessaire. La vidéo principale sert aussi de preview sur la page d'accueil."
              >
                <div className="space-y-6">
                  {videosLoading ? (
                    <div className="border border-white/10 bg-zinc-950 py-12 flex justify-center">
                      <Loader2 className="animate-spin text-gray-600" />
                    </div>
                  ) : projectVideos.length > 0 ? (
                    <div className="space-y-3">
                      {projectVideos.map((video, index) => {
                        const playbackId = muxPlaybackIdFromUrl(video.video_url)
                        const previewImage = playbackId
                          ? `https://image.mux.com/${playbackId}/thumbnail.jpg?width=480&fit_mode=smartcrop`
                          : form.thumbnail_url

                        return (
                          <div
                            key={video._client_id}
                            className={`border p-4 md:p-5 ${
                              video.is_featured
                                ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                                : 'border-white/10 bg-zinc-950'
                            }`}
                          >
                            <div className="grid grid-cols-1 md:grid-cols-[150px_1fr] gap-5">
                              <div
                                className={`bg-black overflow-hidden ${
                                  video.orientation === 'vertical'
                                    ? 'aspect-[9/16] md:max-h-56'
                                    : video.orientation === 'square'
                                    ? 'aspect-square'
                                    : 'aspect-video'
                                }`}
                              >
                                {previewImage ? (
                                  <img
                                    src={previewImage}
                                    alt={video.title || `Film ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">
                                    VIDEO
                                  </div>
                                )}
                              </div>

                              <div className="space-y-4 min-w-0">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] text-gray-600 tracking-[0.18em] uppercase">
                                      Film {String(index + 1).padStart(2, '0')}
                                    </span>

                                    {video.is_featured && (
                                      <span className="text-[9px] uppercase tracking-[0.14em] px-2 py-1 border border-emerald-500/20 text-emerald-400">
                                        Principal
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => moveProjectVideo(video._client_id, -1)}
                                      disabled={index === 0}
                                      className="w-8 h-8 border border-white/10 text-gray-500 hover:text-white disabled:opacity-20"
                                      title="Monter"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveProjectVideo(video._client_id, 1)}
                                      disabled={index === projectVideos.length - 1}
                                      className="w-8 h-8 border border-white/10 text-gray-500 hover:text-white disabled:opacity-20"
                                      title="Descendre"
                                    >
                                      ↓
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeProjectVideo(video._client_id)}
                                      className="w-8 h-8 border border-red-500/20 text-red-400 hover:text-red-300"
                                      title="Retirer"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input
                                    value={video.title ?? ''}
                                    onChange={(e) =>
                                      updateProjectVideo(
                                        video._client_id,
                                        'title',
                                        e.target.value,
                                      )
                                    }
                                    className="admin-input"
                                    placeholder="Aftermovie"
                                  />

                                  <input
                                    value={video.video_type ?? ''}
                                    onChange={(e) =>
                                      updateProjectVideo(
                                        video._client_id,
                                        'video_type',
                                        e.target.value,
                                      )
                                    }
                                    className="admin-input"
                                    placeholder="Aftermovie / Teaser / Reel..."
                                  />

                                  <select
                                    value={video.orientation ?? 'horizontal'}
                                    onChange={(e) =>
                                      updateProjectVideo(
                                        video._client_id,
                                        'orientation',
                                        e.target.value,
                                      )
                                    }
                                    className="admin-input"
                                  >
                                    <option value="horizontal">Horizontal 16:9</option>
                                    <option value="vertical">Vertical 9:16</option>
                                    <option value="square">Carré 1:1</option>
                                  </select>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateProjectVideo(
                                        video._client_id,
                                        'is_featured',
                                        true,
                                      )
                                    }
                                    className={`px-4 py-3 border text-xs uppercase tracking-[0.1em] transition ${
                                      video.is_featured
                                        ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/[0.05]'
                                        : 'border-white/10 text-gray-500 hover:text-white hover:border-white/25'
                                    }`}
                                  >
                                    {video.is_featured
                                      ? 'Vidéo principale'
                                      : 'Définir comme principale'}
                                  </button>
                                </div>

                                <p className="text-[10px] text-gray-700 break-all">
                                  {video.video_url}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="border border-dashed border-white/15 p-8 text-center">
                      <p className="text-sm text-gray-400">Aucune vidéo pour ce projet.</p>
                      <p className="text-xs text-gray-700 mt-2">
                        La première vidéo ajoutée deviendra automatiquement la vidéo principale.
                      </p>
                    </div>
                  )}

                  <div className="border border-white/10 bg-[#0e0e0e] p-5 md:p-6">
                    <div className="mb-5">
                      <p className="text-sm font-medium">+ Ajouter une vidéo</p>
                      <p className="text-[11px] text-gray-600 mt-1">
                        Renseigne les informations, puis choisis le fichier à envoyer vers Mux.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                      <input
                        value={newVideoMeta.title}
                        onChange={(e) =>
                          setNewVideoMeta((current) => ({
                            ...current,
                            title: e.target.value,
                          }))
                        }
                        className="admin-input"
                        placeholder="Titre : Aftermovie"
                      />

                      <input
                        value={newVideoMeta.video_type}
                        onChange={(e) =>
                          setNewVideoMeta((current) => ({
                            ...current,
                            video_type: e.target.value,
                          }))
                        }
                        className="admin-input"
                        placeholder="Type : Teaser / Reel / BTS..."
                      />

                      <select
                        value={newVideoMeta.orientation}
                        onChange={(e) =>
                          setNewVideoMeta((current) => ({
                            ...current,
                            orientation: e.target.value,
                          }))
                        }
                        className="admin-input"
                      >
                        <option value="horizontal">Horizontal 16:9</option>
                        <option value="vertical">Vertical 9:16</option>
                        <option value="square">Carré 1:1</option>
                      </select>

                      <label className="border border-white/10 px-4 py-3 text-xs text-gray-400 flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newVideoMeta.is_featured}
                          onChange={(e) =>
                            setNewVideoMeta((current) => ({
                              ...current,
                              is_featured: e.target.checked,
                            }))
                          }
                        />
                        Définir comme vidéo principale
                      </label>
                    </div>

                    <MuxUploader
                      key={uploaderKey}
                      endpoint={createMuxUploadUrl}
                      pausable
                      dynamicChunkSize
                      onSuccess={handleMuxUploadSuccess}
                      onUploadError={handleMuxUploadError}
                    />

                    {muxVideoMessage && (
                      <div
                        className={`mt-4 text-xs ${
                          muxVideoState === 'ready'
                            ? 'text-emerald-400'
                            : 'text-gray-400'
                        }`}
                      >
                        {muxVideoState === 'processing' && (
                          <Loader2 size={14} className="inline mr-2 animate-spin" />
                        )}
                        {muxVideoMessage}
                      </div>
                    )}

                    <details className="mt-5 border-t border-white/10 pt-5">
                      <summary className="cursor-pointer text-xs text-gray-500">
                        Ajouter une vidéo déjà hébergée
                      </summary>

                      <div className="mt-4 flex flex-col md:flex-row gap-3">
                        <input
                          value={newVideoMeta.external_url}
                          onChange={(e) =>
                            setNewVideoMeta((current) => ({
                              ...current,
                              external_url: e.target.value,
                            }))
                          }
                          className="admin-input flex-1"
                          placeholder="YouTube, Vimeo ou URL directe..."
                        />

                        <button
                          type="button"
                          onClick={addExternalVideo}
                          className="border border-white/15 px-5 py-3 text-xs uppercase tracking-[0.1em] text-gray-300 hover:text-white hover:border-white/30 transition"
                        >
                          Ajouter l'URL
                        </button>
                      </div>
                    </details>
                  </div>
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <Field
                label="Rôles"
                hint="Un rôle par ligne"
              >
                <textarea
                  value={rolesText}
                  onChange={(e) => setRolesText(e.target.value)}
                  className="admin-input"
                  placeholder={'Videography\nEditing\nColor Grading'}
                />
              </Field>

              <Field
                label="Galerie"
                hint="Tu peux sélectionner plusieurs images"
              >
                <div className="space-y-4">
                  <label className="border border-dashed border-white/15 hover:border-white/35 min-h-32 flex items-center justify-center cursor-pointer transition bg-zinc-950">
                    <div className="flex flex-col items-center text-center p-5">
                      {galleryUploading ? (
                        <Loader2 className="animate-spin mb-3" size={22} />
                      ) : (
                        <ImagePlus className="mb-3" size={22} />
                      )}

                      <span className="text-sm text-white">
                        {galleryUploading
                          ? 'Upload en cours...'
                          : 'Ajouter des images'}
                      </span>

                      <span className="text-xs text-gray-500 mt-1">
                        JPG, PNG, WebP ou AVIF · 10 Mo max par image
                      </span>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={galleryUploading}
                      onChange={handleGalleryUpload}
                    />
                  </label>

                  {galleryText
                    .split('\n')
                    .map((item) => item.trim())
                    .filter(Boolean).length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {galleryText
                        .split('\n')
                        .map((item) => item.trim())
                        .filter(Boolean)
                        .map((url) => (
                          <div
                            key={url}
                            className="relative aspect-square bg-zinc-900 overflow-hidden border border-white/10 group"
                          >
                            <img
                              src={url}
                              alt=""
                              className="w-full h-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() => removeGalleryImage(url)}
                              className="absolute top-2 right-2 bg-black/80 border border-white/10 w-8 h-8 flex items-center justify-center text-red-400 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition"
                              title="Retirer de la galerie"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}

                  <details className="border border-white/10">
                    <summary className="cursor-pointer px-4 py-3 text-xs text-gray-500">
                      Gestion avancée par URL
                    </summary>

                    <div className="p-4 border-t border-white/10">
                      <textarea
                        value={galleryText}
                        onChange={(e) => setGalleryText(e.target.value)}
                        className="admin-input"
                        placeholder={'https://...\nhttps://...'}
                      />
                    </div>
                  </details>
                </div>
              </Field>
            </div>

            <label className="flex items-center gap-3 border border-white/10 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(form.published)}
                onChange={(e) => update('published', e.target.checked)}
              />
              <div>
                <p className="text-sm text-white">
                  Publier le projet
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Les visiteurs pourront le voir sur le portfolio.
                </p>
              </div>
            </label>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="border border-white/10 px-6 py-4 text-xs uppercase tracking-[0.15em] text-gray-400 hover:text-white transition"
              >
                Annuler
              </button>

              <button
                disabled={saving}
                className="bg-white text-black px-7 py-4 text-xs uppercase tracking-[0.15em] font-medium hover:bg-gray-200 transition disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {saving ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}

                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function DashboardCard({ label, value, icon }) {
  return (
    <div className="border border-white/10 bg-zinc-950 p-7">
      <div className="text-gray-600 mb-10">
        {icon}
      </div>

      <p className="text-4xl font-semibold mb-2">
        {value}
      </p>

      <p className="text-sm text-gray-500">
        {label}
      </p>
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-xs tracking-[0.15em] uppercase text-gray-500">
          {label}
        </span>

        {hint && (
          <span className="text-[10px] text-gray-700">
            {hint}
          </span>
        )}
      </div>

      {children}
    </label>
  )
}
