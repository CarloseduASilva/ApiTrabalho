const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = 5000;


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, 
  },
});

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rota de login
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await pool.query(
        "SELECT * FROM users WHERE email = $1 AND password = $2",
        [email, password]
      );
  
      if (result.rows.length > 0) {
        const userName = result.rows[0].nome; // Recupera o nome do usuário
        res.json({ message: "Login bem-sucedido!", userName }); // Retorna a mensagem e o nome do usuário
      } else {
        res.status(401).json({ message: "Credenciais inválidas." });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro no servidor." });
    }
  });
  
  

// Rota de cadastro
app.post("/api/register", async (req, res) => {
    const { email, password, nome } = req.body;
    try {
      const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
  
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: "Usuário já cadastrado." });
      }
  
      await pool.query(
        "INSERT INTO users (email, password, nome) VALUES ($1, $2, $3)",
        [email, password, nome]
      );
  
      res.json({ message: "Cadastro realizado com sucesso!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro no servidor." });
    }
  });

  // Rota para obter o nome do usuário baseado no email
app.get("/api/user", async (req, res) => {
    const { email } = req.query; // O email vem da query string da URL
    try {
      const result = await pool.query(
        "SELECT nome FROM users WHERE email = $1",
        [email]
      );
  
      if (result.rows.length > 0) {
        res.json({ nome: result.rows[0].nome });
      } else {
        res.status(404).json({ message: "Usuário não encontrado" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro no servidor." });
    }
  });
  
  

// Rota para os ver os usuarios
app.get("/api/users", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM users");
      res.json(result.rows);  
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Erro ao buscar usuários." });
    }
  });
  
// Inicia o servidor
app.listen(port, () => {
  console.log(`API rodando cpivara`);
});
