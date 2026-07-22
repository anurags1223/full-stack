/**
 * Full-stack Experiments 1.1.1 + 1.1.2
 * ------------------------------------
 * 1.1.1 Dynamic multi-platform post composer with real-time validation
 * 1.1.2 Draft management (CRUD, localStorage, mock API, loading/feedback UX)
 */
import { useMemo, useState } from 'react'
import { Clock } from 'lucide-react'
import PostComposer from './components/PostComposer'
import DraftList from './components/DraftList'
import { useDrafts } from './hooks/useDrafts'
import { validateAll } from './utils/validation'
import { publishPost } from './services/mockApi'

function App() {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter'])
  const [media, setMedia] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [currentDraftId, setCurrentDraftId] = useState(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [status, setStatus] = useState(null)
  const [showDrafts, setShowDrafts] = useState(true)

  const { drafts, isLoading, isSaving, saveDraft, deleteDraft } = useDrafts()

  const validation = useMemo(
    () =>
      validateAll(selectedPlatforms, content, Boolean(media || mediaPreview)),
    [selectedPlatforms, content, media, mediaPreview]
  )

  const { validations, hasError, maxLength, remaining, hashtagCount } =
    validation

  const showStatus = (type, msg, ms = 1600) => {
    setStatus({ type, msg })
    if (ms) setTimeout(() => setStatus(null), ms)
  }

  const togglePlatform = (id) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  const handleContentChange = (value) => {
    if (value.length <= Math.max(maxLength, 63206)) {
      setContent(value)
    }
  }

  const handleMediaUpload = (file, preview) => {
    setMedia(file)
    setMediaPreview(preview)
  }

  const removeMedia = () => {
    setMedia(null)
    setMediaPreview(null)
  }

  const clearAll = () => {
    setContent('')
    setSelectedPlatforms(['twitter'])
    setMedia(null)
    setMediaPreview(null)
    setCurrentDraftId(null)
    setStatus(null)
  }

  const handleSaveDraft = async () => {
    const result = await saveDraft(
      {
        content,
        platforms: selectedPlatforms,
        media:
          media || mediaPreview
            ? { name: media?.name || 'image', preview: mediaPreview }
            : null,
      },
      currentDraftId
    )

    if (result.ok) {
      setCurrentDraftId(result.draft.id)
      showStatus('success', result.message, 1200)
    } else {
      showStatus('error', result.message, 2000)
    }
  }

  const handlePublish = async () => {
    if (hasError || !content.trim() || selectedPlatforms.length === 0) return

    setIsPublishing(true)
    setStatus(null)

    try {
      const result = await publishPost({
        content,
        platforms: selectedPlatforms,
        hasMedia: Boolean(media || mediaPreview),
      })
      showStatus('success', result.message, 1600)
      setTimeout(() => clearAll(), 1600)
    } catch (err) {
      showStatus('error', err.message || 'Publish failed', 2500)
    } finally {
      setIsPublishing(false)
    }
  }

  const loadDraft = (draft) => {
    setContent(draft.content)
    setSelectedPlatforms(
      draft.platforms?.length ? draft.platforms : ['twitter']
    )
    if (draft.media?.preview) {
      setMedia({ name: draft.media.name || 'image' })
      setMediaPreview(draft.media.preview)
    } else {
      setMedia(null)
      setMediaPreview(null)
    }
    setCurrentDraftId(draft.id)
    showStatus('success', 'Draft loaded', 1000)
  }

  const handleDeleteDraft = async (id) => {
    const result = await deleteDraft(id)
    if (result.ok) {
      if (currentDraftId === id) {
        setCurrentDraftId(null)
        setContent('')
        setMedia(null)
        setMediaPreview(null)
      }
      showStatus('success', result.message, 1000)
    } else {
      showStatus('error', result.message, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-16">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-9">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shrink-0">
              <span className="text-black text-2xl font-semibold tracking-tighter">
                P
              </span>
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-1.5px] sm:tracking-[-2.5px]">
                Composer
              </h1>
              <p className="text-zinc-500 text-sm sm:text-[15px] sm:-mt-1">
                Experiments 1.1.1 & 1.1.2 — multi-platform posting + drafts
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDrafts((v) => !v)}
            className="flex items-center justify-center gap-2 px-5 h-11 rounded-3xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-sm active:scale-[0.985] transition-all w-full sm:w-auto"
          >
            <Clock size={17} />
            {showDrafts ? 'Hide drafts' : 'Show drafts'}
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={showDrafts ? 'lg:col-span-7' : 'lg:col-span-12'}>
            <PostComposer
              content={content}
              onContentChange={handleContentChange}
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={togglePlatform}
              mediaPreview={mediaPreview}
              onMediaUpload={handleMediaUpload}
              onMediaRemove={removeMedia}
              maxLength={maxLength}
              remaining={remaining}
              hashtagCount={hashtagCount}
              validations={validations}
              hasError={hasError}
              onSaveDraft={handleSaveDraft}
              onPublish={handlePublish}
              onClear={clearAll}
              isPublishing={isPublishing}
              isSaving={isSaving}
              status={status}
              currentDraftId={currentDraftId}
            />
          </div>

          {showDrafts && (
            <div className="lg:col-span-5">
              <DraftList
                drafts={drafts}
                isLoading={isLoading}
                currentDraftId={currentDraftId}
                onLoad={loadDraft}
                onDelete={handleDeleteDraft}
              />
            </div>
          )}
        </div>

        <footer className="mt-10 text-center text-xs text-zinc-600">
          Platform limits: X 280 · Instagram 2200 (image required) · LinkedIn
          3000 · Facebook 63206 · Hashtag rules enforced per platform
        </footer>
      </div>
    </div>
  )
}

export default App
