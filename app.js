/* Chá do Benício — interação real, lista única e reservas atômicas quando Supabase for configurado. */
(() => {
'use strict';
const gifts = [
  {id:'fraldas-rn',name:'Fraldas RN',qty:2,model:'diapers',variant:0},
  {id:'fraldas-p',name:'Fraldas P',qty:8,model:'diapers',variant:1},
  {id:'fraldas-m',name:'Fraldas M',qty:14,model:'diapers',variant:2},
  {id:'fraldas-g',name:'Fraldas G',qty:10,model:'diapers',variant:3},
  {id:'fraldas-xg',name:'Fraldas XG',qty:5,model:'diapers',variant:4},
  {id:'lencos',name:'Lenços umedecidos',qty:15,model:'wipes'},
  {id:'pomada',name:'Pomada para assaduras',qty:5,model:'ointment'},
  {id:'sabonete',name:'Sabonete líquido infantil',qty:5,model:'soap'},
  {id:'shampoo',name:'Shampoo infantil',qty:3,model:'shampoo'},
  {id:'bodies',name:'Kit de bodies',qty:4,model:'bodies'},
  {id:'macacao',name:'Macacão para bebê',qty:4,model:'onesie'},
  {id:'manta',name:'Manta para bebê',qty:3,model:'blanket'},
  {id:'toalha',name:'Toalha com capuz',qty:3,model:'towel'},
  {id:'paninhos',name:'Kit de paninhos de boca',qty:6,model:'cloths'},
  {id:'lencol',name:'Jogo de lençol para berço',qty:3,model:'sheets'},
  {id:'babadores',name:'Kit de babadores',qty:3,model:'bib'},
  {id:'mamadeira',name:'Mamadeira',qty:2,model:'bottle'},
  {id:'escova',name:'Kit escova e pente',qty:1,model:'brush'},
  {id:'banheira',name:'Banheira',qty:1,model:'bath'},
  {id:'trocador',name:'Trocador',qty:1,model:'changing'},
  {id:'berco',name:'Berço',qty:1,model:'crib',special:true},
  {id:'carrinho',name:'Carrinho de bebê',qty:1,model:'stroller',special:true},
  {id:'bebe-conforto',name:'Bebê conforto',qty:1,model:'carseat',special:true},
  {id:'comoda',name:'Cômoda para bebê',qty:1,model:'dresser',special:true},
  {id:'ps5',name:'PS5 Pro',qty:1,model:'ps5',special:true,joke:'Item essencial para o equilíbrio emocional do papai. 😂'}
];
const cfg=window.BENICIO_CONFIG||{};
const online=Boolean(cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY);
const key='benicio:v9:reservas';
const memoryFallback={};
function getStored(k){try{return localStorage.getItem(k)??memoryFallback[k]??null}catch{return memoryFallback[k]??null}}
function setStored(k,v){memoryFallback[k]=v;try{localStorage.setItem(k,v)}catch{/* navegador com armazenamento restrito: modo sessão */}}
const list=document.querySelector('#giftGrid');
const status=document.querySelector('#inventoryStatus');
const demo=document.querySelector('#demoNotice');
const modal=document.querySelector('#giftModal');
const form=document.querySelector('#giftForm');
const giftName=document.querySelector('#giftGuest');
const giftQty=document.querySelector('#giftQuantity');
const giftSubmit=document.querySelector('#giftSubmit');
const giftFeedback=document.querySelector('#giftFeedback');
const toast=document.querySelector('#toast');
let active=null;
let inventory={};
const readLocal=()=>{try{return JSON.parse(getStored(key)||'{}')}catch{return {}}};
const writeLocal=(x)=>setStored(key,JSON.stringify(x));
const initInv=()=>{let saved=readLocal();gifts.forEach(g=>{inventory[g.id]={total:g.qty,reserved:online?0:(saved[g.id]||0)}})};
const getAvailable=(g)=>Math.max(0,(inventory[g.id]?.total??g.qty)-(inventory[g.id]?.reserved||0));
const fmt=(n)=>n+' '+(n===1?'disponível':'disponíveis');
function renderCards(){
  list.innerHTML=gifts.map(g=>{const avail=getAvailable(g);return `<article class="gift-card ${g.special?'special':''} ${g.id==='ps5'?'ps5':''}" data-gift="${g.id}">
  <div class="gift-image"><img data-product-render="${g.id}" width="320" height="240" alt="" decoding="async"><span class="fallback-icon" aria-hidden="true" hidden>♥</span></div>
  <div class="gift-card-body"><h3>${g.name}</h3><p class="gift-meta"><strong data-stock="${g.id}">${fmt(avail)}</strong></p>${g.joke?`<p class="gift-joke">${g.joke}</p>`:''}
  <button class="gift-button" type="button" data-select="${g.id}" ${avail===0?'disabled':''}>${avail===0?'Já escolhido':'Reservar presente'}</button></div></article>`}).join('');
  
  list.querySelectorAll('img[data-product-render]').forEach(img=>img.style.opacity='0');
  window.Benicio3D?.buildPreviews(gifts).then(()=>list.querySelectorAll('img[data-product-render]').forEach(img=>img.style.opacity='1'));
}
list.addEventListener('click',e=>{const el=e.target.closest('[data-select]');if(el)openGift(el.dataset.select)});
function updateStock(){for(const g of gifts){const a=getAvailable(g);const card=list.querySelector(`[data-gift="${g.id}"]`);if(!card)continue;card.querySelector('[data-stock]').textContent=fmt(a);let btn=card.querySelector('button[data-select]');btn.disabled=a===0;btn.textContent=a===0?'Já escolhido':'Reservar presente'}}
function openGift(id){const g=gifts.find(x=>x.id===id);if(!g||getAvailable(g)===0)return;active=g;const card=list.querySelector(`[data-gift="${id}"]`);document.querySelector('#giftModalTitle').textContent=g.name;const img=document.querySelector('#giftModalImage');img.src=card.querySelector('.gift-image img').src;img.alt='Modelo 3D de '+g.name;document.querySelector('#giftModalDesc').textContent=g.joke||'Um carinho que ajuda a preparar a chegada do Benício.';document.querySelector('#giftModalRemaining').textContent=fmt(getAvailable(g));fillQuantities(g);giftFeedback.textContent='';form.reset();if(typeof modal.showModal==='function')modal.showModal();else modal.setAttribute('open','');setTimeout(()=>giftName.focus(),40)}
function fillQuantities(g){const a=getAvailable(g);giftQty.innerHTML='';for(let n=1;n<=a;n++){const opt=document.createElement('option');opt.value=String(n);opt.textContent=n===1?'1 unidade':`${n} unidades`;giftQty.append(opt)}}
function closeModal(){if(typeof modal.close==='function')modal.close();else modal.removeAttribute('open')}
function busy(flag){giftSubmit.disabled=flag;giftSubmit.textContent=flag?'Reservando...':'Confirmar presente ♥'}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),3200)}
async function request(path,opts={}){const base=cfg.SUPABASE_URL.replace(/\/$/,'');const res=await fetch(base+'/rest/v1/'+path,{...opts,headers:{apikey:cfg.SUPABASE_ANON_KEY,Authorization:'Bearer '+cfg.SUPABASE_ANON_KEY,'Content-Type':'application/json',...opts.headers}});if(!res.ok){let data;try{data=await res.json()}catch{data={}}throw new Error(data.message||data.error||`Falha na comunicação (${res.status})`)}const t=await res.text();return t?JSON.parse(t):null}
async function syncInventory(){if(!online){demo.hidden=false;initInv();updateStock();return}try{const items=await request('gift_inventory?select=gift_id,total,reserved');const byId=Object.fromEntries(items.map(x=>[x.gift_id,x]));for(const g of gifts){const row=byId[g.id];if(row)inventory[g.id]={total:row.total,reserved:row.reserved}}demo.hidden=true;status.textContent='';updateStock()}catch(e){status.textContent='Não foi possível atualizar as disponibilidades. Tente recarregar a página.';console.error(e)}}
async function reserve(g,name,n){if(!online){const saved=readLocal();const total=Number(saved[g.id]||0);if(total+n>g.qty)throw Error('Este presente já atingiu a quantidade disponível.');saved[g.id]=total+n;writeLocal(saved);inventory[g.id].reserved=total+n;return}
  const result=await request('rpc/reserve_gift',{method:'POST',body:JSON.stringify({p_gift_id:g.id,p_guest_name:name,p_quantity:n})});if(result?.success===false)throw Error(result.message||'Este presente acabou de ser escolhido por outra pessoa.');await syncInventory()}
form.addEventListener('submit',async e=>{e.preventDefault();if(!active)return;const name=giftName.value.trim(),quantity=Number(giftQty.value);if(name.length<2||!Number.isInteger(quantity)||quantity<1){giftFeedback.textContent='Informe seu nome e a quantidade.';return}if(quantity>getAvailable(active)){giftFeedback.textContent='A quantidade disponível mudou. Atualize sua escolha.';fillQuantities(active);return}busy(true);giftFeedback.textContent='';try{await reserve(active,name,quantity);updateStock();closeModal();showToast(online?'💙 Presente reservado! Muito obrigado!':'💙 Reservado nesta demonstração!')}catch(err){giftFeedback.textContent=err.message;await syncInventory();if(active)fillQuantities(active)}finally{busy(false)}});
document.querySelector('#closeModal').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.querySelector('#rsvpForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,btn=document.querySelector('#rsvpSubmit'),feedback=document.querySelector('#rsvpFeedback');const name=f.name?.value||document.querySelector('#rsvpName').value;const note=document.querySelector('#rsvpNote').value.trim();if(name.trim().length<2){feedback.textContent='Digite seu nome para confirmar.';return}btn.disabled=true;feedback.textContent='';try{if(online){await request('rsvp',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify({guest_name:name.trim(),observation:note})})}else{const saved=JSON.parse(getStored('benicio:v9:rsvp')||'[]');saved.push({name:name.trim(),observation:note,created_at:new Date().toISOString()});setStored('benicio:v9:rsvp',JSON.stringify(saved))}feedback.textContent=online?'Presença confirmada! Esperamos você. 💙':'Resposta salva nesta demonstração. No convite publicado, ela será enviada aos anfitriões. 💙';f.reset()}catch(err){feedback.textContent='Não foi possível registrar sua resposta. '+err.message}finally{btn.disabled=false}});
function applyConfig(){if(cfg.EVENT_TIME){document.querySelector('#timeValue').textContent=cfg.EVENT_TIME}if(cfg.EVENT_ADDRESS){document.querySelector('#addressValue').textContent=cfg.EVENT_ADDRESS}if(cfg.MAPS_URL&&/^https:\/\//.test(cfg.MAPS_URL)){const b=document.querySelector('#mapsButton');b.href=cfg.MAPS_URL;b.hidden=false}
 const msg=encodeURIComponent('Olá! Vi o convite do Chá do Benício e gostaria de fazer um convite digital interativo parecido.');const phone=String(cfg.WHATSAPP||'').replace(/\D/g,'');document.querySelector('#contactLink').href=phone?`https://wa.me/${phone}?text=${msg}`:`https://api.whatsapp.com/send?text=${msg}`}
window.addEventListener('storage',e=>{if(!online&&(e.key===key)){const saved=readLocal();gifts.forEach(g=>inventory[g.id].reserved=saved[g.id]||0);updateStock()}});
async function init(){initInv();renderCards();applyConfig();window.Benicio3D?.initHero();window.Benicio3D?.initAccents();await syncInventory();if(online){setInterval(()=>{if(!document.hidden)syncInventory()},30000)}}
init();
})();
