import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DayBucket {
  label: string;
  dateKey: string;
  value: number;
}

const STORAGE_KEYS = {
  SNAPSHOT_COUNT: 'global_snapshot_count',
  SNAPSHOT_TS: 'global_snapshot_ts',
  BUCKETS: 'global_daily_buckets',
};

function getDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function weekdayShort(d: Date): string {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
}

export async function updateFromGlobalCount(currentCount: number, nowMs: number): Promise<void> {
  try {
    const [snapshotCountStr, , bucketsStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.SNAPSHOT_COUNT),
      AsyncStorage.getItem(STORAGE_KEYS.SNAPSHOT_TS),
      AsyncStorage.getItem(STORAGE_KEYS.BUCKETS),
    ]);

    const lastCount = snapshotCountStr ? parseInt(snapshotCountStr, 10) : undefined;
    // const lastTs = snapshotTsStr ? parseInt(snapshotTsStr, 10) : undefined;
    const buckets: Record<string, number> = bucketsStr ? JSON.parse(bucketsStr) : {};

    if (lastCount === undefined || isNaN(lastCount)) {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.SNAPSHOT_COUNT, String(currentCount)),
        AsyncStorage.setItem(STORAGE_KEYS.SNAPSHOT_TS, String(nowMs)),
      ]);
      return;
    }

    // Guard against duplicate updates in the same tick; only positive increases produce deltas.
    const delta = currentCount > lastCount ? (currentCount - lastCount) : 0;
    if (delta > 0) {
      const now = new Date(nowMs);
      const key = getDateKey(now);
      buckets[key] = (buckets[key] || 0) + delta;

      // Trim to last 30 calendar days (ensure zeros for missing days are fine at read)
      const keep: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const k = getDateKey(d);
        if (buckets[k]) keep[k] = buckets[k];
      }

      await AsyncStorage.setItem(STORAGE_KEYS.BUCKETS, JSON.stringify(keep));
    }

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.SNAPSHOT_COUNT, String(currentCount)),
      AsyncStorage.setItem(STORAGE_KEYS.SNAPSHOT_TS, String(nowMs)),
    ]);
  } catch {
    // best-effort; ignore errors
  }
}

export async function getLastNDaysGlobalBuckets(days: number): Promise<DayBucket[]> {
  const bucketsStr = await AsyncStorage.getItem(STORAGE_KEYS.BUCKETS);
  const map: Record<string, number> = bucketsStr ? JSON.parse(bucketsStr) : {};
  const today = new Date();
  const result: DayBucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = getDateKey(d);
    result.push({ label: weekdayShort(d), dateKey: key, value: map[key] || 0 });
  }
  return result;
}

export function computeNiceMax125(values: number[]): number {
  const max = values.reduce((m, v) => (v > m ? v : m), 0);
  if (max <= 0) return 1;
  const exp = Math.floor(Math.log10(max));
  const pow10 = Math.pow(10, exp);
  const n = max / pow10;
  let nice: number;
  if (n <= 1) nice = 1;
  else if (n <= 2) nice = 2;
  else if (n <= 5) nice = 5;
  else nice = 10;
  return nice * pow10;
}


