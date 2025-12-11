/**
 * MCP Tool definitions for biomarker analysis
 */

export const TOOLS = {
  ANALYZE_BIOMARKERS: {
    name: 'analyze_biomarkers',
    description:
      'Analyze patient biomarkers to identify concerning values and potential health risks. Uses AI to provide detailed clinical insights for each biomarker.',
    inputSchema: {
      type: 'object',
      properties: {
        patient_id: {
          type: 'string',
          description: 'The unique identifier of the patient',
        },
        patient_name: {
          type: 'string',
          description: 'The name of the patient',
        },
        age: {
          type: 'number',
          description: 'Patient age in years',
        },
        gender: {
          type: 'string',
          description: 'Patient gender (M/F)',
        },
        biomarkers: {
          type: 'array',
          description: 'Array of biomarker measurements',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              value: { type: 'number' },
              unit: { type: 'string' },
              status: {
                type: 'string',
                enum: ['normal', 'high', 'low'],
              },
              category: {
                type: 'string',
                enum: ['metabolic', 'cardiovascular', 'hormonal'],
              },
              referenceRange: {
                type: 'object',
                properties: {
                  min: { type: 'number' },
                  max: { type: 'number' },
                },
              },
            },
            required: ['id', 'name', 'value', 'unit', 'status'],
          },
        },
      },
      required: ['patient_id', 'patient_name', 'biomarkers'],
    },
  },

  SUGGEST_MONITORING_PRIORITIES: {
    name: 'suggest_monitoring_priorities',
    description:
      'Recommend which biomarkers need closer attention and monitoring based on their current values and clinical significance. Prioritizes biomarkers by risk level.',
    inputSchema: {
      type: 'object',
      properties: {
        patient_id: {
          type: 'string',
          description: 'The unique identifier of the patient',
        },
        patient_name: {
          type: 'string',
          description: 'The name of the patient',
        },
        age: {
          type: 'number',
          description: 'Patient age in years',
        },
        gender: {
          type: 'string',
          description: 'Patient gender (M/F)',
        },
        biomarkers: {
          type: 'array',
          description: 'Array of biomarker measurements',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              value: { type: 'number' },
              unit: { type: 'string' },
              status: {
                type: 'string',
                enum: ['normal', 'high', 'low'],
              },
              category: {
                type: 'string',
                enum: ['metabolic', 'cardiovascular', 'hormonal'],
              },
            },
            required: ['id', 'name', 'value', 'unit', 'status'],
          },
        },
      },
      required: ['patient_id', 'patient_name', 'biomarkers'],
    },
  },

  GENERATE_HEALTH_SUMMARY: {
    name: 'generate_health_summary',
    description:
      'Generate a comprehensive health summary for a patient based on their biomarker profile. Provides overall risk assessment and clinical recommendations.',
    inputSchema: {
      type: 'object',
      properties: {
        patient_id: {
          type: 'string',
          description: 'The unique identifier of the patient',
        },
        patient_name: {
          type: 'string',
          description: 'The name of the patient',
        },
        age: {
          type: 'number',
          description: 'Patient age in years',
        },
        gender: {
          type: 'string',
          description: 'Patient gender (M/F)',
        },
        biomarkers: {
          type: 'array',
          description: 'Array of biomarker measurements',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              value: { type: 'number' },
              unit: { type: 'string' },
              status: {
                type: 'string',
                enum: ['normal', 'high', 'low'],
              },
              category: {
                type: 'string',
                enum: ['metabolic', 'cardiovascular', 'hormonal'],
              },
            },
            required: ['id', 'name', 'value', 'unit', 'status'],
          },
        },
      },
      required: ['patient_id', 'patient_name', 'biomarkers'],
    },
  },
};

export type ToolName = keyof typeof TOOLS;
