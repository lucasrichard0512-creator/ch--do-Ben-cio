'use strict';

const CONFIG = window.BENICIO_CONFIG || {};
const DATABASE_READY = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_PUBLISHABLE_KEY);
const DEMO_KEY = 'cha-benicio-presentes-demo-v2';
const DEMO_RSVP_KEY = 'cha-benicio-presencas-demo-v2';

const GIFTS = [
  { id: 'fraldas-rn', name: 'Fralda RN', qty: 2, image: 'assets/gifts/fraldas-rn.svg', description: 'Para os primeiros dias do Benício.' },
  { id: 'fraldas-p', name: 'Fralda P', qty: 8, image: 'assets/gifts/fraldas-p.svg', description: 'As pequenas grandes aliadas da rotina.' },
  { id: 'fraldas-m', name: 'Fralda M', qty: 14, image: 'assets/gifts/fraldas-m.svg', description: 'O estoque mais estratégico do enxoval.' },
  { id: 'fraldas-g', name: 'Fralda G', qty: 10, image: 'assets/gifts/fraldas-g.svg', description: 'Porque o Benício vai crescer rapidinho.' },
  { id: 'fraldas-xg', name: 'Fralda XG', qty: 5, image: 'assets/gifts/fraldas-xg.svg', description: 'Prevenção é tudo, principalmente com fraldas.' },
  { id: 'lencos', name: 'Lenços umedecidos', qty: 15, image: 'assets/gifts/lencos.svg', description: 'Sempre úteis, sempre necessários.' },
  { id: 'pomada', name: 'Pomada para assaduras', qty: 5, image: 'assets/gifts/pomada.svg', description: 'Cuidado e carinho para a pele do bebê.' },
  { id: 'sabonete', name: 'Sabonete líquido', qty: 5, image: 'assets/gifts/sabonete.svg', description: 'Um banho cheiroso para o pequeno.' },
  { id: 'shampoo', name: 'Shampoo infantil', qty: 3, image: 'assets/gifts/shampoo.svg', description: 'Para os banhos mais fofos da casa.' },
  { id: 'bodies', name: 'Kit de bodies', qty: 4, image: 'assets/gifts/bodies.svg', description: 'Conforto para muitos abraços.' },
  { id: 'macacao', name: 'Macacão para bebê', qty: 4, image: 'assets/gifts/macacao.svg', description: 'Fofura garantida para o enxoval.' },
  { id: 'manta', name: 'Manta para bebê', qty: 3, image: 'assets/gifts/manta.svg', description: 'Um abraço quentinho em forma de manta.' },
  { id: 'toalha', name: 'Toalha com capuz', qty: 5, image: 'assets/gifts/toalha.svg', description: 'Para sair do banho parecendo um mini ursinho.' },
  { id: 'paninhos', name: 'Kit de paninhos de boca', qty: 6, image: 'assets/gifts/paninhos.svg', description: 'Nunca é demais. Nunca mesmo.' },
  { id: 'lencol', name: 'Jogo de lençol para berço', qty: 3, image: 'assets/gifts/lencol.svg', description: 'Mais conforto para o soninho do Benício.' },
  { id: 'mamadeira', name: 'Mamadeira', qty: 2, image: 'assets/baby-bottle.webp', description: 'Um clássico que ajuda muito na rotina.' },
  { id: 'escova-pente', name: 'Kit escova e pente', qty: 1, image: 'assets/gifts/escova-pente.svg', description: 'Para o cabelo do Benício ficar mais arrumado que o do papai.' },
  { id: 'banheira', name: 'Banheira', qty: 1, image: 'assets/gifts/banheira.svg', description: 'Banho gostoso e muito cuidado.' },
  { id: 'trocador', name: 'Trocador', qty: 1, image: 'assets/gifts/trocador.svg', description: 'Praticidade na missão troca de fraldas.' },
  { id: 'berco', name: 'Berço', qty: 1, image: 'assets/crib.webp', description: 'O bebê só precisa de um. O resto a gente evita. 😅' },
  { id: 'carrinho', name: 'Carrinho de bebê', qty: 1, image: 'assets/gifts/carrinho.svg', description: 'Para os passeios mais especiais.' },
  { id: 'bebe-conforto', name: 'Bebê conforto', qty: 1, image: 'assets/gifts/bebe-conforto.svg', description: 'Segurança e conforto nos trajetos.' },
  { id: 'comoda', name: 'Cômoda para bebê', qty: 1, image: 'assets/gifts/comoda.svg', description: 'Organização para o enxoval do príncipe.' },
  { id: 'ps5-pro', name: 'PS5 Pro', qty: 1, image: 'assets/gifts/ps5-pro.svg', description: 'Item importantíssimo para o bem-estar emocional do papai. A mamãe segue analisando. 😂', isJoke: true }
];

const state = {
  gifts: GIFTS.map(item => ({ ...item, reserved: 0 })),
  selection: Object.fromEntries(GIFTS.map(item => [item.id, 1])),
  selectedId: null,
  busy: false,
  online: !DATABASE_READY
};

const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const memoryDemoCache = new Map();
function readDemo(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch { /* Navegação sem armazenamento persistente. */ }
  return memoryDemoCache.get(key) || fallback;
}

function writeDemo(key, value) {
  memoryDemoCache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* Mantém a simulação disponível durante a visita. */ }
}

function toast(message) {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('visible'), 3400);
}

function setFeedback(node, message, isError = false) {
  node.textContent = message;
  node.classList.toggle('is-error', isError);
}

async function supabaseRequest(path, method = 'GET', payload) {
  const url = CONFIG.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + path;
  const headers = { apikey: CONFIG.SUPABASE_PUBLISHABLE_KEY, 'Content-Type': 'application/json' };
  if (CONFIG.SUPABASE_PUBLISHABLE_KEY.startsWith('eyJ')) {
    headers.Authorization = 'Bearer ' + CONFIG.SUPABASE_PUBLISHABLE_KEY;
  }
  let response;
  try {
    response = await fetch(url, { method, headers, body: payload === undefined ? undefined : JSON.stringify(payload) });
  } catch {
    throw new Error('Não foi possível conectar. Confira sua internet e tente novamente.');
  }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const raw = result?.message || result?.error || 'Não foi possível concluir agora.';
    if (String(raw).includes('PRESENTE_ESGOTADO')) throw new Error('Esse presente acabou de ser reservado por outra pessoa.');
    if (String(raw).includes('DADOS_INVALIDOS')) throw new Error('Revise os dados informados e tente novamente.');
    if (String(raw).includes('PRESENTE_INEXISTENTE')) throw new Error('Presente não encontrado. Atualize a página.');
    throw new Error('Não conseguimos concluir agora. Tente novamente em instantes.');
  }
  return result;
}

function applyDemoQuantities() {
  const demo = readDemo(DEMO_KEY, {});
  state.gifts = GIFTS.map(item => ({ ...item, reserved: clamp(Number(demo[item.id]) || 0, 0, item.qty) }));
  state.online = true;
  $('#demoNotice').textContent = 'Prévia do convite: ative o Supabase para compartilhar as reservas entre os convidados. Por enquanto, cada navegador mantém suas escolhas separadas.';
  $('#demoNotice').classList.remove('hidden');
  $('#connectionNotice').classList.add('hidden');
}

async function refreshGifts() {
  if (!DATABASE_READY) {
    applyDemoQuantities();
    renderGifts();
    return;
  }

  try {
    const items = await supabaseRequest('gifts?select=id,total_qty,reserved_qty&active=eq.true&order=sort_order.asc');
    if (!Array.isArray(items)) throw new Error('Catálogo incompleto');
    const byId = new Map(items.map(item => [item.id, item]));
    state.gifts = GIFTS.map(item => {
      const db = byId.get(item.id);
      if (!db) throw new Error('Presente faltando no banco');
      return { ...item, qty: Number(db.total_qty), reserved: Number(db.reserved_qty) };
    });
    state.online = true;
    $('#demoNotice').classList.add('hidden');
    $('#connectionNotice').classList.add('hidden');
  } catch {
    state.online = false;
    $('#connectionNotice').textContent = 'Não foi possível atualizar a disponibilidade agora. Para evitar reservas duplicadas, os botões foram desativados temporariamente.';
    $('#connectionNotice').classList.remove('hidden');
  }

  renderGifts();
}

function renderGifts() {
  const html = state.gifts.map(gift => {
    const left = Math.max(0, gift.qty - gift.reserved);
    const full = left === 0;
    const selected = clamp(state.selection[gift.id] || 1, 1, Math.max(left, 1));
    state.selection[gift.id] = selected;
    const availability = `${left} ${left === 1 ? 'disponível' : 'disponíveis'}`;

    return `
      <article data-gift-id="${gift.id}" class="gift-card ${full ? 'is-full' : ''} ${gift.isJoke ? 'is-joke' : ''}">
        <div class="gift-image-wrap">
          <img src="${gift.image}" alt="${escapeHtml(gift.name)}" class="gift-image">
        </div>
        <h3>${escapeHtml(gift.name)}</h3>
        <p class="gift-stock">${availability}</p>
        <div class="gift-counter" aria-label="Quantidade para reservar de ${escapeHtml(gift.name)}">
          <button type="button" class="qty-btn" data-action="minus" data-gift-id="${gift.id}" ${selected <= 1 || full ? 'disabled' : ''}>−</button>
          <strong>${selected}</strong>
          <button type="button" class="qty-btn" data-action="plus" data-gift-id="${gift.id}" ${selected >= left || full ? 'disabled' : ''}>+</button>
        </div>
        <button type="button" class="reserve-button" data-reserve-id="${gift.id}" ${full || !state.online ? 'disabled' : ''}>
          ${full ? 'Presente esgotado' : '<svg class="icon" aria-hidden="true"><use href="#ic-gift"></use></svg> Reservar presente'}
        </button>
      </article>
    `;
  }).join('');

  $('#giftGrid').innerHTML = html;
}

function changeSelection(giftId, direction) {
  const gift = state.gifts.find(item => item.id === giftId);
  if (!gift) return;
  const left = Math.max(0, gift.qty - gift.reserved);
  const current = state.selection[giftId] || 1;
  const next = direction === 'plus' ? current + 1 : current - 1;
  state.selection[giftId] = clamp(next, 1, Math.max(left, 1));
  renderGifts();
}

function showGiftModal(giftId) {
  const gift = state.gifts.find(item => item.id === giftId);
  if (!gift || !state.online) return;
  const left = gift.qty - gift.reserved;
  if (left <= 0) return;

  state.selectedId = giftId;
  $('#giftModalImage').src = gift.image;
  $('#giftModalImage').alt = gift.name;
  $('#giftModalTitle').textContent = gift.name;
  $('#giftModalDescription').textContent = gift.description;
  $('#giftGuestName').value = $('#rsvpName').value.trim();
  setFeedback($('#giftFeedback'), '');

  const select = $('#giftQuantity');
  select.replaceChildren();
  for (let i = 1; i <= left; i += 1) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = `${i} ${i === 1 ? 'unidade' : 'unidades'}`;
    if (i === state.selection[giftId]) option.selected = true;
    select.append(option);
  }

  $('#giftModal').showModal();
  $('#giftGuestName').focus();
}

async function reserveGift(event) {
  event.preventDefault();
  if (state.busy || !state.selectedId) return;

  const gift = state.gifts.find(item => item.id === state.selectedId);
  const name = $('#giftGuestName').value.trim().replace(/\s+/g, ' ');
  const quantity = Number($('#giftQuantity').value);

  if (!gift || name.length < 2 || name.length > 80 || !Number.isInteger(quantity) || quantity < 1) {
    setFeedback($('#giftFeedback'), 'Informe seu nome e uma quantidade válida.', true);
    return;
  }

  state.busy = true;
  const button = $('#giftSubmit');
  button.disabled = true;
  button.textContent = 'Reservando...';

  try {
    if (DATABASE_READY) {
      await supabaseRequest('rpc/reserve_gift', 'POST', {
        p_gift_id: gift.id,
        p_guest_name: name,
        p_quantity: quantity
      });
      await refreshGifts();
    } else {
      const demo = readDemo(DEMO_KEY, {});
      const current = clamp(Number(demo[gift.id]) || 0, 0, gift.qty);
      if (current + quantity > gift.qty) {
        throw new Error('Não há mais essa quantidade disponível para esse presente.');
      }
      demo[gift.id] = current + quantity;
      writeDemo(DEMO_KEY, demo);
      applyDemoQuantities();
      renderGifts();
    }

    $('#giftModal').close();
    toast(`💙 Obrigado, ${name.split(' ')[0]}! Sua reserva foi registrada.`);
  } catch (error) {
    setFeedback($('#giftFeedback'), error.message || 'Não foi possível reservar o presente.', true);
    await refreshGifts();
  } finally {
    state.busy = false;
    button.disabled = false;
    button.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#ic-gift"></use></svg> Reservar presente';
  }
}

async function submitRsvp(event) {
  event.preventDefault();
  const name = $('#rsvpName').value.trim().replace(/\s+/g, ' ');
  const message = $('#rsvpMessage').value.trim();
  const feedback = $('#rsvpFeedback');

  if (name.length < 2 || name.length > 80 || message.length > 300) {
    setFeedback(feedback, 'Confira os dados antes de enviar.', true);
    return;
  }

  const button = $('#rsvpSubmit');
  button.disabled = true;
  button.innerHTML = 'Enviando...';

  try {
    if (DATABASE_READY) {
      await supabaseRequest('rpc/confirm_rsvp', 'POST', {
        p_guest_name: name,
        p_attending: true,
        p_guests_count: 1,
        p_message: message
      });
    } else {
      const entries = readDemo(DEMO_RSVP_KEY, []);
      entries.push({ name, message, at: new Date().toISOString() });
      writeDemo(DEMO_RSVP_KEY, entries);
    }

    setFeedback(feedback, DATABASE_READY
      ? 'Presença confirmada! Vai ser lindo ter você com a gente. 💙'
      : 'Demonstração: sua confirmação foi salva apenas neste navegador.');
    toast('Presença confirmada com carinho 💙');
    $('#rsvpForm').reset();
  } catch (error) {
    setFeedback(feedback, error.message || 'Não foi possível enviar sua confirmação.', true);
  } finally {
    button.disabled = false;
    button.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#ic-check"></use></svg> Confirmar presença';
  }
}

function fillEventInfo() {
  $('#heroDateText').textContent = CONFIG.EVENT_DATE_LABEL || 'Sábado, 28 de novembro de 2026';
  $('#meetingPlaceName').textContent = CONFIG.EVENT_PLACE_NAME || 'Igreja Missão Renovada';
  $('#meetingPlaceAddress').textContent = CONFIG.EVENT_ADDRESS || 'São Miguel do Araguaia - GO';
  $('#meetingTime').textContent = CONFIG.EVENT_TIME || '19:00h';

  const mapsUrl = String(CONFIG.MAPS_URL || '').trim();
  if (mapsUrl && /^https?:\/\//i.test(mapsUrl)) {
    $('#mapsLink').href = mapsUrl;
  }

  const whatsapp = String(CONFIG.WHATSAPP_NUMBER || '').replace(/\D/g, '');
  const contact = $('#contactLink');
  if (whatsapp.length >= 12 && whatsapp.length <= 15) {
    const text = 'Olá! Vi o convite do Chá do Benício e gostaria de pedir um convite interativo assim.';
    contact.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
    contact.target = '_blank';
    contact.rel = 'noopener noreferrer';
  } else {
    contact.addEventListener('click', event => {
      event.preventDefault();
      toast('Adicione o número do WhatsApp em config.js para ativar esse botão.');
    });
  }
}

function initReveal() {
  const items = document.querySelectorAll('.section-panel');
  if (!('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  items.forEach(item => observer.observe(item));
}

function start() {
  fillEventInfo();
  initReveal();
  refreshGifts();

  $('#giftGrid').addEventListener('click', event => {
    const qtyTrigger = event.target.closest('[data-action]');
    if (qtyTrigger) {
      changeSelection(qtyTrigger.dataset.giftId, qtyTrigger.dataset.action);
      return;
    }

    const reserveTrigger = event.target.closest('[data-reserve-id]');
    if (reserveTrigger) {
      showGiftModal(reserveTrigger.dataset.reserveId);
    }
  });

  $('#giftForm').addEventListener('submit', reserveGift);
  $('#closeGiftModal').addEventListener('click', () => $('#giftModal').close());
  $('#giftModal').addEventListener('click', event => {
    if (event.target === $('#giftModal')) $('#giftModal').close();
  });
  $('#rsvpForm').addEventListener('submit', submitRsvp);

  if (DATABASE_READY) {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && !state.busy) refreshGifts();
    });
    setInterval(() => {
      if (!document.hidden && !state.busy) refreshGifts();
    }, 20000);
  } else {
    window.addEventListener('storage', event => {
      if (event.key === DEMO_KEY) {
        applyDemoQuantities();
        renderGifts();
      }
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
