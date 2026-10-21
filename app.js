'use strict';
(() => {
 const C=window.BENICIO_CONFIG||{};
 const connected=Boolean(C.SUPABASE_URL&&C.SUPABASE_ANON_KEY);
 const IMG='assets/';
 // Mesma ordem da arte aprovada. Os presentes maiores ficam juntos no fim, antes do PS5.
 const rows=[
  ['fraldas-rn','Fraldas RN',2,'fraldas-rn.png'],['fraldas-p','Fraldas P',8,'fraldas-p.png'],['fraldas-m','Fraldas M',14,'fraldas-m.png'],['fraldas-g','Fraldas G',10,'fraldas-g.png'],['fraldas-xg','Fraldas XG',5,'fraldas-xg.png'],
  ['lencos','Lenços umedecidos',15,'lencos.png'],['pomada','Pomada para assaduras',5,'pomada.png'],['sabonete','Sabonete líquido',5,'sabonete.png'],['shampoo','Shampoo infantil',3,'shampoo.png'],['bodies','Kit de bodies',4,'bodies.png'],
  ['macacao','Macacão para bebê',4,'macacao.png'],['manta','Manta para bebê',3,'manta.png'],['toalha','Toalha com capuz',3,'toalha.png'],['paninhos','Kit de paninhos de boca',6,'paninhos.png'],['lencol','Jogo de lençol para berço',3,'lencol.png'],
  ['mamadeira','Mamadeira',2,'mamadeira.png'],['escova','Kit escova e pente',1,'escova.png'],['banheira','Banheira',1,'banheira.png'],['trocador','Trocador',1,'trocador.png'],['babadores','Kit de babadores',3,'babadores.png'],
  ['berco','Berço',1,'berco.png'],['carrinho','Carrinho de bebê',1,'carrinho.png'],['bebe-conforto','Bebê conforto',1,'bebe-conforto.png'],['comoda','Cômoda para bebê',1,'comoda.png'],
  ['ps5','PS5 Pro',1,'ps5.png','Para o futuro gamer do papai! 🎮😂']
 ];
 const gifts=rows.map(([id,name,capacity,image,joke])=>({id,name,capacity,image:(window.BENICIO_IMAGES?.[image]||IMG+image),joke:joke||''}));
 const byId=new Map(gifts.map(g=>[g.id,g]));
 const $=id=>document.getElementById(id);
 const stateKey='benicio-v7-reservas-demo',rsvpKey='benicio-v7-presencas-demo';
 const inMemory={};
 const getLocal=(key,fallback)=>{try {return JSON.parse(localStorage.getItem(key))||fallback;}catch{return inMemory[key]??fallback;}};
 const setLocal=(key,value)=>{inMemory[key]=value;try{localStorage.setItem(key,JSON.stringify(value));}catch{}};
 const quantity={};const availability={};let ready=false;let activeGift=null;let toastTimeout;
 for(const gift of gifts){quantity[gift.id]=1;availability[gift.id]=gift.capacity;}
 const apiRoot=String(C.SUPABASE_URL||'').replace(/\/+$/,'');
 async function api(path,opts={}) {
  const res=await fetch(`${apiRoot}/rest/v1/${path}`,{...opts,headers:{apikey:C.SUPABASE_ANON_KEY,Authorization:`Bearer ${C.SUPABASE_ANON_KEY}`,'Content-Type':'application/json',...(opts.headers||{})}});
  if(!res.ok){let body={};try{body=await res.json();}catch{}throw new Error(body.message||`Erro ${res.status}`);}
  const text=await res.text();return text?JSON.parse(text):null;
 }
 function readDemo(){const data=getLocal(stateKey,{});for(const gift of gifts)availability[gift.id]=Math.max(0,gift.capacity-Number(data[gift.id]||0));ready=true;}
 async function refresh(){
  if(!connected){readDemo();render();return;}
  try{const rows=await api('gift_status?select=id,remaining');for(const gift of gifts)availability[gift.id]=0;for(const row of rows)if(byId.has(row.id))availability[row.id]=Math.max(0,Number(row.remaining));ready=true;$('offlineBanner').classList.add('hidden');}
  catch(e){ready=false;$('offlineBanner').textContent='A lista está temporariamente indisponível. Tente novamente mais tarde.';$('offlineBanner').classList.remove('hidden');console.error(e);}render();
 }
 function avail(g){return ready?Number(availability[g.id]||0):0;}
 const posterGrid=[
   {y:605,buttonY:754,stepY:729},
   {y:781,buttonY:890,stepY:870},
   {y:923,buttonY:1037,stepY:1018},
   {y:1067,buttonY:1182,stepY:1164},
   {y:1211,buttonY:1329,stepY:1308}
 ];
 const posterX=[20,180,341,502,664];
 function setRect(el,x,y,w,h){Object.assign(el.style,{left:(100*x/854)+'%',top:(100*y/1842)+'%',width:(100*w/854)+'%',height:(100*h/1842)+'%'});}
 function positionHotspots(){
  for(const el of document.querySelectorAll('.hit')){
   const s=el.style;setRect(el,Number(s.getPropertyValue('--x')),Number(s.getPropertyValue('--y')),Number(s.getPropertyValue('--w')),Number(s.getPropertyValue('--h')));
  }
  for(const el of document.querySelectorAll('.poster-point'))el.style.top=(100*Number(el.style.getPropertyValue('--top'))/1842)+'%';
 }
 function createPosterHotspots(){
  const container=$('posterHotspots');
  gifts.forEach((gift,i)=>{
   if(gift.id==='babadores')return; // 25º item inserido no espaço livre com card próprio.
   const r=Math.floor(i/5),col=i%5;
   const x=posterX[col], row=posterGrid[r];
   // A ordem tem 5 itens por linha; a linha dos acessórios tem um card próprio no espaço livre.
   const buy=document.createElement('button');buy.type='button';buy.className='poster-hotspot';buy.setAttribute('data-reserve',gift.id);buy.setAttribute('aria-label',`Reservar ${gift.name}`);
   setRect(buy,x+12,row.buttonY,126,24);container.append(buy);
   for(const [act,dx] of [['minus',29],['plus',115]]){
    const step=document.createElement('button');step.className='poster-step';step.type='button';step.setAttribute('data-qty-action',act);step.setAttribute('data-id',gift.id);step.setAttribute('aria-label',`${act==='plus'?'Aumentar':'Diminuir'} quantidade de ${gift.name}`);setRect(step,x+dx,row.stepY,20,21);container.append(step);
   }
   const count=document.createElement('span');count.className='poster-count';count.dataset.qty=gift.id;count.textContent='1';setRect(count,x+68,row.stepY,16,23);container.append(count);
   const stock=document.createElement('span');stock.className='poster-stock hidden';stock.dataset.stock=gift.id;setRect(stock,x+51,row.y+99,84,15);container.append(stock);
  });
 }
 function render(){
  const grid=$('giftGridMobile');grid.replaceChildren();
  for(const gift of gifts){
   const n=avail(gift),card=document.createElement('article');card.className='gift-card'+(gift.id==='ps5'?' special':'');
   const img=document.createElement('img');img.src=gift.image;img.alt=gift.name;img.loading='lazy';img.width=340;img.height=280;card.append(img);
   const h=document.createElement('h3');h.className='name';h.textContent=gift.name;card.append(h);
   const available=document.createElement('div');available.className='available';available.textContent=ready?(n?`${n} disponíve${n===1?'l':'is'}`:'Já escolhido 💙'):'Indisponível';card.append(available);
   if(gift.joke){const note=document.createElement('p');note.className='joke';note.textContent=gift.joke;card.append(note);}
   const steps=document.createElement('div');steps.className='stepper';steps.innerHTML=`<button type="button" data-qty-action="minus" data-id="${gift.id}" aria-label="Diminuir quantidade de ${gift.name}">−</button><span data-qty="${gift.id}">${Math.min(quantity[gift.id],Math.max(n,1))}</span><button type="button" data-qty-action="plus" data-id="${gift.id}" aria-label="Aumentar quantidade de ${gift.name}">+</button>`;card.append(steps);
   const buy=document.createElement('button');buy.type='button';buy.className='reserve';buy.dataset.reserve=gift.id;buy.disabled=n===0;buy.textContent=n?'♧ Reservar presente':'Já escolhido';card.append(buy);grid.append(card);
   if(quantity[gift.id]>n&&n)quantity[gift.id]=n;
   for(const s of document.querySelectorAll(`[data-qty="${gift.id}"]`))s.textContent=quantity[gift.id];
   for(const s of document.querySelectorAll(`[data-stock="${gift.id}"]`)){
    if(s.classList.contains('poster-stock')){s.classList.toggle('hidden',n===gift.capacity);s.textContent=n?`${n} disponíveis`:'Já escolhido';}
    else s.textContent=n?`${n} disponíveis`:'Já escolhido';
   }
   for(const btn of document.querySelectorAll(`.poster-hotspot[data-reserve="${gift.id}"]`)){btn.disabled=n===0;btn.textContent=n?'':'Já escolhido';}
  }
  const bab=byId.get('babadores'),n=avail(bab);$('extraBabadores').querySelector('.tiny-buy').disabled=!n;
 }
 function updateQuantity(id,delta){const gift=byId.get(id);if(!gift||!ready)return;quantity[id]=Math.max(1,Math.min(avail(gift),quantity[id]+delta));for(const span of document.querySelectorAll(`[data-qty="${id}"]`))span.textContent=quantity[id];}
 function openGift(id){const gift=byId.get(id);if(!gift||!ready||avail(gift)<=0)return;activeGift=gift;$('giftDialogTitle').textContent=gift.name;$('dialogImage').src=gift.image;$('dialogImage').alt=gift.name;$('dialogJoke').textContent=gift.joke||'Um carinho para o Benício!';$('giftQuantity').replaceChildren();for(let i=1;i<=avail(gift);i++){$('giftQuantity').add(new Option(`${i} unidade${i===1?'':'s'}`,String(i)));}$('giftQuantity').value=String(Math.min(quantity[id],avail(gift)));$('giftGuest').value='';showFeedback($('giftFeedback'),'');$('giftDialog').showModal();}
 function showFeedback(el,text,error=false){el.textContent=text;el.classList.toggle('error',error);}
 function toast(text){const el=$('toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('visible'),3400);}
 document.addEventListener('click',e=>{
   const minus=e.target.closest('[data-qty-action]');if(minus){updateQuantity(minus.dataset.id,minus.dataset.qtyAction==='plus'?1:-1);return;}
   const reserve=e.target.closest('[data-reserve]');if(reserve){openGift(reserve.dataset.reserve);}
 });
 $('closeGiftDialog').addEventListener('click',()=>$('giftDialog').close());$('giftDialog').addEventListener('click',e=>{if(e.target===$('giftDialog'))$('giftDialog').close();});
 $('giftForm').addEventListener('submit',async e=>{
  e.preventDefault();if(!activeGift)return;const guest=$('giftGuest').value.trim(),qty=Number($('giftQuantity').value);if(guest.length<2||qty<1){showFeedback($('giftFeedback'),'Informe seu nome e a quantidade.',true);return;}
  const btn=$('giftSubmit');btn.disabled=true;btn.textContent='Confirmando...';
  try{if(connected){await api('rpc/reserve_gift',{method:'POST',body:JSON.stringify({p_gift_id:activeGift.id,p_guest_name:guest,p_quantity:qty})});await refresh();}
      else{const data=getLocal(stateKey,{}),used=Number(data[activeGift.id]||0);if(used+qty>activeGift.capacity)throw new Error('Presente indisponível');data[activeGift.id]=used+qty;setLocal(stateKey,data);readDemo();render();}
    $('giftDialog').close();toast(connected?'Presente reservado para o Benício! 💙':'Reserva de demonstração salva neste aparelho.');}
  catch(err){showFeedback($('giftFeedback'),'Este presente pode ter acabado. Atualize a lista e tente novamente.',true);if(connected)await refresh();console.error(err);}
  finally{btn.disabled=false;btn.textContent='Confirmar presente';}
 });
 async function submitRSVP(e){
  e.preventDefault();const form=e.currentTarget,name=String(form.querySelector('[name="name"]').value||'').trim(),message=String(form.querySelector('[name="note"]').value||'').trim();
  const feedbackEl=form.id==='desktopRsvp'?$('desktopFeedback'):$('mobileFeedback');if(name.length<2){showFeedback(feedbackEl,'Informe seu nome.',true);return;}
  const data={guest_name:name,attending:true,guest_count:1,message};const btn=form.querySelector('button[type="submit"]');const prev=btn.textContent;btn.disabled=true;btn.textContent='Enviando...';
  try{if(connected)await api('rsvps',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(data)});else{const old=getLocal(rsvpKey,[]);old.push({...data,created_at:new Date().toISOString()});setLocal(rsvpKey,old);}
      showFeedback(feedbackEl,connected?'Presença confirmada! 💙':'Confirmação de demonstração salva neste aparelho. 💙');form.reset();}
  catch(error){showFeedback(feedbackEl,'Não foi possível confirmar agora. Tente novamente.',true);console.error(error);}
  finally{btn.disabled=false;btn.textContent=prev;}
 }
 $('desktopRsvp').addEventListener('submit',submitRSVP);$('mobileRsvpForm').addEventListener('submit',submitRSVP);
 function contactLink(){const wa=String(C.WHATSAPP||'').replace(/\D/g,'');return wa?`https://wa.me/${wa}?text=${encodeURIComponent('Olá! Vi o convite do Chá do Benício e gostaria de um convite assim!')}`:'';}
 for(const id of ['mobileContact','desktopContact']){const a=$(id);const href=contactLink();if(href){a.href=href;a.target='_blank';a.rel='noopener noreferrer';}else a.addEventListener('click',e=>{e.preventDefault();toast('O WhatsApp do papai será adicionado em breve. 💙');});}
 if(C.EVENT_PLACE)$('mobilePlace').textContent=C.EVENT_PLACE;
 if(C.EVENT_TIME)$('mobileTime').textContent=C.EVENT_TIME;
 if(C.MAPS_URL){$('mapLink').href=C.MAPS_URL;$('mapLink').classList.remove('hidden');}
 if(!connected)$('demoBanner').classList.remove('hidden');
 window.addEventListener('storage',e=>{if(!connected&&e.key===stateKey){readDemo();render();}});
 // Em tela grande, as âncoras apontam para a própria arte, sem alterar sua composição.
 document.querySelectorAll('[data-target]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();$(a.dataset.target).scrollIntoView({behavior:'smooth',block:'start'});}));
 createPosterHotspots();positionHotspots();refresh();
})();
