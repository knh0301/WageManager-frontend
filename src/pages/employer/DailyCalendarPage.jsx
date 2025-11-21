import { useMemo, useState, useEffect } from "react";
import "../../styles/dailyCalendarPage.css";

// 날짜를 키(YYYY-MM-DD) 문자열로 변환
const getDateKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// TODO: 백엔드 연동 시 제거할 임시 더미 데이터
const initialScheduleData = {
  맥도날드: {
    "2025-11-21": [
      {
        id: 1,
        name: "오지환",
        start: "07:00",
        end: "16:00",
        startHour: 7,
        durationHours: 9,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 60,
        hourlyWage: 11000,
        allowances: {
          overtime: { enabled: true, rate: 150 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 2,
        name: "문보경",
        start: "04:30",
        end: "14:30",
        startHour: 4.5,
        durationHours: 10,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 45,
        hourlyWage: 10500,
        allowances: {
          overtime: { enabled: true, rate: 125 },
          night: { enabled: true, rate: 150 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 3,
        name: "홍창기",
        start: "10:00",
        end: "15:00",
        startHour: 10,
        durationHours: 5,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 30,
        hourlyWage: 10000,
        allowances: {
          overtime: { enabled: false, rate: 0 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: false,
        withholdingTax: false,
      },
      {
        id: 4,
        name: "신민재",
        start: "12:00",
        end: "17:00",
        startHour: 12,
        durationHours: 5,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 30,
        hourlyWage: 11500,
        allowances: {
          overtime: { enabled: false, rate: 0 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: true, rate: 150 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 5,
        name: "오스틴",
        start: "12:00",
        end: "19:00",
        startHour: 12,
        durationHours: 7,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 45,
        hourlyWage: 13000,
        allowances: {
          overtime: { enabled: true, rate: 150 },
          night: { enabled: true, rate: 150 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: false,
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
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 60,
        hourlyWage: 11000,
        allowances: {
          overtime: { enabled: true, rate: 150 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 2,
        name: "문보경",
        start: "05:00",
        end: "15:00",
        startHour: 5,
        durationHours: 10,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 45,
        hourlyWage: 10800,
        allowances: {
          overtime: { enabled: true, rate: 125 },
          night: { enabled: true, rate: 150 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 3,
        name: "홍창기",
        start: "11:00",
        end: "16:00",
        startHour: 11,
        durationHours: 5,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 30,
        hourlyWage: 10200,
        allowances: {
          overtime: { enabled: false, rate: 0 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: true, rate: 150 },
        },
        socialInsurance: false,
        withholdingTax: true,
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
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 60,
        hourlyWage: 11000,
        allowances: {
          overtime: { enabled: true, rate: 150 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 4,
        name: "신민재",
        start: "13:00",
        end: "18:00",
        startHour: 13,
        durationHours: 5,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 30,
        hourlyWage: 11500,
        allowances: {
          overtime: { enabled: false, rate: 0 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: true, rate: 150 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 5,
        name: "오스틴",
        start: "13:00",
        end: "20:00",
        startHour: 13,
        durationHours: 7,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 45,
        hourlyWage: 13000,
        allowances: {
          overtime: { enabled: true, rate: 150 },
          night: { enabled: true, rate: 150 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: false,
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
        workplaceDetail: "스타벅스 강남역점",
        breakMinutes: 30,
        hourlyWage: 12000,
        allowances: {
          overtime: { enabled: true, rate: 150 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: true, rate: 150 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 7,
        name: "이지은",
        start: "09:00",
        end: "17:00",
        startHour: 9,
        durationHours: 8,
        workplaceDetail: "스타벅스 강남역점",
        breakMinutes: 30,
        hourlyWage: 12500,
        allowances: {
          overtime: { enabled: true, rate: 125 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: true,
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
        workplaceDetail: "스타벅스 강남역점",
        breakMinutes: 30,
        hourlyWage: 12000,
        allowances: {
          overtime: { enabled: true, rate: 150 },
          night: { enabled: true, rate: 150 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: true,
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
        workplaceDetail: "롯데리아 시청점",
        breakMinutes: 40,
        hourlyWage: 9800,
        allowances: {
          overtime: { enabled: true, rate: 150 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: false,
        withholdingTax: true,
      },
    ],
  },
  버거킹: {},
  KFC: {},
};

// 표시/수정을 위한 수당 유형 정의
const allowanceDefinitions = [
  { key: "overtime", label: "연장수당" },
  { key: "night", label: "야간수당" },
  { key: "holiday", label: "휴일수당" },
];

// 수당 정보를 편집하기 쉬운 형태로 정규화
const normalizeAllowances = (allowances = {}) => {
  return allowanceDefinitions.reduce((acc, { key }) => {
    const base = allowances[key] || {};
    acc[key] = {
      enabled: base.enabled ?? false,
      rate: typeof base.rate === "number" && base.rate > 0 ? base.rate : 150,
    };
    return acc;
  }, {});
};

// 선택한 근무 정보를 복제하면서 누락된 필드를 기본값으로 채움
const cloneShiftWithDefaults = (shift) =>
  shift
    ? {
        ...shift,
        allowances: normalizeAllowances(shift.allowances),
        start: shift.start || "09:00",
        end: shift.end || "18:00",
        crossesMidnight: Boolean(shift.crossesMidnight),
      }
    : null;

const baseHourOptions = Array.from({ length: 24 }, (_, idx) =>
  String(idx).padStart(2, "0")
);
const hourOptionsWithMidnight = [...baseHourOptions, "24"];
const minuteOptions = Array.from({ length: 60 }, (_, idx) =>
  String(idx).padStart(2, "0")
);

function TimeWheelPicker({ label, value, onChange, allowMidnight = false }) {
  const [hour = "00", minute = "00"] = (value || "00:00").split(":");
  const hours = allowMidnight ? hourOptionsWithMidnight : baseHourOptions;

  const handleHourChange = (e) => {
    const nextHour = e.target.value;
    onChange(`${nextHour}:${nextHour === "24" ? "00" : minute}`);
  };

  const handleMinuteChange = (e) => {
    onChange(`${hour}:${e.target.value}`);
  };

  return (
    <div className="time-wheel">
      <span className="time-wheel-label">{label}</span>
      <div className="time-wheel-columns">
        <div className="time-wheel-column">
          <select
            className="time-wheel-select"
            value={hour}
            onChange={handleHourChange}
            size={5}
          >
            {hours.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="time-wheel-unit">시</span>
        </div>
        <div className="time-wheel-column">
          <select
            className="time-wheel-select"
            value={minute}
            onChange={handleMinuteChange}
            size={5}
            disabled={hour === "24"}
          >
            {minuteOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <span className="time-wheel-unit">분</span>
        </div>
      </div>
    </div>
  );
}

const generateShiftId = (data) => {
  let maxId = 0;
  Object.values(data).forEach((workplace) => {
    Object.values(workplace || {}).forEach((shifts) => {
      shifts.forEach((shift) => {
        if (typeof shift.id === "number") {
          maxId = Math.max(maxId, shift.id);
        }
      });
    });
  });
  return maxId + 1 || Date.now();
};

// 타임라인 상단 시간 라벨
const hours = Array.from({ length: 24 }, (_, idx) => idx);

// 달력 셀 비교 헬퍼
const isSameDate = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// 월 달력을 구성하는 6x7 셀 배열 생성
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

// 더미 지점 목록
const workplaces = ["맥도날드", "스타벅스", "롯데리아", "버거킹", "KFC"];

export default function DailyCalendarPage() {
  const today = new Date();
  // 화면 전반에서 사용하는 상태들
  const [selectedDate, setSelectedDate] = useState(today);
  const [displayMonth, setDisplayMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedWorkplace, setSelectedWorkplace] = useState("맥도날드");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeShiftId, setActiveShiftId] = useState(null);
  const [scheduleData, setScheduleData] = useState(() =>
    JSON.parse(JSON.stringify(initialScheduleData))
  );
  const [editedShift, setEditedShift] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // 현재 시간 실시간 업데이트 (우측 카드 표시용)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  const dateKey = getDateKey(selectedDate);
  const workplaceSchedules = scheduleData[selectedWorkplace] || {};
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const currentScheduleData = workplaceSchedules[dateKey] || [];

  // 겹치는 근무를 서로 다른 레인으로 배치
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

  const activeShift = scheduleWithLanes.find(
    (shift) => shift.id === activeShiftId
  );

  // 근무 블록 선택 시 편집용 상태 초기화
  useEffect(() => {
    if (activeShift) {
      setEditedShift(cloneShiftWithDefaults(activeShift));
    } else {
      setEditedShift(null);
    }
    setIsEditing(false);
  }, [activeShiftId, activeShift]);

  // 월 달력 셀 캐싱
  const calendarCells = useMemo(
    () => buildCalendarCells(displayMonth),
    [displayMonth]
  );

  // 이전/다음 달 이동 및 날짜 선택 핸들러
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
    setActiveShiftId(null);
  };

  // 타임라인 블록 선택 토글
  const handleShiftClick = (shiftId) => {
    setActiveShiftId((prev) => (prev === shiftId ? null : shiftId));
  };

  // 편집 모드 진입/취소/저장 로직
  const handleStartEdit = () => {
    if (activeShift) {
      setEditedShift(cloneShiftWithDefaults(activeShift));
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setEditedShift(cloneShiftWithDefaults(activeShift));
    setIsEditing(false);
  };

  const updateEditedShift = (field, value) => {
    setEditedShift((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const updateAllowance = (type, changes) => {
    setEditedShift((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        allowances: {
          ...prev.allowances,
          [type]: {
            ...prev.allowances?.[type],
            ...changes,
          },
        },
      };
    });
  };

  const handleSaveShift = () => {
    if (!editedShift || !activeShiftId) return;
    const dateKeyToUpdate = getDateKey(selectedDate);
    const { laneIndex: _unusedLaneIndex, ...shiftToSave } = editedShift;
    const startDecimal = timeStringToDecimal(shiftToSave.start);
    const endDecimalRaw =
      shiftToSave.end === "24:00" ? 24 : timeStringToDecimal(shiftToSave.end);
    const crossesMidnight =
      shiftToSave.crossesMidnight || endDecimalRaw < startDecimal;

    setScheduleData((prev) => {
      const workplace = prev[selectedWorkplace] || {};
      const currentList = workplace[dateKeyToUpdate] || [];
      let updatedList = currentList.map((shift) =>
        shift.id === activeShiftId ? { ...shift, ...shiftToSave } : shift
      );

      if (crossesMidnight) {
        const firstPartDuration = 24 - startDecimal;
        const secondPartDuration = endDecimalRaw === 24 ? 0 : endDecimalRaw;

        updatedList = updatedList.map((shift) => {
          if (shift.id !== activeShiftId) return shift;
          return {
            ...shift,
            ...shiftToSave,
            end: "24:00",
            durationHours: firstPartDuration,
            crossesMidnight: false,
            nextDayEndHour: undefined,
          };
        });

        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextKey = getDateKey(nextDate);
        const newShiftId = generateShiftId(prev);
        const nextList = workplace[nextKey] ? [...workplace[nextKey]] : [];
        if (secondPartDuration > 0) {
          nextList.push({
            ...shiftToSave,
            id: newShiftId,
            start: "00:00",
            end: shiftToSave.end,
            startHour: 0,
            durationHours: secondPartDuration,
            crossesMidnight: false,
            nextDayEndHour: undefined,
          });
        }

        return {
          ...prev,
          [selectedWorkplace]: {
            ...workplace,
            [dateKeyToUpdate]: updatedList,
            [nextKey]: nextList,
          },
        };
      }

      const normalizedList = updatedList.map((shift) =>
        shift.id === activeShiftId
          ? {
              ...shift,
              crossesMidnight: false,
              nextDayEndHour: undefined,
            }
          : shift
      );

      return {
        ...prev,
        [selectedWorkplace]: {
          ...workplace,
          [dateKeyToUpdate]: normalizedList,
        },
      };
    });
    setIsEditing(false);
  };

  // YYYY.MM.DD 포맷 helper
  const formattedSelectedDate = useMemo(() => {
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    return `${selectedDate.getFullYear()}.${month}.${day}`;
  }, [selectedDate]);

  // 통화/시간 포맷 helper
  const formatCurrency = (value) =>
    typeof value === "number" ? `${value.toLocaleString("ko-KR")}원` : "-";

  const formatBreakTime = (minutes) =>
    typeof minutes === "number" ? `${minutes}분` : "-";

  const formatDuration = (hours) => {
    if (typeof hours !== "number") return "-";
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) {
      return `${wholeHours}시간`;
    }
    if (minutes === 60) {
      return `${wholeHours + 1}시간`;
    }
    return `${wholeHours}시간 ${minutes}분`;
  };

  const timeStringToDecimal = (timeString) => {
    if (!timeString) return 0;
    const [hour = "0", minute = "0"] = timeString.split(":");
    return Number(hour) + Number(minute) / 60;
  };

  const decimalToTimeString = (decimal) => {
    const hour = Math.floor(decimal);
    const minute = Math.round((decimal - hour) * 60);
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(
      2,
      "0"
    )}`;
  };

  const handleTimeChange = (field, value) => {
    const sanitized = value || "00:00";
    setEditedShift((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const clampMinDuration = 0.5;

      if (field === "start") {
        next.start = sanitized;
      } else {
        next.end = sanitized;
      }

      const startDecimal = timeStringToDecimal(next.start);
      let endDecimal = timeStringToDecimal(next.end);
      if (next.end === "24:00") {
        endDecimal = 24;
      }

      const crossesMidnight = endDecimal < startDecimal;
      const totalDuration = crossesMidnight
        ? 24 - startDecimal + endDecimal
        : endDecimal - startDecimal;

      next.startHour = startDecimal;
      next.durationHours = Math.max(totalDuration, clampMinDuration);
      next.crossesMidnight = crossesMidnight;
      next.nextDayEndHour = endDecimal === 24 ? 0 : endDecimal;

      return next;
    });
  };

  // 읽기/편집 모드에 따라 표시할 근무 정보 선택
  const shiftForDisplay = isEditing && editedShift ? editedShift : activeShift;

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
          {/* 타임라인 상단 시간 레이블 */}
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
            {/* 근무자 타임라인 블록 */}
            {scheduleWithLanes.map((item) => {
              const left = (item.startHour / 24) * 100;
              const width = (item.durationHours / 24) * 100;
              const top = 20 + item.laneIndex * 100;
              return (
                <div
                  key={item.id}
                  className={`daily-shift-block ${
                    activeShiftId === item.id ? "active" : ""
                  }`}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top: `${top}px`,
                  }}
                  onClick={() => handleShiftClick(item.id)}
                >
                  <div className="shift-name">{item.name}</div>
                  <div className="shift-time">{`${item.start} - ${item.end}`}</div>
                  <div className="shift-duration">{formatDuration(item.durationHours)}</div>
                </div>
              );
            })}
          </div>
          {/* 근무 블록을 선택하면 토글되는 상세/편집 패널 */}
          <div className={`shift-detail-panel ${activeShift ? "open" : ""}`}>
            {activeShift ? (
              <>
                <div className="detail-header">
                  <div className="detail-header-left">
                    <div>
                      <p className="detail-label">근무자</p>
                      <h3 className="detail-name">{activeShift.name}</h3>
                    </div>
                    <div>
                      <p className="detail-label">근무지</p>
                      <p className="detail-value">
                        {activeShift.workplaceDetail || selectedWorkplace}
                      </p>
                    </div>
                  </div>
                  <div className="detail-header-actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="detail-cancel-button"
                          onClick={handleCancelEdit}
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          className="detail-save-button"
                          onClick={handleSaveShift}
                        >
                          저장
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="detail-edit-button"
                        onClick={handleStartEdit}
                      >
                        정보 수정
                      </button>
                    )}
                    <button
                      type="button"
                      className="detail-close-button"
                      onClick={() => setActiveShiftId(null)}
                    >
                      닫기
                    </button>
                  </div>
                </div>
                <div className="detail-grid">
                  <div>
                    <p className="detail-label">근무 날짜</p>
                    <p className="detail-value">{formattedSelectedDate}</p>
                  </div>
                  <div>
                    <p className="detail-label">근무 시간</p>
                    {isEditing ? (
                      <div className="time-wheel-wrapper">
                        <TimeWheelPicker
                          label="시작"
                          value={editedShift?.start || "00:00"}
                          onChange={(val) => handleTimeChange("start", val)}
                        />
                        <TimeWheelPicker
                          label="종료"
                          value={editedShift?.end || "00:00"}
                          onChange={(val) => handleTimeChange("end", val)}
                          allowMidnight
                        />
                      </div>
                    ) : (
                      <p className="detail-value">
                        {shiftForDisplay?.start} ~ {shiftForDisplay?.end}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="detail-label">총 근무</p>
                    <p className="detail-value">
                      {formatDuration(shiftForDisplay?.durationHours)}
                    </p>
                  </div>
                  <div>
                    <p className="detail-label">휴게 시간</p>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        className="detail-input"
                        value={editedShift?.breakMinutes ?? ""}
                        onChange={(e) =>
                          updateEditedShift(
                            "breakMinutes",
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <p className="detail-value">
                        {formatBreakTime(shiftForDisplay?.breakMinutes)}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="detail-label">시급</p>
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        className="detail-input"
                        value={editedShift?.hourlyWage ?? ""}
                        onChange={(e) =>
                          updateEditedShift(
                            "hourlyWage",
                            Number(e.target.value)
                          )
                        }
                      />
                    ) : (
                      <p className="detail-value">
                        {formatCurrency(shiftForDisplay?.hourlyWage)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="detail-section">
                  <p className="detail-label">수당 정보</p>
                  <ul className="allowance-list">
                    {allowanceDefinitions.map(({ key, label }) => {
                      const allowance = (isEditing ? editedShift : activeShift)
                        ?.allowances?.[key] || {
                        enabled: false,
                        rate: 0,
                      };
                      return (
                        <li
                          key={key}
                          className={`allowance-item ${
                            allowance.enabled ? "on" : "off"
                          }`}
                        >
                          {isEditing ? (
                            <label className="allowance-toggle">
                              <input
                                type="checkbox"
                                checked={allowance.enabled}
                                onChange={(e) =>
                                  updateAllowance(key, {
                                    enabled: e.target.checked,
                                  })
                                }
                              />
                              <span>{label}</span>
                            </label>
                          ) : (
                            <span>{label}</span>
                          )}
                          {isEditing ? (
                            <input
                              type="number"
                              min="100"
                              max="300"
                              step="5"
                              className="allowance-rate-input"
                              value={allowance.rate}
                              disabled={!allowance.enabled}
                              onChange={(e) =>
                                updateAllowance(key, {
                                  rate: Number(e.target.value),
                                })
                              }
                            />
                          ) : (
                            <strong>
                              {allowance.enabled
                                ? `${allowance.rate}%`
                                : "없음"}
                            </strong>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="detail-status-row">
                  {isEditing ? (
                    <>
                      <label className="status-toggle">
                        <input
                          type="checkbox"
                          checked={editedShift?.socialInsurance ?? false}
                          onChange={(e) =>
                            updateEditedShift(
                              "socialInsurance",
                              e.target.checked
                            )
                          }
                        />
                        <span>4대보험 적용</span>
                      </label>
                      <label className="status-toggle">
                        <input
                          type="checkbox"
                          checked={editedShift?.withholdingTax ?? false}
                          onChange={(e) =>
                            updateEditedShift(
                              "withholdingTax",
                              e.target.checked
                            )
                          }
                        />
                        <span>소득세 공제</span>
                      </label>
                    </>
                  ) : (
                    <>
                      <div
                        className={`status-pill ${
                          shiftForDisplay?.socialInsurance ? "on" : "off"
                        }`}
                      >
                        4대보험{" "}
                        {shiftForDisplay?.socialInsurance ? "적용" : "미적용"}
                      </div>
                      <div
                        className={`status-pill ${
                          shiftForDisplay?.withholdingTax ? "on" : "off"
                        }`}
                      >
                        소득세{" "}
                        {shiftForDisplay?.withholdingTax ? "공제" : "미공제"}
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <p className="detail-placeholder">
                근무 박스를 선택하면 상세정보가 나타납니다.
              </p>
            )}
          </div>
        </div>
      </div>
      <aside className="daily-side-panel">
        {/* 우측 월 달력 */}
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
        {/* 우측 현재 근무자 리스트 */}
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
                scheduleData[selectedWorkplace]?.[todayKey] || [];
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
