// src/utils.ts
export const formatTimeTo24Hour = (time: string | undefined | null): string => {
    if (!time) return "00:00";
    try {
      const [hours, minutes] = time.split(":").map(Number);
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    } catch {
      return "00:00";
    }
  };
  