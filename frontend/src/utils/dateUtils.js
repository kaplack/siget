// utils/dateUtils.js

// Checks if a date is a working day (Monday to Friday)
export const isWorkingDay = (date, holidays = []) => {
  const day = date.getDay();
  const formatted = date.toISOString().split("T")[0];
  return day >= 1 && day <= 5 && !holidays.includes(formatted);
};

// Calculates number of business days between two dates
export const businessDaysBetween = (start, end, holidays = []) => {
  let count = 0;
  let current = new Date(start);

  while (current <= end) {
    if (isWorkingDay(current, holidays)) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};

// Adds business days to a date
export const addBusinessDays = (start, daysToAdd, holidays = []) => {
  const date = new Date(start);
  let added = 0;

  while (added < daysToAdd) {
    date.setDate(date.getDate() + 1);
    if (isWorkingDay(date, holidays)) added++;
  }

  return date;
};
