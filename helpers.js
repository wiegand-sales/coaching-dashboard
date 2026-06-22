// ══════════════════════════════════════════════
// HILFSFUNKTIONEN
// ══════════════════════════════════════════════
function kuerzel(n){return n.split(' ').map(function(x){return x[0];}).join('').toUpperCase().slice(0,2);}
function datum(d){if(!d)return '';var p=d.split('-');return p[2]+'.'+p[1]+'.'+p[0];}
function heute(){return new Date().toISOString().slice(0,10);}
function wochentag(d){return ['So','Mo','Di','Mi','Do','Fr','Sa'][new Date(d+'T00:00:00').getDay()];}

function mitarbeiterZiele(ma){return (ma&&ma.ziele)?ma.ziele:GLOBALE_ZIELE;}
function aktiveMitarbeiter(){return mitarbeiter.filter(function(m){return m.aktiv!==false;});}
function allTeams(){var ts={};mitarbeiter.forEach(function(m){if(m.team)ts[m.team]=1;});return Object.keys(ts).sort();}

function getPerf(id, tage){
  var p=performance[id]||[];
  var cutoff=new Date('2026-06-22T00:00:00');
  cutoff.setDate(cutoff.getDate()-tage);
  return p.filter(function(x){return new Date(x.datum)>=cutoff;}).sort(function(a,b){return new Date(a.datum)-new Date(b.datum);});
}
function perfSchnitt(id, schluessel, tage){
  var p=getPerf(id,tage||7);
  if(!p.length)return null;
  return p.reduce(function(a,x){return a+x[schluessel];},0)/p.length;
}

function alertsPruefen(ma){
  var z=mitarbeiterZiele(ma);
  var alerts=[];
  var oem=perfSchnitt(ma.id,'crOEM',7),sy=perfSchnitt(ma.id,'crSuperYes',7),my=perfSchnitt(ma.id,'crMegaYes',7),opt=perfSchnitt(ma.id,'optProStunde',7);
  if(oem!==null&&oem<z.crOEM)alerts.push({key:'CR OEM',wert:oem.toFixed(0)+'%',ziel:z.crOEM+'%'});
  if(sy!==null&&sy<z.crSuperYes)alerts.push({key:'CR Super Yes',wert:sy.toFixed(0)+'%',ziel:z.crSuperYes+'%'});
  if(my!==null&&my<z.crMegaYes)alerts.push({key:'CR Mega Yes',wert:my.toFixed(0)+'%',ziel:z.crMegaYes+'%'});
  if(opt!==null&&opt<z.optProStunde)alerts.push({key:'Opt./Stunde',wert:opt.toFixed(1),ziel:z.optProStunde});
  return alerts;
}

function sessionsFuerMitarbeiter(id){
  return sessions.filter(function(s){return s.mitarbeiterId===id;})
    .sort(function(a,b){return b.datum.localeCompare(a.datum);});
}
function letzteSession(id){
  var abg=sessions.filter(function(s){return s.mitarbeiterId===id&&s.status==='abgeschlossen';});
  if(!abg.length)return null;
  return abg.sort(function(a,b){return b.datum.localeCompare(a.datum);})[0];
}
function geplanteSessionsHeute(){
  var h=heute();
  return sessions.filter(function(s){return s.datum===h&&s.status==='geplant';});
}
function geplanteSessionsDemnächst(tage){
  var h=heute();
  var bis=new Date(h+'T00:00:00');bis.setDate(bis.getDate()+(tage||7));
  var bisStr=bis.toISOString().slice(0,10);
  return sessions.filter(function(s){return s.status==='geplant'&&s.datum>=h&&s.datum<=bisStr;})
    .sort(function(a,b){return a.datum.localeCompare(b.datum);});
}

// Scorecard-Gesamtpunktzahl berechnen (gewichtet)
function scorecardGesamtpunkte(scorecard){
  if(!scorecard||!Object.keys(scorecard).length)return null;
  var gesamt=0;var maxPunkte=0;
  SCORECARD.forEach(function(kat){
    var katPunkte=0;var katMax=0;
    kat.kriterien.forEach(function(k){
      var val=scorecard[k.id];
      if(val!==undefined){katPunkte+=val;katMax+=4;}
    });
    if(katMax>0){gesamt+=((katPunkte/katMax)*kat.gewichtung);maxPunkte+=kat.gewichtung;}
  });
  if(!maxPunkte)return null;
  return Math.round((gesamt/maxPunkte)*100);
}

// Stärken & Schwächen aus allen Sessions eines Mitarbeiters
function staerkenSchwaechen(maId){
  var abg=sessions.filter(function(s){return s.mitarbeiterId===maId&&s.status==='abgeschlossen'&&s.scorecard&&Object.keys(s.scorecard).length>0;});
  if(!abg.length)return null;
  var summen={};var anzahl={};
  abg.forEach(function(s){
    Object.keys(s.scorecard).forEach(function(kid){
      summen[kid]=(summen[kid]||0)+s.scorecard[kid];
      anzahl[kid]=(anzahl[kid]||0)+1;
    });
  });
  var ergebnisse=[];
  SCORECARD.forEach(function(kat){
    kat.kriterien.forEach(function(k){
      if(summen[k.id]!==undefined){
        ergebnisse.push({id:k.id,name:k.name,kategorie:kat.kategorie,schnitt:summen[k.id]/anzahl[k.id],anzahl:anzahl[k.id]});
      }
    });
  });
  ergebnisse.sort(function(a,b){return b.schnitt-a.schnitt;});
  return {staerken:ergebnisse.slice(0,3),schwaechen:ergebnisse.slice(-3).reverse(),alle:ergebnisse};
}

function scorefarbe(wert,max){
  max=max||4;var pct=wert/max;
  return pct>=0.875?'var(--teal)':pct>=0.625?'var(--purple)':pct>=0.375?'var(--amber)':'var(--red)';
}
function phaseBg(ph){return{Aktiv:BW['Yes'].bg,Onboarding:BW['Teilweise'].bg,Entwicklung:BW['Super Yes'].bg}[ph]||'#f0efec';}
function phaseCol(ph){return{Aktiv:BW['Yes'].color,Onboarding:BW['Teilweise'].color,Entwicklung:BW['Super Yes'].color}[ph]||'#6b6b67';}
function srSchnitt(id){var d=solidroad[id];if(!d||!d.simulationen.length)return null;var v=d.simulationen.map(function(s){return s.score;});return Math.round(v.reduce(function(a,b){return a+b;},0)/v.length);}
function offeneAufgaben(id){return(aufgaben[id]||[]).filter(function(t){return !t.erledigt;}).length;}

function openModal(id){document.getElementById(id).classList.remove('hidden');}
function closeModal(id){document.getElementById(id).classList.add('hidden');}
