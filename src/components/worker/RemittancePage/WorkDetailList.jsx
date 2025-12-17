import React from "react";
import PropTypes from "prop-types";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { formatCurrency, formatBreakTime } from "../../../pages/employer/utils/formatUtils";
import { allowanceDefinitions } from "../../../pages/employer/utils/shiftUtils";
import "../../../pages/workers/WorkerRemittancePage.css";

function WorkDetailList({
  workRecords,
  isLoading,
  sortOrder,
  view,
  expandedRecordIndex,
  onSortSelect,
  onViewToggle,
  onRecordClick,
}) {
  return (
    <div className="remittance-detail-section">
      {/* 근무 상세 내역 헤더 및 정렬 드롭다운 */}
      <div className="remittance-detail-header">
        <h2 className="remittance-detail-title">근무 상세 내역</h2>
        <div className="sort-dropdown-wrapper">
          <button
            type="button"
            className="sort-dropdown-button"
            onClick={onViewToggle}
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
                onClick={() => onSortSelect("latest")}
              >
                최신순
              </button>
              <button
                type="button"
                className={`sort-dropdown-item ${
                  sortOrder === "oldest" ? "active" : ""
                }`}
                onClick={() => onSortSelect("oldest")}
              >
                과거순
              </button>
            </div>
          )}
        </div>
      </div>
      {/* 근무 상세 내역 리스트 */}
      <div className="remittance-detail-list">
        {isLoading ? (
          <p className="no-data">로딩 중...</p>
        ) : workRecords.length > 0 ? (
          workRecords.map((record, index) => (
            <div key={record.id}>
              {/* 근무 내역 카드 (클릭 시 상세 정보 펼치기/접기) */}
              <div
                className="remittance-detail-card"
                onClick={() => onRecordClick(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  // 키보드 접근성: Enter 또는 Space 키로도 카드 클릭 가능
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onRecordClick(index);
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
  );
}

WorkDetailList.propTypes = {
  workRecords: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      date: PropTypes.number.isRequired,
      day: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      workplace: PropTypes.string.isRequired,
      breakMinutes: PropTypes.number.isRequired,
      hourlyWage: PropTypes.number.isRequired,
      wage: PropTypes.number.isRequired,
      allowances: PropTypes.shape({
        overtime: PropTypes.shape({
          enabled: PropTypes.bool,
          rate: PropTypes.number,
        }),
        night: PropTypes.shape({
          enabled: PropTypes.bool,
          rate: PropTypes.number,
        }),
        holiday: PropTypes.shape({
          enabled: PropTypes.bool,
          rate: PropTypes.number,
        }),
      }),
      socialInsurance: PropTypes.bool,
      withholdingTax: PropTypes.bool,
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  sortOrder: PropTypes.oneOf(["latest", "oldest"]).isRequired,
  view: PropTypes.bool.isRequired,
  expandedRecordIndex: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf([null])]),
  onSortSelect: PropTypes.func.isRequired,
  onViewToggle: PropTypes.func.isRequired,
  onRecordClick: PropTypes.func.isRequired,
};

WorkDetailList.defaultProps = {
  expandedRecordIndex: null,
};

export default WorkDetailList;

