import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { container } from 'tsyringe';
import { createServer } from 'http';
import { setupPatientRoutes, setupBiomarkerRoutes, setupBiomarkerAnalysisRoutes } from './routes';
import { PatientService, BiomarkerService, MCPClientService, WebSocketService } from './services';
import { PatientRepository, BiomarkerRepository } from './repositories';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

// Register dependencies with tsyringe container
container.register(PatientRepository, { useClass: PatientRepository });
container.register(BiomarkerRepository, { useClass: BiomarkerRepository });
container.register(PatientService, { useClass: PatientService });
container.register(BiomarkerService, { useClass: BiomarkerService });
container.register(MCPClientService, { useClass: MCPClientService });

// Resolve services from container
const patientService = container.resolve(PatientService);
const biomarkerService = container.resolve(BiomarkerService);
const mcpClientService = container.resolve(MCPClientService);

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:4200',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Setup Socket.IO with WebSocketService
const httpServer = createServer(app);
const webSocketService = new WebSocketService(httpServer, biomarkerService);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Healthcare Biomarker API' });
});

// API routes
const apiRouter = express.Router();
setupPatientRoutes(apiRouter, patientService);
setupBiomarkerRoutes(apiRouter, patientService, biomarkerService);
setupBiomarkerAnalysisRoutes(apiRouter, patientService, biomarkerService, mcpClientService);
app.use('/api', apiRouter);

// Start HTTP server with Socket.IO
httpServer.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port} (with WebSocket support)`);
});
