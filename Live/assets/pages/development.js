/* Development — spend across every business unit, actual vs plan vs forecast. */
(function(){
var f = QP.f, M = f.m, chip = QP.chip;
function sum(a){ return a.reduce(function(x,y){ return x+y; },0); }
function split(total, w){ var s = sum(w), acc = 0; return w.map(function(x, i){ var v = i === w.length - 1 ? QP.round(total - acc, 1) : QP.round(total * x / s, 1); acc += v; return v; }); }

/* KPI cards: actual, plan and forecast for each business unit */
var CARDS = [
  {n:'Total Development', a:3213.0, p:3392.0, fc:3448.0, tr:[2890,2968,3035,3102,3160,3213.0]},
  {n:'Entertainment', a:355.8, p:412.0, fc:440.0, tr:[330,336,341,347,351,355.8]},
  {n:'Master Development Unit', a:1204.6, p:1180.0, fc:1240.0, tr:[1098,1121,1146,1168,1187,1204.6]},
  {n:'Sports', a:288.4, p:291.9, fc:300.0, tr:[262,268,274,279,284,288.4]},
  {n:'Arts & Culture', a:96.4, p:94.0, fc:98.0, tr:[86,88,90.5,92.6,94.8,96.4]},
  {n:'Residential', a:142.7, p:144.9, fc:150.0, tr:[131,134,136.5,139,141,142.7]},
  {n:'Hospitality', a:201.0, p:204.6, fc:212.0, tr:[186,190,193,196,198.8,201.0]},
  {n:'Transport', a:101.4, p:108.8, fc:114.0, tr:[95,97,98.4,99.5,100.6,101.4]},
  {n:'Commercial', a:128.0, p:124.0, fc:130.0, tr:[114,117,120,123,125.6,128.0]},
  {n:'Retail', a:176.5, p:175.1, fc:180.0, tr:[160,164,167.5,171,174,176.5]},
  {n:'PMBS Stadium', a:288.4, p:291.9, fc:300.0, tr:[263,268,273.5,279,284,288.4]},
  {n:'Racecourse', a:84.2, p:82.0, fc:86.0, tr:[75,77,79,80.8,82.6,84.2]},
  {n:'QPAC', a:201.0, p:204.6, fc:210.0, tr:[187,190,193.4,196,198.9,201.0]},
  {n:'Development Headcount', a:986, p:1010, fc:1040, hc:true, tr:[912,928,944,957,971,986]},
  {n:'Delivery Partner', a:34, hcOnly:true, tr:[30,31,31,32,33,34]}
];

/* Performance report — cumulative (inception-to-date) */
var REPORT = [
  {n:'Entertainment', bud:980.0, com:488.2, wp:355.8, adv:92.1, a:355.8, p:412.0},
  {n:'Master Development Unit', bud:2480.0, com:1204.6, wp:1204.6, adv:204.0, a:1204.6, p:1180.0},
  {n:'PMBS Stadium', bud:640.0, com:301.7, wp:288.4, adv:61.0, a:288.4, p:291.9},
  {n:'Sports', bud:410.0, com:194.0, wp:176.5, adv:40.2, a:176.5, p:175.1},
  {n:'QPAC', bud:520.0, com:233.8, wp:201.0, adv:52.6, a:201.0, p:204.6},
  {n:'Transport', bud:288.0, com:119.6, wp:101.4, adv:24.4, a:101.4, p:108.8},
  {n:'Development Personnel Cost', bud:142.0, com:null, wp:96.4, adv:null, a:96.4, p:92.8},
  {n:'Delivery Partners', bud:96.0, com:44.2, wp:34.8, adv:8.1, a:34.8, p:36.0},
  {n:'Residential', bud:375.0, com:160.2, wp:142.7, adv:31.8, a:142.7, p:144.9},
  {n:'Arts & Culture', bud:210.0, com:98.4, wp:96.4, adv:20.1, a:96.4, p:94.0},
  {n:'Racecourse', bud:180.0, com:88.0, wp:84.2, adv:18.4, a:84.2, p:82.0},
  {n:'Hospitality', bud:520.0, com:233.8, wp:201.0, adv:52.6, a:201.0, p:204.6}
];
/* current-year (2026) view: the share of each cumulative figure booked since 1 Jan */
var CY = {bud:.36, com:.41, wp:.34, adv:.38};
var CBS = ['Design','Sales Center','Contingency','Inflation','Staff Cost'], CBSW = [.245,.232,.059,.232,.232];

var MC = [
  {n:'Anime Hub', bu:'Entertainment', v:'Saudi Motorsport', cv:604.0, mc:68, cu:22},
  {n:'Arena bowl', bu:'PMBS Stadium', v:'MC2 Contracting', cv:488.0, mc:54, cu:14},
  {n:'Retail spine', bu:'Retail', v:'MC3 Builders', cv:310.0, mc:41, cu:9},
  {n:'Concert hall', bu:'QPAC', v:'MC2 Contracting', cv:262.0, mc:47, cu:11},
  {n:'Residential phase one', bu:'Residential', v:'MC3 Builders', cv:375.0, mc:33, cu:6},
  {n:'Transit spine', bu:'Transport', v:'Saudi Motorsport', cv:288.0, mc:29, cu:4}
];
var MONTHS = ['Nov','Dec','Jan','Feb','Mar','Apr'];
var TREND = {perf:[118.4,131.2,139.6,148.3,152.9,163.8], hc:[912,928,944,957,971,986]};
var AP = {months:[72.6,76.9,79.4,83.1,85.7,88.4], vend:[
  {n:'Saudi Motorsport', b:[8.2,4.1,7.0,1.3]}, {n:'MC2 Contracting', b:[6.1,3.4,5.7,0.7]}, {n:'MC3 Builders', b:[4.4,2.8,4.0,0.4]},
  {n:'Qiddiya Co.', b:[3.8,2.1,2.8,0.2]}, {n:'All others', b:[18.6,7.4,5.2,0.2]}]};

QP.define('development', {
  defaults:function(){ return {basis:'m', from:'2026-04-01', to:'2026-04-30', view:'cum', trend:'perf', cmp:'plan'}; },
  onSet:function(s, k, v){ if (k === 'basis') { var r = QP.periodRange(2026, 4, v === 'ytd' ? 'ytd' : 'm'); s.from = r.from; s.to = r.to; } },
  scope:function(){ return 'All business units'; },
  controls:function(s){
    return QP.seg('basis', s.basis, [{v:'m', l:'Apr'}, {v:'ytd', l:'YTD'}]) + QP.dates(s.from, s.to, 'from', 'to');
  },
  controlsRight:function(s){ return QP.seg('cmp', s.cmp, [{v:'plan',l:'vs Plan'},{v:'forecast',l:'vs Forecast'}], 'sm'); },
  body:function(s){
    var h = '', ytd = s.basis === 'ytd', cmp = s.cmp;
    if (QP.persona.context) {
      h += '<div class="qp-context"><div><span class="k">Period</span><span class="v">Apr-26</span></div><div><span class="k">Basis</span><span class="v">'+(ytd ? 'YTD' : 'Selected Month')+'</span></div>'+
        '<div><span class="k">Compared against</span><span class="v">'+(cmp === 'plan' ? 'Plan' : 'Forecast')+'</span></div><div><span class="k">Currency</span><span class="v">'+f.sar+' millions</span></div><div class="sp"></div>'+
        '<div style="justify-content:center">'+QP.seg('basis', s.basis, [{v:'m', l:'Selected Month'}, {v:'ytd', l:'YTD'}], 'sm')+'</div></div>';
    }
    /* cards show name, value and variance; plan, forecast and counts live in the hover card,
       led by the reference the variance is measured against */
    h += '<div class="qp-grid g8">' + CARDS.map(function(c, i){
      if (c.hcOnly) return QP.kpi({label:c.n, value:f.i(c.a), detail:'HC <b>'+f.i(c.a)+'</b> · Actual <b>'+f.i(c.a)+'</b>', status:'neu', chip:QP.pill('No plan set', 'neu'), cls:'sm'});
      var base = cmp === 'plan' ? c.p : c.fc, v = f.varPct(c.a, base), tone = QP.tone(v, c.hc ? 'none' : 'up');
      var fm = c.hc ? f.i : function(x){ return M(x); };
      var plan = 'Plan <b>'+fm(c.p)+'</b>', fcst = 'Forecast <b>'+fm(c.fc)+'</b>';
      return QP.kpi({label:c.n, value:fm(c.a), status:c.hc ? 'amb' : (Math.abs(v) < 2 ? 'amb' : tone), cls:'sm' + (i === 0 ? ' total' : ''),
        detail:cmp === 'plan' ? plan + ' · ' + fcst : fcst + ' · ' + plan, chip:chip(v, {good:c.hc ? 'none' : 'up'})});
    }).join('') + '</div>';

    /* performance report */
    var cum = s.view === 'cum';
    var rows = REPORT.map(function(r){
      var k = cum ? 1 : null;
      var o = {n:r.n, bud:cum ? r.bud : QP.round(r.bud * CY.bud, 1), com:r.com == null ? null : (cum ? r.com : QP.round(r.com * CY.com, 1)),
        wp:cum ? r.wp : QP.round(r.wp * CY.wp, 1), adv:r.adv == null ? null : (cum ? r.adv : QP.round(r.adv * CY.adv, 1)), a:r.a, p:r.p};
      o.flag = f.varPct(o.a, o.p) < -5;
      if (r.com != null) { var aa = split(o.a, CBSW), pp = split(o.p, CBSW), bb = split(o.bud, CBSW), cc = split(o.com, CBSW), ww = split(o.wp, CBSW), dd = o.adv == null ? [] : split(o.adv, CBSW);
        o.children = CBS.map(function(n, i){ return {n:n, bud:bb[i], com:cc[i], wp:ww[i], adv:o.adv == null ? null : dd[i], a:aa[i], p:pp[i]}; }); }
      return o;
    });
    var tot = {n:'Total'}; ['bud','com','wp','adv','a','p'].forEach(function(k){ tot[k] = QP.round(sum(rows.map(function(r){ return r[k] || 0; })), 1); });
    var cols = [
      {k:'n', label:'Business Unit'},
      {label:(cum ? 'Budget' : 'FY 2026 Budget')+' ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.bud); }},
      {label:'Commitments ('+f.sar+')', cls:'r', fmt:function(r){ return r.com == null ? null : f.n(r.com); }},
      {label:'Work Performed ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.wp); }},
      {label:'Advances ('+f.sar+')', cls:'r', fmt:function(r){ return r.adv == null ? null : f.n(r.adv); }},
      {label:'YTD Actual ('+f.sar+')', cls:'r', band:true, fmt:function(r){ return f.n(r.a); }},
      {label:'YTD Plan ('+f.sar+')', cls:'r', band:true, fmt:function(r){ return f.n(r.p); }},
      {label:'Variance %', cls:'r', band:true, fmt:function(r){ return chip(f.varPct(r.a, r.p)); }}
    ];
    h += QP.sec('Performance Report', cum ? 'Cumulative, inception-to-date' : 'Current year, since 1 Jan 2026', QP.seg('view', s.view, [{v:'cum', l:'Cumulative (inception-to-date)'}, {v:'cy', l:'2026'}], 'sm'));
    h += QP.card({cls:'flush', body:QP.table({id:'rep', rows:rows, total:tot, cols:cols, groups:[{span:5, label:cum ? 'Inception-to-date' : 'Calendar 2026'},{span:3, label:'YTD against plan', band:true}]}),
      foot:'Grain: business unit, then cost line. Development Personnel Cost carries no commitment value. Rows more than 5% behind plan are marked.'});

    /* MC progress */
    h += QP.sec('MC Progress', 'Measured completion against contract value');
    h += QP.card({cls:'flush', body:QP.table({id:'mc', rows:MC, cols:[
      {k:'n', label:'Project'}, {k:'bu', label:'Business Unit'}, {k:'v', label:'Vendor Name'},
      {label:'Contract Value ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.cv); }},
      {label:'MC Completion', cls:'r', fmt:function(r){ return QP.bar(r.mc, 'var(--s1)'); }},
      {label:'Contingency Utilized', cls:'r', fmt:function(r){ return QP.bar(r.cu, r.cu > 20 ? 'var(--amb)' : 'var(--s3)'); }}
    ]}), foot:'Grain: project. One row per contract.'});

    /* performance + monthly trend */
    var A = 2983.2, P = 3026.7, FC = 3088.0, mx = FC * 1.04;
    h += QP.sec('Performance & Trend', 'Work performed, '+f.sar+' millions');
    h += '<div class="qp-row">' +
      QP.card({cls:'f1', title:'Performance', sub:'YTD work performed against plan and forecast',
        body:'<div class="qp-big"><span class="v">'+M(A)+'</span><span class="u">M</span>'+chip(f.varPct(A, P), {suffix:'vs plan'})+'</div>'+
          '<div class="qp-sub2">Plan <b>'+M(P)+'</b> · Forecast <b>'+M(FC)+'</b></div>'+
          '<div class="qp-bullet">'+
            '<div class="r"'+QP.tipAttr('Actual '+f.SAR+' '+f.n(A)+' M: '+f.SAR+' '+f.n(P - A)+' M ('+f.n(f.varPct(A, P))+'%) behind the YTD plan')+'><span class="l">Actual</span><span class="tk"><i style="width:'+(A/mx*100)+'%;background:var(--s1)"></i><span class="tick" style="left:'+(P/mx*100)+'%"'+QP.tipAttr('Plan marker: '+f.SAR+' '+f.n(P)+' M YTD plan')+'></span></span><span class="v">'+f.n(A)+'</span></div>'+
            '<div class="r"'+QP.tipAttr('YTD plan '+f.SAR+' '+f.n(P)+' M')+'><span class="l">Plan</span><span class="tk"><i style="width:'+(P/mx*100)+'%;background:var(--plan)"></i></span><span class="v">'+f.n(P)+'</span></div>'+
            '<div class="r"'+QP.tipAttr('Forecast '+f.SAR+' '+f.n(FC)+' M: '+f.SAR+' '+f.n(FC - A)+' M above actual')+'><span class="l">Forecast</span><span class="tk"><i style="width:'+(FC/mx*100)+'%;background:var(--s4)"></i></span><span class="v">'+f.n(FC)+'</span></div>'+
          '</div>'+QP.legendHtml([{l:'Plan marker', c:'var(--target)', t:'dash'}]),
        foot:'Actual is '+M(P - A)+' M behind plan and '+M(FC - A)+' M behind forecast.'}) +
      QP.card({cls:'f15', title:'Monthly Trend', sub:s.trend === 'perf' ? 'Monthly work performed ('+f.sar+' M)' : 'Development headcount at month end', rt:QP.seg('trend', s.trend, [{v:'perf',l:'Performance'},{v:'hc',l:'Headcount'}], 'sm'),
        body:'<div class="qp-chart" id="d-trend"></div>'+QP.legendHtml([{l:'Actual', c:'var(--s1)'},{l:'Trend', c:'var(--s3)', t:'ln'}])}) +
      '</div>';

    /* AP aging */
    var bt = [0,0,0,0]; AP.vend.forEach(function(v){ v.b.forEach(function(x, i){ bt[i] += x; }); });
    h += QP.sec('Accounts Payable', 'Development vendors, '+f.sar+' millions');
    h += '<div class="qp-row">' +
      QP.card({cls:'f1', title:'Accounts Payable Aging', sub:'Total balance by month', body:'<div class="qp-chart" id="d-ap"></div>'}) +
      QP.card({cls:'flush f15', title:'Payables by Vendor', cap:'Apr-26', body:QP.table({id:'dap', rows:AP.vend, total:{n:'Total', b:bt}, cols:[{k:'n', label:'Vendor'}].concat(['Not Due','1-30','31-90','91-180'].map(function(b, i){
        return {label:b+' ('+f.sar+')', cls:'r', fmt:function(r){ return f.n(r.b[i]); }}; })).concat([{label:'Total ('+f.sar+')', cls:'r', key:true, fmt:function(r){ return f.n(sum(r.b)); }}])}),
        foot:'Grain: vendor, aging bucket. Total reconciles to the April bar.'}) +
      '</div>';
    return h;
  },
  mount:function(s){
    var perf = s.trend === 'perf', v = perf ? TREND.perf : TREND.hc;
    var n = v.length, xs = v.map(function(_, i){ return i; }), mx = sum(xs) / n, my = sum(v) / n;
    var b = sum(xs.map(function(x, i){ return (x - mx) * (v[i] - my); })) / sum(xs.map(function(x){ return (x - mx) * (x - mx); }));
    var tr = xs.map(function(x){ return QP.round(my + b * (x - mx), 1); });
    QP.draw('d-trend', 'combo', {h:230, cats:MONTHS, hl:5, labels:'all', maxBar:34, fmt:function(x){ return perf ? f.n(x) : f.i(x); },
      bars:[{name:'Actual', color:'var(--s1)', values:v}], lines:[{name:'Trend', color:'var(--s3)', values:tr, markers:false, width:2.5}]});
    QP.draw('d-ap', 'combo', {h:230, cats:MONTHS, hl:5, labels:'all', maxBar:34, fmt:function(x){ return f.n(x); },
      bars:[{name:'Total payables', color:'var(--s2)', colorAt:function(i){ return i === 5 ? 'var(--s1)' : 'var(--s2)'; }, values:AP.months}]});
  }
});
})();
