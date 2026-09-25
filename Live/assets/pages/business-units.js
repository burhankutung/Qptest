/* Business Units — one unit's budget, commitments, work performed and variance. */
(function(){
var f = QP.f, M = f.m, chip = QP.chip;
function sum(a){ return a.reduce(function(x,y){ return x+y; },0); }
function split(total, w, dp){ var s = sum(w), acc = 0; return w.map(function(x, i){ var v = i === w.length - 1 ? QP.round(total - acc, dp) : QP.round(total * x / s, dp); acc += v; return v; }); }

/* Entertainment is the unit reported in full; every other unit
   reads its totals from the Development performance report. */
var UNITS = {
  'Entertainment':           {qfm:27, bud:875, com:1232, wp:560, a:560, p:600, fy:600, dp:0},
  'Master Development Unit': {bud:2480.0, com:1204.6, wp:1204.6, a:1204.6, p:1180.0, fy:1240.0},
  'PMBS Stadium':            {bud:640.0, com:301.7, wp:288.4, a:288.4, p:291.9, fy:300.0},
  'Sports':                  {bud:410.0, com:194.0, wp:176.5, a:176.5, p:175.1, fy:180.0},
  'QPAC':                    {bud:520.0, com:233.8, wp:201.0, a:201.0, p:204.6, fy:210.0},
  'Transport':               {bud:288.0, com:119.6, wp:101.4, a:101.4, p:108.8, fy:114.0},
  'Residential':             {bud:375.0, com:160.2, wp:142.7, a:142.7, p:144.9, fy:150.0},
  'Arts & Culture':          {bud:210.0, com:98.4, wp:96.4, a:96.4, p:94.0, fy:98.0},
  'Racecourse':              {bud:180.0, com:88.0, wp:84.2, a:84.2, p:82.0, fy:86.0},
  'Hospitality':             {bud:520.0, com:233.8, wp:201.0, a:201.0, p:204.6, fy:212.0}
};
var PROJ = [
  {n:'Six Flags', bu:'Entertainment', v:'Saudi Motorsport', cv:1232, mc:68, cu:40, ll:[24.5896, 46.3335], logo:'logos/sixflags.png'},
  {n:'Speed Park', bu:'Entertainment', v:'MC2 Contracting', cv:925, mc:50, cu:20, ll:[24.582429, 46.322565], glyph:'flag'},
  {n:'Aquarabia', bu:'Entertainment', v:'MC3 Builders', cv:804, mc:85, cu:20, ll:[24.5871, 46.3234], logo:'logos/aquarabia.png'},
  {n:'Anime Hub', bu:'Entertainment', v:'Saudi Motorsport', cv:604, mc:90, cu:83, ll:[24.5945, 46.3262], approx:true, glyph:'sparkle', detail:{gfa:'500 m²', rides:78, handover:'Jun 2024', mainc:'Qiddiya Co.', op:'Saudi Motorsport', tb:5925, tc:4865, tw:4305, bp:'Business Plan Approved'}},
  {n:'Arena bowl', bu:'PMBS Stadium', v:'MC2 Contracting', cv:488.0, mc:54, cu:14, ll:[24.585, 46.342]},
  {n:'Retail spine', bu:'Retail', v:'MC3 Builders', cv:310.0, mc:41, cu:9, ll:[24.5881, 46.3386], approx:true},
  {n:'Concert hall', bu:'QPAC', v:'MC2 Contracting', cv:262.0, mc:47, cu:11, ll:[24.5881, 46.3386], approx:true},
  {n:'Residential phase one', bu:'Residential', v:'MC3 Builders', cv:375.0, mc:33, cu:6, ll:[24.5881, 46.3386], approx:true},
  {n:'Transit spine', bu:'Transport', v:'Saudi Motorsport', cv:288.0, mc:29, cu:4, ll:[24.5881, 46.3386], approx:true}
];
/* site outlines traced from OpenStreetMap (© OpenStreetMap contributors, ODbL) */
var SITES = {
  'Six Flags': [[24.59086,46.33816],[24.59061,46.33806],[24.59036,46.33752],[24.5901,46.33714],[24.58979,46.33678],[24.58934,46.33639],[24.58888,46.33608],[24.58855,46.33593],[24.5881,46.33576],[24.58766,46.33569],[24.5872,46.3357],[24.58702,46.33559],[24.58629,46.3342],[24.58621,46.33399],[24.58635,46.33386],[24.58662,46.33376],[24.58699,46.33359],[24.58743,46.33336],[24.58726,46.33288],[24.5871,46.3327],[24.58684,46.33261],[24.58662,46.33257],[24.58638,46.33236],[24.58622,46.33216],[24.58615,46.33186],[24.58615,46.33165],[24.58623,46.33139],[24.58638,46.33108],[24.58661,46.33077],[24.58683,46.33062],[24.58704,46.33052],[24.58752,46.33042],[24.58814,46.3302],[24.58832,46.33009],[24.58817,46.32985],[24.58839,46.32959],[24.58859,46.32976],[24.58874,46.32966],[24.58869,46.32944],[24.58913,46.32948],[24.58928,46.32961],[24.58952,46.32981],[24.5897,46.32989],[24.59034,46.32979],[24.59045,46.32999],[24.59062,46.33077],[24.59071,46.33174],[24.59068,46.3326],[24.59075,46.33313],[24.59094,46.33375],[24.59116,46.33422],[24.59143,46.33462],[24.5917,46.33494],[24.59186,46.33541],[24.59188,46.33575],[24.59179,46.33613],[24.59164,46.33645],[24.59136,46.33684],[24.59115,46.33731],[24.59452,46.34004],[24.59424,46.34111],[24.59086,46.33816]],
  'Aquarabia': [[24.58995,46.32675],[24.5893,46.3257],[24.58885,46.32516],[24.58854,46.32441],[24.58851,46.32314],[24.5886,46.32162],[24.5886,46.31974],[24.58854,46.31924],[24.58871,46.31831],[24.58872,46.31767],[24.58745,46.31772],[24.58694,46.31902],[24.58729,46.31924],[24.58729,46.31952],[24.58705,46.31973],[24.58588,46.32129],[24.5841,46.32332],[24.58438,46.32901],[24.5847,46.32911],[24.58542,46.3287],[24.5863,46.32767],[24.58779,46.3277],[24.58902,46.32798],[24.58995,46.32675]]
};

/* map badges: official logos live in assets/logos (from each park's own site); projects with
   no published logo get a themed glyph in the dashboard's icon style, not a brand mark */
var GLYPHS = {
  flag:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 21V3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'+
    '<rect x="5.5" y="4" width="13.5" height="9" fill="none" stroke="currentColor" stroke-width="1.4"/>'+
    '<path d="M5.5 4h3.4v3H5.5zM12.3 4h3.4v3h-3.4zM8.9 7h3.4v3H8.9zM15.7 7H19v3h-3.3zM5.5 10h3.4v3H5.5zM12.3 10h3.4v3h-3.4z" fill="currentColor"/></svg>',
  sparkle:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 3.5l1.9 5.6 5.6 1.9-5.6 1.9L11 18.5l-1.9-5.6-5.6-1.9 5.6-1.9z" fill="currentColor"/>'+
    '<path d="M18.5 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z" fill="currentColor"/></svg>'
};

/* Leaflet is loaded on first use, only on this page */
var LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/', lfWait = null, mapView = {}, refocus = null;
function leaflet(cb){
  if (window.L) return cb();
  if (!lfWait) {
    lfWait = [];
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = LEAFLET + 'leaflet.min.css'; document.head.appendChild(css);
    var js = document.createElement('script'); js.src = LEAFLET + 'leaflet.min.js';
    js.onload = function(){ var q = lfWait; lfWait = null; q.forEach(function(f){ f(); }); };
    js.onerror = function(){ var q = lfWait; lfWait = null; q.forEach(function(f){ f(true); }); };
    document.head.appendChild(js);
  }
  lfWait.push(cb);
}

var CBS = [{n:'Design', b:6600, a:6600}, {n:'Sales Center', b:6240, a:6240}, {n:'Contingency', b:1600, a:1600}, {n:'Inflation', b:6240, a:6240}, {n:'Staff Cost', b:6240, a:6240}];
var CBSW = [.245,.232,.059,.232,.232];
var APV = [{n:'Saudi Motorsport', b:[40,10,2]}, {n:'MC2 Contracting', b:[30,5,0]}];

function unitProjects(bu){ return PROJ.filter(function(p){ return p.bu === bu; }); }

QP.define('business-units', {
  defaults:function(){ var l = QP.persona.lock; return {basis:'m', from:'2026-04-01', to:'2026-04-30', bu:l && l.bu || 'Entertainment', district:'All', project:'All', pick:'Anime Hub'}; },
  onSet:function(s, k, v){
    if (k === 'basis') { var r = QP.periodRange(2026, 4, v === 'ytd' ? 'ytd' : 'm'); s.from = r.from; s.to = r.to; }
    if (k === 'bu') { s.project = 'All'; var ps = unitProjects(v); s.pick = (ps.filter(function(p){ return p.detail; })[0] || ps[0] || {}).n; }
    if (k === 'project' && v !== 'All') s.pick = v;
  },
  scope:function(s){ return s.bu; },
  controls:function(s){
    var lock = QP.persona.lock && QP.persona.lock.bu;
    var buOpts = Object.keys(UNITS);
    var ps = unitProjects(s.bu);
    return QP.seg('basis', s.basis, [{v:'m', l:'Apr'}, {v:'ytd', l:'YTD'}]) + QP.dates(s.from, s.to, 'from', 'to') +
      QP.dd('bu', 'Business Unit', s.bu, buOpts, {locked: lock ? 'Your access is limited to the Entertainment business unit' : null}) +
      QP.dd('district', 'District', s.district, [{v:'All', l:'All'}].concat(s.bu === 'Entertainment' ? ['Anime World'] : [])) +
      QP.dd('project', 'Project', s.project, [{v:'All', l:'All'}].concat(ps.map(function(p){ return p.n; })));
  },
  body:function(s){
    var U = UNITS[s.bu], dp = U.dp == null ? 1 : U.dp, h = '';
    var fm = function(v){ return M(v, dp); };
    var v = f.varPct(U.a, U.p), bad = v < -2;
    h += '<div class="qp-grid g5">' +
      QP.kpi({label:'QFM', value:U.qfm != null ? f.i(U.qfm) : '—', status:U.qfm != null ? 'neu' : 'neu', sub:U.qfm != null ? 'Count for the selected unit' : 'Not reported for this unit', chip:U.qfm == null ? QP.pill('No data','neu') : ''}) +
      QP.kpi({label:'Total Budget', value:fm(U.bud), unit:'M', sub:'Inception-to-date budget', status:'neu'}) +
      QP.kpi({label:'Total Commitments', value:fm(U.com), unit:'M', sub:'<b>'+Math.round(U.com / U.bud * 100)+'%</b> of total budget committed', status:U.com > U.bud ? 'amb' : 'neu', chip:U.com > U.bud ? QP.pill('Above budget','amb') : ''}) +
      QP.kpi({label:'Total Work Performed', value:fm(U.wp), unit:'M', sub:'Against YTD plan <b>'+fm(U.p)+'</b>', status:bad ? 'neg' : 'pos', chip:chip(v, {suffix:'vs plan'}) + QP.pill(bad ? 'Underperforming' : 'On track', bad ? 'neg' : 'pos')}) +
      QP.kpi({label:'FY 2026 Plan', value:fm(U.fy), unit:'M', sub:'<b>'+Math.round(U.wp / U.fy * 100)+'%</b> of FY plan performed', status:'neu',
        meter:'<div class="meter"><span style="width:'+Math.min(100, U.wp / U.fy * 100)+'%;background:var(--s1)"></span></div>'}) +
      '</div>';

    /* performance report */
    var aa = split(U.a, CBSW, dp), pp = split(U.p, CBSW, dp), bb = split(U.bud, CBSW, dp), cc = split(U.com, CBSW, dp), ww = split(U.wp, CBSW, dp);
    var row = {n:s.bu, bud:U.bud, com:U.com, wp:U.wp, a:U.a, p:U.p, flag:bad, children:CBS.map(function(c, i){ return {n:c.n, bud:bb[i], com:cc[i], wp:ww[i], a:aa[i], p:pp[i]}; })};
    var nf = function(x){ return f.n(x, dp); };
    h += QP.sec('Performance Report', 'Cumulative, inception-to-date');
    h += QP.card({cls:'flush', body:QP.table({id:'bur', rows:[row], total:{n:'Total', bud:U.bud, com:U.com, wp:U.wp, a:U.a, p:U.p}, cols:[
      {k:'n', label:'Business Unit'},
      {label:'Budget ('+f.sar+')', cls:'r', fmt:function(r){ return nf(r.bud); }},
      {label:'Commitments ('+f.sar+')', cls:'r', fmt:function(r){ return nf(r.com); }},
      {label:'Work Performed ('+f.sar+')', cls:'r', fmt:function(r){ return nf(r.wp); }},
      {label:'YTD Actual ('+f.sar+')', cls:'r', band:true, fmt:function(r){ return nf(r.a); }},
      {label:'YTD Plan ('+f.sar+')', cls:'r', band:true, fmt:function(r){ return nf(r.p); }},
      {label:'Variance', cls:'r', band:true, fmt:function(r){ return chip(f.varPct(r.a, r.p)); }}
    ]}), foot:'Grain: business unit, monthly. Cumulative since project inception. Open a row for the cost breakdown structure beneath the unit.'});

    /* one selected project links the MC Progress table, the site map and the details panel */
    var all = unitProjects(s.bu), pk = all.filter(function(p){ return p.n === s.pick; })[0] || all[0];

    /* MC progress: every project stays listed; the selected one is highlighted */
    var ps = all;
    h += QP.sec('MC Progress', 'Physical completion by project');
    h += QP.card({cls:'flush', body:ps.length ? QP.table({id:'bmc', rows:ps.map(function(p){ return {p:p, sel:p === pk, act:['pick', p.n]}; }), cols:[
      {label:'Project', fmt:function(r){ return r.p.n; }}, {label:'Business Unit', fmt:function(r){ return r.p.bu; }}, {label:'Vendor', fmt:function(r){ return r.p.v; }},
      {label:'Contract Value ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.p.cv, dp); }},
      {label:'MC Completion', cls:'r', fmt:function(r){ return QP.bar(r.p.mc, 'var(--s1)'); }},
      {label:'Contingency Utilized', cls:'r', fmt:function(r){ return QP.bar(r.p.cu, r.p.cu >= 40 ? 'var(--amb)' : 'var(--s3)'); }}
    ]}) : '<div class="qp-empty">'+QP.icon('info')+'No contracts recorded for this unit.</div>', foot:'Grain: project, monthly. MC completion is physical percentage complete. Contingency at or above 40% is marked amber.'});

    /* project performance overview */
    if (pk) {
      var d = pk.detail;
      var kv = d ? [['GFA (SQM)', d.gfa], ['# of Rides', f.i(d.rides)], ['MC Completion', pk.mc + '%'], ['MC Handover', d.handover], ['Contingency Utilized', pk.cu + '%'], ['Main Contractor', d.mainc], ['Operator', d.op, 'wide']]
        : [['Contract Value', M(pk.cv, dp) + ' M'], ['Vendor', pk.v], ['MC Completion', pk.mc + '%'], ['Contingency Utilized', pk.cu + '%'], ['Business Unit', pk.bu, 'wide']];
      var trio = d ? [['Total Budget', d.tb], ['Total Commitments', d.tc], ['Total Work Performed', d.tw]] : null;
      h += QP.sec('Project Performance Overview', 'Select a project on the site map', d ? '<span class="qp-badge pos">'+d.bp+'</span>' : '');
      h += '<div class="qp-row">' +
        QP.card({cls:'f15', body:'<p class="qp-hint">'+QP.icon('info')+'Select a project on the map or table to view details</p><div class="qp-map" id="bu-map"><span class="cap">Site Map — '+(s.bu === 'Entertainment' ? 'Anime World District' : s.bu)+'</span></div>'+
          (trio ? '<div class="qp-trio" style="margin-top:14px">'+trio.map(function(t){ return '<div><span class="k">'+t[0]+'</span><span class="v">'+M(t[1], 0)+'</span></div>'; }).join('')+'</div>' : '')}) +
        QP.card({cls:'f1 qp-selected', title:'<span class="k">Selected Project</span>'+pk.n, sub:pk.bu + ' · ' + pk.v, rt:QP.pill(pk.mc >= 80 ? 'Near handover' : pk.mc >= 50 ? 'In construction' : 'Early works', pk.mc >= 80 ? 'pos' : 'neu'),
          body:'<div class="qp-kv">'+kv.map(function(x){ return '<div class="'+(x[2]||'')+'"><span class="k">'+x[0]+'</span><span class="v">'+x[1]+'</span></div>'; }).join('')+'</div>'+
            '<div class="qp-bullet"><div class="r"><span class="l">MC complete</span><span class="tk"><i style="width:'+pk.mc+'%;background:var(--s1)"></i></span><span class="v">'+pk.mc+'%</span></div>'+
            '<div class="r"><span class="l">Contingency</span><span class="tk"><i style="width:'+pk.cu+'%;background:'+(pk.cu >= 40 ? 'var(--amb)' : 'var(--s3)')+'"></i></span><span class="v">'+pk.cu+'%</span></div></div>'}) +
        '</div>';
    }

    /* cost breakdown + AP */
    var scale = s.bu === 'Entertainment' ? 1 : U.bud / 875;
    var cbs = CBS.map(function(c){ return {n:c.n, b:Math.round(c.b * scale), a:Math.round(c.a * scale)}; });
    var ap = APV.map(function(v){ return {n:v.n, b:v.b.map(function(x){ return Math.round(x * scale); })}; });
    var apt = [0,0,0]; ap.forEach(function(v){ v.b.forEach(function(x, i){ apt[i] += x; }); });
    h += QP.sec('Cost Breakdown & Accounts Payable', s.bu);
    h += '<div class="qp-row">' +
      QP.card({cls:'flush f1', title:'Cost Breakdown Structure', cap:'Cumulative', body:QP.table({id:'cbs', rows:cbs, total:{n:'Total', b:sum(cbs.map(function(c){ return c.b; })), a:sum(cbs.map(function(c){ return c.a; }))}, cols:[
        {k:'n', label:'CBS'}, {label:'Budget ('+f.sar+')', cls:'r', fmt:function(r){ return f.i(r.b); }}, {label:'Cumulative Actuals ('+f.sar+')', cls:'r', fmt:function(r){ return f.i(r.a); }},
        {label:'Consumed', cls:'r', fmt:function(r){ return QP.bar(Math.round(r.a / r.b * 100), 'var(--s2)'); }}
      ]}), foot:'Grain: cost breakdown structure (CBS) line, cumulative. Speed Park S-Curve excludes Iconic Cliff.'}) +
      QP.card({cls:'flush f1', title:'BU Accounts Payable by Vendor', cap:'Apr-26', body:QP.table({id:'bap', rows:ap, total:{n:'Total', b:apt}, cols:[{k:'n', label:'Vendor'}].concat(['Not Due','1-30','>90'].map(function(b, i){
        return {label:b+' ('+f.sar+')', cls:'r', fmt:function(r){ return i === 2 && r.b[i] > 0 ? '<span style="color:var(--neg-ink);font-weight:700">'+f.i(r.b[i])+'</span>' : f.i(r.b[i]); }}; })).concat([{label:'Total ('+f.sar+')', cls:'r', key:true, fmt:function(r){ return f.i(sum(r.b)); }}])}),
        foot:'Grain: vendor, aging bucket. Total reconciles to Total Commitments above. Balances over 90 days are shown in red.'}) +
      '</div>';
    return h;
  },
  mount:function(s){
    var el = document.getElementById('bu-map'); if (!el) return;
    var all = unitProjects(s.bu), bu = s.bu, pk = (all.filter(function(p){ return p.n === s.pick; })[0] || all[0] || {}).n;
    var rows = {}, pins = {};
    [].forEach.call(document.querySelectorAll('tr.pick[data-act="pick"]'), function(tr){ rows[tr.getAttribute('data-v')] = tr; });
    /* hover or focus = temporary highlight in both places; click = persistent selection */
    function hl(n, on){ if (rows[n]) rows[n].classList.toggle('hl', on); if (pins[n]) pins[n].classList.toggle('hl', on); }
    Object.keys(rows).forEach(function(n){
      var tr = rows[n];
      tr.addEventListener('mouseenter', function(){ hl(n, true); }); tr.addEventListener('mouseleave', function(){ hl(n, false); });
      tr.addEventListener('focus', function(){ hl(n, true); }); tr.addEventListener('blur', function(){ hl(n, false); });
    });
    var back = refocus; refocus = null;
    if (back && back.row && rows[back.v]) rows[back.v].focus({preventScroll:true});
    leaflet(function(failed){
      if (!el.isConnected) return;
      if (failed) { el.insertAdjacentHTML('beforeend', '<div class="qp-map-off">'+QP.icon('nomatch')+'Map unavailable offline</div>'); return; }
      var box = document.createElement('div'); box.className = 'qp-map-canvas'; el.appendChild(box);
      var map = L.map(box, {scrollWheelZoom:false, zoomControl:false, attributionControl:true});
      L.control.zoom({position:'topright'}).addTo(map);
      map.attributionControl.setPrefix(false);
      /* openstreetmap.org tiles require a Referer, which a page opened from the folder (file://) cannot send;
         there the same OpenStreetMap style comes from the OSM community server openstreetmap.de */
      var osm = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';
      L.tileLayer(location.protocol === 'file:' ? 'https://tile.openstreetmap.de/{z}/{x}/{y}.png' : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {maxZoom:18, referrerPolicy:'strict-origin-when-cross-origin', attribution:osm}).addTo(map);
      /* the view is set first: markers only get their DOM element once the map has one */
      var pts = all.map(function(p){ return p.ll; }), v = mapView[bu];
      if (v) map.setView(v.c, v.z, {animate:false});
      else if (pts.length > 1) map.fitBounds(pts, {paddingTopLeft:[40, 56], paddingBottomRight:[150, 48], maxZoom:16});
      else map.setView(pts[0] || [24.5881, 46.3386], 15);
      all.forEach(function(p){
        /* a project with a logo or glyph shows it in a white badge; others keep the plain dot */
        var badge = p.logo || p.glyph, on = p.n === pk, sz = badge ? (on ? 38 : 30) : (on ? 20 : 14);
        if (SITES[p.n]) L.polygon(SITES[p.n], {className:'site' + (on ? ' on' : ''), interactive:false}).addTo(map);
        var mark = p.logo ? '<img src="'+QP.ASSETS+p.logo+'" alt="">' : p.glyph ? GLYPHS[p.glyph] : '';
        var icon = L.divIcon({className:'qp-pin' + (badge ? ' badge' : '') + (on ? ' on' : ' mut') + (p.approx ? ' approx' : ''), iconSize:[sz, sz], iconAnchor:[sz / 2, sz / 2],
          html:'<i>'+mark+'</i><b>'+(on ? '<em>Selected</em>' : '')+QP.esc(p.n)+' · '+p.mc+'%</b>'});
        var mk = L.marker(p.ll, {icon:icon, title:p.n + (p.approx ? ' (approximate location)' : ''), alt:p.n, riseOnHover:true, zIndexOffset:on ? 1000 : 0})
          .on('click', function(){ if (s.pick !== p.n) { s.pick = p.n; refocus = {v:p.n}; QP.render(); } })
          .on('mouseover', function(){ hl(p.n, true); }).on('mouseout', function(){ hl(p.n, false); })
          .addTo(map);
        pins[p.n] = mk.getElement();
        pins[p.n].addEventListener('focus', function(){ hl(p.n, true); }); pins[p.n].addEventListener('blur', function(){ hl(p.n, false); });
      });
      map.on('moveend', function(){ mapView[bu] = {c:map.getCenter(), z:map.getZoom()}; });
      if (back && !back.row && pins[back.v]) pins[back.v].focus({preventScroll:true});
      if (all.some(function(p){ return p.approx; })) el.insertAdjacentHTML('beforeend', '<span class="qp-map-key"><i></i>Approximate location</span>');
    });
  },
  act:function(a, el, s){ if (a === 'pick') { var v = el.getAttribute('data-v'); if (s.pick !== v) { s.pick = v; refocus = {v:v, row:el.tagName === 'TR'}; QP.render(); } } }
});
})();
