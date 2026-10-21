'use strict';

const CONFIG = window.BENICIO_CONFIG || {};
const DATABASE_READY = Boolean(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_PUBLISHABLE_KEY);
const DEMO_KEY = 'cha-benicio-presentes-demo-v2';
const DEMO_RSVP_KEY = 'cha-benicio-presencas-demo-v2';

const GIFTS = [
  { id: 'fraldas-rn', name: 'Fralda RN', qty: 2, image: 'assets/gifts/fraldas-rn.webp', description: 'Para os primeiros dias do Benício.' },
  { id: 'fraldas-p', name: 'Fralda P', qty: 8, image: 'assets/gifts/fraldas-p.webp', description: 'As pequenas grandes aliadas da rotina.' },
  { id: 'fraldas-m', name: 'Fralda M', qty: 14, image: 'assets/gifts/fraldas-m.webp', description: 'O estoque mais estratégico do enxoval.' },
  { id: 'fraldas-g', name: 'Fralda G', qty: 10, image: 'assets/gifts/fraldas-g.webp', description: 'Porque o Benício vai crescer rapidinho.' },
  { id: 'fraldas-xg', name: 'Fralda XG', qty: 5, image: 'assets/gifts/fraldas-xg.webp', description: 'Prevenção é tudo, principalmente com fraldas.' },
  { id: 'lencos', name: 'Lenços umedecidos', qty: 15, image: 'assets/gifts/lencos.webp', description: 'Sempre úteis, sempre necessários.' },
  { id: 'pomada', name: 'Pomada para assaduras', qty: 5, image: 'assets/gifts/pomada.webp', description: 'Cuidado e carinho para a pele do bebê.' },
  { id: 'sabonete', name: 'Sabonete líquido', qty: 5, image: 'assets/gifts/sabonete.webp', description: 'Um banho cheiroso para o pequeno.' },
  { id: 'shampoo', name: 'Shampoo infantil', qty: 3, image: 'assets/gifts/shampoo.webp', description: 'Para os banhos mais fofos da casa.' },
  { id: 'bodies', name: 'Kit de bodies', qty: 4, image: 'assets/gifts/bodies.webp', description: 'Conforto para muitos abraços.' },
  { id: 'macacao', name: 'Macacão para bebê', qty: 4, image: 'assets/gifts/macacao.webp', description: 'Fofura garantida para o enxoval.' },
  { id: 'manta', name: 'Manta para bebê', qty: 3, image: 'assets/gifts/manta.webp', description: 'Um abraço quentinho em forma de manta.' },
  { id: 'toalha', name: 'Toalha com capuz', qty: 5, image: 'assets/gifts/toalha.webp', description: 'Para sair do banho parecendo um mini ursinho.' },
  { id: 'paninhos', name: 'Kit de paninhos de boca', qty: 6, image: 'assets/gifts/paninhos.webp', description: 'Nunca é demais. Nunca mesmo.' },
  { id: 'lencol', name: 'Jogo de lençol para berço', qty: 3, image: 'assets/gifts/lencol.webp', description: 'Mais conforto para o soninho do Benício.' },
  { id: 'mamadeira', name: 'Mamadeira', qty: 2, image: 'assets/baby-bottle.webp', description: 'Um clássico que ajuda muito na rotina.' },
  { id: 'escova-pente', name: 'Kit escova e pente', qty: 1, image: 'assets/gifts/escova-pente.webp', description: 'Para o cabelo do Benício ficar sempre no capricho.' },
  { id: 'banheira', name: 'Banheira', qty: 1, image: 'assets/gifts/banheira.webp', description: 'Banho gostoso e muito cuidado.' },
  { id: 'trocador', name: 'Trocador', qty: 1, image: 'assets/gifts/trocador.webp', description: 'Praticidade na missão troca de fraldas.' },
  { id: 'berco', name: 'Berço', qty: 1, image: 'assets/crib.webp', description: 'Onde vão nascer muitos soninhos tranquilos.' },
  { id: 'carrinho', name: 'Carrinho de bebê', qty: 1, image: 'assets/gifts/carrinho.webp', description: 'Para os passeios mais especiais.' },
  { id: 'bebe-conforto', name: 'Bebê conforto', qty: 1, image: 'assets/gifts/bebe-conforto.webp', description: 'Segurança e conforto nos trajetos.' },
  { id: 'comoda', name: 'Cômoda para bebê', qty: 1, image: 'assets/gifts/comoda.webp', description: 'Organização para o enxoval do príncipe.' },
  { id: 'ps5-pro', name: 'PS5 Pro', qty: 1, image: 'assets/gifts/ps5-pro.webp', description: 'Sugestão carinhosamente enviada pelo papai. A diretoria da mamãe ainda está avaliando. 😂', isJoke: true }
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
}

let refreshSequence = 0;
async function refreshGifts() {
  const sequence = ++refreshSequence;
  if (!DATABASE_READY) {
    applyDemoQuantities();
    renderGifts();
    return;
  }

  try {
    const items = await supabaseRequest('gifts?select=id,total_qty,reserved_qty&active=eq.true&order=sort_order.asc');
    if (!Array.isArray(items)) throw new Error('Catálogo incompleto');
    const byId = new Map(items.map(item => [item.id, item]));
    const refreshed = GIFTS.map(item => {
      const db = byId.get(item.id);
      if (!db) throw new Error('Presente faltando no banco');
      return { ...item, qty: Number(db.total_qty), reserved: Number(db.reserved_qty) };
    });
    if (sequence !== refreshSequence) return false;
    state.gifts = refreshed;
    state.online = true;
  } catch {
    if (sequence !== refreshSequence) return false;
    state.online = false;
  }

  renderGifts();
  updateConnectionStatus();
  return state.online;
}

function updateConnectionStatus() {
  const node = $('#connectionStatus');
  if (!node) return;
  node.hidden = DATABASE_READY && state.online;
  node.textContent = !DATABASE_READY
    ? 'Modo demonstração: presentes e presenças são salvos apenas neste navegador. Configure o Supabase antes de compartilhar.'
    : 'Não foi possível atualizar os presentes. Reservas ficam bloqueadas até a conexão voltar.';
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
          <img src="${gift.image}" alt="${escapeHtml(gift.name)}" class="gift-image" loading="lazy" decoding="async">
        </div>
        <h3>${escapeHtml(gift.name)}</h3>
        <p class="gift-stock">${availability}</p>
        <div class="gift-counter" aria-label="Quantidade para reservar de ${escapeHtml(gift.name)}">
          <button type="button" class="qty-btn" data-action="minus" data-gift-id="${gift.id}" ${selected <= 1 || full ? 'disabled' : ''}>−</button>
          <strong>${selected}</strong>
          <button type="button" class="qty-btn" data-action="plus" data-gift-id="${gift.id}" ${selected >= left || full ? 'disabled' : ''}>+</button>
        </div>
        <button type="button" class="reserve-button" data-reserve-id="${gift.id}" ${full || !state.online ? 'disabled' : ''}>
          ${full ? 'Presente esgotado' : '<img src="assets/ui/icon-87134f8f9592.png" class="icon" alt="" aria-hidden="true"> Reservar presente'}
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
    toast(DATABASE_READY ? `💙 Obrigado, ${name.split(' ')[0]}! Sua reserva foi registrada.` : 'Reserva de demonstração salva apenas neste navegador.');
    // A reserva já foi gravada. Uma falha ao reler o catálogo não pode
    // transformar a operação concluída em um erro ou induzir a novo envio.
    await refreshGifts();
  } catch (error) {
    setFeedback($('#giftFeedback'), error.message || 'Não foi possível reservar o presente.', true);
    await refreshGifts();
  } finally {
    state.busy = false;
    button.disabled = false;
    button.innerHTML = '<img src="assets/ui/icon-87134f8f9592.png" class="icon" alt="" aria-hidden="true"> Reservar presente';
  }
}

async function submitRsvp(event) {
  event.preventDefault();
  const name = $('#rsvpName').value.trim().replace(/\s+/g, ' ');
  const message = $('#rsvpMessage').value.trim();
  const guestsCount = Number($('#rsvpGuests').value);
  const feedback = $('#rsvpFeedback');

  if (name.length < 2 || name.length > 80 || message.length > 300 || !Number.isInteger(guestsCount) || guestsCount < 1 || guestsCount > 15) {
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
        p_guests_count: guestsCount,
        p_message: message
      });
    } else {
      const entries = readDemo(DEMO_RSVP_KEY, []);
      entries.push({ name, guestsCount, message, at: new Date().toISOString() });
      writeDemo(DEMO_RSVP_KEY, entries);
    }

    setFeedback(feedback, DATABASE_READY ? 'Presença confirmada! Vai ser lindo ter você com a gente. 💙' : 'Confirmação de demonstração salva somente neste navegador.');
    toast(DATABASE_READY ? 'Presença confirmada com carinho 💙' : 'Simulação salva neste navegador.');
    $('#rsvpForm').reset();
  } catch (error) {
    setFeedback(feedback, error.message || 'Não foi possível enviar sua confirmação.', true);
  } finally {
    button.disabled = false;
    button.innerHTML = '<img src="assets/ui/icon-a9d996f90a57.png" class="icon" alt="" aria-hidden="true"> Confirmar presença';
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
    const text = 'Olá! Vi o convite do Chá do Benício e gostaria de pedir um convite interativo assim.';
    contact.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    contact.target = '_blank';
    contact.rel = 'noopener noreferrer';
  }
}


function setupInternalNavigation() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'auto', block: 'start' });
      history.replaceState(null, '', href);
    });
  });
}

function refineGiftHumor() {
  const note = document.querySelector('.gift-smallprint');
  if (note) {
    note.innerHTML = '<img src="assets/ui/icon-97cf0ed0b6a6.png" class="icon" alt="" aria-hidden="true"> Cada presente pode ser reservado apenas uma vez por unidade. E sim... o PS5 Pro segue sendo uma sugestão bem otimista do papai. 😂';
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
  setupInternalNavigation();
  refineGiftHumor();
  initReveal();
  updateConnectionStatus();
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
