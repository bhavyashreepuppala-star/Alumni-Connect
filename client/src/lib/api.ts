export interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  services: {
    backend: {
      status: 'up' | 'down';
      uptimeSeconds: number;
      nodeVersion: string;
      memory: {
        rss: string;
        heapTotal: string;
        heapUsed: string;
      };
    };
    database: {
      dialect: string;
      status: 'up' | 'down';
      latencyMs: number;
      message: string;
    };
  };
}

export interface DemoAccount {
  role: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  email: string;
  password: string;
  description: string;
}

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<HealthResponse> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok && res.status !== 503) {
      throw new Error(`Health check failed with status: ${res.status}`);
    }
    return res.json();
  },

  async getDemoAccounts(): Promise<DemoAccount[]> {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    const json = await res.json();
    return json.data;
  },

  async getLinkedInStatus(): Promise<{ configured: boolean; scopes: string[] }> {
    const res = await fetch(`${API_BASE}/linkedin/status`);
    const json = await res.json();
    return json.data;
  },
};
