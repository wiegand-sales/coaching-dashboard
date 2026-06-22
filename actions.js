// ══════════════════════════════════════════════
// SESSION AKTIONEN
// ══════════════════════════════════════════════
function sessionSpeichern(){
  var s=sessions.find(function(x){return x.id===aktivesScorecardId;});
  if(!s)return;
  var datumEl=document.getElementById('sc-datum');
  var typEl=document.getElementById('sc-typ');
  var themaEl=document.getElementById('sc-thema');
  var bewEl=document.getElementById('sc-bewertung');
  var notEl=document.getElementById('sc-notizen');
  var naEl=document.getElementById('sc-naechste');
  if(datumEl)s.datum=datumEl.value;
  if(typEl)s.typ=typEl.value;
  if(themaEl)s.thema=themaEl.value.trim();
  if(bewEl&&bewEl.value)s.gesamtBewertung=bewEl.value;
  if(notEl)s.notizen=notEl.value.trim();
  if(naEl)s.naechsteSchritte=naEl.value.trim();
  s.status='abgeschlossen';
  // Nächste Schritte als Aufgabe anlegen
  if(s.naechsteSchritte&&s.naechsteSchritte.trim()){
    if(!aufgaben[s.mitarbeiterId])aufgaben[s.mitarbeiterId]=[];
    aufgaben[s.mitarbeiterId].unshift({id:Date.now(),text:s.naechsteSchritte.trim(),beschreibung:'Aus Session vom '+datum(s.datum),erledigt:false,quelle:'Session '+datum(s.datum),prioritaet:'mittel',faelligAm:''});
  }
  closeModal('scorecardModal');
  renderSidebar();
  aktiverTab='sessions';
  renderMitarbeiterDetail();
}

function neueSessionAnlegen(){
  var maId=parseInt(document.getElementById('ns-mitarbeiter').value);
  var sessionDatum=document.getElementById('ns-datum').value;
  var typ=document.getElementById('ns-typ').value;
  var thema=document.getElementById('ns-thema').value.trim();
  var notiz=document.getElementById('ns-notiz').value.trim();
  if(!maId||!sessionDatum||!thema)return alert('Bitte Mitarbeiter, Datum und Thema ausfüllen.');
  sessions.push({
    id:Date.now(),mitarbeiterId:maId,datum:sessionDatum,typ:typ,thema:thema,
    status:'geplant',notizen:'',gesamtBewertung:null,scorecard:{},naechsteSchritte:'',
    coach:'Sales Coach',geplantVon:'Manager',planungsNotiz:notiz
  });
  closeModal('neueSessionModal');
  renderSidebar();
  ausgewaehlterId=maId;
  if(ansicht==='coach'){renderCoachAnsicht();}
  else{renderManagerAnsicht();}
}

// ══════════════════════════════════════════════
// AUFGABEN AKTIONEN
// ══════════════════════════════════════════════
function aufgabeErledigen(id){
  var ma=aufgaben[ausgewaehlterId]||[];
  var a=ma.find(function(x){return x.id===id;});
  if(a){a.erledigt=!a.erledigt;renderTab();}
}
function aufgabeLoeschen(id){
  if(!confirm('Aufgabe löschen?'))return;
  aufgaben[ausgewaehlterId]=(aufgaben[ausgewaehlterId]||[]).filter(function(x){return x.id!==id;});
  renderTab();
}
function toggleAufgabeDetail(id){
  var el=document.getElementById('aufg-detail-'+id);
  if(el){el.style.display=el.style.display==='none'?'block':'none';}
}
function neueAufgabeSpeichern(){
  var text=document.getElementById('na-text').value.trim();
  var beschr=document.getElementById('na-beschr').value.trim();
  var prio=document.getElementById('na-prio').value;
  var faellig=document.getElementById('na-faellig').value;
  var quelle=document.getElementById('na-quelle').value.trim();
  if(!text)return;
  if(!aufgaben[ausgewaehlterId])aufgaben[ausgewaehlterId]=[];
  aufgaben[ausgewaehlterId].unshift({id:Date.now(),text:text,beschreibung:beschr,erledigt:false,quelle:quelle,prioritaet:prio,faelligAm:faellig});
  document.getElementById('na-text').value='';
  document.getElementById('na-beschr').value='';
  document.getElementById('na-faellig').value='';
  document.getElementById('na-quelle').value='';
  closeModal('neueAufgabeModal');
  renderTab();
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
document.querySelectorAll('.modal-ov').forEach(function(m){
  m.addEventListener('click',function(e){if(e.target===m)m.classList.add('hidden');});
});
renderSidebar();
renderCoachAnsicht();
