import MostActiveToday from '@/components/MostActiveToday';
import { useStockData } from '@/hooks/useStockData';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart2, Activity } from 'lucide-react';

function SummaryCard({ title, value, sub, icon: Icon, iconClass }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${iconClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: stocks } = useStockData();

  const gainers  = stocks?.filter(s => s.change >= 0).length ?? 0;
  const losers   = stocks?.filter(s => s.change < 0).length ?? 0;
  const total    = stocks?.length ?? 0;
  const avgChange = total
    ? (stocks.reduce((sum, s) => sum + s.change, 0) / total).toFixed(2)
    : '0.00';
  const topGainer = stocks?.reduce((a, b) => a.change > b.change ? a : b, stocks[0]);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Market Dashboard</h1>
        <p className="text-sm text-muted-foreground">NSE live data · refreshes every 60 s</p>
      </div>

      {/* summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Stocks Tracked"
          value={total}
          sub="NSE equities"
          icon={BarChart2}
          iconClass="bg-blue-500/10 text-blue-500"
        />
        <SummaryCard
          title="Gainers"
          value={gainers}
          sub={`${total ? ((gainers / total) * 100).toFixed(0) : 0}% of tracked`}
          icon={TrendingUp}
          iconClass="bg-green-500/10 text-green-500"
        />
        <SummaryCard
          title="Losers"
          value={losers}
          sub={`${total ? ((losers / total) * 100).toFixed(0) : 0}% of tracked`}
          icon={TrendingDown}
          iconClass="bg-red-500/10 text-red-500"
        />
        <SummaryCard
          title="Avg. Change"
          value={`${avgChange > 0 ? '+' : ''}${avgChange}%`}
          sub={topGainer ? `Top: ${topGainer.ticker} +${topGainer.change.toFixed(2)}%` : ''}
          icon={Activity}
          iconClass="bg-purple-500/10 text-purple-500"
        />
      </div>

      {/* most active ticker */}
      <MostActiveToday />
    </div>
  );
}
