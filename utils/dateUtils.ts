// Date utility functions for the Baby Bottle Tracker app

export const formatTime = (date: Date, language: string = 'en'): string => {
  const locale = language === 'he' ? 'he-IL' : language === 'fr' ? 'fr-FR' : 'en-US';
  
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDate = (date: Date, language: string = 'en'): string => {
  const locale = language === 'he' ? 'he-IL' : language === 'fr' ? 'fr-FR' : 'en-US';
  
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (date: Date, language: string = 'en'): string => {
  const locale = language === 'he' ? 'he-IL' : language === 'fr' ? 'fr-FR' : 'en-US';
  
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTimeAgo = (date: Date, language: string = 'en'): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return language === 'fr' ? 'À l\'instant' : language === 'he' ? 'עכשיו' : 'Just now';
  }
  
  if (diffInMinutes < 60) {
    const minutes = diffInMinutes === 1 ? 1 : diffInMinutes;
    if (language === 'fr') {
      return `${minutes} min${minutes > 1 ? 's' : ''}`;
    } else if (language === 'he') {
      return `${minutes} דקות`;
    } else {
      return `${minutes} min${minutes > 1 ? 's' : ''}`;
    }
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const hours = diffInHours === 1 ? 1 : diffInHours;
    if (language === 'fr') {
      return `${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (language === 'he') {
      return `${hours} שעות`;
    } else {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  const days = diffInDays === 1 ? 1 : diffInDays;
  if (language === 'fr') {
    return `${days} jour${days > 1 ? 's' : ''}`;
  } else if (language === 'he') {
    return `${days} ימים`;
  } else {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
};

export const roundToNearest15Minutes = (date: Date): Date => {
  const minutes = date.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  
  const roundedDate = new Date(date);
  roundedDate.setMinutes(roundedMinutes);
  roundedDate.setSeconds(0);
  roundedDate.setMilliseconds(0);
  
  return roundedDate;
};

export const getStartOfDay = (date: Date): Date => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

export const getEndOfDay = (date: Date): Date => {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay;
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
};

export const getRelativeDateString = (date: Date, language: string = 'en'): string => {
  if (isToday(date)) {
    return language === 'fr' ? 'Aujourd\'hui' : language === 'he' ? 'היום' : 'Today';
  }
  
  if (isYesterday(date)) {
    return language === 'fr' ? 'Hier' : language === 'he' ? 'אתמול' : 'Yesterday';
  }
  
  return formatDate(date, language);
}; 

// 🔥 UPDATED: Function to adjust date based on time logic
// Only applies automatic date adjustment if user hasn't explicitly changed the date
export const adjustDateForTimeLogic = (selectedTime: Date, userExplicitlySelectedDate: boolean = false): Date => {
  const now = new Date();
  const currentHour = now.getHours();
  const selectedHour = selectedTime.getHours();
  
  // If user explicitly selected a date, respect their choice
  if (userExplicitlySelectedDate) {
    return selectedTime;
  }
  
  // If current time is before noon (before 12:00) and selected time is after noon (after 12:00)
  // Then the selected time should be from yesterday (only for time-only selections)
  if (currentHour < 12 && selectedHour >= 12) {
    const adjustedDate = new Date(selectedTime);
    adjustedDate.setDate(adjustedDate.getDate() - 1);
    return adjustedDate;
  }
  
  return selectedTime;
};

// 🔥 NEW: Test function to verify the logic works correctly
export const testAdjustDateForTimeLogic = (): void => {
  console.log('🧪 Testing adjustDateForTimeLogic...');
  
  // Test case 1: Current time 2 AM, selected time 11 PM -> should be yesterday
  const testDate1 = new Date();
  testDate1.setHours(2, 0, 0, 0); // 2 AM
  
  const selectedTime1 = new Date();
  selectedTime1.setHours(23, 0, 0, 0); // 11 PM
  
  const result1 = adjustDateForTimeLogic(selectedTime1);
  console.log('Test 1 - Current: 2 AM, Selected: 11 PM, Result:', result1.toDateString());
  
  // Test case 2: Current time 2 PM, selected time 11 PM -> should be today
  const testDate2 = new Date();
  testDate2.setHours(14, 0, 0, 0); // 2 PM
  
  const selectedTime2 = new Date();
  selectedTime2.setHours(23, 0, 0, 0); // 11 PM
  
  const result2 = adjustDateForTimeLogic(selectedTime2);
  console.log('Test 2 - Current: 2 PM, Selected: 11 PM, Result:', result2.toDateString());
  
  // Test case 3: Current time 2 AM, selected time 1 AM -> should be today
  const selectedTime3 = new Date();
  selectedTime3.setHours(1, 0, 0, 0); // 1 AM
  
  const result3 = adjustDateForTimeLogic(selectedTime3);
  console.log('Test 3 - Current: 2 AM, Selected: 1 AM, Result:', result3.toDateString());
}; 