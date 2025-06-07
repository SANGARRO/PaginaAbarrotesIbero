const express = require("express");
const router = express.Router();
const productModel = require("../models/productModel");

router.get("/products", async (req, res) => {
  const products = await productModel.getAllProducts();
  res.json(products);
});

router.post("/products", async (req, res) => {
  await productModel.addProduct(req.body);
  res.redirect("/inventario");
});

module.exports = router;
