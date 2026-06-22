// ── HELPERS ──
function ini(n){return n.split(' ').map(function(x){return x[0];}).join('').toUpperCase().slice(0,2);}
function fd(d){if(!d)return '';var p=d.split('-');return p[2]+'.'+p[1]+'.'+p[0];}
function today(){return new Date().toISOString().slice(0,10);}
function avgSkill(id){var p=protocols[id];if(!p||!p.length||!p[0].skills)return null;var v=Object.values(p[0].skills);return Math.round(v.reduce(function(a,b){return a+b;},0)/v.length);}
function lastRating(id){var p=protocols[id];return(p&&p.length)?p[0].rating:null;}
function srAvg(id){var d=solidroadData[id];if(!d||!d.simulations.length)return null;var v=d.simulations.map(function(s){return s.score;});return Math.round(v.reduce(function(a,b){return a+b;},0)/v.length);}
function scoreColor(s){return s>=85?'var(--teal)':s>=70?'var(--purple)':'var(--amber)';}
function phaseBg(ph){return{Active:RS['Yes'].bg,Onboarding:RS['Teilweise'].bg,Development:RS['Super Yes'].bg}[ph]||'#f0efec';}
function phaseCol(ph){return{Active:RS['Yes'].color,Onboarding:RS['Teilweise'].color,Development:RS['Super Yes'].color}[ph]||'#6b6b67';}
function getPerf(id,days){
  var p=performance[id]||[];
  var cutoff=new Date('2026-06-13T00:00:00');
  cutoff.setDate(cutoff.getDate()-days);
  return p.filter(function(x){return new Date(x.date)>=cutoff;}).sort(function(a,b){return new Date(a.date)-new Date(b.date);});
}
function pavg(id,key,days){
  var p=getPerf(id,days||7);
  if(!p.length)return null;
  return p.reduce(function(a,x){return a+x[key];},0)/p.length;
}
function checkAlerts(id){
  var alerts=[];
  var oem=pavg(id,'crOEM',7),sy=pavg(id,'crSuperYes',7),opt=pavg(id,'optPerH',7);
  if(oem!==null&&oem<CR_GOOD)alerts.push({key:'CR OEM',val:oem.toFixed(0)+'%',target:CR_GOOD+'%'});
  if(sy!==null&&sy<KPI_TARGETS.crSuperYes)alerts.push({key:'CR Super Yes',val:sy.toFixed(0)+'%',target:KPI_TARGETS.crSuperYes+'%'});
  if(opt!==null&&opt<KPI_TARGETS.optPerH)alerts.push({key:'Opt./Hour',val:opt.toFixed(1),target:KPI_TARGETS.optPerH});
  return alerts;
}
function openTaskCount(id){return(tasks[id]||[]).filter(function(t){return!t.done;}).length;}
function empTargets(emp){
  return (emp&&emp.targets)?emp.targets:GLOBAL_TARGETS;
}
function allTeams(){
  var ts={};
  employees.forEach(function(e){if(e.team)ts[e.team]=1;});
  return Object.keys(ts).sort();
}
function activeEmployees(){
  return employees.filter(function(e){return e.active!==false;});
}
