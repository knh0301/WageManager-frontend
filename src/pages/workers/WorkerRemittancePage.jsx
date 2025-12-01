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

export default function WorkerRemittancePage() {
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(1);
  const [currentYear, setCurrentYear] = useState(() =>
    new Date().getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState(
    () => new Date().getMonth() + 1
  );
  const [expandedRecordIndex, setExpandedRecordIndex] = useState(null);
  const [sortOrder, setSortOrder] = useState("latest"); // "latest" 또는 "oldest"
  const [view, setView] = useState(false);
  const [workplaceView, setWorkplaceView] = useState(false);

  const selectedWorkplace =
    workerWorkplaces.find((wp) => wp.id === selectedWorkplaceId)?.name || "";

  const monthKey = useMemo(() => {
    return `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  }, [currentYear, currentMonth]);

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

  const totalWage = useMemo(() => {
    return workRecords.reduce((sum, record) => sum + (record.wage ?? 0), 0);
  }, [workRecords]);

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

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 1) {
        setCurrentYear((y) => y - 1);
        return 12;
      }
      return prev - 1;
    });
    setExpandedRecordIndex(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 12) {
        setCurrentYear((y) => y + 1);
        return 1;
      }
      return prev + 1;
    });
    setExpandedRecordIndex(null);
  };

  const handleWorkplaceSelect = (workplaceId) => {
    setSelectedWorkplaceId(workplaceId);
    setWorkplaceView(false);
    setExpandedRecordIndex(null);
  };

  const handleRecordClick = (index) => {
    setExpandedRecordIndex((prev) => (prev === index ? null : index));
  };

  const handleSortSelect = (order) => {
    setSortOrder(order);
    setView(false);
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
            <div className="wage-card">
            <div className="wage-info-section">
              <div className="wage-label">급여</div>
              <div className="wage-amount">{formatCurrency(totalWage)}</div>
            </div>
            <div className="remittance-status-card">
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
          <div className="remittance-detail-list">
          {workRecords.length > 0 ? (
            workRecords.map((record, index) => (
              <div key={record.id}>
                <div
                  className="remittance-detail-card"
                  onClick={() => handleRecordClick(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
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
                <div
                  className={`remittance-detail-panel ${
                    expandedRecordIndex === index ? "open" : ""
                  }`}
                >
                  <div className="detail-panel-content">
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
                    <div className="detail-right-section">
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
