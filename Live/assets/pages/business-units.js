/* Business Units — one unit's budget, commitments, work performed and variance. */
(function(){
var f = QP.f, M = f.m, chip = QP.chip;
function sum(a){ return a.reduce(function(x,y){ return x+y; },0); }
function split(total, w, dp){ var s = sum(w), acc = 0; return w.map(function(x, i){ var v = i === w.length - 1 ? QP.round(total - acc, dp) : QP.round(total * x / s, dp); acc += v; return v; }); }

/* Entertainment is the unit the wireframe states in full; every other unit
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
  {n:'Six Flags', bu:'Entertainment', v:'Saudi Motorsport', cv:1232, mc:68, cu:40, x:.24, y:.40},
  {n:'Speed Park', bu:'Entertainment', v:'MC2 Contracting', cv:925, mc:50, cu:20, x:.47, y:.66},
  {n:'Aquarabia', bu:'Entertainment', v:'MC3 Builders', cv:804, mc:85, cu:20, x:.70, y:.34},
  {n:'Anime Hub', bu:'Entertainment', v:'Saudi Motorsport', cv:604, mc:90, cu:83, x:.55, y:.28, detail:{gfa:'500 m²', rides:78, handover:'Jun 2024', mainc:'Qiddiya Co.', op:'Saudi Motorsport', tb:5925, tc:4865, tw:4305, bp:'Business Plan Approved'}},
  {n:'Arena bowl', bu:'PMBS Stadium', v:'MC2 Contracting', cv:488.0, mc:54, cu:14, x:.40, y:.45},
  {n:'Retail spine', bu:'Retail', v:'MC3 Builders', cv:310.0, mc:41, cu:9, x:.40, y:.45},
  {n:'Concert hall', bu:'QPAC', v:'MC2 Contracting', cv:262.0, mc:47, cu:11, x:.40, y:.45},
  {n:'Residential phase one', bu:'Residential', v:'MC3 Builders', cv:375.0, mc:33, cu:6, x:.40, y:.45},
  {n:'Transit spine', bu:'Transport', v:'Saudi Motorsport', cv:288.0, mc:29, cu:4, x:.40, y:.45}
];
var CBS = [{n:'Design', b:6600, a:6600}, {n:'Sales Center', b:6240, a:6240}, {n:'Contingency', b:1600, a:1600}, {n:'Inflation', b:6240, a:6240}, {n:'Staff Cost', b:6240, a:6240}];
var CBSW = [.245,.232,.059,.232,.232];
var APV = [{n:'Saudi Motorsport', b:[40,10,2]}, {n:'MC2 Contracting', b:[30,5,0]}];

function unitProjects(bu){ return PROJ.filter(function(p){ return p.bu === bu; }); }

QP.define('business-units', {
  filterKeys:['basis','from','to','bu','district','project'],
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
      QP.dd('project', 'Project', s.project, [{v:'All', l:'All'}].concat(ps.map(function(p){ return p.n; }))) +
      QP.clearBtn(QP.dirty());
  },
  body:function(s){
    var U = UNITS[s.bu], dp = U.dp == null ? 1 : U.dp, h = '';
    var fm = function(v){ return M(v, dp); };
    var v = f.varPct(U.a, U.p), bad = v < -2;
    h += QP.eyebrow(s.bu + ' · key figures', 'Cumulative to Apr-26 · ' + f.sar + ' millions');
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
    ]}), foot:'Grain: business unit, monthly. Cumulative since project inception. Open Cost lines for the cost breakdown structure beneath the unit.'});

    /* MC progress */
    var ps = unitProjects(s.bu).filter(function(p){ return s.bu !== 'Entertainment' || p.n !== 'Anime Hub'; });
    h += QP.sec('MC Progress', 'Physical completion by project');
    h += QP.card({cls:'flush', body:ps.length ? QP.table({id:'bmc', rows:ps.map(function(p){ return {p:p, sel:s.project === p.n || (s.project === 'All' && s.pick === p.n)}; }), cols:[
      {label:'Project', fmt:function(r){ return r.p.n; }}, {label:'Business Unit', fmt:function(r){ return r.p.bu; }}, {label:'Vendor', fmt:function(r){ return r.p.v; }},
      {label:'Contract Value ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.p.cv, dp); }},
      {label:'MC Completion', cls:'r', fmt:function(r){ return QP.bar(r.p.mc, 'var(--s1)'); }},
      {label:'Contingency Utilized', cls:'r', fmt:function(r){ return QP.bar(r.p.cu, r.p.cu >= 40 ? 'var(--amb)' : 'var(--s3)'); }}
    ]}) : '<div class="qp-empty">'+QP.icon('info')+'No contracts recorded for this unit.</div>', foot:'Grain: project, monthly. MC completion is physical percentage complete. Contingency at or above 40% is marked amber.'});

    /* project performance overview */
    var all = unitProjects(s.bu), pk = all.filter(function(p){ return p.n === s.pick; })[0] || all[0];
    if (pk) {
      var d = pk.detail;
      var kv = d ? [['GFA (SQM)', d.gfa], ['# of Rides', f.i(d.rides)], ['MC Completion', pk.mc + '%'], ['MC Handover', d.handover], ['Contingency Utilized', pk.cu + '%'], ['Main Contractor', d.mainc], ['Operator', d.op, 'wide']]
        : [['Contract Value', M(pk.cv, dp) + ' M'], ['Vendor', pk.v], ['MC Completion', pk.mc + '%'], ['Contingency Utilized', pk.cu + '%'], ['Business Unit', pk.bu, 'wide']];
      var trio = d ? [['Total Budget', d.tb], ['Total Commitments', d.tc], ['Total Work Performed', d.tw]] : null;
      h += QP.sec('Project Performance Overview', 'Select a project on the site map', d ? '<span class="qp-badge pos">'+d.bp+'</span>' : '');
      h += '<div class="qp-row">' +
        QP.card({cls:'f15', body:'<div class="qp-map" id="bu-map"><span class="cap">Site map — '+(s.bu === 'Entertainment' ? 'Anime World district' : s.bu)+'</span></div>'+
          (trio ? '<div class="qp-trio" style="margin-top:14px">'+trio.map(function(t){ return '<div><span class="k">'+t[0]+'</span><span class="v">'+M(t[1], 0)+'</span></div>'; }).join('')+'</div>' : '')}) +
        QP.card({cls:'f1', title:pk.n, sub:pk.bu + ' · ' + pk.v, rt:QP.pill(pk.mc >= 80 ? 'Near handover' : pk.mc >= 50 ? 'In construction' : 'Early works', pk.mc >= 80 ? 'pos' : 'neu'),
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
        return {label:b+' ('+f.sar+')', cls:'r', fmt:function(r){ return i === 2 && r.b[i] > 0 ? '<span style="color:var(--neg-ink);font-weight:700">'+f.i(r.b[i])+'</span>' : f.i(r.b[i]); }}; })).concat([{label:'Total ('+f.sar+')', cls:'r', fmt:function(r){ return '<b>'+f.i(sum(r.b))+'</b>'; }}])}),
        foot:'Grain: vendor, aging bucket. Total reconciles to Total Commitments above. Balances over 90 days are shown in red.'}) +
      '</div>';
    return h;
  },
  mount:function(s){
    var el = document.getElementById('bu-map'); if (!el) return;
    var all = unitProjects(s.bu), W = el.clientWidth || 700, H = 300;
    if (all.length === 1) { all[0].x = .5; all[0].y = .5; }
    var svg = '<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="none" role="img" aria-label="Site map">'+
      '<defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="var(--line)" stroke-width="2"/></pattern></defs>'+
      '<rect width="'+W+'" height="'+H+'" fill="var(--card2)"/>'+
      '<path d="M0 '+(H*.78)+' C '+(W*.25)+' '+(H*.70)+', '+(W*.45)+' '+(H*.92)+', '+W+' '+(H*.80)+' L '+W+' '+H+' L 0 '+H+' Z" fill="var(--c-aqua300)"/>'+
      '<path d="M'+(W*.05)+' '+(H*.55)+' C '+(W*.3)+' '+(H*.5)+', '+(W*.6)+' '+(H*.58)+', '+(W*.96)+' '+(H*.5)+'" fill="none" stroke="var(--line2)" stroke-width="10" stroke-linecap="round"/>'+
      '<path d="M'+(W*.5)+' '+(H*.08)+' C '+(W*.48)+' '+(H*.4)+', '+(W*.52)+' '+(H*.7)+', '+(W*.46)+' '+(H*.95)+'" fill="none" stroke="var(--line2)" stroke-width="8" stroke-linecap="round"/>'+
      '<rect x="'+(W*.08)+'" y="'+(H*.12)+'" width="'+(W*.3)+'" height="'+(H*.3)+'" rx="14" fill="url(#hatch)" stroke="var(--line)"/>'+
      '<rect x="'+(W*.58)+'" y="'+(H*.1)+'" width="'+(W*.34)+'" height="'+(H*.32)+'" rx="14" fill="var(--card)" stroke="var(--line)"/>'+
      '<rect x="'+(W*.3)+'" y="'+(H*.6)+'" width="'+(W*.34)+'" height="'+(H*.2)+'" rx="14" fill="var(--card)" stroke="var(--line)"/>';
    all.forEach(function(p){
      var on = p.n === s.pick, x = p.x * W, y = p.y * H;
      svg += '<g class="pin" data-act="pick" data-v="'+QP.esc(p.n)+'" tabindex="0" role="button" aria-label="'+QP.esc(p.n)+'">'+
        '<circle class="o" cx="'+x+'" cy="'+y+'" r="'+(on ? 13 : 10)+'" fill="'+(on ? 'var(--acc-bg)' : 'var(--line)')+'"/>'+
        '<circle cx="'+x+'" cy="'+y+'" r="6" fill="'+(on ? 'var(--acc)' : 'var(--s1)')+'" stroke="var(--card)" stroke-width="2"/>'+
        '<text x="'+(x + 14)+'" y="'+(y + 4)+'" font-size="12" font-weight="'+(on ? 700 : 600)+'" fill="var(--ink)" paint-order="stroke" stroke="var(--card2)" stroke-width="4">'+p.n+' · '+p.mc+'%</text></g>';
    });
    el.insertAdjacentHTML('beforeend', svg + '</svg>');
  },
  act:function(a, el, s){ if (a === 'pick') { s.pick = el.getAttribute('data-v'); QP.render(); } }
});
})();
