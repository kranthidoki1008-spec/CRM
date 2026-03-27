export type LeadStatus = 'New' | 'Contacted' | 'Converted';

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  source: string;
  status: LeadStatus;
  notes: Note[];
  createdAt: string;
}

export interface User {
  email: string;
  isLoggedIn: boolean;
}
