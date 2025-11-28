const WHATSAPP_NUMBER = "5599999999999";

const PRODUCTS = [
  { id:1, name:'Relógio Dom Pedro Primeiro', category:'dom pedro', price:'R$ 150.000,00',
    img:"imagens/10.png" },

  { id:2, name:'Relógio Dom Pedro Segundo', category:'sementes', price:'R$ 350.000,00',
    img:"imagens/09.png" },

  { id:3, name:'Relógio do Cabeça', category:'fertilizante', price:'R$ 1,99',
    img:"imagens/01.jpeg" },

  { id:4, name:'Relógio do Lula', category:'epi', price:'R$ 13,00',
    img:"imagens/02.jpeg" },

  { id:5, name:'Relógio do Capitão', category:'ferramenta', price:'R$ 171,00',
    img:"imagens/03.jpeg" },

  { id:6, name:'Relógio do Jardel', category:'medicamento', price:'R$ 16,00',
    img:"imagens/06.jpeg" }
   
  
];

const grid = document.getElementById("prodGrid");
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("emptyState");
const resultMeta = document.getElementById("resultMeta");

/* RENDER */
function renderProducts(list) {
  grid.innerHTML = "";
  if (list.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;

  list.forEach(p => {
    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <img src="${p.img}">
      <div style="padding:12px">
        <strong>${p.name}</strong><br>
        <div class="price">${p.price}</div>
      </div>
    `;

    div.onclick = () => openModal(p);
    grid.appendChild(div);
  });

  resultMeta.textContent = `${list.length} produto(s) encontrado(s)`;
}

renderProducts(PRODUCTS);

/* MENU */
document.querySelectorAll(".menu-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".menu-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const cat = btn.dataset.cat;
    renderProducts(cat === "all" ? PRODUCTS : PRODUCTS.filter(p => p.category === cat));
  };
});

/* SEARCH */
searchInput.oninput = () => {
  const q = searchInput.value.toLowerCase();
  renderProducts(PRODUCTS.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q)
  ));
};

/* MODAL */
const modal = document.getElementById("productModal");
const closeModalBtn = document.getElementById("closeModal");

function openModal(p) {
  document.getElementById("modalImg").src = p.img;
  document.getElementById("modalName").textContent = p.name;
  document.getElementById("modalPrice").textContent = p.price;

  document.getElementById("modalWaBtn").onclick = () =>
    openWhatsApp(`Olá! Quero ${p.name}`);

  modal.style.display = "flex";
}

closeModalBtn.onclick = () => modal.style.display = "none";
modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };

function openWhatsApp(msg) {
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
}

/* FORM */
document.getElementById("clearForm").onclick = () =>
  document.getElementById("contactForm").reset();

document.getElementById("ano").textContent = new Date().getFullYear();
