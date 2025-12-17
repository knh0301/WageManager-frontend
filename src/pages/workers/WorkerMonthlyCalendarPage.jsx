import React, { useMemo, useState, useEffect } from "react";
import "./WorkerMonthlyCalendarPage.css";
import WorkEditRequestBox from "../../components/worker/MonthlyCalendarPage/WorkEditRequestBox";
import AddWorkModal from "../../components/worker/MonthlyCalendarPage/AddWorkModal";
import CalendarCard from "../../components/worker/MonthlyCalendarPage/CalendarCard";
import { getContracts, getContractDetail, getWorkRecords } from "../../api/workerApi";

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const makeDateKey = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

const workplaceOptions = ["맥도날드", "버거킹"];


const workLabelColorByPlace = (place) => { // 근무지에 따른 라벨 색상 클래스명 반환
  if (place.includes("버거킹")) return "burger";
  if (place.includes("맥도날드")) return "mcdonald";
  return "default";
};

const getKoreanDayLabel = (dayIndex) => { 
  const map = ["일", "월", "화", "수", "목", "금", "토"];
  return map[dayIndex] || "";
};

// 시간 객체를 "HH:mm" 형식으로 변환
const formatTime = (timeObj) => {
  if (!timeObj) return "00:00";
  
  // hour와 minute이 직접 있는 경우
  if (typeof timeObj.hour !== 'undefined' && typeof timeObj.minute !== 'undefined') {
    const hour = String(timeObj.hour || 0).padStart(2, "0");
    const minute = String(timeObj.minute || 0).padStart(2, "0");
    return `${hour}:${minute}`;
  }
  
  // 문자열 형식인 경우 (예: "09:00" 또는 "09:00:00")
  if (typeof timeObj === 'string') {
    // "HH:mm:ss" 형식을 "HH:mm"으로 변환
    const parts = timeObj.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}`;
    }
    return timeObj;
  }
  
  return "00:00";
};

// API 응답 데이터를 더미데이터 형식으로 매핑
const mapWorkRecords = (apiData, hourlyWageMap) => {
  const recordsByDate = {};
  const memosByDate = {};

  if (!apiData || !Array.isArray(apiData)) {
    return { recordsByDate, memosByDate };
  }

  apiData.forEach((record) => {
    const dateKey = record.workDate;
    const contractId = record.contractId;
    const hourlyWage = hourlyWageMap[contractId] || 0;
    
    // totalWorkMinutes를 사용하여 급여 계산 (분 단위를 시간으로 변환)
    const wage = Math.round((hourlyWage * record.totalWorkMinutes) / 60);

    const mappedRecord = {
      id: record.id,
      contractId: record.contractId,
      start: formatTime(record.startTime),
      end: formatTime(record.endTime),
      wage: wage,
      place: record.workplaceName,
      breakMinutes: record.breakMinutes || 0,
      totalWorkMinutes: record.totalWorkMinutes || 0,
      status: record.status,
      isModified: record.isModified,
    };

    if (!recordsByDate[dateKey]) {
      recordsByDate[dateKey] = [];
    }
    recordsByDate[dateKey].push(mappedRecord);

    // memo 저장 (빈 문자열이어도 저장)
    if (record.memo !== undefined) {
      memosByDate[dateKey] = record.memo || "";
    }
  });

  return { recordsByDate, memosByDate };
};

function WorkerMonthlyCalendarPage() {
  const today = new Date();

  const [currentYear, setCurrentYear] = useState(() => today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => today.getMonth());
  const [workRecords, setWorkRecords] = useState({});
  const [memos, setMemos] = useState({});

  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    makeDateKey(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const [editForm, setEditForm] = useState(null); // 수정 요청 폼 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [addForm, setAddForm] = useState(null);

  // API에서 근무 기록 가져오기
  useEffect(() => {
    const fetchWorkRecords = async () => {
      try {
        // 1. 계약 목록 가져오기
        const contractsResponse = await getContracts();
        
        // 응답이 배열인지 확인
        let contractIds = [];
        if (Array.isArray(contractsResponse.data)) {
          contractIds = contractsResponse.data;
        } else if (contractsResponse.data) {
          // 배열이 아닌 경우, 객체의 값들을 배열로 변환하거나 직접 사용
          contractIds = [contractsResponse.data];
        }
        
        if (contractIds.length === 0) {
          setWorkRecords({});
          setMemos({});
          return;
        }

        // 2. 각 계약의 시급 정보 가져오기
        const hourlyWageMap = {};
        await Promise.all(
          contractIds.map(async (contractId) => {
            try {
              // contractId가 객체인 경우 id 필드 추출
              const id = typeof contractId === 'object' ? contractId.id : contractId;
              
              const contractDetail = await getContractDetail(id);
              
              if (contractDetail.data?.hourlyWage !== undefined) {
                hourlyWageMap[id] = contractDetail.data.hourlyWage;
              }
            } catch (error) {
              console.error(`[WorkerMonthlyCalendarPage] 계약 ${contractId} 상세 정보 조회 실패:`, error);
            }
          })
        );

        // 3. 현재 월의 시작일과 종료일 계산
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = `${currentYear}-${pad2(currentMonth + 1)}-${pad2(1)}`;
        const endDate = `${currentYear}-${pad2(currentMonth + 1)}-${pad2(lastDay.getDate())}`;

        // 4. 근무 기록 가져오기
        const workRecordsResponse = await getWorkRecords(startDate, endDate);
        const workRecordsData = workRecordsResponse.data || [];

        // 5. 데이터 매핑
        const { recordsByDate, memosByDate } = mapWorkRecords(workRecordsData, hourlyWageMap);
        setWorkRecords(recordsByDate);
        setMemos((prev) => ({ ...prev, ...memosByDate }));
      } catch (error) {
        console.error("[WorkerMonthlyCalendarPage] 근무 기록 조회 실패:", error);
        setWorkRecords({});
        setMemos({});
      }
    };

    fetchWorkRecords();
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => { // 이전 달로 이동
    setCurrentMonth((prev) => {
      const date = new Date(currentYear, prev - 1, 1);
      setCurrentYear(date.getFullYear());
      return date.getMonth();
    });
  };

  const handleNextMonth = () => { // 다음 달로 이동
    setCurrentMonth((prev) => {
      const date = new Date(currentYear, prev + 1, 1);
      setCurrentYear(date.getFullYear());
      return date.getMonth();
    });
  };

  const calendarCells = useMemo(() => { // 달력 셀 계산
    const firstDay = new Date(currentYear, currentMonth, 1);
    const firstDayOfWeek = firstDay.getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDayOfWeek; i += 1) cells.push(null);
    for (let d = 1; d <= lastDate; d += 1) cells.push(d);
    return cells;
  }, [currentYear, currentMonth]);

  const recordsForSelectedDay = workRecords[selectedDateKey] || [];

  const handleMemoChange = (e) => { 
    const value = e.target.value;
    setMemos((prev) => ({
      ...prev,
      [selectedDateKey]: value,
    }));
  };

  const memoForSelected = memos[selectedDateKey] || "";

  const { totalMinutes, totalWage } = useMemo(() => { // 월간 총 근무 시간 및 급여 계산
    let minutes = 0;
    let wage = 0;

    Object.entries(workRecords).forEach(([key, list]) => {
      const [y, m] = key.split("-").map(Number);
      if (y === currentYear && m === currentMonth + 1) {
        list.forEach((record) => {
          // totalWorkMinutes 사용 (API에서 제공)
          minutes += record.totalWorkMinutes || 0;
          wage += record.wage || 0;
        });
      }
    });

    return { totalMinutes: minutes, totalWage: wage };
  }, [currentYear, currentMonth, workRecords]);

  const totalHoursText = useMemo(() => { // 총 근무 시간 텍스트 변환
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}시간 ${mins}분`;
  }, [totalMinutes]);

  const selectedDateObj = useMemo(() => { // 선택된 날짜 객체 생성
    const [y, m, d] = selectedDateKey.split("-").map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDateKey]);

  const selectedDateTitle = useMemo(() => { // 선택된 날짜 제목 생성
    const m = selectedDateObj.getMonth() + 1;
    const d = selectedDateObj.getDate();
    const dayLabel = getKoreanDayLabel(selectedDateObj.getDay());
    return `${m}/${d}(${dayLabel})`;
  }, [selectedDateObj]);

  const displayYear = currentYear;
  const displayMonth = currentMonth + 1;
  const todayKey = makeDateKey(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const handleDateClick = (day) => {
    if (!day) return;
    const key = makeDateKey(currentYear, currentMonth, day);
    setSelectedDateKey(key);
    setEditForm(null);
  };

  const handleOpenEdit = (record, dateKey) => { // 수정 요청 폼 열기
    const [year, month, day] = dateKey.split("-");
    const [sh, sm] = record.start.split(":");
    const [eh, em] = record.end.split(":");

    const formData = {
      recordId: record.id,
      contractId: record.contractId,
      originalDateKey: dateKey,
      place: record.place,
      wage: record.wage,
      date: `${year}-${pad2(Number(month))}-${pad2(Number(day))}`,
      startHour: sh,
      startMinute: sm,
      endHour: eh,
      endMinute: em,
      breakMinutes: record.breakMinutes ?? 60,
    };

    // 원본 데이터 저장 (변경사항 비교용) - 비교에 필요한 필드만 저장
    formData.originalData = {
      place: formData.place,
      wage: formData.wage,
      date: formData.date,
      startHour: formData.startHour,
      startMinute: formData.startMinute,
      endHour: formData.endHour,
      endMinute: formData.endMinute,
      breakMinutes: formData.breakMinutes,
    };

    setEditForm(formData);
  };

  const handleCloseEdit = () => { // 수정 요청 폼 닫기
    setEditForm(null);
  };

  const handleConfirmEdit = (form) => { // 수정 요청 확인 핸들러
    // TODO: 백엔드로 수정 요청 보내기
    console.log("edit request payload:", form);
    setEditForm(null);
  };

  const handleDeleteRequest = (form) => { // 삭제 요청 핸들러
    // TODO: 백엔드로 삭제 요청 보내기
    console.log("delete request payload:", form);
    setEditForm(null);
  };

  const handleOpenAddModal = () => { // 근무 추가 모달 열기
    setAddForm({
      place: workplaceOptions[0],
      date: selectedDateKey,
      startHour: "09",
      startMinute: "00",
      endHour: "13",
      endMinute: "00",
      breakMinutes: 60,
    });
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => { // 근무 추가 모달 닫기
    setIsAddModalOpen(false);
    setAddForm(null);
  };

  const handleConfirmAddWork = (form) => { // 근무 추가 확인 핸들러
    // TODO: 백엔드에 근무 추가 API 호출
    console.log("add work payload:", form);
    handleCloseAddModal();
  };

  return (
    <div className="monthly-calendar-page">
      {/* 상단 월 네비게이션 */}
      <div className="month-nav">
        <button className="month-nav-arrow" onClick={handlePrevMonth}>
          {"<"}
        </button>
        <div className="month-nav-title">
          {displayYear}년 {displayMonth}월
        </div>
        <button className="month-nav-arrow" onClick={handleNextMonth}>
          {">"}
        </button>
      </div>

      <div className="monthly-calendar-layout">
        <CalendarCard
          currentYear={currentYear}
          currentMonth={currentMonth}
          calendarCells={calendarCells}
          selectedDateKey={selectedDateKey}
          workRecords={workRecords}
          onSelectDay={handleDateClick}
          makeDateKey={makeDateKey}
          workLabelColorByPlace={workLabelColorByPlace}
          todayKey={todayKey}
        />

        {/* 우측 패널 */}
        <div className="right-panel">
          <div className="work-list">
            {recordsForSelectedDay.length === 0 ? (
              <div className="work-list-empty">
                선택한 날짜의 근무 기록이 없습니다.
              </div>
            ) : (
              recordsForSelectedDay.map((record) => (
                <React.Fragment key={record.id}>
                  <div className="work-list-item">
                    <div className="work-list-date">
                      <div className="work-list-date-day">
                        {selectedDateObj.getDate()}
                      </div>
                      <div className="work-list-date-weekday">
                        {getKoreanDayLabel(selectedDateObj.getDay())}
                      </div>
                    </div>

                    <div className="work-list-main">
                      <div className="work-list-time">
                        {record.start} ~ {record.end}
                      </div>
                      <div className="work-list-wage">
                        {record.wage.toLocaleString()}원
                      </div>
                      <div className="work-list-place">{record.place}</div>
                    </div>

                    <button
                      className="work-list-edit-btn"
                      type="button"
                      onClick={() =>
                        handleOpenEdit(record, selectedDateKey)
                      }
                    >
                      근무 기록 정정 요청
                    </button>
                  </div>

                  {editForm && editForm.recordId === record.id && (
                    <WorkEditRequestBox
                      form={editForm}
                      setForm={setEditForm}
                      onConfirm={handleConfirmEdit}
                      onDelete={handleDeleteRequest}
                      onCancel={handleCloseEdit}
                    />
                  )}
                </React.Fragment>
              ))
            )}
          </div>

          <button
            type="button"
            className="add-work-button"
            onClick={handleOpenAddModal}
          >
            + 근무 추가하기
          </button>

          <div className="memo-card">
            <div className="memo-header">메모 {selectedDateTitle}</div>
            <textarea
              className="memo-textarea"
              placeholder="텍스트를 입력하세요."
              value={memoForSelected}
              onChange={handleMemoChange}
            />
          </div>

          <div className="summary-row">
            <div className="summary-card">
              <div className="summary-label">월간 근무시간</div>
              <div className="summary-value">{totalHoursText}</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">월 급여</div>
              <div className="summary-value">
                {totalWage.toLocaleString()}원
              </div>
            </div>
          </div>
        </div>
      </div>
      {isAddModalOpen && (
        <AddWorkModal
          form={addForm}
          setForm={setAddForm}
          workplaceOptions={workplaceOptions}
          onConfirm={handleConfirmAddWork}
          onCancel={handleCloseAddModal}
        />
      )}
    </div>
  );
}

export default WorkerMonthlyCalendarPage;
