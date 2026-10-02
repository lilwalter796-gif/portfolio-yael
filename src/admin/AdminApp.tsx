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
  Plus,
  RefreshCw,
  Save,
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
      <header className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <p className="font-medium tracking-[0.15em]">
              YAËL NOUKIMI
            </p>
            <div className="flex items-center gap-3 mt-1">
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
          </div>

          <div className="flex items-center gap-6">
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
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
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

    // Environ 6 minutes maximum. Les vidéos courtes sont généralement prêtes bien avant.
    for (let attempt = 0; attempt < 90; attempt += 1) {
      const status = await getMuxUploadStatus(uploadId)

      if (status?.status === 'ready' && status?.playbackId) {
        update('video_url', `mux://${status.playbackId}`)
        setMuxVideoState('ready')
        setMuxVideoMessage('Vidéo prête. Clique sur Enregistrer pour l’associer au projet.')
        return
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
      await waitForMuxVideoReady(muxUploadIdRef.current)
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
      preview_video_url: cleanText(form.preview_video_url) || null,
      video_url: cleanText(form.video_url) || null,
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
    } else {
      result = await supabase
        .from('projects')
        .insert({
          ...payload,
          created_by: session.user.id,
        })
    }

    if (result.error) {
      setError(result.error.message)
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
                label="Vidéos du projet"
                hint="La même vidéo Mux sert sur la page projet et en preview au survol"
              >
                <div className="space-y-6">
                  <div className="border border-white/10 bg-zinc-950 p-4 md:p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium">Vidéo principale via Mux</p>
                        <p className="text-[11px] text-gray-600 mt-1">
                          Sélectionne le fichier original. Cette même vidéo sera utilisée sur la page projet et en preview muette au survol.
                        </p>
                      </div>

                      {String(form.video_url ?? '').startsWith('mux://') && (
                        <span className="text-[10px] uppercase tracking-[0.15em] text-emerald-400">
                          Prête
                        </span>
                      )}
                    </div>

                    <MuxUploader
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

                    {String(form.video_url ?? '').startsWith('mux://') && (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-[11px] text-gray-600 break-all">
                          Playback ID : {String(form.video_url).replace('mux://', '')}
                        </p>
                        <button
                          type="button"
                          onClick={() => update('video_url', '')}
                          className="mt-3 text-xs text-red-400 hover:text-red-300 transition"
                        >
                          Retirer cette vidéo
                        </button>
                      </div>
                    )}
                  </div>

                  <details className="border border-white/10 p-4">
                    <summary className="cursor-pointer text-xs text-gray-500">
                      Utiliser une URL vidéo à la place
                    </summary>

                    <div className="mt-4">
                      <input
                        value={form.video_url ?? ''}
                        onChange={(e) => update('video_url', e.target.value)}
                        className="admin-input"
                        placeholder="YouTube, Vimeo ou URL directe .mp4"
                      />
                      <p className="text-[11px] leading-relaxed text-gray-700 mt-2">
                        Garde cette option pour une vidéo déjà hébergée ailleurs.
                      </p>
                    </div>
                  </details>
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
