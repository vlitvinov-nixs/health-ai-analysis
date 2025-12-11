/**
 * MCP Server for biomarker AI analysis
 * Uses MCP SDK's StreamableHTTPServerTransport with JSON response mode
 */
import dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import * as z from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { ToolHandlers } from './tools/handlers';
import { TOOLS } from './tools/definitions';
import { Patient } from './types';

// Load environment variables from .env file
dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY || '';
const PORT = parseInt(process.env.MCP_PORT || '3001', 10);

// Type for tool arguments
interface BiomarkerToolArgs {
  patient_id: string;
  patient_name: string;
  age?: number;
  gender?: string;
  biomarkers?: any[];
}

function createMCPServer(): McpServer {
  const server = new McpServer(
    {
      name: 'biomarker-ai-analysis',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Initialize tool handlers
  const handlers = new ToolHandlers(API_KEY);

  // Register analyze_biomarkers tool
  server.tool(
    TOOLS.ANALYZE_BIOMARKERS.name,
    TOOLS.ANALYZE_BIOMARKERS.description,
    {
      patient_id: z.string(),
      patient_name: z.string(),
      age: z.number().optional(),
      gender: z.string().optional(),
      biomarkers: z.any().optional(),
    },
    async (args: BiomarkerToolArgs) => {
      console.log(`🔧 Executing: ${TOOLS.ANALYZE_BIOMARKERS.name}`);
      const patient: Patient = {
        id: args.patient_id,
        name: args.patient_name,
        age: args.age || 0,
        gender: args.gender || 'Unknown',
        biomarkers: args.biomarkers || [],
      };
      const result = await handlers.analyzeBiomarkers(patient);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Register suggest_monitoring_priorities tool
  server.tool(
    TOOLS.SUGGEST_MONITORING_PRIORITIES.name,
    TOOLS.SUGGEST_MONITORING_PRIORITIES.description,
    {
      patient_id: z.string(),
      patient_name: z.string(),
      age: z.number().optional(),
      gender: z.string().optional(),
      biomarkers: z.any().optional(),
    },
    async (args: BiomarkerToolArgs) => {
      console.log(`� Executing: ${TOOLS.SUGGEST_MONITORING_PRIORITIES.name}`);
      const patient: Patient = {
        id: args.patient_id,
        name: args.patient_name,
        age: args.age || 0,
        gender: args.gender || 'Unknown',
        biomarkers: args.biomarkers || [],
      };
      const result = await handlers.suggestMonitoringPriorities(patient);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  // Register generate_health_summary tool
  server.tool(
    TOOLS.GENERATE_HEALTH_SUMMARY.name,
    TOOLS.GENERATE_HEALTH_SUMMARY.description,
    {
      patient_id: z.string(),
      patient_name: z.string(),
      age: z.number().optional(),
      gender: z.string().optional(),
      biomarkers: z.any().optional(),
    },
    async (args: BiomarkerToolArgs) => {
      console.log(`🔧 Executing: ${TOOLS.GENERATE_HEALTH_SUMMARY.name}`);
      const patient: Patient = {
        id: args.patient_id,
        name: args.patient_name,
        age: args.age || 0,
        gender: args.gender || 'Unknown',
        biomarkers: args.biomarkers || [],
      };
      const result = await handlers.generateHealthSummary(patient);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  return server;
}

async function main(): Promise<void> {
  try {
    if (!API_KEY) {
      console.warn(
        '⚠️  Warning: GOOGLE_API_KEY environment variable not set. AI features will use fallback responses.'
      );
    }

    console.log('🚀 Starting Biomarker AI Analysis MCP Server...\n');

    // Create Express app with MCP integration
    const app = createMcpExpressApp();

    // Map to store transports by session ID
    const transports: Map<string, StreamableHTTPServerTransport> = new Map();

    // Handle MCP requests via POST /mcp
    app.post('/mcp', async (req, res) => {
      console.log('📡 Received MCP request');
      try {
        // Check for existing session ID
        const sessionId = req.headers['mcp-session-id'] as string;
        let transport: StreamableHTTPServerTransport;

        if (sessionId && transports.has(sessionId)) {
          // Reuse existing transport for this session
          transport = transports.get(sessionId)!;
          await transport.handleRequest(req as any, res as any, req.body);
        } else if (!sessionId && isInitializeRequest(req.body)) {
          // New initialization request - create JSON response mode transport
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            enableJsonResponse: true,
            onsessioninitialized: (newSessionId: string) => {
              console.log(`✨ Session initialized: ${newSessionId}`);
              transports.set(newSessionId, transport);
            },
          });

          // Create and connect server to transport
          const server = createMCPServer();
          await server.connect(transport);
          await transport.handleRequest(req as any, res as any, req.body);
        } else {
          // Invalid request
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
              code: -32000,
              message: 'Bad Request: No valid session ID provided',
            },
            id: null,
          });
        }
      } catch (error) {
        console.error('❌ Error handling MCP request:', error);
        if (!res.headersSent) {
          res.status(500).json({ error: String(error) });
        }
      }
    });

    // Health check endpoint
    app.get('/', (req, res) => {
      res.json({
        name: 'biomarker-ai-analysis',
        version: '1.0.0',
        status: 'running',
        transport: 'http-json',
      });
    });

    // List tools endpoint
    app.get('/tools', (req, res) => {
      const tools = [
        {
          name: TOOLS.ANALYZE_BIOMARKERS.name,
          description: TOOLS.ANALYZE_BIOMARKERS.description,
        },
        {
          name: TOOLS.SUGGEST_MONITORING_PRIORITIES.name,
          description: TOOLS.SUGGEST_MONITORING_PRIORITIES.description,
        },
        {
          name: TOOLS.GENERATE_HEALTH_SUMMARY.name,
          description: TOOLS.GENERATE_HEALTH_SUMMARY.description,
        },
      ];
      res.json({ tools });
    });

    // Tool endpoint for direct calls (non-MCP)
    app.post('/tool', async (req, res) => {
      const { toolName, args } = req.body;
      console.log(`🔧 Tool call: ${toolName}`);

      try {
        // Get the tool handler
        const handlers = new ToolHandlers(API_KEY);
        const patient: Patient = {
          id: args.patient_id,
          name: args.patient_name,
          age: args.age || 0,
          gender: args.gender || 'Unknown',
          biomarkers: args.biomarkers || [],
        };

        let result: any;
        switch (toolName) {
          case 'analyze_biomarkers':
            result = await handlers.analyzeBiomarkers(patient);
            break;
          case 'suggest_monitoring_priorities':
            result = await handlers.suggestMonitoringPriorities(patient);
            break;
          case 'generate_health_summary':
            result = await handlers.generateHealthSummary(patient);
            break;
          default:
            throw new Error(`Unknown tool: ${toolName}`);
        }

        res.json({ success: true, result });
      } catch (error) {
        console.error(`❌ Error calling tool:`, error);
        res.status(500).json({
          success: false,
          error: String(error),
        });
      }
    });

    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Biomarker AI Analysis MCP Server started on HTTP`);
      console.log(`🔗 Server listening on http://0.0.0.0:${PORT}`);
      console.log(`\n📍 Endpoints:`);
      console.log(`  POST http://localhost:${PORT}/mcp           - MCP protocol endpoint`);
      console.log(`  GET  http://localhost:${PORT}              - Health check`);
      console.log(`  GET  http://localhost:${PORT}/tools        - List available tools`);
      console.log(`  POST http://localhost:${PORT}/tool         - Execute a tool (direct)`);
      console.log(`\n🧬 Available tools:`);
      console.log(`  • analyze_biomarkers`);
      console.log(`  • suggest_monitoring_priorities`);
      console.log(`  • generate_health_summary`);
    });
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
