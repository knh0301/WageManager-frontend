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

// 시간 형식 변환 함수 ({hour, minute} -> "HH:MM")
export const formatTime = (timeObj) => {
  if (!timeObj || timeObj.hour === undefined || timeObj.minute === undefined) return "";
  const hour = String(timeObj.hour).padStart(2, "0");
  const minute = String(timeObj.minute).padStart(2, "0");
  return `${hour}:${minute}`;
};

