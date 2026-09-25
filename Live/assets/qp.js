/* Q-Profit · Finance Executive Dashboard — shared runtime.
   Shell (rail, top bar, breadcrumb), slicers, matrix tables, tooltips and a
   small SVG chart kit. Pages register with QP.define(); the router maps
   /user/<user>/<dashboard> onto a user from QP.PERSONAS and a page from QP.PAGES. */
(function(){
'use strict';
var QP = window.QP = {};
var SAR = '⃁';

/* ── icons (24px grid, 2px stroke) ─────────────────────────────────────── */
var I = {
  consolidated:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  development:'<path d="M3 3v18h18"/><path d="M8 17v-5"/><path d="M13 17V8"/><path d="M18 17v-9"/>',
  'business-units':'<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5v4.5M12 12l-5.5 5M12 12l5.5 5"/>',
  corporate:'<rect x="2.5" y="7" width="19" height="13" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M2.5 13h19"/>',
  'corporate-division':'<circle cx="9" cy="12" r="6"/><circle cx="15" cy="12" r="6"/>',
  'city-operations':'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  'operating-assets':'<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
  moon:'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  expand:'<path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  chevd:'<path d="m6 9 6 6 6-6"/>', chevr:'<path d="m9 6 6 6-6 6"/>', chevl:'<path d="m15 6-6 6 6 6"/>',
  arrowr:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  cal:'<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  reset:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 16v-4.5M12 8h.01"/>',
  nomatch:'<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/><path d="m8.6 8.6 4.8 4.8M13.4 8.6l-4.8 4.8"/>',
  lock:'<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
  check:'<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>',
  bars:'<path d="M4 20V13M9 20V9M14 20v-5M19 20V5"/>',
  up:'<path d="M12 5 4 16h16z" fill="currentColor" stroke="none"/>', down:'<path d="M12 19 4 8h16z" fill="currentColor" stroke="none"/>',
  flat:'<rect x="4" y="10.5" width="16" height="3" rx="1.5" fill="currentColor" stroke="none"/>',
  flag:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>'
};
function icon(n, cls){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'+(cls?' class="'+cls+'"':'')+'>'+(I[n]||'')+'</svg>'; }
QP.icon = icon;

/* ── registry: dashboards and users ─────────────────────────────────── */
/* A dashboard's key is its URL segment: /user/<user>/<key>; area picks its identity colour (the Area Summaries headers) */
QP.PAGES = {
  'consolidated':      {label:'Consolidated',        area:null},
  'development':       {label:'Development',         area:'dev'},
  'business-units':    {label:'Business Units',      area:'dev'},
  'corporate':         {label:'Corporate',           area:'corp'},
  'corporate-division':{label:'Corporate Divisions', area:'corp'},
  'city-operations':   {label:'City Operations',     area:'city'},
  'operating-assets':  {label:'Operating Assets',    area:'oa'}
};
QP.ORDER = ['consolidated','development','business-units','corporate','corporate-division','city-operations','operating-assets'];
var ALL = QP.ORDER.slice();
/* A user's key is their URL segment: /user/<key>. Adding a user here gives
   them a workspace, a directory entry and a live URL for each of their pages;
   pages lists their dashboards in order (the first is their home), lock fixes
   filters to their scope. */
QP.PERSONAS = {
  imran:   {name:'Imran Afzal', role:'Board of Director',          ini:'IA', pages:ALL, status:'refreshed 8 Sep, 06:00', scope:'Company-wide — every area, read-only'},
  hala:    {name:'Hala',        role:'Finance Manager',            ini:'HA', pages:ALL, status:'refreshed 8 Sep, 06:00', scope:'Company-wide, with drill-down into every area’s detail', context:true},
  mohammed:{name:'Mohammed',    role:'Business Unit Manager',      ini:'MO', pages:['business-units'], status:'as at 30 Apr 2026', scope:'Own business unit only — Entertainment', lock:{bu:'Entertainment'}},
  yousef:  {name:'Yousef',      role:'Corporate Division Manager', ini:'YO', pages:['corporate-division'], status:'as at 30 Apr 2026', scope:'Own corporate division only — Qiddiya Technology', lock:{division:'Qiddiya Technology'}},
  reem:    {name:'Reem',        role:'Operating Asset Lead',       ini:'RE', pages:['operating-assets'], status:'as at 30 Apr 2026', scope:'Operating Assets'},
  nasser:  {name:'Nasser',      role:'City Operations Lead',       ini:'NA', pages:['city-operations'], status:'as at 30 Apr 2026', scope:'City Operations only'},
  sara:    {name:'Sara',        role:'Corporate Auditor',          ini:'SA', pages:['corporate','corporate-division'], status:'as at 30 Apr 2026', scope:'Corporate and Corporate Divisions'}
};
QP.USERS = Object.keys(QP.PERSONAS);
QP.USERS.forEach(function(k){ QP.PERSONAS[k].slug = k; });
/* 'path': served through the host's rewrites (/user/<user>/<dashboard>).
   'hash': opened from the folder or any plain static server (app.html#/user/…).
   Each page's head sets QP_MODE and a <base>, so asset paths stay relative. */
QP.MODE = window.QP_MODE === 'hash' ? 'hash' : 'path';
QP.ASSETS = 'assets/';
QP.HOME = QP.MODE === 'path' ? '/' : 'index.html';
QP.can = function(p){ return QP.persona.pages.indexOf(p) >= 0; };
QP.route = function(page, user){ return '/user/' + (user || QP.persona.slug) + (page ? '/' + page : ''); };
QP.url = function(page, user){ return (QP.MODE === 'hash' ? 'app.html#' : '') + QP.route(page, user); };
QP.href = function(p){ return QP.url(p); };
QP.current = function(){ return QP.MODE === 'hash' ? decodeURI(location.hash.slice(1)) : location.pathname; };

/* ── formatting ────────────────────────────────────────────────────────── */
function n(v, dp){
  if (v === null || v === undefined || v === '') return '—';
  dp = dp == null ? 1 : dp;
  var s = Math.abs(v).toLocaleString('en-US',{minimumFractionDigits:dp,maximumFractionDigits:dp});
  return (v < 0 ? '−' : '') + s;
}
var F = QP.f = {
  n:n,
  i:function(v){ return n(v,0); },
  m:function(v, dp){ return v == null ? '—' : (v < 0 ? '−' : '') + '<span class="sar">'+SAR+'</span>' + n(Math.abs(v), dp); },
  sar:'<span class="sar">'+SAR+'</span>',
  SAR:SAR,
  pct:function(v, dp){ return n(v, dp == null ? 1 : dp) + '%'; },
  signed:function(v, dp, unit){ if (v == null) return '—'; if (Math.abs(v) < 1e-9) return n(0,dp)+(unit||''); return (v > 0 ? '+' : '−') + n(Math.abs(v), dp) + (unit||''); },
  varPct:function(a, b){ return b ? (a - b) / Math.abs(b) * 100 : 0; }
};

/* variance chip: arrow = direction, colour = favourability */
QP.chip = function(v, o){
  o = o || {};
  var dp = o.dp == null ? 1 : o.dp, unit = o.unit == null ? '%' : o.unit;
  var r = Math.round(v * Math.pow(10,dp)) / Math.pow(10,dp);
  var dir = r > 0 ? 'up' : r < 0 ? 'down' : 'flat';
  var good = o.good || 'up';
  var cls = dir === 'flat' || good === 'none' ? 'neu' : ((dir === 'up') === (good === 'up') ? 'pos' : 'neg');
  if (o.cls) cls = o.cls;
  var txt = o.signed === false ? n(Math.abs(r), dp) + unit : F.signed(r, dp, unit);
  return '<span class="qp-chip '+cls+'">'+icon(dir)+txt+(o.suffix ? ' '+o.suffix : '')+'</span>';
};
QP.tone = function(v, good){ var r = Math.round(v*10)/10; if (!r || good === 'none') return 'neu'; return (r > 0) === ((good||'up') === 'up') ? 'pos' : 'neg'; };
QP.pill = function(txt, tone){ return '<span class="qp-pill '+(tone||'neu')+'"><i></i>'+txt+'</span>'; };
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
QP.esc = esc;

/* ── dates & periods ───────────────────────────────────────────────────── */
var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var MONL = ['January','February','March','April','May','June','July','August','September','October','November','December'];
QP.MON = MON; QP.MONL = MONL;
function pad(x){ return (x < 10 ? '0' : '') + x; }
QP.iso = function(y, m, d){ return y + '-' + pad(m) + '-' + pad(d); };
QP.lastDay = function(y, m){ return new Date(y, m, 0).getDate(); };
QP.dmy = function(iso){ var p = iso.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; };
/* month + basis -> From / To, the way a Power BI "Between" date slicer reads */
QP.periodRange = function(y, m, basis){ return { from: QP.iso(y, basis === 'ytd' ? 1 : m, 1), to: QP.iso(y, m, QP.lastDay(y, m)) }; };
QP.mlabel = function(y, m){ return MON[m-1] + '-' + String(y).slice(2); };

/* ── deterministic series helpers (for derived views) ──────────────────── */
QP.rng = function(seed){ var s = seed % 2147483647; if (s <= 0) s += 2147483646; return function(){ s = s * 16807 % 2147483647; return (s - 1) / 2147483646; }; };
QP.round = function(v, dp){ var p = Math.pow(10, dp == null ? 1 : dp); return Math.round(v * p) / p; };

/* ── components ────────────────────────────────────────────────────────── */
QP.seg = function(k, value, opts, cls){
  return '<div class="qp-seg '+(cls||'')+'" role="tablist">' + opts.map(function(o){
    if (typeof o === 'string') o = {v:o, l:o};
    return '<button role="tab" data-k="'+k+'" data-v="'+esc(o.v)+'" class="'+(String(o.v) === String(value) ? 'on' : '')+'" aria-selected="'+(String(o.v) === String(value))+'"'+(o.dis ? ' disabled data-tip="'+esc(o.dis)+'"' : '')+'>'+o.l+'</button>';
  }).join('') + '</div>';
};
QP.dd = function(k, label, value, opts, o){
  o = o || {};
  var cur = opts.filter(function(x){ return (typeof x === 'string' ? x : x.v) == value; })[0];
  var curL = cur ? (typeof cur === 'string' ? cur : cur.l) : value;
  if (o.locked) {
    return '<div class="qp-dd locked" data-tip="'+esc(o.locked)+'"><button type="button" aria-disabled="true">'+(label ? label + ' ' : '')+'<b>'+curL+'</b>'+icon('lock')+'</button></div>';
  }
  return '<div class="qp-dd" data-dd="'+k+'"><button type="button" aria-haspopup="listbox" aria-expanded="false">'+(label ? label + ' ' : '')+'<b>'+curL+'</b>'+icon('chevd')+'</button>'+
    '<div class="qp-menu" role="listbox">' + opts.map(function(x){
      if (x && x.grp) return '<div class="grp">'+x.grp+'</div>';
      var v = typeof x === 'string' ? x : x.v, l = typeof x === 'string' ? x : x.l;
      return '<div role="option" tabindex="-1" data-k="'+k+'" data-v="'+esc(v)+'" aria-selected="'+(v == value)+'">'+l+icon('check')+'</div>';
    }).join('') + '</div></div>';
};
QP.dates = function(from, to, kf, kt){
  function one(k, v){
    return '<label class="qp-date">'+icon('cal')+'<input type="text" readonly value="'+QP.dmy(v)+'" data-date="'+k+'" aria-label="'+(k===kf?'From date':'To date')+'"><input type="date" class="sr" tabindex="-1" data-picker="'+k+'" value="'+v+'"></label>';
  }
  return '<span class="qp-field">From '+one(kf, from)+'</span><span class="qp-field">to '+one(kt, to)+'</span>';
};
/* metric tile for area cards: tone is the status edge; t is the target line */
QP.tile = function(k, v, t, tone, cls){
  return '<div class="qp-tile '+(tone||'neu')+(cls ? ' '+cls : '')+'"><span class="k">'+k+'</span><span class="v">'+v+'</span>'+(t ? '<span class="t">'+t+'</span>' : '')+'</div>';
};
QP.statusPill = function(){ var p = QP.persona; var closed = /as at/.test(p.status); return '<span class="qp-status"><i></i><b>Month closed</b>· '+p.status+'</span>'; };
QP.legend = function(){
  return '<span class="qp-legend" aria-label="Status legend">'+
    '<span><i style="--tc:var(--pos)"></i>On track / favourable</span>'+
    '<span><i style="--tc:var(--amb)"></i>At risk</span>'+
    '<span><i style="--tc:var(--neg)"></i>Underperforming / adverse</span>'+
    '<span><i style="--tc:var(--neu)"></i>No data</span></span>';
};
/* section headings are the headline alone; the caption argument is accepted
   for call-site compatibility but no longer rendered */
QP.sec = function(title, cap, rt, cls){
  return '<div class="qp-sec '+(cls||'')+'"><h2>'+title+'</h2>'+(rt ? '<div class="rt">'+rt+'</div>' : '')+'</div>';
};
QP.eyebrow = function(t){ return '<div class="qp-eyebrow">'+t+'</div>'; };
QP.card = function(o){
  var hd = (o.title || o.rt) ? '<div class="hd"><div class="tt"><h3>'+(o.title||'')+(o.cap ? ' <span class="cap">'+o.cap+'</span>' : '')+'</h3>'+(o.sub ? '<p>'+o.sub+'</p>' : '')+'</div>'+(o.rt ? '<div class="rt">'+o.rt+'</div>' : '')+'</div>' : '';
  return '<section class="qp-card '+(o.cls||'')+(o.status ? ' st-'+o.status : '')+'"'+(o.id ? ' id="'+o.id+'"' : '')+(o.style ? ' style="'+o.style+'"' : '')+(o.tip ? ' data-tip="'+esc(o.tip)+'" tabindex="0"' : '')+'>'+hd+(o.body||'')+(o.foot ? '<div class="qp-foot">'+icon('info')+'<span>'+o.foot+'</span></div>' : '')+'</section>';
};
/* small i button beside a label: its tooltip (hover, tap or focus) defines the measure */
QP.infoBtn = function(label, def){ return '<button type="button" class="qp-ib" data-tip="'+esc(def)+'" aria-label="'+esc('About '+String(label).replace(/<[^>]*>/g, '')+': '+def)+'">'+icon('info')+'</button>'; };
QP.kpi = function(o){
  return '<div class="qp-kpi '+(o.status||'neu')+' '+(o.cls||'')+'"'+(o.id ? ' id="'+o.id+'"' : '')+(o.info ? ' data-def="'+esc(o.info)+'"' : '')+'>'+
    '<div class="k"><span class="lab">'+o.label+'</span>'+(o.st ? '<span class="st">'+o.st+'</span>' : '')+'</div>'+
    (o.info ? '<span class="sr">'+esc(o.info)+'</span>' : '')+
    (o.pair ? o.pair : '<div class="v">'+o.value+(o.unit ? '<small>'+o.unit+'</small>' : '')+'</div>')+
    (o.meter || '')+
    ((o.chip || o.foot) ? '<div class="ft">'+(o.chip||'')+(o.foot||'')+'</div>' : '')+
    /* secondary figures live in the hover card; kept in the DOM for screen readers */
    ((o.detail || o.sub) ? '<div class="t sr">'+(o.detail || o.sub)+'</div>' : '')+
    (o.spark ? '<svg class="spark" viewBox="0 0 56 20" preserveAspectRatio="none">'+o.spark+'</svg>' : '')+
  '</div>';
};
QP.sparkPath = function(vals, tone){
  var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), r = mx - mn || 1;
  var pts = vals.map(function(v, i){ return (i / (vals.length - 1) * 54 + 1).toFixed(1) + ',' + (18 - (v - mn) / r * 16).toFixed(1); });
  var c = tone === 'neg' ? 'var(--neg)' : tone === 'pos' ? 'var(--pos)' : 'var(--s2)';
  var last = pts[pts.length-1].split(',');
  return '<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+c+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle cx="'+last[0]+'" cy="'+last[1]+'" r="1.8" fill="'+c+'"/>';
};
QP.ring = function(pct, color, label, value, ctx){
  var r = 50, c = 2 * Math.PI * r, d = Math.max(0, Math.min(100, pct)) / 100 * c;
  return '<div class="qp-ring"><svg viewBox="0 0 124 124" role="img" aria-label="'+esc(label)+' '+pct+'%">'+
    '<circle cx="62" cy="62" r="'+r+'" fill="none" stroke="var(--card2)" stroke-width="12"/>'+
    '<circle cx="62" cy="62" r="'+r+'" fill="none" stroke="var(--line)" stroke-width="12"/>'+
    '<circle cx="62" cy="62" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="12" stroke-linecap="round" stroke-dasharray="'+d.toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(-90 62 62)"/>'+
    '<text x="62" y="68" text-anchor="middle" font-size="22" font-weight="700" fill="var(--ink)">'+(value || pct+'%')+'</text></svg><div class="k">'+label+'</div>'+(ctx ? '<div class="ctx">'+ctx+'</div>' : '')+'</div>';
};
QP.bar = function(pct, color){ return '<span class="qp-bar"><span class="tk"><i style="width:'+Math.min(100,pct)+'%;'+(color ? 'background:'+color : '')+'"></i></span><b>'+pct+'%</b></span>'; };

/* matrix table with drill-down (Power BI matrix +/-) */
QP.table = function(o){
  var cols = o.cols, tid = o.id || 't', hasExp = o.rows.some(function(r){ return r.children && r.children.length; }) || o.expAll;
  var open = QP.state._open || {}, xl = o.expLabel || 'Cost lines';
  function cc(c){ return (c.cls||'')+(c.band ? ' band' : '')+(c.key ? ' key' : ''); }
  function unit(l){ return String(l).replace(/\s*\(([^()]*)\)\s*$/, ' <span class="u">($1)</span>'); }
  function vals(r, child){ return cols.map(function(c){ var v = c.fmt ? c.fmt(r, child) : r[c.k]; return v == null || v === '—' ? '<span class="qp-na" data-tip="Not applicable to this line">n/a</span>' : v; }); }
  /* a row's status dot comes from its own status pill, else its first variance */
  function tone(html, flag){ var m = /qp-pill (pos|neg|amb|neu)/.exec(html) || /qp-chip (pos|neg|amb|neu)/.exec(html); return m ? m[1] : flag ? 'neg' : null; }
  var rowVals = o.rows.map(function(r){ return vals(r); });
  var tones = rowVals.map(function(v, i){ return tone(v.join(''), o.rows[i].flag); });
  var dots = tones.some(Boolean);
  var xc = hasExp ? '<td class="xc"></td>' : '';
  function cells(v, t){
    return cols.map(function(c, i){
      var x = v[i];
      if (i === 0 && t) x = '<span class="nmx"><i class="dot '+t+'" aria-hidden="true"></i><span>'+x+'</span></span>';
      return '<td class="'+cc(c)+(i === 0 ? ' nm' : '')+'">'+x+'</td>';
    }).join('');
  }
  var h = '<div class="qp-tbl'+(hasExp ? ' has-exp' : '')+(dots ? ' has-dot' : '')+'"'+(o.maxh ? ' style="max-height:'+o.maxh+'px"' : '')+'><table>';
  h += '<thead>';
  if (o.groups) {
    h += '<tr class="grp">' + o.groups.map(function(g){ return '<th scope="colgroup" colspan="'+g.span+'"'+(g.band ? ' class="band"' : '')+'>'+(g.label ? '<span>'+g.label+'</span>' : '')+'</th>'; }).join('') + (hasExp ? '<th class="xc"></th>' : '') + '</tr>';
  }
  h += '<tr>' + cols.map(function(c){ return '<th scope="col" class="'+cc(c)+'"'+(c.w ? ' style="width:'+c.w+'"' : '')+'>'+unit(c.label)+'</th>'; }).join('') +
    (hasExp ? '<th class="xc"><span class="sr">'+esc(xl)+'</span></th>' : '') + '</tr></thead><tbody>';
  o.rows.forEach(function(r, ri){
    var id = tid + '-' + ri, isOpen = !!open[id];
    var kids = r.children && r.children.length, ctl = '';
    if (kids) {
      var name = String(rowVals[ri][0]).replace(/<[^>]*>/g, '');
      var ids = r.children.map(function(_, ci){ return id + '-c' + ci; }).join(' ');
      ctl = '<button class="qp-exp" data-exp="'+id+'" aria-expanded="'+isOpen+'" aria-controls="'+ids+'" aria-label="'+esc(xl+': '+name)+'" data-tip="'+esc(xl)+'">'+icon('chevr')+'</button>';
    }
    /* r.act = [action, value]: the whole row selects, by click or Enter/Space */
    var act = r.act ? ' data-act="'+r.act[0]+'" data-v="'+esc(r.act[1])+'" tabindex="0"'+(r.sel ? ' aria-current="true"' : '') : '';
    h += '<tr class="'+(r.sel ? 'sel ' : '')+(r.act ? 'pick ' : '')+(kids ? 'xp ' : '')+(r.cls||'')+'"'+(kids ? ' data-xp="'+id+'"' : '')+(r.tip ? ' data-tip="'+esc(r.tip)+'"' : '')+act+'>' +
      cells(rowVals[ri], dots ? tones[ri] || 'none' : null) + (hasExp ? '<td class="xc">'+ctl+'</td>' : '') + '</tr>';
    if (kids) r.children.forEach(function(c, ci){
      h += '<tr id="'+id+'-c'+ci+'" class="child" data-parent="'+id+'"'+(isOpen ? '' : ' hidden')+'>' + cells(vals(c, true), null) + xc + '</tr>';
    });
  });
  h += '</tbody>';
  if (o.total) h += '<tfoot><tr>' + cells(vals(o.total), dots ? 'none' : null) + xc + '</tr></tfoot>';
  return h + '</table></div>';
};

/* ── tooltip ───────────────────────────────────────────────────────────── */
var tipEl;
QP.tip = {
  show:function(html, x, y){
    if (!tipEl || !tipEl.isConnected) { tipEl = document.createElement('div'); tipEl.className = 'qp-tip'; tipEl.setAttribute('role','tooltip'); document.body.appendChild(tipEl); }
    tipEl.innerHTML = html; tipEl.classList.add('on');
    var w = tipEl.offsetWidth, hh = tipEl.offsetHeight;
    var left = Math.min(window.innerWidth - w - 10, Math.max(10, x + 14));
    var top = y - hh - 12; if (top < 8) top = y + 18;
    tipEl.style.left = left + 'px'; tipEl.style.top = top + 'px';
  },
  hide:function(){ if (tipEl) tipEl.classList.remove('on'); hideKTip(); }
};
QP.tipRows = function(title, rows){
  return '<div class="h">'+title+'</div>' + rows.map(function(r){ return '<div class="row"><span>'+(r.c ? '<i style="background:'+r.c+'"></i>' : '')+r.l+'</span><b>'+r.v+'</b></div>'; }).join('');
};
/* KPI hover card (OE reference): title, value, then dot rows — the reference
   and variance first, other reference figures, status, and the definition.
   Built from the card itself, so every QP.kpi gets one with no extra wiring. */
var ktipEl = null, kcard = null;
var KSTATUS = {pos:'on track', neg:'underperforming', amb:'at risk'};
function plain(html){ return String(html).replace(/<\/?b>/g, '').replace(/\s+/g, ' ').trim(); }
function kpiTip(card){
  var lab = card.querySelector('.k .lab'), v = card.querySelector('.v'), pair = card.querySelector('.pair');
  var value = v ? v.innerHTML : pair ? [].map.call(pair.children, function(d){ return d.querySelector('b').textContent + ' <small>' + esc(d.querySelector('span').textContent) + '</small>'; }).join(' · ') : '';
  var t = card.querySelector('.t'), sub = t ? t.innerHTML.split(/\s·\s/).map(plain).filter(Boolean) : [];
  var ft = card.querySelector('.ft'), change = [], pills = [];
  if (ft) [].forEach.call(ft.childNodes, function(n){
    if (n.nodeType === 1 && n.classList.contains('qp-pill')) pills.push(n.textContent.trim().toLowerCase());
    else if (n.textContent.trim()) change.push(n.nodeType === 1 && n.classList.contains('qp-chip') ? n.outerHTML : esc(n.textContent.trim()));
  });
  var st = card.querySelector('.k .st'); if (st && st.textContent.trim()) pills.unshift(st.textContent.trim().toLowerCase());
  var status = ['pos','neg','amb'].filter(function(c){ return card.classList.contains(c); })[0];
  if (status && pills.indexOf(KSTATUS[status]) < 0) pills.push(KSTATUS[status]);
  var chg = change.reduce(function(acc, part){ return acc ? acc + (/^(vs|over|under|against)\b/i.test(part) ? ' ' : ' · ') + part : part; }, '');
  var lead = [sub[0], chg].filter(Boolean).join(' · ');
  var rows = (lead ? [{h:lead, lead:true}] : []).concat(sub.slice(1).map(function(s){ return {h:s}; }), pills.filter(function(p, i){ return pills.indexOf(p) === i; }).map(function(p){ return {h:esc(p)}; }));
  if (card.dataset.def) rows.push({h:esc(card.dataset.def)});
  return '<span class="k">'+esc(lab ? lab.textContent.trim() : '')+'</span><span class="v">'+value+'</span>'+
    (rows.length ? '<span class="rows">'+rows.map(function(r){ return '<span class="r'+(r.lead ? ' lead' : '')+'"><i></i><span>'+r.h+'</span></span>'; }).join('')+'</span>' : '');
}
function placeKTip(x, y){
  var w = ktipEl.offsetWidth, h = ktipEl.offsetHeight;
  var top = y - h - 17; if (top < 8) top = y + 22;
  ktipEl.style.left = Math.min(window.innerWidth - w - 8, Math.max(8, x - w / 2)) + 'px';
  ktipEl.style.top = top + 'px';
}
function hideKTip(){ kcard = null; if (ktipEl) ktipEl.classList.remove('on'); }
document.addEventListener('mouseover', function(ev){
  var c = ev.target.closest && ev.target.closest('.qp-kpi');
  if (!c || c === kcard) return;
  if (!ktipEl || !ktipEl.isConnected) { ktipEl = document.createElement('div'); ktipEl.className = 'qp-ktip'; ktipEl.setAttribute('role', 'tooltip'); document.body.appendChild(ktipEl); }
  kcard = c; ktipEl.innerHTML = kpiTip(c); placeKTip(ev.clientX, ev.clientY); ktipEl.classList.add('on');
});
document.addEventListener('mousemove', function(ev){ if (kcard) placeKTip(ev.clientX, ev.clientY); });
document.addEventListener('mouseout', function(ev){ if (kcard && !kcard.contains(ev.relatedTarget)) hideKTip(); });
window.addEventListener('scroll', hideKTip, true);
/* ── viewer preferences: light / dark theme and an expanded rail. Stored per
   browser; each page's head applies them before first paint. ─────────── */
var ROOT = document.documentElement;
function pref(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(e){} return null; }
if (pref('qp-theme') === 'dark') ROOT.setAttribute('data-theme', 'dark');
if (pref('qp-rail') === 'open') ROOT.setAttribute('data-rail', 'open');
function isDark(){ return ROOT.getAttribute('data-theme') === 'dark'; }
function railOpen(){ return ROOT.getAttribute('data-rail') === 'open'; }
function themeAttrs(){ var d = isDark(); return ' aria-pressed="'+d+'" aria-label="Switch to '+(d ? 'light' : 'dark')+' theme" data-tip="'+(d ? 'Light' : 'Dark')+' theme"'; }
QP.themeButton = function(){ return '<button type="button" class="qp-theme" data-theme-toggle'+themeAttrs()+'>'+icon('moon', 'moon')+icon('sun', 'sun')+'</button>'; };
/* rail head: collapsed, the logo mark is the expand button; expanded, the full logo sits
   beside a collapse button. Both are rendered and CSS shows the one for the current state,
   so the hidden control is also out of the tab order. */
QP.railHead = function(){
  return '<div class="lg"><button type="button" class="lg-open" data-rail-toggle aria-expanded="false" aria-label="Expand menu" data-tip="Expand menu">'+
      '<span class="mk"><img src="'+QP.ASSETS+'qiddiya-mark.png" alt=""></span></button>'+
    '<span class="lg-full" role="img" aria-label="Qiddiya"><img class="full lt" src="'+QP.ASSETS+'qiddiya-logo.png" alt=""><img class="full dk" src="'+QP.ASSETS+'qiddiya-logo-dark.png" alt=""></span>'+
    '<button type="button" class="lg-close" data-rail-toggle aria-expanded="true" aria-label="Collapse menu" data-tip="Collapse menu">'+icon('expand')+'</button></div>';
};
function refit(){ (QP.charts || []).forEach(function(c){ c.fn(c.el, c.cfg); }); fitTables(); }
document.addEventListener('click', function(ev){
  var t = ev.target.closest && ev.target.closest('[data-theme-toggle],[data-rail-toggle]');
  if (!t) return;
  QP.tip.hide();
  var sel = t.hasAttribute('data-theme-toggle') ? '[data-theme-toggle]' : '[data-rail-toggle]', hadFocus = document.activeElement === t;
  /* keep focus on the control that is visible after the switch */
  setTimeout(function(){ var nb = hadFocus && [].filter.call(document.querySelectorAll(sel), function(b){ return b.offsetParent; })[0]; if (nb) nb.focus(); });
  if (t.hasAttribute('data-theme-toggle')) {
    var dark = !isDark();
    ROOT.setAttribute('data-theme', dark ? 'dark' : 'light'); pref('qp-theme', dark ? 'dark' : 'light');
    document.querySelectorAll('[data-theme-toggle]').forEach(function(b){ b.outerHTML = QP.themeButton(); });
  } else {
    if (railOpen()) ROOT.removeAttribute('data-rail'); else ROOT.setAttribute('data-rail', 'open');
    pref('qp-rail', railOpen() ? 'open' : 'closed');
    setTimeout(refit, 230);
  }
});
QP.toast = function(msg){
  var t = document.querySelector('.qp-toast'); if (!t) { t = document.createElement('div'); t.className = 'qp-toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(function(){ t.classList.remove('on'); }, 2200);
};

/* ── SVG chart kit ─────────────────────────────────────────────────────── */
var NS = 'http://www.w3.org/2000/svg';
function niceMax(v){ if (v <= 0) return 1; var mag = Math.pow(10, Math.floor(Math.log10(v))), st = [1,1.2,1.5,2,2.5,3,4,5,6,8,10]; for (var i=0;i<st.length;i++) if (st[i]*mag >= v) return st[i]*mag; return 10*mag; }
function tickFmt(v, max){ if (max >= 10000) return (v/1000).toLocaleString('en-US',{maximumFractionDigits:1}) + 'K'; if (max >= 100) return Math.round(v).toLocaleString('en-US'); return QP.round(v, max < 10 ? 1 : 0).toLocaleString('en-US'); }
function frame(el, h){
  el.innerHTML = '';
  var w = Math.max(240, el.clientWidth || 600);
  var svg = document.createElementNS(NS,'svg'); svg.setAttribute('viewBox','0 0 '+w+' '+h); svg.setAttribute('height', h); svg.setAttribute('role','img');
  el.appendChild(svg); return {svg:svg, w:w, h:h};
}
function add(p, tag, a, txt){ var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; p.appendChild(e); return e; }
function hover(target, html){
  target.addEventListener('mousemove', function(ev){ QP.tip.show(typeof html === 'function' ? html() : html, ev.clientX, ev.clientY); });
  target.addEventListener('mouseleave', QP.tip.hide);
}
function rrect(x, y, w, h, r){ /* column with rounded top only */
  r = Math.min(r, w/2, Math.abs(h));
  if (h <= 0) return '';
  return 'M'+x+','+(y+h)+'V'+(y+r)+'Q'+x+','+y+' '+(x+r)+','+y+'H'+(x+w-r)+'Q'+(x+w)+','+y+' '+(x+w)+','+(y+r)+'V'+(y+h)+'Z';
}
QP.chart = {};
QP.charts = [];
function reg(el, fn, cfg){ QP.charts.push({el:el, fn:fn, cfg:cfg}); fn(el, cfg); }
QP.draw = function(id, type, cfg){ var el = typeof id === 'string' ? document.getElementById(id) : id; if (el) reg(el, QP.chart[type], cfg); };

/* columns (grouped) + lines, optional secondary axis for cumulative lines */
QP.chart.combo = function(el, c){
  var f = frame(el, c.h || 240), svg = f.svg, W = f.w, H = f.h;
  var L = c.left == null ? 44 : c.left, R = c.y2 ? 50 : 14, T = 26, B = 28;
  var pw = W - L - R, ph = H - T - B, n = c.cats.length, bw = pw / n;
  var bars = c.bars || [], lines = c.lines || [];
  var v1 = [], v2 = [];
  if (c.stack) v1 = c.cats.map(function(_, i){ return bars.reduce(function(a, s){ return a + (s.off ? 0 : s.values[i] || 0); }, 0); });
  else bars.forEach(function(s){ if (!s.off) v1 = v1.concat(s.values); });
  lines.forEach(function(s){ if (!s.off) (s.axis === 2 ? v2 : v1).push.apply(s.axis === 2 ? v2 : v1, s.values.filter(function(x){ return x != null; })); });
  var m1 = niceMax(Math.max.apply(null, v1.concat([c.min1||0])) * 1.08), m2 = v2.length ? niceMax(Math.max.apply(null, v2) * 1.08) : 1;
  var y1 = function(v){ return T + ph - v / m1 * ph; }, y2 = function(v){ return T + ph - v / m2 * ph; };
  for (var t = 0; t <= 4; t++) {
    var gy = T + ph - t / 4 * ph;
    add(svg,'line',{x1:L, x2:W-R, y1:gy, y2:gy, 'class': t ? 'grid' : 'base', 'stroke-dasharray': t ? '3 4' : ''});
    add(svg,'text',{x:L-10, y:gy+4, 'text-anchor':'end', 'class':'ax'}, tickFmt(m1*t/4, m1));
    if (c.y2) add(svg,'text',{x:W-R+10, y:gy+4, 'class':'ax'}, tickFmt(m2*t/4, m2));
  }
  var nb = bars.filter(function(s){ return !s.off; }).length || 1, gw = Math.min(bw * (c.gap || .62), nb * (c.maxBar || 30)), sw = gw / nb;
  var bi = 0;
  if (c.stack) {
    gw = Math.min(bw * .5, c.maxBar || 40);
    var vis = bars.filter(function(s){ return !s.off; });
    c.cats.forEach(function(_, i){
      var acc = 0, x = L + i * bw + (bw - gw) / 2;
      vis.forEach(function(s, si){
        var v = s.values[i] || 0, ya = y1(acc), yb = y1(acc + v), top = si === vis.length - 1;
        add(svg,'path',{d: top ? rrect(x, yb, gw, ya - yb, 4) : 'M'+x+','+ya+'V'+yb+'H'+(x+gw)+'V'+ya+'Z', fill:s.color, stroke:'var(--card)', 'stroke-width':1});
        acc += v;
      });
      if (c.labels) add(svg,'text',{x:x + gw/2, y:y1(acc) - 7, 'text-anchor':'middle', 'class':'lbl'}, c.fmt(acc));
    });
  }
  bars.forEach(function(s){
    if (c.stack) return;
    if (s.off) return;
    s.values.forEach(function(v, i){
      if (v == null) return;
      var x = L + i * bw + (bw - gw) / 2 + bi * sw + (nb > 1 ? 1 : 0), w = sw - (nb > 1 ? 2 : 0), y = y1(v);
      var p = add(svg,'path',{d:rrect(x, y, w, T + ph - y, 4), fill:(s.colorAt ? s.colorAt(i) : s.color), 'data-dim':i});
      if (s.stroke) { p.setAttribute('stroke', s.stroke); p.setAttribute('stroke-width', 1); }
      if (c.labels && s.label !== false && (c.labels === 'all' || i === n - 1)) add(svg,'text',{x:x + w/2, y:y - 7, 'text-anchor':'middle', 'class':'lbl'}, (c.fmtLbl || c.fmt)(v));
    });
    bi++;
  });
  lines.forEach(function(s){
    if (s.off) return;
    var yy = s.axis === 2 ? y2 : y1, pts = [];
    s.values.forEach(function(v, i){ if (v != null) pts.push([L + i * bw + bw / 2, yy(v)]); });
    /* no translucent area fills: the client palette is used solid only */
    add(svg,'polyline',{points:pts.map(function(p){ return p.join(','); }).join(' '), fill:'none', stroke:s.color, 'stroke-width':s.width || 2.25, 'stroke-dasharray':s.dash || '', 'stroke-linejoin':'round', 'stroke-linecap':'round'});
    if (s.markers !== false) pts.forEach(function(p, i){ add(svg,'circle',{cx:p[0], cy:p[1], r:i === pts.length - 1 ? 4.5 : 3, fill:i === pts.length - 1 ? s.color : 'var(--card)', stroke:s.color, 'stroke-width':2}); });
    if (s.endLabel) { var lp = pts[pts.length-1]; var tx = s.endLabel(s.values[s.values.length-1]);
      var tw = tx.length * 6.4 + 16, bx = Math.min(W - R - tw + (c.y2 ? 40 : 0), lp[0] - tw/2), by = lp[1] - 30;
      add(svg,'rect',{x:bx, y:by, width:tw, height:20, rx:10, fill:'var(--card)', stroke:s.color, 'stroke-width':1.2});
      add(svg,'text',{x:bx + tw/2, y:by + 14, 'text-anchor':'middle', 'class':'lbl'}, tx); }
  });
  c.cats.forEach(function(cat, i){ add(svg,'text',{x:L + i * bw + bw / 2, y:H - 8, 'text-anchor':'middle', 'class':'ax' + (i === (c.hl == null ? -1 : c.hl) ? ' b' : '')}, cat); });
  c.cats.forEach(function(cat, i){
    var hit = add(svg,'rect',{x:L + i * bw, y:T, width:bw, height:ph, 'class':'hit', rx:6});
    hover(hit, function(){
      var rows = [];
      bars.forEach(function(s){ if (!s.off && s.values[i] != null) rows.push({l:s.name, v:c.fmt(s.values[i]), c:s.colorAt ? s.colorAt(i) : s.color}); });
      lines.forEach(function(s){ if (!s.off && s.values[i] != null) rows.push({l:s.name, v:(s.fmt || c.fmt)(s.values[i]), c:s.color}); });
      if (c.extraTip) rows = rows.concat(c.extraTip(i));
      return QP.tipRows(c.tipTitle ? c.tipTitle(i) : cat, rows);
    });
    if (c.onClick) { hit.addEventListener('click', function(){ c.onClick(i); }); }
  });
};

/* stacked columns */
QP.chart.stacked = function(el, c){
  var f = frame(el, c.h || 230), svg = f.svg, W = f.w, H = f.h, L = 44, R = 14, T = 24, B = 28;
  var pw = W - L - R, ph = H - T - B, n = c.cats.length, bw = pw / n;
  var tot = c.cats.map(function(_, i){ return c.series.reduce(function(a, s){ return a + (s.off ? 0 : s.values[i]); }, 0); });
  var m = niceMax(Math.max.apply(null, tot) * 1.1), y = function(v){ return T + ph - v / m * ph; };
  for (var t = 0; t <= 4; t++) { var gy = T + ph - t/4*ph; add(svg,'line',{x1:L, x2:W-R, y1:gy, y2:gy, 'class':t ? 'grid' : 'base', 'stroke-dasharray':t ? '3 4' : ''}); add(svg,'text',{x:L-10, y:gy+4, 'text-anchor':'end', 'class':'ax'}, tickFmt(m*t/4, m)); }
  var gw = Math.min(bw * .56, c.maxBar || 40);
  c.cats.forEach(function(cat, i){
    var acc = 0, x = L + i * bw + (bw - gw) / 2, visible = c.series.filter(function(s){ return !s.off; });
    visible.forEach(function(s, si){
      var v = s.values[i], y0 = y(acc), y1 = y(acc + v);
      var top = si === visible.length - 1;
      add(svg,'path',{d: top ? rrect(x, y1, gw, y0 - y1, 4) : 'M'+x+','+y0+'V'+y1+'H'+(x+gw)+'V'+y0+'Z', fill:s.color, stroke:'var(--card)', 'stroke-width':1, 'data-dim':i});
      acc += v;
    });
    if (c.totals !== false) add(svg,'text',{x:x + gw/2, y:y(acc) - 7, 'text-anchor':'middle', 'class':'lbl'}, c.fmt(tot[i]));
    add(svg,'text',{x:x + gw/2, y:H - 8, 'text-anchor':'middle', 'class':'ax' + (i === n - 1 ? ' b' : '')}, cat);
    var hit = add(svg,'rect',{x:L + i * bw, y:T, width:bw, height:ph, 'class':'hit', rx:6});
    hover(hit, function(){ return QP.tipRows(c.tipTitle ? c.tipTitle(i) : cat, c.series.filter(function(s){ return !s.off; }).slice().reverse().map(function(s){ return {l:s.name, v:c.fmt(s.values[i]), c:s.color}; }).concat([{l:'Total', v:c.fmt(tot[i])}])); });
  });
};

/* horizontal bars (ranked) */
QP.chart.hbars = function(el, c){
  var rowH = c.rowH || 26, n = c.items.length, H = n * rowH + 8;
  var f = frame(el, H), svg = f.svg, W = f.w, L = c.left || 128, R = 48;
  var m = c.max || niceMax(Math.max.apply(null, c.items.map(function(d){ return d.value; })));
  var x = function(v){ return L + v / m * (W - L - R); };
  if (c.target != null) {}
  c.items.forEach(function(d, i){
    var yy = i * rowH + 4, bh = rowH - 10;
    add(svg,'text',{x:L - 12, y:yy + bh/2 + 4, 'text-anchor':'end', 'class':'ax' + (d.hl ? ' b' : '')}, d.name);
    add(svg,'rect',{x:L, y:yy, width:W - L - R, height:bh, rx:bh/2, fill:'var(--card2)'});
    add(svg,'rect',{x:L, y:yy, width:Math.max(4, x(d.value) - L), height:bh, rx:bh/2, fill:d.color || c.color || 'var(--s1)'});
    add(svg,'text',{x:x(d.value) + 8, y:yy + bh/2 + 4, 'class':'lbl'}, c.fmt(d.value));
    var hit = add(svg,'rect',{x:0, y:yy - 3, width:W, height:rowH, 'class':'hit', rx:6});
    hover(hit, QP.tipRows(d.name, [{l:c.label || 'Value', v:c.fmt(d.value), c:d.color || c.color || 'var(--s1)'}].concat(d.extra || [])));
  });
  if (c.target != null) { var tx = x(c.target); add(svg,'line',{x1:tx, x2:tx, y1:0, y2:H - 4, stroke:'var(--target)', 'stroke-width':1.5, 'stroke-dasharray':'4 3'}); }
};

/* donut */
QP.chart.donut = function(el, c){
  var S = c.size || 190, f = frame(el, S), svg = f.svg, cx = f.w / 2, cy = S / 2, r = S / 2 - 12, rw = c.thick || 26;
  var tot = c.items.reduce(function(a, d){ return a + d.value; }, 0), a0 = -Math.PI / 2;
  c.items.forEach(function(d){
    var a1 = a0 + d.value / tot * Math.PI * 2, gap = .012;
    var s0 = a0 + gap, s1 = a1 - gap, big = s1 - s0 > Math.PI ? 1 : 0, ri = r - rw;
    var p = 'M'+(cx + r*Math.cos(s0))+','+(cy + r*Math.sin(s0))+' A'+r+','+r+' 0 '+big+' 1 '+(cx + r*Math.cos(s1))+','+(cy + r*Math.sin(s1))+
      ' L'+(cx + ri*Math.cos(s1))+','+(cy + ri*Math.sin(s1))+' A'+ri+','+ri+' 0 '+big+' 0 '+(cx + ri*Math.cos(s0))+','+(cy + ri*Math.sin(s0))+'Z';
    var seg = add(svg,'path',{d:p, fill:d.color});
    hover(seg, QP.tipRows(d.name, [{l:c.valueLabel || 'Headcount', v:(c.fmt || QP.f.i)(d.value), c:d.color},{l:'Share', v:QP.f.pct(d.value / tot * 100, 0)}]));
    a0 = a1;
  });
  add(svg,'text',{x:cx, y:cy + 2, 'text-anchor':'middle', 'font-size':26, 'font-weight':700, fill:'var(--ink)'}, c.center);
  add(svg,'text',{x:cx, y:cy + 20, 'text-anchor':'middle', 'class':'ax'}, c.centerLabel || '');
};

/* daily line with rolling average */
QP.chart.line = function(el, c){
  var f = frame(el, c.h || 220), svg = f.svg, W = f.w, H = f.h, L = 44, R = 16, T = 18, B = 28;
  var pw = W - L - R, ph = H - T - B, n = c.values.length;
  var m = niceMax(Math.max.apply(null, c.values) * 1.08), x = function(i){ return L + i / (n - 1) * pw; }, y = function(v){ return T + ph - v / m * ph; };
  for (var t = 0; t <= 4; t++) { var gy = T + ph - t/4*ph; add(svg,'line',{x1:L, x2:W-R, y1:gy, y2:gy, 'class':t ? 'grid' : 'base', 'stroke-dasharray':t ? '3 4' : ''}); add(svg,'text',{x:L-10, y:gy+4, 'text-anchor':'end', 'class':'ax'}, tickFmt(m*t/4, m)); }
  (c.marks || []).forEach(function(mk){ add(svg,'line',{x1:x(mk.i), x2:x(mk.i), y1:T, y2:T+ph, stroke:'var(--line)', 'stroke-width':1}); add(svg,'text',{x:x(mk.i)+4, y:H - 8, 'class':'ax'}, mk.l); });
  var pts = c.values.map(function(v, i){ return x(i).toFixed(1) + ',' + y(v).toFixed(1); });

  add(svg,'polyline',{points:pts.join(' '), fill:'none', stroke:c.color || 'var(--s2)', 'stroke-width':1.4, 'stroke-linejoin':'round'});
  if (c.avg) add(svg,'polyline',{points:c.avg.map(function(v, i){ return x(i).toFixed(1) + ',' + y(v).toFixed(1); }).join(' '), fill:'none', stroke:'var(--s1)', 'stroke-width':2.4, 'stroke-linejoin':'round', 'stroke-linecap':'round'});
  var lx = x(n-1), ly = y(c.values[n-1]);
  add(svg,'circle',{cx:lx, cy:ly, r:4.5, fill:'var(--s1)', stroke:'var(--card)', 'stroke-width':2});
  var cross = add(svg,'line',{x1:0, x2:0, y1:T, y2:T+ph, stroke:'var(--mut)', 'stroke-width':1, visibility:'hidden'});
  var dot = add(svg,'circle',{r:4, fill:'var(--s1)', stroke:'var(--card)', 'stroke-width':2, visibility:'hidden'});
  var hit = add(svg,'rect',{x:L, y:T, width:pw, height:ph, fill:'transparent'});
  hit.addEventListener('mousemove', function(ev){
    var bb = svg.getBoundingClientRect(), px = (ev.clientX - bb.left) * (W / bb.width), i = Math.max(0, Math.min(n - 1, Math.round((px - L) / pw * (n - 1))));
    cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('visibility', 'visible');
    dot.setAttribute('cx', x(i)); dot.setAttribute('cy', y(c.values[i])); dot.setAttribute('visibility', 'visible');
    QP.tip.show(QP.tipRows(c.label(i), [{l:'Admissions', v:QP.f.i(c.values[i]), c:'var(--s2)'}].concat(c.avg ? [{l:'7-day average', v:QP.f.i(c.avg[i]), c:'var(--s1)'}] : [])), ev.clientX, ev.clientY);
  });
  hit.addEventListener('mouseleave', function(){ cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden'); QP.tip.hide(); });
};

QP.legendHtml = function(items, key){
  return '<div class="qp-lg">' + items.map(function(it, i){
    var sw = '<i class="'+(it.t||'')+'" style="'+(it.t === 'ln' || it.t === 'dash' ? 'border-color:' : 'background:')+it.c+'"></i>';
    return key ? '<button data-series="'+key+':'+i+'" class="'+(it.off ? 'off' : '')+'">'+sw+it.l+'</button>' : '<span>'+sw+it.l+'</span>';
  }).join('') + '</div>';
};

/* ── shell ─────────────────────────────────────────────────────────────── */
function shell(){
  var p = QP.persona, pageId = QP.pageId, pg = QP.PAGES[pageId];
  var multi = p.pages.length > 1;
  var rail = multi ? '<nav class="qp-rail" aria-label="Dashboards">' + QP.railHead() +
    QP.ORDER.filter(QP.can).map(function(id){ return '<a href="'+QP.href(id)+'" class="'+(id === pageId ? 'on' : '')+'" data-tip="'+QP.PAGES[id].label+'" aria-label="'+QP.PAGES[id].label+'"'+(id === pageId ? ' aria-current="page"' : '')+'>'+icon(id)+'<span class="lb">'+QP.PAGES[id].label+'</span></a>'; }).join('') +
    '</nav>' : '';
  var access = p.pages.map(function(id){ return '<a href="'+QP.href(id)+'" role="menuitem"'+(id === pageId ? ' aria-current="page"' : '')+'>'+icon(id)+QP.PAGES[id].label+'</a>'; }).join('');
  var top = '<header class="qp-top"><div class="qp-brand">'+
    (multi ? '' : '<span class="logo"><img src="'+QP.ASSETS+'qiddiya-mark.png" alt="Qiddiya"></span>')+'<h1>Q-Profit</h1></div>'+
    QP.themeButton() +
    '<div class="qp-who" data-who tabindex="0" role="button" aria-haspopup="true" aria-label="'+esc(p.name)+', '+esc(p.role)+' — dashboards menu"><span class="av">'+p.ini+'</span><span><b>'+p.name+'</b><span>'+p.role+'</span></span>'+icon('chevd','cv')+
      '<div class="qp-pop" role="menu"><div class="hd"><b>'+p.name+'</b><span>'+p.role+'</span></div>'+access+
      '</div></div></header>';
  return {rail:rail, top:top};
}
function crumb(){
  var pg = QP.PAGES[QP.pageId], def = QP.def, s = QP.state;
  var scope = def.scope ? def.scope(s) : '';
  return '<div class="qp-crumb"><b>'+pg.label+'</b>'+(scope ? '<span class="sep">/</span><span class="cur">'+scope+'</span>' : '')+'<span style="flex:1"></span>'+QP.statusPill()+'</div>';
}

QP.define = function(id, def){ QP.DEFS = QP.DEFS || {}; QP.DEFS[id] = def; };
QP.set = function(k, v, silent){
  if (k === 'tab') { if (v !== QP.pageId && QP.PAGES[v]) QP.go(QP.url(v)); return; }
  QP.state[k] = v;
  if (QP.def.onSet) QP.def.onSet(QP.state, k, v);
  if (!silent) QP.render();
};

var FOOTER = '<footer class="qp-footer"><span>Q-Profit · Data &amp; AI Office, Qiddiya Investment Company</span><span class="sp"></span><span>Amounts in '+F.sar+' millions unless stated · Source: SAP actuals, plan &amp; forecast workbooks</span></footer>';
QP.render = function(){
  var main = document.getElementById('qp-body'), y = window.scrollY;
  QP.charts = []; QP.tip.hide();
  try {
    main.innerHTML = crumb() + '<div class="qp-ctl">'+QP.def.controls(QP.state)+(QP.def.controlsRight ? '<div class="rt">'+QP.def.controlsRight(QP.state)+'</div>' : '')+'</div>' + QP.def.body(QP.state) + FOOTER;
    if (QP.def.mount) QP.def.mount(QP.state);
  } catch (e) {
    if (window.console) console.error(e);
    QP.charts = [];
    main.innerHTML = notice('info', 'This Dashboard Couldn’t Be Displayed', 'Something went wrong while preparing '+QP.PAGES[QP.pageId].label+'. Reloading usually fixes it; your other dashboards are unaffected.',
      '<button type="button" class="qp-link" data-reload>'+icon('reset')+'Reload</button>' + otherPages(QP.pageId)) + FOOTER;
    return;
  }
  labelTables(main); fitTables();
  window.scrollTo(0, y);
};

/* full-width message card: not found, outside access, render error */
function notice(ic, title, text, actions, code){
  return '<section class="qp-card qp-notice" role="status"><span class="ic">'+icon(ic)+'</span>'+(code ? '<span class="code">'+code+'</span>' : '')+
    '<h2>'+title+'</h2><p>'+text+'</p>'+(actions ? '<div class="lk">'+actions+'</div>' : '')+'</section>';
}
function otherPages(except){
  return QP.persona.pages.filter(function(id){ return id !== except; }).map(function(id){ return '<a class="qp-navlink" href="'+QP.url(id)+'">'+icon(id)+QP.PAGES[id].label+'</a>'; }).join('');
}
/* a table's accessible name is its card title, else the nearest section heading above it */
function labelTables(root){
  root.querySelectorAll('.qp-tbl table:not([aria-label])').forEach(function(t){
    var card = t.closest('.qp-card'), hd = card && card.querySelector('.hd h3'), el = card;
    while (!hd && el && el !== root) {
      var s = el.previousElementSibling;
      while (s && !s.classList.contains('qp-sec')) s = s.previousElementSibling;
      if (s) hd = s.querySelector('h2'); else el = el.parentElement;
    }
    if (hd) t.setAttribute('aria-label', hd.firstChild.textContent.trim());
  });
}
/* tables that fit their frame drop the scroll container so the header can stick to the page */
function fitTables(){
  document.querySelectorAll('.qp-tbl').forEach(function(t){
    if (t.style.maxHeight) return;
    t.classList.remove('fit');
    t.classList.toggle('fit', t.scrollWidth <= t.clientWidth + 1);
  });
}

function closeMenus(except){ document.querySelectorAll('.qp-dd.open,.qp-who.open').forEach(function(d){ if (d !== except) { d.classList.remove('open'); var b = d.querySelector('button'); if (b) b.setAttribute('aria-expanded','false'); } }); }

function bind(){
  document.addEventListener('click', function(ev){
    var t = ev.target;
    /* in-app links route without a page load; modified clicks keep browser behaviour */
    var a = t.closest('a[href]');
    if (a && ev.button === 0 && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey && !ev.altKey && !a.target && !a.hasAttribute('download')) {
      var u = new URL(a.href, location.href);
      if (QP.MODE === 'path' && u.origin === location.origin && /^\/user\//.test(u.pathname)) { ev.preventDefault(); QP.go(u.pathname); return; }
      if (QP.MODE === 'hash' && u.pathname === location.pathname && /^#\/user\//.test(u.hash)) { ev.preventDefault(); QP.go(u.hash.slice(1)); return; }
    }
    if (t.closest('[data-reload]')) { location.reload(); return; }
    var seg = t.closest('.qp-seg button[data-k]'); if (seg && !seg.disabled) { QP.set(seg.dataset.k, seg.dataset.v); return; }
    var ddb = t.closest('.qp-dd:not(.locked)>button');
    if (ddb) { var dd = ddb.parentNode, open = !dd.classList.contains('open'); closeMenus(dd); dd.classList.toggle('open', open); ddb.setAttribute('aria-expanded', open); if (open) { var sel = dd.querySelector('[aria-selected=true]') || dd.querySelector('[role=option]'); if (sel) sel.focus(); } return; }
    var opt = t.closest('.qp-menu [role=option]'); if (opt) { closeMenus(); QP.set(opt.dataset.k, opt.dataset.v); return; }
    if (t.closest('.qp-dd.locked')) { QP.toast('This filter is fixed to your access scope'); return; }
    var xr = t.closest('tr[data-xp]');
    var ex = t.closest('[data-exp]') || (xr && !t.closest('a,button,input') && !String(window.getSelection()) ? xr.querySelector('[data-exp]') : null);
    if (ex) { var id = ex.dataset.exp, o = !(ex.getAttribute('aria-expanded') === 'true'); QP.state._open = QP.state._open || {}; QP.state._open[id] = o; ex.setAttribute('aria-expanded', o);
      document.querySelectorAll('tr[data-parent="'+id+'"]').forEach(function(r){ r.hidden = !o; }); fitTables(); return; }
    var dt = t.closest('[data-date]'); if (dt) { var pk = dt.parentNode.querySelector('[data-picker]'); try { pk.showPicker(); } catch(e){ pk.click(); } return; }
    var sr = t.closest('[data-series]'); if (sr) { var p = sr.dataset.series.split(':'); QP.state[p[0]] = QP.state[p[0]] || {}; QP.state[p[0]][p[1]] = !QP.state[p[0]][p[1]]; QP.render(); return; }
    var who = t.closest('[data-who]'); if (who && !t.closest('.qp-pop a')) { var wo = !who.classList.contains('open'); closeMenus(who); who.classList.toggle('open', wo); return; }
    var act = t.closest('[data-act]'); if (act && QP.def && QP.def.act) { QP.def.act(act.dataset.act, act, QP.state); return; }
    if (!t.closest('.qp-dd,.qp-who')) closeMenus();
  });
  document.addEventListener('change', function(ev){
    var pk = ev.target.closest('[data-picker]'); if (pk && pk.value) { QP.set(pk.dataset.picker, pk.value); }
  });
  document.addEventListener('keydown', function(ev){
    var dd = ev.target.closest('.qp-dd.open');
    if (ev.key === 'Escape') { closeMenus(); QP.tip.hide(); return; }
    if (dd && (ev.key === 'ArrowDown' || ev.key === 'ArrowUp')) { ev.preventDefault(); var os = [].slice.call(dd.querySelectorAll('[role=option]')), i = os.indexOf(document.activeElement); i = ev.key === 'ArrowDown' ? Math.min(os.length - 1, i + 1) : Math.max(0, i - 1); os[i].focus(); }
    if (dd && ev.key === 'Enter' && ev.target.getAttribute('role') === 'option') { ev.preventDefault(); ev.target.click(); }
    if (ev.key === 'Enter' && ev.target.matches('[data-who]')) ev.target.click();
    if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.closest('[data-act]') && QP.def && QP.def.act) { ev.preventDefault(); var ae = ev.target.closest('[data-act]'); QP.def.act(ae.dataset.act, ae, QP.state); }
  });
  /* data-tip tooltips */
  document.addEventListener('mouseover', function(ev){ var el = ev.target.closest('[data-tip]'); if (el && el.closest('.qp-rail') && !el.hasAttribute('data-rail-toggle') && document.documentElement.getAttribute('data-rail') === 'open') return; if (el) { var r = el.getBoundingClientRect(); QP.tip.show(esc(el.dataset.tip), r.left + r.width / 2 - 14, r.top); } });
  document.addEventListener('mouseout', function(ev){ var el = ev.target.closest('[data-tip]'); if (el && !el.contains(ev.relatedTarget)) QP.tip.hide(); });
  document.addEventListener('focusin', function(ev){ var el = ev.target.closest('[data-tip]'); if (el) { var r = el.getBoundingClientRect(); QP.tip.show(esc(el.dataset.tip), r.left, r.top); } });
  document.addEventListener('focusout', QP.tip.hide);
  var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ QP.charts.forEach(function(c){ c.fn(c.el, c.cfg); }); fitTables(); }, 120); });
  document.addEventListener('scroll', function(ev){ var t = ev.target; if (t.classList && t.classList.contains('qp-tbl')) t.classList.toggle('sx', t.scrollLeft > 0); }, true);
}
function mountShell(){
  var sh = shell();
  document.getElementById('qp-rail-slot').innerHTML = sh.rail;
  document.getElementById('qp-top-slot').innerHTML = sh.top;
}

/* ── router: /user/<user> opens the user's first dashboard,
   /user/<user>/<dashboard> opens that dashboard. Filters are kept per
   user + dashboard for the session, so moving between pages and back
   returns to the same view. ─────────────────────────────────────────── */
var FRAME = '<div class="qp-app"><div id="qp-rail-slot" style="display:contents"></div><main class="qp-main"><div id="qp-top-slot"></div><div id="qp-body"></div></main></div>';
var kept = {};
QP.go = function(target){
  closeMenus();
  var path = String(target), h = path.indexOf('#');
  if (h >= 0) path = path.slice(h + 1);
  if (path === QP.current()) return;
  /* hash mode may run from file://, where history.pushState can be refused: a plain
     fragment change works everywhere and the hashchange listener routes it */
  if (QP.MODE === 'hash') { location.hash = path; return; }
  history.replaceState({y:window.scrollY}, '');
  history.pushState({y:0}, '', path);
  route(0);
};
QP.parse = function(path){
  var m = path.replace(/\/+$/, '').match(/^\/user\/([^\/]+)(?:\/([^\/]+))?$/i);
  return m ? {user:decodeURIComponent(m[1]).toLowerCase(), page:m[2] ? decodeURIComponent(m[2]).toLowerCase() : null} : null;
};
function ensureFrame(){ if (!document.getElementById('qp-body')) document.body.innerHTML = FRAME; }
function route(y){
  if (QP.persona && QP.def && QP.state) kept[QP.persona.slug + '/' + QP.pageId] = QP.state;
  QP.tip.hide(); QP.charts = [];
  if (QP.MODE === 'hash' && !location.hash) { location.replace(QP.HOME); return; }
  var r = QP.parse(QP.current()), per = r && QP.PERSONAS[r.user];
  if (!per) return unknownUser(r && r.user);
  QP.persona = per;
  var page = r.page || per.pages[0];
  ensureFrame();
  if (!QP.PAGES[page] || !QP.DEFS[page]) return outside(page, 'missing');
  if (per.pages.indexOf(page) < 0) return outside(page, 'access');
  QP.pageId = page; QP.def = QP.DEFS[page];
  if (QP.PAGES[page].area) ROOT.setAttribute('data-area', QP.PAGES[page].area); else ROOT.removeAttribute('data-area');
  QP.state = kept[per.slug + '/' + page] || Object.assign(QP.def.defaults(), {_open:Object.assign({}, QP.def._open || {})});
  document.title = QP.PAGES[page].label + ' · ' + per.name + ' · Q-Profit';
  mountShell(); QP.render();
  window.scrollTo(0, y || 0);
}
/* a known user, but a dashboard that doesn't exist or isn't in their workspace */
function outside(page, why){
  QP.pageId = null; QP.def = null; QP.state = null; ROOT.removeAttribute('data-area');
  mountShell();
  var p = QP.persona, known = QP.PAGES[page];
  document.title = (why === 'access' ? known.label + ' · not in workspace' : 'Page Not Found') + ' · Q-Profit';
  var links = '<a class="qp-link" href="'+QP.url()+'">'+icon('consolidated')+'Go to '+esc(p.name)+'’s home</a>' + otherPages(p.pages[0]);
  document.getElementById('qp-body').innerHTML = why === 'access'
    ? notice('lock', known.label+' Isn’t Part of '+esc(p.name)+'’s Workspace', esc(p.name)+'’s access: '+esc(p.scope)+'. '+(p.pages.length > 1 ? 'Open one of their dashboards instead.' : 'Open their dashboard instead.'), links, '403')
    : notice('info', 'Page Not Found', 'There’s no dashboard called “'+esc(page)+'”. Check the link, or open one of '+esc(p.name)+'’s dashboards.', links, '404');
  document.getElementById('qp-body').insertAdjacentHTML('beforeend', FOOTER);
  window.scrollTo(0, 0);
}
function unknownUser(user){
  QP.persona = null; QP.pageId = null; QP.def = null; QP.state = null; ROOT.removeAttribute('data-area');
  document.title = 'Page Not Found · Q-Profit';
  document.body.innerHTML = '<div class="qp-solo"><header class="qp-top"><div class="qp-brand"><span class="logo"><img src="'+QP.ASSETS+'qiddiya-mark.png" alt="Qiddiya"></span><h1>Q-Profit</h1></div>'+QP.themeButton()+'</header>'+
    notice('users', 'Page Not Found', user ? 'There’s no user called “'+esc(user)+'”. Open the directory to find the right workspace.' : 'This address doesn’t match a Q-Profit page.',
      '<a class="qp-link" href="'+QP.HOME+'">'+icon('users')+'All users</a>', '404') + '<footer class="qp-footer"><span>Q-Profit · Data &amp; AI Office, Qiddiya Investment Company</span></footer></div>';
  window.scrollTo(0, 0);
}
QP.boot = function(){
  bind();
  if (QP.MODE === 'hash') window.addEventListener('hashchange', function(){ route(0); });
  else {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.addEventListener('popstate', function(ev){ route(ev.state && ev.state.y); });
  }
  route(0);
};
/* the app page boots itself; the directory and reference pages load this file for its registry only */
var me = document.currentScript;
if (!(me && me.hasAttribute('data-noboot'))) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ QP.boot(); }); else setTimeout(QP.boot);
}
})();
