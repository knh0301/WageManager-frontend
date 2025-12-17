import { useState, useMemo, useEffect, useCallback } from "react";
import "./WorkerRemittancePage.css";
import {
  remittanceStatus,
} from "./remittanceDummyData";
import { formatCurrency } from "../employer/utils/formatUtils";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import WorkDetailList from "../../components/worker/RemittancePage/WorkDetailList";
import { getContracts, getContractDetail, getWorkRecords, getSalaries, getSalaryDetail } from "../../api/workerApi";
import { formatTime, parseWorkDate, pad2 } from "../../utils/dateUtils";

/**
 * 근로자 송금 관리 페이지
 * - 월별 근무 내역 조회
 * - 급여 및 입금 상태 확인
 * - 근무 상세 내역 확인
 */
// contractId를 안전하게 id로 변환하는 함수
const getId = (contractId) => {
  if (contractId === null || contractId === undefined) return null;
  if (typeof contractId === 'object' && 'id' in contractId) {
    return contractId.id;
  }
  return contractId;
};

export default function WorkerRemittancePage() {
  // State 관리
  const [workplaces, setWorkplaces] = useState([]); // 근무지 목록
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(null); // 선택된 근무지 ID (contractId)
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear()
  ); // 현재 선택된 연도
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date().getMonth() + 1
  ); // 현재 선택된 월 (1-12)
  const [expandedRecordIndex, setExpandedRecordIndex] = useState(null); // 확장된 근무 내역 카드의 인덱스
  const [sortOrder, setSortOrder] = useState("latest"); // 정렬 순서: "latest" (최신순) 또는 "oldest" (과거순)
  const [view, setView] = useState(false); // 정렬 드롭다운 열림/닫힘 상태
  const [workplaceView, setWorkplaceView] = useState(false); // 근무지 선택 드롭다운 열림/닫힘 상태
  const [workRecords, setWorkRecords] = useState([]); // 근무 기록 목록
  const [isLoading, setIsLoading] = useState(false);

  // 선택된 근무지 정보 조회
  const selectedWorkplace = workplaces.find((wp) => wp.id === selectedWorkplaceId);

  // 데이터 조회를 위한 월 키 생성 (예: "2025-09")
  const monthKey = useMemo(() => {
    return `${currentYear}-${pad2(currentMonth)}`;
  }, [currentYear, currentMonth]);

  // 근무지 목록 가져오기
  useEffect(() => {
    const fetchWorkplaces = async () => {
      try {
        const contractsResponse = await getContracts();
        let contracts = [];
        if (Array.isArray(contractsResponse.data)) {
          contracts = contractsResponse.data;
        } else if (contractsResponse.data) {
          contracts = [contractsResponse.data];
        }

        const workplacesList = await Promise.all(
          contracts.map(async (contract) => {
            const contractId = getId(contract);
            if (!contractId) return null;

            try {
              const contractDetail = await getContractDetail(contractId);
              return {
                id: contractId,
                name: contractDetail.data?.workplaceName || '',
              };
            } catch (error) {
              console.error(`[WorkerRemittancePage] 계약 ${contractId} 상세 정보 조회 실패:`, error);
              return null;
            }
          })
        );

        const validWorkplaces = workplacesList.filter((wp) => wp !== null);
        setWorkplaces(validWorkplaces);
        
        // 첫 번째 근무지를 기본 선택
        if (validWorkplaces.length > 0 && !selectedWorkplaceId) {
          setSelectedWorkplaceId(validWorkplaces[0].id);
        }
      } catch (error) {
        console.error("[WorkerRemittancePage] 근무지 목록 조회 실패:", error);
        setWorkplaces([]);
      }
    };

    fetchWorkplaces();
  }, [selectedWorkplaceId]);

  // 근무 기록 가져오기
  const fetchWorkRecords = useCallback(async () => {
    if (!selectedWorkplaceId) {
      setWorkRecords([]);
      return;
    }

    try {
      setIsLoading(true);
      
      // 1. 계약 상세 정보 가져오기 (시급, payrollDeductionType)
      const contractDetail = await getContractDetail(selectedWorkplaceId);
      const hourlyWage = contractDetail.data?.hourlyWage || 0;
      const payrollDeductionType = contractDetail.data?.payrollDeductionType || '';
      
      // 4대 보험 및 세금 정보 추출
      const hasSocialInsurance = payrollDeductionType.includes('INSURANCE');
      const hasWithholdingTax = payrollDeductionType.includes('TAX');

      // 2. 해당 월의 근무 기록 가져오기
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const startDate = `${currentYear}-${pad2(currentMonth)}-${pad2(1)}`;
      const endDate = `${currentYear}-${pad2(currentMonth)}-${pad2(lastDay)}`;

      const workRecordsResponse = await getWorkRecords(startDate, endDate);
      const workRecordsData = workRecordsResponse.data || [];

      // 3. 급여 기록 목록 가져오기
      const salariesResponse = await getSalaries();
      const salariesList = salariesResponse.data || [];

      // 4. 각 근무 기록에 대한 급여 상세 정보 가져오기
      const mappedRecords = await Promise.all(
        workRecordsData
          .filter((record) => record.contractId === selectedWorkplaceId && record.status !== "PENDING_APPROVAL")
          .map(async (record) => {
            // 날짜 파싱
            const { date, day } = parseWorkDate(record.workDate);
            
            // 해당 근무 기록의 급여 정보 찾기
            const salary = salariesList.find((s) => s.workRecordId === record.id);
            
            let overtimePay = 0;
            let nightPay = 0;
            let holidayPay = 0;
            
            if (salary) {
              try {
                const salaryDetail = await getSalaryDetail(salary.id);
                overtimePay = salaryDetail.data?.overtimePay || 0;
                nightPay = salaryDetail.data?.nightPay || 0;
                holidayPay = salaryDetail.data?.holidayPay || 0;
              } catch (error) {
                console.error(`[WorkerRemittancePage] 급여 ${salary.id} 상세 정보 조회 실패:`, error);
              }
            }

            // 수당 활성화 여부 및 비율 계산
            const baseWage = Math.round((hourlyWage * record.totalWorkMinutes) / 60);
            const overtimeRate = overtimePay > 0 ? Math.round((overtimePay / baseWage) * 100) : 0;
            const nightRate = nightPay > 0 ? Math.round((nightPay / baseWage) * 100) : 0;
            const holidayRate = holidayPay > 0 ? Math.round((holidayPay / baseWage) * 100) : 0;

            return {
              id: record.id,
              date: date,
              day: day,
              startTime: formatTime(record.startTime) || "00:00",
              endTime: formatTime(record.endTime) || "00:00",
              workplace: contractDetail.data?.workplaceName || '',
              breakMinutes: record.breakMinutes || 0,
              hourlyWage: hourlyWage,
              wage: baseWage + overtimePay + nightPay + holidayPay,
              allowances: {
                overtime: {
                  enabled: overtimePay > 0,
                  rate: overtimeRate,
                },
                night: {
                  enabled: nightPay > 0,
                  rate: nightRate,
                },
                holiday: {
                  enabled: holidayPay > 0,
                  rate: holidayRate,
                },
              },
              socialInsurance: hasSocialInsurance,
              withholdingTax: hasWithholdingTax,
            };
          })
      );

      // 날짜 기준으로 정렬
      const sortedRecords = [...mappedRecords].sort((a, b) => {
      if (sortOrder === "latest") {
          return b.date - a.date; // 최신순 (큰 날짜가 먼저)
      } else {
          return a.date - b.date; // 과거순 (작은 날짜가 먼저)
        }
      });

      setWorkRecords(sortedRecords);
    } catch (error) {
      console.error("[WorkerRemittancePage] 근무 기록 조회 실패:", error);
      setWorkRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedWorkplaceId, currentYear, currentMonth, sortOrder]);

  useEffect(() => {
    fetchWorkRecords();
  }, [fetchWorkRecords]);

  // 해당 월의 총 급여 계산
  const totalWage = useMemo(() => {
    return workRecords.reduce((sum, record) => sum + (record.wage ?? 0), 0);
  }, [workRecords]);

  // 입금 상태 정보 계산
  // - completed: 입금 완료 (송금 날짜 표시)
  // - pending: 입금 대기 (해당 월이 지났지만 아직 입금되지 않음)
  // - before: 입금 전 (해당 월이 아직 지나지 않음)
  const remittanceInfo = useMemo(() => {
    if (!selectedWorkplace || !remittanceStatus[selectedWorkplace?.name]) {
      return { status: "before", remittanceDate: null };
    }
    const status = remittanceStatus[selectedWorkplace.name][monthKey] || {
      isCompleted: false,
      remittanceDate: null,
    };

    // 해당 월이 지났는지 확인
    const today = new Date();
    const currentYearNum = today.getFullYear();
    const currentMonthNum = today.getMonth() + 1; // 0-based to 1-based
    
    // 선택한 월이 현재 월보다 이전인지 확인 (년도도 고려)
    const isMonthPassed = 
      currentYearNum > currentYear || 
      (currentYearNum === currentYear && currentMonthNum > currentMonth);

    // 상태 결정
    if (status.isCompleted) {
      return {
        status: "completed",
        remittanceDate: status.remittanceDate,
      };
    } else if (isMonthPassed) {
      return {
        status: "pending",
        remittanceDate: null,
      };
    } else {
      return {
        status: "before",
        remittanceDate: null,
      };
    }
  }, [selectedWorkplace, monthKey, currentYear, currentMonth]);

  // 이전 월로 이동 (1월이면 이전 년도 12월로 이동)
  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 1) {
        setCurrentYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
    setExpandedRecordIndex(null); // 월 변경 시 확장된 패널 닫기
  };

  // 다음 월로 이동 (12월이면 다음 년도 1월로 이동)
  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 12) {
        setCurrentYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
    setExpandedRecordIndex(null); // 월 변경 시 확장된 패널 닫기
  };

  // 근무지 선택 핸들러
  const handleWorkplaceSelect = (workplaceId) => {
    setSelectedWorkplaceId(workplaceId);
    setWorkplaceView(false); // 드롭다운 닫기
    setExpandedRecordIndex(null); // 근무지 변경 시 확장된 패널 닫기
  };

  // 근무 내역 카드 클릭 핸들러 (상세 정보 펼치기/접기)
  const handleRecordClick = (index) => {
    setExpandedRecordIndex((prev) => (prev === index ? null : index));
  };

  // 정렬 옵션 선택 핸들러
  const handleSortSelect = (order) => {
    setSortOrder(order);
    setView(false); // 드롭다운 닫기
    setExpandedRecordIndex(null); // 정렬 변경 시 확장된 패널 닫기
  };

  return (
    <div className="remittance-page">
        {/* 상단: 월 선택 */}
        <div className="remittance-header">
          <div className="remittance-header-left"></div>
          <div className="remittance-month-nav">
            <button
              type="button"
              className="month-nav-button"
              onClick={handlePrevMonth}
            >
              &lt;
            </button>
            <span className="month-display">
              {currentYear}년 {currentMonth}월
            </span>
            <button
              type="button"
              className="month-nav-button"
              onClick={handleNextMonth}
            >
              &gt;
            </button>
          </div>
          <div className="remittance-header-right"></div>
        </div>

        {/* 급여 카드 및 입금 상태 */}
        <div className="remittance-wage-section">
          <div className="wage-card-wrapper">
            {/* 근무지 선택 드롭다운 */}
            <div className="remittance-workplace-select-top">
              <div className="workplace-dropdown-wrapper">
                <button
                  type="button"
                  className="workplace-dropdown-button"
                  onClick={() => setWorkplaceView(!workplaceView)}
                >
                  <span>{selectedWorkplace?.name || "근무지 선택"}</span>
                  {workplaceView ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </button>
                {workplaceView && (
                  <div className="workplace-dropdown-menu">
                    {workplaces.map((wp) => (
                      <button
                        key={wp.id}
                        type="button"
                        className={`workplace-dropdown-item ${
                          selectedWorkplaceId === wp.id ? "active" : ""
                        }`}
                        onClick={() => handleWorkplaceSelect(wp.id)}
                      >
                        {wp.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* 급여 정보 및 입금 상태 카드 */}
            <div className="wage-card">
            <div className="wage-info-section">
              <div className="wage-label">급여</div>
              <div className="wage-amount">{formatCurrency(totalWage)}</div>
            </div>
            <div className="remittance-status-card">
              {/* 입금 상태에 따른 버튼 및 정보 표시 */}
              {remittanceInfo.status === "completed" ? (
                <>
                  <button className="remittance-status-button completed">
                    입금 완료
                  </button>
                  <div className="remittance-date">
                    송금 날짜: {remittanceInfo.remittanceDate}
                  </div>
                </>
              ) : remittanceInfo.status === "pending" ? (
                <button className="remittance-status-button pending">
                  입금 대기
                </button>
              ) : (
                <button className="remittance-status-button before">
                  입금 전
                </button>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* 근무 상세 내역 */}
        <WorkDetailList
          workRecords={workRecords}
          isLoading={isLoading}
          sortOrder={sortOrder}
          view={view}
          expandedRecordIndex={expandedRecordIndex}
          onSortSelect={handleSortSelect}
          onViewToggle={() => setView(!view)}
          onRecordClick={handleRecordClick}
        />
  </div>
  );
}
