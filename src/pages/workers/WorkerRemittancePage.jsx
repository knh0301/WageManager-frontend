import { useState, useMemo, useEffect, useCallback } from "react";
import "./WorkerRemittancePage.css";
import { formatCurrency } from "../employer/utils/formatUtils";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import WorkDetailList from "../../components/worker/RemittancePage/WorkDetailList";
import { getContracts, getContractDetail, getWorkRecords, calculateSalary, getPayments } from "../../api/workerApi";
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
  const [calculatedSalary, setCalculatedSalary] = useState(null); // 계산된 급여 정보
  const [isCalculatingSalary, setIsCalculatingSalary] = useState(false); // 급여 계산 중 상태
  const [payments, setPayments] = useState([]); // 송금 내역 목록

  // 선택된 근무지 정보 조회
  const selectedWorkplace = workplaces.find((wp) => wp.id === selectedWorkplaceId);

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

  // 근무 기록 가져오기 (표시용, 급여 계산은 calculateSalary API 사용)
  const fetchWorkRecords = useCallback(async () => {
    if (!selectedWorkplaceId) {
      setWorkRecords([]);
      return;
    }

    try {
      setIsLoading(true);
      
      // 계약 상세 정보 가져오기 (workplaceName 등)
      const contractDetail = await getContractDetail(selectedWorkplaceId);
      const hourlyWage = contractDetail.data?.hourlyWage || 0;
      const payrollDeductionType = contractDetail.data?.payrollDeductionType || '';
      
      // 4대 보험 및 세금 정보 추출
      const hasSocialInsurance = payrollDeductionType.includes('INSURANCE');
      const hasWithholdingTax = payrollDeductionType.includes('TAX');

      // 해당 월의 근무 기록 가져오기
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const startDate = `${currentYear}-${pad2(currentMonth)}-${pad2(1)}`;
      const endDate = `${currentYear}-${pad2(currentMonth)}-${pad2(lastDay)}`;

      const workRecordsResponse = await getWorkRecords(startDate, endDate);
      const workRecordsData = workRecordsResponse.data || [];

      // 근무 기록 매핑 (급여 계산은 calculateSalary API 결과 사용)
      const mappedRecords = workRecordsData
        .filter((record) => record.contractId === selectedWorkplaceId && record.status !== "PENDING_APPROVAL")
        .map((record) => {
          // 날짜 파싱
          const { date, day } = parseWorkDate(record.workDate);

          // 기본 급여 계산 (표시용, 실제 급여는 calculateSalary API 결과 사용)
          const baseWage = Math.round((hourlyWage * record.totalWorkMinutes) / 60);

          return {
            id: record.id,
            date: date,
            day: day,
            startTime: formatTime(record.startTime) || "00:00",
            endTime: formatTime(record.endTime) || "00:00",
            workplace: contractDetail.data?.workplaceName || '',
            breakMinutes: record.breakMinutes || 0,
            hourlyWage: hourlyWage,
            wage: baseWage, // 기본 급여만 표시 (실제 급여는 calculateSalary API 결과 사용)
            allowances: {
              overtime: {
                enabled: false,
                rate: 0,
              },
              night: {
                enabled: false,
                rate: 0,
              },
              holiday: {
                enabled: false,
                rate: 0,
              },
            },
            socialInsurance: hasSocialInsurance,
            withholdingTax: hasWithholdingTax,
          };
        });

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

  // 급여 계산 API 호출
  const fetchCalculatedSalary = useCallback(async () => {
    if (!selectedWorkplaceId) {
      setCalculatedSalary(null);
      return;
    }

    try {
      setIsCalculatingSalary(true);
      const response = await calculateSalary(selectedWorkplaceId, currentYear, currentMonth);
      if (response?.success && response?.data) {
        setCalculatedSalary(response.data);
      } else {
        setCalculatedSalary(null);
      }
    } catch (error) {
      console.error("[WorkerRemittancePage] 급여 계산 실패:", error);
      setCalculatedSalary(null);
    } finally {
      setIsCalculatingSalary(false);
    }
  }, [selectedWorkplaceId, currentYear, currentMonth]);

  useEffect(() => {
    fetchCalculatedSalary();
  }, [fetchCalculatedSalary]);

  // 송금 내역 가져오기
  const fetchPayments = useCallback(async () => {
    try {
      const response = await getPayments();
      if (response?.success && response?.data) {
        setPayments(response.data);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error("[WorkerRemittancePage] 송금 내역 조회 실패:", error);
      setPayments([]);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // 해당 월의 총 급여 계산 (calculateSalary API 결과 사용)
  const totalWage = useMemo(() => {
    if (calculatedSalary?.netPay !== undefined) {
      return calculatedSalary.netPay;
    }
    return 0;
  }, [calculatedSalary]);

  // 입금 상태 정보 계산 (API 데이터 기반)
  // - completed: 입금 완료 (isPaid === true, 송금 날짜 표시)
  // - pending: 입금 대기 (isPaid === false, 해당 월이 지났지만 아직 입금되지 않음)
  // - before: 입금 전 (isPaid === false, 해당 월이 아직 지나지 않음)
  const remittanceInfo = useMemo(() => {
    if (!calculatedSalary?.id) {
      // 급여 계산 결과가 없으면 "입금 전"으로 표시
      return { status: "before", remittanceDate: null };
    }

    // 현재 선택된 월의 송금 내역 찾기 (salaryId로 매칭)
    const payment = payments.find((p) => p.salaryId === calculatedSalary.id);

    if (!payment) {
      // 송금 내역이 없으면 해당 월이 지났는지 확인
      const today = new Date();
      const currentYearNum = today.getFullYear();
      const currentMonthNum = today.getMonth() + 1;
      
      const isMonthPassed = 
        currentYearNum > currentYear || 
        (currentYearNum === currentYear && currentMonthNum > currentMonth);

      return {
        status: isMonthPassed ? "pending" : "before",
        remittanceDate: null,
      };
    }

    // isPaid가 true면 입금 완료
    if (payment.isPaid) {
      return {
        status: "completed",
        remittanceDate: payment.paymentDate || null,
      };
    }

    // isPaid가 false면 입금 대기 또는 입금 전
    const today = new Date();
    const currentYearNum = today.getFullYear();
    const currentMonthNum = today.getMonth() + 1;
    
    const isMonthPassed = 
      currentYearNum > currentYear || 
      (currentYearNum === currentYear && currentMonthNum > currentMonth);

    return {
      status: isMonthPassed ? "pending" : "before",
      remittanceDate: null,
    };
  }, [calculatedSalary, payments, currentYear, currentMonth]);

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
              <div className="wage-amount">
                {isCalculatingSalary ? "계산 중..." : formatCurrency(totalWage)}
              </div>
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
