import { useState, useMemo } from "react";
import "./WorkerRemittancePage.css";
import {
  workerWorkplaces,
  workerRemittanceData,
  remittanceStatus,
} from "./remittanceDummyData";
import { formatCurrency, formatBreakTime } from "../employer/utils/formatUtils";
import { allowanceDefinitions } from "../employer/utils/shiftUtils";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";

/**
 * 근로자 송금 관리 페이지
 * - 월별 근무 내역 조회
 * - 급여 및 입금 상태 확인
 * - 근무 상세 내역 확인
 */
export default function WorkerRemittancePage() {
  // State 관리
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(1); // 선택된 근무지 ID
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

  // 선택된 근무지 이름 조회
  const selectedWorkplace =
    workerWorkplaces.find((wp) => wp.id === selectedWorkplaceId)?.name || "";

  // 데이터 조회를 위한 월 키 생성 (예: "2025-09")
  const monthKey = useMemo(() => {
    return `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  }, [currentYear, currentMonth]);

  // 선택된 근무지와 월에 해당하는 근무 기록 조회 및 정렬
  const workRecords = useMemo(() => {
    if (!selectedWorkplace || !workerRemittanceData[selectedWorkplace]) {
      return [];
    }
    const records = workerRemittanceData[selectedWorkplace][monthKey] || [];
    
    // 날짜 기준으로 정렬 (최신순 또는 과거순)
    const sortedRecords = [...records].sort((a, b) => {
      const dateA = a.date;
      const dateB = b.date;
      
      if (sortOrder === "latest") {
        return dateB - dateA; // 최신순 (큰 날짜가 먼저)
      } else {
        return dateA - dateB; // 과거순 (작은 날짜가 먼저)
      }
    });
    
    return sortedRecords;
  }, [selectedWorkplace, monthKey, sortOrder]);

  // 해당 월의 총 급여 계산
  const totalWage = useMemo(() => {
    return workRecords.reduce((sum, record) => sum + (record.wage ?? 0), 0);
  }, [workRecords]);

  // 입금 상태 정보 계산
  // - completed: 입금 완료 (송금 날짜 표시)
  // - pending: 입금 대기 (해당 월이 지났지만 아직 입금되지 않음)
  // - before: 입금 전 (해당 월이 아직 지나지 않음)
  const remittanceInfo = useMemo(() => {
    if (!selectedWorkplace || !remittanceStatus[selectedWorkplace]) {
      return { isCompleted: false, remittanceDate: null };
    }
    const status = remittanceStatus[selectedWorkplace][monthKey] || {
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
                  <span>{selectedWorkplace}</span>
                  {workplaceView ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </button>
                {workplaceView && (
                  <div className="workplace-dropdown-menu">
                    {workerWorkplaces.map((wp) => (
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
        <div className="remittance-detail-section">
          {/* 근무 상세 내역 헤더 및 정렬 드롭다운 */}
          <div className="remittance-detail-header">
            <h2 className="remittance-detail-title">근무 상세 내역</h2>
            <div className="sort-dropdown-wrapper">
              <button
                type="button"
                className="sort-dropdown-button"
                onClick={() => setView(!view)}
              >
                <span>{sortOrder === "latest" ? "최신순" : "과거순"}</span>
                {view ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
              </button>
              {view && (
                <div className="sort-dropdown-menu">
                  <button
                    type="button"
                    className={`sort-dropdown-item ${
                      sortOrder === "latest" ? "active" : ""
                    }`}
                    onClick={() => handleSortSelect("latest")}
                  >
                    최신순
                  </button>
                  <button
                    type="button"
                    className={`sort-dropdown-item ${
                      sortOrder === "oldest" ? "active" : ""
                    }`}
                    onClick={() => handleSortSelect("oldest")}
                  >
                    과거순
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* 근무 상세 내역 리스트 */}
          <div className="remittance-detail-list">
          {workRecords.length > 0 ? (
            workRecords.map((record, index) => (
              <div key={record.id}>
                {/* 근무 내역 카드 (클릭 시 상세 정보 펼치기/접기) */}
                <div
                  className="remittance-detail-card"
                  onClick={() => handleRecordClick(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    // 키보드 접근성: Enter 또는 Space 키로도 카드 클릭 가능
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleRecordClick(index);
                    }
                  }}
                >
                  <div className="detail-date">
                    <span className="date-number">{record.date}</span>
                    <span className="date-day">{record.day}</span>
                  </div>
                  <div className="detail-time">
                    <span>
                      {record.startTime} ~ {record.endTime} {record.workplace}
                    </span>
                  </div>
                </div>
                {/* 근무 상세 정보 패널 (카드 클릭 시 확장) */}
                <div
                  className={`remittance-detail-panel ${
                    expandedRecordIndex === index ? "open" : ""
                  }`}
                >
                  <div className="detail-panel-content">
                    {/* 왼쪽 섹션: 기본 근무 정보 */}
                    <div className="detail-left-section">
                      <div className="detail-form-item">
                        <label className="detail-form-label">근무지</label>
                        <input
                          type="text"
                          className="detail-form-input"
                          value={record.workplace}
                          readOnly
                        />
                      </div>
                      <div className="detail-form-item">
                        <label className="detail-form-label">근무 시간</label>
                        <div className="time-input-group">
                          <input
                            type="text"
                            className="detail-form-input time-input"
                            value={record.startTime}
                            readOnly
                          />
                          <span className="time-separator">~</span>
                          <input
                            type="text"
                            className="detail-form-input time-input"
                            value={record.endTime}
                            readOnly
                          />
                        </div>
                      </div>
                      <div className="detail-form-item">
                        <label className="detail-form-label">휴게 시간</label>
                        <input
                          type="text"
                          className="detail-form-input"
                          value={formatBreakTime(record.breakMinutes)}
                          readOnly
                        />
                      </div>
                      <div className="detail-form-item">
                        <label className="detail-form-label">시급</label>
                        <input
                          type="text"
                          className="detail-form-input"
                          value={formatCurrency(record.hourlyWage)}
                          readOnly
                        />
                      </div>
                    </div>
                    {/* 오른쪽 섹션: 수당, 보험, 세금 정보 */}
                    <div className="detail-right-section">
                      {/* 수당 버튼들 (야간, 연장, 휴일 등) */}
                      <div className="allowance-buttons">
                        {allowanceDefinitions.map(({ key, label }) => {
                          const allowance = record.allowances?.[key] || {
                            enabled: false,
                            rate: 0,
                          };
                          return (
                            <button
                              key={key}
                              type="button"
                              className={`allowance-button ${
                                allowance.enabled ? "active" : ""
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                      {/* 야간 근무 수당이 활성화된 경우에만 표시 */}
                      {record.allowances?.night?.enabled && (
                        <div className="detail-form-item">
                          <label className="detail-form-label">
                            야간 근무 금액
                          </label>
                          <input
                            type="text"
                            className="detail-form-input"
                            value={`${record.allowances.night.rate} %`}
                            readOnly
                          />
                        </div>
                      )}
                      {/* 4대 보험 적용 여부 */}
                      <div className="insurance-toggle-item">
                        <label className="detail-form-label">4대 보험</label>
                        <div
                          className={`toggle-switch ${
                            record.socialInsurance ? "on" : "off"
                          }`}
                        >
                          <div className="toggle-slider"></div>
                        </div>
                      </div>
                      {/* 소득세 원천징수 여부 */}
                      <div className="insurance-toggle-item">
                        <label className="detail-form-label">소득세</label>
                        <div
                          className={`toggle-switch ${
                            record.withholdingTax ? "on" : "off"
                          }`}
                        >
                          <div className="toggle-slider"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">근무 내역이 없습니다.</p>
          )}
          </div>
        </div>
  </div>
  );
}
