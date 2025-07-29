require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns')
const urlParser = require('url');
const { error } = require('console');
const app = express();


// Middleware
app.use(cors());
app.use(express.urlencoded({extended: false})); // Para leer datos de formulario


// Basic Configuration
const port = process.env.PORT || 3000;
app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Base de datos tamporal en memoria (podemos cambiar a MOngoBD despues)
let urls = [];
let idCounter = 1;

// POST para acortar la URL
app.post('/api/shorturl', function (req, res) {
  const originalUrl = req.body.url;

  // Validar que sea una URL validad (Formato)
  try {
    const hostname = new URL(originalUrl).hostname;

    // VAlidar que sea una  URL existente usando DNS
    dns.lookup(hostname, (err) =>{
      if (err) {
        return res.json({ error: 'invalid url'});
      }else {
        // Guardar en memoria
        const short_url = idCounter++;
        urls.push({ original_url: originalUrl, short_url });
        res.json({ original_url: originalUrl, short_url });
      }
    });
  } catch (e) {
    res.json({error: 'invalid url'});
  }
});

// GET para redirigir desde short_url
app.get('/api/shorturl/:short_url', function (req, res) {
  const id = Number(req.params.short_url);
  const found = urls.find(u => u.short_url === id);

  if (found) {
    res.redirect(found.original_url);
  } else {
    res.status(404).json({ error: 'No URL found for this ID' });
  }
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Escuchar el servidor
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
