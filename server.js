const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();
const PORT = 3000;

const authRoutes = require("./controllers/authController");
const inventoryRoutes = require("./controllers/inventoryController");
const salesRoutes = require("./routes/sales");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "tu-clave-secreta-aqui",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.redirect("/");
  }
}

function redirectIfAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect("/ventas");
  } else {
    return next();
  }
}

app.use(express.static(path.join(__dirname, "public")));

app.use("/", authRoutes);

app.use("/api", requireAuth, salesRoutes);
app.use("/api", requireAuth, inventoryRoutes);

app.get("/", redirectIfAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.get("/inventario", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "inventory.html"));
});

app.get("/ventas", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "sales.html"));
});

app.get("/historial", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "views", "history.html"));
});

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error al cerrar sesión:", err);
    }
    res.redirect("/");
  });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error al cerrar sesión:", err);
    }
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
