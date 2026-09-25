/* Corporate — central-office cost by category against plan. */
(function(){
var f = QP.f, M = f.m, chip = QP.chip;
function sum(a){ return a.reduce(function(x,y){ return x+y; },0); }
function split(total, w){ var s = sum(w), acc = 0; return w.map(function(x, i){ var v = i === w.length - 1 ? QP.round(total - acc, 1) : QP.round(total * x / s, 1); acc += v; return v; }); }

var CATS = [
  {n:'Personnel Cost', kpi:'Personnel Cost', ma:30.4, mp:29.6, a:121.9, p:118.4, fyp:355.0, fyf:362.0},
  {n:'Information Technology', kpi:'Information Technology Cost', ma:22.1, mp:21.6, a:88.7, p:86.2, fyp:258.0, fyf:264.0},
  {n:'Professional Services', kpi:'Professional Services Cost', ma:15.3, mp:13.2, a:61.2, p:52.8, fyp:158.0, fyf:184.0},
  {n:'Marketing & Events', kpi:'Marketing & Events Costs', ma:8.4, mp:9.0, a:33.8, p:35.9, fyp:108.0, fyf:102.0},
  {n:'General & Administration', kpi:'General & Administration Costs', ma:15.4, mp:15.4, a:61.4, p:61.6, fyp:184.0, fyf:184.0},
  {n:'Others', ma:6.5, mp:6.8, a:26.1, p:27.0, fyp:81.0, fyf:78.0}
];
var LINES = {
  'Personnel Cost':['Salaries & wages','Allowances','GOSI & benefits','Training'],
  'Information Technology':['Software licences','Cloud & hosting','IT support services','Hardware'],
  'Professional Services':['Consulting','Legal advisory','Audit & assurance','Recruitment fees'],
  'Marketing & Events':['Brand campaigns','Events & sponsorship','Digital media','Research'],
  'General & Administration':['Rent & facilities','Utilities','Travel','Office services'],
  'Others':['Insurance','Bank charges','Memberships','Sundry']
};
var LW = [.46,.24,.18,.12];
var INIT = [
  {n:'Workplace consolidation', s:'01/02/2026', e:'30/11/2026', c:'General & Administration', st:'Behind schedule', b:24.0, ab:22.0},
  {n:'Supplier onboarding programme', s:'15/01/2026', e:'31/10/2026', c:'Professional Services', st:'Behind schedule', b:18.0, ab:18.0},
  {n:'Payroll migration', s:'01/03/2026', e:'31/12/2026', c:'Information Technology', st:'On schedule', b:14.0, ab:14.0},
  {n:'Network build — phase two', s:'01/01/2026', e:'30/09/2026', c:'Information Technology', st:'On schedule', b:32.0, ab:30.0},
  {n:'Records digitisation', s:'01/04/2026', e:'31/12/2026', c:'General & Administration', st:'On schedule', b:9.0, ab:9.0}
];
var MONTHS = ['Oct','Nov','Dec','Jan','Feb','Mar'];
var TREND = {perf:[55.2,57.4,58.9,60.3,63.2,98.1], plan:[54.8,56.9,58.1,57.4,59.1,95.6], hc:[812,821,830,838,847,856]};
var APF = [
  {n:'Personnel', b:[6.4,3.1,4.0,0.4]}, {n:'Information Technology', b:[5.2,2.8,3.6,0.3]}, {n:'Professional Services', b:[4.1,2.2,2.9,0.2]},
  {n:'Marketing & Events', b:[2.2,1.2,1.6,0.1]}, {n:'General & Administration', b:[3.1,1.6,1.9,0.4]}
];
var APM = {nd:[17.2,18.0,18.9,19.6,20.4,21.0], le:[21.4,22.3,23.1,23.8,24.5,24.9], gt:[1.9,1.8,1.6,1.5,1.4,1.4]};

QP.define('corporate', {
  defaults:function(){ return {basis:'ytd', from:'2026-01-01', to:'2026-03-31', rep:'ytd', trend:'perf'}; },
  onSet:function(s, k, v){ if (k === 'basis') { var r = QP.periodRange(2026, 3, v === 'ytd' ? 'ytd' : 'm'); s.from = r.from; s.to = r.to; s.rep = v === 'ytd' ? 'ytd' : 'm'; } },
  scope:function(){ return 'Central office'; },
  controls:function(s){
    var tabs = QP.can('corporate-division') ? QP.seg('tab', 'corporate', [{v:'corporate', l:'Corporate'}, {v:'corporate-division', l:'Corporate Division'}], 'tabs') : '';
    return tabs + QP.seg('basis', s.basis, [{v:'m', l:'Mar'}, {v:'ytd', l:'YTD'}]) + QP.dates(s.from, s.to, 'from', 'to');
  },
  body:function(s){
    var ytd = s.basis === 'ytd', h = '';
    var A = function(c){ return ytd ? c.a : c.ma; }, P = function(c){ return ytd ? c.p : c.mp; };
    var tA = QP.round(sum(CATS.map(A)), 1), tP = QP.round(sum(CATS.map(P)), 1);
    function card(label, a, p, id){
      var v = f.varPct(a, p), st = v > 10 ? 'neg' : v > 0 ? 'amb' : 'pos';
      return QP.kpi({label:label, value:M(a), unit:'M', sub:'Plan <b>'+M(p)+'</b>', status:st, chip:chip(v, {good:'down'}), id:id});
    }
    h += '<div class="qp-grid g4">' + card('Total', tA, tP) +
      CATS.slice(0, 5).map(function(c){ return card(c.kpi, A(c), P(c)); }).join('') +
      QP.kpi({label:'Initiatives', status:'amb', pair:'<div class="pair"><div><b>23</b><span>Live</span></div><div class="neg"><b>4</b><span>Behind schedule</span></div></div>',
        meter:'<div class="meter"><span style="width:'+(19/23*100)+'%;background:var(--pos)"></span><span style="width:'+(4/23*100)+'%;background:var(--neg)"></span></div>', sub:'<b>83%</b> of live initiatives on schedule'}) +
      QP.kpi({label:'Headcount', value:f.i(856), sub:'Plan <b>'+f.i(892)+'</b>', status:'amb', chip:chip(f.varPct(856, 892), {good:'none', cls:'amb'}) + '<span class="muted" style="font-size:var(--fs-sm)">36 open positions</span>'}) +
      '</div>';

    /* division cost report */
    var rows = CATS.map(function(c){
      var kids = LINES[c.n].map(function(ln, i){ return {n:ln}; });
      var parts = {ma:split(c.ma, LW), mp:split(c.mp, LW), a:split(c.a, LW), p:split(c.p, LW), fyp:split(c.fyp, LW), fyf:split(c.fyf, LW)};
      kids.forEach(function(k, i){ for (var key in parts) k[key] = parts[key][i]; });
      var o = {n:c.n, ma:c.ma, mp:c.mp, a:c.a, p:c.p, fyp:c.fyp, fyf:c.fyf, children:kids};
      o.flag = f.varPct(s.rep === 'm' ? c.ma : s.rep === 'fy' ? c.fyf : c.a, s.rep === 'm' ? c.mp : s.rep === 'fy' ? c.fyp : c.p) > 15;
      return o;
    });
    var tot = {n:'Total'}; ['ma','mp','a','p','fyp','fyf'].forEach(function(k){ tot[k] = QP.round(sum(CATS.map(function(c){ return c[k]; })), 1); });
    var bM = s.rep === 'm', bY = s.rep === 'ytd', bF = s.rep === 'fy';
    var cols = [
      {k:'n', label:'Cost Category'},
      {label:'Actual ('+f.sar+')', cls:'r', band:bM, fmt:function(r){ return f.n(r.ma); }},
      {label:'Plan ('+f.sar+')', cls:'r', band:bM, fmt:function(r){ return f.n(r.mp); }},
      {label:'Variance', cls:'r', band:bM, fmt:function(r){ return chip(f.varPct(r.ma, r.mp), {good:'down'}); }},
      {label:'Actual ('+f.sar+')', cls:'r', band:bY, fmt:function(r){ return f.n(r.a); }},
      {label:'Plan ('+f.sar+')', cls:'r', band:bY, fmt:function(r){ return f.n(r.p); }},
      {label:'Variance', cls:'r', band:bY, fmt:function(r){ return chip(f.varPct(r.a, r.p), {good:'down'}); }},
      {label:'FY Plan ('+f.sar+')', cls:'r', band:bF, fmt:function(r){ return f.n(r.fyp); }},
      {label:'FY Forecast ('+f.sar+')', cls:'r', band:bF, fmt:function(r){ return f.n(r.fyf); }}
    ];
    h += QP.sec('Division Cost Report', 'Open a row to see the department beneath it', QP.seg('rep', s.rep, [{v:'m', l:'Selected Month'}, {v:'ytd', l:'YTD'}, {v:'fy', l:'Full Year'}], 'sm'));
    h += QP.card({cls:'flush', body:QP.table({id:'cr', rows:rows, total:tot, cols:cols, groups:[{span:1},{span:3, label:'Selected month · Mar-26', band:bM},{span:3, label:'Year to date', band:bY},{span:2, label:'Full year 2026', band:bF}]}),
      foot:'Grain: cost category, then cost line. Full-year forecast is hand-authored; actuals are system-fed. Categories more than 15% over plan in the highlighted period are marked.'});

    /* initiatives */
    h += QP.sec('Initiatives Report', '23 live, 4 behind schedule');
    h += QP.card({cls:'flush', body:QP.table({id:'ini', rows:INIT.map(function(r){ r.flag = r.st !== 'On schedule'; return r; }), cols:[
      {k:'n', label:'Initiative'}, {k:'s', label:'Start Date'}, {k:'e', label:'End Date'}, {k:'c', label:'Cost Category'},
      {label:'PC Status', fmt:function(r){ return QP.pill(r.st, r.st === 'On schedule' ? 'pos' : 'neg'); }},
      {label:'PC Budget ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.b); }},
      {label:'PC Approved Budget ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.ab); }},
      {label:'Approved vs Budget', cls:'r', fmt:function(r){ return r.ab < r.b ? chip(f.varPct(r.ab, r.b), {good:'none', cls:'amb'}) : '<span class="muted">Fully approved</span>'; }}
    ]}), foot:'Grain: initiative. Five largest initiatives shown; behind-schedule rows are marked.'});

    /* performance + trend */
    var perf = s.trend === 'perf';
    h += QP.sec('Performance & Trend', f.sar + ' millions');
    h += '<div class="qp-row">' +
      QP.card({cls:'f1', title:'Performance', sub:'YTD corporate cost against plan and forecast',
        body:'<div class="qp-big"><span class="v">'+M(393.1)+'</span><span class="u">M</span>'+chip(f.varPct(393.1, 381.9), {good:'down', suffix:'vs plan'})+'</div><div class="qp-sub2">Plan <b>'+M(381.9)+'</b> · Forecast <b>'+M(402.0)+'</b></div>'+
          '<div class="qp-bullet"><div class="r"'+QP.tipAttr('Actual '+f.SAR+' 393.1 M: '+f.SAR+' '+f.n(393.1 - 381.9)+' M (+'+f.n(f.varPct(393.1, 381.9))+'%) over the YTD plan')+'><span class="l">Actual</span><span class="tk"><i style="width:'+(393.1/420*100)+'%;background:var(--area)"></i><span class="tick" style="left:'+(381.9/420*100)+'%"'+QP.tipAttr('Plan marker: '+f.SAR+' 381.9 M YTD plan')+'></span></span><span class="v">393.1</span></div>'+
          '<div class="r"'+QP.tipAttr('YTD plan '+f.SAR+' 381.9 M')+'><span class="l">Plan</span><span class="tk"><i style="width:'+(381.9/420*100)+'%;background:var(--plan)"></i></span><span class="v">381.9</span></div>'+
          '<div class="r"'+QP.tipAttr('Forecast '+f.SAR+' 402.0 M: '+f.SAR+' '+f.n(402.0 - 393.1)+' M above actual')+'><span class="l">Forecast</span><span class="tk"><i style="width:'+(402/420*100)+'%;background:var(--s4)"></i></span><span class="v">402.0</span></div></div>',
        foot:'Cost is '+M(11.2)+' M over plan; the forecast absorbs a further '+M(8.9)+' M.'}) +
      QP.card({cls:'f15', title:'Monthly Trend', sub:perf ? 'Monthly corporate cost ('+f.sar+' M) with plan' : 'Corporate headcount at month end', rt:QP.seg('trend', s.trend, [{v:'perf',l:'Performance'},{v:'hc',l:'Headcount'}], 'sm'),
        body:'<div class="qp-chart" id="k-trend"></div>'+QP.legendHtml(perf ? [{l:'Monthly', c:'var(--area)'},{l:'Plan', c:'var(--target)', t:'dash'},{l:'Trend', c:'var(--s3)', t:'ln'}] : [{l:'Monthly', c:'var(--area)'},{l:'Trend', c:'var(--s3)', t:'ln'}])}) +
      '</div>';

    /* AP */
    var bt = [0,0,0,0]; APF.forEach(function(v){ v.b.forEach(function(x, i){ bt[i] += x; }); });
    h += QP.sec('Accounts Payable', 'By function, '+f.sar+' millions');
    h += '<div class="qp-row">' +
      QP.card({cls:'f1', title:'Accounts Payable Aging', sub:'Balance by age bucket, by month', body:'<div class="qp-chart" id="k-ap"></div>'+QP.legendHtml([{l:'Not Due', c:'var(--s1)'},{l:'Past Due ≤ 90 Days', c:'var(--s2)'},{l:'Past Due > 90 Days', c:'var(--neg)'}])}) +
      QP.card({cls:'flush f15', title:'Payables by Function', cap:'Mar-26', body:QP.table({id:'kap', rows:APF, total:{n:'Total', b:bt}, cols:[{k:'n', label:'Function'}].concat(['Not Due','1-30','31-90','91-180'].map(function(b, i){
        return {label:b+' ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.b[i]); }}; })).concat([{label:'Total ('+f.sar+')', cls:'r', key:true, fmt:function(r){ return f.n(sum(r.b)); }}])}),
        foot:'Grain: function, aging bucket. Total reconciles to the March column.'}) +
      '</div>';
    return h;
  },
  mount:function(s){
    var perf = s.trend === 'perf', v = perf ? TREND.perf : TREND.hc;
    var n = v.length, xs = v.map(function(_, i){ return i; }), mx = sum(xs) / n, my = sum(v) / n;
    var b = sum(xs.map(function(x, i){ return (x - mx) * (v[i] - my); })) / sum(xs.map(function(x){ return (x - mx) * (x - mx); }));
    QP.draw('k-trend', 'combo', {h:230, cats:MONTHS, hl:5, labels:'all', maxBar:34, fmt:function(x){ return perf ? f.n(x) : f.i(x); },
      bars:[{name:perf ? 'Monthly cost' : 'Headcount', color:'var(--area)', values:v}],
      lines:(perf ? [{name:'Plan', color:'var(--target)', values:TREND.plan, dash:'5 4', markers:false, width:1.8}] : []).concat([{name:'Trend', color:'var(--s3)', values:xs.map(function(x){ return QP.round(my + b * (x - mx), 1); }), markers:false, width:2.4}])});
    QP.draw('k-ap', 'stacked', {h:230, cats:MONTHS, fmt:function(x){ return f.n(x); },
      series:[{name:'Not Due', color:'var(--s1)', values:APM.nd}, {name:'Past Due ≤ 90 Days', color:'var(--s2)', values:APM.le}, {name:'Past Due > 90 Days', color:'var(--neg)', values:APM.gt}]});
  }
});
})();
