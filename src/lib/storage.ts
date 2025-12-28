// Local storage utilities for edit history

export interface EditHistoryItem {
  id: string;
  originalUrl: string;
  transformedUrl: string;
  prompt: string;
  operations: string;
  timestamp: number;
  fileName: string;
}

const HISTORY_KEY = 'image_transform_history';
const MAX_HISTORY_ITEMS = 50;

export function getEditHistory(): EditHistoryItem[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as EditHistoryItem[];
  } catch {
    return [];
  }
}

export function addToHistory(item: Omit<EditHistoryItem, 'id' | 'timestamp'>): EditHistoryItem {
  const history = getEditHistory();
  
  const newItem: EditHistoryItem = {
    ...item,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  const updatedHistory = [newItem, ...history].slice(0, MAX_HISTORY_ITEMS);
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (e) {
    console.error('Failed to save to history:', e);
  }

  return newItem;
}

export function removeFromHistory(id: string): void {
  const history = getEditHistory();
  const filtered = history.filter(item => item.id !== id);
  
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to update history:', e);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}

export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;

  // Less than a minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }

  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }

  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // Default to date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}
