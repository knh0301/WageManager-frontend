import { useMemo, useState, useEffect } from "react";
import "../../styles/dailyCalendarPage.css";

// 날짜를 키로 사용하는 헬퍼 함수
const getDateKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const scheduleDataByWorkplaceAndDate = {
  맥도날드: {
    "2025-11-29": [
      {
        id: 1,
        name: "오지환",
        start: "07:00",
        end: "16:00",
        startHour: 7,
        durationHours: 9,
      },
      {
        id: 2,
        name: "문보경",
        start: "04:30",
        end: "14:30",
        startHour: 4.5,
        durationHours: 10,
      },
      {
        id: 3,
        name: "홍창기",
        start: "10:00",
        end: "15:00",
        startHour: 10,
        durationHours: 5,
      },
      {
        id: 4,
        name: "신민재",
        start: "12:00",
        end: "17:00",
        startHour: 12,
        durationHours: 5,
      },
      {
        id: 5,
        name: "오스틴",
        start: "12:00",
        end: "19:00",
        startHour: 12,
        durationHours: 7,
      },
    ],
    "2025-11-30": [
      {
        id: 1,
        name: "오지환",
        start: "08:00",
        end: "17:00",
        startHour: 8,
        durationHours: 9,
      },
      {
        id: 2,
        name: "문보경",
        start: "05:00",
        end: "15:00",
        startHour: 5,
        durationHours: 10,
      },
      {
        id: 3,
        name: "홍창기",
        start: "11:00",
        end: "16:00",
        startHour: 11,
        durationHours: 5,
      },
    ],
    "2025-11-20": [
      {
        id: 1,
        name: "오지환",
        start: "09:00",
        end: "18:00",
        startHour: 9,
        durationHours: 9,
      },
      {
        id: 4,
        name: "신민재",
        start: "13:00",
        end: "18:00",
        startHour: 13,
        durationHours: 5,
      },
      {
        id: 5,
        name: "오스틴",
        start: "13:00",
        end: "20:00",
        startHour: 13,
        durationHours: 7,
      },
    ],
  },
  스타벅스: {
    "2025-11-29": [
      {
        id: 6,
        name: "김민수",
        start: "08:00",
        end: "16:00",
        startHour: 8,
        durationHours: 8,
      },
      {
        id: 7,
        name: "이지은",
        start: "09:00",
        end: "17:00",
        startHour: 9,
        durationHours: 8,
      },
    ],
    "2025-11-30": [
      {
        id: 6,
        name: "김민수",
        start: "07:00",
        end: "15:00",
        startHour: 7,
        durationHours: 8,
      },
    ],
  },
  롯데리아: {
    "2025-11-29": [
      {
        id: 8,
        name: "박준호",
        start: "10:00",
        end: "18:00",
        startHour: 10,
        durationHours: 8,
      },
    ],
  },
  버거킹: {},
  KFC: {},
};

const hours = Array.from({ length: 24 }, (_, idx) => idx);

const isSameDate = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const buildCalendarCells = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startDay = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];

  for (let i = startDay - 1; i >= 0; i--) {
    cells.push({
      date: new Date(year, month - 1, daysInPrevMonth - i),
      currentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({
      date: new Date(year, month, i),
      currentMonth: true,
    });
  }

  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({
      date: new Date(year, month + 1, nextDay),
      currentMonth: false,
    });
    nextDay += 1;
  }

  return cells;
};

const workplaces = ["맥도날드", "스타벅스", "롯데리아", "버거킹", "KFC"];

export default function DailyCalendarPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [displayMonth, setDisplayMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedWorkplace, setSelectedWorkplace] = useState("맥도날드");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  const dateKey = getDateKey(selectedDate);
  const workplaceSchedules =
    scheduleDataByWorkplaceAndDate[selectedWorkplace] || {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentScheduleData = workplaceSchedules[dateKey] || [];

  const scheduleWithLanes = useMemo(() => {
    // 시간순으로 정렬
    const sorted = [...currentScheduleData].sort(
      (a, b) => a.startHour - b.startHour
    );

    const lanes = []; // 각 레인에 있는 shift block들의 정보를 저장

    return sorted.map((item) => {
      const shiftStart = item.startHour;
      const shiftEnd = item.startHour + item.durationHours;

      // 겹치지 않는 레인 찾기
      let laneIndex = -1;
      for (let i = 0; i < lanes.length; i++) {
        // 해당 레인의 모든 block과 겹치지 않는지 확인
        const canFit = lanes[i].every(
          (block) => block.end <= shiftStart || block.start >= shiftEnd
        );
        if (canFit) {
          laneIndex = i;
          break;
        }
      }

      // 겹치지 않는 레인이 없으면 새 레인 생성
      if (laneIndex === -1) {
        laneIndex = lanes.length;
        lanes.push([{ start: shiftStart, end: shiftEnd }]);
      } else {
        // 레인에 새로운 block 추가
        lanes[laneIndex].push({ start: shiftStart, end: shiftEnd });
      }

      return { ...item, laneIndex };
    });
  }, [currentScheduleData]);

  const laneCount =
    scheduleWithLanes.reduce((max, item) => Math.max(max, item.laneIndex), 0) +
    1;

  const calendarCells = useMemo(
    () => buildCalendarCells(displayMonth),
    [displayMonth]
  );

  const handlePrevMonth = () => {
    setDisplayMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setDisplayMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
    setDisplayMonth(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  return (
    <div className="daily-page">
      <div className="daily-schedule-section">
        <div className="daily-schedule-header">
          <div className="daily-header-left">
            <select
              className="daily-workplace-select"
              value={selectedWorkplace}
              onChange={(e) => setSelectedWorkplace(e.target.value)}
            >
              {workplaces.map((workplace) => (
                <option key={workplace} value={workplace}>
                  {workplace}
                </option>
              ))}
            </select>
            <h2 className="daily-date-heading">
              {`${selectedDate.getMonth() + 1}/${selectedDate.getDate()}(${
                ["일", "월", "화", "수", "목", "금", "토"][
                  selectedDate.getDay()
                ]
              })`}{" "}
              스케줄표
            </h2>
          </div>
          <button type="button" className="daily-add-button">
            + 근무자 추가하기
          </button>
        </div>
        <div className="daily-schedule-card">
          <div className="daily-hours-row">
            {hours.map((hour) => (
              <div key={hour} className="daily-hour-cell">
                {hour}
              </div>
            ))}
          </div>
          <div
            className="daily-timeline"
            style={{ height: `${laneCount * 100 + 40}px` }}
          >
            {scheduleWithLanes.map((item) => {
              const left = (item.startHour / 24) * 100;
              const width = (item.durationHours / 24) * 100;
              const top = 20 + item.laneIndex * 100;
              return (
                <div
                  key={item.id}
                  className="daily-shift-block"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: `${top}px`,
                  }}
                >
                  <div className="shift-name">{item.name}</div>
                  <div className="shift-time">{`${item.start} - ${item.end}`}</div>
                  <div className="shift-duration">{item.durationHours}시간</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <aside className="daily-side-panel">
        <div className="daily-calendar-card">
          <div className="daily-calendar-header">
            <button type="button" onClick={handlePrevMonth}>
              {"<"}
            </button>
            <div className="calendar-month-year">
              {displayMonth.getFullYear()}년 {displayMonth.getMonth() + 1}월
            </div>
            <button type="button" onClick={handleNextMonth}>
              {">"}
            </button>
          </div>
          <div className="daily-calendar-grid">
            <div className="calendar-weekday">SUN</div>
            <div className="calendar-weekday">MON</div>
            <div className="calendar-weekday">TUE</div>
            <div className="calendar-weekday">WED</div>
            <div className="calendar-weekday">THU</div>
            <div className="calendar-weekday">FRI</div>
            <div className="calendar-weekday">SAT</div>
            {calendarCells.map(({ date, currentMonth }, idx) => {
              const isSelected = isSameDate(date, selectedDate);
              return (
                <div
                  key={`${date.toISOString()}-${idx}`}
                  className={`calendar-day ${isSelected ? "current" : ""} ${
                    currentMonth ? "" : "other"
                  }`}
                  onClick={() => handleSelectDate(date)}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
        </div>
        <div className="daily-summary-card">
          <div className="summary-time">
            <p>
              {`${currentTime.getMonth() + 1}/${currentTime.getDate()}(${
                ["일", "월", "화", "수", "목", "금", "토"][currentTime.getDay()]
              })`}{" "}
              {`${String(currentTime.getHours()).padStart(2, "0")}:${String(
                currentTime.getMinutes()
              ).padStart(2, "0")}`}
            </p>
            <span>현재 근무중</span>
          </div>
          <ul>
            {(() => {
              const todayKey = getDateKey(currentTime);
              const todaySchedules =
                scheduleDataByWorkplaceAndDate[selectedWorkplace]?.[todayKey] ||
                [];
              const currentHour = currentTime.getHours();
              const currentMinute = currentTime.getMinutes();
              const currentTimeDecimal = currentHour + currentMinute / 60;

              return todaySchedules
                .filter((item) => {
                  return (
                    item.startHour <= currentTimeDecimal &&
                    item.startHour + item.durationHours > currentTimeDecimal
                  );
                })
                .map((item) => (
                  <li key={item.id}>
                    <strong>
                      {item.start}~{item.end}
                    </strong>{" "}
                    {item.name}
                  </li>
                ));
            })()}
          </ul>
        </div>
      </aside>
    </div>
  );
}
