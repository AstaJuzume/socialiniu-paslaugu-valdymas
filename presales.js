'use strict';
// Presales copy. All records are demonstration data saved in this browser.
const timesheetCodes={AT:'Atostogos',L:'Liga',N:'Kitas neatvykimas',KA:'KA',NA:'NA'};
function assignedWorkers(c,serviceId){
 const ids=new Set(c.assignments?.find(a=>a.serviceId===serviceId)?.employeeIds||[]);
 for(const t of c.schedule||[])if(t.serviceId===serviceId)ids.add(t.employeeId);
 return db.employees.filter(em=>ids.has(em.id)&&em.active&&em.branchId===c.branchId&&allowedEmployee(em.id));
}
function migratePresales(){
 if(db.presalesVersion===1)return;
 db.timesheetMarks=[];
 db.clients.forEach((c,i)=>{
  if(c.branchId==='siauliai')c.address=['Vilniaus g. 18–4, Šiauliai','Tilžės g. 72–8, Šiauliai','Dainų g. 9–21, Šiauliai','Aido g. 28–5, Šiauliai'][i%4];
  c.assignments.forEach((a,j)=>{
   const existing=(c.schedule||[]).filter(t=>t.serviceId===a.serviceId).map(t=>t.employeeId);
   const pool=db.employees.filter(em=>em.active&&em.branchId===c.branchId);
   a.employeeIds=[...new Set([...existing,pool[(i+j)%pool.length]?.id,pool[(i+j+1)%pool.length]?.id].filter(Boolean))];
  });
 });
 // Keep demonstration history consistent with the client's branch.
 for(const v of db.visits){const c=client(v.clientId);if(emp(v.employeeId).branchId!==c.branchId){const pool=db.employees.filter(em=>em.branchId===c.branchId);v.employeeId=pool[Number(v.employeeId.slice(1))%pool.length].id}}
 db.presalesVersion=1;persist();
}
migratePresales();
function syncVisitAssignments(clientChanged=false){
 const f=$('#visit-form');if(!f)return;
 const c=client($('[name="clientId"]',f).value),svc=$('[name="serviceId"]',f),worker=$('[name="employeeId"]',f);
 const previousService=svc.value,previousWorker=worker.value;
 const services=db.services.filter(s=>c.services.includes(s.id));
 const serviceId=services.some(s=>s.id===previousService)&&!clientChanged?previousService:services[0]?.id||'';
 svc.innerHTML=options(services,serviceId,'Pasirinkite paslaugą');
 const employees=assignedWorkers(c,serviceId);
 const employeeId=!clientChanged&&employees.some(em=>em.id===previousWorker)?previousWorker:employees[0]?.id||'';
 worker.innerHTML=options(employees,employeeId,employees.length?'Pasirinkite darbuotoją':'Klientui nėra priskirtų darbuotojų');
 let hint=$('#assignment-info');if(hint)hint.textContent=!c.id?'Pasirinkite klientą. Jo paslauga ir priskirti darbuotojai bus parinkti automatiškai.':employees.length?`Klientui priskirta: ${service(serviceId).name}. Darbuotojai: ${employees.map(em=>em.name).join(', ')}.`:'Kliento kortelėje prie paslaugos priskirkite darbuotoją.';
 updateLoadPreview();
}
visitForm=function(id,prefill={}){
 scopeData(()=>legacy.visitForm(id,prefill));
 const f=$('#visit-form');if(!f)return;
 for(const n of ['clientId','serviceId','employeeId'])$(`[name="${n}"]`,f).required=true;
 $('.form-grid',f).insertAdjacentHTML('afterend','<div id="assignment-info" class="notice info" style="margin-top:16px"></div>');
 const v=id?db.visits.find(v=>v.id===id):null;
 syncVisitAssignments(false);
 // An existing replacement remains selectable while editing the same visit.
 if(v&&v.employeeId&&!assignedWorkers(client(v.clientId),v.serviceId).some(em=>em.id===v.employeeId)){
  const w=$('[name="employeeId"]',f);w.insertAdjacentHTML('beforeend',`<option value="${e(v.employeeId)}">${e(emp(v.employeeId).name)} · esamas priskyrimas</option>`);w.value=v.employeeId;
 }
};
const presalesValidateVisit=validateVisit;
validateVisit=function(d,exclude=null,batch=[]){
 const c=client(d.clientId),previous=db.visits.find(v=>v.id===exclude);
 if(!c.services.includes(d.serviceId))return 'Pasirinkite klientui priskirtą paslaugą.';
 const existing=previous&&previous.clientId===d.clientId&&previous.serviceId===d.serviceId&&previous.employeeId===d.employeeId;
 const template=(c.schedule||[]).some(t=>t.serviceId===d.serviceId&&t.employeeId===d.employeeId);
 if(!existing&&!template&&!assignedWorkers(c,d.serviceId).some(em=>em.id===d.employeeId))return 'Pasirinkite šiai kliento paslaugai priskirtą darbuotoją.';
 return presalesValidateVisit(d,exclude,batch);
};
function assignmentPicker(c,serviceId,branchId){
 const chosen=new Set(c.assignments?.find(a=>a.serviceId===serviceId)?.employeeIds||[]);
 for(const t of c.schedule||[])if(t.serviceId===serviceId)chosen.add(t.employeeId);
 return `<details class="worker-picker"><summary>Priskirti darbuotojai (${chosen.size})</summary><div class="worker-options">${db.employees.filter(em=>em.active&&em.branchId===branchId).map(em=>`<label class="check-label"><input type="checkbox" name="assigned-${serviceId}" value="${em.id}" ${chosen.has(em.id)?'checked':''}>${e(em.name)}</label>`).join('')||'<p class="hint">Padalinyje nėra aktyvių darbuotojų.</p>'}</div></details>`;
}
const presalesClientForm=clientForm;
clientForm=function(id){presalesClientForm(id);const c=id?client(id):{assignments:[],schedule:[]};const branch=$('[name="branchId"]',$('#client-v2')).value;for(const row of $$('.assignment-row'))row.insertAdjacentHTML('beforeend',assignmentPicker(c,row.dataset.service,branch))};
const presalesClientDetail=clientDetail;
clientDetail=function(id){presalesClientDetail(id);if(!allowedClient(id)||!$('.modal-body'))return;const c=client(id);$('.modal-body').insertAdjacentHTML('beforeend',`<div class="section-title">Klientui priskirti darbuotojai</div>${table(['Paslauga','Darbuotojai'],c.services.map(s=>[e(service(s).name),assignedWorkers(c,s).map(em=>e(em.name)).join('<br>')||'Darbuotojai nepriskirti']))}`)};
const presalesTimesheetDay=timesheetDayDetail;
timesheetDayDetail=function(id,date){
 if(!isAdmin()||!allowedEmployee(id))return;
 presalesTimesheetDay(id,date);
 const m=db.timesheetMarks.find(m=>m.employeeId===id&&m.date===date);
 $('.modal-body').insertAdjacentHTML('afterbegin',`<section class="timesheet-editor"><h3>Dienos žymėjimas</h3><div class="form-grid">${field('Žymėjimas',`<select name="timesheetCode" aria-label="Dienos žymėjimas"><option value="">Be žymėjimo</option>${Object.entries(timesheetCodes).map(([code,name])=>`<option value="${code}" ${m?.code===code?'selected':''}>${code}${name!==code?' – '+name:''}</option>`).join('')}</select>`)}${field('Komentaras',input('markComment',m?.comment||'','text','id="mark-comment" maxlength="500"'))}</div><p class="hint">Žymėjimas taikomas šiai darbuotojo dienai. Vizitų faktinis laikas išlieka pagal užregistruotus vizitus.</p></section>`);
 $('.modal-actions').insertAdjacentHTML('beforeend',btn('Išsaugoti žymėjimą','save-timesheet-mark','primary'));
};
const presalesAction=action;
action=async function(a,b={dataset:{}}){
 if(a==='slot-visit'){
  if(!isAdmin())return;
  const date=b.dataset.date,start=b.dataset.time;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:00$/.test(start))return;
  const hour=Number(start.slice(0,2));
  visitForm(null,{date,start,end:hour===23?'23:59':String(hour+1).padStart(2,'0')+':00',clientId:ui.client});return;
 }
 if(a==='save-timesheet-mark'){
  if(!isAdmin()||modalState?.type!=='timesheet-day'||!allowedEmployee(modalState.id))return;
  const {id,date}=modalState,code=$('[name="timesheetCode"]').value,comment=$('[name="markComment"]').value.trim();
  if(code&&!Object.hasOwn(timesheetCodes,code))return;
  const before=db.timesheetMarks;
  db.timesheetMarks=before.filter(m=>m.employeeId!==id||m.date!==date);
  if(code)db.timesheetMarks.push({employeeId:id,date,from:date,to:date,code,type:timesheetCodes[code],comment,by:ui.role,updatedAt:new Date().toISOString()});
  if(!persist()){db.timesheetMarks=before;return;}
  closeModal();render();toast(code?`Išsaugotas ${code} žymėjimas`:'Žymėjimas pašalintas');return;
 }
 return presalesAction(a,b);
};
document.addEventListener('change',ev=>{
 const el=ev.target;
 if(el.name==='branchId'&&el.closest('#client-v2')){
  const c={assignments:[],schedule:[]};for(const row of $$('.assignment-row')){row.querySelector('.worker-picker')?.remove();row.insertAdjacentHTML('beforeend',assignmentPicker(c,row.dataset.service,el.value))}
 }
});
const presalesCalendar=calendarPage;
calendarPage=function(){return presalesCalendar().replace('Planuokite vizitus, paskirstykite darbus ir stebėkite komandos užimtumą.','Paspauskite dienos valandą grafike ir sukurkite vizitą. Kliento paslauga ir darbuotojai parenkami automatiškai.')};
// Use one brand for the shared demo, without client-specific names.
const presalesRender=render;
render=function(){presalesRender();const badgeEl=$('.demo-badge');if(badgeEl)badgeEl.textContent='PRESALES DEMO';const brand=$('.brand-sub');if(brand)brand.textContent='Socialinių paslaugų demo'};
render();
