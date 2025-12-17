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

