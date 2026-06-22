
// ── CONSTANTS ──
var COLORS=[{bg:'#EEEDFE',text:'#3C3489'},{bg:'#E1F5EE',text:'#085041'},{bg:'#FAECE7',text:'#712B13'},{bg:'#FBEAF0',text:'#72243E'},{bg:'#E6F1FB',text:'#0C447C'},{bg:'#EAF3DE',text:'#27500A'}];
var RATINGS=['Mega Yes','Super Yes','Yes','Teilweise'];
var RS={'Mega Yes':{bg:'#EAF3DE',color:'#27500A'},'Super Yes':{bg:'#EEEDFE',color:'#3C3489'},'Yes':{bg:'#E6F1FB',color:'#0C447C'},'Teilweise':{bg:'#FAEEDA',color:'#633806'}};
var SKILLS=['Needs Analysis','Value Argumentation','Objection Handling','Trust Building','Closing Technique'];
var SK_DE=['Bedarfsermittlung','Nutzenargumentation','Einwandbehandlung','Vertrauensaufbau','Abschlusstechnik'];
var KPI_TARGETS={crOEM:55,crSuperYes:12,crMegaYes:8,optPerH:2.0};
var CR_GOOD=55;

// ── STATE ──
var settings={srApiKey:'',srOrgId:'',ftpUrl:''};
var view='team', selectedEmp=1, activeTab='performance';
var perfMetric='optPerH', perfRange=7;
var activeChart=null;

// ── DATA ──
var ratingCriteria=[
  {id:1,name:'Needs Analysis Quality',cat:'Sales',target:80,desc:'How well the rep identifies customer needs'},
  {id:2,name:'Own-Brand Argumentation',cat:'Sales',target:80,desc:'Quality of value proposition for own-brand'},
  {id:3,name:'Objection Handling',cat:'Sales',target:75,desc:'Effectiveness in handling objections'},
  {id:4,name:'Closing Initiative',cat:'Sales',target:75,desc:'Proactively guiding the conversation to a close'},
  {id:5,name:'Customer Rapport',cat:'Communication',target:85,desc:'Building trust and a positive relationship'},
];

var ROLES=['Vertriebsmitarbeiter','Senior Vertriebsmitarbeiter','Sales Coach'];
var GLOBAL_TARGETS={crOEM:55,crSuperYes:12,crMegaYes:8,optPerH:2.0};

var employees=[
  {id:1,name:'Anna Bauer',role:'Sales Representative',phase:'Aktiv',color:0,startDate:'2026-04-01',team:'Deutschland',contract:'Vollzeit',hours:40,active:true,targets:{crOEM:55,crSuperYes:12,crMegaYes:8,optPerH:2.0}},
  {id:2,name:'Markus Fischer',role:'Sales Representative',phase:'Onboarding',color:1,startDate:'2026-06-01',team:'Deutschland',contract:'Vollzeit',hours:40,active:true,targets:{crOEM:50,crSuperYes:10,crMegaYes:6,optPerH:1.5}},
  {id:3,name:'Sandra Klein',role:'Sales Executive',phase:'Aktiv',color:2,startDate:'2026-03-01',team:'Valencia',contract:'Vollzeit',hours:40,active:true,targets:{crOEM:60,crSuperYes:15,crMegaYes:10,optPerH:2.5}},
  {id:4,name:'Thomas Müller',role:'Sales Executive',phase:'Aktiv',color:3,startDate:'2026-02-01',team:'Deutschland',contract:'Vollzeit',hours:40,active:true,targets:{crOEM:60,crSuperYes:15,crMegaYes:10,optPerH:2.5}},
  {id:5,name:'Julia Schneider',role:'Sales Representative',phase:'Entwicklung',color:4,startDate:'2026-05-01',team:'Valencia',contract:'Teilzeit',hours:32,active:true,targets:{crOEM:55,crSuperYes:12,crMegaYes:8,optPerH:2.0}},
];

var protocols={
  1:[
    {id:1,date:'2026-06-10',rating:'Super Yes',note:'Anna hat die Bedarfsermittlung deutlich verbessert. Offene Fragen wurden gezielt eingesetzt.',focus:'Eigenmarken-Umstieg',skills:{Bedarfsermittlung:85,Nutzenargumentation:80,Einwandbehandlung:70,Vertrauensaufbau:90,Abschlusstechnik:75},criteria:{1:88,2:82,3:71,4:76,5:90}},
    {id:2,date:'2026-05-22',rating:'Yes',note:'Gutes Gespräch. Abschluss könnte direkter initiiert werden.',focus:'Abschlussstärke',skills:{Bedarfsermittlung:80,Nutzenargumentation:75,Einwandbehandlung:68,Vertrauensaufbau:85,Abschlusstechnik:60},criteria:{1:80,2:75,3:68,4:61,5:85}},
    {id:3,date:'2026-05-05',rating:'Teilweise',note:'Erster Anlauf mit neuem Gesprächsleitfaden. Struktur noch nicht verinnerlicht.',focus:'Gesprächsstruktur',skills:{Bedarfsermittlung:60,Nutzenargumentation:55,Einwandbehandlung:50,Vertrauensaufbau:70,Abschlusstechnik:45},criteria:{1:60,2:55,3:50,4:46,5:70}},
  ],
  2:[{id:4,date:'2026-06-08',rating:'Yes',note:'Onboarding läuft gut. Produktkenntnisse wachsen.',focus:'Produktwissen',skills:{Bedarfsermittlung:55,Nutzenargumentation:60,Einwandbehandlung:45,Vertrauensaufbau:65,Abschlusstechnik:40},criteria:{1:55,2:60,3:45,4:40,5:65}}],
  3:[],
  4:[{id:5,date:'2026-06-11',rating:'Mega Yes',note:'Thomas switched a long-term customer to own-brand. Best-practice example.',focus:'Eigenmarken-Umstieg',skills:{Bedarfsermittlung:92,Nutzenargumentation:95,Einwandbehandlung:88,Vertrauensaufbau:95,Abschlusstechnik:90},criteria:{1:92,2:95,3:88,4:90,5:95}}],
  5:[{id:6,date:'2026-06-09',rating:'Teilweise',note:'Aktives Zuhören gut, aber Verbindung zum Nutzen der Eigenmarke fehlt noch.',focus:'Nutzenargumentation',skills:{Bedarfsermittlung:70,Nutzenargumentation:50,Einwandbehandlung:55,Vertrauensaufbau:72,Abschlusstechnik:45},criteria:{1:70,2:50,3:55,4:46,5:72}}],
};
function genPerf(base,days){
  var arr=[];
  for(var i=0;i<days;i++){
    var d=new Date('2026-06-13T00:00:00');
    d.setDate(d.getDate()-i);
    if(d.getDay()===0||d.getDay()===6) continue;
    var calls=Math.round(base.calls+Math.random()*6-3);
    var crOEM=Math.min(100,Math.max(0,Math.round(base.crOEM+Math.random()*14-7)));
    var conv=Math.round(calls*crOEM/100);
    arr.push({
      id:i,date:d.toISOString().slice(0,10),calls:calls,
      crOEM:crOEM,
      crTeilweise:Math.min(100,Math.max(0,Math.round(base.crTeilweise+Math.random()*8-4))),
      crYes:Math.min(100,Math.max(0,Math.round(base.crYes+Math.random()*8-4))),
      crSuperYes:Math.min(100,Math.max(0,Math.round(base.crSuperYes+Math.random()*8-4))),
      crMegaYes:Math.min(100,Math.max(0,Math.round(base.crMegaYes+Math.random()*6-3))),
      optPerH:Math.max(0,Math.round((base.optPerH+Math.random()*.8-.4)*10)/10),
      margin:Math.round(conv*(base.marginPerConv+Math.random()*4-2)),
      note:''
    });
  }
  return arr;
}
var performance={
  1:genPerf({calls:22,crOEM:63,crTeilweise:18,crYes:22,crSuperYes:14,crMegaYes:9,optPerH:2.0,marginPerConv:14},90),
  2:genPerf({calls:14,crOEM:41,crTeilweise:28,crYes:18,crSuperYes:8,crMegaYes:5,optPerH:1.2,marginPerConv:11},30),
  3:genPerf({calls:20,crOEM:58,crTeilweise:21,crYes:20,crSuperYes:11,crMegaYes:6,optPerH:1.7,marginPerConv:13},90),
  4:genPerf({calls:27,crOEM:78,crTeilweise:12,crYes:25,crSuperYes:24,crMegaYes:17,optPerH:3.2,marginPerConv:16},90),
  5:genPerf({calls:17,crOEM:47,crTeilweise:26,crYes:16,crSuperYes:9,crMegaYes:4,optPerH:1.4,marginPerConv:12},60),
};

var solidroadData={
  1:{simulations:[{id:1,date:'2026-06-09',name:'Objection: Price too high',score:88,status:'passed',tags:['Objection Handling','Closing']},{id:2,date:'2026-06-03',name:'Own-brand pitch – cold call',score:74,status:'passed',tags:['Value Argumentation']},{id:3,date:'2026-05-28',name:'Needs analysis – new customer',score:91,status:'passed',tags:['Needs Analysis']}]},
  2:{simulations:[{id:4,date:'2026-06-07',name:'Objection: Already have a supplier',score:61,status:'passed',tags:['Objection Handling']}]},
  3:{simulations:[]},
  4:{simulations:[{id:5,date:'2026-06-10',name:'Own-brand pitch – existing customer',score:96,status:'passed',tags:['Pitch','Closing']},{id:6,date:'2026-06-05',name:'Objection: Quality concerns',score:89,status:'passed',tags:['Objection Handling']}]},
  5:{simulations:[{id:7,date:'2026-06-08',name:'Needs analysis – SME customer',score:67,status:'passed',tags:['Needs Analysis']}]},
};

var onboarding={1:[true,true,true,true,true],2:[true,true,true,false,false],3:[true,false,false,false,false],4:[true,true,true,true,true],5:[true,true,true,false,false]};

var obSteps=[
  {label:'Einführungsgespräch',day:1,detail:'First meeting with the coach. Goals and development plan are discussed. Duration approx. 60 minutes.',videoUrl:''},
  {label:'Product Training – Basics',day:1,detail:'Core knowledge of toner, ink and consumables. Differences between OEM and own-brand. Price-value arguments.',videoUrl:''},
  {label:'Gesprächsleitfaden',day:2,detail:'The Wiegand & Partner framework: Needs Analysis → Value Presentation → Objection Handling → Closing. Includes role plays.',videoUrl:''},
  {label:'Erste Kundengespräche',day:2,detail:'Accompanied practice phase. Coach listens in and gives immediate feedback after each call.',videoUrl:''},
  {label:'Zielvereinbarung',day:3,detail:'Quarterly targets: CR OEM target, average rating target, Super Yes / Mega Yes per week.',videoUrl:''},
];

var tasks={
  1:[
    {id:1,text:'Read the pitch script – pages 1 to 9',description:'Take the own-brand pitch script and read pages 1 to 9. Pay special attention to the value argumentation on pages 4-6.',done:false,source:'Session 10.06.2026',priority:'high',dueDate:'2026-06-17'},
    {id:2,text:'SolidRoad-Simulation abschließen: Eigenmarken-Pitch',description:'In SolidRoad einloggen und die Eigenmarken-Pitch-Simulation abschließen. Ziel: über 80 Punkte.',done:true,source:'Session 10.06.2026',priority:'medium',dueDate:'2026-06-14'},
    {id:3,text:'Work through onboarding tool – tasks 1 to 5',description:'Das digitale Onboarding-Tool nutzen und Aufgaben 1 bis 5 abarbeiten. Geschätzte Zeit: 45 Minuten.',done:false,source:'Onboarding',priority:'high',dueDate:'2026-06-10'},
  ],
  2:[{id:4,text:'Watch product training video – Day 2',description:'Den Onboarding-Bereich für Tag 2 öffnen und das Schulungsvideo zur Toner-Kompatibilität anschauen.',done:false,source:'Onboarding Tag 2',priority:'high',dueDate:'2026-06-20'}],
  3:[],
  4:[{id:5,text:'Best-Practice-Gespräch vom 11.06 dokumentieren',description:'Write a short summary of the customer call on 11.06 where you switched the customer to own-brand. Max. 1 page.',done:false,source:'Session 11.06.2026',priority:'high',dueDate:'2026-06-16'}],
  5:[{id:6,text:'Practice needs analysis – print volume questions',description:'Prepare 5 open questions about print volume and cost per page. Practice saying them out loud.',done:false,source:'Session 09.06.2026',priority:'medium',dueDate:'2026-06-18'}],
};
// ── REVIEWS ──
var reviews={
  1:[{id:1,type:'Onboarding-Gespräch',date:'2026-07-01',status:'geplant',notes:'',goals:'',rating:null,kpis:{}}],
  2:[{id:2,type:'Onboarding-Gespräch',date:'2026-09-01',status:'geplant',notes:'',goals:'',rating:null,kpis:{}}],
  3:[{id:3,type:'Performance-Gespräch',date:'2026-06-01',status:'abgeschlossen',notes:'Starke Performance. CR OEM Ziel konstant übertroffen.',goals:'Super Yes Rate auf 18% steigern. Fokus auf Abschlusstechnik.',rating:'Super Yes',kpis:{crOEM:61,crSuperYes:14,crMegaYes:8,optPerH:2.1}},
     {id:4,type:'Jahresgespräch',date:'2027-01-01',status:'geplant',notes:'',goals:'',rating:null,kpis:{}}],
  4:[{id:5,type:'Onboarding-Gespräch',date:'2026-05-01',status:'abgeschlossen',notes:'Exzellentes Onboarding. Best-Practice-Beispiel für Eigenmarken-Umstieg.',goals:'Mega Yes Rate halten. Best-Practice-Gespräche dokumentieren.',rating:'Mega Yes',kpis:{crOEM:76,crSuperYes:22,crMegaYes:15,optPerH:3.0}},
     {id:6,type:'Performance-Gespräch',date:'2026-12-01',status:'geplant',notes:'',goals:'',rating:null,kpis:{}}],
  5:[{id:7,type:'Onboarding-Gespräch',date:'2026-08-01',status:'geplant',notes:'',goals:'',rating:null,kpis:{}}],
};
