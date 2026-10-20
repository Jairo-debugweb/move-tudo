(() => {
  "use strict";

  const STORAGE_KEY = "move-tudo-orders-v1";
  const form = document.querySelector("#freight-form");
  const message = document.querySelector("#form-message");
  const savedSection = document.querySelector("#meus-pedidos");
  const ordersList = document.querySelector("#orders-list");
  const clearButton = document.querySelector("#clear-orders");
  const dateInput = document.querySelector("#date");

  document.querySelector("#year").textContent = String(new Date().getFullYear());

  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString().slice(0, 10);
  dateInput.min = localToday;

  function getOrders() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
  }

  function formatDate(value) {
    if (!value) return "Data não informada";
    const [year, month, day] = value.split("-");
    return day && month && year ? `${day}/${month}/${year}` : value;
  }

  function renderOrders() {
    const orders = getOrders();
    savedSection.hidden = orders.length === 0;
    ordersList.innerHTML = orders.map(order => `
      <article class="order-card">
        <div>
          <h3>${escapeHtml(order.cargo)}</h3>
          <p><strong>Retirada:</strong> ${escapeHtml(order.origin)}</p>
          <p><strong>Entrega:</strong> ${escapeHtml(order.destination)}</p>
          <p><strong>Data:</strong> ${escapeHtml(formatDate(order.date))} · <strong>Contato:</strong> ${escapeHtml(order.phone)}</p>
          ${order.details ? `<p><strong>Detalhes:</strong> ${escapeHtml(order.details)}</p>` : ""}
          <p><strong>Criado em:</strong> ${escapeHtml(new Date(order.createdAt).toLocaleString("pt-BR"))}</p>
        </div>
        <span class="order-badge">Salvo neste aparelho</span>
      </article>
    `).join("");
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const order = {
      id: (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      cargo: String(data.get("cargo") || "").trim(),
      origin: String(data.get("origin") || "").trim(),
      destination: String(data.get("destination") || "").trim(),
      date: String(data.get("date") || ""),
      phone: String(data.get("phone") || "").trim(),
      details: String(data.get("details") || "").trim(),
      createdAt: new Date().toISOString()
    };

    try {
      const orders = getOrders();
      orders.unshift(order);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
      message.textContent = "Pedido salvo neste navegador! Esta versão ainda não envia o pedido a profissionais.";
      form.reset();
      dateInput.min = localToday;
      renderOrders();
      savedSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      message.textContent = "Não foi possível salvar o pedido. Verifique o espaço disponível no navegador e tente novamente.";
    }
  });

  clearButton.addEventListener("click", () => {
    if (!window.confirm("Deseja apagar todos os pedidos salvos neste navegador?")) return;
    localStorage.removeItem(STORAGE_KEY);
    message.textContent = "Pedidos locais apagados.";
    renderOrders();
  });

  renderOrders();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(error => {
        console.info("Move Tudo: modo offline não foi ativado.", error);
      });
    });
  }
})();