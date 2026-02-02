/**
 * Utility functions for date formatting in US format (MM/DD/YYYY)
 */

/**
 * Format a date string or Date object to US date format (MM/DD/YYYY)
 * @param date - Date string (YYYY-MM-DD or any valid date format) or Date object
 * @returns Formatted date string in MM/DD/YYYY format
 */
export function formatDateUS(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  return `${month}/${day}/${year}`;
}

/**
 * Get current date in US format (MM/DD/YYYY)
 * @returns Current date as MM/DD/YYYY
 */
export function getCurrentDateUS(): string {
  return formatDateUS(new Date());
}

/**
 * Get current date and time in US format (MM/DD/YYYY HH:MM:SS AM/PM)
 * @returns Current date and time in US format
 */
export function getCurrentDateTimeUS(): string {
  const now = new Date();
  const date = formatDateUS(now);
  const time = now.toLocaleTimeString('en-US');
  return `${date} ${time}`;
}

/**
 * Convert ISO date string (YYYY-MM-DD) to US format (MM/DD/YYYY)
 * @param isoDate - ISO date string (YYYY-MM-DD)
 * @returns Date in MM/DD/YYYY format
 */
export function isoToUSDate(isoDate: string): string {
  if (!isoDate) return '';
  return formatDateUS(isoDate);
}

/**
 * Convert US date (MM/DD/YYYY) to ISO format (YYYY-MM-DD) for input fields
 * @param usDate - US formatted date (MM/DD/YYYY)
 * @returns ISO date string (YYYY-MM-DD)
 */
export function usDateToISO(usDate: string): string {
  if (!usDate) return '';
  
  const parts = usDate.split('/');
  if (parts.length !== 3) return '';
  
  const month = parts[0].padStart(2, '0');
  const day = parts[1].padStart(2, '0');
  const year = parts[2];
  
  return `${year}-${month}-${day}`;
}

/**
 * Format ISO datetime string to DD/MM/YYYY H:MM AM/PM format
 * @param isoDateTime - ISO datetime string (YYYY-MM-DDTHH:MM:SS or YYYY-MM-DD HH:MM:SS)
 * @returns Formatted datetime string in DD/MM/YYYY H:MM AM/PM format
 */
export function formatDateTimeUS(isoDateTime: string): string {
  if (!isoDateTime) return '';
  
  const dateObj = new Date(isoDateTime);
  
  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  
  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  
  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
}