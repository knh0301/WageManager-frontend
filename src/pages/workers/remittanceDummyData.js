// 근로자 송금 관리 페이지 더미 데이터

// 근무지 목록
export const workerWorkplaces = [
  { id: 1, name: "맥도날드" },
  { id: 2, name: "버거킹" },
  { id: 3, name: "스타벅스" },
];

// 근무 기록 데이터 구조
// { workplaceName: { year-month: [records] } }
export const workerRemittanceData = {
  맥도날드: {
    "2025-09": [
      {
        id: 1,
        date: 27,
        day: "토",
        startTime: "15:00",
        endTime: "21:00",
        workplace: "맥도날드",
        breakMinutes: 60,
        hourlyWage: 10030,
        wage: 280225, // 야간수당 포함 계산
        allowances: {
          overtime: { enabled: false, rate: 0 },
          night: { enabled: true, rate: 150 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: false,
      },
      {
        id: 2,
        date: 29,
        day: "월",
        startTime: "15:00",
        endTime: "21:00",
        workplace: "맥도날드",
        breakMinutes: 60,
        hourlyWage: 10030,
        wage: 280225, // 야간수당 포함 계산
        allowances: {
          overtime: { enabled: false, rate: 0 },
          night: { enabled: true, rate: 150 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: false,
      },
    ],
  },
  버거킹: {
    "2025-09": [
      {
        id: 3,
        date: 15,
        day: "일",
        startTime: "09:00",
        endTime: "13:00",
        workplace: "버거킹",
        breakMinutes: 0,
        hourlyWage: 10030,
        wage: 40120,
        allowances: {
          overtime: { enabled: false, rate: 0 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: true, rate: 150 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
    ],
  },
};

// 송금 상태 데이터
// { workplaceName: { year-month: { isCompleted: boolean, remittanceDate: string } } }
export const remittanceStatus = {
  맥도날드: {
    "2025-09": {
      isCompleted: true,
      remittanceDate: "2025.10.10",
    },
  },
  버거킹: {
    "2025-09": {
      isCompleted: false,
      remittanceDate: null,
    },
  },
};

