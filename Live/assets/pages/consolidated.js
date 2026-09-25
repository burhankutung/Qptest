/* Consolidated — the company position across every area. */
(function(){
var f = QP.f, M = f.m, chip = QP.chip;

/* split a total across weights so the parts reconcile exactly */
QP.split = function(total, w, dp){
  dp = dp == null ? 1 : dp; var s = w.reduce(function(a,b){ return a+b; },0), out = [], acc = 0;
  w.forEach(function(x, i){ var v = i === w.length - 1 ? QP.round(total - acc, dp) : QP.round(total * x / s, dp); acc += v; out.push(v); });
  return out;
};

var MONTHS = ['Oct','Nov','Dec','Jan','Feb','Mar'];
var MIDX = [{y:2025,m:10},{y:2025,m:11},{y:2025,m:12},{y:2026,m:1},{y:2026,m:2},{y:2026,m:3}];
var TREND = {
  overall:    {label:'Work Performed',                  unit:'M', actual:[468.2,502.7,531.4,549.8,568.1,594.4], plan:[480,520,552,575,598,627], fc:3388.4},
  corporate:  {label:'Work Performed · Corporate', unit:'M', actual:[55.2,57.4,58.9,60.3,63.2,98.1], plan:[54.8,56.9,58.1,57.4,59.1,95.6], fc:402.0},
  development:{label:'Work Performed · Development', unit:'M', actual:[352.4,369.8,384.1,394.6,406.3,420.5], plan:[360,377,391,402,414,428.4]},
  city:       {label:'Work Performed · City Operations', unit:'K', actual:[4820,5010,5160,5290,5460,5670], plan:[4760,4930,5070,5180,5340,5480]}
};

var KPIS = [
  {k:'Work Performed', a:3214.6, p:3352.0, fc:3388.4, info:'Value of work completed across Development, Corporate and City Operations, against YTD plan and YTD forecast. Stated in ⃁ millions.', st:'neg'},
  {k:'Qiddiya City Headcount', a:1842, p:1901, fc:1960, hc:true, info:'Qiddiya City FTEs at month end, against the YTD headcount plan and forecast.', st:'amb', good:'none'},
  {k:'Cash Overall', a:9238.2, sec:9180.0, fy:12400.0, info:'Total cash secured to date across all funding sources, against YTD secured and the full-year funding target.', st:'pos'},
  {k:'Cash', a:1088.2, p:1110.4, fc:1142.0, info:'Cash received to date against the YTD plan and forecast.', st:'neg'},
  {k:'MoF', a:2400.0, p:2400.0, fc:2400.0, info:'Ministry of Finance funding received to date, against YTD plan and forecast.', st:'pos'},
  {k:'PIF', a:5750.0, p:5670.0, fc:5750.0, info:'Public Investment Fund funding received to date, against YTD plan and forecast.', st:'pos'}
];

var DEV_BU = [
  {n:'Entertainment', a:355.8, p:412.0, fc:440.0},
  {n:'Master Development Unit', a:1204.6, p:1180.0, fc:1240.0},
  {n:'PMBS Stadium', a:288.4, p:291.9, fc:300.0},
  {n:'Sports', a:176.5, p:175.1, fc:180.0},
  {n:'QPAC', a:201.0, p:204.6, fc:210.0},
  {n:'Transport', a:101.4, p:108.8, fc:114.0}
];
var CBS = ['Design','Sales Center','Contingency','Inflation','Staff Cost'], CBSW = [.245,.232,.059,.232,.232];
var CORP = [
  {n:'Personnel Cost', a:121.9, p:118.4, fc:124.6, ma:30.4, mp:29.6},
  {n:'Information Technology', a:88.7, p:86.2, fc:90.4, ma:22.1, mp:21.6},
  {n:'Professional Services', a:61.2, p:52.8, fc:58.9, ma:15.3, mp:13.2},
  {n:'Marketing & Events', a:33.8, p:35.9, fc:34.9, ma:8.4, mp:9.0},
  {n:'General & Administration', a:61.4, p:61.6, fc:65.2, ma:15.4, mp:15.4},
  {n:'Others', a:26.1, p:27.0, fc:28.0, ma:6.5, mp:6.8}
];
var DEPTS = ['Finance','Human Resources','Procurement','Legal','Qiddiya Technology'];
var DEPTW = {
  'Personnel Cost':[.24,.22,.16,.12,.26], 'Information Technology':[.08,.06,.05,.04,.77], 'Professional Services':[.30,.14,.12,.34,.10],
  'Marketing & Events':[.18,.30,.12,.10,.30], 'General & Administration':[.26,.20,.22,.14,.18], 'Others':[.22,.20,.20,.18,.20]
};
var PROJECTS = [
  {n:'Anime Hub', bu:'Entertainment', cv:604.0, mc:68, cu:22, time:72, acct:34},
  {n:'Arena bowl', bu:'Sports', cv:488.0, mc:54, cu:14, time:64, acct:27},
  {n:'Retail spine', bu:'Retail', cv:310.0, mc:41, cu:8, time:55, acct:22},
  {n:'Residential phase one', bu:'Residential', cv:375.0, mc:33, cu:6, time:47, acct:15}
];
var WORKFORCE = [
  {name:'Qiddiya City FTEs', value:1776, color:'var(--s1)'},
  {name:'Delivery Partners', value:1776, color:'var(--s2)'},
  {name:'Contingent Workforce', value:925, color:'var(--s4)'},
  {name:'Operating Assets', value:476, color:'var(--area-oa)'},
  {name:'Pre-Opening', value:331, color:'var(--s6)'}
];
/* trend views by area: actual bars use that area's colour (Overall stays company blue) */
var TREND_C = {overall:'var(--s1)', corporate:'var(--area-corp)', development:'var(--area-dev)', city:'var(--area-city)'};
var HC = {corp:[790,804,818,831,845,856], dev:[736,751,769,784,799,812], city:[150,154,159,163,168,174], plan:[1700,1740,1785,1825,1862,1901]};
var AP = {
  amount:{nd:[31.2,32.6,33.9,34.8,36.1,37.3], le:[30.4,31.8,33.0,34.9,36.2,37.6], gt:[5.9,5.6,5.4,5.2,5.0,4.8]},
  count:{nd:[318,331,346,358,371,386], le:[241,252,263,277,289,301], gt:[64,61,58,55,52,49]}
};
var APV = [
  {n:'Saudi Motorsport', b:[8.2,4.1,4.5,2.5,0.5,1.0]},
  {n:'MC2 Contracting', b:[6.1,3.4,3.2,1.8,0.7,0.7]},
  {n:'MC3 Builders', b:[4.4,2.8,2.2,1.3,0.4,0.5]},
  {n:'All others', b:[18.6,7.4,2.8,1.6,0.5,0.5]}
];

function sum(a){ return a.reduce(function(x,y){ return x+y; },0); }
function cum(a){ var s = 0; return a.map(function(v){ s += v; return QP.round(s, 1); }); }

QP.define('consolidated', {
  defaults:function(){ return {basis:'m', year:'2026', month:'5', trend:'overall', devB:'plan', corpB:'plan', project:'All', bu:'All', ap:'amount'}; },
  scope:function(){ return 'Qiddiya Investment Company'; },
  controls:function(s){
    var mi = MIDX[+s.month], ml = QP.mlabel(mi.y, mi.m);
    var segL = QP.persona.slug === 'hala' ? 'Month' : QP.MON[mi.m - 1];
    return QP.seg('basis', s.basis, [{v:'m', l:segL}, {v:'ytd', l:'YTD'}]) +
      QP.dd('year', 'Year', s.year, ['2026']) +
      QP.dd('month', 'Month', s.month, MIDX.map(function(x, i){ return {v:String(i), l:QP.mlabel(x.y, x.m)}; }));
  },
  body:function(s){
    var mi = +s.month, mo = MIDX[mi], ml = QP.mlabel(mo.y, mo.m), ytd = s.basis === 'ytd';
    var h = '';

    /* KPI cards */
    h += '<div class="qp-grid g6">' + KPIS.map(function(k){
      var base = k.sec != null ? k.sec : k.p, v = f.varPct(k.a, base);
      var val = k.hc ? f.i(k.a) : M(k.a, 1);
      var sub = k.sec != null
        ? 'YTD Secured <b>'+M(k.sec)+'</b> · FY Target <b>'+M(k.fy)+'</b>'
        : 'YTD Plan <b>'+(k.hc ? f.i(k.p) : M(k.p))+'</b> · YTD Forecast <b>'+(k.hc ? f.i(k.fc) : M(k.fc))+'</b>';
      return QP.kpi({label:k.k, info:k.info, value:val, sub:sub, status:k.st, chip:chip(v, {good:k.good || 'up', cls:k.good === 'none' ? 'amb' : null}) + '<span class="muted" style="font-size:var(--fs-sm)">vs '+(k.sec != null ? 'YTD secured' : 'YTD plan')+'</span>'});
    }).join('') + '</div>';

    /* area summaries */
    h += QP.eyebrow('Area Summaries', 'Open an area for its full dashboard');
    function view(id){ return QP.can(id) ? '<a class="qp-link ghost" href="'+QP.href(id)+'">View details'+QP.icon('arrowr')+'</a>' : '<span class="qp-link ghost" aria-disabled="true" data-tip="Outside your access">'+QP.icon('lock')+'View details</span>'; }
    function area(id, name, tag, col, lead, tiles, note){
      return '<article class="qp-area a-'+id+'" style="--ac:'+col+'"><div class="hdr"><div class="tt"><b>'+name+'</b><span>'+tag+'</span></div>'+view(id)+'</div>'+
        '<div class="bd">'+lead+'<div class="qp-tiles">'+tiles+'</div><div class="ft">'+note+'</div></div></article>';
    }
    /* headline figure of an area card; info adds an i button whose tooltip defines the measure */
    function lead(k, v, u, cmp, info){ return '<div class="lead"><div class="k">'+k+(info ? QP.infoBtn(k, info) : '')+'</div><div class="v">'+v+(u ? '<small>'+u+'</small>' : '')+'</div>'+(cmp ? '<div class="cmp">'+cmp+'</div>' : '')+'</div>'; }
    function vs(a, b, label, fmt, good){ return chip(f.varPct(a, b), {good:good || 'up'}) + '<span>vs '+label+' <b>'+fmt(b)+'</b></span>'; }
    /* tile against a reference figure: status edge and chip both come from the variance */
    function tref(k, v, a, b, label, fmt, o){ o = o || {}; var d = f.varPct(a, b);
      return QP.tile(k, v, label+' '+fmt(b)+chip(d, {good:o.good || 'up'}), o.tone || QP.tone(d, o.good || 'up'), o.cls); }
    var COMMIT = [{n:'Entertainment', v:1850.0, c:'var(--s1)'}, {n:'Master Development Unit', v:4620.0, c:'var(--s2)'}, {n:'Others', v:1442.4, c:'var(--s3)'}], cTot = 7912.4;
    var mK = function(v){ return M(v, 0) + ' K'; };
    h += '<div class="qp-row">' +
      area('development','Development','Business units · capital projects','var(--area-dev-bg)', lead('Work Performed', M(2080.0), 'M', null, 'Value of work completed on development projects in the selected period, year to date. Stated in '+f.SAR+' millions.'),
        QP.tile('Commitments · Total', M(cTot), '<span class="qp-comp" role="group" aria-label="Commitments by unit" style="flex:1 1 100%;display:flex">'+COMMIT.map(function(c){ var tip = c.n+': '+f.SAR+' '+f.n(c.v, 1)+' M · '+Math.round(c.v / cTot * 100)+'% of commitments'; return '<i style="flex:'+c.v+';background:'+c.c+'" tabindex="0" data-tip="'+QP.esc(tip)+'" aria-label="'+QP.esc(tip)+'"></i>'; }).join('')+'</span>'+
          '<span class="qp-comp-lb" aria-hidden="true">'+COMMIT.map(function(c){ return '<span style="flex:'+c.v+'" title="'+QP.esc(c.n)+'"><em>'+c.n+'</em><b>'+Math.round(c.v / cTot * 100)+'%</b></span>'; }).join('')+'</span>', 'neu', 'wide') +
        COMMIT.map(function(c){ return QP.tile('<i style="background:'+c.c+'"></i>Commitments · '+c.n, M(c.v), Math.round(c.v / cTot * 100)+'% of commitments', 'neu'); }).join('') +
        QP.tile('MoF', M(1640.0), 'Ministry of Finance funding', 'neu'), 'YTD · '+f.sar+' millions') +
      area('operating-assets','Operating Assets','Six Flags · Playmaker Studio · Aquarabia','var(--area-oa-bg)', lead('Revenue', M(51.9), 'M', vs(51.9, 51.2, 'budget', M), 'Total revenue generated by the operating assets during the period, year to date, against budget. Stated in '+f.SAR+' millions.'),
        tref('Visitation', f.i(214880), 214880, 207810, 'Budget', f.i) +
        QP.tile('Admission Yield %', M(168.40, 2), 'Admission revenue per guest', 'neu') +
        tref('Total per Cap (Excl. Partnership)', M(242.10, 2), 242.10, 238.50, 'Budget', function(v){ return M(v, 2); }) +
        QP.tile('Headcount', f.i(1284), '', 'neu') +
        tref('EBITDA', M(14.2)+'<small>M</small>', 14.2, 14.1, 'Budget', function(v){ return M(v)+' M'; }, {cls:'wide'}), 'YTD against budget') +
      '</div><div class="qp-row">' +
      area('corporate','Corporate','Central office · cost functions','var(--area-corp-bg)', lead('Work Performed', M(393.1), 'M', vs(393.1, 381.9, 'plan', M, 'down'), 'Corporate spend for the selected period, year to date, against the YTD plan. Stated in '+f.SAR+' millions.'),
        tref('Headcount', f.i(856), 856, 892, 'Plan', f.i, {good:'none', tone:'amb'}) +
        QP.tile('Initiatives', '23<small>live</small>', '4 behind schedule', 'amb'), 'YTD against plan · '+f.sar+' millions') +
      area('city-operations','City Operations','Shared services · Worker’s Village','var(--area-city-bg)', lead('Work Performed', M(31410, 0), 'K', vs(31410, 30760, 'plan', mK), 'City Operations spend for the selected period, year to date, against the YTD plan. Stated in '+f.SAR+' thousands.'),
        QP.tile('Worker’s Village Occupancy', '92%', '', 'neu') +
        QP.tile('Worker’s Village Revenue', M(4180, 0)+'<small>K</small>', '', 'neu') +
        QP.tile('Worker’s Village EBITDA', M(1120, 0)+'<small>K</small>', '', 'neu', 'wide'), 'YTD · '+f.sar+' thousands') +
      '</div>';

    /* monthly performance trend */
    var T = TREND[s.trend], idx = Math.min(mi, 5), ka = T.unit === 'K' ? 0 : 1;
    var ya = sum(T.actual.slice(0, idx + 1)), yp = sum(T.plan.slice(0, idx + 1));
    var fm = function(v){ return M(v, ka); };
    var meta = ytd
      ? 'Metric: <b>'+T.label+' ('+f.sar+' '+T.unit+')</b><span class="dot"></span>YTD Actual <b>'+fm(ya)+'</b><span class="dot"></span>YTD Plan <b>'+fm(yp)+'</b>'+(T.fc && idx === 5 ? '<span class="dot"></span>YTD Forecast <b>'+fm(T.fc)+'</b>' : '')
      : 'Metric: <b>'+T.label+' ('+f.sar+' '+T.unit+')</b><span class="dot"></span>'+ml+' Actual <b>'+fm(T.actual[idx])+'</b><span class="dot"></span>'+ml+' Plan <b>'+fm(T.plan[idx])+'</b>';
    h += QP.sec('Monthly Performance Trend', 'Six months to ' + ml, QP.seg('trend', s.trend, [{v:'overall',l:'Overall'},{v:'corporate',l:'Corporate'},{v:'development',l:'Development'},{v:'city',l:'City Ops'}], 'sm'));
    var off = s.trendOff || {};
    var tv = f.varPct(ytd ? ya : T.actual[idx], ytd ? yp : T.plan[idx]), tg = s.trend === 'corporate' ? 'down' : 'up';
    h += QP.card({status:QP.tone(tv, tg), body:'<div class="qp-meta">'+meta+'<span style="margin-left:auto">'+chip(tv, {good:tg, suffix:'vs plan'})+'</span></div><div class="qp-chart" id="c-trend"></div>'+
      QP.legendHtml([{l:'Actual / Predictor', c:TREND_C[s.trend], off:off[0]},{l:'Plan', c:'var(--plan)', off:off[1]},{l:'YTD Actual / Predictor', c:'var(--s7)', t:'ln', off:off[2]},{l:'YTD Plan', c:'var(--target)', t:'dash', off:off[3]}], 'trendOff'),
      foot:'Columns are monthly values on the left axis; lines are cumulative YTD on the right axis. Select a legend item to hide a series.'});

    /* development BUs + corporate cost items */
    var dB = s.devB, cB = s.corpB, mode = ytd ? 'YTD' : ml;
    var devRows = DEV_BU.map(function(r){
      var base = dB === 'plan' ? r.p : r.fc;
      var ac = QP.split(r.a, CBSW), bc = QP.split(base, CBSW);
      return {n:r.n, a:r.a, b:base, flag: f.varPct(r.a, base) < -10, children: CBS.map(function(c, i){ return {n:c, a:ac[i], b:bc[i]}; })};
    });
    var dT = {n:'Total', a:sum(DEV_BU.map(function(r){ return r.a; })), b:sum(devRows.map(function(r){ return r.b; }))};
    var bl = dB === 'plan' ? 'Plan' : 'Forecast';
    var devTbl = QP.table({id:'dev', rows:devRows, total:dT, cols:[
      {k:'n', label:'Business Unit'},
      {label:'YTD Actual ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.a); }},
      {label:'YTD '+bl+' ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.b); }},
      {label:'Variance %', cls:'r', fmt:function(r){ return chip(f.varPct(r.a, r.b)); }}
    ]});
    var corpRows = CORP.map(function(r){
      var a = ytd ? r.a : r.ma, b = ytd ? (cB === 'plan' ? r.p : r.fc) : (cB === 'plan' ? r.mp : QP.round(r.fc * r.ma / r.a, 1));
      var w = DEPTW[r.n], ac = QP.split(a, w), bc = QP.split(b, w);
      return {n:r.n, a:a, b:b, flag:f.varPct(a, b) > 15, children:DEPTS.map(function(d, i){ return {n:d, a:ac[i], b:bc[i]}; })};
    });
    var cT = {n:'Total', a:QP.round(sum(corpRows.map(function(r){ return r.a; })),1), b:QP.round(sum(corpRows.map(function(r){ return r.b; })),1)};
    var corpTbl = QP.table({id:'corp', rows:corpRows, total:cT, cols:[
      {k:'n', label:'Cost Category'},
      {label:mode+' Actual ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.a); }},
      {label:mode+' '+(cB === 'plan' ? 'Plan' : 'Forecast')+' ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.b); }},
      {label:'Variance %', cls:'r', fmt:function(r){ return chip(f.varPct(r.a, r.b), {good:'down'}); }}
    ]});
    h += QP.sec('Area Detail', 'Open a row to see the lines beneath it');
    h += '<div class="qp-row">' +
      QP.card({cls:'flush f1', title:'Development Business Units', sub:'Open a row to see the cost lines beneath it', rt:QP.seg('devB', dB, [{v:'forecast',l:'Forecast'},{v:'plan',l:'Plan'}], 'sm'),
        body:devTbl, foot:'Grain: business unit, then cost line. Measures are YTD actual against YTD '+bl.toLowerCase()+'.'+(ytd ? '' : ' Business units report cumulatively, so this table stays YTD.')}) +
      QP.card({cls:'flush f1', title:'Corporate Cost Items', sub:'Open a row to see the department beneath it', rt:QP.seg('corpB', cB, [{v:'forecast',l:'Forecast'},{v:'plan',l:'Plan'}], 'sm'),
        body:corpTbl, foot:'Grain: cost category, then department. Measures are '+(ytd ? 'YTD' : ml)+' actual against '+(ytd ? 'YTD' : ml)+' '+(cB === 'plan' ? 'plan' : 'forecast')+'. Cost over plan reads as adverse.'}) +
      '</div>';

    /* project status */
    var fp = PROJECTS.filter(function(p){ return (s.project === 'All' || p.n === s.project) && (s.bu === 'All' || p.bu === s.bu); });
    h += QP.sec('Project Status', 'Stage-gate position of the major contracts');
    h += QP.card({cls:'flush', body:QP.table({id:'ps', rows:PROJECTS.map(function(p){ return {p:p, sel:fp.length < PROJECTS.length && fp.indexOf(p) >= 0}; }), cols:[
      {label:'Project', fmt:function(r){ return r.p.n; }},
      {label:'Business Unit', fmt:function(r){ return r.p.bu; }},
      {label:'Contract Value ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.p.cv); }},
      {label:'MC Completion %', cls:'r', fmt:function(r){ return QP.bar(r.p.mc, 'var(--s1)'); }},
      {label:'Contingency Utilized %', cls:'r', fmt:function(r){ return QP.bar(r.p.cu, r.p.cu > 20 ? 'var(--amb)' : 'var(--s3)'); }}
    ]}), foot:'Grain: project. Completion and contingency are stated as percentages of contract value.'});

    /* project progress metrics */
    var pm = fp.length === PROJECTS.length || fp.length === 0 && s.project === 'All' && s.bu === 'All' ? {time:62, mc:71, acct:28} : (fp.length === 1 ? fp[0] : null);
    if (!pm && fp.length > 1) { var wv = sum(fp.map(function(p){ return p.cv; })); pm = {time:Math.round(sum(fp.map(function(p){ return p.time * p.cv; })) / wv), mc:Math.round(sum(fp.map(function(p){ return p.mc * p.cv; })) / wv), acct:Math.round(sum(fp.map(function(p){ return p.acct * p.cv; })) / wv)}; }
    var projOpts = [{v:'All', l:'All Projects'}].concat(PROJECTS.map(function(p){ return p.n; }));
    var buOpts = [{v:'All', l:'All Units'}].concat(['Entertainment','Sports','Retail','Residential']);
    h += QP.sec('Project Progress Metrics', fp.length === 1 ? fp[0].n + ' · ' + fp[0].bu : (s.project === 'All' && s.bu === 'All' ? 'All projects' : fp.length + ' projects'), QP.dd('project', 'Project', s.project, projOpts) + QP.dd('bu', 'Business Unit', s.bu, buOpts));
    if (pm) {
      var tone = function(v, ref){ return v >= ref ? 'var(--s1)' : 'var(--amb)'; };
      var ringCtx = function(v){ return 'vs time consumed <b>'+pm.time+'%</b>' + chip(v - pm.time, {dp:0, unit:' pt', signed:true, good:'up'}); };
      h += '<div class="qp-grid g3">' +
        /* each ring explains its own measure on hover or focus */
        QP.card({cls:'tight qp-hastip', tip:'Time consumed is calculated based on the project completion date.', body:QP.ring(pm.time, 'var(--s2)', 'Time Consumed', null, '<span class="muted">Elapsed share of the project schedule</span>')}) +
        QP.card({cls:'tight qp-hastip', tip:'Physical progress is measured completion.'+(pm.mc < pm.time ? ' It trails time consumed, so it is shown in amber.' : ''), body:QP.ring(pm.mc, pm.mc >= pm.time ? 'var(--s1)' : 'var(--amb)', 'Physical Progress', null, ringCtx(pm.mc))}) +
        QP.card({cls:'tight qp-hastip', tip:'Accounting progress is invoiced-to-date.', body:QP.ring(pm.acct, 'var(--s3)', 'Accounting Progress', null, ringCtx(pm.acct))}) + '</div>';
    } else {
      h += QP.card({body:'<div class="qp-empty">'+QP.icon('nomatch')+'No project matches this Project and Business Unit combination.</div>'});
    }

    /* workforce + headcount trend */
    var total = sum(WORKFORCE.map(function(w){ return w.value; }));
    h += QP.sec('Workforce', 'Month end, ' + ml);
    h += '<div class="qp-row">' +
      QP.card({cls:'f1', title:'Total Workforce Summary', sub:'All people working on Qiddiya City, by type', body:'<div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:22px"><div class="qp-chart" id="c-wf" style="width:200px;flex:none"></div><div class="qp-dl" style="flex:1 1 220px">'+
        WORKFORCE.map(function(w){ return '<div class="r"><i style="background:'+w.color+'"></i><span class="l">'+w.name+'</span><b>'+f.i(w.value)+'</b><em>'+Math.round(w.value / total * 100)+'%</em></div>'; }).join('')+'</div></div>'}) +
      QP.card({cls:'f15', title:'Qiddiya City Headcount Trend', sub:'Headcount, by business area', rt:'<span class="qp-badge">'+f.i(1842)+' at '+ml+'</span>', body:'<div class="qp-chart" id="c-hc"></div>'+
        QP.legendHtml([{l:'Actual · Development', c:'var(--area-dev)'},{l:'Actual · Corporate', c:'var(--area-corp)'},{l:'Actual · City Operations', c:'var(--area-city)'},{l:'Plan · Total', c:'var(--target)', t:'dash'}])}) +
      '</div>';

    /* accounts payable */
    var tot = [0,0,0,0,0,0]; APV.forEach(function(v){ v.b.forEach(function(x, i){ tot[i] += x; }); });
    var apTbl = QP.table({id:'ap', rows:APV, total:{n:'Total', b:tot}, cols:[{k:'n', label:'Vendor'}].concat(['Not Due','1-30','31-60','61-90','91-180','>180'].map(function(b, i){
      return {label:b+' ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.b[i]); }};
    })).concat([{label:'Total ('+f.sar+')', cls:'r', key:true, fmt:function(r){ return f.n(sum(r.b)); }}])});
    h += QP.sec('Accounts Payable', 'Balance by age bucket');
    h += '<div class="qp-row">' +
      QP.card({cls:'f1', title:'Accounts Payable Aging', sub:'Balance by age bucket, trend by month ('+(s.ap === 'amount' ? f.sar+' millions' : 'invoice count')+')', rt:QP.seg('ap', s.ap, [{v:'amount',l:'Amount'},{v:'count',l:'Count'}], 'sm'),
        body:'<div class="qp-chart" id="c-ap"></div>'+QP.legendHtml([{l:'Not Due', c:'var(--s1)'},{l:'Past Due ≤ 90 Days', c:'var(--s2)'},{l:'Past Due > 90 Days', c:'var(--neg)'}])}) +
      QP.card({cls:'flush f15', title:'Payables by Vendor', cap:ml + ' · '+f.sar+' millions', body:apTbl, foot:'Grain: vendor, aging bucket. Past due over 90 days totals '+M(tot[4] + tot[5])+' M.'}) +
      '</div>';
    return h;
  },
  mount:function(s){
    var mi = Math.min(+s.month, 5), T = TREND[s.trend], off = s.trendOff || {}, k = T.unit === 'K' ? 0 : 1;
    var fm = function(v){ return f.m(v, k).replace(/<[^>]+>/g,'') + ' ' + T.unit; };
    var cats = MONTHS.slice(0, mi + 1);
    QP.draw('c-trend', 'combo', {h:250, cats:cats, fmt:fm, y2:true, hl:mi,
      bars:[{name:'Actual / Predictor', color:TREND_C[s.trend], values:T.actual.slice(0, mi + 1), off:off[0]}, {name:'Plan', color:'var(--plan)', values:T.plan.slice(0, mi + 1), off:off[1]}],
      lines:[{name:'YTD Actual / Predictor', color:'var(--s7)', values:cum(T.actual).slice(0, mi + 1), axis:2, off:off[2], endLabel:function(v){ return f.n(v, k) + ' ' + T.unit; }},
             {name:'YTD Plan', color:'var(--target)', values:cum(T.plan).slice(0, mi + 1), axis:2, dash:'6 5', markers:false, off:off[3]}],
      tipTitle:function(i){ return MONTHS[i] + (i < 3 ? ' 2025' : ' 2026'); },
      extraTip:function(i){ var v = f.varPct(T.actual[i], T.plan[i]); return [{l:'Variance', v:(v > 0 ? '+' : '') + v.toFixed(1) + '%'}]; }});
    QP.draw('c-wf', 'donut', {items:WORKFORCE, size:196, center:f.i(5284), centerLabel:'Total workforce'});
    QP.draw('c-hc', 'combo', {h:236, cats:MONTHS, fmt:function(v){ return f.i(v); }, hl:5, maxBar:18, gap:.72,
      stack:true, labels:'all', bars:[{name:'Actual · Development', color:'var(--area-dev)', values:HC.dev}, {name:'Actual · Corporate', color:'var(--area-corp)', values:HC.corp}, {name:'Actual · City Operations', color:'var(--area-city)', values:HC.city}],
      lines:[{name:'Plan · Total', color:'var(--target)', values:HC.plan, dash:'6 5', markers:false}],
      extraTip:function(i){ return [{l:'Actual · Total', v:f.i(HC.corp[i] + HC.dev[i] + HC.city[i])}]; }});
    var A = AP[s.ap], amt = s.ap === 'amount';
    QP.draw('c-ap', 'stacked', {h:236, cats:MONTHS, fmt:function(v){ return amt ? f.n(v) : f.i(v); },
      series:[{name:'Not Due', color:'var(--s1)', values:A.nd}, {name:'Past Due ≤ 90 Days', color:'var(--s2)', values:A.le}, {name:'Past Due > 90 Days', color:'var(--neg)', values:A.gt}]});
  }
});
})();
