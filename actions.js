// ── ACTIONS ──
function setMetric(m){perfMetric=m;renderTab();}
function setRange(r){perfRange=r;renderTab();}

function saveNote(){
  var date=document.getElementById('nd').value;
  var rating=document.getElementById('nr').value;
  var focus=document.getElementById('nf').value.trim();
  var text=document.getElementById('nt').value.trim();
  if(!text)return;
  var criteria={};
  ratingCriteria.forEach(function(rc){var el=document.getElementById('rc-'+rc.id);if(el&&el.value)criteria[rc.id]=parseInt(el.value);});
  if(!protocols[selectedEmp])protocols[selectedEmp]=[];
  protocols[selectedEmp].unshift({id:Date.now(),date:date,rating:rating,note:text,focus:focus,criteria:criteria});
  renderSidebar();renderTab();
}

function savePerf(){
  var date=document.getElementById('pd').value;
  var crOEM=parseInt(document.getElementById('po').value)||0;
  var crTeilweise=parseInt(document.getElementById('pt').value)||0;
  var crYes=parseInt(document.getElementById('pyes').value)||0;
  var crSuperYes=parseInt(document.getElementById('psy').value)||0;
  var crMegaYes=parseInt(document.getElementById('pmy').value)||0;
  var optPerH=parseFloat(document.getElementById('pop').value)||0;
  var note=document.getElementById('pn').value.trim();
  var calls=20;
  var margin=Math.round(calls*(crOEM/100)*13);
  if(!performance[selectedEmp])performance[selectedEmp]=[];
  performance[selectedEmp].unshift({id:Date.now(),date:date,calls:calls,crOEM:crOEM,crTeilweise:crTeilweise,crYes:crYes,crSuperYes:crSuperYes,crMegaYes:crMegaYes,optPerH:optPerH,margin:margin,note:note});
  renderTab();
}

function saveSRSim(){
  var name=document.getElementById('srName').value.trim();
  var date=document.getElementById('srDate').value;
  var score=parseInt(document.getElementById('srScore').value)||0;
  var tags=(document.getElementById('srTags').value||'').split(',').map(function(t){return t.trim();}).filter(Boolean);
  if(!name||!score)return;
  if(!solidroadData[selectedEmp])solidroadData[selectedEmp]={simulations:[]};
  solidroadData[selectedEmp].simulations.unshift({id:Date.now(),date:date,name:name,score:score,status:'passed',tags:tags});
  renderTab();
}

function toggleOB(i){
  if(!onboarding[selectedEmp])onboarding[selectedEmp]=obSteps.map(function(){return false;});
  onboarding[selectedEmp][i]=!onboarding[selectedEmp][i];
  renderTab();
}
function toggleOBDetail(i){
  var d=document.getElementById('ob-d-'+i);
  var ch=document.getElementById('chev-'+i);
  if(!d)return;
  var open=d.classList.toggle('open');
  if(ch)ch.classList.toggle('open',open);
}
function saveVideoUrl(i){
  var url=document.getElementById('vid-'+i).value.trim();
  obSteps[i].videoUrl=url;
  renderTab();
}
function saveOBStep(){
  var label=document.getElementById('obLabelInput').value.trim();
  var day=parseInt(document.getElementById('obDayInput').value)||1;
  var video=document.getElementById('obVideoInput').value.trim();
  var detail=document.getElementById('obDetailInput').value.trim();
  if(!label)return;
  obSteps.push({label:label,day:day,detail:detail||'No description.',videoUrl:video});
  employees.forEach(function(e){if(!onboarding[e.id])onboarding[e.id]=[];onboarding[e.id].push(false);});
  closeModal('obModal');
  renderTab();
}
function saveRatingCriterion(){
  var name=document.getElementById('rcName').value.trim();
  var cat=document.getElementById('rcCat').value;
  var target=parseInt(document.getElementById('rcTarget').value)||80;
  var desc=document.getElementById('rcDesc').value.trim();
  if(!name)return;
  ratingCriteria.push({id:Date.now(),name:name,cat:cat,target:target,desc:desc});
  closeModal('ratingModal');
  renderTab();
}
function toggleTask(id){
  var t=(tasks[selectedEmp]||[]).find(function(x){return x.id===id;});
  if(t){t.done=!t.done;renderTab();}
}
function toggleTaskDetail(id){
  var el=document.getElementById('td-'+id);
  if(el)el.classList.toggle('open');
}
function deleteTask(id){
  if(!confirm('Delete this task?'))return;
  tasks[selectedEmp]=(tasks[selectedEmp]||[]).filter(function(x){return x.id!==id;});
  renderTab();
}
function saveNewTask(){
  var text=document.getElementById('taskText').value.trim();
  var desc=document.getElementById('taskDesc').value.trim();
  var prio=document.getElementById('taskPrio').value;
  var due=document.getElementById('taskDue').value;
  var source=document.getElementById('taskSource').value.trim();
  if(!text)return;
  if(!tasks[selectedEmp])tasks[selectedEmp]=[];
  tasks[selectedEmp].unshift({id:Date.now(),text:text,description:desc,done:false,priority:prio,dueDate:due,source:source});
  document.getElementById('taskText').value='';
  document.getElementById('taskDesc').value='';
  document.getElementById('taskDue').value='';
  document.getElementById('taskSource').value='';
  closeModal('addTaskModal');
  renderTab();
}
function addTaskFromCurrentProtocol(){
  var focus=document.getElementById('nf');
  var date=document.getElementById('nd');
  var text=(focus&&focus.value.trim())?focus.value.trim():'Follow-up from session';
  var src='Session '+(date?fd(date.value):'');
  if(!tasks[selectedEmp])tasks[selectedEmp]=[];
  tasks[selectedEmp].unshift({id:Date.now(),text:text,description:'',done:false,priority:'medium',dueDate:'',source:src});
  alert('Task added. Switch to the Tasks tab to view it.');
}
function saveNewEmp(){
  var name=document.getElementById('newName').value.trim();
  var role=document.getElementById('newRole').value.trim();
  var phase=document.getElementById('newPhase').value;
  var startDate=document.getElementById('newStart').value;
  if(!name)return;
  var ne={id:Date.now(),name:name,role:role||'Sales',phase:phase,color:employees.length%COLORS.length,startDate:startDate};
  employees.push(ne);
  protocols[ne.id]=[];performance[ne.id]=[];solidroadData[ne.id]={simulations:[]};
  onboarding[ne.id]=obSteps.map(function(){return false;});
  tasks[ne.id]=[];
  closeModal('addEmpModal');
  renderSidebar();renderMain();
}
function saveFTP(){settings.ftpUrl=document.getElementById('ftpInput').value.trim();alert('FTP URL saved.');}
function saveTargets(){
  KPI_TARGETS.crOEM=parseFloat(document.getElementById('tOEM').value)||55;
  KPI_TARGETS.crSuperYes=parseFloat(document.getElementById('tSY').value)||12;
  KPI_TARGETS.crMegaYes=parseFloat(document.getElementById('tMY').value)||8;
  KPI_TARGETS.optPerH=parseFloat(document.getElementById('tOpt').value)||2;
  renderSettings();
}
function saveSRKey(){
  var key=document.getElementById('srKeyInput').value.trim();
  var org=document.getElementById('srOrgInput').value.trim();
  if(!key)return;
  settings.srApiKey=key;settings.srOrgId=org;
  closeModal('srModal');renderSettings();
}
function openModal(id){document.getElementById(id).classList.remove('hidden');}
function closeModal(id){document.getElementById(id).classList.add('hidden');}
document.querySelectorAll('.modal-ov').forEach(function(m){
  m.addEventListener('click',function(e){if(e.target===m)m.classList.add('hidden');});
});
renderSidebar();showView('team');