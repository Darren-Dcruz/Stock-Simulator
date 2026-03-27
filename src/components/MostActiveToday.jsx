import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useStockData } from '@/hooks/useStockData';

const SECTOR_STYLES = {
  Banking:   'bg-blue-500/15 text-blue-500',
  Energy:    'bg-yellow-500/15 text-yellow-500',
  IT:        'bg-purple-500/15 text-purple-500',
  Materials: 'bg-orange-500/15 text-orange-500',
  default:   'bg-gray-500/15 text-gray-400',
};

function StockCard({ stock }) {
  const isUp = stock.change >= 0;
  const sectorCls = SECTOR_STYLES[stock.sector] ?? SECTOR_STYLES.default;
  const formattedPrice = Number(stock.price).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="flex-shrink-0 w-52 rounded-xl border bg-card hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer">
      {/* card header: icon + name */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0 ${sectorCls}`}>
          {stock.icon}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight truncate">{stock.ticker}</p>
          <p className="text-xs text-muted-foreground leading-tight truncate">{stock.name}</p>
        </div>
      </div>

      {/* card footer: price + change */}
      <div className="flex items-center justify-between px-4 pb-4">
        <span className="font-semibold text-sm">₹{formattedPrice}</span>
        <span className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md ${
          isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
        }`}>
          {isUp
            ? <TrendingUp className="h-3 w-3" />
            : <TrendingDown className="h-3 w-3" />
          }
          {isUp ? '+' : ''}{Number(stock.change).toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="flex-shrink-0 w-52 rounded-xl border bg-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  );
}

export default function MostActiveToday() {
  const { data: stocks, isLoading, isFetching, refetch } = useStockData();
  const isMock = stocks?.[0]?.isMock;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          🔥 Most Active Today
        </h2>
        <div className="flex items-center gap-3">
          {!isLoading && (
            <span className={`flex items-center gap-1 text-xs ${isMock ? 'text-amber-500' : 'text-green-500'}`}>
              {isMock
                ? <><WifiOff className="h-3 w-3" /> Demo · add VITE_FINNHUB_KEY for live data</>
                : <><Wifi className="h-3 w-3" /> Live via Finnhub · updates every 2 min</>
              }
            </span>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            aria-label="Refresh stocks"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : stocks?.map(stock => <StockCard key={stock.symbol} stock={stock} />)
        }
      </div>
    </section>
  );
}
