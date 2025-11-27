import { useState, useMemo } from "react";
import "../../styles/workerManagePage.css";
import { initialWorkplaces, workplaceWorkers, workerInfo } from "./dummyData";
import { formatCurrency } from "./utils/formatUtils";

const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
const hours = Array.from({ length: 24 }, (_, i) => i);

export default function WorkerManagePage() {
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(1);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isEditingBasic, setIsEditingBasic] = useState(false);
  const [isEditingWork, setIsEditingWork] = useState(false);

  const selectedWorkplace =
    initialWorkplaces.find((wp) => wp.id === selectedWorkplaceId)?.name || "";

  const workers = useMemo(() => {
    return workplaceWorkers[selectedWorkplaceId] || [];
  }, [selectedWorkplaceId]);

  // 선택된 직원이 없으면 첫 번째 직원을 기본 선택
  const currentWorker = useMemo(() => {
    if (selectedWorker && workers.includes(selectedWorker)) {
      return selectedWorker;
    }
    return workers.length > 0 ? workers[0] : null;
  }, [selectedWorker, workers]);

  const workerData = useMemo(() => {
    if (!currentWorker || !workerInfo[selectedWorkplace]) {
      return null;
    }
    return workerInfo[selectedWorkplace][currentWorker] || null;
  }, [currentWorker, selectedWorkplace]);

  const handleWorkplaceChange = (e) => {
    const newWorkplaceId = Number(e.target.value);
    setSelectedWorkplaceId(newWorkplaceId);
    setSelectedWorker(null);
  };

  const handleWorkerClick = (workerName) => {
    setSelectedWorker(workerName);
  };

  const handleAddWorker = () => {
    alert("근무자 추가 기능 (구현 예정)");
  };

  // 주간 스케줄 그리드 데이터 생성
  const weeklyScheduleGrid = useMemo(() => {
    if (!workerData?.workInfo?.weeklySchedule) {
      return {};
    }

    const schedule = workerData.workInfo.weeklySchedule;
    const grid = {};

    daysOfWeek.forEach((day) => {
      grid[day] = [];
      if (schedule[day]) {
        const { start, end } = schedule[day];
        const [startHour, startMin] = start.split(":").map(Number);
        const [endHour, endMin] = end.split(":").map(Number);
        const startDecimal = startHour + startMin / 60;
        const endDecimal = endHour + endMin / 60;

        grid[day].push({
          start: startDecimal,
          end: endDecimal,
          startTime: start,
          endTime: end,
          startHour,
          startMin,
          endHour,
          endMin,
        });
      }
    });

    return grid;
  }, [workerData]);

  return (
    <div className="worker-manage-page">
      {/* 왼쪽 사이드바 */}
      <div className="worker-manage-left-panel">
        <div className="worker-manage-workplace-select">
          <select
            value={selectedWorkplaceId}
            onChange={handleWorkplaceChange}
            className="workplace-select"
          >
            {initialWorkplaces.map((wp) => (
              <option key={wp.id} value={wp.id}>
                {wp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="worker-manage-worker-list">
          {workers.map((worker) => (
            <div
              key={worker}
              className={`worker-item ${
                currentWorker === worker ? "selected" : ""
              }`}
              onClick={() => handleWorkerClick(worker)}
            >
              {worker}
            </div>
          ))}
        </div>

        <button
          type="button"
          className="add-worker-button"
          onClick={handleAddWorker}
        >
          근무자 추가
        </button>
      </div>

      {/* 중앙 콘텐츠 영역 */}
      <div className="worker-manage-center-panel">
        {workerData ? (
          <>
            {/* 기본 정보 카드 */}
            <div className="info-card">
              <div className="info-card-header">
                <h3 className="info-card-title">기본 정보</h3>
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => setIsEditingBasic(!isEditingBasic)}
                >
                  수정
                </button>
              </div>
              <div className="info-card-content">
                <div className="basic-info-header">
                  <div className="profile-icon">👤</div>
                  <div>
                    <div className="worker-name">
                      {workerData.basicInfo.name}
                    </div>
                    <div className="worker-birthdate">
                      {workerData.basicInfo.birthDate}
                    </div>
                  </div>
                </div>
                <div className="info-field">
                  <label className="info-label">전화 번호</label>
                  {isEditingBasic ? (
                    <input
                      type="text"
                      className="info-input"
                      defaultValue={workerData.basicInfo.phone}
                    />
                  ) : (
                    <div className="info-value">
                      {workerData.basicInfo.phone}
                    </div>
                  )}
                </div>
                <div className="info-field">
                  <label className="info-label">이메일</label>
                  {isEditingBasic ? (
                    <input
                      type="email"
                      className="info-input"
                      defaultValue={workerData.basicInfo.email}
                    />
                  ) : (
                    <div className="info-value">
                      {workerData.basicInfo.email}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 근무 정보 카드 */}
            <div className="info-card">
              <div className="info-card-header">
                <h3 className="info-card-title">근무 정보</h3>
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => setIsEditingWork(!isEditingWork)}
                >
                  수정
                </button>
              </div>
              <div className="info-card-content">
                <div className="info-field">
                  <label className="info-label">근무지</label>
                  {isEditingWork ? (
                    <input
                      type="text"
                      className="info-input"
                      defaultValue={workerData.workInfo.workplace}
                    />
                  ) : (
                    <div className="info-value">
                      {workerData.workInfo.workplace}
                    </div>
                  )}
                </div>

                <div className="info-field">
                  <label className="info-label">근무 시간</label>
                  <div className="weekly-schedule-inputs">
                    {daysOfWeek.map((day) => {
                      const schedule = workerData.workInfo.weeklySchedule[day];
                      return (
                        <div key={day} className="day-schedule-row">
                          <span className="day-label">{day}요일</span>
                          {isEditingWork ? (
                            <div className="time-inputs">
                              <select className="time-select">
                                {hours.map((h) => (
                                  <option key={h} value={h}>
                                    {String(h).padStart(2, "0")}
                                  </option>
                                ))}
                              </select>
                              <span>:</span>
                              <select className="time-select">
                                <option value="0">00</option>
                                <option value="30">30</option>
                              </select>
                              <span> - </span>
                              <select className="time-select">
                                {hours.map((h) => (
                                  <option key={h} value={h}>
                                    {String(h).padStart(2, "0")}
                                  </option>
                                ))}
                              </select>
                              <span>:</span>
                              <select className="time-select">
                                <option value="0">00</option>
                                <option value="30">30</option>
                              </select>
                            </div>
                          ) : (
                            <div className="time-display">
                              {schedule
                                ? `${schedule.start} - ${schedule.end}`
                                : "휴무"}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="info-field">
                  <label className="info-label">휴게 시간</label>
                  <div className="break-time-input">
                    <select
                      className="break-time-select"
                      disabled={!isEditingWork}
                    >
                      <option>요일별</option>
                    </select>
                    {isEditingWork ? (
                      <input
                        type="number"
                        className="break-time-input-field"
                        defaultValue={workerData.workInfo.breakTime}
                      />
                    ) : (
                      <div className="info-value">
                        {workerData.workInfo.breakTime} 분
                      </div>
                    )}
                  </div>
                </div>

                <div className="info-field">
                  <label className="info-label">시급</label>
                  {isEditingWork ? (
                    <input
                      type="number"
                      className="info-input"
                      defaultValue={workerData.workInfo.hourlyWage}
                    />
                  ) : (
                    <div className="info-value">
                      {formatCurrency(workerData.workInfo.hourlyWage)}
                    </div>
                  )}
                </div>

                <div className="info-field">
                  <label className="info-label">급여 지급일</label>
                  {isEditingWork ? (
                    <input
                      type="text"
                      className="info-input"
                      defaultValue={`매월 ${workerData.workInfo.payday} 일`}
                    />
                  ) : (
                    <div className="info-value">
                      매월 {workerData.workInfo.payday} 일
                    </div>
                  )}
                </div>

                <div className="toggle-row">
                  <div className="toggle-item">
                    <label className="toggle-label">4대 보험</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={workerData.workInfo.socialInsurance}
                        disabled={!isEditingWork}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <label className="toggle-label">소득세</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={workerData.workInfo.withholdingTax}
                        disabled={!isEditingWork}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-worker-selected">직원을 선택해주세요.</div>
        )}
      </div>

      {/* 오른쪽 스케줄 그리드 */}
      <div className="worker-manage-right-panel">
        <div className="schedule-grid-container">
          <div className="schedule-grid-header">
            <div className="schedule-time-column"></div>
            {daysOfWeek.map((day) => (
              <div key={day} className="schedule-day-header">
                {day}
              </div>
            ))}
          </div>
          <div className="schedule-grid-body">
            <div className="schedule-time-column">
              {hours.map((hour) => (
                <div key={hour} className="schedule-hour-cell">
                  {hour}
                </div>
              ))}
            </div>
            {daysOfWeek.map((day) => {
              const blocks = weeklyScheduleGrid[day] || [];
              return (
                <div key={day} className="schedule-day-column">
                  {hours.map((hour) => {
                    // 해당 시간대에 포함되는 블록 찾기
                    const block = blocks.find((block) => {
                      const blockStartHour = Math.floor(block.start);
                      const blockEndHour = Math.ceil(block.end);
                      return hour >= blockStartHour && hour < blockEndHour;
                    });

                    // 블록이 시작하는 시간인지 확인
                    const isBlockStart = blocks.some(
                      (block) => block.startHour === hour
                    );
                    // 블록이 끝나는 시간인지 확인
                    const isBlockEnd = blocks.some(
                      (block) => block.endHour === hour
                    );

                    // 블록의 시작 위치 계산 (분 단위)
                    let blockTop = 0;
                    let blockHeight = 100;
                    if (block) {
                      if (isBlockStart) {
                        blockTop = (block.startMin / 60) * 100;
                      }
                      if (isBlockEnd) {
                        blockHeight = (block.endMin / 60) * 100;
                      } else if (isBlockStart) {
                        blockHeight = 100 - blockTop;
                      }
                    }

                    return (
                      <div
                        key={hour}
                        className={`schedule-cell ${
                          block ? "has-schedule" : ""
                        }`}
                        title={
                          block
                            ? `근무 시간: ${block.startTime} - ${block.endTime}`
                            : ""
                        }
                      >
                        {block && (
                          <div
                            className="schedule-block"
                            style={{
                              top: `${blockTop}%`,
                              height: `${blockHeight}%`,
                            }}
                          ></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
