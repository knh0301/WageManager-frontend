import { useState } from "react";
import WeeklyCalendar from "../../components/worker/WeeklyCalendar/WeeklyCalendar";

// API를 받기 전 테스트용 임시 데이터
const initialWorkRecords = {
  "2025-11-23": [], // 일요일 - 휴무
  "2025-11-24": [
    { id: 1, start: "15:00", end: "21:00", wage: 60180, place: "버거킹", breakMinutes: 60 },
    { id: 2, start: "22:00", end: "24:00", wage: 20060, place: "맥도날드", breakMinutes: 0 },
  ], // 월요일
  "2025-11-25": [], // 화요일 - 휴무
  "2025-11-26": [], // 수요일 - 휴무
  "2025-11-27": [], // 목요일 - 휴무
  "2025-11-28": [], // 금요일 - 휴무
  "2025-11-29": [], // 토요일 - 휴무
};

export default function WeeklyCalendarPage() {
  // TODO: 나중에 API로 교체
  const [workRecords] = useState(initialWorkRecords);

  return (
    <div className="worker-content-frame weekly-calendar-wrapper">
      <WeeklyCalendar workRecords={workRecords} />
    </div>
  );
}
