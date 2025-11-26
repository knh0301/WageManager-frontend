import React, { useState, useMemo } from "react";
import { MdArrowForwardIos } from "react-icons/md";
import WorkEditRequestBox from "../MonthlyCalendarPage/WorkEditRequestBox";
import "./WeeklyCalendar.css";

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const makeDateKey = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

const getKoreanDayLabel = (dayIndex) => {
  const map = ["일", "월", "화", "수", "목", "금", "토"];
  return map[dayIndex] || "";
};

// 주의 시작일(일요일)을 구하는 함수
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day); // 일요일로 이동
  return d;
};

// 주의 마지막일(토요일)을 구하는 함수
const getWeekEnd = (date) => {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // 토요일
  return end;
};

// 주차 계산 함수
const getWeekNumber = (date) => {
  const d = new Date(date);
  const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
  const firstDayOfWeek = firstDay.getDay();
  const daysSinceFirst = Math.floor((d.getDate() + firstDayOfWeek - 1) / 7) + 1;
  return daysSinceFirst;
};

// 예시 근무 데이터
const initialWorkRecords = {
  "2025-10-26": [], // 일요일 - 휴무
  "2025-10-27": [
    { id: 1, start: "15:00", end: "21:00", wage: 60180, place: "버거킹", breakMinutes: 60 },
    { id: 2, start: "22:00", end: "24:00", wage: 20060, place: "맥도날드", breakMinutes: 0 },
  ], // 월요일
  "2025-10-28": [], // 화요일 - 휴무
  "2025-10-29": [], // 수요일 - 휴무
  "2025-10-30": [], // 목요일 - 휴무
  "2025-10-31": [], // 금요일 - 휴무
};

function WeeklyCalendar() {
  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(today)
  );
  const [workRecords] = useState(initialWorkRecords);
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [editForm, setEditForm] = useState(null);

  // 현재 주의 일요일~토요일 날짜 배열
  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      days.push(date);
    }
    return days;
  }, [currentWeekStart]);

  // 주 표시 텍스트 (예: "2025년 10월 5주차")
  const weekTitle = useMemo(() => {
    const year = currentWeekStart.getFullYear();
    const month = currentWeekStart.getMonth() + 1;
    const weekNumber = getWeekNumber(currentWeekStart);
    return `${year}년 ${month}월 ${weekNumber}주차`;
  }, [currentWeekStart]);

  // 주간 근무시간 및 급여 계산
  const { totalHours, totalWage } = useMemo(() => {
    let totalMinutes = 0;
    let wage = 0;

    weekDays.forEach((date) => {
      const dateKey = makeDateKey(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const records = workRecords[dateKey] || [];

      records.forEach((record) => {
        const [sh, sm] = record.start.split(":").map(Number);
        const [eh, em] = record.end.split(":").map(Number);
        const diff = eh * 60 + em - (sh * 60 + sm);
        totalMinutes += diff;
        wage += record.wage;
      });
    });

    const hours = Math.floor(totalMinutes / 60);
    return { totalHours: hours, totalWage: wage };
  }, [weekDays, workRecords]);

  // 이전 주로 이동
  const handlePrevWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek);
    setSelectedDateKey(null);
    setEditForm(null);
  };

  // 다음 주로 이동
  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
    setSelectedDateKey(null);
    setEditForm(null);
  };

  // 날짜 클릭 핸들러
  const handleDateClick = (dateKey, recordId) => {
    if (selectedDateKey === dateKey && selectedRecordId === recordId) {
      // 같은 날짜/기록을 다시 클릭하면 닫기
      setSelectedDateKey(null);
      setSelectedRecordId(null);
      setEditForm(null);
      return;
    }

    setSelectedDateKey(dateKey);
    setSelectedRecordId(recordId);

    // 해당 기록의 데이터로 폼 초기화
    const records = workRecords[dateKey] || [];
    const record = records.find((r) => r.id === recordId);

    if (record) {
      const [year, month, day] = dateKey.split("-");
      const [sh, sm] = record.start.split(":");
      const [eh, em] = record.end.split(":");

      setEditForm({
        recordId: record.id,
        originalDateKey: dateKey,
        place: record.place,
        wage: record.wage,
        date: `${year}-${pad2(Number(month))}-${pad2(Number(day))}`,
        startHour: sh,
        startMinute: sm,
        endHour: eh,
        endMinute: em,
        breakMinutes: record.breakMinutes ?? 60,
      });
    }
  };

  // 근무 기록 정정 요청 확인
  const handleConfirmEdit = (form) => {
    // TODO: 백엔드로 수정 요청 보내기
    console.log("edit request payload:", form);
    setEditForm(null);
    setSelectedDateKey(null);
    setSelectedRecordId(null);
  };

  // 삭제 요청
  const handleDeleteRequest = (form) => {
    // TODO: 백엔드로 삭제 요청 보내기
    console.log("delete request payload:", form);
    setEditForm(null);
    setSelectedDateKey(null);
    setSelectedRecordId(null);
  };

  // 정정 요청 취소
  const handleCancelEdit = () => {
    setEditForm(null);
    setSelectedDateKey(null);
    setSelectedRecordId(null);
  };

  return (
    <div className="weekly-calendar">
      {/* 주 선택 네비게이션 */}
      <div className="weekly-nav">
        <button className="weekly-nav-arrow" onClick={handlePrevWeek}>
          <MdArrowForwardIos style={{ transform: "rotate(180deg)" }} />
        </button>
        <div className="weekly-nav-title">{weekTitle}</div>
        <button className="weekly-nav-arrow" onClick={handleNextWeek}>
          <MdArrowForwardIos />
        </button>
      </div>

      {/* 주간 근무시간 및 급여 카드 */}
      <div className="weekly-summary-row">
        <div className="weekly-summary-card">
          <div className="weekly-summary-label">주간 근무시간</div>
          <div className="weekly-summary-value">{totalHours}시간</div>
        </div>
        <div className="weekly-summary-card">
          <div className="weekly-summary-label">이번주 급여</div>
          <div className="weekly-summary-value">
            {totalWage.toLocaleString()}원
          </div>
        </div>
      </div>

      {/* 주간 캘린더 */}
      <div className="weekly-calendar-list">
        {weekDays.map((date) => {
          const dateKey = makeDateKey(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
          );
          const records = workRecords[dateKey] || [];
          const dayLabel = getKoreanDayLabel(date.getDay());
          const dayNumber = date.getDate();

          return (
            <div key={dateKey} className="weekly-day-item">
              <div className="weekly-day-header">
                <div className="weekly-day-date">
                  {dayNumber} {dayLabel}
                </div>
              </div>

              {records.length === 0 ? (
                <div className="weekly-day-off">휴무</div>
              ) : (
                <div className="weekly-day-records">
                  {records.map((record) => {
                    const isSelected =
                      selectedDateKey === dateKey &&
                      selectedRecordId === record.id;

                    return (
                      <React.Fragment key={record.id}>
                        <div
                          className={`weekly-record-item ${
                            isSelected ? "selected" : ""
                          }`}
                          onClick={() => handleDateClick(dateKey, record.id)}
                        >
                          <div className="weekly-record-time">
                            {record.start} ~ {record.end}
                          </div>
                          <div className="weekly-record-place">
                            {record.place}
                          </div>
                        </div>

                        {isSelected && editForm && (
                          <div className="weekly-edit-box-wrapper">
                            <WorkEditRequestBox
                              form={editForm}
                              setForm={setEditForm}
                              onConfirm={handleConfirmEdit}
                              onDelete={handleDeleteRequest}
                              onCancel={handleCancelEdit}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyCalendar;

