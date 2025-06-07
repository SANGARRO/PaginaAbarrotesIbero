document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/products")
    .then((res) => {
      if (res.status === 302 || res.status === 401) {
        alert("Tu sesión ha expirado. Serás redirigido al login.");
        window.location.href = "/";
        return;
      }
      if (!res.ok) {
        throw new Error("Error al cargar productos");
      }
      return res.json();
    })
    .then((data) => {
      if (!data) return;
      const container = document.getElementById("product-list");
      container.innerHTML = "";
      if (data.length === 0) {
        container.innerHTML =
          '<div class="card"><p>No hay productos en el inventario</p></div>';
        return;
      }
      data.forEach((p) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <h3>${p.name}</h3>
          <p><strong>Código:</strong> ${p.code}</p>
          <p><strong>Precio:</strong> $${Number(p.price).toLocaleString()}</p>
          <p><strong>Cantidad:</strong> ${p.quantity}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch((error) => {
      console.error("Error:", error);
      const container = document.getElementById("product-list");
      container.innerHTML =
        '<div class="card"><p style="color: #f85149;">Error al cargar los productos</p></div>';
    });
});
