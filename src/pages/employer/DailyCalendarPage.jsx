import { useMemo, useState } from "react";
import "../../styles/dailyCalendarPage.css";

const scheduleData = [
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
];

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

export default function DailyCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 9, 29));
  const [displayMonth, setDisplayMonth] = useState(new Date(2025, 9, 1));

  const scheduleWithLanes = useMemo(() => {
    const lanes = [];
    return scheduleData.map((item) => {
      const shiftStart = item.startHour;
      const shiftEnd = item.startHour + item.durationHours;
      let laneIndex = lanes.findIndex((end) => end <= shiftStart);
      if (laneIndex === -1) {
        laneIndex = lanes.length;
        lanes.push(shiftEnd);
      } else {
        lanes[laneIndex] = shiftEnd;
      }
      return { ...item, laneIndex };
    });
  }, []);

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
      <header className="daily-header">
        <div className="daily-header-left">
          <button type="button" className="daily-location">
            맥도날드
            <span className="daily-location-arrow">▼</span>
          </button>
          <h2 className="daily-date-heading">
            {`${selectedDate.getMonth() + 1}/${selectedDate.getDate()}(${
              ["일", "월", "화", "수", "목", "금", "토"][selectedDate.getDay()]
            })`}{" "}
            <span>스케줄표</span>
          </h2>
        </div>
        <button type="button" className="daily-add-button">
          + 근무자 추가하기
        </button>
      </header>

      <section className="daily-body">
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
            style={{ height: `${laneCount * 90 + 40}px` }}
          >
            {scheduleWithLanes.map((item) => {
              const left = (item.startHour / 24) * 100;
              const width = (item.durationHours / 24) * 100;
              const top = 20 + item.laneIndex * 90;
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
                </div>
              );
            })}
          </div>
        </div>
        <aside className="daily-side-panel">
          <div className="daily-calendar-card">
            <div className="daily-calendar-header">
              <button type="button" onClick={handlePrevMonth}>
                {"<"}
              </button>
              <div>
                <p>{displayMonth.getFullYear()}년</p>
                <strong>{displayMonth.getMonth() + 1}월</strong>
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
              <p>10/19(수) 13:00</p>
              <span>현재 근무중</span>
            </div>
            <ul>
              <li>
                <strong>10:00 ~ 15:00</strong> 홍창기
              </li>
              <li>
                <strong>12:00 ~ 17:00</strong> 신민재
              </li>
              <li>
                <strong>12:00 ~ 19:00</strong> 오스틴
              </li>
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
