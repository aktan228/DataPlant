"use client";

import { createContext } from "react";
import * as React from "react";
import { fetchScans } from "./api";
import type {
  DroneProfile,
  FieldZone,
  NotificationAlert,
  ScanRecord,
  UserPreferences,
} from "./types";

const PREFS_KEY = "dataplant.prefs";
const SCANS_KEY = "dataplant.scans";
const COUNT_KEY = "dataplant.scanCount";
const FREE_SCAN_LIMIT = 3;

const defaultPrefs: UserPreferences = {
  userName: "User",
  farmName: "DataPlant",
  location: "Kyrgyzstan",
  tier: "free",
  notifyOnHighRisk: true,
  droneAutoLaunch: false,
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface AppContextValue {
  zones: FieldZone[];
  alerts: NotificationAlert[];
  drones: DroneProfile[];
  prefs: UserPreferences;
  selectedZone: FieldZone | null;
  scans: ScanRecord[];
  scansToday: number;
  canCloudScan: boolean;
  freeScanLimit: number;
  setSelectedZone: (id: string | null) => void;
  markAllAlertsRead: () => void;
  toggleAlertRead: (id: string) => void;
  updatePrefs: (patch: Partial<UserPreferences>) => void;
  updateDrone: (id: string, patch: Partial<DroneProfile>) => void;
  addScan: (scan: ScanRecord) => void;
  markScansSynced: () => void;
  registerCloudScan: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [zones] = React.useState<FieldZone[]>([]);
  const [alerts, setAlerts] = React.useState<NotificationAlert[]>([]);
  const [drones, setDrones] = React.useState<DroneProfile[]>([]);
  const [prefs, setPrefs] = React.useState<UserPreferences>(defaultPrefs);
  const [selectedZoneId, setSelectedZoneId] = React.useState<string | null>(null);
  const [scans, setScans] = React.useState<ScanRecord[]>([]);
  const [scanCount, setScanCount] = React.useState<{ date: string; count: number }>({
    date: todayStr(),
    count: 0,
  });

  // Hydrate persisted state once on mount (localStorage is client-only, so this
  // must run after render to avoid SSR hydration mismatches).
  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time client hydration from localStorage */
    try {
      const p = localStorage.getItem(PREFS_KEY);
      if (p) setPrefs({ ...defaultPrefs, ...JSON.parse(p) });
      const s = localStorage.getItem(SCANS_KEY);
      if (s) setScans(JSON.parse(s));
      const c = localStorage.getItem(COUNT_KEY);
      if (c) {
        const parsed = JSON.parse(c);
        setScanCount(parsed.date === todayStr() ? parsed : { date: todayStr(), count: 0 });
      }
    } catch {
      /* ignore corrupt storage */
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  React.useEffect(() => {
    fetchScans()
      .then((remoteScans) => {
        setScans((prev) => {
          const byId = new Map<string, ScanRecord>();
          [...remoteScans, ...prev].forEach((scan) => byId.set(scan.id, scan));
          const next = Array.from(byId.values())
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 50);
          try {
            localStorage.setItem(SCANS_KEY, JSON.stringify(next));
          } catch {}
          return next;
        });
      })
      .catch(() => {});
  }, []);

  const updatePrefs = React.useCallback(
    (patch: Partial<UserPreferences>) => {
      setPrefs((prev) => {
        const next = { ...prev, ...patch };
        try {
          localStorage.setItem(PREFS_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [],
  );

  const updateDrone = React.useCallback((id: string, patch: Partial<DroneProfile>) => {
    setDrones((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const setSelectedZone = React.useCallback((id: string | null) => setSelectedZoneId(id), []);

  const markAllAlertsRead = React.useCallback(
    () => setAlerts((prev) => prev.map((a) => ({ ...a, unread: false }))),
    [],
  );

  const toggleAlertRead = React.useCallback(
    (id: string) =>
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, unread: !a.unread } : a))),
    [],
  );

  const addScan = React.useCallback((scan: ScanRecord) => {
    setScans((prev) => {
      const next = [scan, ...prev].slice(0, 50);
      try {
        localStorage.setItem(SCANS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const markScansSynced = React.useCallback(() => {
    setScans((prev) => {
      const next = prev.map((s) => ({ ...s, synced: true }));
      try {
        localStorage.setItem(SCANS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const registerCloudScan = React.useCallback(() => {
    setScanCount((prev) => {
      const base = prev.date === todayStr() ? prev : { date: todayStr(), count: 0 };
      const next = { date: base.date, count: base.count + 1 };
      try {
        localStorage.setItem(COUNT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const scansToday = scanCount.date === todayStr() ? scanCount.count : 0;
  const canCloudScan = prefs.tier === "premium" || scansToday < FREE_SCAN_LIMIT;
  const selectedZone = zones.find((z) => z.id === selectedZoneId) ?? null;

  const value: AppContextValue = {
    zones,
    alerts,
    drones,
    prefs,
    selectedZone,
    scans,
    scansToday,
    canCloudScan,
    freeScanLimit: FREE_SCAN_LIMIT,
    setSelectedZone,
    markAllAlertsRead,
    toggleAlertRead,
    updatePrefs,
    updateDrone,
    addScan,
    markScansSynced,
    registerCloudScan,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppProvider>");
  return ctx;
}
