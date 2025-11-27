import { useState, useMemo } from "react";
import { FaUser } from "react-icons/fa";
import Swal from "sweetalert2";
import "../../styles/workerManagePage.css";
import { initialWorkplaces, workplaceWorkers, workerInfo } from "./dummyData";
import { formatCurrency } from "./utils/formatUtils";

const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
const hours = Array.from({ length: 24 }, (_, i) => i);

export default function WorkerManagePage() {
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(1);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [hoveredBlockGroup, setHoveredBlockGroup] = useState(null);
  const [workersList, setWorkersList] = useState(() => workplaceWorkers);
  const [isEditingWork, setIsEditingWork] = useState(false);
  const [editedWorkInfo, setEditedWorkInfo] = useState(null);
  // 수정된 근무 정보를 저장하는 상태
  const [updatedWorkInfo, setUpdatedWorkInfo] = useState({});

  const selectedWorkplace =
    initialWorkplaces.find((wp) => wp.id === selectedWorkplaceId)?.name || "";

  const workers = useMemo(() => {
    return workersList[selectedWorkplaceId] || [];
  }, [selectedWorkplaceId, workersList]);

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

  // 수정 중인 근무 정보 관리 (저장된 정보 우선, 수정 중이면 수정 중 정보)
  const currentWorkInfo = useMemo(() => {
    // 수정 모드일 때는 수정 중인 정보 사용
    if (isEditingWork && editedWorkInfo && editedWorkInfo.workerName === currentWorker) {
      return editedWorkInfo;
    }
    // 저장된 수정 정보가 있으면 그것을 사용
    const savedInfo = updatedWorkInfo[`${selectedWorkplace}-${currentWorker}`];
    if (savedInfo) {
      return savedInfo;
    }
    // 기본 데이터 사용
    return workerData?.workInfo || null;
  }, [editedWorkInfo, currentWorker, workerData, isEditingWork, updatedWorkInfo, selectedWorkplace]);


  // 수정 모드 시작
  const handleStartEdit = () => {
    if (workerData?.workInfo) {
      // breakTime이 숫자면 요일별 객체로 변환
      const breakTime = typeof workerData.workInfo.breakTime === 'number'
        ? daysOfWeek.reduce((acc, day) => {
            acc[day] = workerData.workInfo.breakTime;
            return acc;
          }, {})
        : workerData.workInfo.breakTime || daysOfWeek.reduce((acc, day) => {
            acc[day] = 0;
            return acc;
          }, {});
      
      setEditedWorkInfo({
        ...workerData.workInfo,
        breakTime,
        workerName: currentWorker,
      });
      setIsEditingWork(true);
    }
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setIsEditingWork(false);
    setEditedWorkInfo(null);
  };

  // 수정 저장
  const handleSaveEdit = () => {
    if (editedWorkInfo && currentWorker) {
      // 수정된 정보를 상태에 저장
      const key = `${selectedWorkplace}-${currentWorker}`;
      setUpdatedWorkInfo((prev) => ({
        ...prev,
        [key]: {
          ...editedWorkInfo,
          workerName: currentWorker,
        },
      }));
      
      // TODO: 백엔드 API 호출
      Swal.fire("저장 완료", "근무 정보가 수정되었습니다.", "success");
      setIsEditingWork(false);
      setEditedWorkInfo(null);
    }
  };

  const handleWorkplaceChange = (e) => {
    const newWorkplaceId = Number(e.target.value);
    setSelectedWorkplaceId(newWorkplaceId);
    setSelectedWorker(null);
    // 근무지 변경 시 수정 모드 해제
    setIsEditingWork(false);
    setEditedWorkInfo(null);
  };

  const handleWorkerClick = (workerName) => {
    // 직원이 변경되면 수정 모드 해제
    if (editedWorkInfo?.workerName !== workerName) {
      setIsEditingWork(false);
      setEditedWorkInfo(null);
    }
    setSelectedWorker(workerName);
  };

  const handleAddWorker = () => {
    alert("근무자 추가 기능 (구현 예정)");
  };

  const handleDismissWorker = async () => {
    if (!currentWorker) return;

    const result = await Swal.fire({
      icon: "warning",
      title: `${currentWorker}님을 퇴사 처리하시겠습니까?`,
      text: "퇴사 처리된 직원은 목록에서 제거됩니다.",
      showCancelButton: true,
      confirmButtonText: "퇴사 처리",
      cancelButtonText: "취소",
      confirmButtonColor: "var(--color-red)",
    });

    if (result.isConfirmed) {
      setWorkersList((prev) => {
        const updated = { ...prev };
        const workplaceWorkersList = [...(updated[selectedWorkplaceId] || [])];
        const filtered = workplaceWorkersList.filter(
          (worker) => worker !== currentWorker
        );
        updated[selectedWorkplaceId] = filtered;
        return updated;
      });

      // 퇴사 처리된 직원이 선택되어 있으면 선택 해제
      if (selectedWorker === currentWorker) {
        setSelectedWorker(null);
      }

      Swal.fire("퇴사 처리 완료", `${currentWorker}님이 퇴사 처리되었습니다.`, "success");
    }
  };

  // 주간 스케줄 그리드 데이터 생성 (수정된 정보 반영)
  const weeklyScheduleGrid = useMemo(() => {
    const workInfoToUse = currentWorkInfo || workerData?.workInfo;
    if (!workInfoToUse?.weeklySchedule) {
      return {};
    }

    const schedule = workInfoToUse.weeklySchedule;
    const grid = {};

    daysOfWeek.forEach((day) => {
      grid[day] = [];
      if (schedule[day]) {
        const { start, end } = schedule[day];
        const [startHour, startMin] = start.split(":").map(Number);
        const [endHour, endMin] = end.split(":").map(Number);
        const startDecimal = startHour + startMin / 60;
        const endDecimal = endHour + endMin / 60;

        // 각 블록에 고유한 그룹 ID 부여 (요일 + 인덱스)
        const groupId = `${day}-0`;

        grid[day].push({
          start: startDecimal,
          end: endDecimal,
          startTime: start,
          endTime: end,
          startHour,
          startMin,
          endHour,
          endMin,
          groupId,
        });
      }
    });

    return grid;
  }, [currentWorkInfo, workerData]);

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
                  className="dismiss-button"
                  onClick={handleDismissWorker}
                >
                  퇴사
                </button>
              </div>
              <div className="info-card-content">
                <div className="basic-info-header">
                  <div className="profile-icon">
                    <FaUser />
                  </div>
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
                  <div className="info-value">
                    {workerData.basicInfo.phone}
                  </div>
                </div>
                <div className="info-field">
                  <label className="info-label">이메일</label>
                  <div className="info-value">
                    {workerData.basicInfo.email}
                  </div>
                </div>
              </div>
            </div>

            {/* 근무 정보 카드 */}
            <div className="info-card">
              <div className="info-card-header">
                <h3 className="info-card-title">근무 정보</h3>
                {!isEditingWork ? (
                  <button
                    type="button"
                    className="edit-button"
                    onClick={handleStartEdit}
                  >
                    수정
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="edit-button"
                      onClick={handleSaveEdit}
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={handleCancelEdit}
                    >
                      취소
                    </button>
                  </div>
                )}
              </div>
              <div className="info-card-content">
                <div className="info-field">
                  <label className="info-label">근무지</label>
                  <div className="info-value">
                    {workerData.workInfo.workplace}
                  </div>
                </div>

                <div className="info-field">
                  <label className="info-label">근무 시간</label>
                  <div className="weekly-schedule-inputs">
                    {daysOfWeek.map((day) => {
                      const schedule = isEditingWork && currentWorkInfo
                        ? currentWorkInfo.weeklySchedule?.[day]
                        : (currentWorkInfo?.weeklySchedule?.[day] || workerData.workInfo.weeklySchedule[day]);
                      return (
                        <div key={day} className="day-schedule-row">
                          <span className="day-label-small">{day}요일</span>
                          {isEditingWork && currentWorkInfo ? (
                            <div className="time-inputs">
                              <select
                                className="time-select"
                                value={
                                  schedule
                                    ? parseInt(schedule.start.split(":")[0])
                                    : ""
                                }
                                onChange={(e) => {
                                  const hour = e.target.value;
                                  const minute = schedule
                                    ? schedule.start.split(":")[1]
                                    : "00";
                                  const newSchedule = schedule
                                    ? { ...schedule, start: `${hour}:${minute}` }
                                    : { start: `${hour}:${minute}`, end: "00:00" };
                                  setEditedWorkInfo({
                                    ...currentWorkInfo,
                                    weeklySchedule: {
                                      ...currentWorkInfo.weeklySchedule,
                                      [day]: newSchedule,
                                    },
                                  });
                                }}
                              >
                                <option value="">휴무</option>
                                {hours.map((h) => (
                                  <option key={h} value={h}>
                                    {String(h).padStart(2, "0")}
                                  </option>
                                ))}
                              </select>
                              {schedule && (
                                <>
                                  <span>:</span>
                                  <select
                                    className="time-select"
                                    value={
                                      schedule.start.split(":")[1] || "00"
                                    }
                                    onChange={(e) => {
                                      const [hour] = schedule.start.split(":");
                                      setEditedWorkInfo({
                                        ...currentWorkInfo,
                                        weeklySchedule: {
                                          ...currentWorkInfo.weeklySchedule,
                                          [day]: {
                                            ...schedule,
                                            start: `${hour}:${e.target.value}`,
                                          },
                                        },
                                      });
                                    }}
                                  >
                                    <option value="00">00</option>
                                    <option value="30">30</option>
                                  </select>
                                  <span> - </span>
                                  <select
                                    className="time-select"
                                    value={
                                      parseInt(schedule.end.split(":")[0]) || ""
                                    }
                                    onChange={(e) => {
                                      const hour = e.target.value;
                                      const minute = schedule.end.split(":")[1];
                                      setEditedWorkInfo({
                                        ...currentWorkInfo,
                                        weeklySchedule: {
                                          ...currentWorkInfo.weeklySchedule,
                                          [day]: {
                                            ...schedule,
                                            end: `${hour}:${minute}`,
                                          },
                                        },
                                      });
                                    }}
                                  >
                                    {hours.map((h) => (
                                      <option key={h} value={h}>
                                        {String(h).padStart(2, "0")}
                                      </option>
                                    ))}
                                  </select>
                                  <span>:</span>
                                  <select
                                    className="time-select"
                                    value={schedule.end.split(":")[1] || "00"}
                                    onChange={(e) => {
                                      const [hour] = schedule.end.split(":");
                                      setEditedWorkInfo({
                                        ...currentWorkInfo,
                                        weeklySchedule: {
                                          ...currentWorkInfo.weeklySchedule,
                                          [day]: {
                                            ...schedule,
                                            end: `${hour}:${e.target.value}`,
                                          },
                                        },
                                      });
                                    }}
                                  >
                                    <option value="00">00</option>
                                    <option value="30">30</option>
                                  </select>
                                </>
                              )}
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
                  {isEditingWork && currentWorkInfo ? (
                    <div className="break-time-by-day">
                      {daysOfWeek.map((day) => {
                        const breakTime = typeof currentWorkInfo.breakTime === 'object'
                          ? currentWorkInfo.breakTime[day] || 0
                          : currentWorkInfo.breakTime || 0;
                        const hasSchedule = currentWorkInfo.weeklySchedule?.[day];
                        
                        return (
                          <div key={day} className="break-time-day-row">
                            <span className="day-label">{day}요일</span>
                            {hasSchedule ? (
                              <div className="break-time-input-group">
                                <input
                                  type="number"
                                  className="break-time-input-field"
                                  value={breakTime}
                                  min="0"
                                  onChange={(e) => {
                                    const newBreakTime = typeof currentWorkInfo.breakTime === 'object'
                                      ? { ...currentWorkInfo.breakTime }
                                      : daysOfWeek.reduce((acc, d) => {
                                          acc[d] = currentWorkInfo.breakTime || 0;
                                          return acc;
                                        }, {});
                                    newBreakTime[day] = parseInt(e.target.value) || 0;
                                    setEditedWorkInfo({
                                      ...currentWorkInfo,
                                      breakTime: newBreakTime,
                                    });
                                  }}
                                />
                                <span className="break-time-unit">분</span>
                              </div>
                            ) : (
                              <span className="break-time-off">-</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="break-time-display">
                      {(() => {
                        const breakTime = currentWorkInfo?.breakTime || workerData.workInfo.breakTime;
                        if (typeof breakTime === 'object') {
                          // 요일별로 다른 경우
                          const uniqueValues = [...new Set(Object.values(breakTime))];
                          if (uniqueValues.length === 1 && uniqueValues[0] > 0) {
                            return <div className="info-value">{uniqueValues[0]} 분 (요일별 동일)</div>;
                          }
                          return (
                            <div className="break-time-by-day-display">
                              {daysOfWeek.map((day) => {
                                const value = breakTime[day] || 0;
                                const hasSchedule = currentWorkInfo?.weeklySchedule?.[day] || workerData.workInfo.weeklySchedule[day];
                                if (!hasSchedule) return null;
                                return (
                                  <div key={day} className="break-time-day-display-item">
                                    <span className="day-label-small">{day}요일</span>
                                    <span className="break-time-value">{value} 분</span>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                        return <div className="info-value">{breakTime} 분</div>;
                      })()}
                    </div>
                  )}
                </div>

                <div className="info-field">
                  <label className="info-label">시급</label>
                  {isEditingWork && currentWorkInfo ? (
                    <input
                      type="number"
                      className="info-input"
                      value={currentWorkInfo.hourlyWage || 0}
                      onChange={(e) =>
                        setEditedWorkInfo({
                          ...currentWorkInfo,
                          hourlyWage: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  ) : (
                    <div className="info-value">
                      {formatCurrency(currentWorkInfo?.hourlyWage || workerData.workInfo.hourlyWage)}
                    </div>
                  )}
                </div>

                <div className="info-field">
                  <label className="info-label">급여 지급일</label>
                  {isEditingWork && currentWorkInfo ? (
                    <input
                      type="number"
                      className="info-input"
                      value={currentWorkInfo.payday || 1}
                      min="1"
                      max="31"
                      onChange={(e) =>
                        setEditedWorkInfo({
                          ...currentWorkInfo,
                          payday: parseInt(e.target.value) || 1,
                        })
                      }
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
                        checked={
                          isEditingWork && currentWorkInfo
                            ? currentWorkInfo.socialInsurance
                            : workerData.workInfo.socialInsurance
                        }
                        disabled={!isEditingWork}
                        onChange={(e) =>
                          setEditedWorkInfo({
                            ...currentWorkInfo,
                            socialInsurance: e.target.checked,
                          })
                        }
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="toggle-item">
                    <label className="toggle-label">소득세</label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={
                          isEditingWork && currentWorkInfo
                            ? currentWorkInfo.withholdingTax
                            : workerData.workInfo.withholdingTax
                        }
                        disabled={!isEditingWork}
                        onChange={(e) =>
                          setEditedWorkInfo({
                            ...currentWorkInfo,
                            withholdingTax: e.target.checked,
                          })
                        }
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
              // 해당 요일의 블록 정보 (툴팁 표시용)
              const dayBlock = blocks.length > 0 ? blocks[0] : null;
              const dayBlockGroupId = dayBlock?.groupId;
              const isDayHovered = dayBlockGroupId && hoveredBlockGroup === dayBlockGroupId;
              
              // 시작 시간대 찾기 (툴팁 위치 계산용)
              const startHour = dayBlock ? dayBlock.startHour : null;
              const startMin = dayBlock ? dayBlock.startMin : 0;
              const startBlockTop = startHour !== null ? (startHour * 40 + startHour * 1 + (startMin / 60) * 40) : 0;
              
              return (
                <div key={day} className="schedule-day-column">
                  {/* 툴팁을 컬럼 레벨로 이동 */}
                  {isDayHovered && dayBlock && startHour !== null && (
                    <div
                      className="schedule-block-tooltip"
                      style={{
                        top: `${startBlockTop}px`,
                      }}
                    >
                      <div className="tooltip-content">
                        <div className="tooltip-label">근무 시간</div>
                        <div className="tooltip-time">
                          {dayBlock.startTime} - {dayBlock.endTime}
                        </div>
                        <div className="tooltip-label">휴게 시간</div>
                        <div className="tooltip-break">
                          {currentWorkInfo?.breakTime || workerData?.workInfo?.breakTime || 0} 분
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {hours.map((hour) => {
                    // 해당 시간대에 포함되는 블록 찾기
                    const block = blocks.find((block) => {
                      const blockStartHour = Math.floor(block.start);
                      const blockEndHour = Math.ceil(block.end);
                      return hour >= blockStartHour && hour < blockEndHour;
                    });

                    // 블록이 시작하는 시간인지 확인
                    const isBlockStart = block && block.startHour === hour;
                    // 블록이 끝나는 시간인지 확인
                    const isBlockEnd = block && block.endHour === hour;

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

                    const isHovered = block && hoveredBlockGroup === block.groupId;

                    return (
                      <div
                        key={hour}
                        className="schedule-cell"
                        title={
                          block
                            ? `근무 시간: ${block.startTime} - ${block.endTime}`
                            : ""
                        }
                      >
                        {block && (
                          <div
                            className={`schedule-block ${
                              isHovered ? "hovered" : ""
                            }`}
                            style={{
                              top: `${blockTop}%`,
                              height: `${blockHeight}%`,
                            }}
                            onMouseEnter={() =>
                              setHoveredBlockGroup(block.groupId)
                            }
                            onMouseLeave={() => setHoveredBlockGroup(null)}
                          />
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
