import React, { useState, useMemo } from "react";
import PropTypes from "prop-types";
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

function WeeklyCalendar({ workRecords = {} }) {
  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState(() =>
    getWeekStart(today)
  );
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

  // 주 표시 텍스트 (예: "2025년 11월 5주차")
  // 규칙: 주에 포함된 날짜 중 해당 월의 1일이 포함된 경우 그 월을 기준으로 표시
  const weekTitle = useMemo(() => {
    // 주에 포함된 날짜 중에서 1일인 날짜를 찾음
    let targetYear = currentWeekStart.getFullYear();
    let targetMonth = currentWeekStart.getMonth();
    let foundFirstDay = false;

    // 주에 포함된 모든 날짜를 확인하여 1일이 있는지 찾음
    for (const date of weekDays) {
      if (date.getDate() === 1) {
        // 1일을 찾았으면 그 날짜의 월을 기준으로 사용
        targetYear = date.getFullYear();
        targetMonth = date.getMonth();
        foundFirstDay = true;
        break;
      }
    }

    // 1일이 주에 포함되어 있지 않은 경우, 주의 시작일이 속한 월을 기준으로 사용
    // (이 경우는 해당 월의 1일이 포함된 주가 아닌 경우)
    if (!foundFirstDay) {
      targetYear = currentWeekStart.getFullYear();
      targetMonth = currentWeekStart.getMonth();
    }

    // 해당 월의 1일이 포함된 주의 일요일을 기준으로 주차 계산
    const firstDay = new Date(targetYear, targetMonth, 1);
    const firstDayWeekStart = getWeekStart(firstDay);
    const diffTime = currentWeekStart - firstDayWeekStart;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;

    return `${targetYear}년 ${targetMonth + 1}월 ${weekNumber}주차`;
  }, [currentWeekStart, weekDays]);

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
              <div className="weekly-day-left">
                <div className="weekly-day-number">{dayNumber}</div>
                <div className="weekly-day-label">{dayLabel}</div>
              </div>
              <div className="weekly-day-divider"></div>
              <div className="weekly-day-right">
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeeklyCalendar;

WeeklyCalendar.propTypes = {
  workRecords: PropTypes.objectOf(
    PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        start: PropTypes.string.isRequired,
        end: PropTypes.string.isRequired,
        wage: PropTypes.number.isRequired,
        place: PropTypes.string.isRequired,
        breakMinutes: PropTypes.number,
      })
    )
  ),
};

