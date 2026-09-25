/* Operating Assets — visitation, yield, per cap, annual pass, channels and P&L per asset. */
(function(){
var f = QP.f, M = f.m, chip = QP.chip;
function sum(a){ return a.reduce(function(x,y){ return x+y; },0); }
var MONTHS = ['Jan','Feb','Mar','Apr','May'];
var CH = ['B2C — Annual Pass','B2B — Corporate','B2B — Educational','B2B — Government','B2B — Hotels','B2B — Tour & Travel','Other — Companion','Other — Employee','Special Events'];

/* Six Flags Qiddiya — YTD to May-26, as reported */
var SF = {
  name:'Six Flags Qiddiya', ridesLabel:'Top 10 Rides — Utilization %',
  visits:214880, vb:207810, yld:168.40, yldV:1.1,
  pc:{total:[241.60,-2.0], adm:[142.30,-1.2], fb:[58.10,-1.9], ret:[24.80,-2.4], oth:[16.40,-8.4]},
  ap:{sales:[38410,6.1], visits:[48120,7.2], share:[22.4,0.8]},
  los:4.6, rpp:6.2,
  rides:[['Iron Rattler',88],['Falcons Flight',84],['Adrena-Line',78],['Spitfire',72],['Sea Station',68],['Saw Mill Falls',64],['Colossus',60],['Skywatch',56],['Gyrospin',52],['Twilight Express',48]],
  mv:[36120,38940,42310,47660,49850], mb:[35400,37800,41200,45900,47510],
  chPc:[[86.40,88.00],[38.20,36.40],[21.60,22.40],[18.40,18.00],[26.80,27.60],[31.20,30.10],[9.40,9.60],[4.60,4.80],[4.80,9.60]], pcTot:[241.60,246.50],
  chAd:[[48120,44900],[32410,31200],[24860,25600],[18240,17900],[29640,28800],[34120,32400],[14860,15200],[6420,6600],[6210,5210]],
  chRev:[[12.4,11.8],[8.6,8.2],[5.4,5.6],[3.8,3.7],[7.2,7.0],[9.4,9.0],[2.6,2.7],[1.2,1.3],[1.3,1.9]], revTot:[51.9,51.2],
  pl:{rev:[12.4,12.1,51.9], kids:[['Admission',7.2,7.0,29.8],['In Park Spend',4.1,4.0,17.4],['Special Events',0.3,0.5,1.3],['Partnership',0.8,0.6,3.4]], cogs:[-4.4,-4.3,-18.4], opex:[-4.6,-4.7,-19.3], ebitda:[3.4,3.1,14.2]}
};
/* Aquarabia and Playmaker Studio follow Six Flags' shape at their own scale */
function derive(o){
  var a = JSON.parse(JSON.stringify(SF)), k = o.k, rk = o.rk;
  a.name = o.name; a.ridesLabel = o.ridesLabel; a.rides = o.rides;
  a.visits = Math.round(SF.visits * k); a.vb = Math.round(a.visits / (1 + o.vv / 100)); a.yld = o.yld; a.yldV = o.yldV;
  a.pc = o.pc; a.ap = {sales:[Math.round(SF.ap.sales[0] * k * o.apk), o.apv[0]], visits:[0, o.apv[1]], share:[0, o.apv[2]]};
  a.ap.visits[0] = Math.round(a.visits * o.share / 100); a.ap.share[0] = o.share;
  a.los = o.los; a.rpp = o.rpp;
  a.mv = SF.mv.map(function(v){ return Math.round(v * k); }); a.mv[4] += a.visits - sum(a.mv);
  a.mb = SF.mb.map(function(v){ return Math.round(v * k / (1 + o.vv / 100) * (SF.visits / SF.vb)); }); a.mb[4] += a.vb - sum(a.mb);
  var pr = o.pc.total[0] / SF.pc.total[0];
  a.chPc = SF.chPc.map(function(c){ return [QP.round(c[0] * pr, 2), QP.round(c[1] * pr, 2)]; }); a.pcTot = [o.pc.total[0], QP.round(o.pc.total[0] / (1 + o.pc.total[1] / 100), 2)];
  a.chAd = SF.chAd.map(function(c){ return [Math.round(c[0] * k), Math.round(c[1] * k / (1 + o.vv / 100) * (SF.visits / SF.vb))]; });
  a.chAd[8][0] += a.visits - sum(a.chAd.map(function(c){ return c[0]; })); a.chAd[8][1] += a.vb - sum(a.chAd.map(function(c){ return c[1]; }));
  var rev = QP.round(a.visits * o.pc.total[0] / 1e6, 1);
  a.chRev = SF.chRev.map(function(c){ return [QP.round(c[0] * rk, 1), QP.round(c[1] * rk, 1)]; });
  a.chRev[0][0] = QP.round(a.chRev[0][0] + rev - sum(a.chRev.map(function(c){ return c[0]; })), 1);
  a.revTot = [rev, QP.round(sum(a.chRev.map(function(c){ return c[1]; })), 1)];
  function sc(x){ return QP.round(x * rk, 1); }
  a.pl = {rev:SF.pl.rev.map(sc), kids:SF.pl.kids.map(function(r){ return [r[0], sc(r[1]), sc(r[2]), sc(r[3])]; }), cogs:SF.pl.cogs.map(sc), opex:SF.pl.opex.map(sc), ebitda:[0,0,0]};
  a.pl.rev = [0,1,2].map(function(i){ return QP.round(sum(a.pl.kids.map(function(r){ return r[i + 1]; })), 1); });
  a.pl.ebitda = [0,1,2].map(function(i){ return QP.round(a.pl.rev[i] + a.pl.cogs[i] + a.pl.opex[i], 1); });
  return a;
}
var ASSETS = {
  sf:SF,
  pm:derive({name:'Playmaker Studio', k:.18, rk:.0977, vv:-2.5, yld:96.40, yldV:-2.4, pc:{total:[131.20,-3.2], adm:[78.60,-2.6], fb:[31.40,-3.9], ret:[14.20,-1.4], oth:[7.00,-6.1]},
    apk:.6, apv:[2.1,-1.8,-0.6], share:14.5, los:3.1, rpp:5.4, ridesLabel:'Top 10 Attractions — Utilization %',
    rides:[['VR Arena',86],['Racing Simulators',82],['Esports Arena',77],['Motion Theatre',71],['Rhythm Games',66],['Arcade Zone',62],['Laser Maze',57],['Creator Lab',51],['Retro Gaming',46],['Kids’ Play Studio',41]]}),
  aq:derive({name:'Aquarabia', k:.31, rk:.2545, vv:2.1, yld:142.60, yldV:0.6, pc:{total:[198.40,-1.1], adm:[118.20,-0.4], fb:[49.80,-1.6], ret:[17.60,-2.9], oth:[12.80,-3.8]},
    apk:.78, apv:[4.2,5.1,0.4], share:17.8, los:5.3, rpp:4.1, ridesLabel:'Top 10 Rides — Utilization %',
    rides:[['Wave Pool',91],['Lazy River',86],['Family Raft Slide',81],['Speed Slides',77],['Kids’ Splash Zone',73],['Tube Slides',69],['Surf Simulator',63],['Aqua Loop',58],['Body Slides',54],['Tornado Funnel',49]]})
};

/* daily admissions: each month's total spread by day of week (Thu-Sat peak) */
function daily(a, upto){
  var out = [], labels = [], marks = [];
  var wk = [.86,.78,.8,.84,1.08,1.28,1.36]; /* by getDay(): Sun..Sat — Thu to Sat peak */
  for (var m = 0; m < upto; m++) {
    var days = QP.lastDay(2026, m + 1), w = [], r = QP.rng(97 + m * 13 + a.visits % 97);
    for (var d = 1; d <= days; d++) w.push(wk[new Date(2026, m, d).getDay()] * (.92 + r() * .16) * (1 + (d / days - .5) * .08));
    var sw = sum(w); marks.push({i:out.length, l:MONTHS[m]});
    w.forEach(function(x, i){ out.push(Math.round(a.mv[m] * x / sw)); labels.push((i + 1) + ' ' + MONTHS[m] + ' 2026'); });
  }
  var avg = out.map(function(_, i){ var s0 = Math.max(0, i - 6), sl = out.slice(s0, i + 1); return Math.round(sum(sl) / sl.length); });
  return {v:out, l:labels, marks:marks, avg:avg};
}

QP.define('operating-assets', {
  defaults:function(){ return {asset:'sf', basis:'ytd', month:'5', ch:'pc'}; },
  scope:function(s){ return ASSETS[s.asset].name; },
  controls:function(s){
    var ml = QP.MON[+s.month - 1];
    return QP.seg('asset', s.asset, [{v:'sf', l:'Six Flags'}, {v:'pm', l:'Playmaker Studio'}, {v:'aq', l:'Aquarabia'}], 'tabs') +
      QP.seg('basis', s.basis, [{v:'m', l:ml}, {v:'ytd', l:'YTD'}]) +
      QP.dd('month', 'Month', s.month, MONTHS.map(function(m, i){ return {v:String(i + 1), l:m + '-26'}; }));
  },
  body:function(s){
    var a = ASSETS[s.asset], m = +s.month, ytd = s.basis === 'ytd', ml = QP.MON[m - 1] + '-26';
    var cumA = sum(a.mv.slice(0, m)), cumB = sum(a.mb.slice(0, m));
    var mult = ytd ? cumA / a.visits : a.mv[m - 1] / a.visits, multB = ytd ? cumB / a.vb : a.mb[m - 1] / a.vb;
    var per = ytd ? 'YTD' : ml, perL = ytd ? 'YTD to ' + ml : ml;
    var visits = ytd ? cumA : a.mv[m - 1], vb = ytd ? cumB : a.mb[m - 1];
    var h = '';

    /* KPI block */
    function t(label, val, v, o){ o = o || {}; var tone = QP.tone(v, 'up'); return QP.kpi({label:label, value:val, status:o.st || (Math.abs(v) < 1 ? 'amb' : tone), chip:chip(v, {unit:o.unit, dp:o.dp}) + '<span class="muted" style="font-size:var(--fs-sm)">'+(o.vs || 'vs budget')+'</span>', sub:o.sub, cls:o.cls}); }
    var body = '<div class="qp-grid g2">' +
        t('Visitation', f.i(visits), f.varPct(visits, vb), {sub:'Budget <b>'+f.i(vb)+'</b> guests'}) +
        t('Admission Yield %', M(a.yld, 2), a.yldV, {sub:'Admission revenue per guest'}) + '</div>' +
      QP.eyebrow('Per Cap', f.sar + ' per guest') + '<div class="qp-grid g5">' +
        t('Total Per Cap (Excl. Partnership)', M(a.pc.total[0], 2), a.pc.total[1]) + t('Admission', M(a.pc.adm[0], 2), a.pc.adm[1]) + t('F&B', M(a.pc.fb[0], 2), a.pc.fb[1]) +
        t('Retail', M(a.pc.ret[0], 2), a.pc.ret[1]) + t('Other In-Park Spend', M(a.pc.oth[0], 2), a.pc.oth[1]) + '</div>' +
      QP.eyebrow('Annual Pass KPIs', perL) + '<div class="qp-grid g3">' +
        t('Annual Pass Sales (No.)', f.i(a.ap.sales[0] * mult), a.ap.sales[1]) + t('Annual Pass Visits (No.)', f.i(a.ap.visits[0] * mult), a.ap.visits[1]) +
        t('Annual Pass Visits % of Total', f.pct(a.ap.share[0]), a.ap.share[1], {unit:' pt', vs:'vs budget share'}) + '</div>';
    h += QP.card({cls:'kpiwrap', body:body, foot:'Grain: metric, monthly. Deltas compare '+(ytd ? 'YTD actual against YTD budget' : ml + ' actual against ' + ml + ' budget')+'. Per cap and yield are ratios and do not change with the period basis.'});

    /* visitor metrics + rides */
    h += '<div class="qp-row" style="margin-top:16px">' +
      QP.card({cls:'f1', title:'Visitor Metrics', sub:perL, body:'<div class="qp-stats qp-grid rows">'+
        '<div class="qp-stat"><span class="ic">'+QP.icon('cal')+'</span><span class="tx"><span class="k">Avg Length of Stay (hrs)</span><span class="t">Hours in park per visit</span></span><span class="v">'+f.n(a.los)+'</span></div>'+
        '<div class="qp-stat"><span class="ic">'+QP.icon('target')+'</span><span class="tx"><span class="k">Ride Per Person</span><span class="t">Rides per guest per visit</span></span><span class="v">'+f.n(a.rpp)+'</span></div>'+
        '<div class="qp-stat"><span class="ic">'+QP.icon('users')+'</span><span class="tx"><span class="k">Total Ridership No.</span><span class="t">Visitation × rides per person</span></span><span class="v">'+f.i(Math.round(visits * a.rpp))+'</span></div></div>'+
        '<div class="qp-foot">'+QP.icon('info')+'<span>Total ridership reconciles to visitation ('+f.i(visits)+') multiplied by ride per person ('+f.n(a.rpp)+').</span></div>'}) +
      QP.card({cls:'f1', title:a.ridesLabel, sub:'Share of hourly capacity used, '+perL+' · lowest highlighted', body:'<div class="qp-chart" id="oa-rides"></div>'}) +
      '</div>';

    /* trends */
    h += '<div class="qp-row" style="margin-top:16px">' +
      QP.card({cls:'f1', title:'Monthly Admissions Trend', rt:QP.pill('Budget line dashed', 'neu'),
        body:'<div class="qp-meta">YTD Actual <b>'+f.i(cumA)+'</b>'+chip(f.varPct(cumA, cumB))+'<span class="dot"></span>YTD Budget <b>'+f.i(cumB)+'</b></div><div class="qp-chart" id="oa-month"></div>'+
          QP.legendHtml([{l:'Admissions', c:'var(--s1)'},{l:'Budget', c:'var(--target)', t:'dash'}])}) +
      QP.card({cls:'f1', title:'Daily Admissions Since Launch', rt:'<span class="muted" style="font-size:var(--fs-sm)">Latest reading is yesterday, not the close</span>',
        body:'<div class="qp-chart" id="oa-daily"></div>'+QP.legendHtml([{l:'Daily admissions', c:'var(--s2)'},{l:'7-day average', c:'var(--s1)', t:'ln'}])}) +
      '</div>';

    /* channel tables */
    function chT(id, rows, tot, fa, fb){
      return QP.table({id:id, rows:rows.map(function(r, i){ return {n:CH[i], a:r[0], b:r[1], flag:f.varPct(r[0], r[1]) < -15}; }), total:{n:'Total', a:tot[0], b:tot[1]}, cols:[
        {k:'n', label:'Channel'}, {label:per+' Actual'+fa, cls:'r', fmt:function(r){ return fb(r.a); }}, {label:per+' Budget'+fa, cls:'r', fmt:function(r){ return fb(r.b); }},
        {label:'Variance', cls:'r', fmt:function(r){ return chip(f.varPct(r.a, r.b)); }}]});
    }
    var sa = function(v){ return v * mult; }, sb = function(v){ return v * multB; };
    var rv = a.chRev.map(function(r){ return [QP.round(sa(r[0]), 1), QP.round(sb(r[1]), 1)]; });
    var CHV = {
      pc:{l:'Per Cap', cap:f.sar + ' per guest', t:chT('pc', a.chPc, a.pcTot, ' ('+f.sar+')', function(v){ return f.n(v, 2); }), foot:'Grain: channel. Reconciles to Total Per Cap above.'},
      ad:{l:'Admissions', cap:'Guests', t:chT('ad', a.chAd.map(function(r){ return [Math.round(sa(r[0])), Math.round(sb(r[1]))]; }), [visits, vb], '', function(v){ return f.i(v); }), foot:'Grain: channel. Reconciles to Visitation above.'},
      rv:{l:'Revenue', cap:f.sar + ' millions', t:chT('rv', rv, [QP.round(sum(rv.map(function(r){ return r[0]; })), 1), QP.round(sum(rv.map(function(r){ return r[1]; })), 1)], ' ('+f.sar+')', function(v){ return f.n(v); }), foot:'Grain: channel. Reconciles to Revenue in the profit and loss.'}
    };
    var chv = CHV[s.ch] || CHV.pc;
    h += QP.sec('Channel Performance', perL);

    /* channel split + P&L */
    var mShare = a.mv[m - 1] / a.mv[4];
    var plRows = [
      {n:'Revenue', ma:a.pl.rev[0] * mShare, mb:a.pl.rev[1] * mShare, y:a.pl.rev[2] * cumA / a.visits, children:a.pl.kids.map(function(k){ return {n:k[0], ma:k[1] * mShare, mb:k[2] * mShare, y:k[3] * cumA / a.visits}; })},
      {n:'Cogs', ma:a.pl.cogs[0] * mShare, mb:a.pl.cogs[1] * mShare, y:a.pl.cogs[2] * cumA / a.visits, cost:true},
      {n:'Operating Costs', ma:a.pl.opex[0] * mShare, mb:a.pl.opex[1] * mShare, y:a.pl.opex[2] * cumA / a.visits, cost:true}
    ];
    plRows.forEach(function(r){ ['ma','mb','y'].forEach(function(k){ r[k] = QP.round(r[k], 1); }); (r.children || []).forEach(function(c){ ['ma','mb','y'].forEach(function(k){ c[k] = QP.round(c[k], 1); }); }); });
    var eb = {n:'EBITDA', ma:QP.round(sum(plRows.map(function(r){ return r.ma; })), 1), mb:QP.round(sum(plRows.map(function(r){ return r.mb; })), 1), y:QP.round(sum(plRows.map(function(r){ return r.y; })), 1)};
    h += '<div class="qp-row">' +
      QP.card({cls:'flush f1', title:chv.l + ' Split by Channel', cap:chv.cap, body:chv.t, foot:chv.foot,
        rt:QP.seg('ch', s.ch || 'pc', [{v:'pc', l:'Per Cap'}, {v:'ad', l:'Admissions'}, {v:'rv', l:'Revenue'}], 'sm')}) +
      QP.card({cls:'flush f1', title:'Profit & Loss Statement', cap:f.sar + ' millions', body:QP.table({id:'pnl', expLabel:'Lines', rows:plRows, total:eb, cols:[
        {k:'n', label:'P&L'},
        {label:ml.slice(0, 3)+' Actual ('+f.sar+')', cls:'r', band:!ytd, fmt:function(r){ return f.n(r.ma); }},
        {label:ml.slice(0, 3)+' Budget ('+f.sar+')', cls:'r', band:!ytd, fmt:function(r){ return f.n(r.mb); }},
        {label:'Variance', cls:'r', band:!ytd, fmt:function(r){ return chip(r.cost ? f.varPct(Math.abs(r.ma), Math.abs(r.mb)) : f.varPct(r.ma, r.mb), {good:r.cost ? 'down' : 'up'}); }},
        {label:'YTD Actual ('+f.sar+')', cls:'r', band:ytd, key:true, fmt:function(r){ return f.n(r.y); }}
      ]}) + '<div class="qp-trio" style="padding:16px 22px 0">'+
        '<div><span class="k">'+ml.slice(0, 3)+' EBITDA margin</span><span class="v">'+f.pct(eb.ma / plRows[0].ma * 100)+'</span></div>'+
        '<div><span class="k">'+ml.slice(0, 3)+' budget margin</span><span class="v">'+f.pct(eb.mb / plRows[0].mb * 100)+'</span></div>'+
        '<div><span class="k">YTD EBITDA margin</span><span class="v">'+f.pct(eb.y / plRows[0].y * 100)+'</span></div></div>',
        foot:'Grain: line. Revenue opens to its components. Costs are shown negative; a cost below budget reads as favourable.'}) +
      '</div>';
    return h;
  },
  mount:function(s){
    var a = ASSETS[s.asset], m = +s.month;
    var lo = a.rides.length - 1;
    QP.draw('oa-rides', 'hbars', {items:a.rides.map(function(r, i){ return {name:r[0], value:r[1], color:i === lo ? 'var(--amb)' : 'var(--s1)', hl:i === lo}; }), max:100, left:136, rowH:25, fmt:function(v){ return v + '%'; }, label:'Utilization'});
    QP.draw('oa-month', 'combo', {h:230, cats:MONTHS.slice(0, m), hl:m - 1, labels:'all', maxBar:40, fmt:function(v){ return f.i(v); },
      bars:[{name:'Admissions', color:'var(--s1)', values:a.mv.slice(0, m), colorAt:function(i){ return a.mv[i] >= a.mb[i] ? 'var(--s1)' : 'var(--s2)'; }}],
      lines:[{name:'Budget', color:'var(--target)', values:a.mb.slice(0, m), dash:'5 4', markers:false, width:1.8}],
      extraTip:function(i){ var v = f.varPct(a.mv[i], a.mb[i]); return [{l:'Variance', v:(v > 0 ? '+' : '') + v.toFixed(1) + '%'}]; }});
    var d = daily(a, m);
    QP.draw('oa-daily', 'line', {h:246, values:d.v, avg:d.avg, marks:d.marks, label:function(i){ return d.l[i]; }});
  }
});
})();
QP.DEFS['operating-assets']._open = {'pnl-0':true};
