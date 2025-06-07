const fs = require("fs");
const path = require("path");
const filePath = path.join(__dirname, "../data/products.json");

exports.getAllProducts = async () => {
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
};

exports.addProduct = async (newProduct) => {
  const data = fs.readFileSync(filePath);
  const products = JSON.parse(data);

  const id = products.length ? products[products.length - 1].id + 1 : 1;
  products.push({ id, ...newProduct });

  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
};
