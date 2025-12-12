/* script.js - versão com paginação, lazy-load, carrinho em localStorage */
const WHATSAPP_NUMBER = '5599999999999';
const PAGE_SIZE = 4;

const PRODUCTS = [
  { id:1, name:'Relógio Dom Pedro Primeiro', category:'dom pedro', price:150000.00, priceLabel:'R$ 150.000,00', img:'imagens/10.png', images:['imagens/10.png'], description:'Relógio clássico em edição limitada. Caixa em ouro, mostrador gravado.', specs:{Material:'Ouro',Movimento:'Automático',Diâmetro:'42mm'} },
  { id:2, name:'Relógio Dom Pedro Segundo', category:'sementes', price:350000.00, priceLabel:'R$ 350.000,00', img:'imagens/09.png', images:['imagens/09.png'], description:'Relógio premium com movimento automático e bracelete em couro.', specs:{Material:'Aço',Movimento:'Automático',Diâmetro:'44mm'} },
  { id:3, name:'Relógio do Cabeça', category:'fertilizante', price:1.99, priceLabel:'R$ 1,99', img:'imagens/01.jpeg', images:['imagens/01.jpeg'], description:'Relógio simples, resistente para uso diário.', specs:{Material:'Plástico',Movimento:'Quartz',Diâmetro:'36mm'} },
  { id:4, name:'Relógio do Lula', category:'epi', price:13.00, priceLabel:'R$ 13,00', img:'imagens/02.jpeg', images:['imagens/02.jpeg'], description:'Relógio esportivo com resistência à água.', specs:{Resistência:'5ATM',Movimento:'Quartz',Diâmetro:'40mm'} },
  { id:5, name:'Relógio do Capitão', category:'ferramenta', price:171.00, priceLabel:'R$ 171,00', img:'imagens/03.jpeg', images:['imagens/03.jpeg'], description:'Relógio robusto, perfeito para atividades externas.', specs:{Material:'Aço',Movimento:'Quartz',Diâmetro:'43mm'} },
  { id:6, name:'Relógio do Jardel', category:'medicamento', price:16.00, priceLabel:'R$ 16,00', img:'imagens/06.jpeg', images:['imagens/06.jpeg'], description:'Relógio casual com bom custo-benefício.', specs:{Material:'Aço',Movimento:'Quartz',Diâmetro:'38mm'} },
  { id:7, name:'Relógio do ardel', category:'medicamento', price:16.00, priceLabel:'R$ 16,00', img:'imagens/07.jpeg', images:['imagens/08.jpeg'], description:'Relógio casual com bom custo-benefício.', specs:{Material:'Aço',Movimento:'Quartz',Diâmetro:'38mm'} }
    
    
    
    
];

const grid = document.getElementById('prodGrid');
const searchInput = document.getElementById('searchInput');
const emptyState = document.getElementById('emptyState');
const resultMeta = document.getElementById('resultMeta');
const paginationEl = document.getElementById('pagination');

const cartKey = 'lojão_cart_v1';
function getCart(){ try{ return JSON.parse(localStorage.getItem(cartKey))||[] }catch(e){return[]} }
function saveCart(c){ localStorage.setItem(cartKey, JSON.stringify(c)); updateCartUI(); }
function addToCart(item, qty=1){ const cart=getCart(); const found=cart.find(i=>i.id===item.id); if(found){ found.qty += qty; } else { cart.push({...item, qty}); } saveCart(cart); }
function removeFromCart(id){ let cart=getCart(); cart=cart.filter(i=>i.id!==id); saveCart(cart); }
function updateCartUI(){ const panel=document.getElementById('cartPanel'); const itemsEl=document.getElementById('cartItems'); const countEl=document.getElementById('cartCount'); const cart=getCart(); itemsEl.innerHTML=''; if(cart.length===0){ itemsEl.innerHTML='<div>Seu carrinho está vazio.</div>'; countEl.textContent=0; document.getElementById('cartTotal').textContent='Total: R$ 0,00'; return; } let total=0; cart.forEach(i=>{ total += i.price * i.qty; const div=document.createElement('div'); div.className='cart-item'; div.innerHTML = `<div><strong>${i.name}</strong><div>Qtd: ${i.qty}</div></div><div style="text-align:right">${formatBRL(i.price * i.qty)}<br><button class='small' data-remove='${i.id}'>Remover</button></div>`; itemsEl.appendChild(div); }); countEl.textContent = cart.reduce((s,i)=>s+i.qty,0); document.getElementById('cartTotal').textContent = `Total: ${formatBRL(total)}`; }

document.addEventListener('click', (e)=>{ if(e.target.matches('[data-remove]')){ const id = parseInt(e.target.dataset.remove); removeFromCart(id); } });

function formatBRL(n){ return n.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }

let currentList = [...PRODUCTS];
let currentPage = 1;

function renderPage(list, page=1){ grid.innerHTML=''; const start=(page-1)*PAGE_SIZE; const slice = list.slice(start, start+PAGE_SIZE); if(slice.length===0){ emptyState.hidden=false; resultMeta.textContent='0 produtos encontrados'; paginationEl.innerHTML=''; return; } emptyState.hidden=true; slice.forEach(p=>{ const div=document.createElement('div'); div.className='card'; div.innerHTML = `<img data-src='${p.img}' alt='${p.name}' class='lazy'><div class='card-body'><strong>${p.name}</strong><div class='card-meta'><div class='price'>${p.priceLabel}</div><button class='btn small' data-add='${p.id}'>Adicionar</button></div></div>`; div.onclick = (ev)=>{ if(ev.target.closest('button')) return; window.location.href = `produto${p.id}.html`; }; grid.appendChild(div); }); resultMeta.textContent = `${list.length} produto(s) encontrado(s)`; renderPagination(list.length, page); lazyLoadImages(); }

function renderPagination(totalItems, page){ const pages = Math.ceil(totalItems/PAGE_SIZE); paginationEl.innerHTML=''; for(let i=1;i<=pages;i++){ const btn = document.createElement('button'); btn.className='page-btn'+(i===page?' active':''); btn.textContent = i; btn.onclick = ()=>{ currentPage = i; renderPage(currentList,i); }; paginationEl.appendChild(btn); } }

searchInput.oninput = ()=>{ const q = searchInput.value.trim().toLowerCase(); currentList = PRODUCTS.filter(p=> p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)); currentPage=1; renderPage(currentList,1); };

document.querySelectorAll('.menu-btn').forEach(btn=>{ btn.onclick = ()=>{ document.querySelectorAll('.menu-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); const cat = btn.dataset.cat; currentList = cat==='all' ? PRODUCTS : PRODUCTS.filter(p=>p.category===cat); currentPage=1; renderPage(currentList,1); }; });

function lazyLoadImages(){ const imgs = document.querySelectorAll('img.lazy'); const obs = new IntersectionObserver((entries,o)=>{ entries.forEach(e=>{ if(e.isIntersecting){ const img = e.target; img.src = img.dataset.src; img.classList.remove('lazy'); o.unobserve(img); } }); },{root:null,rootMargin:'100px'}); imgs.forEach(i=>obs.observe(i)); }

document.addEventListener('click', (e)=>{ const add = e.target.closest('[data-add]'); if(add){ const id = parseInt(add.dataset.add); const p = PRODUCTS.find(x=>x.id===id); if(p){ addToCart({id:p.id,name:p.name,price:p.price},1); } } });

document.getElementById('cartFab').onclick = ()=>{ const panel = document.getElementById('cartPanel'); const visible = panel.getAttribute('aria-hidden') === 'false'; panel.setAttribute('aria-hidden', visible? 'true' : 'false'); updateCartUI(); };
document.getElementById('closeCart').onclick = ()=> document.getElementById('cartPanel').setAttribute('aria-hidden','true');

document.getElementById('checkoutBtn').onclick = ()=>{ const cart = getCart(); if(cart.length===0){ alert('Seu carrinho está vazio.'); return; } const itemsTxt = cart.map(i=>`${i.qty}x ${i.name} - ${formatBRL(i.price)}`).join('\n'); const total = cart.reduce((s,i)=>s+i.price*i.qty,0); const msg = `Olá! Gostaria de comprar:\n${itemsTxt}\nTotal: ${formatBRL(total)}`; window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`); };

document.getElementById('waFab').onclick = ()=> window.open(`https://wa.me/${WHATSAPP_NUMBER}`);

updateCartUI(); renderPage(PRODUCTS,1); document.getElementById('ano').textContent = new Date().getFullYear();
