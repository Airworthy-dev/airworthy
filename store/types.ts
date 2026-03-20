export type WorkOrderStatus = 'open' | 'in-progress' | 'complete';
export type AircraftStatus = 'airworthy' | 'grounded' | 'maintenance';
export type ReminderCategory = 'Inspection' | 'Avionics' | 'Engine' | 'Equipment';
export type Urgency = 'overdue' | 'soon' | 'upcoming';

export interface WorkOrder {
  id: string;
  tail: string;
  description: string;
  mechanic: string;
  date: string; // ISO: YYYY-MM-DD
  status: WorkOrderStatus;
  notes: string;
}

export interface Aircraft {
  id: string;
  tail: string;
  make: string;
  model: string;
  year: number;
  status: AircraftStatus;
  lastInspection: string; // ISO: YYYY-MM-DD
  nextDue: string; // ISO: YYYY-MM-DD
  totalTime: number; // hours
  notes: string;
}

export interface Reminder {
  id: string;
  tail: string;
  type: string;
  category: ReminderCategory;
  dueDate: string; // ISO: YYYY-MM-DD
  notes: string;
}
