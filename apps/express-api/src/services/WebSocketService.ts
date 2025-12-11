import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { BiomarkerService } from './biomarker.service';

export interface BiomarkerUpdate {
  id: string;
  name: string;
  value: number;
  timestamp: string;
  unit: string;
}

export interface BiomarkerUpdateEvent {
  patientId: string;
  updates: BiomarkerUpdate[];
  timestamp: string;
}

export class WebSocketService {
  private io: Server;
  private biomarkerService: BiomarkerService;
  private liveUpdateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private connectedClients: Map<string, Set<string>> = new Map();

  constructor(httpServer: HTTPServer, biomarkerService: BiomarkerService) {
    this.biomarkerService = biomarkerService;
    this.io = new Server(httpServer, {
      cors: {
        origin: ['http://localhost:4200', 'http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupConnectionHandlers();
  }

  private setupConnectionHandlers(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log(`📊 WebSocket client connected: ${socket.id}`);

      socket.on('start_live_updates', (patientId: string) => {
        this.startLiveUpdates(socket, patientId);
      });

      socket.on('stop_live_updates', (patientId: string) => {
        this.stopLiveUpdates(socket, patientId);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private startLiveUpdates(socket: Socket, patientId: string): void {
    console.log(`🔴 Starting live updates for patient ${patientId}`);

    // Add this socket to the patient's client set
    if (!this.connectedClients.has(patientId)) {
      this.connectedClients.set(patientId, new Set());
    }
    this.connectedClients.get(patientId)?.add(socket.id);

    // Only start interval if not already running for this patient
    if (!this.liveUpdateIntervals.has(patientId)) {
      const interval = setInterval(async () => {
        try {
          await this.generateAndEmitBiomarkerUpdates(patientId);
        } catch (error) {
          console.error(`❌ Error generating biomarker updates: ${error}`);
        }
      }, 2000 + Math.random() * 1000); // 2-3 seconds

      this.liveUpdateIntervals.set(patientId, interval);
    }

    // Join socket to patient-specific room
    socket.join(`patient:${patientId}`);
  }

  private stopLiveUpdates(socket: Socket, patientId: string): void {
    console.log(`⚪ Stopping live updates for patient ${patientId}`);

    const clients = this.connectedClients.get(patientId);
    if (clients) {
      clients.delete(socket.id);

      // Stop interval if no more clients
      if (clients.size === 0) {
        const interval = this.liveUpdateIntervals.get(patientId);
        if (interval) {
          clearInterval(interval);
          this.liveUpdateIntervals.delete(patientId);
        }
        this.connectedClients.delete(patientId);
      }
    }

    socket.leave(`patient:${patientId}`);
  }

  private handleDisconnect(socket: Socket): void {
    console.log(`📴 WebSocket client disconnected: ${socket.id}`);

    // Clean up all patient subscriptions
    this.connectedClients.forEach((clients, patientId) => {
      if (clients.has(socket.id)) {
        clients.delete(socket.id);
        if (clients.size === 0) {
          const interval = this.liveUpdateIntervals.get(patientId);
          if (interval) {
            clearInterval(interval);
            this.liveUpdateIntervals.delete(patientId);
          }
          this.connectedClients.delete(patientId);
        }
      }
    });
  }

  private async generateAndEmitBiomarkerUpdates(patientId: string): Promise<void> {
    const biomarkers = await this.biomarkerService.getBiomarkersByPatientId(patientId);

    // Randomly select 2-3 biomarkers to update
    const randomCount = Math.floor(Math.random() * 2) + 2; // 2-3 biomarkers
    const shuffled = [...biomarkers].sort(() => Math.random() - 0.5);
    const toUpdate = shuffled.slice(0, randomCount);

    // Generate new values with realistic changes
    const updates: BiomarkerUpdate[] = toUpdate.map(marker => {
      const change = (Math.random() - 0.5) * 10; // ±5% change
      const newValue = parseFloat((marker.value + change).toFixed(2));

      return {
        id: marker.id,
        name: marker.name,
        value: newValue,
        timestamp: new Date().toISOString(),
        unit: marker.unit || ''
      };
    });

    // Emit to all connected clients for this patient
    this.io.to(`patient:${patientId}`).emit('biomarker_updates', {
      patientId,
      updates,
      timestamp: new Date().toISOString()
    } as BiomarkerUpdateEvent);
  }

  public getIO(): Server {
    return this.io;
  }
}
