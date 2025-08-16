export interface Transaction {
  hash: string;
  type: 'register' | 'project' | 'metrics' | 'approve' | 'authorize' | 'analysis' | 'revoke' | 'update' | 'submit';
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  description: string;
}

export interface ZoneData {
  area: number;
  population: number;
  value: number;
  zoningType: number;
  description: string;
}

export interface ProjectData {
  budget: number;
  impactScore: number;
  timeline: number;
  projectName: string;
  targetZoneId: number;
}

export interface MetricsData {
  zoneId: number;
  densityIndex: number;
  trafficVolume: number;
  greenSpaceRatio: number;
  infrastructureScore: number;
}

export interface ZoneInfo {
  isRegistered: boolean;
  owner: string;
  publicDescription: string;
  registrationTime: number;
}

export interface ProjectInfo {
  isApproved: boolean;
  isActive: boolean;
  proposer: string;
  projectName: string;
  targetZoneId: number;
  submissionTime: number;
}

export enum ZoningType {
  Residential = 1,
  Commercial = 2,
  Industrial = 3,
  MixedUse = 4
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
