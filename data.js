// ══════════════════════════════════════════════
// KONSTANTEN
// ══════════════════════════════════════════════
var FARBEN = [
  {bg:'#EEEDFE',text:'#3C3489'},{bg:'#E1F5EE',text:'#085041'},
  {bg:'#FAECE7',text:'#712B13'},{bg:'#FBEAF0',text:'#72243E'},
  {bg:'#E6F1FB',text:'#0C447C'},{bg:'#EAF3DE',text:'#27500A'},
  {bg:'#FEF3EE',text:'#7A2E0E'},{bg:'#F0F4FF',text:'#2D3A8C'},
];
var BEWERTUNGEN = ['Mega Yes','Super Yes','Yes','Teilweise'];
var BW = {
  'Mega Yes':  {bg:'#EAF3DE',color:'#27500A'},
  'Super Yes': {bg:'#EEEDFE',color:'#3C3489'},
  'Yes':       {bg:'#E6F1FB',color:'#0C447C'},
  'Teilweise': {bg:'#FAEEDA',color:'#633806'},
};
var ROLLEN = ['Vertriebsmitarbeiter','Senior Vertriebsmitarbeiter','Sales Coach'];
var PHASEN = ['Onboarding','Aktiv','Entwicklung'];

// Globale KPI-Ziele (überschreibbar pro Mitarbeiter)
var GLOBALE_ZIELE = {crOEM:55, crSuperYes:12, crMegaYes:8, optProStunde:2.0};

// ══════════════════════════════════════════════
// SCORECARD-KRITERIEN (aus eurer Excel)
// ══════════════════════════════════════════════
var SCORECARD = [
  {
    kategorie: 'Opener',
    gewichtung: 5,
    kriterien: [
      {id:'op1', name:'Gesprächseinstieg', beschreibung:'Agent startet freundlich und professionell ins Gespräch',
       stufen:['Kein klarer Start','Unsicher / abgelesen','Freundlich & klar','Sehr sicher, ruhig & professionell']},
      {id:'op2', name:'Gesprächsöffnung', beschreibung:'Agent stellt Bezug zur Bestellung her und führt zur Einwandsfrage',
       stufen:['Kein Bezug','Unklar / holprig','Verständlich erklärt','Natürlich & führt direkt zu Frage']},
    ]
  },
  {
    kategorie: 'Einwand',
    gewichtung: 40,
    kriterien: [
      {id:'ew1', name:'Qualifizierung', beschreibung:'Agent arbeitet heraus, was konkret hinter dem Einwand steckt',
       stufen:['Einwand nicht geklärt','Oberflächlich geklärt','Konkreter Einwand erkannt','Einwand klar und detailliert herausgearbeitet']},
      {id:'ew2', name:'Solidarisierung', beschreibung:'Agent zeigt echtes Verständnis für die Situation des Kunden',
       stufen:['Kein Verständnis','Oberflächlich / Floskel','Kunde fühlt sich verstanden','Kunde fühlt sich klar abgeholt']},
      {id:'ew3', name:'Umgang', beschreibung:'Agent reagiert passend auf den Einwand statt Standardargumentation',
       stufen:['Standardargumentation','Teilweise passend','Auf Einwand bezogen','Individuell und exakt passend']},
      {id:'ew4', name:'Entkräftung', beschreibung:'Agent entkräftet den Einwand nachvollziehbar und passend',
       stufen:['Einwand nicht oder falsch entkräftet','Teilweise passend, aber nicht überzeugend','Verständlich entkräftet','Klar, passend und überzeugend gelöst']},
      {id:'ew5', name:'Testabschluss', beschreibung:'Agent prüft aktiv, ob der Einwand gelöst ist',
       stufen:['Kein Check','Unsicher / indirekt','Klarer Check','Klare Zustimmung']},
      {id:'ew6', name:'Vertrauen aufbauen', beschreibung:'Agent gibt Sicherheit, dass der Wechsel funktioniert',
       stufen:['Keine Sicherheit','Allgemeine Aussagen','Glaubwürdige Sicherheit','Sehr konkrete & überzeugende Sicherheit']},
    ]
  },
  {
    kategorie: 'Loop',
    gewichtung: 10,
    kriterien: [
      {id:'lo1', name:'Re-Opening', beschreibung:'Agent bleibt im Gespräch und behandelt weitere Einwände',
       stufen:['Gibt auf oder verwendet ähnliche standard Floskeln','Behandelt Einwand, zöglicher Versuch einen Loop zu drehen','Behandelt mehrere Einwände','Bleibt dran und öffnet aktiv erneut']},
    ]
  },
  {
    kategorie: 'Bedarf',
    gewichtung: 15,
    kriterien: [
      {id:'be1', name:'Erweitern', beschreibung:'Agent fragt nach Nutzung und Anwendung',
       stufen:['Kein Bedarf erfragt','Oberflächlich gefragt','Bedarf angesprochen','Bedarf aktiv erweitert und genutzt']},
      {id:'be2', name:'Quantifizieren', beschreibung:'Agent fragt nach Menge, Frequenz oder Zeitraum',
       stufen:['Keine Zahlen erfragt','Allgemein gefragt','Teilweise konkret','Klar und vollständig quantifiziert']},
      {id:'be3', name:'Gesprächssignale', beschreibung:'Agent erkennt Hinweise und nutzt sie für weiteres Gespräch',
       stufen:['Hinweise nicht erkannt','Hinweise erkannt, aber nicht genutzt','Potenzial erkannt und angesprochen','Potenzial aktiv genutzt und verkauft']},
    ]
  },
  {
    kategorie: 'Abschluss / Mega Yes',
    gewichtung: 20,
    kriterien: [
      {id:'ab1', name:'Abschlussversuch', beschreibung:'Agent führt aktiv zur Entscheidung',
       stufen:['Kein Versuch','Zögerlich','Klarer Versuch','Sehr passend und umsatzsteigernd']},
      {id:'ab2', name:'Angebotsqualität', beschreibung:'Angebot passt zum Bedarf und erweitert sinnvoll',
       stufen:['Angebot passt nicht / Aktive Geld-Zurück angeboten','Teilweise passend','Passend','Aktive Angebotsgestaltung']},
      {id:'ab3', name:'Kaufsignale nutzen', beschreibung:'Agent erkennt und nutzt Kaufbereitschaft',
       stufen:['Ignoriert','Teilweise erkannt','Genutzt','Aktiv in Abschluss überführt']},
    ]
  },
  {
    kategorie: 'Gesprächsführung',
    gewichtung: 5,
    kriterien: [
      {id:'gf1', name:'Struktur', beschreibung:'Gespräch folgt klarem Ablauf',
       stufen:['Kein roter Faden','Teilweise Struktur','Klarer Ablauf','Sehr klar und flüssig']},
      {id:'gf2', name:'Gesprächskontrolle', beschreibung:'Agent steuert das Gespräch aktiv',
       stufen:['Kunde führt','Wechselhaft','Agent führt','Sehr souverän gesteuert']},
    ]
  },
];

// ══════════════════════════════════════════════
// MITARBEITER
// ══════════════════════════════════════════════
var mitarbeiter = [
  {id:1, name:'Anna Bauer',      rolle:'Vertriebsmitarbeiter',         phase:'Aktiv',      farbe:0, startDatum:'2026-04-01', team:'Deutschland', vertrag:'Vollzeit', stunden:40, aktiv:true, ziele:{crOEM:55,crSuperYes:12,crMegaYes:8,optProStunde:2.0}},
  {id:2, name:'Markus Fischer',  rolle:'Vertriebsmitarbeiter',         phase:'Onboarding', farbe:1, startDatum:'2026-06-01', team:'Deutschland', vertrag:'Vollzeit', stunden:40, aktiv:true, ziele:{crOEM:50,crSuperYes:10,crMegaYes:6,optProStunde:1.5}},
  {id:3, name:'Sandra Klein',    rolle:'Senior Vertriebsmitarbeiter',  phase:'Aktiv',      farbe:2, startDatum:'2026-03-01', team:'Valencia',     vertrag:'Vollzeit', stunden:40, aktiv:true, ziele:{crOEM:60,crSuperYes:15,crMegaYes:10,optProStunde:2.5}},
  {id:4, name:'Thomas Müller',   rolle:'Senior Vertriebsmitarbeiter',  phase:'Aktiv',      farbe:3, startDatum:'2026-02-01', team:'Deutschland', vertrag:'Vollzeit', stunden:40, aktiv:true, ziele:{crOEM:60,crSuperYes:15,crMegaYes:10,optProStunde:2.5}},
  {id:5, name:'Julia Schneider', rolle:'Vertriebsmitarbeiter',         phase:'Entwicklung',farbe:4, startDatum:'2026-05-01', team:'Valencia',     vertrag:'Teilzeit', stunden:32, aktiv:true, ziele:{crOEM:55,crSuperYes:12,crMegaYes:8,optProStunde:2.0}},
];

// ══════════════════════════════════════════════
// COACHING SESSIONS
// ══════════════════════════════════════════════
var sessions = [
  // Anna Bauer – 3 Sessions
  {
    id:101, mitarbeiterId:1, datum:'2026-06-10', typ:'Gesprächsbewertung',
    thema:'Einwandbehandlung', status:'abgeschlossen',
    notizen:'Anna zeigt deutliche Fortschritte bei der Solidarisierung. Testabschluss muss noch konsequenter eingesetzt werden.',
    gesamtBewertung:'Super Yes',
    scorecard:{op1:3,op2:3,ew1:3,ew2:4,ew3:3,ew4:3,ew5:2,ew6:3,lo1:3,be1:3,be2:3,be3:2,ab1:3,ab2:3,ab3:2,gf1:3,gf2:3},
    naechsteSchritte:'Testabschluss täglich üben. SolidRoad Simulation "Einwand Preis" wiederholen.',
    coach:'Sales Coach'
  },
  {
    id:102, mitarbeiterId:1, datum:'2026-05-22', typ:'Gesprächsbewertung',
    thema:'Abschlusstechnik', status:'abgeschlossen',
    notizen:'Gesprächsführung solide. Kaufsignale werden erkannt aber nicht konsequent genutzt.',
    gesamtBewertung:'Yes',
    scorecard:{op1:3,op2:3,ew1:3,ew2:3,ew3:2,ew4:3,ew5:2,ew6:3,lo1:2,be1:3,be2:2,be3:2,ab1:2,ab2:3,ab3:2,gf1:3,gf2:3},
    naechsteSchritte:'Fokus auf Kaufsignale. Nächste Session: Live-Mitschnitt analysieren.',
    coach:'Sales Coach'
  },
  {
    id:103, mitarbeiterId:1, datum:'2026-05-05', typ:'Onboarding-Session',
    thema:'Gesprächseinstieg', status:'abgeschlossen',
    notizen:'Erster echter Anlauf. Opener funktioniert gut, Einwandbehandlung noch sehr unsicher.',
    gesamtBewertung:'Teilweise',
    scorecard:{op1:3,op2:2,ew1:2,ew2:2,ew3:1,ew4:1,ew5:1,ew6:2,lo1:1,be1:2,be2:1,be3:1,ab1:1,ab2:2,ab3:1,gf1:2,gf2:2},
    naechsteSchritte:'SolidRoad Einwand-Modul komplett durcharbeiten bevor nächstes echtes Gespräch.',
    coach:'Sales Coach'
  },
  // Thomas Müller – 2 Sessions
  {
    id:201, mitarbeiterId:4, datum:'2026-06-11', typ:'Gesprächsbewertung',
    thema:'Eigenmarken-Umstieg', status:'abgeschlossen',
    notizen:'Absolutes Top-Gespräch. Thomas hat alle Einwände souverän behandelt, Mega Yes erzielt.',
    gesamtBewertung:'Mega Yes',
    scorecard:{op1:4,op2:4,ew1:4,ew2:4,ew3:4,ew4:4,ew5:4,ew6:4,lo1:4,be1:4,be2:3,be3:4,ab1:4,ab2:4,ab3:4,gf1:4,gf2:4},
    naechsteSchritte:'Als Best-Practice für Team dokumentieren. Thomas als Mentor für neue Kollegen?',
    coach:'Sales Coach'
  },
  {
    id:202, mitarbeiterId:4, datum:'2026-05-15', typ:'Gesprächsbewertung',
    thema:'Bedarfsermittlung', status:'abgeschlossen',
    notizen:'Sehr gute Entwicklung. Quantifizierung könnte noch präziser sein.',
    gesamtBewertung:'Super Yes',
    scorecard:{op1:4,op2:3,ew1:3,ew2:4,ew3:4,ew4:3,ew5:3,ew6:3,lo1:3,be1:3,be2:3,be3:3,ab1:3,ab2:3,ab3:3,gf1:4,gf2:4},
    naechsteSchritte:'Quantifizierung beim Bedarf gezielt ausbauen.',
    coach:'Sales Coach'
  },
  // Julia Schneider – 1 Session
  {
    id:301, mitarbeiterId:5, datum:'2026-06-09', typ:'Anlassbezogene Session',
    thema:'Nutzenargumentation', status:'abgeschlossen',
    notizen:'Aktives Zuhören gut, aber Verbindung zum konkreten Nutzen fehlt noch. Re-Opening wird kaum eingesetzt.',
    gesamtBewertung:'Teilweise',
    scorecard:{op1:3,op2:2,ew1:2,ew2:3,ew3:2,ew4:2,ew5:1,ew6:2,lo1:1,be1:2,be2:2,be3:2,ab1:2,ab2:2,ab3:1,gf1:2,gf2:2},
    naechsteSchritte:'Loop-Technik üben. Wöchentliche Session für nächste 4 Wochen einplanen.',
    coach:'Sales Coach'
  },
  // Markus Fischer – geplante Sessions (Onboarding)
  {
    id:401, mitarbeiterId:2, datum:'2026-06-23', typ:'Onboarding-Session',
    thema:'Gesprächsstruktur', status:'geplant',
    notizen:'', gesamtBewertung:null, scorecard:{}, naechsteSchritte:'',
    coach:'Sales Coach', geplantVon:'Sales Manager',
    planungsNotiz:'Markus ist bereit für erste begleitete Gespräche. Fokus: Opener und Struktur.'
  },
  {
    id:402, mitarbeiterId:2, datum:'2026-06-30', typ:'Onboarding-Session',
    thema:'Einwandbehandlung', status:'geplant',
    notizen:'', gesamtBewertung:null, scorecard:{}, naechsteSchritte:'',
    coach:'Sales Coach', geplantVon:'Sales Coach',
    planungsNotiz:'Erste Einwände live begleiten.'
  },
];

// ══════════════════════════════════════════════
// PERFORMANCE DATEN (aus FTP)
// ══════════════════════════════════════════════
function genPerf(basis, tage) {
  var arr = [];
  for (var i = 0; i < tage; i++) {
    var d = new Date('2026-06-22T00:00:00');
    d.setDate(d.getDate() - i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    var gespraeche = Math.round(basis.gespraeche + Math.random() * 6 - 3);
    var crOEM = Math.min(100, Math.max(0, Math.round(basis.crOEM + Math.random() * 14 - 7)));
    arr.push({
      datum: d.toISOString().slice(0, 10),
      gespraeche: gespraeche,
      crOEM: crOEM,
      crTeilweise: Math.min(100, Math.max(0, Math.round(basis.crTeilweise + Math.random() * 8 - 4))),
      crYes: Math.min(100, Math.max(0, Math.round(basis.crYes + Math.random() * 8 - 4))),
      crSuperYes: Math.min(100, Math.max(0, Math.round(basis.crSuperYes + Math.random() * 8 - 4))),
      crMegaYes: Math.min(100, Math.max(0, Math.round(basis.crMegaYes + Math.random() * 6 - 3))),
      optProStunde: Math.max(0, Math.round((basis.optProStunde + Math.random() * 0.8 - 0.4) * 10) / 10),
      marge: Math.round(Math.round(gespraeche * crOEM / 100) * (basis.margeProConv + Math.random() * 4 - 2)),
    });
  }
  return arr;
}
var performance = {
  1: genPerf({gespraeche:22,crOEM:63,crTeilweise:18,crYes:22,crSuperYes:14,crMegaYes:9,optProStunde:2.0,margeProConv:14}, 90),
  2: genPerf({gespraeche:14,crOEM:41,crTeilweise:28,crYes:18,crSuperYes:8,crMegaYes:5,optProStunde:1.2,margeProConv:11}, 30),
  3: genPerf({gespraeche:20,crOEM:58,crTeilweise:21,crYes:20,crSuperYes:11,crMegaYes:6,optProStunde:1.7,margeProConv:13}, 90),
  4: genPerf({gespraeche:27,crOEM:78,crTeilweise:12,crYes:25,crSuperYes:24,crMegaYes:17,optProStunde:3.2,margeProConv:16}, 90),
  5: genPerf({gespraeche:17,crOEM:47,crTeilweise:26,crYes:16,crSuperYes:9,crMegaYes:4,optProStunde:1.4,margeProConv:12}, 60),
};

// ══════════════════════════════════════════════
// SOLIDROAD DATEN
// ══════════════════════════════════════════════
var solidroad = {
  1: {simulationen:[
    {id:1,datum:'2026-06-09',name:'Einwand: Preis zu hoch',score:88,bestanden:true,tags:['Einwandbehandlung','Abschluss']},
    {id:2,datum:'2026-06-03',name:'Eigenmarken-Pitch – Kaltakquise',score:74,bestanden:true,tags:['Nutzenargumentation']},
    {id:3,datum:'2026-05-28',name:'Bedarfsermittlung – Neukunde',score:91,bestanden:true,tags:['Bedarfsermittlung']},
  ]},
  2: {simulationen:[
    {id:4,datum:'2026-06-15',name:'Einwand: Habe bereits Lieferant',score:58,bestanden:false,tags:['Einwandbehandlung']},
    {id:5,datum:'2026-06-10',name:'Opener & Gesprächseinstieg',score:72,bestanden:true,tags:['Opener']},
  ]},
  3: {simulationen:[
    {id:6,datum:'2026-06-10',name:'Eigenmarken-Pitch – Bestandskunde',score:94,bestanden:true,tags:['Pitch','Abschluss']},
  ]},
  4: {simulationen:[
    {id:7,datum:'2026-06-10',name:'Eigenmarken-Pitch – Bestandskunde',score:96,bestanden:true,tags:['Pitch','Abschluss']},
    {id:8,datum:'2026-06-05',name:'Einwand: Qualitätsbedenken',score:89,bestanden:true,tags:['Einwandbehandlung']},
  ]},
  5: {simulationen:[
    {id:9,datum:'2026-06-08',name:'Bedarfsermittlung – KMU Kunde',score:67,bestanden:true,tags:['Bedarfsermittlung']},
  ]},
};

// ══════════════════════════════════════════════
// AUFGABEN
// ══════════════════════════════════════════════
var aufgaben = {
  1: [
    {id:1,text:'Pitch-Skript lesen – Seiten 1 bis 9',beschreibung:'Fokus auf Nutzenargumentation Seiten 4-6.',erledigt:false,quelle:'Session 10.06',prioritaet:'hoch',faelligAm:'2026-06-27'},
    {id:2,text:'SolidRoad Simulation "Einwand Preis" wiederholen',beschreibung:'Ziel: über 85 Punkte erreichen.',erledigt:true,quelle:'Session 10.06',prioritaet:'mittel',faelligAm:'2026-06-24'},
  ],
  2: [
    {id:3,text:'Onboarding-Video Tag 2 anschauen',beschreibung:'Toner-Kompatibilität und Eigenmarken-Unterschiede.',erledigt:false,quelle:'Onboarding',prioritaet:'hoch',faelligAm:'2026-06-25'},
  ],
  3: [], 4: [], 5: [
    {id:4,text:'Loop-Technik täglich üben',beschreibung:'5 Minuten Rollenspiel pro Tag mit Kollegen.',erledigt:false,quelle:'Session 09.06',prioritaet:'hoch',faelligAm:'2026-06-28'},
  ],
};
