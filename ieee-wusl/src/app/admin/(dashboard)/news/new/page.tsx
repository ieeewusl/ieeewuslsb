import NewsForm from '@/components/admin/NewsForm'

export default function NewArticlePage() {
  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">New Article</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">Write a news article or announcement.</p>
      </div>
      <NewsForm mode="create" />
    </div>
  )
}
