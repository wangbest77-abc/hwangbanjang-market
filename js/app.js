'use strict';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const SECTOR_KO = {
  'Electronic Technology': '전자',
  'Technology Services': 'IT서비스',
  'Finance': '금융',
  'Health Technology': '건강기술',
  'Health Services': '의료서비스',
  'Retail Trade': '소매',
  'Energy Minerals': '에너지',
  'Producer Manufacturing': '제조',
  'Consumer Durables': '내구소비재',
  'Consumer Non-Durables': '필수소비재',
  'Consumer Services': '소비서비스',
  'Commercial Services': '상업서비스',
  'Communications': '통신',
  'Distribution Services': '유통',
  'Industrial Services': '산업서비스',
  'Non-Energy Minerals': '원자재',
  'Process Industries': '소재·공정',
  'Transportation': '운송',
  'Utilities': '유틸리티',
  'Miscellaneous': '기타'
};

const QUOTES = [
  { key: 'kospi', market: 'korea', symbol: 'KRX:KOSPI', label: 'KOSPI', sub: '유가증권', digits: 2, chart: 'KRX:KOSPI' },
  { key: 'kosdaq', market: 'korea', symbol: 'KRX:KOSDAQ', label: 'KOSDAQ', sub: '코스닥', digits: 2, chart: 'KRX:KOSDAQ' },
  { key: 'spx', market: 'america', symbol: 'SP:SPX', label: 'S&P 500', sub: '미국', digits: 2, chart: 'FOREXCOM:SPXUSD' },
  { key: 'ixic', market: 'america', symbol: 'NASDAQ:IXIC', label: '나스닥', sub: '종합', digits: 2, chart: 'FOREXCOM:NSXUSD' },
  { key: 'sox', market: 'america', symbol: 'NASDAQ:SOX', label: 'SOX', sub: '반도체', digits: 2, chart: 'NASDAQ:SOX' },
  { key: 'dji', market: 'america', symbol: 'DJ:DJI', label: '다우', sub: '산업', digits: 2, chart: 'FOREXCOM:DJI' },
  { key: 'usdkrw', market: 'forex', symbol: 'FX_IDC:USDKRW', label: 'USD/KRW', sub: '원·달러', digits: 2, chart: 'FX_IDC:USDKRW' },
  { key: 'us10y', market: 'bonds', symbol: 'TVC:US10Y', label: '미국 10년', sub: '국채 수익률', digits: 3, suffix: '%', chart: 'TVC:US10Y' },
  { key: 'wti', market: 'futures', symbol: 'NYMEX:CL1!', label: 'WTI', sub: '원유 선물', digits: 2, prefix: '$', chart: 'TVC:USOIL' },
  { key: 'gold', market: 'cfd', symbol: 'TVC:GOLD', label: '금', sub: 'XAU', digits: 2, prefix: '$', chart: 'TVC:GOLD' },
  { key: 'btc', market: 'crypto', symbol: 'BITSTAMP:BTCUSD', label: '비트코인', sub: 'BTC', digits: 0, prefix: '$', chart: 'BITSTAMP:BTCUSD' }
];

const TV_SOURCE = { spx: 'SPX500', us: 'AllUSA', kospi: 'KOSPI', kosdaq: 'KOSDAQ' };
const UNIVERSE_LABEL = { spx: 'S&P 500', us: '미국 시총', kospi: 'KOSPI', kosdaq: 'KOSDAQ' };
const TOP_US = 400;
const STOCK_FILTER = [
  { left: 'type', operation: 'equal', right: 'stock' },
  { left: 'is_primary', operation: 'equal', right: true },
  { left: 'market_cap_basic', operation: 'nempty' }
];
const SCAN_COLS = ['name', 'description', 'close', 'change', 'market_cap_basic', 'sector', 'currency', 'indexes'];

const CHARTS = [
  ['S&P 500', 'FOREXCOM:SPXUSD'],
  ['나스닥', 'FOREXCOM:NSXUSD'],
  ['다우', 'FOREXCOM:DJI'],
  ['SOX', 'NASDAQ:SOX'],
  ['삼성전자', 'KRX:005930'],
  ['SK하이닉스', 'KRX:000660'],
  ['엔비디아', 'NASDAQ:NVDA'],
  ['마이크론', 'NASDAQ:MU'],
  ['TSMC', 'NYSE:TSM'],
  ['ASML', 'NASDAQ:ASML'],
  ['원/달러', 'FX_IDC:USDKRW'],
  ['비트코인', 'BITSTAMP:BTCUSD'],
  ['금', 'TVC:GOLD']
];

const SUGGEST = [
  ['삼성전자', 'KRX:005930'],
  ['SK하이닉스', 'KRX:000660'],
  ['마이크론', 'NASDAQ:MU'],
  ['엔비디아', 'NASDAQ:NVDA'],
  ['TSMC', 'NYSE:TSM'],
  ['ASML', 'NASDAQ:ASML'],
  ['현대차', 'KRX:005380'],
  ['네이버', 'KRX:035420'],
  ['카카오', 'KRX:035720'],
  ['애플', 'NASDAQ:AAPL'],
  ['테슬라', 'NASDAQ:TSLA'],
  ['마이크로소프트', 'NASDAQ:MSFT'],
  ['이더리움', 'BITSTAMP:ETHUSD']
];
const KRX_NAMES = {
  '005930': '삼성전자',
  '000660': 'SK하이닉스',
  '005380': '현대차',
  '035420': '네이버',
  '035720': '카카오',
  '042700': '한미반도체',
  '000990': 'DB하이텍'
};
const DEFAULT_WL = ['KRX:005930', 'KRX:000660', 'NASDAQ:MU', 'NASDAQ:NVDA', 'NYSE:TSM', 'NASDAQ:ASML'];
const WL_KEY = 'hbj_watchlist';

const state = {
  universe: loadPref('hbj-universe', 'spx', ['spx', 'us', 'kospi', 'kosdaq']),
  color: loadPref('hbj-color', 'kr', ['kr', 'west']),
  group: loadPref('hbj-group', 'sector', ['sector', 'flat']) !== 'flat',
  view: loadPref('hbj-view', 'map', ['map', 'rank', 'tv']),
  zoom: '',
  selected: '',
  sort: 'cap',
  sortDir: -1,
  query: '',
  rankShown: 100,
  theme: loadPref('hbj-theme', 'dark', ['dark', 'light'])
};

const cache = {
  quotes: {},
  quoteAt: 0,
  quoteError: false,
  us: null,
  kr: null,
  usError: '',
  krError: '',
  usAt: 0,
  krAt: 0,
  ecb: null
};
const inflight = {};
const inited = {};
let chartSymbol = 'FOREXCOM:SPXUSD';
let tvHeatKey = '';
let fxDir = 'usdkrw';
let fxManual = false;

function loadPref(key, fallback, allowed) {
  try {
    const v = localStorage.getItem(key);
    if (v && allowed.includes(v)) return v;
  } catch (e) { /* ignore */ }
  return fallback;
}
function savePref(key, value) {
  try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
const NAME_ALIAS = {
  '에스케이하이닉스': 'SK하이닉스',
  '에스케이스퀘어': 'SK스퀘어',
  '에스케이이노베이션': 'SK이노베이션',
  '에스케이텔레콤': 'SK텔레콤',
  '에스케이바이오팜': 'SK바이오팜',
  '엘지에너지솔루션': 'LG에너지솔루션',
  '엘지화학': 'LG화학',
  '엘지전자': 'LG전자'
};
function shortName(desc, ticker) {
  if (!desc) return ticker || '';
  const name = desc.replace(/\s*(보통주|우선주|\d+우선주)$/u, '').trim() || ticker || desc;
  return NAME_ALIAS[name] || name;
}
function sectorLabel(name) { return SECTOR_KO[name] || name || '기타'; }
function dirOf(n) {
  if (n == null || !Number.isFinite(n) || n === 0) return 'flat';
  return n > 0 ? 'up' : 'down';
}
function formatNum(n, digits) {
  if (n == null || !Number.isFinite(n)) return '—';
  return n.toLocaleString('ko-KR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}
function formatPct(n) {
  if (n == null || !Number.isFinite(n)) return '—';
  return (n > 0 ? '+' : '') + n.toFixed(2) + '%';
}
function formatCap(n, currency) {
  if (n == null || !Number.isFinite(n)) return '—';
  if (currency === 'KRW') {
    const jo = n / 1e12;
    if (jo >= 1) return (jo >= 100 ? jo.toFixed(0) : jo.toFixed(1)) + '조';
    const eok = n / 1e8;
    if (eok >= 1) return (eok >= 100 ? eok.toFixed(0) : eok.toFixed(1)) + '억';
  }
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e12) return sign + (abs / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + 'M';
  return Math.round(n).toLocaleString('ko-KR');
}
function priceDigits(currency, price) {
  if (!Number.isFinite(price)) return 2;
  if (currency === 'KRW') return Math.abs(price) >= 1000 ? 0 : 2;
  return 2;
}
function seoulTime(ts) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).format(new Date(ts));
}
function chartHref(symbol) {
  if (symbol.startsWith('KRX:')) {
    const code = symbol.slice(4);
    if (/^\d{6}$/.test(code)) return 'https://finance.naver.com/item/main.naver?code=' + code;
  }
  return 'https://www.tradingview.com/chart/?symbol=' + encodeURIComponent(symbol);
}

function squarify(items, rect) {
  const children = items.filter(d => d.value > 0).slice().sort((a, b) => b.value - a.value);
  const out = [];
  if (!children.length || rect.w < 1 || rect.h < 1) return out;
  const total = children.reduce((sum, d) => sum + d.value, 0);
  if (!(total > 0)) return out;
  const areas = children.map(c => ({ c, area: c.value / total * rect.w * rect.h }));
  let x = rect.x, y = rect.y, w = rect.w, h = rect.h, i = 0, row = [];

  function worst(list, side) {
    if (!list.length || side <= 0) return Infinity;
    let sum = 0, min = Infinity, max = 0;
    for (const item of list) {
      sum += item.area;
      if (item.area < min) min = item.area;
      if (item.area > max) max = item.area;
    }
    const side2 = side * side;
    const sum2 = sum * sum;
    return Math.max((side2 * max) / sum2, sum2 / (side2 * min));
  }
  function place(list) {
    const side = Math.min(w, h);
    const sum = list.reduce((s, item) => s + item.area, 0);
    const thick = side > 0 ? sum / side : 0;
    let offset = 0;
    if (h < w) {
      for (const item of list) {
        const len = thick > 0 ? item.area / thick : 0;
        out.push(Object.assign({}, item.c, { x, y: y + offset, w: Math.max(0, thick), h: Math.max(0, len) }));
        offset += len;
      }
      x += thick;
      w = Math.max(0, w - thick);
    } else {
      for (const item of list) {
        const len = thick > 0 ? item.area / thick : 0;
        out.push(Object.assign({}, item.c, { x: x + offset, y, w: Math.max(0, len), h: Math.max(0, thick) }));
        offset += len;
      }
      y += thick;
      h = Math.max(0, h - thick);
    }
  }
  while (i < areas.length) {
    const side = Math.min(w, h);
    const next = row.concat([areas[i]]);
    if (!row.length || worst(row, side) >= worst(next, side)) {
      row.push(areas[i]);
      i += 1;
    } else {
      place(row);
      row = [];
    }
  }
  if (row.length) place(row);
  return out;
}

async function scan(market, payload) {
  let last;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const res = await fetch('https://scanner.tradingview.com/' + market + '/scan', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (err) {
      last = err;
      if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 600));
    }
  }
  throw last;
}

function toRow(entry) {
  const [ticker, description, close, change, cap, sector, currency, indexes] = entry.d;
  const symbol = entry.s;
  return {
    symbol,
    ticker: ticker || symbol.split(':').pop(),
    name: shortName(description, ticker),
    close: typeof close === 'number' ? close : null,
    change: typeof change === 'number' ? change : null,
    cap: typeof cap === 'number' ? cap : null,
    sector: sector || 'Miscellaneous',
    currency: currency || (symbol.startsWith('KRX:') ? 'KRW' : 'USD'),
    membership: (indexes || []).map(item => item && item.proname).filter(Boolean)
  };
}
function publish(row) {
  return {
    symbol: row.symbol,
    ticker: row.ticker,
    name: row.name,
    close: row.close,
    change: row.change,
    cap: row.cap,
    sector: row.sector,
    currency: row.currency
  };
}

async function loadQuotes(force) {
  if (!force && cache.quoteAt && Date.now() - cache.quoteAt < 60000) return;
  if (!force && inflight.quotes) return inflight.quotes;
  inflight.quotes = (async () => {
    const groups = new Map();
    QUOTES.forEach(quote => {
      if (!groups.has(quote.market)) groups.set(quote.market, []);
      groups.get(quote.market).push(quote);
    });
    await Promise.all(Array.from(groups.entries()).map(async ([market, list]) => {
      try {
        const body = await scan(market, {
          symbols: { tickers: list.map(item => item.symbol), query: { types: [] } },
          columns: ['name', 'close', 'change', 'description']
        });
        const found = new Map((body.data || []).map(row => [row.s, row]));
        list.forEach(item => {
          const row = found.get(item.symbol);
          if (row && typeof row.d[1] === 'number') {
            cache.quotes[item.key] = { close: row.d[1], change: typeof row.d[2] === 'number' ? row.d[2] : null };
          } else if (!cache.quotes[item.key] || cache.quotes[item.key].error) {
            cache.quotes[item.key] = { error: true };
          }
        });
        renderQuotes();
        renderFx();
      } catch (err) {
        list.forEach(item => {
          if (!cache.quotes[item.key] || cache.quotes[item.key].error) cache.quotes[item.key] = { error: true };
        });
        renderQuotes();
      }
    }));
    cache.quoteAt = Date.now();
    cache.quoteError = QUOTES.every(item => cache.quotes[item.key] && cache.quotes[item.key].error);
    renderQuotes();
    renderFx();
    renderAsof();
  })().finally(() => { inflight.quotes = null; });
  return inflight.quotes;
}

async function loadUS(force) {
  if (!force && cache.us && Date.now() - cache.usAt < 180000) return cache.us;
  if (!force && inflight.us) return inflight.us;
  inflight.us = (async () => {
    const body = await scan('america', {
      filter: STOCK_FILTER,
      columns: SCAN_COLS,
      sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
      options: { lang: 'ko' },
      range: [0, 1000]
    });
    const rows = (body.data || []).map(toRow).filter(row => row.cap > 0);
    cache.us = {
      spx: rows.filter(row => row.membership.includes('SP:SPX')).map(publish),
      top: rows.slice(0, TOP_US).map(publish)
    };
    cache.usError = '';
    cache.usAt = Date.now();
    return cache.us;
  })().catch(err => {
    cache.usError = String(err && err.message || err);
    if (!cache.us) throw err;
    return cache.us;
  }).finally(() => { inflight.us = null; });
  return inflight.us;
}

async function loadKR(force) {
  if (!force && cache.kr && Date.now() - cache.krAt < 180000) return cache.kr;
  if (!force && inflight.kr) return inflight.kr;
  inflight.kr = (async () => {
    const rows = [];
    let total = Infinity;
    for (let start = 0; start < total && start < 4000; start += 1000) {
      const body = await scan('korea', {
        filter: STOCK_FILTER,
        columns: SCAN_COLS,
        sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
        options: { lang: 'ko' },
        range: [start, start + 1000]
      });
      total = body.totalCount || 0;
      const page = body.data || [];
      rows.push(...page.map(toRow));
      if (page.length < 1000) break;
    }
    const usable = rows.filter(row => row.cap > 0);
    cache.kr = {
      kospi: usable.filter(row => row.membership.includes('KRX:KOSPI')).map(publish),
      kosdaq: usable.filter(row => row.membership.includes('KRX:KOSDAQ')).map(publish)
    };
    cache.krError = '';
    cache.krAt = Date.now();
    return cache.kr;
  })().catch(err => {
    cache.krError = String(err && err.message || err);
    if (!cache.kr) throw err;
    return cache.kr;
  }).finally(() => { inflight.kr = null; });
  return inflight.kr;
}

function activeRows() {
  if (state.universe === 'spx' || state.universe === 'us') {
    if (!cache.us) return null;
    return state.universe === 'spx' ? cache.us.spx : cache.us.top;
  }
  if (!cache.kr) return null;
  return state.universe === 'kosdaq' ? cache.kr.kosdaq : cache.kr.kospi;
}
function heatStatusText() {
  const korean = state.universe === 'kospi' || state.universe === 'kosdaq';
  const ready = korean ? cache.kr : cache.us;
  const error = korean ? cache.krError : cache.usError;
  if (!ready && !error) return '시세를 불러오는 중…';
  if (!ready && error) return '시세를 불러오지 못했습니다. 새로고침 해 주세요.';
  const rows = activeRows() || [];
  if (!rows.length) return '표시할 종목이 없습니다.';
  return '';
}
function sourceNote() {
  if (state.universe === 'us') return '미국 보통주 시가총액 상위 ' + TOP_US + '개입니다. 우선주와 중복 상장 클래스는 빠져 있습니다. 크기 = 시가총액, 색 = 등락률.';
  if (state.universe === 'spx') return '시가총액 상위 1,000개 주식 가운데 S&P 500 구성 종목입니다. 크기 = 시가총액, 색 = 등락률.';
  if (state.universe === 'kospi') return 'KOSPI 구성 보통주입니다. 우선주는 빠져 있습니다. 크기 = 시가총액, 색 = 등락률.';
  return 'KOSDAQ 구성 보통주입니다. 우선주는 빠져 있습니다. 크기 = 시가총액, 색 = 등락률.';
}
function metaText() {
  const rows = activeRows();
  const label = UNIVERSE_LABEL[state.universe];
  if (!rows) return label;
  if (state.universe === 'us') return '미국 시가총액 상위 ' + rows.length;
  return label + ' ' + rows.length + '종목';
}

function tileColor(change) {
  const light = state.theme === 'light';
  const base = light ? [236, 239, 244] : [24, 30, 41];
  const korean = state.color !== 'west';
  const up = korean ? [225, 45, 62] : [18, 158, 98];
  const down = korean ? [37, 99, 235] : [220, 58, 70];
  const mag = Math.min(Math.abs(change || 0) / 3, 1);
  const target = change > 0 ? up : change < 0 ? down : base;
  const t = !change ? 0 : 0.22 + mag * 0.78;
  const rgb = base.map((channel, index) => Math.round(channel + (target[index] - channel) * t));
  const lum = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
  return { bg: 'rgb(' + rgb.join(',') + ')', fg: lum > 0.64 ? '#172033' : '#f8fafc' };
}
function legendGradient() {
  const left = tileColor(state.color === 'west' ? 3 : -3).bg;
  const mid = tileColor(0).bg;
  const right = tileColor(state.color === 'west' ? -3 : 3).bg;
  if (state.color === 'west') return 'linear-gradient(90deg,' + tileColor(-3).bg + ',' + mid + ',' + tileColor(3).bg + ')';
  return 'linear-gradient(90deg,' + left + ',' + mid + ',' + right + ')';
}

function toolbarHtml() {
  const universes = ['spx', 'us', 'kospi', 'kosdaq'].map(key =>
    '<button type="button" data-universe="' + key + '"' + (state.universe === key ? ' class="on"' : '') + '>' + UNIVERSE_LABEL[key] + '</button>'
  ).join('');
  return '<div class="seg" role="group" aria-label="시장">' + universes + '</div>' +
    '<div class="seg" role="group" aria-label="색">' +
    '<button type="button" data-color="kr"' + (state.color === 'kr' ? ' class="on"' : '') + '>한국식</button>' +
    '<button type="button" data-color="west"' + (state.color === 'west' ? ' class="on"' : '') + '>서구식</button></div>' +
    '<div class="seg" role="group" aria-label="묶음">' +
    '<button type="button" data-group="sector"' + (state.group ? ' class="on"' : '') + '>섹터</button>' +
    '<button type="button" data-group="flat"' + (!state.group ? ' class="on"' : '') + '>전체</button></div>';
}

function syncChrome() {
  $$('[data-toolbar]').forEach(node => { node.innerHTML = toolbarHtml(); });
  $$('[data-meta]').forEach(node => { node.textContent = metaText(); });
  $$('[data-note]').forEach(node => {
    const onTv = !!(node.closest('.heat-page') && state.view === 'tv');
    node.textContent = onTv
      ? '트레이딩뷰 히트맵입니다. 타일 크기는 시가총액, 색은 등락률이며 제공사 색(상승 초록 · 하락 빨강)을 사용합니다.'
      : sourceNote() + ' 직접 그리는 맵이며 색은 위 설정과 같습니다.';
  });
  $$('[data-legend]').forEach(node => {
    node.innerHTML = '<span>-3%</span><i style="background:' + legendGradient() + '"></i><span>+3%</span><span>' +
      (state.color === 'kr' ? '상승 빨강 · 하락 파랑' : '상승 초록 · 하락 빨강') + '</span>';
  });
  $$('.heat-page').forEach(root => { root.dataset.view = state.view; });
  $$('button[data-view]').forEach(btn => btn.classList.toggle('on', btn.dataset.view === state.view));
  const themeBtn = $('#theme');
  themeBtn.textContent = state.theme === 'dark' ? '라이트' : '다크';
  themeBtn.setAttribute('aria-label', state.theme === 'dark' ? '라이트 모드' : '다크 모드');
  themeBtn.setAttribute('aria-pressed', state.theme === 'light' ? 'true' : 'false');
}

function layoutStocks(rows, width, height, top) {
  const gap = 1.5;
  const bounds = { x: 1, y: top + 1, w: Math.max(0, width - 2), h: Math.max(0, height - top - 2) };
  const stocks = rows.filter(row => row.cap > 0);
  if (!state.group || state.zoom) {
    const list = state.zoom ? stocks.filter(row => row.sector === state.zoom) : stocks;
    return {
      sectors: [],
      tiles: squarify(list.map(row => Object.assign({ value: row.cap }, row)), bounds).map(tile => inset(tile, gap))
    };
  }
  const groups = new Map();
  stocks.forEach(row => {
    if (!groups.has(row.sector)) groups.set(row.sector, []);
    groups.get(row.sector).push(row);
  });
  const sectors = Array.from(groups.entries()).map(([sector, list]) => ({
    sector,
    list,
    value: list.reduce((sum, row) => sum + row.cap, 0)
  }));
  const outer = squarify(sectors, bounds);
  const tiles = [];
  const labels = [];
  outer.forEach(group => {
    const padTop = group.h > 26 && group.w > 48 ? 16 : 0;
    if (padTop) {
      labels.push({ x: group.x + 2, y: group.y + 1, w: group.w - 4, sector: group.sector });
    }
    const inner = squarify(group.list.map(row => Object.assign({ value: row.cap }, row)), {
      x: group.x + 1,
      y: group.y + padTop,
      w: Math.max(0, group.w - 2),
      h: Math.max(0, group.h - padTop - 1)
    });
    inner.forEach(tile => tiles.push(inset(tile, gap)));
  });
  return { sectors: labels, tiles };
}
function inset(tile, gap) {
  return Object.assign({}, tile, {
    x: tile.x + gap / 2,
    y: tile.y + gap / 2,
    w: Math.max(0, tile.w - gap),
    h: Math.max(0, tile.h - gap)
  });
}

function paintHeat(root) {
  const stage = $('.treemap', root);
  const status = $('.heat-status', root);
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  root.dataset.w = String(width);
  root.dataset.h = String(height);
  const message = heatStatusText();
  status.hidden = !message;
  status.textContent = message;
  const zoom = $('[data-zoom]', root);
  const zoomName = $('[data-zoom-name]', root);
  if (state.zoom) {
    zoom.hidden = false;
    zoomName.textContent = sectorLabel(state.zoom);
  } else zoom.hidden = true;
  if (message && !(activeRows() && activeRows().length)) {
    stage.replaceChildren();
    return;
  }
  const laid = layoutStocks(activeRows() || [], width, height, state.zoom ? 34 : 0);
  const frag = document.createDocumentFragment();
  laid.sectors.forEach(label => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sector-label';
    btn.dataset.sector = label.sector;
    btn.style.left = label.x + 'px';
    btn.style.top = label.y + 'px';
    btn.style.maxWidth = label.w + 'px';
    btn.textContent = sectorLabel(label.sector);
    frag.appendChild(btn);
  });
  laid.tiles.forEach(tile => {
    if (tile.w < 1 || tile.h < 1) return;
    const color = tileColor(tile.change);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tile' + (tile.symbol === state.selected ? ' selected' : '');
    btn.dataset.symbol = tile.symbol;
    btn.style.left = tile.x + 'px';
    btn.style.top = tile.y + 'px';
    btn.style.width = tile.w + 'px';
    btn.style.height = tile.h + 'px';
    btn.style.background = color.bg;
    btn.style.color = color.fg;
    const title = tile.symbol.startsWith('KRX:') ? tile.name : tile.ticker;
    btn.setAttribute('aria-label', title + ' ' + formatPct(tile.change));
    if (tile.w >= 52 && tile.h >= 32) {
      const name = document.createElement('b');
      name.textContent = title;
      btn.appendChild(name);
    }
    if (tile.w >= 46 && tile.h >= 46) {
      const pct = document.createElement('em');
      pct.textContent = formatPct(tile.change);
      btn.appendChild(pct);
    }
    frag.appendChild(btn);
  });
  stage.replaceChildren(frag);
}

function renderHeats() {
  syncChrome();
  $$('[data-heat]').forEach(root => {
    const page = root.closest('.page');
    const visible = !page || page.classList.contains('on');
    if (!visible) {
      if (root.dataset.painted === '1') root.dataset.stale = '1';
      return;
    }
    const stage = $('.treemap', root);
    if (!stage || stage.clientWidth < 20) {
      root.dataset.stale = '1';
      return;
    }
    if (root.dataset.painting === '1') return;
    root.dataset.painting = '1';
    paintHeat(root);
    root.dataset.painted = '1';
    root.dataset.stale = '0';
    root.dataset.painting = '0';
  });
  renderRanks();
  if (state.view === 'tv' && $('#p-map').classList.contains('on')) mountHeatTV();
  updateDetails();
}

function findRow(symbol) {
  const pools = [];
  if (cache.us) pools.push(cache.us.spx, cache.us.top);
  if (cache.kr) pools.push(cache.kr.kospi, cache.kr.kosdaq);
  for (const pool of pools) {
    const found = pool.find(row => row.symbol === symbol);
    if (found) return found;
  }
  return null;
}
function updateDetails() {
  const row = state.selected ? findRow(state.selected) : null;
  $$('[data-detail]').forEach(node => {
    if (!row) {
      node.textContent = '타일을 누르면 시세가 표시됩니다.';
      return;
    }
    const digits = priceDigits(row.currency, row.close);
    node.innerHTML = '<b>' + esc(row.name) + '</b><span class="mut">' + esc(row.ticker) + ' · ' + esc(sectorLabel(row.sector)) +
      '</span><span>' + formatNum(row.close, digits) + '</span><span class="' + dirOf(row.change) + '">' + formatPct(row.change) +
      '</span><span>시총 ' + formatCap(row.cap, row.currency) + '</span><a href="' + esc(chartHref(row.symbol)) + '" target="_blank" rel="noopener">차트</a>';
  });
}

function sortedRows(rows) {
  const list = rows.slice();
  const dir = state.sortDir;
  list.sort((a, b) => {
    if (state.sort === 'name') return a.name.localeCompare(b.name, 'ko') * dir;
    if (state.sort === 'change') {
      const av = a.change == null ? -Infinity : a.change;
      const bv = b.change == null ? -Infinity : b.change;
      return (av - bv) * dir;
    }
    return ((a.cap || 0) - (b.cap || 0)) * dir;
  });
  return list;
}
function rankTable(rows, limit, withSort) {
  const shown = rows.slice(0, limit);
  const changeHead = withSort ? '<button type="button" data-sort="change"' + (state.sort === 'change' ? ' class="on"' : '') + '>등락률</button>' : '등락률';
  const capHead = withSort ? '<button type="button" data-sort="cap"' + (state.sort === 'cap' ? ' class="on"' : '') + '>시가총액</button>' : '시가총액';
  const head = '<thead><tr><th>순위</th><th class="name">종목</th><th>' + changeHead + '</th><th>현재가</th><th>' + capHead + '</th></tr></thead>';
  const body = shown.map((row, index) => {
    const digits = priceDigits(row.currency, row.close);
    return '<tr><td>' + (index + 1) + '</td><td class="name">' + esc(row.name) + '<small>' + esc(row.ticker) + ' · ' +
      esc(sectorLabel(row.sector)) + '</small></td><td class="' + dirOf(row.change) + '">' + formatPct(row.change) +
      '</td><td>' + formatNum(row.close, digits) + '</td><td>' + formatCap(row.cap, row.currency) + '</td></tr>';
  }).join('');
  return '<table>' + head + '<tbody>' + (body || '<tr><td colspan="5" class="empty">종목이 없습니다.</td></tr>') + '</tbody></table>';
}
function renderRanks() {
  const rows = activeRows();
  const home = $('#home-rank');
  const map = $('#map-rank');
  if (!rows) {
    home.innerHTML = '<p class="empty">순위를 불러오는 중…</p>';
    if (map) map.innerHTML = '<p class="empty">순위를 불러오는 중…</p>';
    return;
  }
  const byCap = rows.slice().sort((a, b) => (b.cap || 0) - (a.cap || 0));
  const ordered = sortedRows(rows);
  const q = state.query.trim().toLowerCase();
  const filtered = q ? ordered.filter(row => (row.name + ' ' + row.ticker + ' ' + row.symbol).toLowerCase().includes(q)) : ordered;
  home.innerHTML = rankTable(byCap, 12, false);
  if (map) {
    map.innerHTML = rankTable(filtered, state.rankShown, true) +
      '<p class="fine">' + filtered.length + '개 중 ' + Math.min(state.rankShown, filtered.length) + '개 표시</p>';
  }
  const more = $('#rank-more');
  if (more) more.hidden = !filtered || filtered.length <= state.rankShown;
}

function renderQuotes() {
  const root = $('#quotes');
  root.innerHTML = QUOTES.map(item => {
    const data = cache.quotes[item.key];
    if (!data) {
      return '<button type="button" class="qcard wait" data-chart="' + esc(item.chart) + '"><div class="ql"><span>' +
        esc(item.label) + '</span><span>' + esc(item.sub) + '</span></div><div class="skel" style="margin-top:12px"></div><div class="qs">불러오는 중</div></button>';
    }
    if (data.error) {
      return '<button type="button" class="qcard err" data-chart="' + esc(item.chart) + '"><div class="ql"><span>' +
        esc(item.label) + '</span><span>' + esc(item.sub) + '</span></div><div class="qp">—</div><div class="qs">시세를 불러오지 못했습니다</div></button>';
    }
    const cls = dirOf(data.change);
    const arrow = data.change > 0 ? '▲ ' : data.change < 0 ? '▼ ' : '';
    const price = (item.prefix || '') + formatNum(data.close, item.digits) + (item.suffix || '');
    return '<button type="button" class="qcard ' + cls + '" data-chart="' + esc(item.chart) + '"><div class="ql"><span>' +
      esc(item.label) + '</span><span>' + esc(item.sub) + '</span></div><div class="qp">' + price +
      '</div><div class="qc ' + cls + '">' + arrow + formatPct(data.change) + '</div></button>';
  }).join('');
}
function renderAsof() {
  const bits = [];
  if (cache.quoteAt) bits.push('지수 ' + seoulTime(cache.quoteAt));
  const mapAt = (state.universe === 'kospi' || state.universe === 'kosdaq') ? cache.krAt : cache.usAt;
  if (mapAt) bits.push('맵 ' + seoulTime(mapAt));
  $('#asof').textContent = bits.length ? bits.join(' · ') + ' 갱신' : '시세를 불러오는 중';
}

function mountTV(id, widget, config) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'tradingview-widget-container';
  wrap.style.height = '100%';
  const inner = document.createElement('div');
  inner.className = 'tradingview-widget-container__widget';
  inner.style.height = '100%';
  wrap.appendChild(inner);
  const script = document.createElement('script');
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-' + widget + '.js';
  script.async = true;
  script.textContent = JSON.stringify(Object.assign({
    colorTheme: state.theme === 'light' ? 'light' : 'dark',
    isTransparent: true,
    locale: 'kr'
  }, config));
  wrap.appendChild(script);
  el.appendChild(wrap);
}
function themeChart() {
  return state.theme === 'light'
    ? { backgroundColor: '#ffffff', gridColor: 'rgba(15,23,42,0.06)' }
    : { backgroundColor: '#141b26', gridColor: 'rgba(255,255,255,0.06)' };
}

function mountHomeWidgets() {
  if (inited.homeWidgets) return;
  inited.homeWidgets = true;
  const now = Date.now();
  $('#kr-idx').innerHTML = [
    ['KOSPI', 'KOSPI'],
    ['KOSDAQ', 'KOSDAQ']
  ].map(([code, name]) => '<a href="https://finance.naver.com/sise/sise_index.naver?code=' + code + '" target="_blank" rel="noopener">' +
    name + ' <small>' + code + '</small><img alt="' + name + ' 차트" src="https://ssl.pstatic.net/imgfinance/chart/main/' + code + '.png?t=' + now + '"></a>').join('');
  const line = (title, symbol) => ({ s: symbol, d: title });
  mountTV('w-mo', 'market-overview', {
    dateRange: '1M', showChart: true, width: '100%', height: 460, showSymbolLogo: true,
    plotLineColorGrowing: '#ff4b5c', belowLineFillColorGrowing: 'rgba(255,75,92,0.12)',
    tabs: [
      { title: '미국', symbols: [line('S&P 500', 'FOREXCOM:SPXUSD'), line('나스닥 100', 'FOREXCOM:NSXUSD'), line('다우', 'FOREXCOM:DJI'), line('필라델피아 반도체', 'NASDAQ:SOX')] },
      { title: '아시아·유럽', symbols: [line('KOSPI', 'KRX:KOSPI'), line('니케이225', 'TVC:NI225'), line('항셍', 'TVC:HSI'), line('독일 DAX', 'XETR:DAX')] }
    ]
  });
  mountTV('w-fx', 'forex-cross-rates', { width: '100%', height: 360, currencies: ['KRW', 'USD', 'EUR', 'JPY', 'CNY', 'GBP'] });
  mountTV('w-cmd', 'market-quotes', {
    width: '100%', height: 360,
    symbolsGroups: [
      { name: '원자재', symbols: [{ name: 'TVC:GOLD', displayName: '금' }, { name: 'TVC:SILVER', displayName: '은' }, { name: 'TVC:USOIL', displayName: 'WTI' }, { name: 'TVC:UKOIL', displayName: '브렌트' }] },
      { name: '코인', symbols: [{ name: 'BITSTAMP:BTCUSD', displayName: '비트코인' }, { name: 'BITSTAMP:ETHUSD', displayName: '이더리움' }] }
    ]
  });
}
function mountTape() {
  mountTV('tape', 'ticker-tape', {
    symbols: [
      { proName: 'FOREXCOM:SPXUSD', title: 'S&P500' },
      { proName: 'FOREXCOM:NSXUSD', title: '나스닥100' },
      { proName: 'FOREXCOM:DJI', title: '다우' },
      { proName: 'FX_IDC:USDKRW', title: '원/달러' },
      { proName: 'TVC:GOLD', title: '금' },
      { proName: 'TVC:USOIL', title: 'WTI' },
      { proName: 'BITSTAMP:BTCUSD', title: '비트코인' },
      { proName: 'NASDAQ:NVDA', title: '엔비디아' }
    ],
    showSymbolLogo: true,
    displayMode: 'adaptive'
  });
}
function mountHeatTV() {
  const key = state.universe + '|' + state.theme;
  if (tvHeatKey === key && $('#tv-heat').childElementCount) return;
  tvHeatKey = key;
  const box = $('#tv-heat');
  box.style.height = Math.max(520, window.innerHeight - 230) + 'px';
  mountTV('tv-heat', 'stock-heatmap', {
    exchanges: [],
    dataSource: TV_SOURCE[state.universe] || 'SPX500',
    grouping: 'sector',
    blockSize: 'market_cap_basic',
    blockColor: 'change',
    hasTopBar: false,
    isDataSetEnabled: false,
    isZoomEnabled: true,
    hasSymbolTooltip: true,
    width: '100%',
    height: '100%'
  });
}
function mountChart(symbol) {
  chartSymbol = symbol || chartSymbol;
  $$('#cchips .chip').forEach(btn => btn.classList.toggle('on', btn.dataset.s === chartSymbol));
  const colors = themeChart();
  mountTV('w-adv', 'advanced-chart', Object.assign({
    symbol: chartSymbol,
    interval: 'D',
    timezone: 'Asia/Seoul',
    style: '1',
    width: '100%',
    height: Math.max(480, window.innerHeight - 230),
    allow_symbol_change: true,
    withdateranges: true,
    hide_side_toolbar: window.innerWidth < 900,
    studies: ['STD;MA%Ribbon']
  }, colors));
}

function getWL() {
  try {
    const saved = JSON.parse(localStorage.getItem(WL_KEY) || 'null');
    if (Array.isArray(saved)) return saved.filter(item => typeof item === 'string' && item);
  } catch (e) { /* ignore */ }
  return DEFAULT_WL.slice();
}
function setWL(list) {
  localStorage.setItem(WL_KEY, JSON.stringify(list));
  renderWL();
}
function renderWL() {
  const list = getWL();
  const root = $('#wl');
  if (!root) return;
  if (!list.length) {
    root.innerHTML = '<p class="empty">관심종목을 추가해 보세요.</p>';
    return;
  }
  root.innerHTML = list.map((symbol, index) => '<article class="wl-item"><button type="button" class="x" data-remove="' + index + '" aria-label="삭제">✕</button><div id="wl' + index + '"></div></article>').join('');
  list.forEach((symbol, index) => {
    if (symbol.startsWith('KRX:') && /^\d{6}$/.test(symbol.slice(4))) {
      const code = symbol.slice(4);
      const name = KRX_NAMES[code] || code;
      $('#wl' + index).innerHTML = '<a class="kr-link" href="https://finance.naver.com/item/main.naver?code=' + code + '" target="_blank" rel="noopener"><b>' +
        esc(name) + '</b> <small class="mut">' + code + '</small><img alt="" src="https://ssl.pstatic.net/imgfinance/chart/item/area/month3/' + code + '.png?t=' + Date.now() + '"></a>';
    } else {
      mountTV('wl' + index, 'mini-symbol-overview', {
        symbol,
        width: '100%',
        height: 180,
        dateRange: '1M',
        trendLineColor: '#e7c36a',
        underLineColor: 'rgba(231,195,106,0.15)'
      });
    }
  });
  $$('#sugg .chip').forEach(btn => {
    const has = list.includes(btn.dataset.s);
    btn.classList.toggle('on', has);
    btn.textContent = (has ? '✓ ' : '+ ') + btn.dataset.n;
  });
}
function initWL() {
  $('#sugg').innerHTML = SUGGEST.map(([name, symbol]) => '<button type="button" class="chip" data-s="' + symbol + '" data-n="' + esc(name) + '">+ ' + esc(name) + '</button>').join('');
  renderWL();
}

function num(form, name) {
  const value = parseFloat(form.elements[name].value);
  return Number.isFinite(value) ? value : NaN;
}
function renderReturn() {
  const form = $('#calc-return');
  const out = $('#return-out');
  const buy = num(form, 'buy');
  const sell = num(form, 'sell');
  const qty = num(form, 'qty');
  const cost = num(form, 'cost');
  if (!(buy > 0) || !(sell >= 0) || !(qty > 0)) {
    out.innerHTML = '<span class="mut">값을 입력하면 계산됩니다.</span>';
    return;
  }
  const fee = Number.isFinite(cost) && cost > 0 ? cost : 0;
  const profit = (sell - buy) * qty - fee;
  const base = buy * qty;
  const pct = base > 0 ? profit / base * 100 : null;
  const digits = Math.abs(profit) >= 1000 ? 0 : 2;
  out.innerHTML = '<span class="mut">손익</span><b class="' + dirOf(profit) + '">' + formatNum(profit, digits) + '</b><span>수익률 <b class="' +
    dirOf(pct) + '">' + formatPct(pct) + '</b> · 매수금액 ' + formatNum(base, Math.abs(base) >= 1000 ? 0 : 2) + '</span>';
}
function renderAvg() {
  const form = $('#calc-avg');
  const out = $('#avg-out');
  const q1 = num(form, 'q1');
  const p1 = num(form, 'p1');
  const q2 = num(form, 'q2');
  const p2 = num(form, 'p2');
  if (!(q1 > 0) || !(p1 > 0) || !(q2 > 0) || !(p2 > 0)) {
    out.innerHTML = '<span class="mut">보유분과 추가분을 입력하세요.</span>';
    return;
  }
  const qty = q1 + q2;
  const total = q1 * p1 + q2 * p2;
  const avgDigits = total / qty >= 1000 ? 0 : 2;
  out.innerHTML = '<span class="mut">새 평단</span><b>' + formatNum(total / qty, avgDigits) + '</b><span>수량 ' + formatNum(qty, 2) + ' · 총액 ' + formatNum(total, total >= 1000 ? 0 : 2) + '</span>';
}
function fxRate() {
  if (fxManual) {
    const typed = parseFloat($('#calc-fx').elements.rate.value);
    return Number.isFinite(typed) && typed > 0 ? { rate: typed, source: '직접 입력' } : null;
  }
  const live = cache.quotes.usdkrw;
  if (live && !live.error && live.close > 0) return { rate: live.close, source: 'TradingView FX_IDC · ' + (cache.quoteAt ? seoulTime(cache.quoteAt) : '') };
  if (cache.ecb && cache.ecb.rate > 0) return { rate: cache.ecb.rate, source: 'ECB ' + cache.ecb.date + ' (Frankfurter)' };
  return null;
}
function renderFx() {
  const info = fxRate();
  const src = $('#fx-src');
  const out = $('#fx-out');
  const input = $('#calc-fx').elements.rate;
  if (!fxManual && info) input.value = String(Math.round(info.rate * 100) / 100);
  if (!info) {
    src.textContent = cache.quoteAt ? '환율을 불러오지 못했습니다. 환율을 직접 입력하면 그 값으로 계산합니다.' : '환율을 불러오는 중';
    out.innerHTML = '<span class="mut">환율이 없으면 숫자를 보여 주지 않습니다.</span>';
    return;
  }
  src.textContent = '기준 환율 ' + formatNum(info.rate, 2) + ' · ' + info.source;
  const amount = num($('#calc-fx'), 'amount');
  if (!(amount >= 0) || $('#calc-fx').elements.amount.value === '') {
    out.innerHTML = '<span class="mut">금액을 입력하세요.</span>';
    return;
  }
  const value = fxDir === 'usdkrw' ? amount * info.rate : amount / info.rate;
  const unit = fxDir === 'usdkrw' ? '원' : '달러';
  out.innerHTML = '<span class="mut">환산</span><b>' + formatNum(value, fxDir === 'usdkrw' ? 0 : 2) + ' ' + unit + '</b>';
}
async function loadEcb() {
  try {
    const res = await fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=KRW');
    if (!res.ok) return;
    const body = await res.json();
    if (body && body.rates && typeof body.rates.KRW === 'number') {
      cache.ecb = { rate: body.rates.KRW, date: body.date || '' };
      renderFx();
    }
  } catch (e) { /* optional reference rate */ }
}

function show(tab, push) {
  if (tab === 'more') { $('#sheet').hidden = false; return; }
  if (!document.getElementById('p-' + tab)) return;
  $('#sheet').hidden = true;
  $$('.page').forEach(page => page.classList.toggle('on', page.id === 'p-' + tab));
  const moreOn = tab === 'cal' || tab === 'wl' || tab === 'calc';
  $$('[data-go]').forEach(btn => btn.classList.toggle('on', btn.dataset.go === tab || (moreOn && btn.dataset.go === 'more')));
  if (push !== false && location.hash !== '#' + tab) history.replaceState(null, '', '#' + tab);
  if (!inited[tab]) {
    inited[tab] = true;
    if (tab === 'home') mountHomeWidgets();
    if (tab === 'chart') {
      $('#cchips').innerHTML = CHARTS.map(([name, symbol]) => '<button type="button" class="chip" data-s="' + symbol + '">' + esc(name) + '</button>').join('');
      mountChart(chartSymbol);
    }
    if (tab === 'cal') {
      mountTV('w-cal', 'events', { width: '100%', height: 640, importanceFilter: '0,1', countryFilter: 'us,kr,cn,jp' });
      mountTV('w-ta', 'technical-analysis', { interval: '1D', width: '100%', height: 450, symbol: 'NASDAQ:NVDA', showIntervalTabs: true });
    }
    if (tab === 'news') {
      mountTV('w-news', 'timeline', { feedMode: 'market', market: 'stock', width: '100%', height: 640, displayMode: 'regular' });
      mountTV('w-news2', 'timeline', { feedMode: 'symbol', symbol: 'NASDAQ:NVDA', width: '100%', height: 640, displayMode: 'regular' });
    }
    if (tab === 'wl') initWL();
  }
  if (tab === 'map' && state.view === 'tv') mountHeatTV();
  renderHeats();
  window.scrollTo(0, 0);
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  savePref('hbj-theme', theme);
  $('#theme-color').setAttribute('content', theme === 'light' ? '#e7edf5' : '#080b10');
  syncChrome();
  tvHeatKey = '';
  inited.homeWidgets = false;
  if ($('#p-home').classList.contains('on')) mountHomeWidgets();
  if (inited.chart) mountChart(chartSymbol);
  if (inited.cal) {
    inited.cal = false;
    if ($('#p-cal').classList.contains('on')) { inited.cal = true; mountTV('w-cal', 'events', { width: '100%', height: 640, importanceFilter: '0,1', countryFilter: 'us,kr,cn,jp' }); mountTV('w-ta', 'technical-analysis', { interval: '1D', width: '100%', height: 450, symbol: 'NASDAQ:NVDA', showIntervalTabs: true }); }
  }
  if (inited.news) {
    inited.news = false;
    if ($('#p-news').classList.contains('on')) show('news', false);
  }
  if (inited.wl && $('#p-wl').classList.contains('on')) renderWL();
  mountTape();
  renderHeats();
}

function openChart(symbol) {
  chartSymbol = symbol;
  if (!inited.chart) show('chart');
  else { show('chart'); mountChart(symbol); }
}

async function refreshAll(force) {
  const btn = $('#refresh');
  btn.setAttribute('aria-busy', 'true');
  btn.textContent = '갱신 중';
  await Promise.allSettled([loadQuotes(force), loadUS(force), loadKR(force)]);
  renderHeats();
  renderAsof();
  btn.removeAttribute('aria-busy');
  btn.textContent = '새로고침';
}

function tickClock() {
  $('#clock').textContent = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).format(new Date());
}

function bind() {
  document.body.addEventListener('click', event => {
    const go = event.target.closest('[data-go]');
    if (go) { show(go.dataset.go); return; }
    const universe = event.target.closest('[data-universe]');
    if (universe) {
      state.universe = universe.dataset.universe;
      state.zoom = '';
      state.rankShown = 100;
      savePref('hbj-universe', state.universe);
      tvHeatKey = '';
      renderHeats();
      return;
    }
    const color = event.target.closest('[data-color]');
    if (color) {
      state.color = color.dataset.color;
      savePref('hbj-color', state.color);
      renderHeats();
      return;
    }
    const group = event.target.closest('[data-group]');
    if (group) {
      state.group = group.dataset.group === 'sector';
      if (!state.group) state.zoom = '';
      savePref('hbj-group', state.group ? 'sector' : 'flat');
      renderHeats();
      return;
    }
    const view = event.target.closest('button[data-view]');
    if (view && view.dataset.view) {
      state.view = view.dataset.view;
      savePref('hbj-view', state.view);
      renderHeats();
      return;
    }
    if (event.target.closest('[data-zoom-out]')) {
      state.zoom = '';
      renderHeats();
      return;
    }
    const sector = event.target.closest('[data-sector]');
    if (sector) {
      state.zoom = sector.dataset.sector;
      renderHeats();
      return;
    }
    const tile = event.target.closest('.tile');
    if (tile) {
      state.selected = tile.dataset.symbol;
      $$('.tile').forEach(node => node.classList.toggle('selected', node.dataset.symbol === state.selected));
      updateDetails();
      return;
    }
    const chartBtn = event.target.closest('[data-chart]');
    if (chartBtn) { openChart(chartBtn.dataset.chart); return; }
    const sort = event.target.closest('[data-sort]');
    if (sort) {
      if (state.sort === sort.dataset.sort) state.sortDir *= -1;
      else { state.sort = sort.dataset.sort; state.sortDir = -1; }
      renderRanks();
      return;
    }
    const chip = event.target.closest('#cchips .chip');
    if (chip) { mountChart(chip.dataset.s); return; }
    const addChip = event.target.closest('#sugg .chip');
    if (addChip) {
      const list = getWL();
      if (!list.includes(addChip.dataset.s)) setWL(list.concat(addChip.dataset.s));
      else setWL(list.filter(item => item !== addChip.dataset.s));
      return;
    }
    const remove = event.target.closest('[data-remove]');
    if (remove) {
      const list = getWL();
      list.splice(Number(remove.dataset.remove), 1);
      setWL(list);
    }
  });

  $('#refresh').addEventListener('click', () => refreshAll(true));
  $('#theme').addEventListener('click', () => applyTheme(state.theme === 'dark' ? 'light' : 'dark'));
  $('#sheet').addEventListener('click', event => { if (event.target.id === 'sheet') $('#sheet').hidden = true; });
  $('#sheet-close').addEventListener('click', () => { $('#sheet').hidden = true; });
  $('#open-rank').addEventListener('click', () => { state.view = 'rank'; savePref('hbj-view', 'rank'); show('map'); });
  $('#rank-more').addEventListener('click', () => { state.rankShown += 100; renderRanks(); });
  $('#rank-q').addEventListener('input', () => { state.query = $('#rank-q').value; state.rankShown = 100; renderRanks(); });
  $('#addb').addEventListener('click', () => {
    const raw = $('#sym').value.trim().toUpperCase();
    const err = $('#sym-err');
    let symbol = raw;
    if (/^\d{6}$/.test(raw)) symbol = 'KRX:' + raw;
    if (!symbol || !symbol.includes(':')) {
      err.hidden = false;
      err.textContent = '거래소:종목 형식으로 입력해 주세요. 예: NASDAQ:AAPL';
      return;
    }
    err.hidden = true;
    const list = getWL();
    if (!list.includes(symbol)) setWL(list.concat(symbol));
    $('#sym').value = '';
  });
  $('#calc-return').addEventListener('input', renderReturn);
  $('#calc-avg').addEventListener('input', renderAvg);
  $('#calc-fx').addEventListener('input', event => {
    if (event.target.name === 'rate') fxManual = event.target.value.trim() !== '';
    renderFx();
  });
  $('#calc-fx').addEventListener('click', event => {
    const dir = event.target.closest('[data-dir]');
    if (!dir) return;
    fxDir = dir.dataset.dir;
    $$('#calc-fx [data-dir]').forEach(btn => btn.classList.toggle('on', btn === dir));
    renderFx();
  });
  $('#calc-return').addEventListener('submit', event => event.preventDefault());
  $('#calc-avg').addEventListener('submit', event => event.preventDefault());
  $('#calc-fx').addEventListener('submit', event => event.preventDefault());

  $$('[data-heat] .heat-stage').forEach(stage => {
    const root = stage.closest('[data-heat]');
    const observer = new ResizeObserver(() => {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (width < 20) return;
      if (root.dataset.stale === '1' || root.dataset.painted !== '1' || root.dataset.w !== String(width) || root.dataset.h !== String(height)) {
        renderHeats();
      }
    });
    observer.observe(stage);
  });

  window.addEventListener('hashchange', () => {
    const tab = location.hash.slice(1);
    if (document.getElementById('p-' + tab)) show(tab, false);
  });
}

function boot() {
  document.documentElement.dataset.theme = state.theme;
  $('#theme-color').setAttribute('content', state.theme === 'light' ? '#e7edf5' : '#080b10');
  bind();
  tickClock();
  setInterval(tickClock, 30000);
  renderQuotes();
  syncChrome();
  mountTape();
  const start = (location.hash.slice(1) && document.getElementById('p-' + location.hash.slice(1))) ? location.hash.slice(1) : 'home';
  show(start, false);
  refreshAll(false);
  loadEcb();
  setInterval(() => { if (document.visibilityState === 'visible') refreshAll(false); }, 180000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && cache.quoteAt && Date.now() - cache.quoteAt > 60000) refreshAll(false);
  });

  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    $('#install').style.display = 'inline-flex';
  });
  $('#install').addEventListener('click', () => { if (deferredPrompt) deferredPrompt.prompt(); });

  if ('serviceWorker' in navigator) {
    const had = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!had || reloaded) return;
      reloaded = true;
      location.reload();
    });
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

boot();
