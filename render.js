// ── SIDEBAR ──
function renderSidebar(){
  var el=document.getElementById('empList');
  el.innerHTML='';
  document.querySelectorAll('.sb-item').forEach(function(x){x.classList.remove('active');});
  if(view==='team')document.getElementById('nav-team').classList.add('active');
  if(view==='settings')document.getElementById('nav-settings').classList.add('active');
  employees.forEach(function(e){
    var c=COLORS[e.color%COLORS.length];
    var r=lastRating(e.id);
    var rs=r?RS[r]:null;
    var al=checkAlerts(e.id);
    var d=document.createElement('div');
    d.className='emp-item'+(view==='emp'&&e.id===selectedEmp?' active':'');
    var badge=rs?('<span class="emp-badge" style="background:'+rs.bg+';color:'+rs.color+'">'+(r==='Teilweise'?'T':r==='Yes'?'Y':r==='Super Yes'?'SY':'MY')+'</span>'):'';
    var alrt=al.length?('<i class="ti ti-alert-triangle" style="font-size:13px;color:var(--amber);flex-shrink:0"></i>'):'';
    d.innerHTML='<div class="av" style="width:32px;height:32px;font-size:12px;background:'+c.bg+';color:'+c.text+'">'+ini(e.name)+'</div>'
      +'<div style="flex:1;min-width:0"><div class="emp-name">'+e.name+'</div><div class="emp-role">'+e.role+'</div></div>'
      +alrt+badge;
    d.onclick=(function(eid){return function(){selectedEmp=eid;view='emp';activeTab='performance';renderSidebar();renderMain();};})(e.id);
    el.appendChild(d);
  });
}

function showView(v){view=v;renderSidebar();renderMain();}
function renderMain(){if(view==='team')renderTeam();else if(view==='settings')renderSettings();else renderEmpDetail();}

// ── TEAM VIEW ──
function renderTeam(){
  var ma=document.getElementById('mainArea');
  var allP=employees.map(function(e){return getPerf(e.id,7);}).reduce(function(a,b){return a.concat(b);},[]);
  function tAvg(key){if(!allP.length)return null;return allP.reduce(function(a,x){return a+x[key];},0)/allP.length;}
  var totalAlerts=employees.reduce(function(a,e){return a+checkAlerts(e.id).length;},0);
  var totalMargin=employees.reduce(function(a,e){return a+getPerf(e.id,7).reduce(function(b,x){return b+(x.margin||0);},0);},0);

  function crCell(val,target){
    if(val===null)return '<td style="padding:10px 14px;border-bottom:1px solid var(--border)">—</td>';
    var v=Math.round(val);
    var col=v>=CR_GOOD?'var(--teal)':v>=45?'var(--amber)':'var(--red)';
    var hitMark=target?(v>=target?'✓':'↓'+target+'%'):'';
    return '<td style="padding:10px 14px;border-bottom:1px solid var(--border);min-width:100px">'
      +'<div style="display:flex;justify-content:space-between;margin-bottom:3px">'
      +'<span style="font-size:13px;font-weight:600;color:'+col+'">'+v+'%</span>'
      +(target?'<span style="font-size:10px;color:'+(v>=target?'var(--teal)':'var(--red)')+'">'+hitMark+'</span>':'')
      +'</div>'
      +'<div style="height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;position:relative">'
      +'<div style="height:100%;width:'+Math.min(v,100)+'%;background:'+col+';border-radius:3px"></div>'
      +(target?'<div style="position:absolute;top:0;left:'+target+'%;height:100%;width:2px;background:rgba(0,0,0,.15)"></div>':'')
      +'</div></td>';
  }

  var ta=tAvg('crOEM'),tb=tAvg('crSuperYes'),tc=tAvg('crMegaYes'),td2=tAvg('optPerH');
  var rows='';
  employees.forEach(function(e){
    var c=COLORS[e.color%COLORS.length];
    var r=lastRating(e.id);var rs=r?RS[r]:null;
    var av=avgSkill(e.id);var sr=srAvg(e.id);
    var al=checkAlerts(e.id);
    var ep=getPerf(e.id,7);
    function ea(key){return ep.length?ep.reduce(function(a,x){return a+x[key];},0)/ep.length:null;}
    var em=ep.reduce(function(a,x){return a+(x.margin||0);},0);
    rows+='<tr style="cursor:pointer" onclick="selectEmp('+e.id+')">'
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)">'
      +'<div style="display:flex;align-items:center;gap:9px">'
      +'<div class="av" style="width:30px;height:30px;font-size:11px;background:'+c.bg+';color:'+c.text+'">'+ini(e.name)+'</div>'
      +'<div><div style="font-weight:500">'+e.name+(al.length?'<i class="ti ti-alert-triangle" style="font-size:12px;color:var(--amber);margin-left:4px"></i>':'')+'</div>'
      +'<div style="font-size:11px;color:var(--text2)">'+e.phase+'</div></div></div></td>'
      +crCell(ea('crOEM'),CR_GOOD)
      +crCell(ea('crTeilweise'),null)
      +crCell(ea('crYes'),null)
      +crCell(ea('crSuperYes'),KPI_TARGETS.crSuperYes)
      +crCell(ea('crMegaYes'),KPI_TARGETS.crMegaYes)
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)"><div style="font-size:13px;font-weight:600;color:var(--blue)">€'+em.toLocaleString('de-DE')+'</div><div style="font-size:11px;color:var(--text3)">7d total</div></td>'
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)">'+(ea('optPerH')!==null?ea('optPerH').toFixed(1):'—')+'</td>'
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)">'+(sr!==null?sr+'%':'—')+'</td>'
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)">'+(rs?'<span class="badge" style="background:'+rs.bg+';color:'+rs.color+'">'+r+'</span>':'—')+'</td>'
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)">'+(al.length?'<span style="color:var(--red);font-weight:600;font-size:12px">⚠ '+al.length+'</span>':'<span style="color:var(--teal)">✓</span>')+'</td>'
      +'</tr>';
  });

  var cards='';
  employees.forEach(function(e){
    var c=COLORS[e.color%COLORS.length];
    var r=lastRating(e.id);var rs=r?RS[r]:null;
    var av=avgSkill(e.id);var sr=srAvg(e.id);
    var ob=onboarding[e.id]||[];var obD=ob.filter(Boolean).length;
    var ep=getPerf(e.id,7);
    function ea(key){return ep.length?Math.round(ep.reduce(function(a,x){return a+x[key];},0)/ep.length):null;}
    var em=ep.reduce(function(a,x){return a+(x.margin||0);},0);
    var al=checkAlerts(e.id);
    var oem=ea('crOEM');
    var oemColor=oem!==null?(oem>=CR_GOOD?'var(--teal)':oem>=45?'var(--amber)':'var(--red)'):'var(--text3)';
    cards+='<div class="team-card" onclick="selectEmp('+e.id+')">'
      +'<div class="tc-hdr"><div class="av" style="width:42px;height:42px;font-size:14px;background:'+c.bg+';color:'+c.text+'">'+ini(e.name)+'</div>'
      +'<div style="flex:1"><div style="font-size:14px;font-weight:600">'+e.name+'</div><div style="font-size:12px;color:var(--text2)">'+e.role+'</div></div>'
      +'<span class="phase-badge" style="background:'+phaseBg(e.phase)+';color:'+phaseCol(e.phase)+'">'+e.phase+'</span></div>'
      +'<div style="margin-bottom:10px">'
      +'<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:11px;color:var(--text2)">CR OEM</span><span style="font-size:13px;font-weight:600;color:'+oemColor+'">'+(oem!==null?oem+'%':'—')+'</span></div>'
      +'<div style="height:7px;background:var(--bg3);border-radius:4px;overflow:hidden;position:relative">'
      +(oem!==null?'<div style="height:100%;width:'+Math.min(oem,100)+'%;background:'+oemColor+';border-radius:4px"></div>':'')
      +'<div style="position:absolute;top:0;left:'+CR_GOOD+'%;height:100%;width:2px;background:rgba(0,0,0,.15)"></div></div>'
      +'<div style="font-size:10px;color:var(--text3);margin-top:2px">Target ≥ '+CR_GOOD+'% · '+(oem!==null&&oem>=CR_GOOD?'✓ On target':'↓ Below target')+'</div></div>'
      +'<div class="tc-kpis">'
      +'<div class="tc-kpi"><div class="tc-kpi-val" style="color:var(--amber);font-size:13px">'+(ea('crTeilweise')!==null?ea('crTeilweise')+'%':'—')+'</div><div class="tc-kpi-label">Teilweise</div></div>'
      +'<div class="tc-kpi"><div class="tc-kpi-val" style="color:var(--blue);font-size:13px">'+(ea('crYes')!==null?ea('crYes')+'%':'—')+'</div><div class="tc-kpi-label">Yes</div></div>'
      +'<div class="tc-kpi"><div class="tc-kpi-val" style="color:var(--purple);font-size:13px">'+(ea('crSuperYes')!==null?ea('crSuperYes')+'%':'—')+'</div><div class="tc-kpi-label">Super Yes</div></div>'
      +'<div class="tc-kpi"><div class="tc-kpi-val" style="color:var(--teal);font-size:13px">'+(ea('crMegaYes')!==null?ea('crMegaYes')+'%':'—')+'</div><div class="tc-kpi-label">Mega Yes</div></div></div>'
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--blue-bg);border-radius:var(--r-sm);margin-bottom:8px"><span style="font-size:11px;font-weight:500;color:var(--blue-dark)">Additional margin (7d)</span><span style="font-size:14px;font-weight:600;color:var(--blue-dark)">€'+em.toLocaleString('de-DE')+'</span></div>'
      +(av!==null?'<div class="bar-row"><span class="bar-label">Avg. Skill</span><div class="bar-track"><div class="bar-fill" style="width:'+av+'%;background:'+(av>=80?'var(--teal)':av>=60?'var(--purple)':'var(--amber)')+'"></div></div><span class="bar-val">'+av+'%</span></div>':'')
      +(sr!==null?'<div class="bar-row"><span class="bar-label">SolidRoad</span><div class="bar-track"><div class="bar-fill" style="width:'+sr+'%;background:'+scoreColor(sr)+'"></div></div><span class="bar-val">'+sr+'%</span></div>':'')
      +(al.length?'<div style="margin-top:8px;padding:6px 10px;background:var(--amber-bg);border-radius:var(--r-sm);font-size:11px;color:var(--amber-dark)">⚠ '+al.map(function(a){return a.key;}).join(', ')+' below target</div>':'')
      +(rs?'<div style="margin-top:8px;font-size:12px;color:var(--text2)">Last session: <span class="badge" style="background:'+rs.bg+';color:'+rs.color+'">'+r+'</span></div>':'')
      +'</div>';
  });

  var oem7=ta!==null?Math.round(ta):null;
  var sy7=tb!==null?Math.round(tb):null;
  var my7=tc!==null?Math.round(tc):null;
  ma.innerHTML='<div class="topbar">'
    +'<div class="tb-left"><div class="av" style="width:40px;height:40px;font-size:17px;background:var(--purple-bg);color:var(--purple-dark)"><i class="ti ti-layout-grid"></i></div>'
    +'<div><div class="tb-name">Team Overview</div><div class="tb-meta">'+employees.length+' staff · 7-day average · <span class="ftp-badge"><i class="ti ti-refresh" style="font-size:11px"></i> FTP sync active</span></div></div></div>'
    +'</div>'
    +'<div class="content">'
    +'<div class="g5" style="margin-bottom:20px">'
    +'<div class="kpi" style="border-top-color:'+(oem7!==null&&oem7>=CR_GOOD?'var(--teal)':'var(--amber)')+'"><div class="kpi-label" style="color:'+(oem7!==null&&oem7>=CR_GOOD?'var(--teal)':'var(--amber)')+'">Team CR OEM</div><div class="kpi-val" style="color:'+(oem7!==null&&oem7>=CR_GOOD?'var(--teal)':'var(--amber)')+'">'+(oem7!==null?oem7+'%':'—')+'</div><div style="height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;margin-top:5px"><div style="height:100%;width:'+(oem7||0)+'%;background:'+(oem7!==null&&oem7>=CR_GOOD?'var(--teal)':'var(--amber)')+'"></div></div><div class="kpi-sub">Target ≥ '+CR_GOOD+'%</div></div>'
    +'<div class="kpi" style="border-top-color:var(--purple)"><div class="kpi-label" style="color:var(--purple)">Team Super Yes</div><div class="kpi-val" style="color:var(--purple)">'+(sy7!==null?sy7+'%':'—')+'</div><div class="kpi-sub">of all calls</div></div>'
    +'<div class="kpi" style="border-top-color:var(--teal)"><div class="kpi-label" style="color:var(--teal)">Team Mega Yes</div><div class="kpi-val" style="color:var(--teal)">'+(my7!==null?my7+'%':'—')+'</div><div class="kpi-sub">of all calls</div></div>'
    +'<div class="kpi" style="border-top-color:var(--blue)"><div class="kpi-label" style="color:var(--blue)">Additional Margin</div><div class="kpi-val" style="color:var(--blue)">€'+totalMargin.toLocaleString('de-DE')+'</div><div class="kpi-sub">7-day team total</div></div>'
    +'<div class="kpi" style="border-top-color:'+(totalAlerts>0?'var(--red)':'var(--teal)')+'"><div class="kpi-label" style="color:'+(totalAlerts>0?'var(--red)':'var(--teal)')+'">'+(totalAlerts>0?'Open Alerts':'All Clear')+'</div><div class="kpi-val" style="color:'+(totalAlerts>0?'var(--red)':'var(--teal)')+'">'+totalAlerts+'</div><div class="kpi-sub">'+(totalAlerts>0?'staff below target':'no alerts')+'</div></div>'
    +'</div>'
    +(totalAlerts>0?'<div class="alert alert-warn" style="margin-bottom:18px"><i class="ti ti-alert-triangle" style="font-size:18px;color:var(--amber);flex-shrink:0"></i><div><div style="font-size:13px;font-weight:600;color:var(--amber-dark)">'+totalAlerts+' alert'+(totalAlerts!==1?'s':'')+' across the team</div><div style="font-size:12px;color:var(--amber-dark)">'+employees.filter(function(e){return checkAlerts(e.id).length>0;}).map(function(e){return e.name;}).join(', ')+'</div></div></div>':'')
    +'<div class="sec-title" style="margin-bottom:10px">Conversion rates &amp; margin <span style="font-weight:400;color:var(--text3)">· CR as % of all calls · Good CR ≥ '+CR_GOOD+'%</span></div>'
    +'<div class="tbl" style="margin-bottom:24px"><table><thead><tr><th style="min-width:150px">Staff</th><th style="min-width:100px">CR OEM</th><th style="min-width:100px">Teilweise</th><th style="min-width:100px">Yes</th><th style="min-width:100px">Super Yes</th><th style="min-width:100px">Mega Yes</th><th>Margin</th><th>Opt./h</th><th>SolidRoad</th><th>Last rating</th><th>Alerts</th></tr></thead><tbody>'+rows+'</tbody></table></div>'
    +'<div class="sec-title" style="margin-bottom:12px">Staff cards</div>'
    +'<div class="team-grid">'+cards+'</div>'
    +'</div>';
}

function selectEmp(id){selectedEmp=id;view='emp';activeTab='performance';renderSidebar();renderMain();}

// ── EMP DETAIL ──
function renderEmpDetail(){
  var emp=employees.find(function(e){return e.id===selectedEmp;});
  if(!emp)return;
  var c=COLORS[emp.color%COLORS.length];
  var p=protocols[emp.id]||[];
  var tc=openTaskCount(emp.id);
  document.getElementById('mainArea').innerHTML=
    '<div class="topbar"><div class="tb-left">'
    +'<div class="av" style="width:42px;height:42px;font-size:14px;background:'+c.bg+';color:'+c.text+'">'+ini(emp.name)+'</div>'
    +'<div><div class="tb-name">'+emp.name+'</div><div class="tb-meta">'+emp.role+' · '+emp.phase+(emp.startDate?' · Started '+fd(emp.startDate):'')+' · '+p.length+' session'+(p.length!==1?'s':'')+'</div></div>'
    +'</div><div style="display:flex;gap:8px"><button class="btn" onclick="window.print()"><i class="ti ti-printer"></i> Print</button></div></div>'
    +'<div class="tab-bar" id="empTabBar">'
    +'<div class="tab" data-tab="performance" onclick="switchTab(\'performance\')">Performance</div>'
    +'<div class="tab" data-tab="protocols" onclick="switchTab(\'protocols\')">Protocols</div>'
    +'<div class="tab" data-tab="progress" onclick="switchTab(\'progress\')">Progress</div>'
    +'<div class="tab" data-tab="solidroad" onclick="switchTab(\'solidroad\')">SolidRoad</div>'
    +'<div class="tab" data-tab="onboarding" onclick="switchTab(\'onboarding\')">Onboarding</div>'
    +'<div class="tab" data-tab="tasks" onclick="switchTab(\'tasks\')" id="tasksTabBtn">Tasks'+(tc>0?' <span style="background:var(--purple);color:#fff;border-radius:20px;font-size:10px;font-weight:600;padding:1px 6px">'+tc+'</span>':'')+'</div>'
    +'</div>'
    +'<div class="content" id="tabContent"></div>';
  renderTabBar();
  renderTab();
}

function renderTabBar(){
  var bar=document.getElementById('empTabBar');
  if(!bar)return;
  bar.querySelectorAll('.tab').forEach(function(el){
    el.classList.toggle('active',el.dataset.tab===activeTab);
  });
}

function switchTab(t){activeTab=t;renderTabBar();renderTab();}

// ── RENDER TAB ──
function renderTab(){
  var emp=employees.find(function(e){return e.id===selectedEmp;});
  if(!emp)return;
  var tc2=document.getElementById('tabContent');
  if(!tc2)return;
  var p=protocols[emp.id]||[];
  var ob=onboarding[emp.id]||obSteps.map(function(){return false;});
  var obD=ob.filter(Boolean).length;
  var sr=solidroadData[emp.id]||{simulations:[]};
  var alerts=checkAlerts(emp.id);
  var html='';

  // ── PERFORMANCE TAB ──
  if(activeTab==='performance'){
    var perf7=getPerf(emp.id,7);
    function a7(key){return perf7.length?(perf7.reduce(function(a,x){return a+x[key];},0)/perf7.length).toFixed(1):'—';}
    var kpis=[
      {label:'CR OEM',key:'crOEM',color:'var(--amber)',target:KPI_TARGETS.crOEM,pct:true},
      {label:'CR Teilweise',key:'crTeilweise',color:'var(--text2)',target:null,pct:true},
      {label:'CR Super Yes',key:'crSuperYes',color:'var(--purple)',target:KPI_TARGETS.crSuperYes,pct:true},
      {label:'CR Mega Yes',key:'crMegaYes',color:'var(--teal)',target:KPI_TARGETS.crMegaYes,pct:true},
      {label:'Opt./Hour',key:'optPerH',color:'var(--blue)',target:KPI_TARGETS.optPerH,pct:false},
    ];
    html+='<div class="g5">';
    kpis.forEach(function(k){
      var v=a7(k.key);
      var hit=k.target?(parseFloat(v)>=k.target):true;
      html+='<div class="kpi" style="border-top-color:'+k.color+'">'
        +'<div class="kpi-label" style="color:'+k.color+'">'+k.label+'</div>'
        +'<div class="kpi-val" style="color:'+k.color+'">'+v+(k.pct&&v!=='—'?'%':'')+'</div>'
        +'<div class="kpi-sub" style="color:'+(k.target?(hit?'var(--teal)':'var(--red)'):'var(--text3)')+'">'+(k.target?'Target: '+k.target+(k.pct?'% ':' ')+(hit?'✓':'↓'):'7-day avg')+'</div>'
        +'</div>';
    });
    html+='</div>';
    if(alerts.length){
      html+='<div class="alert alert-danger" style="margin-bottom:16px">'
        +'<i class="ti ti-alert-circle" style="font-size:18px;color:var(--red);flex-shrink:0"></i>'
        +'<div><div style="font-size:13px;font-weight:600;color:var(--red)">Below target in '+alerts.length+' area'+(alerts.length!==1?'s':'')+'</div>'
        +'<div style="font-size:12px;color:var(--red)">'+alerts.map(function(a){return a.key+': '+a.val+' (target: '+a.target+')';}).join(' · ')+'</div>'
        +'<div style="margin-top:8px"><button class="btn btn-sm btn-danger" onclick="alert(\'Book a coaching session – calendar integration coming soon.\')"><i class="ti ti-calendar"></i> Book coaching session</button></div>'
        +'</div></div>';
    } else {
      html+='<div class="alert alert-ok" style="margin-bottom:16px">'
        +'<i class="ti ti-circle-check" style="font-size:18px;color:var(--teal);flex-shrink:0"></i>'
        +'<div><div style="font-size:13px;font-weight:600;color:var(--teal-dark)">All KPIs on target</div></div></div>';
    }
    // Chart
    html+='<div class="chart-wrap">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:10px">'
      +'<div style="font-size:11px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.05em">Performance trend</div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
      +'<div class="chart-toggle">'
      +'<button class="'+(perfMetric==='optPerH'?'active':'')+'" onclick="setMetric(\'optPerH\')">Opt./h</button>'
      +'<button class="'+(perfMetric==='crOEM'?'active':'')+'" onclick="setMetric(\'crOEM\')">CR OEM</button>'
      +'<button class="'+(perfMetric==='crSuperYes'?'active':'')+'" onclick="setMetric(\'crSuperYes\')">Super Yes</button>'
      +'<button class="'+(perfMetric==='crMegaYes'?'active':'')+'" onclick="setMetric(\'crMegaYes\')">Mega Yes</button>'
      +'</div>'
      +'<div class="chart-toggle">'
      +'<button class="'+(perfRange===7?'active':'')+'" onclick="setRange(7)">7d</button>'
      +'<button class="'+(perfRange===30?'active':'')+'" onclick="setRange(30)">30d</button>'
      +'<button class="'+(perfRange===90?'active':'')+'" onclick="setRange(90)">90d</button>'
      +'</div></div></div>'
      +'<canvas id="perfChart" height="80"></canvas></div>';
    // Manual entry form
    html+='<div class="card">'
      +'<div class="card-title"><i class="ti ti-plus"></i> Log Daily Performance</div>'
      +'<div class="f5"><div><label>Date</label><input type="date" id="pd" value="'+today()+'"></div>'
      +'<div><label>CR OEM %</label><input type="number" id="po" placeholder="0-100" min="0" max="100"></div>'
      +'<div><label>CR Super Yes %</label><input type="number" id="psy" placeholder="0-100" min="0" max="100"></div>'
      +'<div><label>CR Mega Yes %</label><input type="number" id="pmy" placeholder="0-100" min="0" max="100"></div>'
      +'<div><label>Opt./Hour</label><input type="number" id="pop" placeholder="0.0" step="0.1" min="0"></div></div>'
      +'<div class="f2"><div><label>CR Teilweise %</label><input type="number" id="pt" placeholder="0-100" min="0" max="100"></div>'
      +'<div><label>CR Yes %</label><input type="number" id="pyes" placeholder="0-100" min="0" max="100"></div></div>'
      +'<div style="margin-bottom:12px"><label>Note</label><input type="text" id="pn" placeholder="Optional..."></div>'
      +'<button class="btn btn-primary btn-sm" style="width:auto" onclick="savePerf()"><i class="ti ti-check"></i> Save Entry</button>'
      +'</div>';
    // Log table
    var perf=performance[emp.id]||[];
    if(perf.length>0){
      html+='<div class="sec-title">Daily log</div><div class="tbl"><table><thead><tr><th>Date</th><th>CR OEM</th><th>Teilw.</th><th>Yes</th><th>Super Yes</th><th>Mega Yes</th><th>Opt./h</th><th>Margin</th></tr></thead><tbody>';
      perf.slice(0,20).forEach(function(row){
        html+='<tr><td>'+fd(row.date)+'</td>'
          +'<td style="color:var(--amber);font-weight:600">'+row.crOEM+'%</td>'
          +'<td>'+row.crTeilweise+'%</td>'
          +'<td>'+row.crYes+'%</td>'
          +'<td style="color:var(--purple);font-weight:600">'+row.crSuperYes+'%</td>'
          +'<td style="color:var(--teal);font-weight:600">'+row.crMegaYes+'%</td>'
          +'<td>'+row.optPerH.toFixed(1)+'</td>'
          +'<td style="color:var(--blue)">€'+(row.margin||0)+'</td></tr>';
      });
      html+='</tbody></table></div>';
    }
  }

  // ── PROTOCOLS TAB ──
  if(activeTab==='protocols'){
    html+='<div class="card"><div class="card-title"><i class="ti ti-edit"></i> New Protocol</div>'
      +'<div class="f3"><div><label>Date</label><input type="date" id="nd" value="'+today()+'"></div>'
      +'<div><label>Rating</label><select id="nr">'+RATINGS.map(function(r){return '<option>'+r+'</option>';}).join('')+'</select></div>'
      +'<div><label>Focus topic</label><input type="text" id="nf" placeholder="Topic of this session"></div></div>'
      +'<div style="margin-bottom:10px"><label>Notes</label><textarea id="nt" placeholder="What stood out..."></textarea></div>'
      +'<div style="margin-bottom:12px"><label>Rate criteria (0–100)</label>'
      +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;margin-top:6px">';
    ratingCriteria.forEach(function(rc){
      html+='<div><label style="font-size:11px">'+rc.name+'</label><input type="number" id="rc-'+rc.id+'" placeholder="'+rc.target+'" min="0" max="100"></div>';
    });
    html+='</div></div>'
      +'<div style="display:flex;gap:10px">'
      +'<button class="btn btn-primary btn-sm" onclick="saveNote()"><i class="ti ti-check"></i> Save Protocol</button>'
      +'<button class="btn btn-sm" onclick="openModal(\'ratingModal\')"><i class="ti ti-plus"></i> Add criterion</button>'
      +'<button class="btn btn-sm" style="color:var(--purple);border-color:var(--purple)" onclick="addTaskFromCurrentProtocol()"><i class="ti ti-checkbox"></i> Add as task</button>'
      +'</div></div>';
    if(p.length===0){html+='<div class="empty">No protocols yet.</div>';}
    else{
      html+='<div class="sec-title">Previous sessions</div>';
      p.forEach(function(pr){
        var rs=RS[pr.rating];
        html+='<div class="proto"><div class="proto-hdr">'
          +'<div class="proto-meta"><i class="ti ti-calendar" style="font-size:12px"></i>'+fd(pr.date)+(pr.focus?' · '+pr.focus:'')+'</div>'
          +'<span class="badge" style="background:'+rs.bg+';color:'+rs.color+'">'+pr.rating+'</span></div>'
          +'<div style="font-size:13px;line-height:1.6">'+pr.note+'</div>';
        if(pr.criteria&&Object.keys(pr.criteria).length){
          html+='<div class="crit-tags">';
          ratingCriteria.forEach(function(rc){
            if(pr.criteria[rc.id]===undefined)return;
            var v=pr.criteria[rc.id];
            var col=v>=rc.target?'var(--teal-bg)':v>=rc.target*.8?'var(--amber-bg)':'var(--red-bg)';
            var tc=v>=rc.target?'var(--teal-dark)':v>=rc.target*.8?'var(--amber-dark)':'var(--red)';
            html+='<span style="font-size:11px;font-weight:500;padding:3px 8px;border-radius:20px;background:'+col+';color:'+tc+'">'+rc.name+': '+v+'%</span>';
          });
          html+='</div>';
        }
        html+='</div>';
      });
    }
    html+='<div class="sec-title" style="margin-top:20px">Rating criteria</div>'
      +'<div class="tbl"><table><thead><tr><th>Criterion</th><th>Category</th><th>Target</th><th>Description</th></tr></thead><tbody>';
    ratingCriteria.forEach(function(rc){
      html+='<tr><td style="font-weight:500">'+rc.name+'</td><td><span class="badge" style="background:var(--bg2);color:var(--text2)">'+rc.cat+'</span></td><td>'+rc.target+'%</td><td style="color:var(--text2)">'+rc.desc+'</td></tr>';
    });
    html+='</tbody></table></div><button class="btn btn-sm" onclick="openModal(\'ratingModal\')"><i class="ti ti-plus"></i> Add criterion</button>';
  }

  // ── PROGRESS TAB ──
  if(activeTab==='progress'){
    var perf7b=getPerf(emp.id,7);
    function avb(key){return perf7b.length?(perf7b.reduce(function(a,x){return a+x[key];},0)/perf7b.length).toFixed(1):'—';}
    if(alerts.length){
      html+='<div class="alert alert-danger" style="margin-bottom:16px">'
        +'<i class="ti ti-alert-circle" style="font-size:18px;color:var(--red);flex-shrink:0"></i>'
        +'<div><div style="font-size:13px;font-weight:600;color:var(--red)">KPIs below target – coaching session recommended</div>'
        +'<div style="font-size:12px;color:var(--red)">'+alerts.map(function(a){return a.key+': '+a.val+' vs target '+a.target;}).join(' · ')+'</div>'
        +'<div style="margin-top:8px"><button class="btn btn-sm btn-danger" onclick="alert(\'Book a coaching session.\')"><i class="ti ti-calendar"></i> Book a session</button></div>'
        +'</div></div>';
    }
    html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">'
      +'<div><div class="sec-title">Skill profile (latest session)</div>';
    if(p.length===0){html+='<div class="empty" style="padding:1.5rem">No data yet.</div>';}
    else{
      var latest=p[0];var skills=latest.skills||{};var first=p[p.length-1].skills||{};
      SKILLS.forEach(function(s,i){
        var key=SK_DE[i];var val=skills[key]||0;var prev=first[key]||0;var delta=val-prev;
        var col=val>=80?'var(--teal)':val>=60?'var(--purple)':'var(--amber)';
        html+='<div class="skill-row"><span class="skill-label">'+s+'</span>'
          +'<div class="skill-track"><div class="skill-fill" style="width:'+val+'%;background:'+col+'"></div></div>'
          +'<span class="skill-pct">'+val+'%</span>'
          +'<span class="skill-delta" style="color:'+(delta>=0?'var(--teal)':'var(--red)')+'">'+(delta>=0?'+':'')+delta+'</span></div>';
      });
    }
    html+='</div><div><div class="sec-title">Performance (7-day avg)</div><div class="g2">'
      +'<div class="kpi" style="border-top-color:var(--amber)"><div class="kpi-label" style="color:var(--amber)">CR OEM</div><div class="kpi-val" style="color:var(--amber)">'+avb('crOEM')+(avb('crOEM')!=='—'?'%':'')+'</div><div class="kpi-sub" style="color:'+(parseFloat(avb('crOEM'))>=KPI_TARGETS.crOEM?'var(--teal)':'var(--red)')+'">Target: '+KPI_TARGETS.crOEM+'%</div></div>'
      +'<div class="kpi" style="border-top-color:var(--purple)"><div class="kpi-label" style="color:var(--purple)">Super Yes</div><div class="kpi-val" style="color:var(--purple)">'+avb('crSuperYes')+(avb('crSuperYes')!=='—'?'%':'')+'</div><div class="kpi-sub" style="color:'+(parseFloat(avb('crSuperYes'))>=KPI_TARGETS.crSuperYes?'var(--teal)':'var(--red)')+'">Target: '+KPI_TARGETS.crSuperYes+'%</div></div>'
      +'<div class="kpi" style="border-top-color:var(--teal)"><div class="kpi-label" style="color:var(--teal)">Mega Yes</div><div class="kpi-val" style="color:var(--teal)">'+avb('crMegaYes')+(avb('crMegaYes')!=='—'?'%':'')+'</div><div class="kpi-sub" style="color:'+(parseFloat(avb('crMegaYes'))>=KPI_TARGETS.crMegaYes?'var(--teal)':'var(--red)')+'">Target: '+KPI_TARGETS.crMegaYes+'%</div></div>'
      +'<div class="kpi" style="border-top-color:var(--blue)"><div class="kpi-label" style="color:var(--blue)">Opt./Hour</div><div class="kpi-val" style="color:var(--blue)">'+avb('optPerH')+'</div><div class="kpi-sub" style="color:'+(parseFloat(avb('optPerH'))>=KPI_TARGETS.optPerH?'var(--teal)':'var(--red)')+'">Target: '+KPI_TARGETS.optPerH+'</div></div>'
      +'</div></div></div>';
    if(p.length>0){
      html+='<div class="sec-title">Session history</div><div class="sess-hist">';
      p.forEach(function(pr,i){
        var rs=RS[pr.rating];
        var sa=pr.skills?Math.round(Object.values(pr.skills).reduce(function(a,b){return a+b;},0)/Object.values(pr.skills).length):null;
        var bc=pr.rating==='Mega Yes'?'var(--teal)':pr.rating==='Super Yes'?'var(--purple)':pr.rating==='Yes'?'var(--blue)':'var(--amber)';
        html+='<div class="sess-row">'
          +'<span style="font-size:11px;color:var(--text3);width:18px;text-align:right">'+(p.length-i)+'</span>'
          +'<span style="font-size:12px;color:var(--text2);width:74px">'+fd(pr.date)+'</span>'
          +'<span class="badge" style="background:'+rs.bg+';color:'+rs.color+'">'+pr.rating+'</span>'
          +(sa!==null?'<div style="flex:1;height:5px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+sa+'%;background:'+bc+';border-radius:3px"></div></div><span style="font-size:12px;color:var(--text2);width:32px;text-align:right">'+sa+'%</span>':'<div style="flex:1"></div>')
          +'<span style="font-size:12px;color:var(--text2);width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(pr.focus||'')+'</span></div>';
      });
      html+='</div>';
    }
  }

  // ── SOLIDROAD TAB ──
  if(activeTab==='solidroad'){
    var sims=sr.simulations;
    var srScore=sims.length?Math.round(sims.reduce(function(a,s){return a+s.score;},0)/sims.length):null;
    if(!settings.srApiKey){
      html+='<div style="background:var(--purple-bg);border:1px solid var(--border);border-radius:var(--r-lg);padding:24px;text-align:center;margin-bottom:14px">'
        +'<div style="font-size:36px;color:var(--purple);margin-bottom:10px"><i class="ti ti-robot"></i></div>'
        +'<div style="font-size:16px;font-weight:600;margin-bottom:6px">Connect SolidRoad</div>'
        +'<div style="font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.6">Add your API key in Settings to sync simulation scores automatically.</div>'
        +'<button class="btn btn-primary btn-sm" style="width:auto;margin:0 auto" onclick="showView(\'settings\')"><i class="ti ti-settings"></i> Go to Settings</button></div>';
    }
    if(srScore!==null){
      html+='<div class="g4">'
        +'<div class="kpi" style="border-top-color:'+scoreColor(srScore)+'"><div class="kpi-label" style="color:'+scoreColor(srScore)+'">Avg. Score</div><div class="kpi-val" style="color:'+scoreColor(srScore)+'">'+srScore+'%</div><div class="kpi-sub">all simulations</div></div>'
        +'<div class="kpi" style="border-top-color:var(--blue)"><div class="kpi-label" style="color:var(--blue)">Simulations</div><div class="kpi-val" style="color:var(--blue)">'+sims.length+'</div><div class="kpi-sub">completed</div></div>'
        +'<div class="kpi" style="border-top-color:var(--teal)"><div class="kpi-label" style="color:var(--teal)">Best Score</div><div class="kpi-val" style="color:var(--teal)">'+Math.max.apply(null,sims.map(function(s){return s.score;}))+'%</div><div class="kpi-sub">highest simulation</div></div>'
        +'<div class="kpi" style="border-top-color:var(--purple)"><div class="kpi-label" style="color:var(--purple)">Passed</div><div class="kpi-val" style="color:var(--purple)">'+sims.filter(function(s){return s.status==='passed';}).length+'</div><div class="kpi-sub">of '+sims.length+'</div></div>'
        +'</div>';
    }
    if(sims.length>0){
      html+='<div class="sec-title">Simulations</div>';
      sims.forEach(function(s){
        var col=scoreColor(s.score);
        html+='<div class="sr-sim"><div class="sr-ring" style="border-color:'+col+';color:'+col+'">'+s.score+'%</div>'
          +'<div style="flex:1"><div style="font-size:13px;font-weight:500">'+s.name+'</div><div style="font-size:12px;color:var(--text2);margin-top:2px">'+fd(s.date)+'</div>'
          +'<div class="sr-tags">'+s.tags.map(function(t){return '<span class="sr-tag">'+t+'</span>';}).join('')+'</div></div></div>';
      });
    } else if(settings.srApiKey){html+='<div class="empty">No simulations completed yet.</div>';}
    if(settings.srApiKey){
      html+='<div class="card"><div class="card-title"><i class="ti ti-plus"></i> Log Simulation Manually</div>'
        +'<div class="f3"><div><label>Name</label><input type="text" id="srName" placeholder="e.g. Objection: Price too high"></div>'
        +'<div><label>Date</label><input type="date" id="srDate" value="'+today()+'"></div>'
        +'<div><label>Score (%)</label><input type="number" id="srScore" placeholder="0-100" min="0" max="100"></div></div>'
        +'<div style="margin-bottom:12px"><label>Tags (comma separated)</label><input type="text" id="srTags" placeholder="e.g. Objection Handling, Closing"></div>'
        +'<button class="btn btn-primary btn-sm" style="width:auto" onclick="saveSRSim()"><i class="ti ti-check"></i> Save</button></div>';
    }
  }

  // ── ONBOARDING TAB ──
  if(activeTab==='onboarding'){
    var startDate=emp.startDate?new Date(emp.startDate+'T00:00:00'):null;
    var days=[...new Set(obSteps.map(function(s){return s.day;}))].sort(function(a,b){return a-b;});
    var totalSteps=obSteps.length;
    var completedSteps=ob.filter(Boolean).length;
    var pct=totalSteps?Math.round(completedSteps/totalSteps*100):0;
    var currentDay=days.find(function(day){return obSteps.filter(function(s){return s.day===day;}).some(function(s){return !ob[obSteps.indexOf(s)];});})||days[days.length-1];
    var level=pct>=100?'Expert':pct>=75?'Advanced':pct>=50?'Intermediate':pct>=25?'Developing':'Beginner';
    var levelColor=pct>=100?'var(--teal)':pct>=75?'var(--purple)':pct>=50?'var(--blue)':pct>=25?'var(--amber)':'var(--text2)';
    var levelBg=pct>=100?'var(--teal-bg)':pct>=75?'var(--purple-bg)':pct>=50?'var(--blue-bg)':pct>=25?'var(--amber-bg)':'var(--bg2)';
    var daysSince=startDate?Math.floor((new Date()-startDate)/86400000)+1:null;
    // Summary cards
    html+='<div class="g4" style="margin-bottom:20px">'
      +'<div class="kpi" style="border-top-color:'+levelColor+'"><div class="kpi-label" style="color:'+levelColor+'">Level</div><div class="kpi-val" style="color:'+levelColor+';font-size:17px">'+level+'</div><div class="kpi-sub">'+pct+'% complete</div></div>'
      +'<div class="kpi" style="border-top-color:var(--teal)"><div class="kpi-label" style="color:var(--teal)">Steps done</div><div class="kpi-val" style="color:var(--teal)">'+completedSteps+'<span style="font-size:13px;color:var(--text3)"> / '+totalSteps+'</span></div><div class="kpi-sub">'+(totalSteps-completedSteps)+' remaining</div></div>'
      +'<div class="kpi" style="border-top-color:var(--purple)"><div class="kpi-label" style="color:var(--purple)">Active day</div><div class="kpi-val" style="color:var(--purple)">Day '+currentDay+'</div><div class="kpi-sub">'+(pct>=100?'All done':'Current focus')+'</div></div>'
      +'<div class="kpi" style="border-top-color:var(--blue)"><div class="kpi-label" style="color:var(--blue)">Days since start</div><div class="kpi-val" style="color:var(--blue)">'+(daysSince!==null?daysSince:'—')+'</div><div class="kpi-sub">'+(emp.startDate?'Since '+fd(emp.startDate):'No start date')+'</div></div>'
      +'</div>';
    // Donut + Level ladder
    html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">'
      +'<div class="card" style="margin-bottom:0"><div class="card-title"><i class="ti ti-chart-donut"></i> Overall progress</div>'
      +'<div style="display:flex;align-items:center;gap:20px">'
      +'<div style="position:relative;width:96px;height:96px;flex-shrink:0">'
      +'<svg viewBox="0 0 36 36" style="width:96px;height:96px;transform:rotate(-90deg)">'
      +'<circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--bg3)" stroke-width="3.2"/>'
      +'<circle cx="18" cy="18" r="15.9" fill="none" stroke="'+levelColor+'" stroke-width="3.2" stroke-dasharray="'+pct+' '+(100-pct)+'" stroke-linecap="round"/>'
      +'</svg>'
      +'<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center"><span style="font-size:17px;font-weight:600;color:'+levelColor+'">'+pct+'%</span></div></div>'
      +'<div style="flex:1">';
    days.forEach(function(day){
      var ds=obSteps.filter(function(s){return s.day===day;});
      var done=ds.filter(function(s){return ob[obSteps.indexOf(s)];}).length;
      var dp=Math.round(done/ds.length*100);
      var dc=dp===100?'var(--teal)':dp>=50?'var(--purple)':'var(--amber)';
      html+='<div style="margin-bottom:9px">'
        +'<div style="display:flex;justify-content:space-between;margin-bottom:3px">'
        +'<span style="font-size:12px;color:var(--text2)">Day '+day+'</span>'
        +'<span style="font-size:12px;font-weight:600;color:'+(dp===100?'var(--teal)':'var(--text2)')+'">'+done+'/'+ds.length+(dp===100?' ✓':'')+'</span></div>'
        +'<div style="height:6px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+dp+'%;background:'+dc+';border-radius:3px"></div></div></div>';
    });
    html+='</div></div></div>'
      +'<div class="card" style="margin-bottom:0"><div class="card-title"><i class="ti ti-trophy"></i> Onboarding level</div>'
      +'<div style="display:flex;flex-direction:column;gap:6px">';
    [['Beginner','0–24%',0],['Developing','25–49%',25],['Intermediate','50–74%',50],['Advanced','75–99%',75],['Expert','100%',100]].forEach(function(entry){
      var lv=entry[0],range=entry[1],threshold=entry[2];
      var active=level===lv,reached=pct>=threshold;
      html+='<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:var(--r-md);background:'+(active?levelBg:'var(--bg2)')+';border:1px solid '+(active?levelColor:'transparent')+'">'
        +'<div style="width:26px;height:26px;border-radius:50%;background:'+(reached?(active?levelColor:'var(--teal)'):'var(--bg3)')+';display:flex;align-items:center;justify-content:center;flex-shrink:0">'
        +'<i class="ti ti-'+(reached?'check':'lock')+'" style="font-size:12px;color:'+(reached?'#fff':'var(--text3)')+'"></i></div>'
        +'<div style="flex:1"><div style="font-size:13px;font-weight:'+(active?'600':'400')+';color:'+(active?levelColor:'var(--text2)')+'">'+lv+'</div>'
        +'<div style="font-size:11px;color:var(--text3)">'+range+'</div></div>'
        +(active?'<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:'+levelColor+';color:#fff">Current</span>':'')
        +'</div>';
    });
    html+='</div></div></div>';
    // Steps by day
    html+='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">'
      +'<div class="sec-title" style="margin-bottom:0">Steps by day</div>'
      +'<button class="btn btn-sm" onclick="openModal(\'obModal\')"><i class="ti ti-plus"></i> Add step</button></div>';
    days.forEach(function(day){
      var daySteps=obSteps.filter(function(s){return s.day===day;});
      var dayDone=daySteps.filter(function(s){return ob[obSteps.indexOf(s)];}).length;
      var dayPct=Math.round(dayDone/daySteps.length*100);
      var dateLabel='';
      if(startDate){
        var dd=new Date(startDate.getTime()+(day-1)*86400000);
        dateLabel=' · '+fd(dd.toISOString().slice(0,10));
      }
      html+='<div style="margin-bottom:10px"><div class="ob-day-hdr">'
        +'<i class="ti ti-calendar-event" style="color:var(--purple);font-size:16px"></i>'
        +'<span class="ob-day-label">Day '+day+dateLabel+'</span>'
        +'<span style="font-size:12px;color:var(--text2)">'+dayDone+'/'+daySteps.length+'</span>'
        +'<div style="flex:1;height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;max-width:120px;margin:0 10px">'
        +'<div style="height:100%;width:'+dayPct+'%;background:'+(dayPct===100?'var(--teal)':'var(--purple)')+';border-radius:3px"></div></div>'
        +'<span style="font-size:11px;font-weight:600;color:'+(dayPct===100?'var(--teal)':'var(--text3)')+'">'+(dayPct===100?'✓ Done':dayPct+'%')+'</span></div><div>';
      daySteps.forEach(function(step){
        var i=obSteps.indexOf(step);
        html+='<div class="ob-step">'
          +'<div class="ob-hdr" onclick="toggleOBDetail('+i+')">'
          +'<div class="ob-check'+(ob[i]?' done':'')+'" onclick="event.stopPropagation();toggleOB('+i+')">'+(ob[i]?'<i class="ti ti-check" style="font-size:11px"></i>':'')+'</div>'
          +'<span class="ob-label">'+step.label+'</span>'
          +'<span class="ob-status">'+(ob[i]?'Completed':'Pending')+'</span>'
          +'<i class="ti ti-chevron-down ob-chev" id="chev-'+i+'"></i></div>'
          +'<div class="ob-detail" id="ob-d-'+i+'">'
          +'<div class="ob-desc">'+step.detail+'</div>'
          +'<div class="ob-video-wrap">'
          +'<div class="ob-video-label"><span><i class="ti ti-video" style="font-size:13px;margin-right:4px"></i>Training video</span>'+(step.videoUrl?'<span class="ftp-badge"><i class="ti ti-cloud" style="font-size:11px"></i> FTP</span>':'')+'</div>'
          +(step.videoUrl?'<video controls preload="metadata" style="width:100%;max-height:280px;border-radius:var(--r-sm);background:#000"><source src="'+step.videoUrl+'"><p style="font-size:12px;color:var(--text2);padding:8px">Cannot play. <a href="'+step.videoUrl+'" target="_blank">Open directly</a></p></video>':'<div style="font-size:12px;color:var(--text3);margin-bottom:8px">No video linked yet.</div>')
          +'<div style="display:flex;gap:8px;margin-top:8px"><input type="url" id="vid-'+i+'" placeholder="FTP path or https://" value="'+(step.videoUrl||'')+'" style="font-size:12px"><button class="btn btn-sm" onclick="saveVideoUrl('+i+')"><i class="ti ti-check"></i> Save</button></div>'
          +'</div></div></div>';
      });
      html+='</div></div>';
    });
  }

  // ── TASKS TAB ──
  if(activeTab==='tasks'){
    var empTasks=tasks[emp.id]||[];
    var todayStr=today();
    function isOD(t){return !t.done&&t.dueDate&&t.dueDate<todayStr;}
    var openTasks=empTasks.filter(function(t){return !t.done&&!isOD(t);});
    var overdueTasks=empTasks.filter(function(t){return isOD(t);});
    var doneTasks=empTasks.filter(function(t){return t.done;});
    var prioStyle={high:{bg:'var(--red-bg)',color:'var(--red)'},medium:{bg:'var(--amber-bg)',color:'var(--amber-dark)'},low:{bg:'var(--bg2)',color:'var(--text2)'}};
    // Summary
    html+='<div class="g3" style="margin-bottom:20px">'
      +'<div class="kpi" style="border-top-color:var(--purple)"><div class="kpi-label" style="color:var(--purple)">Open</div><div class="kpi-val" style="color:var(--purple)">'+openTasks.length+'</div><div class="kpi-sub">'+(openTasks.length===0?'All clear':'task'+(openTasks.length!==1?'s':'')+' to do')+'</div></div>'
      +'<div class="kpi" style="border-top-color:'+(overdueTasks.length>0?'var(--red)':'var(--teal)')+'"><div class="kpi-label" style="color:'+(overdueTasks.length>0?'var(--red)':'var(--teal)')+'">Overdue</div><div class="kpi-val" style="color:'+(overdueTasks.length>0?'var(--red)':'var(--teal)')+'">'+overdueTasks.length+'</div><div class="kpi-sub">'+(overdueTasks.length>0?'deadline missed':'no overdue tasks')+'</div></div>'
      +'<div class="kpi" style="border-top-color:var(--teal)"><div class="kpi-label" style="color:var(--teal)">Completed</div><div class="kpi-val" style="color:var(--teal)">'+doneTasks.length+'</div><div class="kpi-sub">'+(empTasks.length>0?Math.round(doneTasks.length/empTasks.length*100)+'% completion':'no tasks yet')+'</div></div>'
      +'</div>';
    html+='<div style="display:flex;justify-content:flex-end;margin-bottom:14px"><button class="btn btn-primary btn-sm" onclick="openModal(\'addTaskModal\')"><i class="ti ti-plus"></i> Add task</button></div>';
    if(empTasks.length===0){html+='<div class="empty">No tasks yet. Add tasks manually or from a protocol.</div>';}
    function taskCard(t){
      var ps=prioStyle[t.priority]||prioStyle.low;
      var od=isOD(t);
      var dueDays=t.dueDate&&!t.done?Math.ceil((new Date(t.dueDate)-new Date(todayStr))/86400000):null;
      var dueLabel='',dueColor='var(--text3)';
      if(t.dueDate){
        if(t.done){dueLabel='Completed';}
        else if(dueDays<0){dueLabel='Overdue by '+Math.abs(dueDays)+'d';dueColor='var(--red)';}
        else if(dueDays===0){dueLabel='Due today';dueColor='var(--amber)';}
        else if(dueDays===1){dueLabel='Due tomorrow';}
        else{dueLabel='Due in '+dueDays+'d';}
      }
      return '<div class="task-item'+(od?' overdue':'')+(t.done?' done-item':'')+'" id="task-'+t.id+'">'
        +'<div class="task-row" onclick="toggleTaskDetail('+t.id+')">'
        +'<div class="task-check'+(t.done?' done':'')+'" onclick="event.stopPropagation();toggleTask('+t.id+')">'+(t.done?'<i class="ti ti-check" style="font-size:11px"></i>':'')+'</div>'
        +'<div style="flex:1;min-width:0"><div class="task-title'+(t.done?' done':'')+'">'+(od?'<i class="ti ti-alert-circle" style="font-size:13px;color:var(--red);margin-right:4px"></i>':'')+t.text+'</div>'
        +'<div class="task-meta">'+(t.source?'<span>'+t.source+'</span>':'')+( dueLabel?'<span style="color:'+dueColor+'">'+dueLabel+'</span>':'')+'</div></div>'
        +'<span class="task-prio" style="background:'+ps.bg+';color:'+ps.color+'">'+t.priority+'</span>'
        +'<button class="task-del" onclick="event.stopPropagation();deleteTask('+t.id+')"><i class="ti ti-x"></i></button>'
        +'</div>'
        +'<div class="task-detail" id="td-'+t.id+'">'+(t.description||'No description added.')
        +'<div class="task-actions">'
        +(!t.done?'<button class="btn btn-sm btn-primary" onclick="toggleTask('+t.id+')"><i class="ti ti-check"></i> Mark as done</button>':'<button class="btn btn-sm" onclick="toggleTask('+t.id+')"><i class="ti ti-rotate-left"></i> Reopen</button>')
        +'<button class="btn btn-sm btn-danger" onclick="deleteTask('+t.id+')"><i class="ti ti-trash"></i> Delete</button>'
        +'</div></div></div>';
    }
    if(overdueTasks.length>0){
      html+='<div class="sec-title" style="color:var(--red)">Overdue ('+overdueTasks.length+')</div>';
      overdueTasks.forEach(function(t){html+=taskCard(t);});
    }
    if(openTasks.length>0){
      html+='<div class="sec-title" style="margin-top:'+(overdueTasks.length?'16px':'0')+'">Open ('+openTasks.length+')</div>';
      openTasks.forEach(function(t){html+=taskCard(t);});
    }
    if(doneTasks.length>0){
      html+='<div class="sec-title" style="margin-top:16px">Completed ('+doneTasks.length+')</div>';
      doneTasks.forEach(function(t){html+=taskCard(t);});
    }
  }

  tc2.innerHTML=html;

  // Render chart
  if(activeTab==='performance'){
    setTimeout(function(){
      var canvas=document.getElementById('perfChart');
      if(!canvas)return;
      if(activeChart){activeChart.destroy();activeChart=null;}
      var data=getPerf(selectedEmp,perfRange);
      var labels=data.map(function(d){return fd(d.date);});
      var vals=data.map(function(d){return d[perfMetric];});
      var target=KPI_TARGETS[perfMetric];
      var colors={optPerH:'#378ADD',crOEM:'#BA7517',crSuperYes:'#534AB7',crMegaYes:'#1D9E75',crTeilweise:'#888780',crYes:'#639922'};
      var col=colors[perfMetric]||'#534AB7';
      var mLabels={optPerH:'Opt./Hour',crOEM:'CR OEM %',crSuperYes:'CR Super Yes %',crMegaYes:'CR Mega Yes %',crTeilweise:'CR Teilweise %',crYes:'CR Yes %'};
      var datasets=[{label:mLabels[perfMetric]||perfMetric,data:vals,borderColor:col,backgroundColor:col+'22',fill:true,tension:0.35,pointRadius:perfRange<=7?4:2,pointBackgroundColor:col}];
      if(target)datasets.push({label:'Target ('+target+')',data:data.map(function(){return target;}),borderColor:'#E24B4A',borderDash:[4,3],borderWidth:1.5,pointRadius:0,fill:false});
      activeChart=new Chart(canvas,{type:'line',data:{labels:labels,datasets:datasets},options:{responsive:true,plugins:{legend:{display:false}},scales:{x:{ticks:{font:{size:11},maxTicksLimit:10},grid:{display:false}},y:{ticks:{font:{size:11}},grid:{color:'rgba(0,0,0,0.05)'}}}}});
    },50);
  }
}

// ── SETTINGS ──
function renderSettings(){
  document.getElementById('mainArea').innerHTML=
    '<div class="topbar"><div class="tb-left"><div class="av" style="width:40px;height:40px;font-size:17px;background:var(--bg2);color:var(--text2)"><i class="ti ti-settings"></i></div>'
    +'<div><div class="tb-name">Settings</div><div class="tb-meta">Integrations &amp; configuration</div></div></div></div>'
    +'<div class="content" style="max-width:600px">'
    +'<div class="sec-title" style="margin-bottom:12px">Integrations</div>'
    +'<div class="set-row" style="cursor:pointer" onclick="openModal(\'srModal\')">'
    +'<div class="set-icon" style="background:var(--purple-bg);color:var(--purple)"><i class="ti ti-robot"></i></div>'
    +'<div style="flex:1"><div style="font-size:13px;font-weight:500">SolidRoad</div><div style="font-size:12px;color:var(--text2)">AI-powered sales simulations</div></div>'
    +(settings.srApiKey?'<span class="connected">Connected</span>':'<span class="disconnected">Not connected</span>')
    +'</div>'
    +'<div class="set-row"><div class="set-icon" style="background:var(--teal-bg);color:var(--teal)"><i class="ti ti-refresh"></i></div>'
    +'<div style="flex:1"><div style="font-size:13px;font-weight:500">FTP Data Sync</div><div style="font-size:12px;color:var(--text2)">Performance CSV auto-import</div>'
    +'<div style="margin-top:8px"><input type="url" id="ftpInput" placeholder="ftp://yourserver.com/performance/" value="'+settings.ftpUrl+'" style="font-size:12px"></div></div>'
    +'<div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end"><span class="connected">Active</span><button class="btn btn-sm btn-primary" onclick="saveFTP()">Save</button></div></div>'
    +'<div class="set-row"><div class="set-icon" style="background:var(--amber-bg);color:var(--amber)"><i class="ti ti-brand-github"></i></div>'
    +'<div style="flex:1"><div style="font-size:13px;font-weight:500">GitHub Pages</div><div style="font-size:12px;color:var(--text2)">wiegand-sales.github.io/coaching-dashboard</div></div>'
    +'<span class="disconnected">Pending</span></div>'
    +'<div class="sec-title" style="margin-top:24px;margin-bottom:12px">KPI Targets</div>'
    +'<div class="card"><div class="card-title"><i class="ti ti-target"></i> Performance targets (used for alerts)</div>'
    +'<div class="g4"><div><label>CR OEM target %</label><input type="number" id="tOEM" value="'+KPI_TARGETS.crOEM+'"></div>'
    +'<div><label>Super Yes target %</label><input type="number" id="tSY" value="'+KPI_TARGETS.crSuperYes+'"></div>'
    +'<div><label>Mega Yes target %</label><input type="number" id="tMY" value="'+KPI_TARGETS.crMegaYes+'"></div>'
    +'<div><label>Opt./Hour target</label><input type="number" id="tOpt" value="'+KPI_TARGETS.optPerH+'"></div></div>'
    +'<button class="btn btn-primary btn-sm" style="width:auto" onclick="saveTargets()"><i class="ti ti-check"></i> Save targets</button></div>'
    +'<div class="sec-title" style="margin-top:4px;margin-bottom:12px">About</div>'
    +'<div class="set-row"><div class="set-icon" style="background:var(--bg2);color:var(--text2)"><i class="ti ti-info-circle"></i></div>'
    +'<div><div style="font-size:13px;font-weight:500">Sales Coaching Dashboard</div><div style="font-size:12px;color:var(--text2)">Wiegand &amp; Partner · v3.0 · Built for Peter Rode</div></div></div>'
    +'</div>';
}