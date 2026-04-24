import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Socket.IO Service for NeuroFlux Games
 */

class SocketService {
  constructor() {
    this.socket = null;
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  }

  connect(token) {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    this.socket = io(this.baseUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
        resolve(this.socket);
      });

      this.socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        reject(err);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  selectGame(gameName) {
    this.socket?.emit('selectGame', gameName);
  }
}

export const socketService = new SocketService();
export default socketService;

