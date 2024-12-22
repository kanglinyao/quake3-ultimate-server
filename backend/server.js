const express = require('express');
const Rcon = require('rcon');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;
const secretKey = 'your_secret_key'; // Replace with a strong secret key for JWT

// Middleware to parse JSON bodies
app.use(express.json());

const users = []; // In-memory user store, replace with a database in production

// Helper function to generate JWT
function generateToken(user) {
  return jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
}

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Register a new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).send('User registered');
});

// Login a user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).send('Cannot find user');

  if (await bcrypt.compare(password, user.password)) {
    const token = generateToken(user);
    res.json({ token });
  } else {
    res.send('Not Allowed');
  }
});

const servers = {
  osp: { host: 'localhost', port: 27960, password: 'your_rcon_password' },
  cpma: { host: 'localhost', port: 27961, password: 'your_rcon_password' }
};

function sendRconCommand(server, command) {
  return new Promise((resolve, reject) => {
    const conn = new Rcon(server.host, server.port, server.password);
    conn.on('auth', () => {
      conn.send(command);
    }).on('response', (str) => {
      resolve(str);
      conn.disconnect();
    }).on('error', (err) => {
      reject(err);
    }).on('end', () => {
      console.log("Connection closed");
    });
    conn.connect();
  });
}

app.post('/command/:server', authenticateToken, async (req, res) => {
  const server = servers[req.params.server];
  if (!server) {
    return res.status(404).send('Server not found');
  }

  const command = req.body.command;
  try {
    const response = await sendRconCommand(server, command);
    res.send(response);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/bot/:server/add', authenticateToken, async (req, res) => {
  const server = servers[req.params.server];
  if (!server) {
    return res.status(404).send('Server not found');
  }

  const botName = req.body.botName;
  const skill = req.body.skill || 1; // default skill level 1
  try {
    const response = await sendRconCommand(server, `addbot ${botName} ${skill}`);
    res.send(response);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/bot/:server/remove', authenticateToken, async (req, res) => {
  const server = servers[req.params.server];
  if (!server) {
    return res.status(404).send('Server not found');
  }

  const botName = req.body.botName;
  try {
    const response = await sendRconCommand(server, `kick ${botName}`);
    res.send(response);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/maps/:server', authenticateToken, async (req, res) => {
  const server = servers[req.params.server];
  if (!server) {
    return res.status(404).send('Server not found');
  }

  try {
    const response = await sendRconCommand(server, 'dir maps');
    res.send(response);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/rotation/:server', authenticateToken, async (req, res) => {
  const server = servers[req.params.server];
  if (!server) {
    return res.status(404).send('Server not found');
  }

  const maps = req.body.maps;
  if (!Array.isArray(maps) || maps.length === 0) {
    return res.status(400).send('Invalid map rotation');
  }

  try {
    let rotationCommands = maps.map((map, index) => {
      const nextMap = maps[(index + 1) % maps.length];
      return `set m${index + 1} "map ${map}; set nextmap vstr m${(index + 2) % maps.length + 1}"`;
    }).join('; ');

    rotationCommands += `; vstr m1`;
    
    const response = await sendRconCommand(server, rotationCommands);
    res.send(response);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});