import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import "../../styles/dailyCalendarPage.css";
import { initialScheduleData, initialWorkplaces } from "./dummyData";

// 날짜를 키(YYYY-MM-DD) 문자열로 변환
const getDateKey = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

// 수당 유형 정의
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

// 정보수정 - 시간 입력
function TimeInput({ label, value, onChange, allowMidnight = false } = {}) {
  const [hour = "00", minute = "00"] = (value || "00:00").split(":");

  const handleHourChange = (e) => {
    const nextHour = String(
      Math.max(
        0,
        Math.min(allowMidnight ? 24 : 23, Number(e.target.value) || 0)
      )
    ).padStart(2, "0");
    onChange(`${nextHour}:${nextHour === "24" ? "00" : minute}`);
  };

  const handleMinuteChange = (e) => {
    const nextMinute = String(
      Math.max(0, Math.min(59, Number(e.target.value) || 0))
    ).padStart(2, "0");
    onChange(`${hour}:${nextMinute}`);
  };

  return (
    <div className="time-wheel">
      <span className="time-wheel-label">{label}</span>
      <div className="time-wheel-columns">
        <input
          type="number"
          className="time-wheel-input"
          value={hour}
          onChange={handleHourChange}
          min="0"
          max={allowMidnight ? 24 : 23}
          disabled={false}
        />
        <span className="time-wheel-separator">:</span>
        <input
          type="number"
          className="time-wheel-input"
          value={minute}
          onChange={handleMinuteChange}
          min="0"
          max="59"
          disabled={hour === "24"}
        />
      </div>
    </div>
  );
}

TimeInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  allowMidnight: PropTypes.bool,
};

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

export default function DailyCalendarPage() {
  const today = new Date();
  // 화면 전반에서 사용하는 상태들
  const [selectedDate, setSelectedDate] = useState(today);
  const [displayMonth, setDisplayMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  // 근무지 리스트 (백엔드에서 받아올 예정)
  const [workplaces, setWorkplaces] = useState(initialWorkplaces);
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(1); // 기본값: 맥도날드 잠실점 ID

  // 선택된 근무지 정보
  const selectedWorkplace =
    workplaces.find((wp) => wp.id === selectedWorkplaceId)?.name || "";

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeShiftId, setActiveShiftId] = useState(null);
  const [scheduleData, setScheduleData] = useState(() =>
    JSON.parse(JSON.stringify(initialScheduleData))
  );
  const [editedShift, setEditedShift] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showWorkerListModal, setShowWorkerListModal] = useState(false);

  // TODO: 백엔드 연동 시 근무지 리스트와 스케줄 데이터를 API에서 받아오기
  // useEffect(() => {
  //   const fetchWorkplaces = async () => {
  //     try {
  //       const response = await fetch('/api/workplaces');
  //       const data = await response.json();
  //       setWorkplaces(data.workplaces);
  //       if (data.workplaces.length > 0) {
  //         setSelectedWorkplaceId(data.workplaces[0].id);
  //       }
  //     } catch (error) {
  //       console.error('근무지 리스트 로딩 실패:', error);
  //     }
  //   };
  //   fetchWorkplaces();
  // }, []);

  // 현재 시간 실시간 업데이트 (우측 카드 표시용)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1분마다 업데이트

    return () => clearInterval(timer);
  }, []);

  const dateKey = getDateKey(selectedDate);
  // TODO: 백엔드 연동 시 scheduleData 구조 변경 필요
  // 현재: scheduleData[근무지이름][날짜] = [근무리스트]
  // 변경 예정: scheduleData[근무지ID][날짜] = [근무리스트] 또는 API 호출
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

  // 익일 근무인 경우 전날 근무 찾기
  const previousDate = new Date(selectedDate);
  previousDate.setDate(previousDate.getDate() - 1);
  const previousDateKey = getDateKey(previousDate);
  const previousScheduleData = workplaceSchedules[previousDateKey] || [];

  // 익일 근무이고 시작 시간이 0시인 경우 전날 근무 찾기
  const isOvernightShift =
    activeShift && activeShift.startHour === 0 && activeShift.start === "00:00";
  const previousDayShift = isOvernightShift
    ? previousScheduleData.find(
        (shift) => shift.name === activeShift.name && shift.crossesMidnight
      )
    : null;

  // 표시할 근무 정보 (익일 근무면 전날 근무 정보 사용)
  const displayShift = previousDayShift || activeShift;

  // 근무 블록 선택 시 편집용 상태 초기화
  useEffect(() => {
    if (displayShift) {
      setEditedShift(cloneShiftWithDefaults(displayShift));
    } else {
      setEditedShift(null);
    }
    setIsEditing(false);
  }, [activeShiftId, activeShift, selectedDate, workplaceSchedules]);

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
    // 클릭한 근무 찾기
    const clickedShift = currentScheduleData.find(
      (shift) => shift.id === shiftId
    );

    // 익일 근무인지 확인 (00:00에 시작하는 경우)
    if (
      clickedShift &&
      clickedShift.startHour === 0 &&
      clickedShift.start === "00:00"
    ) {
      // 전날 날짜 계산
      const prevDate = new Date(selectedDate);
      prevDate.setDate(prevDate.getDate() - 1);
      const prevDateKey = getDateKey(prevDate);
      const prevScheduleData = workplaceSchedules[prevDateKey] || [];

      // 전날 같은 직원의 익일로 넘어가는 근무 찾기
      const prevDayShift = prevScheduleData.find(
        (shift) => shift.name === clickedShift.name && shift.crossesMidnight
      );

      if (prevDayShift) {
        // 전날 날짜로 이동하고 전날 근무 선택
        setSelectedDate(prevDate);
        setActiveShiftId(prevDayShift.id);
        return;
      }
    }

    // 일반적인 경우
    setActiveShiftId((prev) => (prev === shiftId ? null : shiftId));
  };

  // 해당 근무지의 모든 직원 리스트 가져오기
  const getWorkersInWorkplace = () => {
    const workplace = scheduleData[selectedWorkplace] || {};
    const workerSet = new Set();

    // 모든 날짜의 근무 데이터를 순회하며 직원 이름 수집
    Object.values(workplace).forEach((dateShifts) => {
      if (Array.isArray(dateShifts)) {
        dateShifts.forEach((shift) => {
          if (shift.name) {
            workerSet.add(shift.name);
          }
        });
      }
    });

    return Array.from(workerSet).sort();
  };

  // 근무자 추가 핸들러 - 모달 열기
  const handleAddShift = () => {
    setShowWorkerListModal(true);
  };

  // 직원 선택 후 근무 추가
  const handleSelectWorker = (workerName) => {
    const newShiftId = generateShiftId(scheduleData);
    const dateKeyToAdd = getDateKey(selectedDate);

    // TODO: 백엔드 연동 시 근무지 상세 정보(workplaceDetail)를 API에서 받아와야 할 수 있음
    const newShift = {
      id: newShiftId,
      name: workerName,
      start: "09:00",
      end: "18:00",
      startHour: 9,
      durationHours: 9,
      workplaceDetail: selectedWorkplace, // 현재는 근무지 이름 사용, 백엔드 연동 시 상세 정보 필요
      breakMinutes: 60,
      hourlyWage: 10000,
      allowances: {
        overtime: { enabled: false, rate: 150 },
        night: { enabled: false, rate: 0 },
        holiday: { enabled: false, rate: 0 },
      },
      socialInsurance: false,
      withholdingTax: false,
      crossesMidnight: false,
    };

    setScheduleData((prev) => {
      const workplace = prev[selectedWorkplace] || {};
      const currentList = workplace[dateKeyToAdd] || [];

      return {
        ...prev,
        [selectedWorkplace]: {
          ...workplace,
          [dateKeyToAdd]: [...currentList, newShift],
        },
      };
    });

    // 새로 추가한 근무를 선택하고 편집 모드로 진입
    setActiveShiftId(newShiftId);
    setEditedShift(cloneShiftWithDefaults(newShift));
    setIsEditing(true);
    setShowWorkerListModal(false);
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

  // 근무자 삭제 핸들러
  const handleDeleteShift = () => {
    if (!activeShiftId || !activeShift) return;

    // 삭제 확인
    if (!window.confirm(`${activeShift.name} 근무자를 삭제하시겠습니까?`)) {
      return;
    }

    const dateKeyToDelete = getDateKey(selectedDate);

    setScheduleData((prev) => {
      const workplace = prev[selectedWorkplace] || {};
      const currentList = workplace[dateKeyToDelete] || [];

      // 당일 근무 삭제
      let updatedList = currentList.filter(
        (shift) => shift.id !== activeShiftId
      );

      // 익일로 넘어가는 근무인 경우 익일 근무도 삭제
      if (activeShift.crossesMidnight) {
        const nextDate = new Date(selectedDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextKey = getDateKey(nextDate);
        const nextList = workplace[nextKey] || [];

        // 익일 근무 찾아서 삭제
        const nextDayShift = nextList.find(
          (shift) => shift.name === activeShift.name && shift.start === "00:00"
        );

        if (nextDayShift) {
          const updatedNextList = nextList.filter(
            (shift) => shift.id !== nextDayShift.id
          );
          return {
            ...prev,
            [selectedWorkplace]: {
              ...workplace,
              [dateKeyToDelete]: updatedList,
              [nextKey]: updatedNextList,
            },
          };
        }
      }

      return {
        ...prev,
        [selectedWorkplace]: {
          ...workplace,
          [dateKeyToDelete]: updatedList,
        },
      };
    });

    // 삭제 후 패널 닫기
    setActiveShiftId(null);
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

    // 익일 근무를 클릭한 경우 전날 근무의 ID와 날짜 사용
    const shiftToUpdate = previousDayShift || displayShift || activeShift;
    const actualShiftId = shiftToUpdate?.id || activeShiftId;
    const actualDate = previousDayShift ? previousDate : selectedDate;
    const dateKeyToUpdate = getDateKey(actualDate);

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
        shift.id === actualShiftId ? { ...shift, ...shiftToSave } : shift
      );

      if (crossesMidnight) {
        const firstPartDuration = 24 - startDecimal;
        const secondPartDuration = endDecimalRaw === 24 ? 0 : endDecimalRaw;

        updatedList = updatedList.map((shift) => {
          if (shift.id !== actualShiftId) return shift;
          return {
            ...shift,
            ...shiftToSave,
            end: "24:00",
            durationHours: firstPartDuration,
            crossesMidnight: true,
            nextDayEndHour: undefined,
          };
        });

        const nextDate = new Date(actualDate);
        nextDate.setDate(nextDate.getDate() + 1);
        const nextKey = getDateKey(nextDate);
        const nextList = workplace[nextKey] ? [...workplace[nextKey]] : [];

        // 익일 근무가 이미 존재하는 경우 (익일 근무를 클릭한 경우)
        const existingNextDayShift =
          activeShift && activeShift.start === "00:00"
            ? nextList.find((shift) => shift.id === activeShift.id)
            : null;

        if (secondPartDuration > 0) {
          if (existingNextDayShift) {
            // 기존 익일 근무 업데이트
            const updatedNextList = nextList.map((shift) =>
              shift.id === activeShift.id
                ? {
                    ...shiftToSave,
                    id: shift.id,
                    start: "00:00",
                    end: shiftToSave.end,
                    startHour: 0,
                    durationHours: secondPartDuration,
                    crossesMidnight: false,
                    nextDayEndHour: undefined,
                  }
                : shift
            );
            return {
              ...prev,
              [selectedWorkplace]: {
                ...workplace,
                [dateKeyToUpdate]: updatedList,
                [nextKey]: updatedNextList,
              },
            };
          } else {
            // 새 익일 근무 생성
            const newShiftId = generateShiftId(prev);
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
        shift.id === actualShiftId
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

    // 저장 후 상태 업데이트
    if (crossesMidnight) {
      // 익일 근무가 생성/업데이트되었으므로 전날 근무의 ID로 변경
      setSelectedDate(actualDate);
      setActiveShiftId(actualShiftId);
    } else if (previousDayShift) {
      // 익일 근무를 클릭한 경우 전날 근무의 ID로 변경
      setSelectedDate(previousDate);
      setActiveShiftId(previousDayShift.id);
    }
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
  const shiftForDisplay = isEditing && editedShift ? editedShift : displayShift;

  return (
    <div className="daily-page">
      <div className="daily-schedule-section">
        <div className="daily-schedule-header">
          <div className="daily-header-left">
            <select
              className="daily-workplace-select"
              value={selectedWorkplaceId}
              onChange={(e) => setSelectedWorkplaceId(Number(e.target.value))}
            >
              {workplaces.map((workplace) => (
                <option key={workplace.id} value={workplace.id}>
                  {workplace.name}
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
          <button
            type="button"
            className="daily-add-button"
            onClick={handleAddShift}
          >
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
                  <div className="shift-duration">
                    {formatDuration(item.durationHours)}
                  </div>
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
                      <h3 className="detail-name">
                        {shiftForDisplay?.name || activeShift.name}
                      </h3>
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
                      <>
                        <button
                          type="button"
                          className="detail-edit-button"
                          onClick={handleStartEdit}
                        >
                          정보 수정
                        </button>
                        <button
                          type="button"
                          className="detail-delete-button"
                          onClick={handleDeleteShift}
                        >
                          삭제
                        </button>
                      </>
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
                        <TimeInput
                          label="시작"
                          value={editedShift?.start || "00:00"}
                          onChange={(val) => handleTimeChange("start", val)}
                        />
                        <TimeInput
                          label="종료"
                          value={editedShift?.end || "00:00"}
                          onChange={(val) => handleTimeChange("end", val)}
                          allowMidnight
                        />
                      </div>
                    ) : (
                      <p className="detail-value">
                        {(() => {
                          // 익일 근무를 클릭한 경우 (전날 근무가 displayShift인 경우)
                          if (
                            previousDayShift &&
                            activeShift &&
                            activeShift.start === "00:00"
                          ) {
                            return `${previousDayShift.start}~${activeShift.end}(익일)`;
                          }
                          // 전날 근무를 클릭한 경우 (crossesMidnight가 true인 경우)
                          if (shiftForDisplay?.crossesMidnight) {
                            const nextDate = new Date(selectedDate);
                            nextDate.setDate(nextDate.getDate() + 1);
                            const nextDateKey = getDateKey(nextDate);
                            const nextScheduleData =
                              workplaceSchedules[nextDateKey] || [];
                            const nextDayShift = nextScheduleData.find(
                              (shift) =>
                                shift.name === shiftForDisplay?.name &&
                                shift.start === "00:00"
                            );
                            if (nextDayShift) {
                              return `${shiftForDisplay?.start}~${nextDayShift.end}(익일)`;
                            }
                            return `${shiftForDisplay?.start}~${shiftForDisplay?.end}(익일)`;
                          }
                          return `${shiftForDisplay?.start}~${shiftForDisplay?.end}`;
                        })()}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="detail-label">총 근무</p>
                    <p className="detail-value">
                      {(() => {
                        // 익일 근무를 클릭한 경우 (전날 근무가 displayShift인 경우)
                        if (
                          previousDayShift &&
                          activeShift &&
                          activeShift.start === "00:00"
                        ) {
                          const totalHours =
                            previousDayShift.durationHours +
                            activeShift.durationHours;
                          return formatDuration(totalHours);
                        }
                        // 전날 근무를 클릭한 경우 (crossesMidnight가 true인 경우)
                        if (shiftForDisplay?.crossesMidnight) {
                          const nextDate = new Date(selectedDate);
                          nextDate.setDate(nextDate.getDate() + 1);
                          const nextDateKey = getDateKey(nextDate);
                          const nextScheduleData =
                            workplaceSchedules[nextDateKey] || [];
                          const nextDayShift = nextScheduleData.find(
                            (shift) =>
                              shift.name === shiftForDisplay?.name &&
                              shift.start === "00:00"
                          );
                          if (nextDayShift) {
                            const totalHours =
                              shiftForDisplay?.durationHours +
                              nextDayShift.durationHours;
                            return formatDuration(totalHours);
                          }
                        }
                        return formatDuration(shiftForDisplay?.durationHours);
                      })()}
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
      {/* 직원 선택 모달 */}
      {showWorkerListModal && (
        <div
          className="worker-list-modal-overlay"
          onClick={() => setShowWorkerListModal(false)}
        >
          <div
            className="worker-list-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="worker-list-modal-header">
              <h3>근무자 선택</h3>
              <button
                type="button"
                className="worker-list-modal-close"
                onClick={() => setShowWorkerListModal(false)}
              >
                ×
              </button>
            </div>
            <div className="worker-list-modal-body">
              {getWorkersInWorkplace().length > 0 ? (
                <ul className="worker-list">
                  {getWorkersInWorkplace().map((workerName) => (
                    <li
                      key={workerName}
                      className="worker-list-item"
                      onClick={() => handleSelectWorker(workerName)}
                    >
                      {workerName}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="worker-list-empty">등록된 근무자가 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
