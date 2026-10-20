'use strict';
(() => {
  const config = window.BENICIO_CONFIG || {};
  const connected = Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY);
  const catalog = [
    ['berco', 'Berço', 1, 'berco.png'],
    ['comoda', 'Cômoda para bebê', 1, 'comoda.png'],
    ['carrinho', 'Carrinho de bebê', 1, 'carrinho.png'],
    ['bebe-conforto', 'Bebê conforto', 1, 'bebe-conforto.png'],
    ['banheira', 'Banheira', 1, 'banheira.png'],
    ['trocador', 'Trocador', 1, 'trocador.png'],
    ['mamadeira', 'Mamadeira', 2, 'mamadeira.png'],
    ['escova', 'Kit escova e pente', 1, 'escova.png'],
    ['fraldas-rn', 'Fraldas RN', 2, 'fraldas-rn.png'],
    ['fraldas-p', 'Fraldas P', 8, 'fraldas-p.png'],
    ['fraldas-m', 'Fraldas M', 14, 'fraldas-m.png'],
    ['fraldas-g', 'Fraldas G', 10, 'fraldas-g.png'],
    ['fraldas-xg', 'Fraldas XG', 5, 'fraldas-xg.png'],
    ['lencos', 'Lenços umedecidos', 15, 'lencos.png'],
    ['pomada', 'Pomada para assaduras', 5, 'pomada.png'],
    ['sabonete', 'Sabonete líquido infantil', 5, 'sabonete.png'],
    ['shampoo', 'Shampoo infantil', 3, 'shampoo.png'],
    ['bodies', 'Kit de bodies', 4, 'bodies.png'],
    ['macacao', 'Macacão para bebê', 4, 'macacao.png'],
    ['manta', 'Manta para bebê', 3, 'manta.png'],
    ['toalha', 'Toalha com capuz', 3, 'toalha.png'],
    ['paninhos', 'Kit de paninhos de boca', 6, 'paninhos.png'],
    ['lencol', 'Jogo de lençol para berço', 3, 'lencol.png'],
    ['babadores', 'Kit de babadores', 3, 'babadores.png'],
    ['ps5', 'PlayStation 5 Pro 🎮', 1, 'ps5.png', 'Recomendado pelo papai para garantir a paz da família. 😂']
  ].map(([id, name, capacity, image, joke]) => ({id, name, capacity, image:(window.BENICIO_IMAGES && window.BENICIO_IMAGES[image]) || `assets/${image}`, joke: joke||''}));

  // The browser-only mode is explicitly marked as a DEMONSTRATION.
  const localKey = 'cha-benicio-reservas-demo-v6';
  const rsvpKey = 'cha-benicio-presencas-demo-v6';
  let tempStorage = {};
  function safeRead(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch { return Object.hasOwn(tempStorage,key) ? tempStorage[key] : fallback; }
  }
  function safeWrite(key, value) {
    tempStorage[key] = value;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* file preview may block storage */ }
  }
  let availability = Object.create(null);
  let catalogReady = false;
  let activeGift = null;
  let toastTimer;
  const $ = (id) => document.getElementById(id);
  const grid = $('giftList');
  const giftDialog = $('giftDialog');
  const giftForm = $('giftForm');
  const giftPerson = $('giftPerson');
  const giftQty = $('giftQty');
  const giftFeedback = $('giftFeedback');
  const giftSubmit = $('giftSubmit');
  const rsvp = $('rsvpForm');

  const slug = String(config.SUPABASE_URL || '').replace(/\/+$/, '');
  const apikey = config.SUPABASE_ANON_KEY || '';
  async function api(path, options={}) {
    const headers = {'apikey': apikey, 'Authorization':`Bearer ${apikey}`, 'Content-Type':'application/json', ...(options.headers||{})};
    const res = await fetch(`${slug}/rest/v1/${path}`, {...options, headers});
    if (!res.ok) {
      let detail = '';
      try { const body=await res.json(); detail = body.message || body.error || ''; } catch {}
      throw Error(detail || `Erro de conexão (${res.status})`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  function demoAvailability(){
    const state = safeRead(localKey,{});
    for (const gift of catalog) availability[gift.id] = Math.max(0, gift.capacity - Number(state[gift.id]||0));
    catalogReady = true;
  }
  async function fetchAvailability(){
    if(!connected){ demoAvailability(); renderGifts(); return; }
    try {
      const rows = await api('gift_status?select=id,remaining');
      for(const gift of catalog) availability[gift.id] = 0;
      for(const row of rows) if (Object.hasOwn(availability, row.id)) availability[row.id] = Math.max(0, Number(row.remaining));
      catalogReady = true;
      $('connectionBanner').classList.add('hidden');
    } catch(err) {
      catalogReady = false;
      $('connectionBanner').textContent = 'Não foi possível consultar a lista de presentes agora. Atualize a página para tentar novamente.';
      $('connectionBanner').classList.remove('hidden');
      console.error(err);
    }
    renderGifts();
  }

  function renderGifts(){
    const totals = catalog.reduce((sum,g) => sum + (availability[g.id]||0), 0);
    $('giftCount').textContent = catalogReady ? `${totals} unidades disponíveis para presentear` : 'Lista temporariamente indisponível';
    grid.replaceChildren();
    for (const gift of catalog) {
      const remaining = Math.max(0, availability[gift.id] ?? 0);
      const card = document.createElement('article');
      card.className = 'gift-card' + (gift.id === 'ps5' ? ' special' : '');
      const photo = document.createElement('div'); photo.className = 'gift-picture';
      const img = document.createElement('img'); img.src=gift.image; img.alt=gift.name; img.loading='eager'; img.width=340; img.height=280;
      photo.append(img);
      const info = document.createElement('div');info.className='gift-info';
      const title=document.createElement('h3');title.textContent=gift.name;
      const stock=document.createElement('span');stock.className='stock'+(!remaining?' out':'');
      stock.textContent=catalogReady?(remaining ? `${remaining} disponível${remaining===1?'':'is'}` : 'Já escolhido 💙'):'Aguarde';
      info.append(title,stock);
      if(gift.joke){const joke=document.createElement('p');joke.className='gift-joke';joke.textContent=gift.joke;info.append(joke);}
      const btn = document.createElement('button');btn.type='button';btn.className='gift-button';
      btn.textContent=!catalogReady ? 'Indisponível' : remaining ? 'Quero presentear' : 'Já reservado';
      btn.disabled=!catalogReady||!remaining;
      btn.addEventListener('click',()=>openGift(gift));
      info.append(btn);card.append(photo,info);grid.append(card);
    }
  }
  function openGift(gift){
    if(!catalogReady || !(availability[gift.id]>0)) return;
    activeGift = gift;
    $('giftDialogTitle').textContent=gift.name;
    $('giftDialogImage').src=gift.image;
    $('giftDialogImage').alt=gift.name;
    $('giftDialogExtra').textContent=gift.joke || `Disponíveis: ${availability[gift.id]}`;
    giftQty.replaceChildren();
    for(let i=1;i<=availability[gift.id];i++) {
      const opt=new Option(`${i} unidade${i===1?'':'s'}`,String(i));giftQty.add(opt);
    }
    giftFeedback.textContent='';giftFeedback.classList.remove('error');
    giftForm.reset();
    giftDialog.showModal();
    setTimeout(()=>giftPerson.focus(),50);
  }
  $('closeGiftDialog').addEventListener('click',()=>giftDialog.close());
  giftDialog.addEventListener('click',(e)=>{ if(e.target === giftDialog) giftDialog.close(); });
  giftForm.addEventListener('submit',async (e)=>{
    e.preventDefault();
    if(!activeGift)return;
    const name=giftPerson.value.trim().replace(/\s+/g,' ');
    const qty=Number(giftQty.value);
    if(!name || !Number.isSafeInteger(qty) || qty<1){ feedback(giftFeedback,'Digite seu nome e a quantidade.',true);return; }
    giftSubmit.disabled=true;
    giftSubmit.textContent='Confirmando…';
    try {
      if(connected) {
        await api('rpc/reserve_gift',{method:'POST',body:JSON.stringify({p_gift_id:activeGift.id,p_guest_name:name,p_quantity:qty})});
        await fetchAvailability();
      } else {
        const state=safeRead(localKey,{});
        const used=Number(state[activeGift.id]||0);
        if(qty>activeGift.capacity-used)throw Error('Esse presente acabou de ficar indisponível.');
        state[activeGift.id]=used+qty;safeWrite(localKey,state);demoAvailability();renderGifts();
      }
      giftDialog.close();showToast(connected?'Presente reservado para o Benício! 💙':'Reserva de demonstração salva neste dispositivo.');
      activeGift=null;
    } catch(err) {
      const msg=String(err.message||'Não foi possível salvar.');
      feedback(giftFeedback,/indisponível|insuficiente|stock|available/i.test(msg)?'Este presente já foi escolhido. Atualize a lista e tente outro.':'Não foi possível reservar agora. Tente novamente.',true);
      if(connected)await fetchAvailability();
      console.error(err);
    } finally {
      giftSubmit.disabled=false;
      giftSubmit.innerHTML='Reservar presente <svg class="ico"><use href="#i-check"/></svg>';
    }
  });
  function feedback(el,msg,error=false){el.textContent=msg;el.classList.toggle('error',error);}
  function showToast(msg){const el=$('toast');el.textContent=msg;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3600);}
  document.querySelectorAll('input[name="attendance"]').forEach(el=>el.addEventListener('change',()=>{
    const yes=document.querySelector('input[name="attendance"]:checked').value==='yes';
    $('rsvpGuestsField').classList.toggle('hidden',!yes);
  }));
  rsvp.addEventListener('submit',async (e)=>{
    e.preventDefault();
    const name=$('guestName').value.trim();
    const yes=document.querySelector('input[name="attendance"]:checked').value==='yes';
    const guests=yes?Number($('guestCount').value):0;
    const message=$('guestMessage').value.trim();
    if(!name){feedback($('rsvpFeedback'),'Informe seu nome.',true);return;}
    const data={guest_name:name,attending:yes,guest_count:guests,message};
    const btn=$('rsvpSubmit');btn.disabled=true;btn.textContent='Enviando…';
    try{
      if(connected)await api('rsvps',{method:'POST',headers:{Prefer:'return=minimal'},body:JSON.stringify(data)});
      else{const list=safeRead(rsvpKey,[]);list.push({...data,created_at:new Date().toISOString()});safeWrite(rsvpKey,list);}
      feedback($('rsvpFeedback'),connected?'Resposta recebida! Obrigado pelo carinho. 💙':'Resposta de demonstração salva neste dispositivo. 💙');
      rsvp.reset();$('rsvpGuestsField').classList.remove('hidden');
    }catch(err){feedback($('rsvpFeedback'),'Não foi possível enviar sua resposta agora. Tente novamente.',true);console.error(err);}
    finally{btn.disabled=false;btn.innerHTML='Enviar confirmação <svg class="ico"><use href="#i-arrow"/></svg>';}
  });
  const place = String(config.EVENT_PLACE || '').trim();
  const time = String(config.EVENT_TIME || '').trim();
  if(time)$('eventTime').textContent=time;
  if(place)$('eventPlace').textContent=place;
  if(config.MAPS_URL){const a=$('mapLink');a.href=config.MAPS_URL;a.target='_blank';a.rel='noopener noreferrer';a.classList.remove('hidden');}
  const wa=String(config.WHATSAPP||'').replace(/\D/g,'');
  if(wa) {
    $('contactLink').href=`https://wa.me/${wa}?text=${encodeURIComponent('Olá! Vi o convite do Chá do Benício e quero fazer um convite digital parecido.')}`;
    $('contactLink').target='_blank';$('contactLink').rel='noopener noreferrer';
  } else {
    $('contactLink').addEventListener('click',(e)=>{e.preventDefault();showToast('O WhatsApp do papai ainda será adicionado. 💙');});
  }
  if(!connected)$('demoBanner').classList.remove('hidden');
  window.addEventListener('storage',(e)=>{if(!connected && e.key===localKey){demoAvailability();renderGifts();}});
  fetchAvailability();
})();
