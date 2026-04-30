import { io } from 'socket.io-client';

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
      const handleConnect = () => {
        this.socket.off('connect_error', handleConnectError);
        console.log('Socket connected:', this.socket.id);
        resolve(this.socket);
      };

      const handleConnectError = (err) => {
        this.socket.off('connect', handleConnect);
        console.error('Socket connection error:', err);
        reject(err);
      };

      this.socket.once('connect', handleConnect);
      this.socket.once('connect_error', handleConnectError);
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
}

export const socketService = new SocketService();
export default socketService;
