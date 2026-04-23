// server/utils/socketEmitter.js
// Módulo separado para emitir eventos Socket.IO sin crear dependencias circulares.
// index.js llama setIO(io) tras inicializar Socket.IO.

let _io = null;

export function setIO(io) {
  _io = io;
}

export function emitToUser(userId, event, payload) {
  if (!userId || !_io) return;
  const uid = String(userId);
  _io.to(`user:${uid}`).emit(event, payload);
}
