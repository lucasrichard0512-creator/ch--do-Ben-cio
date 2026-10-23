'use strict';

const CONFIG = window.BENICIO_CONFIG || {};
// Gravações reais através das rotas privadas /api do Vercel.
const DATABASE_READY = true;
const DEMO_KEY = 'cha-benicio-presentes-demo-v2';
const DEMO_RSVP_KEY = 'cha-benicio-presencas-demo-v2';

const GIFTS = [
  { id: 'fraldas-rn', name: 'Fralda RN', qty: 2, category: 'fraldas', image: 'assets/gifts/fraldas-rn.webp?v=12.1', description: 'Para os primeiros dias do Benício.' },
  { id: 'fraldas-p', name: 'Fralda P', qty: 16, category: 'fraldas', image: 'assets/gifts/fraldas-p.webp?v=12.1', description: 'As pequenas grandes aliadas da rotina.' },
  { id: 'fraldas-m', name: 'Fralda M', qty: 28, category: 'fraldas', image: 'assets/gifts/fraldas-m.webp?v=12.1', description: 'O verdadeiro investimento a longo prazo. O papai já pensou em comprar ações de fraldas. 📈😂' },
  { id: 'fraldas-g', name: 'Fralda G', qty: 20, category: 'fraldas', image: 'assets/gifts/fraldas-g.webp?v=12.1', description: 'Porque o Benício vai crescer rapidinho.' },
  { id: 'fraldas-xg', name: 'Fralda XG', qty: 10, category: 'fraldas', image: 'assets/gifts/fraldas-xg.webp?v=12.1', description: 'Prevenção é tudo, principalmente com fraldas.' },
  { id: 'lencos', name: 'Kit de lenços umedecidos', qty: 30, category: 'higiene', image: 'assets/gifts/lencos.webp?v=12.1', description: 'Kit de lenços umedecidos para o cuidado diário. Uma unidade reservada corresponde a um kit.' },
  { id: 'pomada', name: 'Kit de pomadas para assaduras', qty: 10, category: 'higiene', image: 'assets/gifts/pomada.webp?v=12.1', description: 'Kit de pomadas para proteger a pele do Benício. Uma unidade reservada corresponde a um kit.' },
  { id: 'sabonete', name: 'Kit de sabonetes líquidos', qty: 10, category: 'higiene', image: 'assets/gifts/sabonete.webp?v=12.1', description: 'Kit para os banhos cheirosos do pequeno. Uma unidade reservada corresponde a um kit.' },
  { id: 'shampoo', name: 'Kit de shampoo infantil', qty: 6, category: 'higiene', image: 'assets/gifts/shampoo.webp?v=12.1', description: 'Kit de shampoo suave para a rotina do bebê. Uma unidade reservada corresponde a um kit.' },
  { id: 'escova-pente', name: 'Kit escova e pente', qty: 2, category: 'higiene', image: 'assets/gifts/escova-pente.webp?v=12.1', description: 'Para o cabelo do Benício ficar sempre no capricho. Uma unidade reservada corresponde a um kit.' },
  { id: 'kit-unhas', name: 'Kit de cuidados para unhas', qty: 2, category: 'higiene', image: 'assets/gifts/kit-unhas.webp?v=12.1', description: 'Cortador, lixa e acessórios apropriados para as unhas delicadas do bebê. Uma unidade reservada corresponde a um kit.' },
  { id: 'bodies-p', name: 'Kit de bodies tamanho P', qty: 2, category: 'roupinhas', image: 'assets/gifts/bodies-p.webp?v=12.1', description: 'Conforto para muitos abraços. Tamanho P. Uma unidade reservada corresponde a um kit.' },
  { id: 'bodies-m', name: 'Kit de bodies tamanho M', qty: 4, category: 'roupinhas', image: 'assets/gifts/bodies-m.webp?v=12.1', description: 'Conforto para muitos abraços. Tamanho M. Uma unidade reservada corresponde a um kit.' },
  { id: 'bodies-g', name: 'Kit de bodies tamanho G', qty: 2, category: 'roupinhas', image: 'assets/gifts/bodies-g.webp?v=12.1', description: 'Conforto para muitos abraços. Tamanho G. Uma unidade reservada corresponde a um kit.' },
  { id: 'macacao-p', name: 'Macacão tamanho P', qty: 2, category: 'roupinhas', image: 'assets/gifts/macacao-p.webp?v=12.1', description: 'Fofura garantida para o enxoval. Tamanho P.' },
  { id: 'macacao-m', name: 'Macacão tamanho M', qty: 4, category: 'roupinhas', image: 'assets/gifts/macacao-m.webp?v=12.1', description: 'Fofura garantida para o enxoval. Tamanho M.' },
  { id: 'macacao-g', name: 'Macacão tamanho G', qty: 2, category: 'roupinhas', image: 'assets/gifts/macacao-g.webp?v=12.1', description: 'Fofura garantida para o enxoval. Tamanho G.' },
  { id: 'calcas-mijao', name: 'Kit de calças mijão', qty: 6, category: 'roupinhas', image: 'assets/gifts/calcas-mijao.webp?v=12.1', description: 'Conforto e praticidade para as trocas do dia a dia. Uma unidade reservada corresponde a um kit.' },
  { id: 'meias', name: 'Kit de meias para bebê', qty: 4, category: 'roupinhas', image: 'assets/gifts/meias.webp?v=12.1', description: 'Para manter os pezinhos do Benício aquecidos. Uma unidade reservada corresponde a um kit.' },
  { id: 'saida-maternidade', name: 'Saída de maternidade', qty: 2, category: 'roupinhas', image: 'assets/gifts/saida-maternidade.webp?v=12.1', description: 'Um conjunto especial para os primeiros momentos fora da maternidade.' },
  { id: 'manta', name: 'Manta para bebê', qty: 6, category: 'banho', image: 'assets/gifts/manta.webp?v=12.1', description: 'Um abraço quentinho em forma de manta.' },
  { id: 'toalha', name: 'Toalha com capuz', qty: 10, category: 'banho', image: 'assets/gifts/toalha.webp?v=12.1', description: 'Para sair do banho parecendo um mini ursinho.' },
  { id: 'paninhos', name: 'Kit de paninhos de boca', qty: 12, category: 'banho', image: 'assets/gifts/paninhos.webp?v=12.1', description: 'Nunca é demais. Nunca mesmo. Uma unidade reservada corresponde a um kit.' },
  { id: 'lencol', name: 'Jogo de lençol para berço', qty: 6, category: 'banho', image: 'assets/gifts/lencol.webp?v=12.1', description: 'Mais conforto para o soninho do Benício.' },
  { id: 'fraldas-pano', name: 'Kit de fraldas de pano', qty: 6, category: 'banho', image: 'assets/gifts/fraldas-pano.webp?v=12.1', description: 'Panos versáteis para os cuidados do bebê. Uma unidade reservada corresponde a um kit.' },
  { id: 'cueiros', name: 'Kit de cueiros de algodão', qty: 4, category: 'banho', image: 'assets/gifts/cueiros.webp?v=12.1', description: 'Algodão macio para aconchegar o pequeno. Uma unidade reservada corresponde a um kit.' },
  { id: 'babadores', name: 'Kit de babadores', qty: 4, category: 'banho', image: 'assets/gifts/babadores.webp?v=12.1', description: 'Para o pequeno experimentar os primeiros sabores sem transformar tudo em lavanderia. 😂 Uma unidade reservada corresponde a um kit.' },
  { id: 'protetor-colchao', name: 'Protetor impermeável para colchão', qty: 2, category: 'banho', image: 'assets/gifts/protetor-colchao.webp?v=12.1', description: 'Uma camada extra de proteção para o colchão do berço.' },
  { id: 'mamadeira', name: 'Mamadeira', qty: 2, category: 'acessorios', image: 'assets/baby-bottle.webp?v=12.1', description: 'Um clássico que ajuda muito na rotina.' },
  { id: 'bolsa-maternidade', name: 'Bolsa maternidade', qty: 1, category: 'acessorios', image: 'assets/gifts/bolsa-maternidade.webp?v=12.1', description: 'Para levar os itens essenciais do Benício aonde ele for.' },
  { id: 'banheira', name: 'Banheira', qty: 1, category: 'especiais', image: 'assets/gifts/banheira.webp?v=12.1', description: 'Banho gostoso e muito cuidado.' },
  { id: 'trocador', name: 'Trocador', qty: 1, category: 'especiais', image: 'assets/gifts/trocador.webp?v=12.1', description: 'O palco oficial das trocas de fraldas mais radicais. O papai já está em treinamento. 😅' },
  { id: 'berco', name: 'Berço', qty: 1, category: 'especiais', image: 'assets/crib.webp?v=12.1', description: 'Onde vão nascer muitos soninhos tranquilos.' },
  { id: 'colchao-berco', name: 'Colchão para berço', qty: 1, category: 'especiais', image: 'assets/gifts/colchao-berco.webp?v=12.1', description: 'Conforto para o berço e para os soninhos do Benício.' },
  { id: 'carrinho', name: 'Carrinho de bebê', qty: 1, category: 'especiais', image: 'assets/gifts/carrinho.webp?v=12.1', description: 'O primeiro carro do Benício. Pelo menos esse não paga IPVA. 🚗😂' },
  { id: 'bebe-conforto', name: 'Bebê conforto', qty: 1, category: 'especiais', image: 'assets/gifts/bebe-conforto.webp?v=12.1', description: 'O banco VIP do Benício. Nenhuma carona será autorizada sem o motorista papai. 💙' },
  { id: 'comoda', name: 'Cômoda para bebê', qty: 1, category: 'especiais', image: 'assets/gifts/comoda.webp?v=12.1', description: 'Para guardar as roupinhas do príncipe... e os conjuntos que a mamãe jurou que não ia comprar. 😂' },
  { id: 'ps5-pro', name: 'PS5 Pro', qty: 1, category: 'especiais', image: 'assets/gifts/ps5-pro.webp?v=12.1', description: 'O papai disse que desenvolve coordenação motora. A mamãe pediu referências científicas. 🎮😂', isJoke: true }
];

const state = {
  gifts: GIFTS.map(item => ({ ...item, reserved: 0 })),
  selection: Object.fromEntries(GIFTS.map(item => [item.id, 1])),
  selectedId: null,
  lastGuestName: '',
  busy: false,
  rsvpBusy: false,
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
  const target = path.startsWith('gifts?') ? '/api/gifts'
    : path === 'rpc/reserve_gift' ? '/api/reserve-gift'
    : path === 'rpc/confirm_rsvp' ? '/api/confirm-rsvp' : null;
  if (!target) throw new Error('Serviço não reconhecido.');
  let response;
  try {
    response = await fetch(target, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: payload === undefined ? undefined : JSON.stringify(
        target === '/api/reserve-gift'
          ? { giftId: payload.p_gift_id, name: payload.p_guest_name, quantity: payload.p_quantity }
          : target === '/api/confirm-rsvp'
            ? { name: payload.p_guest_name, phone: payload.p_guest_phone,
                guestsCount: payload.p_guests_count, message: payload.p_message,
                reminderOptIn: payload.p_reminder_opt_in }
            : payload
      )
    });
  } catch { throw new Error('Sem conexão. Confira sua internet e tente novamente.'); }
  const result = await response.json().catch(() => null);
  if (!response.ok) throw new Error(result?.error || 'Não conseguimos concluir agora. Tente novamente.');
  return result;
}

function normalizeBrazilPhone(value) {
  let digits = String(value || '').replace(/\D/g, '');
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) digits = digits.slice(2);
  if (!/^[1-9][0-9]{9,10}$/.test(digits)) return null;
  return '55' + digits;
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
  // No banner in preview mode. If a configured database fails, warn visitors.
  node.hidden = !DATABASE_READY || state.online;
  node.textContent = 'Não foi possível atualizar os presentes. Reservas ficam bloqueadas até a conexão voltar.';
}

const GIFT_CATEGORY_LABELS = {'fraldas': '🍼 Fraldas', 'higiene': '🧴 Higiene e cuidados', 'roupinhas': '👕 Roupinhas', 'banho': '🛁 Banho e enxoval', 'acessorios': '🎒 Acessórios', 'especiais': '🎁 Presentes especiais'};

function renderGifts() {
  let currentCategory = null;
  const html = state.gifts.map(gift => {
    const categoryHeading = gift.category !== currentCategory ? `<h3 id="categoria-${gift.category}" class="gift-category-heading">${escapeHtml(GIFT_CATEGORY_LABELS[gift.category] || gift.category)}</h3>` : "";
    currentCategory = gift.category;
    const left = Math.max(0, gift.qty - gift.reserved);
    const full = left === 0;
    const selected = full ? 0 : clamp(state.selection[gift.id] || 1, 1, left);
    state.selection[gift.id] = selected;
    const availability = `${left} ${left === 1 ? 'disponível' : 'disponíveis'}`;

    return `${categoryHeading}
      <article data-gift-id="${gift.id}" class="gift-card ${full ? 'is-full' : ''} ${gift.isJoke ? 'is-joke' : ''}">
        <div class="gift-image-wrap">
          <img src="${gift.image}" alt="${escapeHtml(gift.name)}" class="gift-image" loading="lazy" decoding="async">
        </div>
        <h3>${escapeHtml(gift.name)}</h3>
        <p class="gift-stock">${availability}</p>
        ${full ? '<p class="gift-no-stock" role="status">Indisponível</p>' : `<div class="gift-counter" aria-label="Quantidade para reservar de ${escapeHtml(gift.name)}">
          <button type="button" class="qty-btn" data-action="minus" data-gift-id="${gift.id}" ${selected <= 1 ? 'disabled' : ''} aria-label="Diminuir quantidade de ${escapeHtml(gift.name)}">−</button>
          <strong>${selected}</strong>
          <button type="button" class="qty-btn" data-action="plus" data-gift-id="${gift.id}" ${selected >= left ? 'disabled' : ''} aria-label="Aumentar quantidade de ${escapeHtml(gift.name)}">+</button>
        </div>`}
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
  if (left === 0) return;
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
  $('#giftGuestName').value = $('#rsvpName').value.trim() || state.lastGuestName;
  setFeedback($('#giftFeedback'), '');
  const modalNote = document.querySelector('.modal-note');
  if (modalNote) modalNote.textContent = DATABASE_READY ? 'Ao confirmar, esta quantidade ficará indisponível para os outros convidados.' : 'Prévia: esta reserva será salva apenas neste aparelho, não para outros convidados.';

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
      const saved = await supabaseRequest('rpc/reserve_gift', 'POST', {
        p_gift_id: gift.id,
        p_guest_name: name,
        p_quantity: quantity
      });
      // Show the server-confirmed quantity immediately, then reconcile the full catalog.
      if (Number.isInteger(Number(saved?.remaining)) && Number(saved.remaining) >= 0) {
        const remaining = Number(saved.remaining);
        gift.reserved = Math.max(0, gift.qty - remaining);
        renderGifts();
      }
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

    state.lastGuestName = name;
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
  if (state.rsvpBusy) return;
  const name = $('#rsvpName').value.trim().replace(/\s+/g, ' ');
  const message = $('#rsvpMessage').value.trim();
  const guestsCount = Number($('#rsvpGuests').value);
  const phone = normalizeBrazilPhone($('#rsvpPhone').value);
  const reminderOptIn = $('#rsvpReminderOptIn').checked;
  const feedback = $('#rsvpFeedback');

  if (name.length < 2 || name.length > 80 || !phone || message.length > 300 || !Number.isInteger(guestsCount) || guestsCount < 1 || guestsCount > 15) {
    setFeedback(feedback, 'Confira os dados antes de enviar.', true);
    return;
  }

  state.rsvpBusy = true;
  const button = $('#rsvpSubmit');
  button.disabled = true;
  button.innerHTML = 'Enviando...';

  try {
    let existing = false;
    if (DATABASE_READY) {
      const savedRsvp = await supabaseRequest('rpc/confirm_rsvp', 'POST', {
        p_guest_name: name,
        p_attending: true,
        p_guest_phone: phone,
        p_guests_count: guestsCount,
        p_message: message,
        p_reminder_opt_in: reminderOptIn
      });
      existing = savedRsvp?.updated === true;
    } else {
      const entries = readDemo(DEMO_RSVP_KEY, []);
      entries.push({ name, guestsCount, message, at: new Date().toISOString() });
      writeDemo(DEMO_RSVP_KEY, entries);
    }

    setFeedback(feedback, DATABASE_READY
      ? (existing ? 'Sua confirmação foi atualizada! 💙' : 'Presença confirmada! Vai ser lindo ter você com a gente. 💙')
      : 'Confirmação de demonstração salva somente neste navegador.');
    toast(DATABASE_READY ? (existing ? 'Sua presença foi atualizada 💙' : 'Presença confirmada com carinho 💙') : 'Simulação salva neste navegador.');
    $('#rsvpForm').reset();
  } catch (error) {
    setFeedback(feedback, error.message || 'Não foi possível enviar sua confirmação.', true);
  } finally {
    state.rsvpBusy = false;
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
