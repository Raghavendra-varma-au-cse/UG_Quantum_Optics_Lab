"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";

/**
 * Local-first persistence. Nothing here is sent to a server. The database is
 * versioned so a future release can migrate without discarding notebooks.
 */

interface QolSchema extends DBSchema {
  progress: { key: string; value: unknown };
  notebook: { key: string; value: unknown; indexes: { "by-date": string; "by-experiment": string } };
  datasets: { key: string; value: unknown; indexes: { "by-date": string; "by-experiment": string } };
  attempts: { key: string; value: unknown; indexes: { "by-date": string } };
  settings: { key: string; value: unknown };
}

let dbPromise: Promise<IDBPDatabase<QolSchema>> | null = null;

export function getDb(): Promise<IDBPDatabase<QolSchema>> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available in this environment."));
  }
  if (!dbPromise) {
    dbPromise = openDB<QolSchema>("quantum-optics-lab", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("progress")) db.createObjectStore("progress");
        if (!db.objectStoreNames.contains("notebook")) {
          const store = db.createObjectStore("notebook", { keyPath: "id" });
          store.createIndex("by-date", "date");
          store.createIndex("by-experiment", "experimentSlug");
        }
        if (!db.objectStoreNames.contains("datasets")) {
          const store = db.createObjectStore("datasets", { keyPath: "id" });
          store.createIndex("by-date", "createdAt");
          store.createIndex("by-experiment", "experimentSlug");
        }
        if (!db.objectStoreNames.contains("attempts")) {
          const store = db.createObjectStore("attempts", { keyPath: "id" });
          store.createIndex("by-date", "startedAt");
        }
        if (!db.objectStoreNames.contains("settings")) db.createObjectStore("settings");
      }
    });
  }
  return dbPromise;
}

/* -------------------------------------------------------------------------- */
/* Zustand-compatible async storage                                            */
/* -------------------------------------------------------------------------- */

export const idbStorage = {
  async getItem(name: string): Promise<string | null> {
    try {
      const db = await getDb();
      const value = await db.get("progress", name);
      return typeof value === "string" ? value : value ? JSON.stringify(value) : null;
    } catch {
      return null;
    }
  },
  async setItem(name: string, value: string): Promise<void> {
    try {
      const db = await getDb();
      await db.put("progress", value, name);
    } catch {
      // Storage may be unavailable (private mode); the app remains usable.
    }
  },
  async removeItem(name: string): Promise<void> {
    try {
      const db = await getDb();
      await db.delete("progress", name);
    } catch {
      /* noop */
    }
  }
};

/* -------------------------------------------------------------------------- */
/* Generic record helpers                                                      */
/* -------------------------------------------------------------------------- */

export async function saveNotebookRecord<T>(record: T): Promise<void> {
  const db = await getDb();
  await db.put("notebook", record);
}

export async function loadNotebookRecords<T>(): Promise<T[]> {
  try {
    const db = await getDb();
    return (await db.getAll("notebook")) as T[];
  } catch {
    return [];
  }
}

export async function deleteNotebookRecord(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("notebook", id);
}

export async function saveDataset<T>(dataset: T): Promise<void> {
  const db = await getDb();
  await db.put("datasets", dataset);
}

export async function loadDatasets<T>(): Promise<T[]> {
  try {
    const db = await getDb();
    return (await db.getAll("datasets")) as T[];
  } catch {
    return [];
  }
}

export async function deleteDataset(id: string): Promise<void> {
  const db = await getDb();
  await db.delete("datasets", id);
}

export async function saveAttempt<T>(attempt: T): Promise<void> {
  const db = await getDb();
  await db.put("attempts", attempt);
}

export async function loadAttempts<T>(): Promise<T[]> {
  try {
    const db = await getDb();
    return (await db.getAll("attempts")) as T[];
  } catch {
    return [];
  }
}

export async function exportAllLocalData(): Promise<{
  exportedAt: string;
  version: number;
  progress: unknown[];
  notebook: unknown[];
  datasets: unknown[];
  attempts: unknown[];
}> {
  try {
    const db = await getDb();
    return {
      exportedAt: new Date().toISOString(),
      version: 1,
      progress: await db.getAll("progress"),
      notebook: await db.getAll("notebook"),
      datasets: await db.getAll("datasets"),
      attempts: await db.getAll("attempts")
    };
  } catch {
    return { exportedAt: new Date().toISOString(), version: 1, progress: [], notebook: [], datasets: [], attempts: [] };
  }
}

export async function estimateStorage(): Promise<{ usage: number; quota: number } | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.estimate) return null;
  const { usage, quota } = await navigator.storage.estimate();
  return { usage: usage ?? 0, quota: quota ?? 0 };
}
