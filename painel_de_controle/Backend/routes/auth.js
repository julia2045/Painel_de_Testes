//importando o middleware de autenticação
const authMiddleware = require('../middleware/auth');
//TRAGO A BIBILIOTECA EXPRESSA PARA CRIAR UM SERVIDOR PARA ROTAS 
const express = require('express')
//TRAGO A BIBILIOTECA BCRYPT PARA CRIPTOGRAFAR SENHAS
const bcrypt = require('bcrypt');
// 
const pool = require('../db');

//crio um servidor para guardar as rotas
const router = express.Router()

//importando confg de jwt
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;





//crio a rota
router.post('/register', async (req, res ) => {
 // pega cada campo, garante que é texto e tira espaços das pontas
  const name = String(req.body?.name || '').trim();
  const username = String(req.body?.username || '').trim().toLowerCase();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const phone = String(req.body?.phone || '').trim();
  const password = String(req.body?.password || '');

  if(name.split(' ').filter(Boolean).length < 2) {
    return res.status(400).json({ error: 'Nome inválido' });
  }
  if(username.length < 3 || username.length > 30){
    return res.status(400).json({error: "nome de usuário inválido"})
  }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }
  if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(phone)) {
    return res.status(400).json({ error: 'Telefone inválido. Use o formato (11) 99999-9999' });
  }
  if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*]).{8,}$/.test(password)) {
    return res.status(400).json({
      error: 'A senha precisa de 8 caracteres, uma maiúscula, um número e um símbolo (!@#$%&*)',
    });
  }
  //aqui configuro a criptografia da senha, e insiro no banco de dados
  try {
    // criptografa a senha com 10 rodadas de hash
    const hashedPAssword = await bcrypt.hash(password,10)
    // insere o usuário no banco de dados
    const result = await pool.query(
      //não retorno o password, apenas o id, nome, username, email, telefone e data de criação
      `INSERT INTO users (name, username, email, phone, password_hash)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, name, username,email, phone, created_at`,
      [name, username, email, phone, hashedPAssword]
    )
    res.status(201).json(result.rows[0]);

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

router.post('/login', async (req, res) => {
  // pego o valor de username e password, verifico se é uma string e que não esta vazia, e tiro os espaços entre as pontas e deixo tudo em minusculo
  const login = String(req.body?.login || "").trim().toLowerCase();
  const password = String(req.body?.password ||"");
  if (!login || !password) {
    return res.status(400).json({ error: 'Informe login e senha' });
  }
 try {
    const result = await pool.query(
  'SELECT id, name, username, email, password_hash FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1',
      [login]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign(
      //payload(o que vai dentro do token)
      {id: user.id},
      //chave secreta do servidor, que é usada para assinar o token e verificar sua autenticidade
      process.env.JWT_SECRET,
      //tempo de expiração do token
      {expiresIn: "2d"}
    )
   return res.status(200).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email
    }
  });

  } catch (error) {
    console.error('Error on login:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
  })

  router.get('/me', authMiddleware, async (req, res) => {
    try{
      result = await pool.query(
        "SELECT id, name, username, email, phone, created_at FROM users WHERE id = $1",
        [req.userId]
      )
      const user = result.rows[0]
      if(!user){
        return res.status(404).json({error: "Usuário não encontrado"})
      }
      return res.status(200).json(user)
    }
    catch(error){
      console.error('Error fetching user data:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

module.exports = router