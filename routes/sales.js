const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const salesFile = path.join(__dirname, "../data/sales.json");
const productsFile = path.join(__dirname, "../data/products.json");

router.post("/sales", (req, res) => {
  const { items } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ message: "No hay productos en el carrito" });
  }

  try {
    const productsData = JSON.parse(fs.readFileSync(productsFile));

    const validatedItems = [];
    let total = 0;

    for (const item of items) {
      const product = productsData.find((p) => p.id === item.id);

      if (!product) {
        return res
          .status(400)
          .json({ message: `Producto con ID ${item.id} no encontrado` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para ${product.name}. Disponible: ${product.quantity}, Solicitado: ${item.quantity}`,
        });
      }

      const itemTotal = Number(product.price) * Number(item.quantity);
      total += itemTotal;

      validatedItems.push({
        id: product.id,
        name: product.name,
        code: product.code,
        price: product.price,
        quantity: item.quantity,
      });

      product.quantity -= item.quantity;
    }

    fs.writeFileSync(productsFile, JSON.stringify(productsData, null, 2));

    let salesData = [];
    if (fs.existsSync(salesFile)) {
      salesData = JSON.parse(fs.readFileSync(salesFile));
    }

    const newSale = {
      id: Date.now(),
      items: validatedItems,
      total: total,
      date: new Date().toISOString(),
    };

    salesData.push(newSale);

    fs.writeFileSync(salesFile, JSON.stringify(salesData, null, 2));

    res.json({
      message: "Venta registrada exitosamente",
      sale: newSale,
    });
  } catch (error) {
    console.error("Error procesando venta:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.get("/sales", (req, res) => {
  try {
    if (!fs.existsSync(salesFile)) {
      return res.json([]);
    }

    const salesData = JSON.parse(fs.readFileSync(salesFile));

    const sortedSales = salesData.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    res.json(sortedSales);
  } catch (error) {
    console.error("Error leyendo ventas:", error);
    res.status(500).json({ message: "Error al obtener historial de ventas" });
  }
});

router.get("/sales/:id", (req, res) => {
  try {
    const saleId = parseInt(req.params.id);

    if (!fs.existsSync(salesFile)) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    const salesData = JSON.parse(fs.readFileSync(salesFile));
    const sale = salesData.find((s) => s.id === saleId);

    if (!sale) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }

    res.json(sale);
  } catch (error) {
    console.error("Error obteniendo venta:", error);
    res.status(500).json({ message: "Error al obtener la venta" });
  }
});

module.exports = router;
