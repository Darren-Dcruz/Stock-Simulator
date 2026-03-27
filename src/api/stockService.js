const CORS_PROXY = 'https://corsproxy.io/?';
const YAHOO_QUOTE = 'https://query1.finance.yahoo.com/v7/finance/quote';

export const TRACKED_STOCKS = [
  { symbol: 'RELIANCE.NS',  ticker: 'RELIANCE',  name: 'Reliance Industries Ltd.', icon: '⚡', sector: 'Energy'    },
  { symbol: 'SBIN.NS',      ticker: 'SBIN',      name: 'State Bank of India',       icon: '🏦', sector: 'Banking'   },
  { symbol: 'KOTAKBANK.NS', ticker: 'KOTAKBANK', name: 'Kotak Mahindra Bank',        icon: '🏦', sector: 'Banking'   },
  { symbol: 'AXISBANK.NS',  ticker: 'AXISBANK',  name: 'Axis Bank Ltd.',             icon: '🏦', sector: 'Banking'   },
  { symbol: 'POWERGRID.NS', ticker: 'POWERGRID', name: 'Power Grid Corp.',           icon: '🔌', sector: 'Energy'    },
  { symbol: 'TATASTEEL.NS', ticker: 'TATASTEEL', name: 'Tata Steel Ltd.',            icon: '🏭', sector: 'Materials' },
  { symbol: 'TCS.NS',       ticker: 'TCS',       name: 'Tata Consultancy Services',  icon: '💻', sector: 'IT'        },
  { symbol: 'HDFCBANK.NS',  ticker: 'HDFCBANK',  name: 'HDFC Bank Ltd.',             icon: '🏦', sector: 'Banking'   },
  { symbol: 'INFY.NS',      ticker: 'INFY',      name: 'Infosys Ltd.',               icon: '💻', sector: 'IT'        },
  { symbol: 'WIPRO.NS',     ticker: 'WIPRO',     name: 'Wipro Ltd.',                 icon: '💻', sector: 'IT'        },
];

export async function fetchStockQuotes() {
  const symbols = TRACKED_STOCKS.map(s => s.symbol).join(',');
  const target = `${YAHOO_QUOTE}?symbols=${symbols}&formatted=false`;
  const url = `${CORS_PROXY}${encodeURIComponent(target)}`;

  const res = await fetch(url, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data = await res.json();
  const results = data.quoteResponse?.result ?? [];

  return results.map(q => {
    const meta = TRACKED_STOCKS.find(s => s.symbol === q.symbol) ?? {};
    return {
      ...meta,
      price: q.regularMarketPrice ?? 0,
      change: q.regularMarketChangePercent ?? 0,
      changeAmount: q.regularMarketChange ?? 0,
      volume: q.regularMarketVolume ?? 0,
      high: q.regularMarketDayHigh ?? 0,
      low: q.regularMarketDayLow ?? 0,
      open: q.regularMarketOpen ?? 0,
    };
  });
}
