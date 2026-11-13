// API "del ingeniero" para el simulacro de examen. Sin dependencias.
const http = require('http');

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.API_KEY || 'ingeniero-2026';

const POSITIVAS = ['excelente', 'bueno', 'buena', 'genial', 'perfecto', 'rapido', 'rápido', 'encanta', 'recomiendo', 'feliz', 'gracias', 'funciona'];
const NEGATIVAS = ['malo', 'mala', 'terrible', 'pesimo', 'pésimo', 'lento', 'horrible', 'defectuoso', 'roto', 'decepcion', 'decepción', 'odio', 'no funciona'];

const contar = (t, lista) => lista.filter((p) => t.includes(p)).length;

function analizar(contenido) {
  const t = contenido.toLowerCase();
  const pos = contar(t, POSITIVAS);
  const neg = contar(t, NEGATIVAS);
  if (pos === neg) return { etiqueta: 'neutro', confianza: 0.5 };
  const confianza = Math.round((0.6 + 0.39 * (Math.abs(pos - neg) / (pos + neg))) * 100) / 100;
  return { etiqueta: pos > neg ? 'positivo' : 'negativo', confianza };
}

function responder(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

http
  .createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
      return responder(res, 200, { estado: 'ok', servicio: 'api-ingeniero' });
    }
    if (req.method === 'POST' && req.url === '/api/v1/analyze') {
      if (req.headers['authorization'] !== `Bearer ${API_KEY}`) {
        return responder(res, 401, { estado: 'error', mensaje: 'No autorizado' });
      }
      let cuerpo = '';
      req.on('data', (c) => (cuerpo += c));
      req.on('end', () => {
        let datos;
        try {
          datos = JSON.parse(cuerpo);
        } catch {
          return responder(res, 400, { estado: 'error', mensaje: 'JSON inválido' });
        }
        if (!datos || typeof datos.contenido !== 'string' || !datos.contenido.trim()) {
          return responder(res, 422, { estado: 'error', mensaje: 'El campo "contenido" es obligatorio' });
        }
        responder(res, 200, { estado: 'ok', resultado: analizar(datos.contenido) });
      });
      return;
    }
    responder(res, 404, { estado: 'error', mensaje: 'Ruta no encontrada' });
  })
  .listen(PORT, () => console.log(`API del ingeniero en puerto ${PORT}`));
