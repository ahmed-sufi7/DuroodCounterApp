// Format number with commas (Indian numbering system)
export function formatNumber(num: number): string {
  return num.toLocaleString('en-IN');
}

// Calculate progress percentage towards target
export function calculateProgress(current: number, target: number): number {
  return Math.min((current / target) * 100, 100);
}

// Calculate countdown to Milad un Nabi 2025 (estimated date: September 2025)
export function getCountdownToMilad(): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const miladDate = new Date('2025-09-15T00:00:00Z'); // Estimated date
  const now = new Date();
  const diff = miladDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

// Format countdown string
export function formatCountdown(countdown: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}): string {
  const { days, hours, minutes, seconds } = countdown;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Target count constant
export const TARGET_COUNT = 150000000; // 15 crore 