// ══════════════════════════════════════════════
// APP STATE
// ══════════════════════════════════════════════
var ansicht = 'coach'; // 'coach' | 'manager' | 'uebersicht'
var ausgewaehlterId = 1;
var aktiverTab = 'profil';
var aktivesScorecardId = null; // session ID die gerade bewertet wird

// ══════════════════════════════════════════════
// SIDEBAR
// ══════════════════════════════════════════════
function renderSidebar(){
  var el=document.getElementById('mitarbeiterListe');
  if(!el)return;
  el.innerHTML='';
  document.querySelectorAll('.sb-item').forEach(function(x){x.classList.remove('aktiv');});
  var navOverview=document.getElementById('nav-sfp-overview');
  var navCoach=document.getElementById('nav-coach');
  if(ansicht==='sfp-overview'&&navOverview)navOverview.classList.add('aktiv');
  if(ansicht==='coach'&&navCoach)navCoach.classList.add('aktiv');

  aktiveMitarbeiter().forEach(function(ma){
    var f=FARBEN[ma.farbe%FARBEN.length];
    var ls=letzteSession(ma.id);
    var lsBw=ls?BW[ls.gesamtBewertung]:null;
    var al=alertsPruefen(ma);
    var d=document.createElement('div');
    d.className='ma-item'+(ausgewaehlterId===ma.id?' aktiv':'');
    d.innerHTML='<div class="av" style="width:32px;height:32px;font-size:12px;background:'+f.bg+';color:'+f.text+'">'+kuerzel(ma.name)+'</div>'
      +'<div style="flex:1;min-width:0"><div class="ma-name">'+ma.name+'</div><div class="ma-rolle">'+ma.team+'</div></div>'
      +(al.length?'<i class="ti ti-alert-triangle" style="font-size:13px;color:var(--amber);flex-shrink:0"></i>':'')
      +(lsBw?'<span class="badge" style="background:'+lsBw.bg+';color:'+lsBw.color+';font-size:10px;padding:2px 5px">'+( ls.gesamtBewertung==='Teilweise'?'T':ls.gesamtBewertung==='Yes'?'Y':ls.gesamtBewertung==='Super Yes'?'SY':'MY')+'</span>':'');
    d.onclick=(function(id){return function(){ausgewaehlterId=id;aktiverTab='profil';renderSidebar();renderHauptbereich();};})(ma.id);
    el.appendChild(d);
  });
}

function zeigeAnsicht(a){ansicht=a;renderSidebar();renderHauptbereich();}
function renderHauptbereich(){
  if(ansicht==='sfp-overview')renderSFPOverview();
  else if(ansicht==='coach')renderCoachAnsicht();
  else renderSFPOverview();
}


// ══════════════════════════════════════════════
// SFP OVERVIEW – kombiniert Team-KPIs + Staff Cards (erweitert) + Manager-Tabelle
// ══════════════════════════════════════════════
function renderSFPOverview(){
  var ma=document.getElementById('hauptbereich');
  if(!ma)return;
  var liste=aktiveMitarbeiter();
  var allPerf=liste.map(function(m){return getPerf(m.id,7);}).reduce(function(a,b){return a.concat(b);},[]);
  function tSchnitt(k){if(!allPerf.length)return null;return allPerf.reduce(function(a,x){return a+x[k];},0)/allPerf.length;}
  var totalAlerts=liste.reduce(function(a,m){return a+alertsPruefen(m).length;},0);
  var totalMarge=liste.reduce(function(a,m){return a+getPerf(m.id,7).reduce(function(b,x){return b+(x.marge||0);},0);},0);
  var oem7=tSchnitt('crOEM'),sy7=tSchnitt('crSuperYes'),my7=tSchnitt('crMegaYes');

  // ── Team KPI Kacheln ──
  var html='<div class="topbar"><div class="tb-links">'
    +'<div style="width:40px;height:40px;border-radius:50%;background:var(--purple-bg);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--purple)"><i class="ti ti-layout-grid"></i></div>'
    +'<div><div class="tb-name">SFP Overview</div><div class="tb-meta">'+liste.length+' Mitarbeiter · 7-Tage-Ø · FTP-Sync aktiv</div></div>'
    +'<div style="display:flex;gap:8px">'
    +'<button class="btn btn-primary" onclick="planSession()"><i class="ti ti-plus"></i> Session planen</button>'
    +'<button class="btn btn-primary" onclick="planSession()"><i class="ti ti-plus"></i> Session planen</button>'
    +'<div class="inhalt">'
    // ── KPI Kacheln ──
    +'<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px">'
    +'<div class="kpi" style="border-top-color:'+(oem7!==null&&oem7>=55?'var(--teal)':'var(--amber)')+'"><div class="kpi-label" style="color:'+(oem7!==null&&oem7>=55?'var(--teal)':'var(--amber)')+'">TEAM CR OEM</div><div class="kpi-val" style="color:'+(oem7!==null&&oem7>=55?'var(--teal)':'var(--amber)')+'">'+(oem7!==null?Math.round(oem7)+'%':'—')+'</div><div style="height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;margin-top:5px"><div style="height:100%;width:'+(oem7||0)+'%;background:'+(oem7!==null&&oem7>=55?'var(--teal)':'var(--amber)')+'"></div></div><div class="kpi-sub">Ziel ≥ 55%</div></div>'
    +'<div class="kpi" style="border-top-color:var(--purple)"><div class="kpi-label" style="color:var(--purple)">TEAM SUPER YES</div><div class="kpi-val" style="color:var(--purple)">'+(sy7!==null?Math.round(sy7)+'%':'—')+'</div><div class="kpi-sub">aller Gespräche</div></div>'
    +'<div class="kpi" style="border-top-color:var(--teal)"><div class="kpi-label" style="color:var(--teal)">TEAM MEGA YES</div><div class="kpi-val" style="color:var(--teal)">'+(my7!==null?Math.round(my7)+'%':'—')+'</div><div class="kpi-sub">aller Gespräche</div></div>'
    +'<div class="kpi" style="border-top-color:var(--blue)"><div class="kpi-label" style="color:var(--blue)">ZUSÄTZL. MARGE</div><div class="kpi-val" style="color:var(--blue)">€'+totalMarge.toLocaleString('de-DE')+'</div><div class="kpi-sub">7-Tage Team-Gesamt</div></div>'
    +'<div class="kpi" style="border-top-color:'+(totalAlerts>0?'var(--red)':'var(--teal)')+'"><div class="kpi-label" style="color:'+(totalAlerts>0?'var(--red)':'var(--teal)')+'">'+(totalAlerts>0?'OFFENE ALERTS':'ALLES OK')+'</div><div class="kpi-val" style="color:'+(totalAlerts>0?'var(--red)':'var(--teal)')+'">'+totalAlerts+'</div><div class="kpi-sub">'+(totalAlerts>0?'unter Zielwert':'keine Alerts')+'</div></div>'
    +'</div>';

  // ── Alert Banner ──
  if(totalAlerts>0){
    html+='<div class="alert alert-gelb" style="margin-bottom:18px"><i class="ti ti-alert-triangle" style="font-size:18px;color:var(--amber);flex-shrink:0"></i>'
      +'<div><div style="font-size:13px;font-weight:600;color:var(--amber-dark)">'+totalAlerts+' Performance-Alert'+(totalAlerts>1?'s':'')+' im Team</div>'
      +'<div style="font-size:12px;color:var(--amber-dark)">'+liste.filter(function(m){return alertsPruefen(m).length>0;}).map(function(m){return m.name;}).join(', ')+'</div>'
      +'</div></div>';
  }

  // ── CR Tabelle ──
  function crZelle(val, ziel){
    if(val===null)return '<td style="padding:10px 14px;border-bottom:1px solid var(--border)">—</td>';
    var v=Math.round(val);
    var col=ziel?(v>=ziel?'var(--teal)':v>=ziel*0.85?'var(--amber)':'var(--red)'):(v>=55?'var(--teal)':v>=45?'var(--amber)':'var(--red)');
    return '<td style="padding:10px 14px;border-bottom:1px solid var(--border);min-width:90px">'
      +'<div style="display:flex;justify-content:space-between;margin-bottom:3px">'
      +'<span style="font-size:13px;font-weight:600;color:'+col+'">'+v+'%</span>'
      +(ziel?'<span style="font-size:10px;color:'+(v>=ziel?'var(--teal)':'var(--red)')+'">'+( v>=ziel?'✓':'↓')+ziel+'%</span>':'')
      +'</div>'
      +'<div style="height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;position:relative">'
      +'<div style="height:100%;width:'+Math.min(v,100)+'%;background:'+col+';border-radius:3px"></div>'
      +(ziel?'<div style="position:absolute;top:0;left:'+Math.min(ziel,100)+'%;height:100%;width:2px;background:rgba(0,0,0,.12)"></div>':'')
      +'</div></td>';
  }
  var rows='';
  liste.forEach(function(m){
    var f=FARBEN[m.farbe%FARBEN.length];
    var z=mitarbeiterZiele(m);
    var ep=getPerf(m.id,7);
    function ea(k){return ep.length?ep.reduce(function(a,x){return a+x[k];},0)/ep.length:null;}
    var em=ep.reduce(function(a,x){return a+(x.marge||0);},0);
    var al=alertsPruefen(m);
    var ls=letzteSession(m.id);
    var lsBw=ls?BW[ls.gesamtBewertung]:null;
    var sr=srSchnitt(m.id);
    rows+='<tr style="cursor:pointer" onclick="zeigeMADetail('+m.id+')">';
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)">'
      +'<div style="display:flex;align-items:center;gap:9px">'
      +'<div class="av" style="width:30px;height:30px;font-size:11px;background:'+f.bg+';color:'+f.text+'">'+kuerzel(m.name)+'</div>'
      +'<div><div style="font-weight:500">'+m.name+(al.length?'<i class="ti ti-alert-triangle" style="font-size:12px;color:var(--amber);margin-left:4px"></i>':'')+'</div>'
      +'<div style="font-size:11px;color:var(--text2)">'+m.phase+' · '+m.team+'</div></div></div></td>'
      +crZelle(ea('crOEM'),z.crOEM)
      +crZelle(ea('crTeilweise'),null)
      +crZelle(ea('crYes'),null)
      +crZelle(ea('crSuperYes'),z.crSuperYes)
      +crZelle(ea('crMegaYes'),z.crMegaYes)
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)"><div style="font-weight:600;color:var(--blue)">€'+em.toLocaleString('de-DE')+'</div><div style="font-size:11px;color:var(--text3)">7d</div></td>'
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)">'+(ea('optProStunde')!==null?ea('optProStunde').toFixed(1):'—')+'</td>'
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)">'+(sr!==null?sr+'%':'—')+'</td>'
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)">'+(lsBw?'<span class="badge" style="background:'+lsBw.bg+';color:'+lsBw.color+'">'+ls.gesamtBewertung+'</span>':'—')+'</td>'
      +'<td style="padding:10px 14px;border-bottom:1px solid var(--border)">'+(al.length?'<span style="color:var(--red);font-weight:600">⚠ '+al.length+'</span>':'<span style="color:var(--teal)">✓</span>')+'</td>'
      +'</tr>';
  });
  html+='<div class="abschnitt-titel" style="margin-bottom:10px">Conversion Rates & Marge <span style="font-weight:400;color:var(--text3)">· CR als % aller Gespräche · Individuelle Zielwerte</span></div>'
    +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-bottom:28px">'
    +'<table><thead><tr><th style="min-width:160px">Mitarbeiter</th><th>CR OEM</th><th>Teilweise</th><th>Yes</th><th>Super Yes</th><th>Mega Yes</th><th>Marge</th><th>Opt./h</th><th>SolidRoad</th><th>Letzte Bew.</th><th>Alerts</th></tr></thead><tbody>'+rows+'</tbody></table>'
    +'</div>';

  // ── Staff Cards (erweitert) ──
  html+='<div class="abschnitt-titel" style="margin-bottom:14px">Mitarbeiterkarten</div>'
    +'<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;margin-bottom:28px">';
  liste.forEach(function(m){
    var f=FARBEN[m.farbe%FARBEN.length];
    var z=mitarbeiterZiele(m);
    var ep=getPerf(m.id,7);
    function ea(k){return ep.length?Math.round(ep.reduce(function(a,x){return a+x[k];},0)/ep.length):null;}
    var em=ep.reduce(function(a,x){return a+(x.marge||0);},0);
    var al=alertsPruefen(m);
    var ls=letzteSession(m.id);
    var lsBw=ls?BW[ls.gesamtBewertung]:null;
    var tageSeit=ls?Math.floor((new Date()-new Date(ls.datum+'T00:00:00'))/86400000):null;
    var sw=staerkenSchwaechen(m.id);
    var masSessions=sessionsFuerMitarbeiter(m.id);
    var abgSessions=masSessions.filter(function(s){return s.status==='abgeschlossen';});
    var oem=ea('crOEM');
    var oemCol=oem!==null?(oem>=z.crOEM?'var(--teal)':oem>=z.crOEM*0.85?'var(--amber)':'var(--red)'):'var(--text3)';
    var aufmCol=tageSeit===null?'var(--text3)':tageSeit>14?'var(--red)':tageSeit>7?'var(--amber)':'var(--teal)';

    html+='<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-lg);padding:15px 17px;cursor:pointer" onclick="zeigeMADetail('+m.id+')">'
      // Header
      +'<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">'
      +'<div class="av" style="width:40px;height:40px;font-size:14px;background:'+f.bg+';color:'+f.text+'">'+kuerzel(m.name)+'</div>'
      +'<div style="flex:1"><div style="font-size:14px;font-weight:600">'+m.name+'</div>'
      +'<div style="font-size:12px;color:var(--text2);display:flex;align-items:center;gap:6px">'+m.rolle.replace('Vertriebsmitarbeiter','Vertrieb').replace('Senior ','Sr. ')
      +' <span style="background:var(--blue-bg);color:var(--blue-dark);font-size:10px;font-weight:500;padding:1px 6px;border-radius:20px">'+m.team+'</span></div></div>'
      +'<span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:20px;background:'+(m.phase==='Aktiv'?BW['Yes'].bg:m.phase==='Onboarding'?BW['Teilweise'].bg:BW['Super Yes'].bg)+';color:'+(m.phase==='Aktiv'?BW['Yes'].color:m.phase==='Onboarding'?BW['Teilweise'].color:BW['Super Yes'].color)+'">'+m.phase+'</span>'
      +'</div>'
      // CR OEM Balken
      +'<div style="margin-bottom:10px">'
      +'<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:11px;color:var(--text2)">CR OEM</span><span style="font-size:13px;font-weight:600;color:'+oemCol+'">'+(oem!==null?oem+'%':'—')+'</span></div>'
      +'<div style="height:7px;background:var(--bg3);border-radius:4px;overflow:hidden;position:relative">'
      +(oem!==null?'<div style="height:100%;width:'+Math.min(oem,100)+'%;background:'+oemCol+';border-radius:4px"></div>':'')
      +'<div style="position:absolute;top:0;left:'+Math.min(z.crOEM,100)+'%;height:100%;width:2px;background:rgba(0,0,0,.15)"></div></div>'
      +'<div style="font-size:10px;color:var(--text3);margin-top:2px">Ziel ≥ '+z.crOEM+'% · '+(oem!==null&&oem>=z.crOEM?'✓ Im Zielbereich':'↓ Unter Zielwert')+'</div>'
      +'</div>'
      // CR Grid
      +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px">'
      +'<div style="background:var(--bg2);border-radius:var(--r-sm);padding:6px 8px;text-align:center"><div style="font-size:13px;font-weight:600;color:var(--amber)">'+(ea('crTeilweise')!==null?ea('crTeilweise')+'%':'—')+'</div><div style="font-size:10px;color:var(--text3)">Teilw.</div></div>'
      +'<div style="background:var(--bg2);border-radius:var(--r-sm);padding:6px 8px;text-align:center"><div style="font-size:13px;font-weight:600;color:var(--blue)">'+(ea('crYes')!==null?ea('crYes')+'%':'—')+'</div><div style="font-size:10px;color:var(--text3)">Yes</div></div>'
      +'<div style="background:var(--bg2);border-radius:var(--r-sm);padding:6px 8px;text-align:center"><div style="font-size:13px;font-weight:600;color:var(--purple)">'+(ea('crSuperYes')!==null?ea('crSuperYes')+'%':'—')+'</div><div style="font-size:10px;color:var(--text3)">Super Yes</div></div>'
      +'<div style="background:var(--bg2);border-radius:var(--r-sm);padding:6px 8px;text-align:center"><div style="font-size:13px;font-weight:600;color:var(--teal)">'+(ea('crMegaYes')!==null?ea('crMegaYes')+'%':'—')+'</div><div style="font-size:10px;color:var(--text3)">Mega Yes</div></div>'
      +'</div>'
      // Marge
      +'<div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--blue-bg);border-radius:var(--r-sm);margin-bottom:10px">'
      +'<span style="font-size:11px;font-weight:500;color:var(--blue-dark)">Zusätzliche Marge (7d)</span>'
      +'<span style="font-size:14px;font-weight:600;color:var(--blue-dark)">€'+em.toLocaleString('de-DE')+'</span></div>'
      // Coaching Info
      +'<div style="border-top:1px solid var(--border);padding-top:10px;margin-top:2px">'
      +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">'
      +'<div style="font-size:11px;color:var(--text2)"><i class="ti ti-calendar-event" style="margin-right:4px;font-size:12px"></i>Letzte Session: <span style="font-weight:600;color:'+aufmCol+'">'+(tageSeit===null?'Noch keine':tageSeit===0?'Heute':tageSeit+'d')+'</span></div>'
      +'<div style="font-size:11px;color:var(--text2)">'+abgSessions.length+' Session'+(abgSessions.length!==1?'s':'')+' gesamt</div>'
      +'</div>'
      // Stärken/Schwächen
      +(sw?'<div style="display:flex;gap:8px;margin-bottom:8px">'
        +'<div style="flex:1"><div style="font-size:10px;font-weight:600;color:var(--teal);margin-bottom:3px">STÄRKEN</div>'
        +sw.staerken.slice(0,2).map(function(s){return '<div style="font-size:11px;color:var(--text2)">✓ '+s.name+'</div>';}).join('')
        +'</div>'
        +'<div style="flex:1"><div style="font-size:10px;font-weight:600;color:var(--amber);margin-bottom:3px">ENTWICKLUNG</div>'
        +sw.schwaechen.slice(0,2).map(function(s){return '<div style="font-size:11px;color:var(--text2)">↑ '+s.name+'</div>';}).join('')
        +'</div></div>':'')
      // Letzte Bewertung + Alert + Planen Button
      +'<div style="display:flex;align-items:center;justify-content:space-between">'
      +'<div style="display:flex;align-items:center;gap:6px">'
      +(lsBw?'<span class="badge" style="background:'+lsBw.bg+';color:'+lsBw.color+';font-size:11px">'+ls.gesamtBewertung+'</span>':'')
      +(al.length?'<span style="font-size:11px;color:var(--red);font-weight:600">⚠ '+al.length+' Alert'+(al.length>1?'s':'')+'</span>':'')
      +'</div>'
      +'<button class="btn btn-sm btn-primary" onclick="event.stopPropagation();ausgewaehlterId='+m.id+';planSession()"><i class="ti ti-calendar-plus"></i> Planen</button>'
      +'</div>'
      +'</div></div>';
  });
  html+='</div>';

  // ── Coaching-Aufmerksamkeit Tabelle ──
  html+='<div class="abschnitt-titel" style="margin-bottom:12px">Coaching-Aufmerksamkeit <span style="font-weight:400;color:var(--text3)">· Rot = über 14 Tage · Gelb = über 7 Tage ohne Session</span></div>'
    +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden">'
    +'<table><thead><tr><th>Mitarbeiter</th><th>Sessions gesamt</th><th>Letzte Session</th><th>Letzte Bewertung</th><th>Entwicklungsfelder</th><th>KPI-Alerts</th><th>Aktion</th></tr></thead><tbody>';
  liste.forEach(function(m){
    var f=FARBEN[m.farbe%FARBEN.length];
    var masSessions=sessionsFuerMitarbeiter(m.id);
    var abg=masSessions.filter(function(s){return s.status==='abgeschlossen';});
    var ls=letzteSession(m.id);
    var al=alertsPruefen(m);
    var tageSeit=ls?Math.floor((new Date()-new Date(ls.datum+'T00:00:00'))/86400000):null;
    var aufmCol=tageSeit===null?'var(--text3)':tageSeit>14?'var(--red)':tageSeit>7?'var(--amber)':'var(--teal)';
    var sw=staerkenSchwaechen(m.id);
    html+='<tr style="cursor:pointer" onclick="zeigeMADetail('+m.id+')">';
      +'<td><div style="display:flex;align-items:center;gap:9px"><div class="av" style="width:30px;height:30px;font-size:11px;background:'+f.bg+';color:'+f.text+'">'+kuerzel(m.name)+'</div>'
      +'<div><div style="font-weight:500">'+m.name+(al.length?'<i class="ti ti-alert-triangle" style="font-size:12px;color:var(--amber);margin-left:4px"></i>':'')+'</div>'
      +'<div style="font-size:11px;color:var(--text2)">'+m.phase+' · '+m.team+'</div></div></div></td>'
      +'<td style="font-weight:600;color:var(--purple)">'+abg.length+'</td>'
      +'<td style="font-weight:600;color:'+aufmCol+'">'+(tageSeit===null?'Noch keine':tageSeit===0?'Heute':tageSeit+'d vor')+'</td>'
      +'<td>'+(ls&&BW[ls.gesamtBewertung]?'<span class="badge" style="background:'+BW[ls.gesamtBewertung].bg+';color:'+BW[ls.gesamtBewertung].color+'">'+ls.gesamtBewertung+'</span>':'—')+'</td>'
      +'<td style="font-size:12px;color:var(--text2)">'+(sw&&sw.schwaechen.length?sw.schwaechen.map(function(s){return s.name;}).join(', '):'-')+'</td>'
      +'<td>'+(al.length?'<span style="color:var(--red);font-weight:600;font-size:12px">⚠ '+al.length+'</span>':'<span style="color:var(--teal)">✓</span>')+'</td>'
      +'<td><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();ausgewaehlterId='+m.id+';planSession()"><i class="ti ti-calendar-plus"></i> Planen</button></td>'
      +'</tr>';
  });
  html+='</tbody></table></div></div>';
  ma.innerHTML=html;
}

// ══════════════════════════════════════════════
// COACH ANSICHT – TAGESÜBERSICHT
// ══════════════════════════════════════════════
function renderCoachAnsicht(){
  var ma=document.getElementById('hauptbereich');
  if(!ma)return;
  var demnächst=geplanteSessionsDemnächst(7);
  var ausgewaehlt=mitarbeiter.find(function(m){return m.id===ausgewaehlterId;});
  var f=ausgewaehlt?FARBEN[ausgewaehlt.farbe%FARBEN.length]:{bg:'var(--purple-bg)',text:'var(--purple)'};

  var sessionListe='';
  if(!demnächst.length){
    sessionListe='<div class="leer">Keine geplanten Sessions in den nächsten 7 Tagen.</div>';
  } else {
    demnächst.forEach(function(s){
      var maMa=mitarbeiter.find(function(m){return m.id===s.mitarbeiterId;});
      if(!maMa)return;
      var mf=FARBEN[maMa.farbe%FARBEN.length];
      var isHeute=s.datum===heute();
      sessionListe+='<div class="session-karte'+(isHeute?' heute':'')+'" onclick="ausgewaehlterId='+maMa.id+';aktiverTab=\'profil\';renderSidebar();renderMitarbeiterDetail()">'
        +'<div style="display:flex;align-items:center;gap:10px">'
        +'<div style="text-align:center;min-width:42px"><div style="font-size:10px;font-weight:600;color:'+(isHeute?'var(--purple)':'var(--text2)')+'">'+wochentag(s.datum)+'</div><div style="font-size:18px;font-weight:600;color:'+(isHeute?'var(--purple)':'var(--text)')+'">'+s.datum.split('-')[2]+'</div></div>'
        +'<div class="av" style="width:36px;height:36px;font-size:13px;background:'+mf.bg+';color:'+mf.text+'">'+kuerzel(maMa.name)+'</div>'
        +'<div style="flex:1"><div style="font-size:13px;font-weight:600">'+maMa.name+'</div>'
        +'<div style="font-size:12px;color:var(--text2)">'+s.typ+' · '+s.thema+'</div>'
        +(s.planungsNotiz?'<div style="font-size:11px;color:var(--text3);margin-top:2px">'+s.planungsNotiz+'</div>':'')
        +'</div>'
        +(isHeute?'<button class="btn btn-primary btn-sm" onclick="event.stopPropagation();sessionStarten('+s.id+')"><i class="ti ti-play"></i> Starten</button>':'')
        +'</div></div>';
    });
  }

  ma.innerHTML='<div class="topbar">'
    +'<div class="tb-links"><div style="width:40px;height:40px;border-radius:50%;background:var(--purple-bg);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--purple)"><i class="ti ti-calendar-event"></i></div>'
    +'<div><div class="tb-name">Coach-Dashboard</div><div class="tb-meta">'+datum(heute())+' · '+demnächst.filter(function(s){return s.datum===heute();}).length+' Sessions heute</div></div></div>'
    +'<div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="openModal(\'neueSessionModal\')"><i class="ti ti-plus"></i> Session planen</button></div>'
    +'</div>'
    +'<div class="inhalt">'
    // Nächste Sessions
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'
    +'<div>'
    +'<div class="abschnitt-titel">Geplante Sessions – nächste 7 Tage</div>'
    +sessionListe
    +'</div>'
    // Ausgewählter Mitarbeiter Schnellübersicht
    +'<div>'
    +'<div class="abschnitt-titel">Schnellübersicht: '+( ausgewaehlt?ausgewaehlt.name:'Mitarbeiter auswählen')+'</div>'
    +(ausgewaehlt?renderSchnellprofil(ausgewaehlt):'<div class="leer">Links einen Mitarbeiter auswählen.</div>')
    +'</div></div>'
    +'</div>';
}

function renderSchnellprofil(ma){
  var f=FARBEN[ma.farbe%FARBEN.length];
  var ls=letzteSession(ma.id);
  var sw=staerkenSchwaechen(ma.id);
  var al=alertsPruefen(ma);
  var sr=srSchnitt(ma.id);
  var masSessions=sessionsFuerMitarbeiter(ma.id);
  var abg=masSessions.filter(function(s){return s.status==='abgeschlossen';});
  var geplant=masSessions.filter(function(s){return s.status==='geplant';});

  var html='<div class="karte" style="cursor:pointer" onclick="aktiverTab=\'profil\';renderMitarbeiterDetail()">'
    +'<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">'
    +'<div class="av" style="width:44px;height:44px;font-size:15px;background:'+f.bg+';color:'+f.text+'">'+kuerzel(ma.name)+'</div>'
    +'<div><div style="font-size:15px;font-weight:600">'+ma.name+'</div>'
    +'<div style="font-size:12px;color:var(--text2)">'+ma.rolle+' · <span style="background:'+phaseBg(ma.phase)+';color:'+phaseCol(ma.phase)+';padding:1px 7px;border-radius:20px;font-size:11px;font-weight:600">'+ma.phase+'</span></div></div>'
    +'</div>';

  // KPI Schnellzahlen
  html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px">'
    +'<div style="background:var(--bg2);border-radius:var(--r-md);padding:8px 10px;text-align:center"><div style="font-size:17px;font-weight:600;color:var(--amber)">'+(perfSchnitt(ma.id,'crOEM',7)!==null?Math.round(perfSchnitt(ma.id,'crOEM',7))+'%':'-')+'</div><div style="font-size:10px;color:var(--text3)">CR OEM</div></div>'
    +'<div style="background:var(--bg2);border-radius:var(--r-md);padding:8px 10px;text-align:center"><div style="font-size:17px;font-weight:600;color:var(--purple)">'+(perfSchnitt(ma.id,'crSuperYes',7)!==null?Math.round(perfSchnitt(ma.id,'crSuperYes',7))+'%':'-')+'</div><div style="font-size:10px;color:var(--text3)">Super Yes</div></div>'
    +'<div style="background:var(--bg2);border-radius:var(--r-md);padding:8px 10px;text-align:center"><div style="font-size:17px;font-weight:600;color:var(--blue)">'+abg.length+'</div><div style="font-size:10px;color:var(--text3)">Sessions</div></div>'
    +'</div>';

  // Alerts
  if(al.length){
    html+='<div style="background:var(--red-bg);border:1px solid rgba(226,75,74,.2);border-radius:var(--r-md);padding:8px 12px;margin-bottom:10px;font-size:12px;color:var(--red)">'
      +'<i class="ti ti-alert-circle" style="margin-right:4px"></i>'+al.map(function(a){return a.key+' unter Ziel ('+a.wert+')';}).join(' · ')+'</div>';
  }

  // Stärken & Schwächen
  if(sw){
    html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">'
      +'<div><div style="font-size:10px;font-weight:600;color:var(--teal);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Stärken</div>'
      +sw.staerken.map(function(s){return '<div style="font-size:12px;display:flex;align-items:center;gap:6px;margin-bottom:4px"><i class="ti ti-circle-check" style="color:var(--teal);font-size:13px"></i>'+s.name+'</div>';}).join('')+'</div>'
      +'<div><div style="font-size:10px;font-weight:600;color:var(--amber);text-transform:uppercase;letter-spacing:.04em;margin-bottom:5px">Entwicklungsfelder</div>'
      +sw.schwaechen.map(function(s){return '<div style="font-size:12px;display:flex;align-items:center;gap:6px;margin-bottom:4px"><i class="ti ti-alert-triangle" style="color:var(--amber);font-size:13px"></i>'+s.name+'</div>';}).join('')+'</div>'
      +'</div>';
  }

  // Letzte Session
  if(ls){
    var lsBw=BW[ls.gesamtBewertung];
    html+='<div style="font-size:11px;color:var(--text2)">Letzte Session: '+datum(ls.datum)+' <span class="badge" style="background:'+lsBw.bg+';color:'+lsBw.color+'">'+ls.gesamtBewertung+'</span> · '+ls.thema+'</div>';
  }

  html+='<div style="margin-top:10px"><button class="btn btn-sm btn-primary" style="width:100%;justify-content:center" onclick="aktiverTab=\'profil\';renderMitarbeiterDetail()"><i class="ti ti-arrow-right"></i> Vollprofil öffnen</button></div>';
  html+='</div>';
  return html;
}

// ══════════════════════════════════════════════
// MITARBEITER DETAILANSICHT
// ══════════════════════════════════════════════
function renderMitarbeiterDetail(){
  var ma=mitarbeiter.find(function(m){return m.id===ausgewaehlterId;});
  if(!ma)return;
  var hauptbereich=document.getElementById('hauptbereich');
  if(!hauptbereich)return;
  var f=FARBEN[ma.farbe%FARBEN.length];
  var masSessions=sessionsFuerMitarbeiter(ma.id);
  var offAufg=offeneAufgaben(ma.id);

  hauptbereich.innerHTML='<div class="topbar"><div class="tb-links">'
    +'<button class="btn btn-sm" onclick="renderCoachAnsicht()"><i class="ti ti-arrow-left"></i> Zurück</button>'
    +'<div class="av" style="width:42px;height:42px;font-size:14px;background:'+f.bg+';color:'+f.text+'">'+kuerzel(ma.name)+'</div>'
    +'<div><div class="tb-name">'+ma.name+'</div><div class="tb-meta">'+ma.rolle+' · '+ma.team+' · '+ma.phase+(ma.startDatum?' · Start: '+datum(ma.startDatum):'')+'</div></div>'
    +'</div><div style="display:flex;gap:8px">'
    +'<button class="btn btn-primary" onclick="planSession()"><i class="ti ti-plus"></i> Session planen</button>'
    +'</div></div>'
    +'<div class="tab-bar" id="maTabBar">'
    +'<div class="tab" data-tab="profil" onclick="switchTab(\'profil\')">Profil & Stärken</div>'
    +'<div class="tab" data-tab="sessions" onclick="switchTab(\'sessions\')">Sessions ('+(masSessions.length)+')</div>'
    +'<div class="tab" data-tab="performance" onclick="switchTab(\'performance\')">Performance</div>'
    +'<div class="tab" data-tab="solidroad" onclick="switchTab(\'solidroad\')">SolidRoad</div>'
    +'<div class="tab" data-tab="aufgaben" onclick="switchTab(\'aufgaben\')" id="aufgabenTabBtn">Aufgaben'+(offAufg>0?' <span style="background:var(--purple);color:#fff;border-radius:20px;font-size:10px;font-weight:600;padding:1px 6px">'+offAufg+'</span>':'')+'</div>'
    +'</div>'
    +'<div class="inhalt" id="tabInhalt"></div>';

  renderTabBar();
  renderTab();
}

function renderTabBar(){
  var bar=document.getElementById('maTabBar');
  if(!bar)return;
  bar.querySelectorAll('.tab').forEach(function(el){el.classList.toggle('aktiv',el.dataset.tab===aktiverTab);});
}
function switchTab(t){aktiverTab=t;renderTabBar();renderTab();}

// ══════════════════════════════════════════════
// TAB INHALTE
// ══════════════════════════════════════════════
function renderTab(){
  var ma=mitarbeiter.find(function(m){return m.id===ausgewaehlterId;});
  if(!ma)return;
  var el=document.getElementById('tabInhalt');
  if(!el)return;
  var html='';

  // ── PROFIL & STÄRKEN ──
  if(aktiverTab==='profil'){
    var sw=staerkenSchwaechen(ma.id);
    var al=alertsPruefen(ma);
    var abgSessions=sessions.filter(function(s){return s.mitarbeiterId===ma.id&&s.status==='abgeschlossen'&&Object.keys(s.scorecard||{}).length>0;});

    // Alert-Box
    if(al.length){
      html+='<div class="alert alert-rot"><i class="ti ti-alert-circle" style="font-size:18px;color:var(--red);flex-shrink:0"></i>'
        +'<div><div style="font-size:13px;font-weight:600;color:var(--red)">'+al.length+' KPI'+(al.length>1?'s':'')+' unter Zielwert – Coaching empfohlen</div>'
        +'<div style="font-size:12px;color:var(--red);margin-top:2px">'+al.map(function(a){return a.key+': '+a.wert+' (Ziel: '+a.ziel+')';}).join(' · ')+'</div>'
        +'<div style="margin-top:8px"><button class="btn btn-sm" style="background:var(--red-bg);color:var(--red);border-color:var(--red)" onclick="openModal(\'neueSessionModal\')"><i class="ti ti-calendar-plus"></i> Session einplanen</button></div>'
        +'</div></div>';
    }

    if(!sw){
      html+='<div class="leer">Noch keine abgeschlossenen Bewertungen vorhanden.<br>Session starten um erste Scorecard auszufüllen.</div>';
    } else {
      // Stärken & Schwächen Übersicht
      html+='<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">';
      // Stärken
      html+='<div><div class="abschnitt-titel" style="color:var(--teal)"><i class="ti ti-thumb-up" style="margin-right:6px"></i>Top Stärken</div>';
      sw.staerken.forEach(function(s){
        var pct=s.schnitt/4*100;
        html+='<div style="margin-bottom:10px">'
          +'<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:13px;font-weight:500">'+s.name+'</span><span style="font-size:12px;color:var(--text2)">'+s.schnitt.toFixed(1)+'/4</span></div>'
          +'<div style="height:7px;background:var(--bg3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+scorefarbe(s.schnitt,4)+';border-radius:4px"></div></div>'
          +'<div style="font-size:11px;color:var(--text3);margin-top:2px">'+s.kategorie+' · '+s.anzahl+' Bewertung'+(s.anzahl>1?'en':'')+'</div>'
          +'</div>';
      });
      html+='</div>';
      // Schwächen
      html+='<div><div class="abschnitt-titel" style="color:var(--amber)"><i class="ti ti-target" style="margin-right:6px"></i>Entwicklungsfelder</div>';
      sw.schwaechen.forEach(function(s){
        var pct=s.schnitt/4*100;
        html+='<div style="margin-bottom:10px">'
          +'<div style="display:flex;justify-content:space-between;margin-bottom:3px"><span style="font-size:13px;font-weight:500">'+s.name+'</span><span style="font-size:12px;color:var(--text2)">'+s.schnitt.toFixed(1)+'/4</span></div>'
          +'<div style="height:7px;background:var(--bg3);border-radius:4px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+scorefarbe(s.schnitt,4)+';border-radius:4px"></div></div>'
          +'<div style="font-size:11px;color:var(--text3);margin-top:2px">'+s.kategorie+' · '+s.anzahl+' Bewertung'+(s.anzahl>1?'en':'')+'</div>'
          +'</div>';
      });
      html+='</div></div>';

      // Alle Kriterien
      html+='<div class="abschnitt-titel">Alle Kriterien im Überblick</div>';
      SCORECARD.forEach(function(kat){
        html+='<div style="margin-bottom:16px"><div style="font-size:12px;font-weight:600;color:var(--purple);margin-bottom:8px;display:flex;align-items:center;gap:6px">'
          +'<span>'+kat.kategorie+'</span><span style="font-size:10px;color:var(--text3);font-weight:400">Gewichtung: '+kat.gewichtung+'%</span></div>';
        kat.kriterien.forEach(function(k){
          var eintrag=sw.alle.find(function(e){return e.id===k.id;});
          if(!eintrag)return;
          var pct=eintrag.schnitt/4*100;
          var col=scorefarbe(eintrag.schnitt,4);
          html+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'
            +'<span style="font-size:13px;color:var(--text2);width:160px;flex-shrink:0">'+k.name+'</span>'
            +'<div style="flex:1;height:6px;background:var(--bg3);border-radius:3px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:'+col+';border-radius:3px"></div></div>'
            +'<span style="font-size:12px;color:var(--text2);width:34px;text-align:right">'+eintrag.schnitt.toFixed(1)+'</span>'
            +'</div>';
        });
        html+='</div>';
      });
    }
  }

  // ── SESSIONS ──
  if(aktiverTab==='sessions'){
    var masSessions=sessionsFuerMitarbeiter(ma.id);
    var abg=masSessions.filter(function(s){return s.status==='abgeschlossen';});
    var geplant=masSessions.filter(function(s){return s.status==='geplant';});

    html+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
      +'<div style="display:flex;gap:10px">'
      +'<div class="kpi" style="border-top-color:var(--purple);flex:1"><div class="kpi-label" style="color:var(--purple)">Gesamt</div><div class="kpi-val" style="color:var(--purple)">'+masSessions.length+'</div></div>'
      +'<div class="kpi" style="border-top-color:var(--teal);flex:1"><div class="kpi-label" style="color:var(--teal)">Abgeschlossen</div><div class="kpi-val" style="color:var(--teal)">'+abg.length+'</div></div>'
      +'<div class="kpi" style="border-top-color:var(--blue);flex:1"><div class="kpi-label" style="color:var(--blue)">Geplant</div><div class="kpi-val" style="color:var(--blue)">'+geplant.length+'</div></div>'
      +'</div>'
      +'<button class="btn btn-primary btn-sm" onclick="openModal(\'neueSessionModal\')"><i class="ti ti-plus"></i> Session planen</button>'
      +'</div>';

    if(geplant.length){
      html+='<div class="abschnitt-titel">Geplante Sessions</div>';
      geplant.forEach(function(s){
        var isHeute=s.datum===heute();
        html+='<div class="session-karte'+(isHeute?' heute':'')+'">'
          +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
          +'<div style="display:flex;align-items:center;gap:10px">'
          +'<span style="font-size:12px;font-weight:600;color:'+(isHeute?'var(--purple)':'var(--text2)')+'">'+datum(s.datum)+'</span>'
          +'<span style="font-size:12px;color:var(--text2)">'+s.typ+'</span>'
          +'<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:var(--blue-bg);color:var(--blue-dark)">'+s.thema+'</span>'
          +'</div>'
          +(isHeute?'<button class="btn btn-primary btn-sm" onclick="sessionStarten('+s.id+')"><i class="ti ti-play"></i> Bewerten</button>':'')
          +'</div>'
          +(s.planungsNotiz?'<div style="font-size:12px;color:var(--text2)"><i class="ti ti-note" style="margin-right:4px"></i>'+s.planungsNotiz+'</div>':'')
          +'</div>';
      });
    }

    if(abg.length){
      html+='<div class="abschnitt-titel" style="margin-top:16px">Abgeschlossene Sessions</div>';
      abg.forEach(function(s){
        var bw=BW[s.gesamtBewertung]||{bg:'var(--bg2)',color:'var(--text2)'};
        var punkte=scorecardGesamtpunkte(s.scorecard);
        html+='<div class="session-karte" onclick="sessionOeffnen('+s.id+')">'
          +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
          +'<div style="display:flex;align-items:center;gap:10px">'
          +'<span style="font-size:12px;font-weight:600;color:var(--text2)">'+datum(s.datum)+'</span>'
          +'<span style="font-size:12px;color:var(--text2)">'+s.typ+'</span>'
          +'<span style="font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;background:var(--bg2);color:var(--text2)">'+s.thema+'</span>'
          +'</div>'
          +'<div style="display:flex;align-items:center;gap:8px">'
          +(punkte!==null?'<span style="font-size:12px;font-weight:600;color:'+scorefarbe(punkte,100)+'">'+punkte+' Pkt.</span>':'')
          +'<span class="badge" style="background:'+bw.bg+';color:'+bw.color+'">'+s.gesamtBewertung+'</span>'
          +'</div></div>'
          +(s.notizen?'<div style="font-size:13px;color:var(--text2);line-height:1.5;margin-bottom:6px">'+s.notizen+'</div>':'')
          +(s.naechsteSchritte?'<div style="font-size:12px;color:var(--text3)"><i class="ti ti-arrow-right" style="margin-right:3px"></i>'+s.naechsteSchritte+'</div>':'')
          +'</div>';
      });
    }
    if(!masSessions.length){html+='<div class="leer">Noch keine Sessions vorhanden.</div>';}
  }

  // ── PERFORMANCE ──
  if(aktiverTab==='performance'){
    var z=mitarbeiterZiele(ma);
    var perf7=getPerf(ma.id,7);
    function p7(k){return perf7.length?(perf7.reduce(function(a,x){return a+x[k];},0)/perf7.length).toFixed(1):'—';}
    html+='<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:20px">';
    [{k:'crOEM',l:'CR OEM',c:'var(--amber)',z:z.crOEM,pct:true},{k:'crTeilweise',l:'CR Teilweise',c:'var(--text2)',z:null,pct:true},{k:'crSuperYes',l:'CR Super Yes',c:'var(--purple)',z:z.crSuperYes,pct:true},{k:'crMegaYes',l:'CR Mega Yes',c:'var(--teal)',z:z.crMegaYes,pct:true},{k:'optProStunde',l:'Opt./Stunde',c:'var(--blue)',z:z.optProStunde,pct:false}].forEach(function(kd){
      var v=p7(kd.k);var hit=kd.z?(parseFloat(v)>=kd.z):true;
      html+='<div class="kpi" style="border-top-color:'+kd.c+'"><div class="kpi-label" style="color:'+kd.c+'">'+kd.l+'</div><div class="kpi-val" style="color:'+kd.c+'">'+v+(kd.pct&&v!=='—'?'%':'')+'</div><div class="kpi-sub" style="color:'+(kd.z?(hit?'var(--teal)':'var(--red)'):'var(--text3)')+'">'+(kd.z?'Ziel: '+kd.z+(kd.pct?'%':'')+' '+(hit?'✓':'↓'):'7-Tage-Ø')+'</div></div>';
    });
    html+='</div>';
    // Tabelle
    var perf=performance[ma.id]||[];
    if(perf.length){
      html+='<div class="abschnitt-titel">Tagesprotokoll</div><div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden"><table><thead><tr><th>Datum</th><th>CR OEM</th><th>Teilw.</th><th>Yes</th><th>Super Yes</th><th>Mega Yes</th><th>Opt./h</th><th>Marge</th></tr></thead><tbody>';
      perf.slice(0,15).forEach(function(row){
        html+='<tr><td>'+datum(row.datum)+'</td><td style="color:var(--amber);font-weight:600">'+row.crOEM+'%</td><td>'+row.crTeilweise+'%</td><td>'+row.crYes+'%</td><td style="color:var(--purple);font-weight:600">'+row.crSuperYes+'%</td><td style="color:var(--teal);font-weight:600">'+row.crMegaYes+'%</td><td>'+row.optProStunde.toFixed(1)+'</td><td style="color:var(--blue)">€'+(row.marge||0)+'</td></tr>';
      });
      html+='</tbody></table></div>';
    }
  }

  // ── SOLIDROAD ──
  if(aktiverTab==='solidroad'){
    var srDaten=solidroad[ma.id]||{simulationen:[]};
    var sims=srDaten.simulationen;
    var srS=srSchnitt(ma.id);
    if(srS!==null){
      html+='<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px">'
        +'<div class="kpi" style="border-top-color:'+scorefarbe(srS,100)+'"><div class="kpi-label" style="color:'+scorefarbe(srS,100)+'">Ø Ergebnis</div><div class="kpi-val" style="color:'+scorefarbe(srS,100)+'">'+srS+'%</div><div class="kpi-sub">alle Simulationen</div></div>'
        +'<div class="kpi" style="border-top-color:var(--blue)"><div class="kpi-label" style="color:var(--blue)">Simulationen</div><div class="kpi-val" style="color:var(--blue)">'+sims.length+'</div><div class="kpi-sub">abgeschlossen</div></div>'
        +'<div class="kpi" style="border-top-color:var(--teal)"><div class="kpi-label" style="color:var(--teal)">Bestanden</div><div class="kpi-val" style="color:var(--teal)">'+sims.filter(function(s){return s.bestanden;}).length+'</div><div class="kpi-sub">von '+sims.length+'</div></div>'
        +'<div class="kpi" style="border-top-color:var(--red)"><div class="kpi-label" style="color:var(--red)">Nicht bestanden</div><div class="kpi-val" style="color:var(--red)">'+sims.filter(function(s){return !s.bestanden;}).length+'</div><div class="kpi-sub">wiederholen</div></div>'
        +'</div>';
    }
    html+='<div class="abschnitt-titel">Simulationen</div>';
    if(!sims.length){html+='<div class="leer">Noch keine Simulationen abgeschlossen.</div>';}
    sims.forEach(function(s){
      var col=s.score>=85?'var(--teal)':s.score>=70?'var(--purple)':'var(--red)';
      html+='<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-lg);padding:13px 16px;margin-bottom:10px;display:flex;align-items:center;gap:14px">'
        +'<div style="width:50px;height:50px;border-radius:50%;border:3px solid '+col+';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;color:'+col+';flex-shrink:0">'+s.score+'%</div>'
        +'<div style="flex:1"><div style="font-size:13px;font-weight:500">'+s.name+'</div><div style="font-size:12px;color:var(--text2);margin-top:2px">'+datum(s.datum)+' · '+(s.bestanden?'<span style="color:var(--teal)">✓ Bestanden</span>':'<span style="color:var(--red)">✗ Nicht bestanden</span>')+'</div>'
        +'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">'+s.tags.map(function(t){return '<span style="font-size:11px;padding:2px 8px;border-radius:20px;background:var(--bg2);color:var(--text2)">'+t+'</span>';}).join('')+'</div>'
        +'</div></div>';
    });
  }

  // ── AUFGABEN ──
  if(aktiverTab==='aufgaben'){
    var empAufg=aufgaben[ma.id]||[];
    var todayStr=heute();
    function istUeberfaellig(a){return !a.erledigt&&a.faelligAm&&a.faelligAm<todayStr;}
    var offen=empAufg.filter(function(a){return !a.erledigt&&!istUeberfaellig(a);});
    var ueberfaellig=empAufg.filter(function(a){return istUeberfaellig(a);});
    var erledigt=empAufg.filter(function(a){return a.erledigt;});
    var prioFarbe={hoch:{bg:'var(--red-bg)',col:'var(--red)'},mittel:{bg:'var(--amber-bg)',col:'var(--amber-dark)'},niedrig:{bg:'var(--bg2)',col:'var(--text2)'}};

    html+='<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px">'
      +'<div class="kpi" style="border-top-color:var(--purple)"><div class="kpi-label" style="color:var(--purple)">Offen</div><div class="kpi-val" style="color:var(--purple)">'+offen.length+'</div></div>'
      +'<div class="kpi" style="border-top-color:'+(ueberfaellig.length?'var(--red)':'var(--teal)')+'"><div class="kpi-label" style="color:'+(ueberfaellig.length?'var(--red)':'var(--teal)')+'">Überfällig</div><div class="kpi-val" style="color:'+(ueberfaellig.length?'var(--red)':'var(--teal)')+'">'+ueberfaellig.length+'</div></div>'
      +'<div class="kpi" style="border-top-color:var(--teal)"><div class="kpi-label" style="color:var(--teal)">Erledigt</div><div class="kpi-val" style="color:var(--teal)">'+erledigt.length+'</div></div>'
      +'</div>';

    html+='<div style="display:flex;justify-content:flex-end;margin-bottom:14px"><button class="btn btn-primary btn-sm" onclick="openModal(\'neueAufgabeModal\')"><i class="ti ti-plus"></i> Aufgabe hinzufügen</button></div>';

    function aufgabeKarte(a){
      var pf=prioFarbe[a.prioritaet]||prioFarbe.niedrig;
      var ue=istUeberfaellig(a);
      var tage=a.faelligAm&&!a.erledigt?Math.ceil((new Date(a.faelligAm)-new Date(todayStr))/86400000):null;
      var faelligText=a.faelligAm?(a.erledigt?'Erledigt':tage<0?'Überfällig seit '+Math.abs(tage)+'d':tage===0?'Heute fällig':tage===1?'Morgen fällig':'Fällig in '+tage+'d'):'';
      var faelligFarbe=a.erledigt?'var(--text3)':tage!==null&&tage<0?'var(--red)':tage===0?'var(--amber)':'var(--text3)';
      return '<div style="background:var(--bg);border:1px solid var(--border);'+(ue?'border-left:3px solid var(--red);':'')+( a.erledigt?'opacity:.6;':'')+' border-radius:var(--r-lg);margin-bottom:8px;overflow:hidden">'
        +'<div style="display:flex;align-items:flex-start;gap:12px;padding:13px 15px;cursor:pointer" onclick="toggleAufgabeDetail('+a.id+')">'
        +'<div onclick="event.stopPropagation();aufgabeErledigen('+a.id+')" style="width:22px;height:22px;border-radius:50%;border:2px solid '+(a.erledigt?'var(--teal)':'var(--border2)')+';background:'+(a.erledigt?'var(--teal)':'transparent')+';display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer;margin-top:1px;transition:all .15s">'
        +(a.erledigt?'<i class="ti ti-check" style="font-size:11px;color:#fff"></i>':'')+'</div>'
        +'<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500;'+(a.erledigt?'text-decoration:line-through;color:var(--text3)':'')+'">'+a.text+'</div>'
        +'<div style="font-size:11px;color:var(--text3);margin-top:3px;display:flex;gap:8px">'
        +(a.quelle?'<span>'+a.quelle+'</span>':'')
        +(faelligText?'<span style="color:'+faelligFarbe+'">'+faelligText+'</span>':'')
        +'</div></div>'
        +'<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:20px;background:'+pf.bg+';color:'+pf.col+';flex-shrink:0">'+a.prioritaet+'</span>'
        +'</div>'
        +'<div id="aufg-detail-'+a.id+'" style="display:none;padding:0 15px 13px 49px;border-top:1px solid var(--border);background:var(--bg2);font-size:13px;color:var(--text2);line-height:1.6">'
        +(a.beschreibung||'Keine Beschreibung.')
        +'<div style="display:flex;gap:8px;margin-top:10px">'
        +(!a.erledigt?'<button class="btn btn-sm btn-primary" onclick="aufgabeErledigen('+a.id+')"><i class="ti ti-check"></i> Als erledigt markieren</button>':'<button class="btn btn-sm" onclick="aufgabeErledigen('+a.id+')"><i class="ti ti-rotate-left"></i> Wieder öffnen</button>')
        +'<button class="btn btn-sm" style="color:var(--red);border-color:var(--red)" onclick="aufgabeLoeschen('+a.id+')"><i class="ti ti-trash"></i> Löschen</button>'
        +'</div></div></div>';
    }

    if(empAufg.length===0){html+='<div class="leer">Noch keine Aufgaben vorhanden.</div>';}
    if(ueberfaellig.length){html+='<div class="abschnitt-titel" style="color:var(--red)">Überfällig ('+ueberfaellig.length+')</div>';ueberfaellig.forEach(function(a){html+=aufgabeKarte(a);});}
    if(offen.length){html+='<div class="abschnitt-titel" style="margin-top:'+(ueberfaellig.length?'16px':'0')+'">Offen ('+offen.length+')</div>';offen.forEach(function(a){html+=aufgabeKarte(a);});}
    if(erledigt.length){html+='<div class="abschnitt-titel" style="margin-top:16px">Erledigt ('+erledigt.length+')</div>';erledigt.forEach(function(a){html+=aufgabeKarte(a);});}
  }

  el.innerHTML=html;
}

// ── Session Scorecard bewerten ──
function sessionStarten(sessionId){
  aktivesScorecardId=sessionId;
  var s=sessions.find(function(x){return x.id===sessionId;});
  if(!s)return;
  var ma=mitarbeiter.find(function(m){return m.id===s.mitarbeiterId;});
  ausgewaehlterId=s.mitarbeiterId;
  renderScorecardModal(s,ma);
}
function sessionOeffnen(sessionId){
  var s=sessions.find(function(x){return x.id===sessionId;});
  if(!s)return;
  aktivesScorecardId=sessionId;
  var ma=mitarbeiter.find(function(m){return m.id===s.mitarbeiterId;});
  renderScorecardModal(s,ma);
}

function renderScorecardModal(s,ma){
  var modal=document.getElementById('scorecardModal');
  var inhalt=document.getElementById('scorecardInhalt');
  if(!modal||!inhalt)return;

  var html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px">'
    +'<div><label>Session-Datum</label><input type="date" id="sc-datum" value="'+s.datum+'"></div>'
    +'<div><label>Typ</label><select id="sc-typ"><option'+(s.typ==='Onboarding-Session'?' selected':'')+'>Onboarding-Session</option><option'+(s.typ==='Gesprächsbewertung'?' selected':'')+'>Gesprächsbewertung</option><option'+(s.typ==='Anlassbezogene Session'?' selected':'')+'>Anlassbezogene Session</option></select></div>'
    +'<div><label>Thema</label><input type="text" id="sc-thema" value="'+s.thema+'" placeholder="z.B. Einwandbehandlung"></div>'
    +'<div><label>Gesamtbewertung</label><select id="sc-bewertung"><option value="">Bewertung wählen...</option>'+BEWERTUNGEN.map(function(b){return '<option'+(s.gesamtBewertung===b?' selected':'')+'>'+b+'</option>';}).join('')+'</select></div>'
    +'</div>';

  // Scorecard Kriterien
  SCORECARD.forEach(function(kat){
    html+='<div style="margin-bottom:16px"><div style="font-size:12px;font-weight:600;color:var(--purple);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">'+kat.kategorie+' <span style="font-weight:400;color:var(--text3)">('+kat.gewichtung+'%)</span></div>';
    kat.kriterien.forEach(function(k){
      var aktuell=s.scorecard?s.scorecard[k.id]:null;
      html+='<div style="margin-bottom:14px">'
        +'<div style="font-size:13px;font-weight:500;margin-bottom:3px">'+k.name+'</div>'
        +'<div style="font-size:11px;color:var(--text3);margin-bottom:8px">'+k.beschreibung+'</div>'
        +'<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">';
      k.stufen.forEach(function(stufe,idx){
        var wert=idx+1;
        var gewaehlt=aktuell===wert;
        var farbe=wert===1?'var(--red)':wert===2?'var(--amber)':wert===3?'var(--purple)':'var(--teal)';
        html+='<div onclick="scorecardWaehlen(\''+k.id+'\','+wert+')" id="sc-'+k.id+'-'+wert+'" style="padding:8px;border-radius:var(--r-md);border:2px solid '+(gewaehlt?farbe:'var(--border2)')+';background:'+(gewaehlt?farbe+'22':'transparent')+';cursor:pointer;text-align:center;transition:all .15s">'
          +'<div style="font-size:13px;font-weight:700;color:'+farbe+'">'+wert+'</div>'
          +'<div style="font-size:10px;color:var(--text2);line-height:1.3;margin-top:2px">'+stufe+'</div>'
          +'</div>';
      });
      html+='</div></div>';
    });
    html+='</div>';
  });

  html+='<div><label>Notizen zur Session</label><textarea id="sc-notizen" style="min-height:80px" placeholder="Was ist aufgefallen? Stärken, Schwächen, Beobachtungen...">'+( s.notizen||'')+'</textarea></div>'
    +'<div style="margin-top:10px"><label>Nächste Schritte / Aufgaben für Mitarbeiter</label><textarea id="sc-naechste" style="min-height:60px" placeholder="Was soll der Mitarbeiter bis zur nächsten Session tun...">'+( s.naechsteSchritte||'')+'</textarea></div>';

  inhalt.innerHTML=html;
  modal.classList.remove('hidden');
}

function scorecardWaehlen(kriteriumId, wert){
  var s=sessions.find(function(x){return x.id===aktivesScorecardId;});
  if(!s){s={scorecard:{}};} if(!s.scorecard)s.scorecard={};
  s.scorecard[kriteriumId]=wert;
  // Update visual
  for(var i=1;i<=4;i++){
    var el=document.getElementById('sc-'+kriteriumId+'-'+i);
    if(!el)continue;
    var farbe=i===1?'var(--red)':i===2?'var(--amber)':i===3?'var(--purple)':'var(--teal)';
    el.style.borderColor=i===wert?farbe:'var(--border2)';
    el.style.background=i===wert?farbe+'22':'transparent';
  }
}

// ══════════════════════════════════════════════
// MANAGER ANSICHT
// ══════════════════════════════════════════════
function renderManagerAnsicht(){
  var ma=document.getElementById('hauptbereich');
  if(!ma)return;
  var liste=aktiveMitarbeiter();
  var heute30=getPerf;

  var rows='';
  liste.forEach(function(m){
    var f=FARBEN[m.farbe%FARBEN.length];
    var masSessions=sessionsFuerMitarbeiter(m.id);
    var abg=masSessions.filter(function(s){return s.status==='abgeschlossen';});
    var ls=letzteSession(m.id);
    var al=alertsPruefen(m);
    var tageSeitLetzter=ls?Math.floor((new Date()-new Date(ls.datum+'T00:00:00'))/86400000):null;
    var aufmerksamkeitFarbe=tageSeitLetzter===null?'var(--text3)':tageSeitLetzter>14?'var(--red)':tageSeitLetzter>7?'var(--amber)':'var(--teal)';
    var sw=staerkenSchwaechen(m.id);
    rows+='<tr style="cursor:pointer" onclick="ausgewaehlterId='+m.id+';aktiverTab=\'profil\';ansicht=\'coach\';renderSidebar();renderMitarbeiterDetail()">'
      +'<td><div style="display:flex;align-items:center;gap:9px"><div class="av" style="width:30px;height:30px;font-size:11px;background:'+f.bg+';color:'+f.text+'">'+kuerzel(m.name)+'</div><div><div style="font-weight:500">'+m.name+(al.length?'<i class="ti ti-alert-triangle" style="font-size:12px;color:var(--amber);margin-left:4px"></i>':'')+'</div><div style="font-size:11px;color:var(--text2)">'+m.phase+' · '+m.team+'</div></div></div></td>'
      +'<td style="font-weight:600">'+abg.length+'</td>'
      +'<td style="color:'+aufmerksamkeitFarbe+';font-weight:600">'+(tageSeitLetzter===null?'Keine':tageSeitLetzter===0?'Heute':tageSeitLetzter+'d')+'</td>'
      +'<td>'+(ls?'<span class="badge" style="background:'+BW[ls.gesamtBewertung].bg+';color:'+BW[ls.gesamtBewertung].color+'">'+ls.gesamtBewertung+'</span>':'-')+'</td>'
      +'<td style="font-size:12px;color:var(--text2)">'+(sw&&sw.schwaechen.length?sw.schwaechen.map(function(s){return s.name;}).join(', '):'-')+'</td>'
      +'<td>'+(al.length?'<span style="color:var(--red);font-weight:600;font-size:12px">⚠ '+al.length+'</span>':'<span style="color:var(--teal)">✓</span>')+'</td>'
      +'<td><button class="btn btn-sm btn-primary" onclick="event.stopPropagation();ausgewaehlterId='+m.id+';planSession()"><i class="ti ti-calendar-plus"></i> Planen</button></td>'
      +'</tr>';
  });

  ma.innerHTML='<div class="topbar"><div class="tb-links">'
    +'<div style="width:40px;height:40px;border-radius:50%;background:var(--teal-bg);display:flex;align-items:center;justify-content:center;font-size:18px;color:var(--teal)"><i class="ti ti-users"></i></div>'
    +'<div><div class="tb-name">Manager-Übersicht</div><div class="tb-meta">'+liste.length+' aktive Mitarbeiter · Coaching-Status</div></div>'
    +'</div><div style="display:flex;gap:8px"><button class="btn btn-primary" onclick="openModal(\'neueSessionModal\')"><i class="ti ti-plus"></i> Session planen</button></div></div>'
    +'<div class="inhalt">'
    +'<div class="abschnitt-titel">Coaching-Aufmerksamkeit <span style="font-weight:400;color:var(--text3)">· Rot = über 14 Tage keine Session · Gelb = über 7 Tage</span></div>'
    +'<div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;margin-bottom:20px">'
    +'<table><thead><tr><th>Mitarbeiter</th><th>Sessions gesamt</th><th>Letzte Session</th><th>Letzte Bewertung</th><th>Entwicklungsfelder</th><th>KPI-Alerts</th><th>Aktion</th></tr></thead><tbody>'+rows+'</tbody></table>'
    +'</div></div>';
}
