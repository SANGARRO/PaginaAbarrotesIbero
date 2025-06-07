let cart = [];
let productsCache = [];

function handleAuthError(response) {
  if (response.status === 302 || response.status === 401) {
    alert("Tu sesión ha expirado. Serás redirigido al login.");
    window.location.href = "/";
    return true;
  }
  return false;
}

async function fetchProducts() {
  try {
    const res = await fetch("/api/products");

    if (handleAuthError(res)) return;

    if (!res.ok) {
      throw new Error("Error al cargar productos");
    }

    const products = await res.json();
    productsCache = products;
  } catch (error) {
    console.error("Error cargando productos:", error);
    alert("Error al cargar los productos");
  }
}

function searchProduct() {
  const searchInput = document.getElementById("product-search");
  const searchValue = searchInput.value.trim();

  if (!searchValue) {
    alert("Ingresa un ID o código de producto");
    return;
  }

  const product = productsCache.find(
    (p) =>
      p.id == searchValue || p.code.toLowerCase() === searchValue.toLowerCase()
  );

  if (product) {
    displayFoundProduct(product);
  } else {
    alert("Producto no encontrado");
    clearProductDisplay();
  }
}

function displayFoundProduct(product) {
  const container = document.getElementById("found-product");
  container.innerHTML = `
    <div class="card">
      <h3>${product.name}</h3>
      <p><strong>Código:</strong> ${product.code}</p>
      <p><strong>Precio:</strong> $${product.price}</p>
      <p><strong>Stock:</strong> ${product.quantity}</p>
      <div style="margin-top: 1rem;">
        <input type="number" id="quantity-input" value="1" min="1" max="${product.quantity}" style="width: 80px; margin-right: 10px;">
        <button onclick="addToCart(${product.id})">Agregar al Carrito</button>
      </div>
    </div>
  `;
}

function clearProductDisplay() {
  document.getElementById("found-product").innerHTML = "";
}

function addToCart(productId) {
  const product = productsCache.find((p) => p.id === productId);
  const quantityInput = document.getElementById("quantity-input");
  const quantity = parseInt(quantityInput.value) || 1;

  if (product && quantity > 0 && quantity <= product.quantity) {
    const existingItem = cart.find((item) => item.id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        ...product,
        quantity: quantity,
      });
    }

    renderCart();
    clearProductDisplay();
    document.getElementById("product-search").value = "";
    alert(`${product.name} agregado al carrito`);
  } else {
    alert("Cantidad inválida o insuficiente stock");
  }
}

function renderCart() {
  const list = document.getElementById("cart-list");
  const totalSpan = document.getElementById("total");

  list.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const li = document.createElement("li");
    const itemTotal = Number(item.price) * item.quantity;
    total += itemTotal;

    li.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 5px 0;">
        <span>${item.name} x${item.quantity} - $${itemTotal}</span>
        <button onclick="removeFromCart(${index})" style="background: #dc3545; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer;">×</button>
      </div>
    `;
    list.appendChild(li);
  });

  totalSpan.textContent = total.toFixed(2);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}

async function finalizePurchase() {
  if (cart.length === 0) {
    alert("El carrito está vacío");
    return;
  }

  const saleData = {
    items: cart.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      price: item.price,
      quantity: item.quantity,
    })),
  };

  try {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saleData),
    });

    if (handleAuthError(res)) return;

    const data = await res.json();

    if (res.ok) {
      alert("Compra realizada exitosamente");
      cart = [];
      renderCart();
      await fetchProducts();
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al procesar la venta");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();

  const searchInput = document.getElementById("product-search");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        searchProduct();
      }
    });
  }
});
