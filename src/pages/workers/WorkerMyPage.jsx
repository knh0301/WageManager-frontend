import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ProfileBox from "../../components/worker/MyPage/ProfileBox";
import ProfileEdit from "../../components/worker/MyPage/ProfileEdit";
import WorkplaceManage from "../../components/worker/MyPage/WorkplaceManage";
import WorkEditRequestList from "../../components/worker/MyPage/WorkEditRequestList";
import { getUserProfile, getWorkerInfo, updateUserProfile, updateAccountInfo, getContracts, getContractDetail } from "../../api/workerApi";
import "./WorkerMyPage.css";

export default function WorkerMyPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 데이터
  const [user, setUser] = useState({
    name: "",
    birthDate: "",
    userType: "",
    phone: "",
    kakaoPayLink: "",
    employeeCode: "",
    profileImageUrl: null,
  });

  // 프로필 이미지 상태 관리
  const [profileImage, setProfileImage] = useState(null);

  // API로 사용자 프로필 조회 및 근로자 정보 조회
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // 1. 사용자 프로필 조회
        const profileResponse = await getUserProfile();
        
        if (profileResponse.success && profileResponse.data) {
          const userData = profileResponse.data;
          const userId = userData.id; // id를 userId로 저장
          
          // 첫 번째 API 데이터로 사용자 정보 설정
          setUser({
            name: userData.name || "",
            birthDate: userData.kakaoId || "", // kakaoId를 그대로 출력
            userType: userData.userType || "",
            phone: userData.phone || "",
            kakaoPayLink: "",
            employeeCode: "",
            profileImageUrl: userData.profileImageUrl || null,
          });
          setProfileImage(userData.profileImageUrl || null);
          
          // 2. 근로자 정보 조회 (userId가 있을 때만)
          if (userId) {
            try {
              const workerResponse = await getWorkerInfo(userId);
              
              if (workerResponse.success && workerResponse.data) {
                const workerData = workerResponse.data;
                // kakaoPayLink와 employeeCode만 업데이트
                setUser((prev) => ({
                  ...prev,
                  kakaoPayLink: workerData.kakaoPayLink || "",
                  employeeCode: workerData.workerCode || "",
                }));
              } else {
                // 에러 응답인 경우 kakaoPayLink와 employeeCode만 빈 문자열로 처리
                setUser((prev) => ({
                  ...prev,
                  kakaoPayLink: "",
                  employeeCode: "",
                }));
              }
            } catch (workerError) {
              console.error('근로자 정보 조회 실패:', workerError);
              // 에러 시 kakaoPayLink와 employeeCode만 빈 문자열로 처리
              setUser((prev) => ({
                ...prev,
                kakaoPayLink: "",
                employeeCode: "",
              }));
            }
          }
        } else {
          // 에러 응답인 경우 빈 문자열로 초기화
          setUser({
            name: "",
            birthDate: "",
            userType: "",
            phone: "",
            kakaoPayLink: "",
            employeeCode: "",
            profileImageUrl: null,
          });
          setProfileImage(null);
        }
      } catch (error) {
        console.error('사용자 프로필 조회 실패:', error);
        // 에러 시 빈 문자열로 초기화
        setUser({
          name: "",
          birthDate: "",
          userType: "",
          phone: "",
          kakaoPayLink: "",
          employeeCode: "",
          profileImageUrl: null,
        });
        setProfileImage(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // 근무지 데이터
  const [workplaces, setWorkplaces] = useState([]);
  const [previousWorkplaces, setPreviousWorkplaces] = useState([]);
  const [isLoadingWorkplaces, setIsLoadingWorkplaces] = useState(false);

  // 날짜 형식 변환 함수 (2025-12-17 -> 2025년 12월 17일)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const [year, month, day] = dateString.split("-");
      return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
    } catch {
      return dateString;
    }
  };

  // 근무지 정보 조회
  useEffect(() => {
    const fetchWorkplaces = async () => {
      try {
        setIsLoadingWorkplaces(true);
        
        // 1. 전체 계약 목록 조회
        const contractsResponse = await getContracts();
        
        if (contractsResponse.success && contractsResponse.data && Array.isArray(contractsResponse.data)) {
          const contracts = contractsResponse.data;
          
          // 2. 각 계약의 상세 정보를 병렬로 조회
          const detailPromises = contracts.map((contract) => 
            getContractDetail(contract.id).catch((error) => {
              console.error(`계약 ${contract.id} 상세 정보 조회 실패:`, error);
              return null;
            })
          );
          
          const detailResponses = await Promise.all(detailPromises);
          
          // 3. 상세 정보를 매핑하여 현재 근무지와 이전 근무지로 분류
          const currentWorkplaces = [];
          const previousWorkplacesList = [];
          
          detailResponses.forEach((response) => {
            if (response && response.success && response.data) {
              const contractData = response.data;
              const workplaceData = {
                name: contractData.workplaceName || "",
                startDate: formatDate(contractData.contractStartDate),
                hourlyWage: contractData.hourlyWage || 0,
              };
              
              if (contractData.isActive) {
                // 현재 근무지
                currentWorkplaces.push(workplaceData);
              } else {
                // 이전 근무지
                workplaceData.endDate = formatDate(contractData.contractEndDate);
                previousWorkplacesList.push(workplaceData);
              }
            }
          });
          
          setWorkplaces(currentWorkplaces);
          setPreviousWorkplaces(previousWorkplacesList);
        } else {
          // 에러 응답인 경우 빈 배열로 설정
          setWorkplaces([]);
          setPreviousWorkplaces([]);
        }
      } catch (error) {
        console.error('근무지 정보 조회 실패:', error);
        // 에러 시 빈 배열로 설정
        setWorkplaces([]);
        setPreviousWorkplaces([]);
      } finally {
        setIsLoadingWorkplaces(false);
      }
    };

    fetchWorkplaces();
  }, []);

  // 임시 정정 요청 데이터
  const [editRequests] = useState([
    {
      place: "맥도날드",
      date: "2월 3일",
      startTime: "15:00",
      endTime: "21:00",
      status: "approved",
    },
    {
      place: "맥도날드",
      date: "5월 27일",
      startTime: "15:00",
      endTime: "21:00",
      status: "rejected",
    },
    {
      place: "맥도날드",
      date: "7월 14일",
      startTime: "15:00",
      endTime: "21:00",
      status: "pending",
    },
  ]);

  const handleUserUpdate = async (updatedUser, section) => {
    try {
      let response;
      
      if (section === "kakaoPay") {
        // 카카오페이 링크 수정은 별도 API 사용
        const requestBody = {
          kakaoPayLink: updatedUser.kakaoPayLink || "",
        };
        
        response = await updateAccountInfo(requestBody);
        
        if (response.success && response.data) {
          const accountData = response.data;
          // API 응답 데이터로 화면 업데이트
          setUser((prev) => ({
            ...prev,
            kakaoPayLink: accountData.kakaoPayLink || prev.kakaoPayLink,
          }));
          
          toast.success("카카오페이 링크가 성공적으로 수정되었습니다.", {
            position: "top-right",
            autoClose: 2000,
          });
        }
      } else {
        // 이름, 전화번호 수정은 기존 API 사용
        const requestBody = {};
        
        if (section === "basic" && updatedUser.name !== undefined) {
          requestBody.name = updatedUser.name || "";
        }
        
        if (section === "phone" && updatedUser.phone !== undefined) {
          requestBody.phone = updatedUser.phone || "";
        }
        
        response = await updateUserProfile(requestBody);
        
        if (response.success && response.data) {
          const userData = response.data;
          // API 응답 데이터로 화면 업데이트
          setUser((prev) => ({
            ...prev,
            name: userData.name || prev.name,
            phone: userData.phone || prev.phone,
            profileImageUrl: userData.profileImageUrl || prev.profileImageUrl,
          }));
          
          if (userData.profileImageUrl) {
            setProfileImage(userData.profileImageUrl);
          }
          
          // 성공 메시지 표시
          const successMessage = section === "basic" 
            ? "이름이 성공적으로 수정되었습니다." 
            : section === "phone"
            ? "전화번호가 성공적으로 수정되었습니다."
            : "프로필이 성공적으로 수정되었습니다.";
          
          toast.success(successMessage, {
            position: "top-right",
            autoClose: 2000,
          });
        }
      }
    } catch (error) {
      console.error('사용자 정보 수정 실패:', error);
      // 에러 메시지 추출
      const errorStatus = error.status || error.response?.status || '알 수 없음';
      const errorMessage = error.error?.message || error.message || '정보 수정에 실패했습니다.';
      
      // react-toastify로 에러 메시지 표시
      toast.error(`[${errorStatus}] ${errorMessage}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <ProfileEdit
            user={user}
            onUserUpdate={handleUserUpdate}
          />
        );
      case "workplace":
        return (
          <WorkplaceManage
            workplaces={workplaces}
            previousWorkplaces={previousWorkplaces}
            isLoading={isLoadingWorkplaces}
          />
        );
      case "editRequest":
        return <WorkEditRequestList requests={editRequests} />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="worker-mypage-main">
        <div className="worker-mypage-content">
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-mypage-main">
      <div className="worker-mypage-content">
        <ProfileBox
          user={user}
          profileImage={profileImage}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {renderContent()}
      </div>
    </div>
  );
}

