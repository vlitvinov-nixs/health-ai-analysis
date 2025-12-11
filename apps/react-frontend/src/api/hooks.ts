import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Patient, Biomarker, BiomarkerCategory, ApiResponse, BiomarkersResponse } from './types';

const API_BASE_URL = 'http://localhost:3000/api';

export const usePatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/patients`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        
        const data: ApiResponse<Patient[]> = await response.json();
        
        if (data.success) {
          setPatients(data.data);
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return { patients, loading, error };
};

export const useBiomarkers = (patientId: string, category?: BiomarkerCategory) => {
  const [data, setData] = useState<BiomarkersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchBiomarkers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let url = `${API_BASE_URL}/patients/${patientId}/biomarkers`;
        if (category) {
          url += `?category=${category}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch biomarkers');
        }
        
        const responseData: ApiResponse<BiomarkersResponse> = await response.json();
        
        if (responseData.success) {
          setData(responseData.data);
        } else {
          throw new Error(responseData.error || 'Unknown error');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchBiomarkers();
  }, [patientId, category]);

  return { data, loading, error };
};

export interface AnalysisResponse {
  success: boolean;
  data?: {
    patientId: string;
    patientName: string;
    analysis: {
      analyzeBiomarkers: unknown;
      suggestMonitoringPriorities: unknown;
      generateHealthSummary: unknown;
    };
  };
  error?: string;
}

export const useAnalysis = (patientId: string) => {
  const [analysis, setAnalysis] = useState<AnalysisResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      
      const data: AnalysisResponse = await response.json();
      
      if (data.success && data.data) {
        setAnalysis(data.data);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { analysis, loading, error, fetchAnalysis };
};

// WebSocket live updates interfaces
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

interface UseLiveUpdatesOptions {
  patientId: string;
  enabled: boolean;
  onUpdate: (event: BiomarkerUpdateEvent) => void;
}

export const useLiveUpdates = ({
  patientId,
  enabled,
  onUpdate
}: UseLiveUpdatesOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!enabled) {
      // Disconnect if disabled
      if (socketRef.current?.connected) {
        socketRef.current.emit('stop_live_updates', patientId);
        socketRef.current.disconnect();
      }
      setIsConnected(false);
      return;
    }

    // Connect to backend
    const socket = io('http://localhost:3000', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔗 Connected to WebSocket server');
      setIsConnected(true);
      setError(null);
      
      // Start live updates for this patient
      socket.emit('start_live_updates', patientId);
      console.log(`📊 Started live updates for patient ${patientId}`);
    });

    socket.on('biomarker_updates', (event: BiomarkerUpdateEvent) => {
      console.log('📈 Received biomarker updates:', event);
      onUpdate(event);
    });

    socket.on('disconnect', () => {
      console.log('📴 Disconnected from WebSocket server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error: Error) => {
      console.error('❌ WebSocket connection error:', error);
      setError(error.message);
      setIsConnected(false);
    });

    socket.on('error', (error: string) => {
      console.error('❌ WebSocket error:', error);
      setError(error);
    });

    // Cleanup on unmount
    return () => {
      if (socket.connected) {
        socket.emit('stop_live_updates', patientId);
        socket.disconnect();
      }
    };
  }, [enabled, patientId, onUpdate]);

  return {
    isConnected,
    error,
    disconnect: () => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('stop_live_updates', patientId);
        socketRef.current.disconnect();
      }
    }
  };
};
