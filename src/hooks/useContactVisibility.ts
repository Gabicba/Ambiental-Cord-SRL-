import { useState, useEffect } from 'react';

const STORAGE_KEY = 'ambiental_contact_visibility';

export function getContactVisibilityFromStorage(customerId: string, contactIndex: number): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return true;
    const map = JSON.parse(raw) as Record<string, Record<string, boolean>>;
    const customerMap = map[customerId];
    if (!customerMap) return true;
    return customerMap[String(contactIndex)] ?? true;
  } catch {
    return true;
  }
}

export function useContactVisibility(customerId: string): {
  getVisibility: (contactIndex: number) => boolean;
  setVisibility: (contactIndex: number, visible: boolean) => void;
} {
  const [map, setMap] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      return {};
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }, [map]);

  const getVisibility = (contactIndex: number): boolean => {
    const customerMap = map[customerId];
    if (!customerMap) return true;
    return customerMap[String(contactIndex)] ?? true;
  };

  const setVisibility = (contactIndex: number, visible: boolean) => {
    setMap((prev) => ({
      ...prev,
      [customerId]: {
        ...prev[customerId],
        [String(contactIndex)]: visible,
      },
    }));
  };

  return { getVisibility, setVisibility };
}