/* script.js - Versão FINAL e comentada
   - Completo e organizado
   - Lista (sem paginação), busca, filtros
   - Produto individual (galeria, miniaturas, zoom, buy now)
   - SEO dinâmico (title, meta, og, canonical, JSON-LD)
   - Carrinho (localStorage), frete simulado, parcelas
   - Lazy-load por IntersectionObserver
   - Compatível com produto.html?id=X
*/

(() => {
  'use strict';

  /* =========================
     CONFIG
     ========================= */
  const WHATSAPP_NUMBER = '5599999999999';
  const CART_KEY = 'loja_cart_v2';
  const SITE_NAME = 'ATR MUNDIAL';
  const SITE_URL = 'https://meusite.com.br'; // ajuste se necessário
  window.ORIGEM_CEP = window.ORIGEM_CEP || '01001000';

  /* =========================
     DADOS (produtos)
     - Edite/adicione produtos aqui
     ========================= */
  const PRODUCTS = [
    { id:1, name:'Relógio Dom Pedro Primeiro', category:'premium', price:150000.00, priceLabel:'R$ 150,00', img:'imagens/10.png',
      images:["imagens/10.png","imagens/01.jpeg","imagens/02.jpeg","imagens/03.jpeg","imagens/04.jpeg"],
      description:'Relógio clássico em edição limitada. Caixa em ouro, mostrador gravado.',
      pesoKg:0.35, sku:'RDPP-001', specs:{Material:'Ouro',Movimento:'Automático',Diâmetro:'42mm'} },

    { id:2, name:'Relógio Dom Pedro Segundo', category:'premium', price:350000.00, priceLabel:'R$ 350.000,00', img:'imagens/09.png',
      images:["imagens/09.png","imagens/01.jpeg","imagens/02.jpeg","imagens/03.jpeg","imagens/04.jpeg"],
      description:'Relógio premium com movimento automático e bracelete em couro.',
      pesoKg:0.45, sku:'RDPS-002', specs:{Material:'Aço',Movimento:'Automático',Diâmetro:'44mm'} },

    { id:3, name:'Relógio do Cabeça', category:'casual', price:1.99, priceLabel:'R$ 1,99', img:'imagens/01.jpeg',
      images:["imagens/01.jpeg","imagens/02.jpeg","imagens/03.jpeg"],
      description:'Relógio simples, resistente para uso diário.',
      pesoKg:0.08, sku:'RDC-003', specs:{Material:'Plástico',Movimento:'Quartz',Diâmetro:'36mm'} },

    { id:4, name:'Relógio do Lula', category:'esportivo', price:13.00, priceLabel:'R$ 13,00', img:'imagens/02.jpeg',
      images:["imagens/02.jpeg","imagens/03.jpeg"],
      description:'Relógio esportivo com resistência à água.',
      pesoKg:0.12, sku:'RDL-004', specs:{Resistência:'5ATM',Movimento:'Quartz',Diâmetro:'40mm'} },

    { id:5, name:'Relógio do Capitão', category:'relógio', price:171.00, priceLabel:'R$ 171,00', img:'imagens/03.jpeg',
      images:["imagens/03.jpeg","imagens/04.jpeg"],
      description:'Relógio robusto, perfeito para atividades externas.',
      pesoKg:0.22, sku:'RDCAP-005', specs:{Material:'Aço',Movimento:'Quartz',Diâmetro:'43mm'} },

    { id:6, name:'Relógio do Jardel', category:'casual', price:16.00, priceLabel:'R$ 16,00', img:'imagens/06.jpeg',
      images:["imagens/06.jpeg","imagens/07.jpeg"],
      description:'Relógio casual com bom custo-benefício.',
      pesoKg:0.18, sku:'RDJ-006', specs:{Material:'Aço',Movimento:'Quartz',Diâmetro:'38mm'} },

    { id:7, name:'Relógio do Ardel', category:'casual', price:16.00, priceLabel:'R$ 16,00', img:'imagens/07.jpeg',
      images:["imagens/07.jpeg","imagens/06.jpeg"],
      description:'Relógio casual com bom custo-benefício.',
      pesoKg:0.18, sku:'RDA-007', specs:{Material:'Aço',Movimento:'Quartz',Diâmetro:'38mm'} },
      
      { id:8, name:'Relógio do Brasil', category:'casual', price:26.00, priceLabel:'R$ 26,00', img:'imagens/09.jpeg',
      images:["imagens/07.jpeg","imagens/06.jpeg"],
      description:'Relógio casual com bom custo-benefício.',
      pesoKg:0.18, sku:'RDA-007', specs:{Material:'Aço',Movimento:'Quartz',Diâmetro:'38mm'} }
      
  ];

  /* =========================
     UTILITÁRIOS
     ========================= */
  const formatBRL = n => Number(n || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const escapeHtml = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const safeParseJSON = s => { try { return JSON.parse(s); } catch { return null; } };

  /* =========================
     DOM REFS (index)
     ========================= */
  const grid = document.getElementById('prodGrid');
  const searchInput = document.getElementById('searchInput');
  const emptyState = document.getElementById('emptyState');
  const resultMeta = document.getElementById('resultMeta');

  /* =========================
     CARRINHO (localStorage)
     ========================= */
  function getCart(){
    const raw = localStorage.getItem(CART_KEY);
    const parsed = safeParseJSON(raw);
    return Array.isArray(parsed) ? parsed : [];
  }
  function saveCart(cart){
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartUI();
  }
  function addToCart(productId, qty = 1){
    const product = PRODUCTS.find(p => p.id === productId);
    if(!product) return;
    const cart = getCart();
    const found = cart.find(i => i.id === productId);
    if(found) found.qty = Math.max(1, found.qty + qty);
    else cart.push({ id: product.id, name: product.name, price: product.price, qty });
    saveCart(cart);
  }
  function removeFromCart(productId){
    const cart = getCart().filter(i => i.id !== productId);
    saveCart(cart);
  }
  function updateCartUI(){
    const panel = document.getElementById('cartPanel');
    const cartItemsEl = document.getElementById('cartItems');
    const cartCountEl = document.getElementById('cartCount');
    const cartTotalEl = document.getElementById('cartTotal');
    if(!panel || !cartItemsEl || !cartCountEl || !cartTotalEl) return;

    const cart = getCart();
    cartItemsEl.innerHTML = '';
    if(cart.length === 0){
      cartItemsEl.innerHTML = '<div>Seu carrinho está vazio.</div>';
      cartCountEl.textContent = '0';
      cartTotalEl.textContent = 'Total: R$ 0,00';
      return;
    }

    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <div>Qtd: ${item.qty}</div>
        </div>
        <div style="text-align:right">
          ${formatBRL(item.price * item.qty)}
          <br>
          <button class="small" data-remove="${item.id}" aria-label="Remover ${escapeHtml(item.name)}">Remover</button>
        </div>
      `;
      cartItemsEl.appendChild(itemEl);
    });

    cartCountEl.textContent = cart.reduce((s,i) => s + i.qty, 0);
    cartTotalEl.textContent = `Total: ${formatBRL(total)}`;
  }

  /* =========================
     LAZY-LOAD (IntersectionObserver)
     ========================= */
  let observer = null;
  function setupObserver(){
    if(observer) return;
    observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          const img = e.target;
          if(img.dataset.src){
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          obs.unobserve(img);
        }
      });
    }, { root: null, rootMargin: '150px', threshold: 0.01 });
  }
  function initLazy(){
    setupObserver();
    document.querySelectorAll('img.lazy').forEach(img => observer.observe(img));
  }

  /* =========================
     RENDER LISTA (INDEX) - sem paginação
     ========================= */
  let currentList = [...PRODUCTS];

  function renderList(list = currentList){
    if(!grid) return;
    grid.innerHTML = '';

    if(!list || list.length === 0){
      if(emptyState) emptyState.hidden = false;
      if(resultMeta) resultMeta.textContent = '0 produtos encontrados';
      return;
    }
    if(emptyState) emptyState.hidden = true;

    list.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('tabindex','0');

      const href = `produto.html?id=${encodeURIComponent(p.id)}`;

      // anchor with image and title
      const a = document.createElement('a');
      a.href = href;
      a.className = 'card-link';
      a.style.display = 'block';
      a.style.color = 'inherit';
      a.style.textDecoration = 'none';
      a.innerHTML = `
        <div class="zoom-wrapper">
          <img data-src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" class="lazy" loading="lazy">
        </div>
        <div class="card-body">
          <strong>${escapeHtml(p.name)}</strong>
        </div>
      `;

      const actions = document.createElement('div');
      actions.className = 'card-actions';
      actions.innerHTML = `
        <div class="meta" style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:0 14px 14px;">
          <div class="price">${escapeHtml(p.priceLabel || formatBRL(p.price))}</div>
          <div><button class="btn small" data-add="${p.id}" aria-label="Adicionar ${escapeHtml(p.name)}">Adicionar</button></div>
        </div>
      `;

      card.appendChild(a);
      card.appendChild(actions);

      // keyboard Enter opens product
      card.addEventListener('keydown', ev => {
        if(ev.key === 'Enter'){
          if(document.activeElement && document.activeElement.closest && document.activeElement.closest('button')) return;
          window.location.href = href;
        }
      });

      grid.appendChild(card);
    });

    if(resultMeta) resultMeta.textContent = `${list.length} produto(s) encontrado(s)`;
    initLazy();
  }

  /* =========================
     BUSCA / FILTROS
     ========================= */
  function applySearch(q){
    q = (q||'').trim().toLowerCase();
    if(!q) return PRODUCTS.slice();
    return PRODUCTS.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q)
    );
  }

  /* =========================
     EVENTOS GLOBAIS (adicionar/remover)
     ========================= */
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-add]');
    if(addBtn){
      e.stopPropagation();
      const id = Number(addBtn.dataset.add);
      addToCart(id, 1);
      return;
    }
    const rm = e.target.closest('[data-remove]');
    if(rm){
      const id = Number(rm.dataset.remove);
      removeFromCart(id);
      return;
    }
  });

  /* =========================
     FABs e botões fixos
     ========================= */
  const cartFab = document.getElementById('cartFab');
  if(cartFab){
    cartFab.addEventListener('click', () => {
      const panel = document.getElementById('cartPanel');
      if(!panel) return;
      const visible = panel.getAttribute('aria-hidden') === 'false';
      panel.setAttribute('aria-hidden', visible ? 'true' : 'false');
      updateCartUI();
      setTimeout(()=>{ mostrarFreteNoResumoCarrinho(); }, 120);
    });
  }
  const closeCartBtn = document.getElementById('closeCart');
  if(closeCartBtn) closeCartBtn.addEventListener('click', () => document.getElementById('cartPanel').setAttribute('aria-hidden','true'));
  const waFab = document.getElementById('waFab');
  if(waFab) waFab.addEventListener('click', () => window.open(`https://wa.me/${WHATSAPP_NUMBER}`));
  const checkoutBtn = document.getElementById('checkoutBtn');
  if(checkoutBtn){
    checkoutBtn.addEventListener('click', ()=> {
      const cart = getCart();
      if(cart.length === 0){ alert('Seu carrinho está vazio.'); return; }
      const itemsTxt = cart.map(i => `${i.qty}x ${i.name} - ${formatBRL(i.price)} (${formatBRL(i.price * i.qty)})`).join('\n');
      const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
      const msg = `Olá! Gostaria de comprar:\n${itemsTxt}\n\nTotal: ${formatBRL(total)}\n\nNome: \nTelefone: \nCEP para envio: \nEndereço (opcional): `;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
    });
  }

  /* =========================
     FRETE SIMULADO (FRONT-END)
     ========================= */
  const FRETE_CONFIG = {
    origemCEP: window.ORIGEM_CEP || '01001000',
    freteGratisAcima: 1000.00,
    tabela: {
      sul:    { label:'Sul',        valores:[15, 20, 30, 55, 90], prazos:[2,3,4,6,8] },
      sudeste:{ label:'Sudeste',    valores:[12, 18, 28, 50, 85], prazos:[1,2,3,5,7] },
      centrooeste:{ label:'Centro-Oeste', valores:[18,24,35,60,100], prazos:[3,4,5,7,9] },
      nordeste:{ label:'Nordeste',  valores:[20,28,40,70,120], prazos:[4,5,6,8,10] },
      norte:  { label:'Norte',      valores:[30,40,60,110,180], prazos:[6,7,9,12,15] }
    },
    servicosLabels: { pac:'PAC (simulado)', sedex:'SEDEX (simulado)' }
  };

  function detectRegionFromCep(cep){
    if(!cep || typeof cep !== 'string') return 'sudeste';
    const firstTwo = parseInt(cep.slice(0,2),10);
    if(firstTwo >= 0 && firstTwo <= 19) return 'sudeste';
    if(firstTwo >= 20 && firstTwo <= 29) return 'sudeste';
    if(firstTwo >= 30 && firstTwo <= 39) return 'sudeste';
    if(firstTwo >= 40 && firstTwo <= 49) return 'nordeste';
    if(firstTwo >= 50 && firstTwo <= 59) return 'nordeste';
    if(firstTwo >= 60 && firstTwo <= 66) return 'nordeste';
    if(firstTwo >= 67 && firstTwo <= 69) return 'norte';
    if(firstTwo >= 70 && firstTwo <= 79) return 'centrooeste';
    if(firstTwo >= 80 && firstTwo <= 89) return 'sul';
    if(firstTwo >= 90 && firstTwo <= 99) return 'sul';
    return 'sudeste';
  }

  function calculaPesoTotalCarrinho(){
    const cart = getCart();
    return cart.reduce((s,i)=>{
      const prod = PRODUCTS.find(p=>p.id===i.id);
      const peso = prod && prod.pesoKg ? Number(prod.pesoKg) : 0.2;
      return s + peso * i.qty;
    }, 0);
  }

  function faixaIndexPorPeso(peso){
    if(peso <= 0.5) return 0;
    if(peso <= 1) return 1;
    if(peso <= 2) return 2;
    if(peso <= 5) return 3;
    return 4;
  }

  function calcularFreteLocalPorRegiaoEPeso(regionKey, pesoKg, valorPedido=0){
    const tabela = FRETE_CONFIG.tabela[regionKey] || FRETE_CONFIG.tabela.sudeste;
    const idx = faixaIndexPorPeso(pesoKg);
    const pacValor = tabela.valores[idx];
    const pacPrazo = tabela.prazos[idx];
    const sedexValor = Math.round(pacValor * 1.6);
    const sedexPrazo = Math.max(1, pacPrazo - 1);

    if(FRETE_CONFIG.freteGratisAcima > 0 && valorPedido >= FRETE_CONFIG.freteGratisAcima){
      return [
        {codigo:'PAC', label:FRETE_CONFIG.servicosLabels.pac, valor:0, prazo:pacPrazo, faixa:idx},
        {codigo:'SEDEX', label:FRETE_CONFIG.servicosLabels.sedex, valor:0, prazo:sedexPrazo, faixa:idx}
      ];
    }

    return [
      {codigo:'PAC', label:FRETE_CONFIG.servicosLabels.pac, valor:pacValor, prazo:pacPrazo, faixa:idx},
      {codigo:'SEDEX', label:FRETE_CONFIG.servicosLabels.sedex, valor:sedexValor, prazo:sedexPrazo, faixa:idx}
    ];
  }

  function mostrarResultadoFrete(containerEl, opcoes){
    if(!containerEl) return;
    if(!opcoes || !opcoes.length) { containerEl.innerHTML = 'Sem opções de frete.'; return; }
    containerEl.innerHTML = opcoes.map(o => {
      const v = Number(o.valor);
      const valorStr = v === 0 ? 'Grátis' : formatBRL(v);
      return `<div class="frete-option" data-codigo="${escapeHtml(o.codigo)}"><strong>${escapeHtml(o.label)}</strong> — ${valorStr} — prazo: ${escapeHtml(String(o.prazo))} dia(s)</div>`;
    }).join('');
  }

  function initFreteHooksOnProduct(){
    const btn = document.getElementById('calcFreteBtn');
    const cepInput = document.getElementById('cepInput');
    const freteResult = document.getElementById('freteResult');
    if(!btn || !cepInput || !freteResult) return;
    btn.addEventListener('click', ()=> {
      const cep = cepInput.value.replace(/\D/g,'');
      if(!cep || cep.length !== 8){ freteResult.textContent = 'Informe um CEP válido (8 dígitos).'; return; }
      const region = detectRegionFromCep(cep);
      const regionLabel = FRETE_CONFIG.tabela[region].label || region;
      freteResult.innerHTML = `Região estimada: <strong>${escapeHtml(regionLabel)}</strong> — calculando...`;

      const pesoTotal = calculaPesoTotalCarrinho() || 0.2;
      const cartValue = getCart().reduce((s,i)=>s + (i.price * i.qty), 0);
      const opcoes = calcularFreteLocalPorRegiaoEPeso(region, pesoTotal, cartValue);
      mostrarResultadoFrete(freteResult, opcoes);

      const seletor = document.createElement('div');
      seletor.style.marginTop = '8px';
      seletor.innerHTML = 'Se sua região estiver errada, escolha: ' +
        Object.keys(FRETE_CONFIG.tabela).map(k=>`<button class="small frete-region-btn" data-region="${k}">${escapeHtml(FRETE_CONFIG.tabela[k].label)}</button>`).join(' ');
      freteResult.appendChild(seletor);

      freteResult.querySelectorAll('.frete-region-btn').forEach(b=> b.addEventListener('click', ()=> {
        const regio = b.dataset.region;
        const novas = calcularFreteLocalPorRegiaoEPeso(regio, pesoTotal, cartValue);
        mostrarResultadoFrete(freteResult, novas);
      }));
    });
  }

  function mostrarFreteNoResumoCarrinho(){
    const panel = document.getElementById('cartPanel');
    if(!panel) return;
    let el = panel.querySelector('#cartFreteSummary');
    if(!el){
      el = document.createElement('div');
      el.id = 'cartFreteSummary';
      el.style.marginTop = '8px';
      el.style.fontSize = '14px';
      panel.querySelector('.cart-footer').insertAdjacentElement('beforebegin', el);
    }
    const cepInput = document.getElementById('cepInput');
    if(!cepInput) { el.textContent = 'Calcule o frete na página do produto.'; return; }
    const cep = cepInput.value.replace(/\D/g,'');
    if(!cep || cep.length !== 8){ el.textContent = 'CEP inválido para cálculo de frete.'; return; }
    const region = detectRegionFromCep(cep);
    const peso = calculaPesoTotalCarrinho();
    const cartValue = getCart().reduce((s,i)=>s + (i.price * i.qty), 0);
    const opcoes = calcularFreteLocalPorRegiaoEPeso(region, peso, cartValue);
    el.innerHTML = '<strong>Frete estimado:</strong>';
    mostrarResultadoFrete(el, opcoes);
  }

  function initFreteIntegration(){
    initFreteHooksOnProduct();
    if(cartFab){
      cartFab.addEventListener('click', ()=> { setTimeout(()=>{ mostrarFreteNoResumoCarrinho(); }, 120); });
    }
  }

  /* =========================
     ZOOM MODAL (produto)
     ========================= */
  (function initZoomModal(){
    const modal = document.createElement('div');
    modal.className = 'zoom-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:9999;visibility:hidden;opacity:0;transition:opacity .18s';
    modal.innerHTML = `<button class="zoom-close" aria-label="Fechar zoom" style="position:absolute;right:18px;top:18px;background:#fff;border-radius:999px;padding:6px 8px;border:none;cursor:pointer">×</button><img alt="zoom image" src="" style="max-width:90%;max-height:90%;cursor:grab;transform-origin:center center;transition:transform .05s">`;
    document.body.appendChild(modal);
    const img = modal.querySelector('img');
    const btn = modal.querySelector('.zoom-close');

    let scale = 1, isDown=false, startX=0, startY=0, translateX=0, translateY=0;

    function openZoom(src){
      scale = 1; translateX = 0; translateY = 0;
      img.src = src;
      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      img.style.transform = `translate(0px,0px) scale(1)`;
    }
    function closeZoom(){ modal.style.opacity = '0'; setTimeout(()=>{ modal.style.visibility = 'hidden'; }, 190); }

    btn.addEventListener('click', closeZoom);
    modal.addEventListener('click', (e)=>{ if(e.target === modal) closeZoom(); });

    modal.addEventListener('wheel', (e)=> {
      e.preventDefault();
      const delta = -e.deltaY;
      const zoomFactor = delta > 0 ? 1.12 : 0.9;
      scale = Math.max(1, Math.min(6, scale * zoomFactor));
      img.style.transform = `translate(${translateX}px,${translateY}px) scale(${scale})`;
    }, { passive:false });

    img.addEventListener('pointerdown', (e)=> {
      isDown = true;
      startX = e.clientX; startY = e.clientY;
      img.setPointerCapture && img.setPointerCapture(e.pointerId);
      img.style.cursor = 'grabbing';
    });
    img.addEventListener('pointermove', (e)=> {
      if(!isDown) return;
      const dx = e.clientX - startX; const dy = e.clientY - startY;
      translateX += dx; translateY += dy;
      startX = e.clientX; startY = e.clientY;
      img.style.transform = `translate(${translateX}px,${translateY}px) scale(${scale})`;
    });
    img.addEventListener('pointerup', (e)=> { isDown=false; img.style.cursor='grab'; try{ img.releasePointerCapture && img.releasePointerCapture(e.pointerId); }catch(_){} });

    window.openZoom = openZoom;
  })();

  /* =========================
     SEO HELPERS (meta/og/canonical/jsonld)
     ========================= */
  function ensureMeta(nameOrProp, isProp = false){
    if(isProp){
      const sel = `meta[property="${nameOrProp}"]`;
      let m = document.head.querySelector(sel);
      if(!m){ m = document.createElement('meta'); m.setAttribute('property', nameOrProp); document.head.appendChild(m); }
      return m;
    } else {
      const sel = `meta[name="${nameOrProp}"]`;
      let m = document.head.querySelector(sel);
      if(!m){ m = document.createElement('meta'); m.setAttribute('name', nameOrProp); document.head.appendChild(m); }
      return m;
    }
  }
  function ensureLinkRel(rel){
    let l = document.head.querySelector(`link[rel="${rel}"]`);
    if(!l){ l = document.createElement('link'); l.setAttribute('rel', rel); document.head.appendChild(l); }
    return l;
  }

  function absoluteUrl(path){
    if(!path) return '';
    if(path.startsWith('http://') || path.startsWith('https://')) return path;
    const p = path.startsWith('/') ? path : '/' + path;
    return SITE_URL + p;
  }

  function setSEOTagsForProduct(p){
    try {
      const title = `${p.name} — ${SITE_NAME}`;
      document.title = title;

      const desc = p.description ? (p.description.length > 160 ? p.description.slice(0,157)+'...' : p.description) : `${p.name} — ${SITE_NAME}`;
      ensureMeta('description').setAttribute('content', desc);

      ensureMeta('og:title', true).setAttribute('content', title);
      ensureMeta('og:description', true).setAttribute('content', desc);
      ensureMeta('og:site_name', true).setAttribute('content', SITE_NAME);
      const imgUrl = (p.images && p.images[0]) ? absoluteUrl(p.images[0]) : absoluteUrl(p.img);
      ensureMeta('og:image', true).setAttribute('content', imgUrl);

      const pageUrl = `${SITE_URL}/produto.html?id=${encodeURIComponent(p.id)}`;
      ensureLinkRel('canonical').setAttribute('href', pageUrl);
      ensureMeta('og:url', true).setAttribute('content', pageUrl);

      ensureMeta('twitter:card').setAttribute('content', 'summary_large_image');
      ensureMeta('twitter:title').setAttribute('content', title);
      ensureMeta('twitter:description').setAttribute('content', desc);
      ensureMeta('twitter:image').setAttribute('content', imgUrl);

      const old = document.head.querySelector('script[type="application/ld+json"][data-generated="true"]');
      if(old) old.remove();
      const json = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": p.name,
        "image": [ imgUrl ],
        "description": p.description || '',
        "sku": p.sku || String(p.id),
        "brand": { "@type": "Brand", "name": SITE_NAME },
        "offers": {
          "@type": "Offer",
          "url": pageUrl,
          "priceCurrency": "BRL",
          "price": (p.price || 0).toFixed(2),
          "availability": "https://schema.org/InStock"
        }
      };
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-generated','true');
      script.textContent = JSON.stringify(json);
      document.head.appendChild(script);

      // preload hero image for better LCP
      let preload = document.head.querySelector('link[rel="preload"][as="image"]');
      if(preload) preload.remove();
      preload = document.createElement('link');
      preload.setAttribute('rel','preload');
      preload.setAttribute('as','image');
      preload.setAttribute('href', imgUrl);
      document.head.appendChild(preload);
    } catch (err){
      console.warn('Erro ao setar tags SEO', err);
    }
  }

  /* =========================
     PRODUTO INDIVIDUAL (renderização completa)
     - procura #productPage e renderiza automaticamente
     ========================= */
  function renderProductPageIfNeeded(){
    const page = document.getElementById('productPage');
    if(!page) return;

    // extrai id da query (?id=)
    const params = new URLSearchParams(location.search);
    const rawId = params.get('id');
    const id = rawId ? Number(rawId) : null;
    const p = PRODUCTS.find(x => x.id === id);

    if(!p){
      page.innerHTML = `<div style="padding:20px;background:#fff;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.04)"><h2>Produto não encontrado</h2><p>Verifique o link ou volte à loja.</p><p><a href="index.html">← Voltar</a></p></div>`;
      document.title = `Produto não encontrado — ${SITE_NAME}`;
      ensureMeta('description').setAttribute('content', `Produto não encontrado — ${SITE_NAME}`);
      return;
    }

    // Atualiza SEO
    setSEOTagsForProduct(p);

    // Monta HTML do produto (estrutura premium)
    page.innerHTML = `
      <div class="product-gallery">
        <div class="zoom-wrapper" id="zoomWrapper">
          <img id="mainProductImg" src="${escapeHtml(p.images && p.images[0] ? p.images[0] : p.img)}" alt="${escapeHtml(p.name)}" style="width:100%;height:auto;border-radius:10px"/>
        </div>

        <div class="mini-thumbs" id="miniGallery">
          ${ (p.images && p.images.length) ? p.images.map((src, idx) => `<img src="${escapeHtml(src)}" class="${idx===0 ? 'active' : ''}" data-src="${escapeHtml(src)}" alt="${escapeHtml(p.name)}">`).join('') : '' }
        </div>
      </div>

      <div class="product-info">
        <h1 id="prodName">${escapeHtml(p.name)}</h1>
        <div class="price-row">
          <div class="price-current" id="prodPrice">${escapeHtml(p.priceLabel || formatBRL(p.price))}</div>
          ${p.price ? `<div class="price-old">${p.priceLabel ? '' : ''}</div>` : ''}
        </div>
        <p id="prodDesc">${escapeHtml(p.description || '')}</p>

        <h4>Especificações</h4>
        <table id="specTable" style="width:100%;border-collapse:collapse;margin-bottom:12px">
          ${ Object.keys(p.specs || {}).map(k => `<tr><td style="padding:6px;border-bottom:1px solid #eee;font-weight:700">${escapeHtml(k)}</td><td style="padding:6px;border-bottom:1px solid #eee">${escapeHtml((p.specs||{})[k]||'')}</td></tr>`).join('') }
        </table>

        <div>
          <label>Quantidade: <input id="qtyInput" type="number" value="1" min="1" style="width:70px"></label>
        </div>

        <div style="margin-top:12px;display:flex;gap:8px">
          <button id="addCartBtn" class="btn">Adicionar ao carrinho</button>
          <button id="buyNowBtn" class="btn">Comprar (WhatsApp)</button>
        </div>

        <h4 style="margin-top:14px">Meios de pagamento</h4>
        <div id="parcelResult" style="margin-bottom:8px"></div>

        <h4 style="margin-top:12px">Calcular frete</h4>
        <label>CEP: <input id="cepInput" placeholder="00000-000" style="margin-left:8px"></label>
        <button id="calcFreteBtn" style="margin-left:8px">Calcular</button>
        <div id="freteResult" style="margin-top:8px"></div>
      </div>
    `;

    // gallery behavior: mini -> main
    const mini = document.getElementById('miniGallery');
    if(mini){
      mini.addEventListener('click', ev => {
        const img = ev.target.closest('img');
        if(!img) return;
        const active = mini.querySelector('img.active');
        if(active) active.classList.remove('active');
        img.classList.add('active');
        const main = document.getElementById('mainProductImg');
        main.src = img.src;
      });
    }

    // add to cart
    const addBtn = document.getElementById('addCartBtn');
    if(addBtn){
      addBtn.addEventListener('click', ()=>{
        const qty = parseInt(document.getElementById('qtyInput').value) || 1;
        addToCart(p.id, qty);
        alert('Produto adicionado ao carrinho.');
      });
    }

    // buy now
    const buyBtn = document.getElementById('buyNowBtn');
    if(buyBtn){
      buyBtn.addEventListener('click', ()=> {
        const qty = parseInt(document.getElementById('qtyInput').value || 1);
        const total = p.price * qty;
        const msg = `Olá! Quero comprar ${qty}x ${p.name} - ${formatBRL(p.price)} cada. Total: ${formatBRL(total)}\nCEP para frete: \nNome: \nTelefone: \nEndereço (opcional):`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
      });
    }

    // parcelas
    const qtyInput = document.getElementById('qtyInput');
    const updateParc = ()=> {
      const qty = Number(qtyInput.value) || 1;
      showInstallments(p.price * qty);
    };
    qtyInput && qtyInput.addEventListener('input', updateParc);
    updateParc();

    // frete hooks
    initFreteHooksOnProduct();

    // zoom on main image
    const mainImg = document.getElementById('mainProductImg');
    if(mainImg){
      mainImg.addEventListener('click', ()=> {
        if(window.openZoom) window.openZoom(mainImg.src);
      });
    }

    // lazy mini thumbs + main image not necessary (main loads instantly), but init general lazy
    initLazy();
  }

  /* =========================
     PARCELAS (simples)
     ========================= */
  function calcInstallments(total, maxMonths = 12, monthlyRate = 0.0299){
    const out = [];
    for(let n=1; n<=maxMonths; n++){
      if(n === 1){
        out.push({n, parcel: total, total: total, rate: 0});
        continue;
      }
      const useInterest = (n > 3);
      if(!useInterest){
        out.push({n, parcel: total / n, total: total, rate: 0});
      } else {
        const i = monthlyRate;
        const parc = total * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
        out.push({n, parcel: parc, total: parc * n, rate: i});
      }
    }
    return out;
  }
  function showInstallments(total){
    const list = calcInstallments(total, 12, 0.0299);
    const el = document.getElementById('parcelResult');
    if(!el) return;
    el.innerHTML = list.slice(0,12).map(it => {
      const p = it.parcel.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
      return `<div>${it.n}x de ${p} ${it.rate ? `(taxa ${(it.rate*100).toFixed(2)}%/m)` : '(sem juros)'} — Total: ${it.total.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</div>`;
    }).join('');
  }

  /* =========================
     INICIALIZAÇÃO GERAL
     ========================= */
  function init(){
    // footer year
    const anoEl = document.getElementById('ano');
    if(anoEl) anoEl.textContent = new Date().getFullYear();

    // cart
    updateCartUI();

    // index listing
    if(document.getElementById('prodGrid')){
      currentList = PRODUCTS.slice();
      renderList(currentList);

      if(searchInput){
        searchInput.addEventListener('input', (ev) => {
          const q = ev.target.value || '';
          currentList = applySearch(q);
          renderList(currentList);
        });
      }

      // category buttons (if exist)
      document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          document.querySelectorAll('.menu-btn').forEach(b => b.setAttribute('aria-pressed', b === btn));
          const cat = btn.dataset.cat;
          currentList = (cat === 'all') ? PRODUCTS.slice() : PRODUCTS.filter(p => p.category === cat);
          renderList(currentList);
        });
      });
    }

    // product page
    renderProductPageIfNeeded();

    // freight integration
    initFreteIntegration();

    // lazy
    initLazy();
  }

  // run on DOMContentLoaded to ensure elements exist
  document.addEventListener('DOMContentLoaded', init);

  // expose helpers for debugging
  window.calcInstallments = calcInstallments;
  window.formatBRL = formatBRL;
  window.PRODUCTS = PRODUCTS;

})(); 
