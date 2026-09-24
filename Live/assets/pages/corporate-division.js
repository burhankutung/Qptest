/* Corporate Divisions — one central-office division's cost against plan and forecast. */
(function(){
var f = QP.f, M = f.m, chip = QP.chip;
function sum(a){ return a.reduce(function(x,y){ return x+y; },0); }

/* Qiddiya Technology is reported in full. The other central-office
   divisions (Finance, HR, Procurement, Legal — per the sitemap) follow the same shape. */
var DIVS = {
  'Qiddiya Technology': {
    hc:17, hcp:18,
    rows:[
      {n:'Corporate Cost', m:[3.4,3.2], y:[6.6,6.4], fy:[12.8,12.5], kids:[
        {n:'Information Technology', m:[1.9,1.8], y:[3.7,3.6], fy:[7.2,7.0]},
        {n:'Professional Services', m:[0.5,0.4], y:[0.9,0.8], fy:[1.6,1.5]},
        {n:'Other corporate cost', m:[1.0,1.0], y:[2.0,2.0], fy:[4.0,4.0]}]},
      {n:'Personnel Cost', m:[3.1,3.0], y:[6.1,6.0], fy:[12.0,11.5], kids:[
        {n:'Salaries & wages', m:[2.2,2.1], y:[4.3,4.2], fy:[8.5,8.1]},
        {n:'Allowances', m:[0.6,0.6], y:[1.2,1.2], fy:[2.3,2.2]},
        {n:'GOSI & benefits', m:[0.3,0.3], y:[0.6,0.6], fy:[1.2,1.2]}]}
    ],
    kpi:{prof:[1.5,1.4], it:[1.9,1.8]},
    init:[{n:'Cybersecurity uplift', s:'01/01/2026', e:'31/03/2027', c:'Information Technology', st:'Not Started', b:1200},
          {n:'Data platform migration', s:'26/01/2026', e:'31/12/2026', c:'Information Technology', st:'Ongoing, at risk', b:900}],
    ap:[{n:'Cloudline Systems', b:[12,4,0,0]}, {n:'SecureNet KSA', b:[8,2,1,0]}, {n:'All others', b:[8,2,0,0]}]
  }
};
/* derive the other divisions from their share of central-office cost */
[['Finance',.82,1.03,21,'ERP close automation','Treasury management system','Ledgerline Advisory','Najd Audit Partners'],
 ['Human Resources',.74,.97,24,'Talent acquisition platform','Leadership academy','TalentBridge Arabia','Peoplework Services'],
 ['Procurement',.46,1.08,12,'Supplier portal rollout','Category strategy refresh','SupplyPoint KSA','Tender Hub Services'],
 ['Legal',.38,.95,9,'Contract lifecycle management','Regulatory register','Al-Qanun Legal Associates','Docufile Records']].forEach(function(d){
  var base = DIVS['Qiddiya Technology'], k = d[1], drift = d[2];
  function sc(pair, dr){ return [QP.round(pair[0] * k * dr, 1), QP.round(pair[1] * k, 1)]; }
  DIVS[d[0]] = {hc:d[3], hcp:d[3] + (drift > 1 ? 1 : -1),
    rows:base.rows.map(function(r, ri){ var dr = ri ? 1 + (drift - 1) * .5 : drift;
      return {n:r.n, m:sc(r.m, dr), y:sc(r.y, dr), fy:[QP.round(r.fy[0] * k, 1), QP.round(r.fy[1] * k * (1 + (drift - 1) * .4), 1)], kids:r.kids.map(function(c){ return {n:c.n === 'Information Technology' ? 'Systems & licences' : c.n, m:sc(c.m, dr), y:sc(c.y, dr), fy:[QP.round(c.fy[0] * k, 1), QP.round(c.fy[1] * k * (1 + (drift - 1) * .4), 1)]}; })}; }),
    kpi:{prof:sc(base.kpi.prof, drift), it:sc(base.kpi.it, 1 + (drift - 1) * .6)},
    init:[{n:d[4], s:'01/02/2026', e:'31/12/2026', c:'Professional Services', st:drift > 1.05 ? 'Ongoing, at risk' : 'On track', b:Math.round(700 * k / 10) * 10},
          {n:d[5], s:'01/04/2026', e:'31/03/2027', c:'Personnel Cost', st:'Not Started', b:Math.round(420 * k / 10) * 10}],
    ap:[{n:d[6], b:[Math.round(12 * k), Math.round(4 * k), drift > 1.05 ? 1 : 0, 0]}, {n:d[7], b:[Math.round(8 * k), Math.round(2 * k), 0, 0]}, {n:'All others', b:[Math.round(8 * k), Math.round(2 * k), 0, 0]}]
  };
});

function stat(v, t1, t2){ return v > t2 ? 'neg' : v > t1 ? 'amb' : 'pos'; }
function statLabel(st){ return st === 'neg' ? 'Underperforming' : st === 'amb' ? 'At risk' : st === 'pos' ? 'On track' : 'No data'; }

QP.define('corporate-division', {
  filterKeys:['basis','from','to','division'],
  defaults:function(){ var l = QP.persona.lock; return {basis:'m', from:'2026-02-01', to:'2026-02-28', division:l && l.division || 'Qiddiya Technology', rep:'m'}; },
  onSet:function(s, k, v){ if (k === 'basis') { var r = QP.periodRange(2026, 2, v === 'ytd' ? 'ytd' : 'm'); s.from = r.from; s.to = r.to; s.rep = v === 'ytd' ? 'ytd' : 'm'; } },
  scope:function(s){ return s.division; },
  controls:function(s){
    var lock = QP.persona.lock && QP.persona.lock.division;
    var tabs = QP.can('corporate') ? QP.seg('tab', 'corporate-division', [{v:'corporate', l:'Corporate'}, {v:'corporate-division', l:'Corporate Division'}], 'tabs') : '';
    return tabs + QP.seg('basis', s.basis, [{v:'m', l:'Feb'}, {v:'ytd', l:'YTD'}]) + QP.dates(s.from, s.to, 'from', 'to') +
      QP.dd('division', 'Division', s.division, Object.keys(DIVS), {locked: lock ? 'Your access is limited to the Qiddiya Technology division' : null}) +
      QP.clearBtn(QP.dirty());
  },
  body:function(s){
    var D = DIVS[s.division], h = '', key = s.rep === 'ytd' ? 'y' : s.rep === 'fy' ? 'fy' : 'm';
    var ytd = s.basis === 'ytd', pk = ytd ? 'y' : 'm';
    var totA = QP.round(sum(D.rows.map(function(r){ return r[pk][0]; })), 1), totP = QP.round(sum(D.rows.map(function(r){ return r[pk][1]; })), 1);
    var pers = D.rows[1][pk];
    var kp = ytd ? [QP.round(D.kpi.prof[0] * 1.95, 1), QP.round(D.kpi.prof[1] * 1.96, 1)] : D.kpi.prof;
    var ki = ytd ? [QP.round(D.kpi.it[0] * 1.95, 1), QP.round(D.kpi.it[1] * 1.96, 1)] : D.kpi.it;
    function tile(label, a, p, t1, t2){
      var v = f.varPct(a, p), st = stat(v, t1, t2), mx = Math.max(a, p) * 1.12;
      return QP.kpi({label:label, st:QP.pill(statLabel(st), st), value:M(a), unit:'M', sub:'Plan <b>'+M(p)+' M</b>', status:st,
        chip:chip(v, {good:'down', suffix:v >= 0 ? 'over plan' : 'under plan'}),
        meter:'<div class="meter" style="position:relative;overflow:visible"><span style="width:'+(a/mx*100)+'%;background:'+(st === 'pos' ? 'var(--s1)' : 'var(--'+st+')')+';border-radius:99px"></span><i style="position:absolute;left:'+(p/mx*100)+'%;top:-4px;bottom:-4px;border-left:2px dashed var(--target)"></i></div>'});
    }
    h += QP.eyebrow(s.division + ' · cost against plan', (ytd ? 'YTD to Feb-26' : 'Feb-26') + ' · ' + f.sar + ' millions · dashed marker = plan');
    h += '<div class="qp-grid g5">' + tile('Total', totA, totP, 5, 10) + tile('Personnel Cost', pers[0], pers[1], 5, 10) + tile('Professional Svcs', kp[0], kp[1], 5, 15) + tile('IT Cost', ki[0], ki[1], 6, 15) +
      QP.kpi({label:'Headcount', st:QP.pill('No data', 'neu'), value:f.i(D.hc), sub:'Plan <b>'+f.i(D.hcp)+'</b>', status:'neu', chip:'<span class="muted" style="font-size:var(--fs-sm)">Status not set for headcount</span>'}) + '</div>';

    /* division cost report */
    var lbl = key === 'm' ? 'Feb-26' : key === 'y' ? 'YTD' : 'FY';
    var rows = D.rows.map(function(r){
      var a = key === 'fy' ? r.fy[1] : r[key][0], p = key === 'fy' ? r.fy[0] : r[key][1];
      return {n:r.n, a:a, p:p, fyp:r.fy[0], fyf:r.fy[1], children:r.kids.map(function(c){ var ca = key === 'fy' ? c.fy[1] : c[key][0], cp = key === 'fy' ? c.fy[0] : c[key][1]; return {n:c.n, a:ca, p:cp, fyp:c.fy[0], fyf:c.fy[1], flag:Math.abs(f.varPct(ca, cp)) > 15}; })};
    });
    var tot = {n:'Total'}; ['a','p','fyp','fyf'].forEach(function(k){ tot[k] = QP.round(sum(rows.map(function(r){ return r[k]; })), 1); });
    var flagged = []; rows.forEach(function(r){ r.children.forEach(function(c){ if (c.flag) flagged.push(c.n); }); });
    h += QP.sec('Division Cost Report', 'Open a row to see the cost lines beneath it', QP.seg('rep', s.rep, [{v:'m', l:'Feb-26'}, {v:'ytd', l:'YTD'}, {v:'fy', l:'Full Year'}], 'sm'));
    h += QP.card({cls:'flush', body:QP.table({id:'dcr', rows:rows, total:tot, cols:[
      {k:'n', label:'Cost Category'},
      {label:(key === 'fy' ? 'FY Forecast' : lbl + ' Actual')+' ('+f.sar+')', cls:'r', band:true, fmt:function(r){ return f.n(r.a); }},
      {label:(key === 'fy' ? 'FY Plan' : lbl + ' Plan')+' ('+f.sar+')', cls:'r', band:true, fmt:function(r){ return f.n(r.p); }},
      {label:'Variance', cls:'r', band:true, fmt:function(r){ return chip(f.varPct(r.a, r.p), {good:'down'}); }},
      {label:'FY Plan ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.fyp); }},
      {label:'FY Forecast ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.fyf); }}
    ]}), foot:'Grain: cost category, monthly.'+(flagged.length ? ' '+flagged.join(', ')+' flagged — variance exceeds 15%.' : ' No cost line exceeds the 15% variance threshold.')});

    /* initiatives */
    h += QP.sec('Initiatives Report', D.init.length + ' initiatives tied to this division');
    h += QP.card({cls:'flush', body:QP.table({id:'dini', rows:D.init.map(function(r){ return {r:r, flag:/risk/.test(r.st)}; }), cols:[
      {label:'Initiative', fmt:function(x){ return x.r.n; }}, {label:'Start Date', fmt:function(x){ return x.r.s; }}, {label:'End Date', fmt:function(x){ return x.r.e; }},
      {label:'Cost Category', fmt:function(x){ return x.r.c; }},
      {label:'MC Status', fmt:function(x){ return QP.pill(x.r.st, /risk/.test(x.r.st) ? 'amb' : /Not/.test(x.r.st) ? 'neu' : 'pos'); }},
      {label:'FY Budget ('+f.sar+' K)', cls:'r', fmt:function(x){ return f.i(x.r.b); }}
    ]}), foot:'Grain: initiative, monthly.'});

    /* AP */
    var bt = [0,0,0,0]; D.ap.forEach(function(v){ v.b.forEach(function(x, i){ bt[i] += x; }); });
    h += QP.sec('Accounts Payable by Vendor', 'Feb-26 · ' + f.sar + ' thousands');
    h += '<div class="qp-row">' +
      QP.card({cls:'f1', title:'Aging profile', sub:'Share of the division’s payables by age bucket', body:'<div class="qp-chart" id="dv-ap"></div>'+QP.legendHtml([{l:'Not Due', c:'var(--s1)'},{l:'1-30', c:'var(--s2)'},{l:'31-60', c:'var(--amb)'},{l:'>90', c:'var(--neg)'}])}) +
      QP.card({cls:'flush f2', body:QP.table({id:'dap', rows:D.ap, total:{n:'Total', b:bt}, cols:[{k:'n', label:'Vendor'}].concat(['Not Due','1-30','31-60','>90'].map(function(b, i){
        return {label:b+' ('+f.sar+')', cls:'r', fmt:function(r){ return f.i(r.b[i]); }}; })).concat([{label:'Total ('+f.sar+')', cls:'r', key:true, fmt:function(r){ return f.i(sum(r.b)); }}])}),
        foot:'Grain: vendor, aging bucket. Total reconciles to Total Commitments outstanding.'}) +
      '</div>';
    return h;
  },
  mount:function(s){
    var D = DIVS[s.division], bt = [0,0,0,0]; D.ap.forEach(function(v){ v.b.forEach(function(x, i){ bt[i] += x; }); });
    var cols = ['var(--s1)','var(--s2)','var(--amb)','var(--neg)'], names = ['Not Due','1-30','31-60','>90'];
    QP.draw('dv-ap', 'donut', {items:bt.map(function(v, i){ return {name:names[i], value:v || 0.0001, color:cols[i]}; }).filter(function(d){ return d.value >= 1; }), size:170, thick:22, center:M(sum(bt), 0).replace(/<[^>]+>/g, ''), centerLabel:'Total payables (K)', valueLabel:'Balance (K)'});
  }
});
QP.DEFS['corporate-division']._open = {'dcr-0':true};
})();
