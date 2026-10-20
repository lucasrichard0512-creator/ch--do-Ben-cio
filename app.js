'use strict';

const CONFIG = window.BENICIO_CONFIG || {};
const DATABASE_READY = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_PUBLISHABLE_KEY);
const DEMO_KEY = 'cha-benicio-presentes-demo-v4';
const DEMO_RSVP_KEY = 'cha-benicio-presencas-demo-v4';

const SEED_GIFTS = [
  { id:'fraldas-rn', category:'higiene', name:'Fraldas RN', qty:2, emoji:'🍼', description:'Pequenininhas, como os primeiros dias do nosso bebê.' },
  { id:'fraldas-p', category:'higiene', name:'Fraldas P', qty:8, emoji:'🧷', description:'Para os dias cheios de descobertas (e trocas).' },
  { id:'fraldas-m', category:'higiene', name:'Fraldas M', qty:14, emoji:'🧷', description:'A fase em que o pequeno já é um profissional em sujar fraldas.' },
  { id:'fraldas-g', category:'higiene', name:'Fraldas G', qty:10, emoji:'🧷', description:'Porque o Benício não vai ficar pequenininho pra sempre.' },
  { id:'fraldas-xg', category:'higiene', name:'Fraldas XG', qty:5, emoji:'🧷', description:'Estoque estratégico. O papai agradece!' },
  { id:'lencos', category:'higiene', name:'Lenços umedecidos', qty:15, emoji:'🫧', description:'Aqueles aliados que os pais vão usar todos os dias.' },
  { id:'pomada', category:'higiene', name:'Pomada para assaduras', qty:5, emoji:'🧴', description:'Cuidado e carinho para a pele do Benício.' },
  { id:'sabonete', category:'higiene', name:'Sabonete líquido infantil', qty:5, emoji:'🛁', description:'Banho cheiroso é sempre uma boa ideia.' },
  { id:'shampoo', category:'higiene', name:'Shampoo infantil', qty:3, emoji:'🫧', description:'Para os banhos mais fofos da casa.' },
  { id:'bodies', category:'enxoval', name:'Kit de bodies', qty:4, emoji:'👕', description:'Peças confortáveis para muitos abraços.' },
  { id:'macacao', category:'enxoval', name:'Macacão de bebê', qty:4, emoji:'👶', description:'Para desfilar fofura pela casa inteira.' },
  { id:'manta', category:'enxoval', name:'Manta para bebê', qty:3, emoji:'🧶', description:'Um abraço quentinho em forma de manta.' },
  { id:'toalha', category:'enxoval', name:'Toalha com capuz', qty:3, emoji:'🛀', description:'Para sair do banho parecendo um mini ursinho.' },
  { id:'paninhos', category:'enxoval', name:'Kit de paninhos de boca', qty:6, emoji:'🧺', description:'É incrível quantos paninhos um bebê consegue usar.' },
  { id:'lencol', category:'enxoval', name:'Jogo de lençol para berço', qty:3, emoji:'🛏️', description:'Noites confortáveis para o pequeno sonhador.' },
  { id:'babadores', category:'enxoval', name:'Kit de babadores', qty:3, emoji:'🍽️', description:'Para quando a aventura também for na hora de comer.' },
  { id:'mamadeira', category:'acessorios', name:'Mamadeira', qty:2, emoji:'🍼', description:'Um item útil para a rotina do bebê.' },
  { id:'escova-pente', category:'acessorios', name:'Kit escova e pente', qty:1, emoji:'🪮', description:'Para aquele cabelo mais arrumado que o do papai.' },
  { id:'banheira', category:'acessorios', name:'Banheira', qty:1, emoji:'🛁', description:'Para banhos tranquilos e muitas bolhinhas.' },
  { id:'trocador', category:'acessorios', name:'Trocador', qty:1, emoji:'🧺', description:'Praticidade na missão troca de fraldas.' },
  { id:'berco', category:'especiais', name:'Berço', qty:1, emoji:'🛏️', description:'Para o príncipe dormir tranquilo e deixar os súditos descansarem.' },
  { id:'carrinho', category:'especiais', name:'Carrinho de bebê', qty:1, emoji:'🚼', description:'Para passear por aí com o nosso pequeno.' },
  { id:'bebe-conforto', category:'especiais', name:'Bebê conforto', qty:1, emoji:'🚗', description:'Para passeios de carro com proteção e cuidado.' },
  { id:'comoda', category:'especiais', name:'Cômoda para bebê', qty:1, emoji:'🗄️', description:'Para organizar o enxoval do pequeno com carinho.' },
  { id:'ps5-pro', category:'especiais', name:'PlayStation 5 Pro', qty:1, emoji:'🎮', description:'Item essencial para o desenvolvimento da coordenação motora do papai.', isJoke:true }
];

const state = { gifts:SEED_GIFTS.map(g => ({...g, reserved:0})), selectedId:null, online:!DATABASE_READY, busy:false };
const $ = selector => document.querySelector(selector);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const escapeHtml = str => String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function readDemo(key, fallback){try{return JSON.parse(localStorage.getItem(key)) || fallback;}catch{return fallback;}}
function writeDemo(key, value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}

function toast(message){
  const node = $('#toast'); node.textContent = message; node.classList.add('visible');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => node.classList.remove('visible'), 3700);
}
function setFeedback(element, message, isError=false){element.textContent=message;element.classList.toggle('is-error',isError);}

async function supabaseRequest(path, method='GET', payload){
  const url = CONFIG.SUPABASE_URL.replace(/\/$/,'') + '/rest/v1/' + path;
  const headers = { apikey: CONFIG.SUPABASE_PUBLISHABLE_KEY, 'Content-Type':'application/json' };
  // JWT anon (legada) aceita Authorization; chaves publishable usam apenas apikey.
  if(CONFIG.SUPABASE_PUBLISHABLE_KEY.startsWith('eyJ')) headers.Authorization = 'Bearer ' + CONFIG.SUPABASE_PUBLISHABLE_KEY;
  let response;
  try{response=await fetch(url,{method,headers,body:payload===undefined?undefined:JSON.stringify(payload)});}
  catch{throw new Error('Não foi possível conectar. Confira sua internet e tente novamente.');}
  const result=await response.json().catch(()=>null);
  if(!response.ok){
    const raw=result?.message || result?.error || 'Não foi possível concluir agora.';
    if(String(raw).includes('PRESENTE_ESGOTADO'))throw new Error('Este presente acabou de ser reservado por outra pessoa. Escolha outro, por favor.');
    if(String(raw).includes('DADOS_INVALIDOS'))throw new Error('Revise os dados informados e tente novamente.');
    if(String(raw).includes('PRESENTE_INEXISTENTE'))throw new Error('Presente não encontrado. Atualize a página.');
    throw new Error('Não conseguimos concluir. Tente novamente em instantes.');
  }
  return result;
}
function applyDemoQuantities(){
  const demo=readDemo(DEMO_KEY,{});
  state.gifts=SEED_GIFTS.map(g=>({...g,reserved:clamp(Number(demo[g.id])||0,0,g.qty)}));
  state.online=true;
  $('#demoNotice').classList.remove('hidden');
  $('#connectionNotice').classList.add('hidden');
}
async function refreshGifts(){
  if(!DATABASE_READY){applyDemoQuantities();renderGifts();return;}
  try{
    const items=await supabaseRequest('gifts?select=id,total_qty,reserved_qty&order=sort_order.asc');
    if(!Array.isArray(items)||items.length!==SEED_GIFTS.length) throw new Error('Catálogo incompleto');
    const indexed = new Map(items.map(x=>[x.id,x]));
    state.gifts=SEED_GIFTS.map(g=>{
      const db=indexed.get(g.id);
      if(!db)throw new Error('Presente faltando no banco');
      return {...g,qty:Number(db.total_qty),reserved:Number(db.reserved_qty)};
    });
    state.online=true;
    $('#connectionNotice').classList.add('hidden');
  }catch{
    state.online=false;
    $('#connectionNotice').textContent='Não foi possível atualizar a lista agora. Para evitar reservas duplicadas, os botões foram temporariamente desativados. Tente atualizar a página.';
    $('#connectionNotice').classList.remove('hidden');
  }
  renderGifts();
}
const GIFT_PHOTOS = { 'bodies':'roupinhas.webp', 'berco':'fraldinhas.webp', 'ps5-pro':'videogame.webp', 'manta':'roupinhas.webp' };
function renderGifts(){
  // Todos os presentes visíveis, sem filtros e sem categorias que exigem cliques.
  const available=state.gifts.filter(g=>g.reserved<g.qty).length;
  $('#giftCount').textContent=`${state.gifts.length} sugestões · ${available} disponíveis`;
  $('#giftGrid').innerHTML=state.gifts.map(g=>{
    const left=Math.max(0,g.qty-g.reserved),full=left===0;
    const photo=GIFT_PHOTOS[g.id];
    const visual=photo?`<img src="assets/${photo}" alt="" loading="lazy">`:`<span class="gift-initial" aria-hidden="true">${escapeHtml(g.emoji)}</span>`;
    return `<article class="gift-card ${full?'is-full':''} ${g.isJoke?'gift-joke':''}">
      <div class="gift-visual">${visual}</div>
      <div class="gift-body">
        ${g.isJoke?'<span class="gift-meta">Recomendação do papai 🎮</span>':''}
        <h3>${escapeHtml(g.name)}</h3>
        ${g.isJoke?`<p class="gift-description">${escapeHtml(g.description)}</p>`:''}
        <div class="gift-stock">${full?'Já escolhido 💙':`<strong>${left}</strong> ${left===1?'disponível':'disponíveis'}`}</div>
        <button type="button" class="reserve-btn" data-gift-id="${escapeHtml(g.id)}" ${full||!state.online?'disabled':''}>${full?'Já reservado':'Quero presentear'}</button>
      </div>
    </article>`;
  }).join('');
}
function showGiftModal(id){
  const g=state.gifts.find(x=>x.id===id);
  if(!g||g.reserved>=g.qty||!state.online)return;
  state.selectedId=id;
  $('#giftModalIcon').textContent='♡';
  $('#giftModalTitle').textContent=g.name;
  $('#giftModalDescription').textContent=g.description;
  const quantity=$('#giftQuantity');quantity.replaceChildren();
  for(let i=1;i<=g.qty-g.reserved;i++){
    const option=document.createElement('option');option.value=String(i);option.textContent=`${i} ${i===1?'unidade':'unidades'}`;quantity.append(option);
  }
  $('#giftGuestName').value=$('#rsvpName').value.trim() || readDemo('cha-benicio-nome-v4','');
  $('#giftQuantityGroup').classList.toggle('hidden',g.qty-g.reserved===1);
  setFeedback($('#giftFeedback'),'');
  $('#giftModal').showModal();
  $('#giftGuestName').focus();
}
async function reserveGift(evt){
  evt.preventDefault();
  if(state.busy)return;
  const name=$('#giftGuestName').value.trim().replace(/\s+/g,' ');
  const quantity=Number($('#giftQuantity').value);
  const gift=state.gifts.find(g=>g.id===state.selectedId);
  if(!gift || name.length<2 || name.length>80 || !Number.isInteger(quantity)||quantity<1){setFeedback($('#giftFeedback'),'Informe seu nome e uma quantidade válida.',true);return;}
  writeDemo('cha-benicio-nome-v4',name);
  state.busy=true;const button=$('#giftSubmit');button.disabled=true;button.textContent='Reservando…';
  try{
    if(DATABASE_READY){
      await supabaseRequest('rpc/reserve_gift','POST',{p_gift_id:gift.id,p_guest_name:name,p_quantity:quantity});
      await refreshGifts();
    }else{
      const demo=readDemo(DEMO_KEY,{});
      const already=clamp(Number(demo[gift.id])||0,0,gift.qty);
      if(already+quantity>gift.qty)throw new Error('Este presente não tem mais essa quantidade disponível.');
      demo[gift.id]=already+quantity;writeDemo(DEMO_KEY,demo);applyDemoQuantities();renderGifts();
    }
    $('#giftModal').close();
    toast(`💙 ${quantity} ${quantity===1?'presente reservado':'presentes reservados'}! Obrigado, ${name.split(' ')[0]}!`);
  }catch(err){setFeedback($('#giftFeedback'),err.message||'Não foi possível reservar.',true);await refreshGifts();}
  finally{state.busy=false;button.disabled=false;button.textContent='Confirmar presente 💙';}
}
async function submitRsvp(evt){
  evt.preventDefault(); const form=$('#rsvpForm');if(!form.reportValidity())return;
  const name=$('#rsvpName').value.trim().replace(/\s+/g,' '), attending=$('input[name=attendance]:checked').value==='yes';
  const count=attending?Number($('#rsvpGuests').value):0,message=$('#rsvpMessage').value.trim();
  const feedback=$('#rsvpFeedback');
  if(name.length<2||name.length>80||message.length>300||(attending&&(!Number.isInteger(count)||count<1||count>15))){setFeedback(feedback,'Confira seus dados antes de enviar.',true);return;}
  writeDemo('cha-benicio-nome-v4',name);
  const button=$('#rsvpSubmit');button.disabled=true;button.textContent='Enviando…';
  try{
    if(DATABASE_READY){
      await supabaseRequest('rpc/confirm_rsvp','POST',{p_guest_name:name,p_attending:attending,p_guests_count:count,p_message:message});
    }else{
      const entries=readDemo(DEMO_RSVP_KEY,[]);entries.push({name,attending,count,message,at:new Date().toISOString()});writeDemo(DEMO_RSVP_KEY,entries);
    }
    const reply = DATABASE_READY
      ? (attending ? 'Presença confirmada! Estamos felizes que você venha! 💙' : 'Recadinho recebido! Sentiremos sua falta. 💙')
      : 'Demonstração: sua resposta foi salva somente neste navegador. A confirmação real será ativada quando o banco de dados estiver configurado.';
    setFeedback(feedback, reply);
    toast(DATABASE_READY ? 'Confirmação recebida com carinho 💙' : 'Resposta de demonstração salva neste navegador');
    form.reset();updateAttendance();
  }catch(err){setFeedback(feedback,err.message||'Não foi possível enviar.',true);}
  finally{button.disabled=false;button.textContent='Enviar confirmação ♥';}
}
function updateAttendance(){
  const coming=$('input[name=attendance]:checked').value==='yes';
  $('#guestCountGroup').classList.toggle('hidden',!coming);
  $('#rsvpGuests').disabled=!coming;
  $('#rsvpGuests').required=coming;
}
function fillEventInfo(){
  const time=String(CONFIG.EVENT_TIME||'').trim(),address=String(CONFIG.EVENT_ADDRESS||'').trim();
  if(time){$('#eventTime').textContent=time;$('#eventTime').classList.remove('field-blank');}
  if(address){$('#eventAddress').textContent=address;$('#eventAddress').classList.remove('field-blank');}
  const url=String(CONFIG.MAPS_URL||'').trim();
  if(url && /^https:\/\//i.test(url)){$('#mapsLink').href=url;$('#mapsLink').classList.remove('hidden');}
  // Contagem por dias de calendário em Brasília, sem antecipar o "É HOJE".
  const [y,m,d] = String(CONFIG.EVENT_DATE || '2026-11-28').split('-').map(Number);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Sao_Paulo', year: 'numeric', month: 'numeric', day: 'numeric'
  }).formatToParts(new Date());
  const local = Object.fromEntries(parts.map(part => [part.type, Number(part.value)]));
  const days = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(local.year, local.month - 1, local.day)) / 86400000);
  $('#countdownValue').textContent=days>0?days:days===0?'É HOJE!':'💙';
  $('#countdownLabel').textContent=days>0?(days===1?'dia para celebrar nosso pequeno 💙':'dias para celebrar nosso pequeno 💙'):days===0?'O grande dia chegou!':'Um dia inesquecível para nossa família.';
  const whatsapp=String(CONFIG.WHATSAPP_NUMBER||'').replace(/\D/g,'');
  if(whatsapp.length>=12 && whatsapp.length<=15){
    const message='Olá! Vi o convite do Chá do Benício e gostaria de fazer um convite interativo assim!';
    $('#contactLink').href=`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    $('#contactLink').target='_blank';$('#contactLink').rel='noopener noreferrer';
  }else{
    $('#contactLink').addEventListener('click',e=>{e.preventDefault();toast('O contato do papai será adicionado em breve 💙');});
  }
}
function initReveal(){
  if(!('IntersectionObserver' in window)){document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in-view'));return;}
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -18px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
function start(){
  fillEventInfo();initReveal();refreshGifts();
  $('#rsvpName').value=readDemo('cha-benicio-nome-v4','');
  $('#giftGrid').addEventListener('click',evt=>{
    const trigger=evt.target.closest('[data-gift-id]');if(trigger)showGiftModal(trigger.dataset.giftId);
  });
  $('#closeGiftModal').addEventListener('click',()=>$('#giftModal').close());
  $('#giftModal').addEventListener('click',evt=>{if(evt.target===$('#giftModal'))$('#giftModal').close();});
  $('#giftForm').addEventListener('submit',reserveGift);
  $('#rsvpForm').addEventListener('submit',submitRsvp);
  document.querySelectorAll('input[name=attendance]').forEach(r=>r.addEventListener('change',updateAttendance));
  updateAttendance();
  if(DATABASE_READY)setInterval(()=>{if(!document.hidden && !state.busy)refreshGifts();},20000);
  window.addEventListener('storage',evt=>{if(!DATABASE_READY&&evt.key===DEMO_KEY){applyDemoQuantities();renderGifts();}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
