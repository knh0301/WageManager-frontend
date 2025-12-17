import { useState, useEffect } from "react";
import ProfileBox from "../../components/worker/MyPage/ProfileBox";
import ProfileEdit from "../../components/worker/MyPage/ProfileEdit";
import WorkplaceManage from "../../components/worker/MyPage/WorkplaceManage";
import WorkEditRequestList from "../../components/worker/MyPage/WorkEditRequestList";
import { getUserProfile } from "../../api/workerApi";
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

  // API로 사용자 프로필 조회
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await getUserProfile();
        
        if (response.success && response.data) {
          const userData = response.data;
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

    fetchUserProfile();
  }, []);

  // 임시 근무지 데이터
  const [workplaces] = useState([
    {
      name: "맥도날드",
      startDate: "2025년 4월 23일",
      hourlyWage: 10030,
    },
    {
      name: "버거킹",
      startDate: "2025년 5월 15일",
      hourlyWage: 10030,
    },
  ]);

  // 임시 이전 근무지 데이터
  const [previousWorkplaces] = useState([
    {
      name: "롯데리아",
      startDate: "2023년 4월 23일",
      endDate: "2024년 5월 15일",
      hourlyWage: 10030,
    },
    {
      name: "스타벅스",
      startDate: "2022년 1월 28일",
      endDate: "2024년 5월 15일",
      hourlyWage: 10030,
    },
  ]);

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

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    // 나중에 API 호출 추가
  };

  const handleProfileImageUpdate = (imageUrl) => {
    setProfileImage(imageUrl);
    // user 상태의 profileImageUrl도 업데이트
    setUser((prev) => ({
      ...prev,
      profileImageUrl: imageUrl,
    }));
    // 나중에 프로필 이미지 업데이트 API 호출 추가
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
          onProfileImageUpdate={handleProfileImageUpdate}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {renderContent()}
      </div>
    </div>
  );
}

