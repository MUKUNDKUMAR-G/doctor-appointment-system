import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * WebSocket service for real-time updates
 * Uses STOMP over SockJS with automatic reconnection
 */
class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.connectionListeners = [];
  }

  /**
   * Connect to WebSocket server
   */
  connect(onConnected, onError) {
    if (this.client && this.connected) {
      console.log('WebSocket already connected');
      return;
    }

    const socketUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws`;
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.log('STOMP:', str);
        }
      },
      onConnect: () => {
        console.log('WebSocket connected');
        this.connected = true;
        this.reconnectAttempts = 0;
        this.notifyConnectionListeners('connected');
        if (onConnected) onConnected();
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        this.connected = false;
        this.notifyConnectionListeners('error');
        if (onError) onError(frame);
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed');
        this.connected = false;
        this.notifyConnectionListeners('disconnected');
        this.handleReconnect();
      },
    });

    this.client.activate();
  }

  /**
   * Handle reconnection logic
   */
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.notifyConnectionListeners('reconnecting');
    } else {
      console.error('Max reconnection attempts reached. Falling back to polling.');
      this.notifyConnectionListeners('failed');
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.notifyConnectionListeners('disconnected');
    }
  }

  /**
   * Subscribe to a topic
   */
  subscribe(topic, callback) {
    if (!this.client || !this.connected) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });

    this.subscriptions.set(topic, subscription);
    return subscription;
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  /**
   * Send a message to the server
   */
  send(destination, body) {
    if (!this.client || !this.connected) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected;
  }

  /**
   * Add connection status listener
   */
  addConnectionListener(listener) {
    this.connectionListeners.push(listener);
  }

  /**
   * Remove connection status listener
   */
  removeConnectionListener(listener) {
    this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
  }

  /**
   * Notify all connection listeners
   */
  notifyConnectionListeners(status) {
    this.connectionListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
