/* Painel privado: nenhuma chave secreta é enviada ao navegador. */
'use strict';
const sel=id=>document.getElementById(id);
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateBrazil=value=>value?new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
const phonePretty=value=>value?`+${value}`:'—';
const cell=(label,content)=>`<td data-label="${escapeHTML(label)}">${content}</td>`;
let session=null;
let dataset={rsvps:[],reservations:[],notifications:[],gifts:[]};
function setSession(auth){session={...auth,expires_at:Date.now()+Math.max(300,Number(auth.expires_in)||3600)*1000};sessionStorage.setItem('benicio_admin_session',JSON.stringify(session));}
function logout(){session=null;sessionStorage.removeItem('benicio_admin_session');sel('loginView').hidden=false;sel('dashboard').hidden=true;sel('logout').hidden=true;sel('loginPassword').value='';}
async function api(path,options={}){
 const result=await fetch(path,{cache:'no-store',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
 const data=await result.json().catch(()=>({}));
 if(!result.ok)throw Error(data.error||'Não foi possível concluir.');
 return data;
}
async function refreshAuth(){
 if(!session?.refresh_token)throw Error('Faça login novamente.');
 const next=await api('/api/admin-refresh',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})});
 setSession(next);
}
async function fetchRecords(){
 if(!session)return;
 sel('status').textContent='Atualizando dados...';
 try{
   if(session.expires_at < Date.now()+90000)await refreshAuth();
   const records=await api('/api/admin-data',{headers:{Authorization:'Bearer '+session.access_token}});
   dataset=records;render();sel('status').textContent='Informações atualizadas em '+new Date().toLocaleTimeString('pt-BR')+'.';
 }catch(error){
   if(/autorizado|expirada|login|Sessão/i.test(error.message)){logout();sel('loginError').textContent='Sua sessão terminou. Entre novamente.';}
   else sel('status').textContent='Erro: '+error.message;
 }
}
function drawTable(id,rows,renderRow,columns){
 const body=sel(id);body.innerHTML=rows.length?rows.map(renderRow).join(''):`<tr><td colspan="${columns}" class="mutedRow">Nenhum registro encontrado.</td></tr>`;
}
function render(){
 const search=sel('search').value.trim().toLocaleLowerCase('pt-BR');
 const list=dataset.rsvps||[],bookings=dataset.reservations||[];
 const giftName=Object.fromEntries((dataset.gifts||[]).map(x=>[x.id,x.name]));
 const filter=(txt)=>!search||String(txt).toLocaleLowerCase('pt-BR').includes(search);
 sel('rsvpCount').textContent=String(list.filter(x=>x.attending).length);
 sel('guestCount').textContent=String(list.filter(x=>x.attending).reduce((n,x)=>n+Number(x.guests_count||0),0));
 sel('giftCount').textContent=String(bookings.reduce((n,x)=>n+Number(x.quantity||0),0));
 const shownRsvp=list.filter(x=>filter([x.guest_name,x.guest_phone,x.message].join(' ')));
 const shownGifts=bookings.filter(x=>filter([x.guest_name,giftName[x.gift_id]||x.gift_id].join(' ')));
 drawTable('rsvpRows',shownRsvp,x=>`<tr>${cell('Nome',`<strong>${escapeHTML(x.guest_name)}</strong>`)}${cell('WhatsApp',x.guest_phone?`<a target="_blank" rel="noopener" href="https://wa.me/${encodeURIComponent(x.guest_phone)}">${escapeHTML(phonePretty(x.guest_phone))}</a>`:'Não informado')}${cell('Pessoas',x.guests_count)}${cell('Recado',escapeHTML(x.message||'—'))}${cell('Atualizado em',dateBrazil(x.updated_at||x.created_at))}</tr>`,5);
 drawTable('giftRows',shownGifts,x=>`<tr>${cell('Presente',escapeHTML(giftName[x.gift_id]||x.gift_id))}${cell('Convidado',`<strong>${escapeHTML(x.guest_name)}</strong>`)}${cell('Quantidade',Number(x.quantity))}${cell('Registrado em',dateBrazil(x.created_at))}</tr>`,4);
 drawTable('notificationRows',(dataset.notifications||[]).filter(x=>filter(x.event_type+' '+x.detail)),x=>`<tr>${cell('Tipo',x.event_type==='gift'?'Presente':'Presença')}${cell('Status',`<span class="tag ${x.status==='accepted'?'':'bad'}">${escapeHTML(x.status)}</span>`)}${cell('Detalhe',escapeHTML(x.detail))}${cell('Data',dateBrazil(x.created_at))}</tr>`,4);
}
function csvFile(name,headers,rows){
 const field=x=>{let s=String(x??'').replace(/\r|\n/g,' ');if(/^[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
 const csv='\uFEFF'+[headers,...rows].map(row=>row.map(field).join(';')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
sel('loginForm').addEventListener('submit',async e=>{
 e.preventDefault();sel('loginError').textContent='';sel('loginButton').disabled=true;
 try{
   const auth=await api('/api/admin-login',{method:'POST',body:JSON.stringify({email:sel('loginEmail').value,password:sel('loginPassword').value})});
   setSession(auth);sel('loginView').hidden=true;sel('dashboard').hidden=false;sel('logout').hidden=false;sel('loginPassword').value='';await fetchRecords();
 }catch(e){sel('loginError').textContent=e.message;}finally{sel('loginButton').disabled=false;}
});
sel('logout').addEventListener('click',logout);
sel('refresh').addEventListener('click',fetchRecords);
sel('search').addEventListener('input',render);
sel('exportRsvp').addEventListener('click',()=>csvFile('benicio-presencas.csv',['Nome','WhatsApp','Pessoas','Recado','Atualizado em'],dataset.rsvps.map(x=>[x.guest_name,x.guest_phone,x.guests_count,x.message,dateBrazil(x.updated_at||x.created_at)])));
sel('exportGifts').addEventListener('click',()=>{const names=Object.fromEntries(dataset.gifts.map(x=>[x.id,x.name]));csvFile('benicio-presentes.csv',['Presente','Convidado','Quantidade','Reservado em'],dataset.reservations.map(x=>[names[x.gift_id]||x.gift_id,x.guest_name,x.quantity,dateBrazil(x.created_at)]));});
try{session=JSON.parse(sessionStorage.getItem('benicio_admin_session')||'null');}catch{session=null;}
if(session?.access_token){sel('loginView').hidden=true;sel('dashboard').hidden=false;sel('logout').hidden=false;fetchRecords();}
