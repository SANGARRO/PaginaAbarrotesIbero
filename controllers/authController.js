const express = require("express");
const router = express.Router();
const userModel = require("../models/userModel");

router.post("/login", async (req, res) => {
  const { user, pass } = req.body;

  try {
    const result = await userModel.getUser(user, pass);

    if (result) {
      req.session.userId = result.id;
      req.session.username = result.username;

      console.log(`Usuario ${result.username} ha iniciado sesión`);
      res.redirect("/ventas");
    } else {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Login - Error</title>
          <link rel="stylesheet" href="/css/style.css" />
        </head>
        <body>
          <nav>
            <div>
              <img src="https://img.freepik.com/vector-gratis/plantilla-abstracta-fondo-ondulado_1035-8922.jpg?semt=ais_items_boosted&w=740" alt="Logo" style="height: 50px;" />
            </div>

            <div>
              <a href="#">Historial</a>
              <a href="/inventario">Inventario</a>
              <a href="#">Manual</a>
              <a href="#">Perfil</a>
            </div>
          </nav>
          <div class="container">
            <div class="card" style="background-color: #5d2324; border-left: 4px solid #f85149;">
              <h3 style="color: #f85149; margin-top: 0;">Error de Autenticación</h3>
              <p>Usuario o contraseña incorrectos. Intenta de nuevo.</p>
            </div>
            <form action="/login" method="POST">
              <input type="text" name="user" placeholder="Usuario" required />
              <input type="password" name="pass" placeholder="Contraseña" required />
              <button type="submit">Ingresar</button>
            </form>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).send("Error interno del servidor");
  }
});

module.exports = router;
