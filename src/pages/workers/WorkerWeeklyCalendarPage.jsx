import { useState, useEffect, useCallback } from "react";
import WeeklyCalendar from "../../components/worker/WeeklyCalendar/WeeklyCalendar";
import { getContracts, getContractDetail, getWorkRecords, createCorrectionRequest } from "../../api/workerApi";
import { toast } from "react-toastify";

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

// 주의 시작일(일요일)을 구하는 함수
const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay(); //0(일요일) ~ 6(토요일)
  d.setDate(d.getDate() - day); // 일요일로 이동
  return d;
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

  if (!apiData || !Array.isArray(apiData)) {
    return { recordsByDate };
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
  });

  return { recordsByDate };
};

export default function WorkerWeeklyCalendarPage() {
  const today = new Date();
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(today));
  const [workRecords, setWorkRecords] = useState({});

  // 주간 근무 기록 가져오기 함수
  const fetchWorkRecords = useCallback(async () => {
    try {
      // 1. 계약 목록 가져오기
      const contractsResponse = await getContracts();
      
      // 응답이 배열인지 확인
      let contractIds = [];
      if (Array.isArray(contractsResponse.data)) {
        contractIds = contractsResponse.data;
      } else if (contractsResponse.data) {
        contractIds = [contractsResponse.data];
      }
      
      if (contractIds.length === 0) {
        setWorkRecords({});
        return;
      }

      // 2. 각 계약의 시급 정보 가져오기
      const hourlyWageMap = {};
      await Promise.all(
        contractIds.map(async (contractId) => {
          try {
            const id = typeof contractId === 'object' ? contractId.id : contractId;
            const contractDetail = await getContractDetail(id);
            
            if (contractDetail.data?.hourlyWage !== undefined) {
              hourlyWageMap[id] = contractDetail.data.hourlyWage;
            }
          } catch (error) {
            console.error(`[WorkerWeeklyCalendarPage] 계약 ${contractId} 상세 정보 조회 실패:`, error);
          }
        })
      );

      // 3. 현재 주의 시작일(일요일)과 종료일(토요일) 계산
      const weekStart = new Date(currentWeekStart);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // 토요일

      const startDate = `${weekStart.getFullYear()}-${pad2(weekStart.getMonth() + 1)}-${pad2(weekStart.getDate())}`;
      const endDate = `${weekEnd.getFullYear()}-${pad2(weekEnd.getMonth() + 1)}-${pad2(weekEnd.getDate())}`;

      // 4. 근무 기록 가져오기
      const workRecordsResponse = await getWorkRecords(startDate, endDate);
      const workRecordsData = workRecordsResponse.data || [];

      // 5. 데이터 매핑
      const { recordsByDate } = mapWorkRecords(workRecordsData, hourlyWageMap);
      setWorkRecords(recordsByDate);
    } catch (error) {
      console.error("[WorkerWeeklyCalendarPage] 근무 기록 조회 실패:", error);
      setWorkRecords({});
    }
  }, [currentWeekStart]);

  // API에서 근무 기록 가져오기
  useEffect(() => {
    const loadWorkRecords = async () => {
      await fetchWorkRecords();
    };
    loadWorkRecords();
  }, [fetchWorkRecords]);


  // 근무 기록 정정 요청 확인
  const handleConfirmEdit = async (form) => {
    try {
      // 1. 해당 workRecordId가 현재 로그인한 근로자의 근무 기록인지 확인
      const [year, month, day] = form.date.split("-").map(Number);
      const targetDate = new Date(year, month - 1, day);
      
      // 해당 날짜가 포함된 주의 시작일과 종료일 계산
      const weekStart = getWeekStart(targetDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const startDate = `${weekStart.getFullYear()}-${pad2(weekStart.getMonth() + 1)}-${pad2(weekStart.getDate())}`;
      const endDate = `${weekEnd.getFullYear()}-${pad2(weekEnd.getMonth() + 1)}-${pad2(weekEnd.getDate())}`;
      
      // 해당 주의 근무 기록 가져오기
      const workRecordsResponse = await getWorkRecords(startDate, endDate);
      const workRecordsData = workRecordsResponse.data || [];
      
      // workRecordId가 현재 근로자의 근무 기록 목록에 있는지 확인
      const workRecordId = Number(form.recordId);
      const isValidWorkRecord = workRecordsData.some(
        (record) => Number(record.id) === workRecordId
      );
      
      if (!isValidWorkRecord) {
        const errorMessage = "[FORBIDDEN] 본인의 근무 기록만 정정 요청할 수 있습니다.";
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
        throw new Error(errorMessage);
      }

      // 2. 정정 요청 보내기
      // 시간을 "HH:mm:ss" 형식의 문자열로 변환
      const startTimeStr = `${pad2(Number(form.startHour))}:${pad2(Number(form.startMinute))}:00`;
      const endTimeStr = `${pad2(Number(form.endHour))}:${pad2(Number(form.endMinute))}:00`;
      
      const payload = {
        workRecordId: workRecordId,
        requestedWorkDate: form.date,
        requestedStartTime: startTimeStr,
        requestedEndTime: endTimeStr,
      };

      const response = await createCorrectionRequest(payload);

      if (response?.success) {
        toast.success("근무 기록 정정 요청이 접수되었습니다.", {
          position: "top-right",
          autoClose: 3000,
        });
        // 정정 요청은 고용주 승인 후에야 변경되므로 UI 업데이트하지 않음
        // 성공 시 WeeklyCalendar 컴포넌트에서 폼을 닫도록 처리
        return;
      }

      // response.success가 false인 경우 Error를 throw하여 WeeklyCalendar의 catch에서 처리
      const errorMessage =
        response?.error?.message || "근무 기록 정정 요청에 실패했습니다.";
      const errorCode = response?.error?.code || "UNKNOWN";

      toast.error(`[${errorCode}] ${errorMessage}`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      throw new Error(errorMessage);
    } catch (error) {
      const status = error.status || error.response?.status || "";
      const statusText = status ? `[${status}] ` : "";
      const errorMessage =
        error.error?.message ||
        error.message ||
        "근무 기록 정정 요청에 실패했습니다.";
      const errorCode =
        error.error?.code || error.errorCode || "UNKNOWN";

      toast.error(`${statusText}[${errorCode}] ${errorMessage}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="worker-content-frame weekly-calendar-wrapper">
      <WeeklyCalendar 
        workRecords={workRecords}
        onConfirmEdit={handleConfirmEdit}
        onWeekChange={setCurrentWeekStart}
      />
    </div>
  );
}
