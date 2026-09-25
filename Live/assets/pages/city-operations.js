/* City Operations — shared-service assets, stated in thousands. */
(function(){
var f = QP.f, M = f.m, chip = QP.chip;
function sum(a){ return a.reduce(function(x,y){ return x+y; },0); }
var K = function(v){ return f.i(v); };

var OCC = [
  {n:'Third Party Contractors', v:[92,90,88]},
  {n:'Six Flags & Aquarabia', v:[88,86,84]},
  {n:'QIC direct', v:[94,93,91]}
];
var OCC_T = [92,90,88];
var REV = [
  {n:'Third Party Contractors', a:18420, ly:17100},
  {n:'Six Flags & Aquarabia', a:9860, ly:9240},
  {n:'QIC direct', a:3130, ly:3010}
];
/* P&L, January 2026 (YTD equals January as the first month of the year) */
var PL = [
  {n:'Revenue', a:31410, b:30760, good:'up', kids:[{n:'Third Party Contractors', a:18420, b:18000}, {n:'Six Flags & Aquarabia', a:12990, b:12760}]},
  {n:'Expense', a:27230, b:27880, good:'down', kids:[{n:'General and Administrative Costs', a:9140, b:9400}, {n:'Personnel Expenses', a:13460, b:13800}, {n:'QIC Cross charge (IT & Admin Support)', a:4630, b:4680}]},
  {n:'Operating Income/(Loss)', a:4180, b:2880, good:'up', cls:'sub'},
  {n:'Depreciation', a:-1240, b:-1240, good:'up'},
  {n:'Net Income/(Loss)', a:2940, b:1640, good:'up', cls:'net'}
];

QP.define('city-operations', {
  defaults:function(){ return {asset:'wv', basis:'m', year:'2026', month:'1'}; },
  scope:function(){ return 'Worker’s Village'; },
  controls:function(s){
    return QP.seg('asset', s.asset, [{v:'wv', l:'Worker Village'}], 'tabs') + QP.seg('basis', s.basis, [{v:'m', l:'Jan'}, {v:'ytd', l:'YTD'}]) +
      QP.dd('year', 'Year', s.year, ['2026']) + QP.dd('month', 'Month', s.month, [{v:'1', l:'January'}]);
  },
  body:function(s){
    var h = '', ytd = s.basis === 'ytd';
    var tr = sum(REV.map(function(r){ return r.a; })), tly = sum(REV.map(function(r){ return r.ly; }));
    h += '<div class="qp-grid g4">' +
      QP.kpi({label:'Occupancy', value:'92%', sub:'Dec 2025 <b>90%</b> · Nov 2025 <b>88%</b>', status:'pos', chip:chip(2, {unit:' pt', suffix:'vs Dec'})}) +
      QP.kpi({label:'Revenue', value:M(31410, 0), unit:'K', sub:'Budget <b>'+M(30760, 0)+' K</b>', status:'pos', chip:chip(f.varPct(31410, 30760), {suffix:'vs budget'})}) +
      QP.kpi({label:'Operating Income/(Loss)', value:M(4180, 0), unit:'K', sub:'Budget <b>'+M(2880, 0)+' K</b>', status:'pos', chip:chip(f.varPct(4180, 2880), {suffix:'vs budget'})}) +
      QP.kpi({label:'Net Income/(Loss)', value:M(2940, 0), unit:'K', sub:'Budget <b>'+M(1640, 0)+' K</b>', status:'pos', chip:chip(f.varPct(2940, 1640), {suffix:'vs budget'})}) +
      '</div>';

    h += '<div class="qp-row" style="margin-top:16px">' +
      QP.card({cls:'flush f1', title:'Occupancy (%)', cap:'Percent', body:QP.table({id:'occ', rows:OCC, total:{n:'Total', v:OCC_T},
        groups:[{span:1},{span:3, label:'Last three months'},{span:1, label:'Jan 2026 vs Dec 2025'}], cols:[
        {k:'n', label:'Partners'},
        {label:'Jan 2026', cls:'r', band:true, fmt:function(r){ return QP.bar(r.v[0], 'var(--s1)'); }},
        {label:'Dec 2025', cls:'r', fmt:function(r){ return r.v[1] + '%'; }},
        {label:'Nov 2025', cls:'r', fmt:function(r){ return r.v[2] + '%'; }},
        {label:'Variance', cls:'r', fmt:function(r){ return chip(f.varPct(r.v[0], r.v[1])); }}
      ]}), foot:'Grain: partner. Variance compares January against December.'}) +
      QP.card({cls:'flush f1', title:'Revenue Breakdown', cap:'Thousands', body:QP.table({id:'rev', rows:REV, total:{n:'Total', a:tr, ly:tly},
        groups:[{span:1},{span:2, label:'Jan 2026 vs Jan 2025'},{span:1}], cols:[
        {k:'n', label:'Partners'},
        {label:'Jan 2026 ('+f.sar+')', cls:'r', band:true, fmt:function(r){ return K(r.a); }},
        {label:'Jan 2025 ('+f.sar+')', cls:'r', fmt:function(r){ return K(r.ly); }},
        {label:'Variance', cls:'r', fmt:function(r){ return chip(f.varPct(r.a, r.ly)); }}
      ]}), foot:'Grain: partner. Both blocks compare against the same month last year.'}) +
      '</div>';

    /* P&L */
    function cols(prefix, band){
      return [
        {label:'Actual ('+f.sar+')', cls:'r', band:band, fmt:function(r){ return K(r.a); }},
        {label:'Budget ('+f.sar+')', cls:'r', band:band, fmt:function(r){ return K(r.b); }},
        {label:'Variance ('+f.sar+')', cls:'r', band:band, fmt:function(r){ return chip(r.a - r.b, {dp:0, unit:'', good:r.good || 'up'}); }},
        {label:'Variance %', cls:'r', band:band, fmt:function(r){ return chip(f.varPct(r.a, r.b), {good:r.good || 'up'}); }}
      ];
    }
    var rows = PL.map(function(r){ return {n:r.n, a:r.a, b:r.b, good:r.good, cls:r.cls === 'net' ? 'tot' : '', children:(r.kids || []).map(function(k){ return {n:k.n, a:k.a, b:k.b, good:r.good}; })}; });
    h += QP.sec('P&L', 'Thousands · Revenue and Expense open to their lines');
    h += QP.card({cls:'flush', body:QP.table({id:'pl', expLabel:'Lines', rows:rows, groups:[{span:1},{span:4, label:'Jan 2026', band:!ytd},{span:4, label:'YTD', band:ytd}],
      cols:[{k:'n', label:'Category'}].concat(cols('m', !ytd), cols('y', ytd))}),
      foot:'Grain: category, then line. Expense below budget reads as favourable. YTD equals January as the first closed month of 2026.'});
    return h;
  }
});
QP.DEFS['city-operations']._open = {'pl-0':true, 'pl-1':true};
})();
