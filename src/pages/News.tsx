import { useState } from 'react'
import type { NewsArticle } from '@/types'
import { useMarketNews } from '@/hooks/useMarketNews'
import { Skeleton } from '@/components/ui/skeleton'
import { hasFinnhubKey } from '@/api/stockService'
import { RefreshCw, ExternalLink } from 'lucide-react'

const NEWS_TABS = [
  { id: 'general', label: 'Top News'  },
  { id: 'forex',   label: 'Forex'     },
  { id: 'crypto',  label: 'Crypto'    },
  { id: 'merger',  label: 'M&A'       },
]

function timeAgo(unixSec: number) {
  const diff = Math.floor(Date.now() / 1000) - unixSec
  if (diff < 60)   return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function NewsCard({ article }: { article: NewsArticle }) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-xl border bg-card hover:border-orange-500/40 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {article.image && (
        <div className="h-40 overflow-hidden bg-muted">
          <img
            src={article.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.currentTarget.style.display = 'none' }}
          />
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-orange-500 truncate">{article.source}</span>
          <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo(article.datetime)}</span>
        </div>
        <p className="font-semibold text-sm leading-snug line-clamp-3 group-hover:text-orange-500 transition-colors">
          {article.headline}
        </p>
        {article.summary && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-auto">{article.summary}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
          <ExternalLink className="h-3 w-3" />
          <span>Read full article</span>
        </div>
      </div>
    </a>
  )
}

function NewsCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  )
}

export default function News() {
  const [category, setCategory] = useState('general')
  const { data: articles, isLoading, isFetching, refetch } = useMarketNews(category)
  const hasKey = hasFinnhubKey()

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market News</h1>
          <p className="text-sm text-muted-foreground">Live financial news via Finnhub · refreshes every 15 min</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching || !hasKey}
          className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
          title="Refresh news"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {NEWS_TABS.map(t => (
          <button key={t.id} onClick={() => setCategory(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              category === t.id
                ? 'bg-orange-500 text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* No API key state */}
      {!hasKey && (
        <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
          <p className="text-4xl mb-4">📰</p>
          <p className="font-semibold mb-1">Live news requires a Finnhub API key</p>
          <p className="text-sm">Add <code className="bg-muted px-1 rounded">VITE_FINNHUB_KEY</code> to your environment to enable live news</p>
        </div>
      )}

      {/* News grid */}
      {hasKey && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => <NewsCardSkeleton key={i} />)
            : articles && articles.length > 0
              ? articles.map(article => <NewsCard key={article.id ?? article.url} article={article} />)
              : (
                  <div className="col-span-3 text-center py-16 text-muted-foreground">
                    <p>No news available for this category right now.</p>
                  </div>
                )
          }
        </div>
      )}
    </div>
  )
}
