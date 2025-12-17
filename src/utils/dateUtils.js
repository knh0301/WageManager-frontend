// 날짜 형식 변환 함수 (2025-12-17 -> 2025년 12월 17일)
export const formatDateToKorean = (dateString) => {
  if (!dateString) return "";
  try {
    const [year, month, day] = dateString.split("-");
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  } catch {
    return dateString;
  }
};

// 날짜 형식 변환 함수 (2025-12-17 -> 12월 17일)
export const formatDateToMonthDay = (dateString) => {
  if (!dateString) return "";
  try {
    const [, month, day] = dateString.split("-");
    return `${parseInt(month)}월 ${parseInt(day)}일`;
  } catch {
    return dateString;
  }
};

// 시간 형식 변환 함수 ({hour, minute} 또는 "HH:mm:ss" -> "HH:MM")
export const formatTime = (timeObj) => {
  if (!timeObj) return "";
  
  // 문자열 형식인 경우 ("HH:mm:ss" -> "HH:mm")
  if (typeof timeObj === "string") {
    try {
      const [hour, minute] = timeObj.split(":");
      if (hour && minute) {
        return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
      }
    } catch {
      return "";
    }
  }
  
  // 객체 형식인 경우 ({hour, minute} -> "HH:mm")
  if (timeObj.hour !== undefined && timeObj.minute !== undefined) {
    const hour = String(timeObj.hour).padStart(2, "0");
    const minute = String(timeObj.minute).padStart(2, "0");
    return `${hour}:${minute}`;
  }
  
  return "";
};

