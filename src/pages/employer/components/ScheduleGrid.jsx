import PropTypes from "prop-types";

const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
const hours = Array.from({ length: 24 }, (_, i) => i);

export default function ScheduleGrid({
  weeklyScheduleGrid,
  hoveredBlockGroup,
  onHoverBlock,
  currentWorkInfo,
  workerData,
}) {
  return (
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

            // hover된 블록 찾기
            const hoveredBlock = blocks.find(
              (block) => hoveredBlockGroup === block.groupId
            );

            // 툴팁 표시 여부 결정
            let shouldShowTooltip = false;
            let tooltipBlock = null;

            if (hoveredBlock) {
              if (hoveredBlock.isSecondPart && hoveredBlock.originalDay) {
                if (day === hoveredBlock.originalDay) {
                  const originalDayBlocks =
                    weeklyScheduleGrid[hoveredBlock.originalDay] || [];
                  tooltipBlock = originalDayBlocks.find((b) => b.isFirstPart);
                  shouldShowTooltip = tooltipBlock !== undefined;
                }
              } else {
                tooltipBlock = hoveredBlock;
                shouldShowTooltip = true;
              }
            }

            // 시작 시간대 찾기 (툴팁 위치 계산용)
            const startHour = tooltipBlock ? tooltipBlock.startHour : null;
            const startMin = tooltipBlock ? tooltipBlock.startMin : 0;
            const startBlockTop =
              startHour !== null
                ? startHour * 40 + startHour * 1 + (startMin / 60) * 40
                : 0;

            // 익일 근무인 경우 전체 시간 표시
            let displayStartTime = tooltipBlock?.startTime || "";
            let displayEndTime = tooltipBlock?.endTime || "";
            if (tooltipBlock?.crossesMidnight && tooltipBlock?.isFirstPart) {
              const nextDayIndex = (daysOfWeek.indexOf(day) + 1) % 7;
              const nextDay = daysOfWeek[nextDayIndex];
              const nextDayBlocks = weeklyScheduleGrid[nextDay] || [];
              const secondPart = nextDayBlocks.find(
                (b) => b.groupId === tooltipBlock.groupId && b.isSecondPart
              );
              if (secondPart) {
                displayEndTime = secondPart.endTime;
              }
            } else if (
              tooltipBlock?.isSecondPart &&
              tooltipBlock?.originalDay
            ) {
              const originalDayBlocks =
                weeklyScheduleGrid[tooltipBlock.originalDay] || [];
              const firstPart = originalDayBlocks.find((b) => b.isFirstPart);
              if (firstPart) {
                displayStartTime = firstPart.startTime;
              }
            }

            return (
              <div key={day} className="schedule-day-column">
                {shouldShowTooltip && tooltipBlock && startHour !== null && (
                  <div
                    className="schedule-block-tooltip"
                    style={{
                      top: `${startBlockTop}px`,
                    }}
                  >
                    <div className="tooltip-content">
                      <div className="tooltip-label">근무 시간</div>
                      <div className="tooltip-time">
                        {displayStartTime} - {displayEndTime}
                        {tooltipBlock?.crossesMidnight && " (익일)"}
                      </div>
                      <div className="tooltip-label">휴게 시간</div>
                      <div className="tooltip-break">
                        {(() => {
                          const breakTime =
                            currentWorkInfo?.breakTime ||
                            workerData?.workInfo?.breakTime ||
                            0;
                          if (typeof breakTime === "object") {
                            const dayToUse = tooltipBlock?.originalDay || day;
                            return breakTime[dayToUse] || 0;
                          }
                          return breakTime;
                        })()}{" "}
                        분
                      </div>
                    </div>
                  </div>
                )}

                {hours.map((hour) => {
                  const hourBlocks = blocks.filter((block) => {
                    const blockStartHour = Math.floor(block.start);
                    const blockEndHour = Math.ceil(block.end);
                    return hour >= blockStartHour && hour < blockEndHour;
                  });

                  return (
                    <div key={hour} className="schedule-cell">
                      {hourBlocks.map((block, blockIndex) => {
                        const isBlockStart = block.startHour === hour;
                        const isBlockEnd = block.endHour === hour;

                        let blockTop = 0;
                        let blockHeight = 100;

                        if (isBlockStart) {
                          blockTop = (block.startMin / 60) * 100;
                        }
                        if (isBlockEnd) {
                          blockHeight = (block.endMin / 60) * 100;
                        } else if (isBlockStart) {
                          blockHeight = 100 - blockTop;
                        }

                        const isHovered = hoveredBlockGroup === block.groupId;

                        return (
                          <div
                            key={`${block.groupId}-${blockIndex}`}
                            className={`schedule-block ${
                              isHovered ? "hovered" : ""
                            }`}
                            style={{
                              top: `${blockTop}%`,
                              height: `${blockHeight}%`,
                            }}
                            onMouseEnter={() => onHoverBlock(block.groupId)}
                            onMouseLeave={() => onHoverBlock(null)}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

ScheduleGrid.propTypes = {
  weeklyScheduleGrid: PropTypes.object.isRequired,
  hoveredBlockGroup: PropTypes.string,
  onHoverBlock: PropTypes.func.isRequired,
  currentWorkInfo: PropTypes.object,
  workerData: PropTypes.shape({
    workInfo: PropTypes.shape({
      breakTime: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    }),
  }),
};
