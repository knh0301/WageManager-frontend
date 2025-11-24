// TODO: 백엔드 연동 시 제거할 임시 더미 데이터

// 스케줄 더미 데이터
export const initialScheduleData = {
  "맥도날드 잠실점": {
    "2025-11-21": [
      {
        id: 1,
        name: "오지환",
        start: "07:00",
        end: "16:00",
        startHour: 7,
        durationHours: 9,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 60,
        hourlyWage: 11000,
        allowances: {
          overtime: { enabled: true, rate: 150 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 2,
        name: "문보경",
        start: "04:30",
        end: "14:30",
        startHour: 4.5,
        durationHours: 10,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 45,
        hourlyWage: 10500,
        allowances: {
          overtime: { enabled: true, rate: 125 },
          night: { enabled: true, rate: 150 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 3,
        name: "홍창기",
        start: "10:00",
        end: "15:00",
        startHour: 10,
        durationHours: 5,
        workplaceDetail: "맥도날드 잠실점",
        breakMinutes: 30,
        hourlyWage: 10000,
        allowances: {
          overtime: { enabled: false, rate: 0 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: false,
        withholdingTax: false,
      },
    ],
  },
  "스타벅스 강남역점": {
    "2025-11-21": [
      {
        id: 6,
        name: "김민수",
        start: "08:00",
        end: "16:00",
        startHour: 8,
        durationHours: 8,
        workplaceDetail: "스타벅스 강남역점",
        breakMinutes: 30,
        hourlyWage: 12000,
        allowances: {
          overtime: { enabled: true, rate: 150 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: true, rate: 150 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
      {
        id: 7,
        name: "이지은",
        start: "09:00",
        end: "17:00",
        startHour: 9,
        durationHours: 8,
        workplaceDetail: "스타벅스 강남역점",
        breakMinutes: 30,
        hourlyWage: 12500,
        allowances: {
          overtime: { enabled: true, rate: 125 },
          night: { enabled: false, rate: 0 },
          holiday: { enabled: false, rate: 0 },
        },
        socialInsurance: true,
        withholdingTax: true,
      },
    ],
  },
  롯데리아: {},
  버거킹: {},
  KFC: {},
};

// 근무지 리스트 더미 데이터
export const initialWorkplaces = [
  { id: 1, name: "맥도날드 잠실점" },
  { id: 2, name: "스타벅스 강남역점" },
  { id: 3, name: "롯데리아" },
  { id: 4, name: "버거킹" },
  { id: 5, name: "KFC" },
];

// 근무지별 근무자 리스트
export const workplaceWorkers = {
  1: ["오지환", "문보경", "홍창기", "오스틴", "박해민", "임찬규", "송승기"],
  2: ["김민수", "이지은"],
  3: ["김지수", "박시우", "최민호"],
  4: ["이서연", "장도윤"],
  5: ["정윤호", "한지민"],
};

// 받은 근무 요청 더미 데이터
export const mockRequests = [
  {
    id: 1,
    workerName: "김민수",
    workplace: "맥도날드 잠실점",
    month: 11,
    date: 25,
    startTime: "09:00",
    endTime: "18:00",
    breakMinutes: 60,
    hourlyWage: 11000,
    allowances: {
      overtime: { enabled: true, rate: 150 },
      night: { enabled: true, rate: 150 },
      holiday: { enabled: true, rate: 200 },
    },
    socialInsurance: true,
    withholdingTax: true,
    status: null, // 대기중
  },
  {
    id: 2,
    workerName: "이지은",
    workplace: "스타벅스 강남역점",
    month: 11,
    date: 26,
    startTime: "07:00",
    endTime: "15:00",
    breakMinutes: 45,
    hourlyWage: 12000,
    allowances: {
      overtime: { enabled: true, rate: 125 },
      night: { enabled: false, rate: 0 },
      holiday: { enabled: true, rate: 150 },
    },
    socialInsurance: true,
    withholdingTax: false,
    status: "approved", // 승인함
  },
  {
    id: 3,
    workerName: "박서준",
    workplace: "롯데리아",
    month: 11,
    date: 27,
    startTime: "14:00",
    endTime: "22:00",
    breakMinutes: 30,
    hourlyWage: 10030,
    allowances: {
      overtime: { enabled: true, rate: 125 },
      night: { enabled: true, rate: 150 },
      holiday: { enabled: false, rate: 0 },
    },
    socialInsurance: false,
    withholdingTax: true,
    status: "rejected", // 거절함
  },
  {
    id: 4,
    workerName: "최수진",
    workplace: "맥도날드 잠실점",
    month: 11,
    date: 27,
    startTime: "11:00",
    endTime: "20:00",
    breakMinutes: 60,
    hourlyWage: 10500,
    allowances: {
      overtime: { enabled: true, rate: 200 },
      night: { enabled: false, rate: 0 },
      holiday: { enabled: false, rate: 0 },
    },
    socialInsurance: true,
    withholdingTax: true,
    status: null, // 대기중
  },
  {
    id: 5,
    workerName: "정다은",
    workplace: "버거킹",
    month: 11,
    date: 28,
    startTime: "06:00",
    endTime: "14:00",
    breakMinutes: 30,
    hourlyWage: 11500,
    allowances: {
      overtime: { enabled: false, rate: 0 },
      night: { enabled: true, rate: 200 },
      holiday: { enabled: false, rate: 0 },
    },
    socialInsurance: false,
    withholdingTax: false,
    status: null, // 대기중
  },
  {
    id: 6,
    workerName: "한소희",
    workplace: "스타벅스 강남역점",
    month: 11,
    date: 28,
    startTime: "13:00",
    endTime: "21:00",
    breakMinutes: 45,
    hourlyWage: 12500,
    allowances: {
      overtime: { enabled: true, rate: 150 },
      night: { enabled: true, rate: 150 },
      holiday: { enabled: true, rate: 150 },
    },
    socialInsurance: true,
    withholdingTax: false,
    status: null, // 대기중
  },
  {
    id: 7,
    workerName: "오지환",
    workplace: "KFC",
    month: 11,
    date: 29,
    startTime: "10:00",
    endTime: "19:00",
    breakMinutes: 60,
    hourlyWage: 10800,
    allowances: {
      overtime: { enabled: true, rate: 125 },
      night: { enabled: true, rate: 200 },
      holiday: { enabled: true, rate: 150 },
    },
    socialInsurance: true,
    withholdingTax: true,
    status: "approved", // 승인함
  },
  {
    id: 8,
    workerName: "문보경",
    workplace: "맥도날드 잠실점",
    month: 11,
    date: 29,
    startTime: "16:00",
    endTime: "24:00",
    breakMinutes: 30,
    hourlyWage: 13000,
    allowances: {
      overtime: { enabled: true, rate: 150 },
      night: { enabled: true, rate: 200 },
      holiday: { enabled: false, rate: 0 },
    },
    socialInsurance: true,
    withholdingTax: false,
    status: null, // 대기중
  },
  {
    id: 9,
    workerName: "홍창기",
    workplace: "롯데리아",
    month: 11,
    date: 30,
    startTime: "08:00",
    endTime: "17:00",
    breakMinutes: 45,
    hourlyWage: 10000,
    allowances: {
      overtime: { enabled: false, rate: 0 },
      night: { enabled: false, rate: 0 },
      holiday: { enabled: false, rate: 0 },
    },
    socialInsurance: false,
    withholdingTax: false,
    status: "rejected", // 거절함
  },
  {
    id: 10,
    workerName: "김서연",
    workplace: "버거킹",
    month: 12,
    date: 1,
    startTime: "12:00",
    endTime: "21:00",
    breakMinutes: 60,
    hourlyWage: 11200,
    allowances: {
      overtime: { enabled: true, rate: 150 },
      night: { enabled: false, rate: 0 },
      holiday: { enabled: true, rate: 200 },
    },
    socialInsurance: true,
    withholdingTax: true,
    status: null, // 대기중
  },
];

// 송금 관리 페이지 더미 데이터 (직원별 근무 내역 및 급여)
export const remittanceData = {
  "맥도날드 잠실점": {
    오지환: {
      "2025-10": [
        {
          date: 15,
          day: "수",
          startTime: "15:00",
          endTime: "21:00",
          wage: 60180,
        },
        {
          date: 13,
          day: "월",
          startTime: "15:00",
          endTime: "21:00",
          wage: 60180,
        },
        {
          date: 6,
          day: "일",
          startTime: "15:00",
          endTime: "21:00",
          wage: 60180,
        },
        {
          date: 5,
          day: "토",
          startTime: "15:00",
          endTime: "21:00",
          wage: 60180,
        },
        {
          date: 4,
          day: "금",
          startTime: "15:00",
          endTime: "21:00",
          wage: 60180,
        },
      ],
      totalWage: 300900,
    },
    문보경: {
      "2025-10": [
        {
          date: 20,
          day: "월",
          startTime: "09:00",
          endTime: "18:00",
          wage: 89100,
        },
        {
          date: 18,
          day: "토",
          startTime: "09:00",
          endTime: "18:00",
          wage: 89100,
        },
        {
          date: 12,
          day: "일",
          startTime: "09:00",
          endTime: "18:00",
          wage: 89100,
        },
      ],
      totalWage: 267300,
    },
    홍창기: {
      "2025-10": [
        {
          date: 22,
          day: "수",
          startTime: "10:00",
          endTime: "19:00",
          wage: 90000,
        },
        {
          date: 19,
          day: "일",
          startTime: "10:00",
          endTime: "19:00",
          wage: 90000,
        },
        {
          date: 11,
          day: "토",
          startTime: "10:00",
          endTime: "19:00",
          wage: 90000,
        },
        {
          date: 8,
          day: "수",
          startTime: "10:00",
          endTime: "19:00",
          wage: 90000,
        },
      ],
      totalWage: 360000,
    },
    오스틴: {
      "2025-10": [
        {
          date: 25,
          day: "토",
          startTime: "14:00",
          endTime: "22:00",
          wage: 80000,
        },
        {
          date: 17,
          day: "금",
          startTime: "14:00",
          endTime: "22:00",
          wage: 80000,
        },
        {
          date: 10,
          day: "금",
          startTime: "14:00",
          endTime: "22:00",
          wage: 80000,
        },
      ],
      totalWage: 240000,
    },
    박해민: {
      "2025-10": [
        {
          date: 16,
          day: "목",
          startTime: "11:00",
          endTime: "20:00",
          wage: 99000,
        },
        {
          date: 9,
          day: "목",
          startTime: "11:00",
          endTime: "20:00",
          wage: 99000,
        },
        {
          date: 2,
          day: "목",
          startTime: "11:00",
          endTime: "20:00",
          wage: 99000,
        },
      ],
      totalWage: 297000,
    },
    임찬규: {
      "2025-10": [
        {
          date: 24,
          day: "금",
          startTime: "08:00",
          endTime: "17:00",
          wage: 99000,
        },
        {
          date: 14,
          day: "화",
          startTime: "08:00",
          endTime: "17:00",
          wage: 99000,
        },
        {
          date: 7,
          day: "화",
          startTime: "08:00",
          endTime: "17:00",
          wage: 99000,
        },
      ],
      totalWage: 297000,
    },
    송승기: {
      "2025-10": [
        {
          date: 21,
          day: "화",
          startTime: "12:00",
          endTime: "21:00",
          wage: 99000,
        },
        {
          date: 3,
          day: "금",
          startTime: "12:00",
          endTime: "21:00",
          wage: 99000,
        },
      ],
      totalWage: 198000,
    },
  },
  "스타벅스 강남역점": {
    김민수: {
      "2025-10": [
        {
          date: 21,
          day: "화",
          startTime: "08:00",
          endTime: "16:00",
          wage: 96000,
        },
        {
          date: 14,
          day: "화",
          startTime: "08:00",
          endTime: "16:00",
          wage: 96000,
        },
        {
          date: 7,
          day: "월",
          startTime: "08:00",
          endTime: "16:00",
          wage: 96000,
        },
      ],
      totalWage: 288000,
    },
    이지은: {
      "2025-10": [
        {
          date: 23,
          day: "목",
          startTime: "12:00",
          endTime: "20:00",
          wage: 96000,
        },
        {
          date: 16,
          day: "목",
          startTime: "12:00",
          endTime: "20:00",
          wage: 96000,
        },
        {
          date: 9,
          day: "목",
          startTime: "12:00",
          endTime: "20:00",
          wage: 96000,
        },
      ],
      totalWage: 288000,
    },
  },
};
