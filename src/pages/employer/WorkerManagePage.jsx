import { useState, useMemo } from "react";
import { FaUser, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import "../../styles/workerManagePage.css";
import {
  initialWorkplaces,
  workplaceWorkers,
  workerInfo,
  workerCodeMap,
} from "./dummyData";
import TimeInput from "./components/TimeInput";
import BasicInfoCard from "./components/BasicInfoCard";
import WorkInfoCard from "./components/WorkInfoCard";
import ScheduleGrid from "./components/ScheduleGrid";

const daysOfWeek = ["일", "월", "화", "수", "목", "금", "토"];
const hours = Array.from({ length: 24 }, (_, i) => i);

export default function WorkerManagePage() {
  const [workplaces, setWorkplaces] = useState(() => initialWorkplaces);
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState(1);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [hoveredBlockGroup, setHoveredBlockGroup] = useState(null);
  const [workersList, setWorkersList] = useState(() => workplaceWorkers);
  const [isEditingWork, setIsEditingWork] = useState(false);
  const [editedWorkInfo, setEditedWorkInfo] = useState(null);
  // 수정된 근무 정보를 저장하는 상태
  const [updatedWorkInfo, setUpdatedWorkInfo] = useState({});
  // 추가된 근무자 정보를 저장하는 상태
  const [addedWorkerInfo, setAddedWorkerInfo] = useState({});
  // 근무자 추가 모드 상태
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [workerCode, setWorkerCode] = useState("");
  const [searchedWorker, setSearchedWorker] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [confirmedWorker, setConfirmedWorker] = useState(null);
  const [newWorkerWorkInfo, setNewWorkerWorkInfo] = useState(null);
  // 근무지 추가 모드 상태
  const [isAddingWorkplace, setIsAddingWorkplace] = useState(false);
  const [newWorkplaceName, setNewWorkplaceName] = useState("");
  const [newWorkplaceAddress, setNewWorkplaceAddress] = useState("");
  const [newWorkplaceBusinessNumber, setNewWorkplaceBusinessNumber] =
    useState("");
  const [newWorkplaceIsSmallBusiness, setNewWorkplaceIsSmallBusiness] =
    useState(false);
  // 근무지 관리 모드 상태
  const [isManagingWorkplaces, setIsManagingWorkplaces] = useState(false);
  const [selectedWorkplaceForEdit, setSelectedWorkplaceForEdit] = useState(null);
  const [editingWorkplace, setEditingWorkplace] = useState(null);

  const resetAddWorkerFlow = () => {
    setWorkerCode("");
    setSearchedWorker(null);
    setConfirmedWorker(null);
    setNewWorkerWorkInfo(null);
  };

  const selectedWorkplace =
    workplaces.find((wp) => wp.id === selectedWorkplaceId)?.name || "";

  const workers = useMemo(() => {
    return workersList[selectedWorkplaceId] || [];
  }, [selectedWorkplaceId, workersList]);

  // 선택된 직원이 없으면 첫 번째 직원을 기본 선택
  const currentWorker = useMemo(() => {
    // 근무자 추가 모드일 때는 null 반환
    if (isAddingWorker) {
      return null;
    }
    if (selectedWorker && workers.includes(selectedWorker)) {
      return selectedWorker;
    }
    return workers.length > 0 ? workers[0] : null;
  }, [selectedWorker, workers, isAddingWorker]);

  const workerData = useMemo(() => {
    if (!currentWorker) {
      return null;
    }
    // 추가된 근무자 정보 우선 확인
    const addedInfo = addedWorkerInfo[`${selectedWorkplace}-${currentWorker}`];
    if (addedInfo) {
      return addedInfo;
    }
    // 기본 workerInfo 확인
    if (!workerInfo[selectedWorkplace]) {
      return null;
    }
    return workerInfo[selectedWorkplace][currentWorker] || null;
  }, [currentWorker, selectedWorkplace, addedWorkerInfo]);

  // 수정 중인 근무 정보 관리 (저장된 정보 우선, 수정 중이면 수정 중 정보)
  const currentWorkInfo = useMemo(() => {
    // 수정 모드일 때는 수정 중인 정보 사용
    if (
      isEditingWork &&
      editedWorkInfo &&
      editedWorkInfo.workerName === currentWorker
    ) {
      return editedWorkInfo;
    }
    // 저장된 수정 정보가 있으면 그것을 사용
    const savedInfo = updatedWorkInfo[`${selectedWorkplace}-${currentWorker}`];
    if (savedInfo) {
      return savedInfo;
    }
    // 기본 데이터 사용
    return workerData?.workInfo || null;
  }, [
    editedWorkInfo,
    currentWorker,
    workerData,
    isEditingWork,
    updatedWorkInfo,
    selectedWorkplace,
  ]);

  // 수정 모드 시작
  const handleStartEdit = () => {
    const workInfoToUse = currentWorkInfo || workerData?.workInfo;
    if (workInfoToUse) {
      // breakTime이 숫자면 요일별 객체로 변환
      const breakTime =
        typeof workInfoToUse.breakTime === "number"
          ? daysOfWeek.reduce((acc, day) => {
              acc[day] = workInfoToUse.breakTime;
              return acc;
            }, {})
          : workInfoToUse.breakTime ||
            daysOfWeek.reduce((acc, day) => {
              acc[day] = 0;
              return acc;
            }, {});

      setEditedWorkInfo({
        ...workInfoToUse,
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
      // 급여 지급일 검증
      if (editedWorkInfo.payday && editedWorkInfo.payday > 31) {
        Swal.fire(
          "입력 오류",
          "급여 지급일은 31일을 초과할 수 없습니다.",
          "error"
        );
        return;
      }

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
    const value = e.target.value;
    // 일반 근무지 선택 시 모든 모드 해제
    setIsAddingWorkplace(false);
    setIsManagingWorkplaces(false);
    setSelectedWorkplaceForEdit(null);
    setEditingWorkplace(null);
    const newWorkplaceId = Number(value);
    setSelectedWorkplaceId(newWorkplaceId);
    setSelectedWorker(null);
    // 근무지 변경 시 수정 모드 해제
    setIsEditingWork(false);
    setEditedWorkInfo(null);
    if (isAddingWorker) {
      resetAddWorkerFlow();
      setIsAddingWorker(false);
    }
  };

  const handleManageWorkplaces = () => {
    setIsManagingWorkplaces(true);
    setIsAddingWorkplace(false);
    setSelectedWorkplaceForEdit(null);
    setEditingWorkplace(null);
  };

  const handleCancelManageWorkplaces = () => {
    setIsManagingWorkplaces(false);
    setSelectedWorkplaceForEdit(null);
    setEditingWorkplace(null);
  };

  const handleAddWorkplaceFromManage = () => {
    setIsAddingWorkplace(true);
    setNewWorkplaceName("");
    setNewWorkplaceAddress("");
    setNewWorkplaceBusinessNumber("");
    setNewWorkplaceIsSmallBusiness(false);
  };

  const handleAddWorkplace = () => {
    if (!newWorkplaceName.trim()) {
      Swal.fire("입력 오류", "근무지 이름을 입력해주세요.", "error");
      return;
    }

    if (!newWorkplaceAddress.trim()) {
      Swal.fire("입력 오류", "주소를 입력해주세요.", "error");
      return;
    }

    if (!newWorkplaceBusinessNumber.trim()) {
      Swal.fire("입력 오류", "사업자 등록 번호를 입력해주세요.", "error");
      return;
    }

    // 사업자 등록 번호 형식 검증 (예: 123-45-67890)
    const businessNumberPattern = /^\d{3}-\d{2}-\d{5}$/;
    if (!businessNumberPattern.test(newWorkplaceBusinessNumber.trim())) {
      Swal.fire(
        "입력 오류",
        "사업자 등록 번호 형식이 올바르지 않습니다. (예: 123-45-67890)",
        "error"
      );
      return;
    }

    // 중복 확인
    if (workplaces.some((wp) => wp.name === newWorkplaceName.trim())) {
      Swal.fire("입력 오류", "이미 존재하는 근무지입니다.", "error");
      return;
    }

    // 새 근무지 추가
    const newId = Math.max(...workplaces.map((wp) => wp.id), 0) + 1;
    const newWorkplace = {
      id: newId,
      name: newWorkplaceName.trim(),
      address: newWorkplaceAddress.trim(),
      businessNumber: newWorkplaceBusinessNumber.trim(),
      isSmallBusiness: newWorkplaceIsSmallBusiness,
    };
    setWorkplaces((prev) => [...prev, newWorkplace]);

    // 새 근무지의 직원 목록 초기화
    setWorkersList((prev) => ({
      ...prev,
      [newId]: [],
    }));

    // 새 근무지 선택
    setSelectedWorkplaceId(newId);
    setSelectedWorker(null);
    setIsAddingWorkplace(false);
    setNewWorkplaceName("");
    setNewWorkplaceAddress("");
    setNewWorkplaceBusinessNumber("");
    setNewWorkplaceIsSmallBusiness(false);

    Swal.fire(
      "추가 완료",
      `${newWorkplaceName.trim()}이(가) 추가되었습니다.`,
      "success"
    );
  };

  const handleCancelAddWorkplace = () => {
    setIsAddingWorkplace(false);
    setNewWorkplaceName("");
    setNewWorkplaceAddress("");
    setNewWorkplaceBusinessNumber("");
    setNewWorkplaceIsSmallBusiness(false);
  };

  const handleDeleteWorkplace = () => {
    if (!selectedWorkplaceId) return;

    const workplaceToDelete = workplaces.find((wp) => wp.id === selectedWorkplaceId);
    if (!workplaceToDelete) return;

    Swal.fire({
      title: "근무지 삭제",
      text: `${workplaceToDelete.name}을(를) 삭제하시겠습니까?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "삭제",
      cancelButtonText: "취소",
    }).then((result) => {
      if (result.isConfirmed) {
        // 근무지 삭제
        const updatedWorkplaces = workplaces.filter(
          (wp) => wp.id !== selectedWorkplaceId
        );

        // 삭제할 근무지가 없으면 종료
        if (updatedWorkplaces.length === 0) {
          Swal.fire("오류", "최소 하나의 근무지는 필요합니다.", "error");
          return;
        }

        setWorkplaces(updatedWorkplaces);

        // workersList에서 해당 근무지 제거
        setWorkersList((prev) => {
          const updated = { ...prev };
          delete updated[selectedWorkplaceId];
          return updated;
        });

        // addedWorkerInfo에서 해당 근무지 관련 정보 제거
        setAddedWorkerInfo((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            if (key.startsWith(`${workplaceToDelete.name}-`)) {
              delete updated[key];
            }
          });
          return updated;
        });

        // updatedWorkInfo에서 해당 근무지 관련 정보 제거
        setUpdatedWorkInfo((prev) => {
          const updated = { ...prev };
          Object.keys(updated).forEach((key) => {
            if (key.startsWith(`${workplaceToDelete.name}-`)) {
              delete updated[key];
            }
          });
          return updated;
        });

        // 삭제된 근무지가 선택되어 있으면 첫 번째 근무지 선택
        const newSelectedWorkplaceId = updatedWorkplaces[0].id;
        setSelectedWorkplaceId(newSelectedWorkplaceId);
        setSelectedWorker(null);
        setIsAddingWorkplace(false);
        setIsEditingWork(false);
        setEditedWorkInfo(null);

        Swal.fire("삭제 완료", `${workplaceToDelete.name}이(가) 삭제되었습니다.`, "success");
      }
    });
  };

  const handleEditWorkplace = (workplace) => {
    setEditingWorkplace({
      id: workplace.id,
      name: workplace.name || "",
      address: workplace.address || "",
      businessNumber: workplace.businessNumber || "",
      isSmallBusiness: workplace.isSmallBusiness || false,
    });
    setSelectedWorkplaceForEdit(workplace.id);
  };

  const handleSaveWorkplaceEdit = () => {
    if (!editingWorkplace) return;

    if (!editingWorkplace.name.trim()) {
      Swal.fire("입력 오류", "근무지 이름을 입력해주세요.", "error");
      return;
    }

    if (!editingWorkplace.address.trim()) {
      Swal.fire("입력 오류", "주소를 입력해주세요.", "error");
      return;
    }

    if (!editingWorkplace.businessNumber.trim()) {
      Swal.fire("입력 오류", "사업자 등록 번호를 입력해주세요.", "error");
      return;
    }

    // 사업자 등록 번호 형식 검증
    const businessNumberPattern = /^\d{3}-\d{2}-\d{5}$/;
    if (!businessNumberPattern.test(editingWorkplace.businessNumber.trim())) {
      Swal.fire("입력 오류", "사업자 등록 번호 형식이 올바르지 않습니다. (예: 123-45-67890)", "error");
      return;
    }

    // 중복 확인 (자기 자신 제외)
    const isDuplicate = workplaces.some(
      (wp) =>
        wp.name === editingWorkplace.name.trim() && wp.id !== editingWorkplace.id
    );
    if (isDuplicate) {
      Swal.fire("입력 오류", "이미 존재하는 근무지입니다.", "error");
      return;
    }

    // 근무지 정보 업데이트
    setWorkplaces((prev) =>
      prev.map((wp) =>
        wp.id === editingWorkplace.id
          ? {
              ...wp,
              name: editingWorkplace.name.trim(),
              address: editingWorkplace.address.trim(),
              businessNumber: editingWorkplace.businessNumber.trim(),
              isSmallBusiness: editingWorkplace.isSmallBusiness,
            }
          : wp
      )
    );

    // 이름이 변경된 경우 workersList, addedWorkerInfo, updatedWorkInfo의 키도 업데이트
    const oldWorkplace = workplaces.find((wp) => wp.id === editingWorkplace.id);
    if (oldWorkplace && oldWorkplace.name !== editingWorkplace.name.trim()) {
      // workersList는 ID 기반이므로 변경 불필요
      // addedWorkerInfo와 updatedWorkInfo는 이름 기반 키를 사용하므로 업데이트 필요
      setAddedWorkerInfo((prev) => {
        const updated = {};
        Object.keys(prev).forEach((key) => {
          if (key.startsWith(`${oldWorkplace.name}-`)) {
            const newKey = key.replace(
              `${oldWorkplace.name}-`,
              `${editingWorkplace.name.trim()}-`
            );
            updated[newKey] = prev[key];
          } else {
            updated[key] = prev[key];
          }
        });
        return updated;
      });

      setUpdatedWorkInfo((prev) => {
        const updated = {};
        Object.keys(prev).forEach((key) => {
          if (key.startsWith(`${oldWorkplace.name}-`)) {
            const newKey = key.replace(
              `${oldWorkplace.name}-`,
              `${editingWorkplace.name.trim()}-`
            );
            updated[newKey] = prev[key];
          } else {
            updated[key] = prev[key];
          }
        });
        return updated;
      });
    }

    setEditingWorkplace(null);
    setSelectedWorkplaceForEdit(null);

    Swal.fire("수정 완료", "근무지 정보가 수정되었습니다.", "success");
  };

  const handleCancelWorkplaceEdit = () => {
    setEditingWorkplace(null);
    setSelectedWorkplaceForEdit(null);
  };

  const handleWorkerClick = (workerName) => {
    // 직원이 변경되면 수정 모드 해제
    if (editedWorkInfo?.workerName !== workerName) {
      setIsEditingWork(false);
      setEditedWorkInfo(null);
    }
    if (isAddingWorker) {
      resetAddWorkerFlow();
      setIsAddingWorker(false);
    }
    setSelectedWorker(workerName);
  };

  const handleCancelAddWorker = () => {
    resetAddWorkerFlow();
    setIsAddingWorker(false);
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

      Swal.fire(
        "퇴사 처리 완료",
        `${currentWorker}님이 퇴사 처리되었습니다.`,
        "success"
      );
    }
  };

  // 근무자 코드로 검색 (더미 데이터)
  const searchWorkerByCode = async (code) => {
    // TODO: 실제 API 호출로 변경
    setIsSearching(true);

    // 시뮬레이션: API 호출 지연
    await new Promise((resolve) => setTimeout(resolve, 500));

    const worker = workerCodeMap[code];
    setIsSearching(false);

    if (worker) {
      setSearchedWorker(worker);
    } else {
      Swal.fire("검색 실패", "해당 근무자 코드를 찾을 수 없습니다.", "error");
      setSearchedWorker(null);
    }
  };

  const handleAddWorker = () => {
    resetAddWorkerFlow();
    setIsAddingWorker(true);
    setSelectedWorker(null);
  };

  const handleSearchWorker = () => {
    if (!workerCode.trim()) {
      Swal.fire("입력 오류", "근무자 코드를 입력해주세요.", "warning");
      return;
    }
    searchWorkerByCode(workerCode.trim());
  };

  const handleConfirmWorker = () => {
    if (!searchedWorker) return;

    // 근무자 정보 확인 완료 (검색된 정보 그대로 사용)
    setConfirmedWorker({
      ...searchedWorker,
      name: searchedWorker.name,
      birthDate: searchedWorker.birthDate,
    });

    // 기본 근무 정보 초기화
    setNewWorkerWorkInfo({
      workplace: selectedWorkplace,
      weeklySchedule: {},
      breakTime: {},
      hourlyWage: 10030,
      payday: 1,
      socialInsurance: false,
      withholdingTax: false,
    });
  };

  const handleSaveNewWorker = () => {
    if (!confirmedWorker || !newWorkerWorkInfo) return;

    // 급여 지급일 검증
    if (newWorkerWorkInfo.payday && newWorkerWorkInfo.payday > 31) {
      Swal.fire(
        "입력 오류",
        "급여 지급일은 31일을 초과할 수 없습니다.",
        "error"
      );
      return;
    }

    // 근무자 목록에 추가
    setWorkersList((prev) => {
      const updated = { ...prev };
      const workplaceWorkersList = [...(updated[selectedWorkplaceId] || [])];
      if (!workplaceWorkersList.includes(confirmedWorker.name)) {
        workplaceWorkersList.push(confirmedWorker.name);
        updated[selectedWorkplaceId] = workplaceWorkersList;
      }
      return updated;
    });

    // 추가된 근무자 정보 저장
    const workerInfoKey = `${selectedWorkplace}-${confirmedWorker.name}`;
    setAddedWorkerInfo((prev) => ({
      ...prev,
      [workerInfoKey]: {
        basicInfo: {
          name: confirmedWorker.name,
          birthDate: confirmedWorker.birthDate,
          phone: confirmedWorker.phone || "",
          email: confirmedWorker.email || "",
        },
        workInfo: {
          ...newWorkerWorkInfo,
          // null 값을 적절히 처리
          hourlyWage: newWorkerWorkInfo.hourlyWage ?? 0,
          payday: newWorkerWorkInfo.payday ?? 1,
        },
      },
    }));

    // TODO: 백엔드 API 호출로 workerInfo에 추가
    // 현재는 더미 데이터이므로 실제 저장은 백엔드 연동 시 구현

    Swal.fire(
      "추가 완료",
      `${confirmedWorker.name}님이 추가되었습니다.`,
      "success"
    );

    const newWorkerName = confirmedWorker.name;
    resetAddWorkerFlow();
    setIsAddingWorker(false);

    // 추가된 근무자 선택
    setSelectedWorker(newWorkerName);
  };

  // 주간 스케줄 그리드 데이터 생성 (수정된 정보 반영)
  const weeklyScheduleGrid = useMemo(() => {
    // 근무자 추가 모드일 때는 newWorkerWorkInfo 사용
    let workInfoToUse;
    if (isAddingWorker && newWorkerWorkInfo) {
      workInfoToUse = newWorkerWorkInfo;
    } else {
      workInfoToUse = currentWorkInfo || workerData?.workInfo;
    }

    if (!workInfoToUse?.weeklySchedule) {
      return {};
    }

    const schedule = workInfoToUse.weeklySchedule;
    const grid = {};

    // 먼저 모든 요일을 초기화
    daysOfWeek.forEach((day) => {
      grid[day] = [];
    });

    // 각 요일의 스케줄 처리
    daysOfWeek.forEach((day, dayIndex) => {
      if (schedule[day] && schedule[day].start && schedule[day].end) {
        const { start, end } = schedule[day];
        const [startHour, startMin] = start.split(":").map(Number);
        const [endHour, endMin] = end.split(":").map(Number);
        const startDecimal = startHour + startMin / 60;
        let endDecimal = endHour + endMin / 60;

        // 익일 근무인지 확인 (end가 start보다 작거나 같으면 익일)
        const crossesMidnight = endDecimal <= startDecimal;

        if (crossesMidnight) {
          // 익일 근무인 경우
          // 1. 당일 블록: start부터 24:00까지
          const groupId = `${day}-0`;
          grid[day].push({
            start: startDecimal,
            end: 24,
            startTime: start,
            endTime: "24:00",
            startHour,
            startMin,
            endHour: 24,
            endMin: 0,
            groupId,
            crossesMidnight: true,
            isFirstPart: true,
          });

          // 2. 다음 날 블록: 00:00부터 end까지
          const nextDayIndex = (dayIndex + 1) % 7;
          const nextDay = daysOfWeek[nextDayIndex];
          const nextDayGroupId = `${day}-0`; // 같은 그룹 ID 사용 (연속된 블록)
          grid[nextDay].push({
            start: 0,
            end: endDecimal,
            startTime: "00:00",
            endTime: end,
            startHour: 0,
            startMin: 0,
            endHour,
            endMin,
            groupId: nextDayGroupId,
            crossesMidnight: true,
            isSecondPart: true,
            originalDay: day, // 원래 시작한 요일 저장
          });
        } else {
          // 일반 근무인 경우
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
            crossesMidnight: false,
          });
        }
      }
    });

    return grid;
  }, [workerData, currentWorkInfo, isAddingWorker, newWorkerWorkInfo]);

  return (
    <div className="worker-manage-page">
      {/* 왼쪽 사이드바 */}
      {!isManagingWorkplaces && !isAddingWorkplace && (
        <div className="worker-manage-left-panel">
        <div className="worker-manage-workplace-select">
          <div className="workplace-select-wrapper">
            <select
              value={selectedWorkplaceId}
              onChange={handleWorkplaceChange}
              className="workplace-select"
            >
              {workplaces.map((wp) => (
                <option key={wp.id} value={wp.id}>
                  {wp.name}
                </option>
              ))}
            </select>
            {!isAddingWorkplace && !isManagingWorkplaces && selectedWorkplaceId && workplaces.length > 1 && (
              <button
                type="button"
                className="delete-workplace-button"
                onClick={handleDeleteWorkplace}
                title="근무지 삭제"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {!isAddingWorkplace && !isManagingWorkplaces && (
          <>
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
          </>
        )}

        {!isAddingWorkplace && !isManagingWorkplaces && (
          <button
            type="button"
            className="manage-workplace-button"
            onClick={handleManageWorkplaces}
          >
            근무지 관리
          </button>
        )}
        </div>
      )}

      {/* 중앙 콘텐츠 영역 */}
      <div
        className={`worker-manage-center-panel ${
          isAddingWorkplace || isManagingWorkplaces ? "adding-workplace" : ""
        }`}
      >
        {isManagingWorkplaces ? (
          <div className="workplace-manage-container">
            {!isAddingWorkplace && !editingWorkplace && (
              <div className="info-card">
                <div className="info-card-header">
                  <h3 className="info-card-title">근무지 목록</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="add-button-large"
                      onClick={handleAddWorkplaceFromManage}
                    >
                      근무지 추가
                    </button>
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={handleCancelManageWorkplaces}
                    >
                      닫기
                    </button>
                  </div>
                </div>
              <div className="info-card-content">
                <div className="workplace-list">
                  {workplaces.map((workplace) => (
                    <div
                      key={workplace.id}
                      className={`workplace-list-item ${
                        selectedWorkplaceForEdit === workplace.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => handleEditWorkplace(workplace)}
                    >
                      <div className="workplace-list-name">
                        {workplace.name}
                      </div>
                      {selectedWorkplaceForEdit === workplace.id && (
                        <div className="workplace-list-details">
                          <div className="info-field">
                            <label className="info-label">주소</label>
                            <div className="info-value">
                              {workplace.address || "-"}
                            </div>
                          </div>
                          <div className="info-field">
                            <label className="info-label">사업자 등록 번호</label>
                            <div className="info-value">
                              {workplace.businessNumber || "-"}
                            </div>
                          </div>
                          <div className="info-field">
                            <label className="info-label">5인 미만 사업장</label>
                            <div className="info-value">
                              {workplace.isSmallBusiness ? "예" : "아니오"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}

            {isAddingWorkplace && (
              <div className="info-card">
                <div className="info-card-header">
                  <h3 className="info-card-title">근무지 추가</h3>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setIsAddingWorkplace(false);
                      setNewWorkplaceName("");
                      setNewWorkplaceAddress("");
                      setNewWorkplaceBusinessNumber("");
                      setNewWorkplaceIsSmallBusiness(false);
                    }}
                  >
                    취소
                  </button>
                </div>
                <div className="info-card-content">
                  <div className="info-field">
                    <label className="info-label">근무지 이름</label>
                    <input
                      type="text"
                      className="info-input"
                      placeholder="근무지 이름을 입력하세요"
                      value={newWorkplaceName}
                      onChange={(e) => setNewWorkplaceName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="info-field">
                    <label className="info-label">주소</label>
                    <input
                      type="text"
                      className="info-input"
                      placeholder="주소를 입력하세요"
                      value={newWorkplaceAddress}
                      onChange={(e) => setNewWorkplaceAddress(e.target.value)}
                    />
                  </div>

                  <div className="info-field">
                    <label className="info-label">사업자 등록 번호</label>
                    <input
                      type="text"
                      className="info-input"
                      placeholder="123-45-67890"
                      value={newWorkplaceBusinessNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9-]/g, "");
                        let formatted = value.replace(/-/g, "");
                        if (formatted.length > 3) {
                          formatted =
                            formatted.slice(0, 3) + "-" + formatted.slice(3);
                        }
                        if (formatted.length > 6) {
                          formatted =
                            formatted.slice(0, 6) + "-" + formatted.slice(6, 11);
                        }
                        setNewWorkplaceBusinessNumber(formatted);
                      }}
                      maxLength={12}
                    />
                  </div>

                  <div className="toggle-row">
                    <div className="toggle-item">
                      <label className="toggle-label">5인 미만 사업장</label>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={newWorkplaceIsSmallBusiness}
                          onChange={(e) =>
                            setNewWorkplaceIsSmallBusiness(e.target.checked)
                          }
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="add-worker-button-container">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={handleCancelAddWorkplace}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="add-button-large"
                      onClick={handleAddWorkplace}
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            )}

            {editingWorkplace && (
              <div className="info-card">
                <div className="info-card-header">
                  <h3 className="info-card-title">근무지 수정</h3>
                </div>
                <div className="info-card-content">
                  <div className="info-field">
                    <label className="info-label">근무지 이름</label>
                    <input
                      type="text"
                      className="info-input"
                      placeholder="근무지 이름을 입력하세요"
                      value={editingWorkplace.name}
                      onChange={(e) =>
                        setEditingWorkplace({
                          ...editingWorkplace,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="info-field">
                    <label className="info-label">주소</label>
                    <input
                      type="text"
                      className="info-input"
                      placeholder="주소를 입력하세요"
                      value={editingWorkplace.address}
                      onChange={(e) =>
                        setEditingWorkplace({
                          ...editingWorkplace,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="info-field">
                    <label className="info-label">사업자 등록 번호</label>
                    <input
                      type="text"
                      className="info-input"
                      placeholder="123-45-67890"
                      value={editingWorkplace.businessNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9-]/g, "");
                        let formatted = value.replace(/-/g, "");
                        if (formatted.length > 3) {
                          formatted =
                            formatted.slice(0, 3) + "-" + formatted.slice(3);
                        }
                        if (formatted.length > 6) {
                          formatted =
                            formatted.slice(0, 6) +
                            "-" +
                            formatted.slice(6, 11);
                        }
                        setEditingWorkplace({
                          ...editingWorkplace,
                          businessNumber: formatted,
                        });
                      }}
                      maxLength={12}
                    />
                  </div>

                  <div className="toggle-row">
                    <div className="toggle-item">
                      <label className="toggle-label">5인 미만 사업장</label>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={editingWorkplace.isSmallBusiness}
                          onChange={(e) =>
                            setEditingWorkplace({
                              ...editingWorkplace,
                              isSmallBusiness: e.target.checked,
                            })
                          }
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="add-worker-button-container">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={handleCancelWorkplaceEdit}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="add-button-large"
                      onClick={handleSaveWorkplaceEdit}
                    >
                      저장
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : isAddingWorker ? (
          <>
            {/* 근무자 코드 검색 카드 */}
            <div className="info-card">
              <div className="info-card-header">
                <h3 className="info-card-title">근무자 코드</h3>
              </div>
              <div className="info-card-content">
                <div className="info-field">
                  <label className="info-label">근무자 코드</label>
                  <div className="search-input-group">
                    <input
                      type="text"
                      className="worker-code-input"
                      value={workerCode}
                      onChange={(e) => setWorkerCode(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleSearchWorker();
                        }
                      }}
                      placeholder="근무자 코드를 입력하세요"
                    />
                    <button
                      type="button"
                      className="search-button"
                      onClick={handleSearchWorker}
                      disabled={isSearching}
                    >
                      {isSearching ? "검색 중..." : "검색"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 근무자 정보 확인 카드 */}
            {searchedWorker && (
              <div className="info-card">
                <div className="info-card-header">
                  <h3 className="info-card-title">근무자 정보</h3>
                </div>
                <div className="info-card-content">
                  <div className="basic-info-header">
                    <div className="profile-icon">
                      <FaUser />
                    </div>
                    <div className="worker-info-display">
                      <div className="info-field">
                        <label className="info-label">이름</label>
                        <div className="info-value">{searchedWorker.name}</div>
                      </div>
                      <div className="info-field">
                        <label className="info-label">생년월일</label>
                        <div className="info-value">
                          {searchedWorker.birthDate}
                        </div>
                      </div>
                    </div>
                    <div className="confirm-buttons">
                      <button
                        type="button"
                        className="confirm-button"
                        onClick={handleConfirmWorker}
                      >
                        확인
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 근무 정보 설정 카드 */}
            {confirmedWorker && newWorkerWorkInfo && (
              <div className="info-card">
                <div className="info-card-header">
                  <h3 className="info-card-title">근무 정보</h3>
                </div>
                <div className="info-card-content">
                  <div className="info-field">
                    <label className="info-label">근무지</label>
                    <div className="info-value">{selectedWorkplace}</div>
                  </div>

                  {/* 근무 시간 설정 */}
                  <div className="info-field">
                    <label className="info-label">근무 시간</label>
                    <div className="weekly-schedule-inputs">
                      {daysOfWeek.map((day) => {
                        const schedule =
                          newWorkerWorkInfo.weeklySchedule?.[day];
                        return (
                          <div key={day} className="day-schedule-row">
                            <span className="day-label-small">{day}요일</span>
                            <div className="time-wheel-wrapper">
                              {schedule ? (
                                <>
                                  <TimeInput
                                    value={schedule.start || "00:00"}
                                    onChange={(val) => {
                                      setNewWorkerWorkInfo({
                                        ...newWorkerWorkInfo,
                                        weeklySchedule: {
                                          ...newWorkerWorkInfo.weeklySchedule,
                                          [day]: {
                                            ...schedule,
                                            start: val,
                                          },
                                        },
                                      });
                                    }}
                                  />
                                  <span className="time-separator">~</span>
                                  <TimeInput
                                    value={schedule.end || "00:00"}
                                    onChange={(val) => {
                                      setNewWorkerWorkInfo({
                                        ...newWorkerWorkInfo,
                                        weeklySchedule: {
                                          ...newWorkerWorkInfo.weeklySchedule,
                                          [day]: {
                                            ...schedule,
                                            end: val,
                                          },
                                        },
                                      });
                                    }}
                                    allowMidnight
                                  />
                                  {(() => {
                                    const [startHour, startMin] = (
                                      schedule.start || "00:00"
                                    )
                                      .split(":")
                                      .map(Number);
                                    const [endHour, endMin] = (
                                      schedule.end || "00:00"
                                    )
                                      .split(":")
                                      .map(Number);
                                    const startDecimal =
                                      startHour + startMin / 60;
                                    const endDecimal = endHour + endMin / 60;
                                    const crossesMidnight =
                                      endDecimal <= startDecimal;
                                    return crossesMidnight ? (
                                      <span className="overnight-label">
                                        (익일)
                                      </span>
                                    ) : null;
                                  })()}
                                  <button
                                    type="button"
                                    className="remove-schedule-button-x"
                                    onClick={() => {
                                      const updatedSchedule = {
                                        ...newWorkerWorkInfo.weeklySchedule,
                                      };
                                      delete updatedSchedule[day];
                                      setNewWorkerWorkInfo({
                                        ...newWorkerWorkInfo,
                                        weeklySchedule: updatedSchedule,
                                      });
                                    }}
                                    title="삭제"
                                  >
                                    <FaTimes />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="add-schedule-button"
                                  onClick={() => {
                                    setNewWorkerWorkInfo({
                                      ...newWorkerWorkInfo,
                                      weeklySchedule: {
                                        ...newWorkerWorkInfo.weeklySchedule,
                                        [day]: { start: "09:00", end: "18:00" },
                                      },
                                    });
                                  }}
                                >
                                  근무 추가
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 휴게 시간 설정 */}
                  <div className="info-field">
                    <label className="info-label">휴게 시간</label>
                    <div className="break-time-by-day">
                      {daysOfWeek.map((day) => {
                        const breakTime =
                          typeof newWorkerWorkInfo.breakTime === "object"
                            ? newWorkerWorkInfo.breakTime[day] || 0
                            : newWorkerWorkInfo.breakTime || 0;
                        const hasSchedule =
                          newWorkerWorkInfo.weeklySchedule?.[day];

                        return (
                          <div key={day} className="break-time-day-row">
                            <span className="day-label-small">{day}요일</span>
                            {hasSchedule ? (
                              <div className="break-time-input-group">
                                <input
                                  type="number"
                                  className="break-time-input-field"
                                  value={breakTime === 0 ? "" : breakTime}
                                  min="0"
                                  onFocus={(e) => {
                                    if (breakTime !== 0) {
                                      e.target.select();
                                    }
                                  }}
                                  onBlur={(e) => {
                                    if (e.target.value === "") {
                                      const newBreakTime =
                                        typeof newWorkerWorkInfo.breakTime ===
                                        "object"
                                          ? { ...newWorkerWorkInfo.breakTime }
                                          : daysOfWeek.reduce((acc, d) => {
                                              acc[d] =
                                                newWorkerWorkInfo.breakTime ||
                                                0;
                                              return acc;
                                            }, {});
                                      newBreakTime[day] = 0;
                                      setNewWorkerWorkInfo({
                                        ...newWorkerWorkInfo,
                                        breakTime: newBreakTime,
                                      });
                                    }
                                  }}
                                  onClick={(e) => {
                                    if (breakTime !== 0) {
                                      e.target.select();
                                    }
                                  }}
                                  onChange={(e) => {
                                    const newBreakTime =
                                      typeof newWorkerWorkInfo.breakTime ===
                                      "object"
                                        ? { ...newWorkerWorkInfo.breakTime }
                                        : daysOfWeek.reduce((acc, d) => {
                                            acc[d] =
                                              newWorkerWorkInfo.breakTime || 0;
                                            return acc;
                                          }, {});
                                    const inputValue = e.target.value;
                                    newBreakTime[day] =
                                      inputValue === ""
                                        ? 0
                                        : parseInt(inputValue, 10) || 0;
                                    setNewWorkerWorkInfo({
                                      ...newWorkerWorkInfo,
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
                  </div>

                  {/* 시급 및 급여 지급일 */}
                  <div className="info-field-row">
                    <div className="info-field">
                      <label className="info-label">시급</label>
                      <div className="wage-input-group">
                        <input
                          type="number"
                          className="info-input"
                          value={newWorkerWorkInfo.hourlyWage ?? ""}
                          min="0"
                          onChange={(e) =>
                            setNewWorkerWorkInfo({
                              ...newWorkerWorkInfo,
                              hourlyWage:
                                e.target.value === ""
                                  ? null
                                  : parseInt(e.target.value) || 0,
                            })
                          }
                        />
                        <span className="wage-unit">원</span>
                      </div>
                    </div>

                    <div className="info-field">
                      <label className="info-label">급여 지급일</label>
                      <div className="payday-input-group">
                        <span className="payday-text">매월</span>
                        <input
                          type="number"
                          className="payday-input"
                          value={newWorkerWorkInfo.payday ?? ""}
                          min="1"
                          max="31"
                          onChange={(e) =>
                            setNewWorkerWorkInfo({
                              ...newWorkerWorkInfo,
                              payday:
                                e.target.value === ""
                                  ? null
                                  : parseInt(e.target.value) || 1,
                            })
                          }
                        />
                        <span>일</span>
                      </div>
                    </div>
                  </div>

                  {/* 4대보험 및 소득세 */}
                  <div className="toggle-row">
                    <div className="toggle-item">
                      <label className="toggle-label">4대 보험</label>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={newWorkerWorkInfo.socialInsurance || false}
                          onChange={(e) =>
                            setNewWorkerWorkInfo({
                              ...newWorkerWorkInfo,
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
                          checked={newWorkerWorkInfo.withholdingTax || false}
                          onChange={(e) =>
                            setNewWorkerWorkInfo({
                              ...newWorkerWorkInfo,
                              withholdingTax: e.target.checked,
                            })
                          }
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="add-worker-button-container">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={handleCancelAddWorker}
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      className="add-button-large"
                      onClick={handleSaveNewWorker}
                    >
                      추가
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : workerData ? (
          <>
            <BasicInfoCard
              workerData={workerData}
              onDismiss={handleDismissWorker}
            />
            <WorkInfoCard
              workerData={workerData}
              currentWorkInfo={currentWorkInfo}
              isEditingWork={isEditingWork}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onUpdateWorkInfo={setEditedWorkInfo}
            />
          </>
        ) : (
          <div className="no-worker-selected">직원을 선택해주세요.</div>
        )}
      </div>

      {/* 오른쪽 스케줄 그리드 */}
      {!isAddingWorkplace && !isManagingWorkplaces && (
        <ScheduleGrid
          weeklyScheduleGrid={weeklyScheduleGrid}
          hoveredBlockGroup={hoveredBlockGroup}
          onHoverBlock={setHoveredBlockGroup}
          currentWorkInfo={currentWorkInfo}
          workerData={workerData}
        />
      )}
    </div>
  );
}
