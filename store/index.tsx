import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { Aircraft, Reminder, WorkOrder } from './types';

const KEYS = {
  workOrders: '@airworthy/workOrders',
  aircraft: '@airworthy/aircraft',
  reminders: '@airworthy/reminders',
};

const INITIAL_WORK_ORDERS: WorkOrder[] = [
  { id: 'WO-1042', tail: 'N182TW', description: '100-Hour Inspection', mechanic: 'J. Martinez', date: '2026-03-18', status: 'in-progress', notes: '' },
  { id: 'WO-1041', tail: 'N44XA', description: 'Annual Inspection', mechanic: 'R. Chen', date: '2026-03-15', status: 'open', notes: '' },
  { id: 'WO-1040', tail: 'N8801B', description: 'Avionics Update – G530', mechanic: 'J. Martinez', date: '2026-03-10', status: 'complete', notes: 'Completed successfully.' },
  { id: 'WO-1039', tail: 'N7762C', description: 'Engine Oil Change', mechanic: 'S. Patel', date: '2026-03-08', status: 'complete', notes: '' },
  { id: 'WO-1038', tail: 'N55KL', description: 'Landing Gear Inspection', mechanic: 'R. Chen', date: '2026-03-05', status: 'open', notes: 'Awaiting parts.' },
  { id: 'WO-1037', tail: 'N2209F', description: 'Transponder Calibration', mechanic: 'S. Patel', date: '2026-02-28', status: 'complete', notes: '' },
];

const INITIAL_AIRCRAFT: Aircraft[] = [
  { id: 'N182TW', tail: 'N182TW', make: 'Cessna', model: '182 Skylane', year: 2004, status: 'airworthy', lastInspection: '2026-01-12', nextDue: '2027-01-12', totalTime: 4218, notes: '' },
  { id: 'N44XA', tail: 'N44XA', make: 'Piper', model: 'PA-28 Cherokee', year: 1998, status: 'maintenance', lastInspection: '2025-10-03', nextDue: '2026-10-03', totalTime: 7841, notes: 'Annual overdue.' },
  { id: 'N8801B', tail: 'N8801B', make: 'Beechcraft', model: 'Bonanza G36', year: 2011, status: 'airworthy', lastInspection: '2026-02-20', nextDue: '2027-02-20', totalTime: 2105, notes: '' },
  { id: 'N7762C', tail: 'N7762C', make: 'Cessna', model: '172 Skyhawk', year: 2001, status: 'airworthy', lastInspection: '2025-12-15', nextDue: '2026-12-15', totalTime: 5632, notes: '' },
  { id: 'N55KL', tail: 'N55KL', make: 'Piper', model: 'PA-44 Seminole', year: 2008, status: 'grounded', lastInspection: '2025-09-09', nextDue: '2026-09-09', totalTime: 3390, notes: 'Grounded pending landing gear inspection.' },
  { id: 'N2209F', tail: 'N2209F', make: 'Diamond', model: 'DA40-XLS', year: 2015, status: 'airworthy', lastInspection: '2026-03-01', nextDue: '2027-03-01', totalTime: 1788, notes: '' },
];

const INITIAL_REMINDERS: Reminder[] = [
  { id: 'R-201', tail: 'N44XA', type: 'Annual Inspection', category: 'Inspection', dueDate: '2026-03-10', notes: '' },
  { id: 'R-202', tail: 'N55KL', type: 'Altimeter / Static Check', category: 'Avionics', dueDate: '2026-03-22', notes: '' },
  { id: 'R-203', tail: 'N182TW', type: 'Pitot-Static Check', category: 'Avionics', dueDate: '2026-03-28', notes: '' },
  { id: 'R-204', tail: 'N44XA', type: 'ELT Battery Replacement', category: 'Equipment', dueDate: '2026-04-05', notes: '' },
  { id: 'R-205', tail: 'N7762C', type: 'Oil Change', category: 'Engine', dueDate: '2026-04-12', notes: '' },
  { id: 'R-206', tail: 'N8801B', type: 'VOR Check', category: 'Avionics', dueDate: '2026-04-19', notes: '' },
  { id: 'R-207', tail: 'N2209F', type: '50-Hour Inspection', category: 'Inspection', dueDate: '2026-05-01', notes: '' },
];

function nextWorkOrderId(existing: WorkOrder[]): string {
  const max = existing.reduce((m, wo) => {
    const n = parseInt(wo.id.replace('WO-', '')) || 0;
    return Math.max(m, n);
  }, 1000);
  return `WO-${max + 1}`;
}

function nextReminderId(existing: Reminder[]): string {
  const max = existing.reduce((m, r) => {
    const n = parseInt(r.id.replace('R-', '')) || 0;
    return Math.max(m, n);
  }, 200);
  return `R-${max + 1}`;
}

interface StoreContextType {
  workOrders: WorkOrder[];
  aircraft: Aircraft[];
  reminders: Reminder[];
  addWorkOrder: (wo: Omit<WorkOrder, 'id'>) => void;
  updateWorkOrder: (id: string, updates: Partial<WorkOrder>) => void;
  deleteWorkOrder: (id: string) => void;
  addAircraft: (ac: Omit<Aircraft, 'id'>) => void;
  updateAircraft: (id: string, updates: Partial<Aircraft>) => void;
  deleteAircraft: (id: string) => void;
  addReminder: (r: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const [woRaw, acRaw, rmRaw] = await Promise.all([
        AsyncStorage.getItem(KEYS.workOrders),
        AsyncStorage.getItem(KEYS.aircraft),
        AsyncStorage.getItem(KEYS.reminders),
      ]);
      setWorkOrders(woRaw ? JSON.parse(woRaw) : INITIAL_WORK_ORDERS);
      setAircraft(acRaw ? JSON.parse(acRaw) : INITIAL_AIRCRAFT);
      setReminders(rmRaw ? JSON.parse(rmRaw) : INITIAL_REMINDERS);
      setLoaded(true);
    }
    load();
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEYS.workOrders, JSON.stringify(workOrders));
  }, [workOrders, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEYS.aircraft, JSON.stringify(aircraft));
  }, [aircraft, loaded]);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEYS.reminders, JSON.stringify(reminders));
  }, [reminders, loaded]);

  const addWorkOrder = useCallback((wo: Omit<WorkOrder, 'id'>) => {
    setWorkOrders((prev) => {
      const next = [{ ...wo, id: nextWorkOrderId(prev) }, ...prev];
      return next;
    });
  }, []);

  const updateWorkOrder = useCallback((id: string, updates: Partial<WorkOrder>) => {
    setWorkOrders((prev) => prev.map((wo) => (wo.id === id ? { ...wo, ...updates } : wo)));
  }, []);

  const deleteWorkOrder = useCallback((id: string) => {
    setWorkOrders((prev) => prev.filter((wo) => wo.id !== id));
  }, []);

  const addAircraft = useCallback((ac: Omit<Aircraft, 'id'>) => {
    setAircraft((prev) => [{ ...ac, id: ac.tail }, ...prev]);
  }, []);

  const updateAircraft = useCallback((id: string, updates: Partial<Aircraft>) => {
    setAircraft((prev) => prev.map((ac) => (ac.id === id ? { ...ac, ...updates } : ac)));
  }, []);

  const deleteAircraft = useCallback((id: string) => {
    setAircraft((prev) => prev.filter((ac) => ac.id !== id));
  }, []);

  const addReminder = useCallback((r: Omit<Reminder, 'id'>) => {
    setReminders((prev) => {
      const next = [{ ...r, id: nextReminderId(prev) }, ...prev];
      return next;
    });
  }, []);

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <StoreContext.Provider
      value={{
        workOrders, aircraft, reminders,
        addWorkOrder, updateWorkOrder, deleteWorkOrder,
        addAircraft, updateAircraft, deleteAircraft,
        addReminder, updateReminder, deleteReminder,
      }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
