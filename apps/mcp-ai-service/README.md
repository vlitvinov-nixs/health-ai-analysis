# MCP AI Biomarker Analysis Service

A Model Context Protocol (MCP) server providing AI-powered biomarker analysis tools for the healthcare dashboard. Uses Google Generative AI to provide intelligent clinical insights on patient biomarker data.

## Features

### Three Core Tools

1. **analyze_biomarkers** - Analyze patient biomarkers to identify concerning values and potential health risks
2. **suggest_monitoring_priorities** - Recommend which biomarkers need closest attention based on current status
3. **generate_health_summary** - Create comprehensive patient health overview with risk assessment

### Network Accessibility

- **HTTP REST API** - Exposes MCP tools via standard HTTP endpoints
- **Port 3001** - Default port (configurable via `MCP_PORT` environment variable)
- **CORS Support** - Allows cross-origin requests from dashboard frontend

### AI Integration

- **Google Generative AI** - Powers intelligent biomarker analysis
- **Fallback Implementation** - Works without API key (using sensible defaults)
- **Error Handling** - Graceful degradation if AI service unavailable

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Google API Key (optional for testing with fallback responses)

### Setup

```bash
# Install dependencies
npm install

# Set up environment variable (optional for production)
export GOOGLE_API_KEY="your-api-key-here"
```

## Running the Service

### Development Mode

```bash
# From the monorepo root
npm run mcp:dev

# Or directly in the service directory
cd apps/mcp-ai-service
npm run dev
```

### Production Build

```bash
# Build the TypeScript
npm run mcp:build

# Start the compiled service
GOOGLE_API_KEY="your-key" MCP_PORT=3001 node dist/main.js
```

### With Other Services

Run all services together:

```bash
# From monorepo root
npm run dev:all:with-mcp
```

This starts:
- Express API backend (port 5000)
- React frontend dev server (port 5173)
- MCP AI Service (port 3001)

## API Endpoints

### Health Check

```bash
GET http://localhost:3001/
```

Response:
```json
{
  "name": "biomarker-ai-analysis",
  "version": "1.0.0",
  "status": "running"
}
```

### List Available Tools

```bash
GET http://localhost:3001/tools
```

Returns array of tools with full schemas including:
- Tool name and description
- Input schema with all parameters
- Required fields and types

### Execute a Tool

```bash
POST http://localhost:3001/tool
Content-Type: application/json

{
  "toolName": "analyze_biomarkers",
  "args": {
    "patient_id": "P001",
    "patient_name": "John Doe",
    "age": 45,
    "gender": "M",
    "biomarkers": [
      {
        "id": "B001",
        "name": "Glucose",
        "value": 150,
        "unit": "mg/dL",
        "status": "high",
        "category": "metabolic"
      }
    ]
  }
}
```

Response:
```json
{
  "success": true,
  "result": [
    {
      "biomarkerId": "B001",
      "name": "Glucose",
      "value": 150,
      "status": "high",
      "riskLevel": "moderate",
      "explanation": "Glucose is currently high...",
      "recommendations": [
        "Consider discussing with your healthcare provider"
      ]
    }
  ]
}
```

## Tool Details

### analyze_biomarkers

Analyzes individual biomarkers to identify concerning values and health risks.

**Input:**
- `patient_id` (string) - Unique patient identifier
- `patient_name` (string) - Patient name
- `age` (number, optional) - Patient age in years
- `gender` (string, optional) - Patient gender (M/F)
- `biomarkers` (array) - Array of biomarker measurements

**Output:** Array of biomarker analysis objects with:
- Risk level assessment
- Clinical explanation
- Personalized recommendations

### suggest_monitoring_priorities

Recommends which biomarkers should be monitored most closely.

**Input:** Same as analyze_biomarkers

**Output:** Array of monitoring priorities with:
- Priority level (high/medium/low)
- Reason for priority
- Recommended action items

### generate_health_summary

Creates a comprehensive health overview for the patient.

**Input:** Same as analyze_biomarkers

**Output:** Health summary object with:
- Overall health assessment
- Risk categorization
- Key findings
- Clinical recommendations

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GOOGLE_API_KEY` | (none) | Google Generative AI API key |
| `MCP_PORT` | `3001` | Port to listen on |
| `TRANSPORT` | `http` | Transport mode: `http` or `stdio` |

## Architecture

### Core Components

```
src/
├── main.ts              # Server entry point with HTTP/stdio transport
├── types.ts             # TypeScript interfaces (Patient, Biomarker, etc.)
├── ai-client.ts         # Google Generative AI wrapper
└── tools/
    ├── definitions.ts   # MCP tool schemas and descriptions
    └── handlers.ts      # Tool execution logic with fallback
```

### Transport Layer

- **HTTP Mode** (default): RESTful API with JSON request/response
- **Stdio Mode**: MCP protocol over stdin/stdout (for client integration)

### AI Integration

- **Primary**: Google Generative AI for intelligent analysis
- **Fallback**: Rule-based analysis when AI unavailable

## Development

### Type Checking

```bash
npm run mcp:type-check
```

### Building

```bash
npm run mcp:build
```

### Full Development Cycle

```bash
# Type check
npm run mcp:type-check

# Build
npm run mcp:build

# Run
npm run mcp:dev
```

## Integration with Dashboard

### From Express API

```typescript
// Make requests to MCP service
const response = await fetch('http://localhost:3001/tool', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    toolName: 'analyze_biomarkers',
    args: { /* patient data */ }
  })
});
```

### From React Frontend

Call your Express API, which will proxy to the MCP service:

```typescript
const response = await fetch('/api/biomarker-analysis', {
  method: 'POST',
  body: JSON.stringify({ /* patient data */ })
});
```

## Monitoring & Logging

The service logs:
- Startup messages with endpoint information
- Tool execution requests
- Errors during analysis
- API warnings (e.g., missing API key)

Check logs:
```bash
# When running in background
tail -f /tmp/mcp-server.log
```

## Troubleshooting

### Server won't start

Check if port 3001 is already in use:
```bash
lsof -i :3001
```

Use a different port:
```bash
MCP_PORT=3002 npm run mcp:dev
```

### API key errors

The service works without an API key using fallback responses. For full AI features:

1. Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Set environment variable: `export GOOGLE_API_KEY="your-key"`
3. Restart the service

### CORS errors

The service includes CORS headers. If still getting errors:

1. Verify requests are POST/GET with proper methods
2. Check Content-Type header is `application/json`
3. Verify endpoint URLs are correct

## Performance Considerations

- **First Request**: May be slower due to model initialization
- **Fallback Responses**: Faster but less detailed than AI analysis
- **Concurrent Requests**: Service handles multiple concurrent tool executions

## Security Notes

- API keys should not be hardcoded in source
- Use environment variables in production
- CORS is enabled for localhost - restrict in production
- Consider adding authentication layer for production use

## Future Enhancements

- [ ] Add caching for repeated analyses
- [ ] Support multiple AI providers (Claude, OpenAI, etc.)
- [ ] Add request rate limiting
- [ ] Implement proper authentication
- [ ] Add comprehensive logging/metrics
- [ ] WebSocket support for real-time streaming

## Support

For issues or questions:
1. Check logs: `tail -f /tmp/mcp-server.log`
2. Verify environment variables are set correctly
3. Test endpoints with curl
4. Check that port 3001 is accessible

## License

MIT
