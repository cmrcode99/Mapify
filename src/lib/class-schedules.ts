export interface ClassSession {
  building_code: string;
  room: string;
  course: string;
  title: string;
  days: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  start_hour: number;
  start_min: number;
  end_hour: number;
  end_min: number;
}

export const CLASS_SCHEDULES: ClassSession[] = [
  // Siebel Center (SC)
  { building_code: "SC", room: "1404", course: "CS 124", title: "Intro to Computer Science", days: [1, 3, 5], start_hour: 9, start_min: 0, end_hour: 9, end_min: 50 },
  { building_code: "SC", room: "1404", course: "CS 225", title: "Data Structures", days: [1, 3, 5], start_hour: 11, start_min: 0, end_hour: 11, end_min: 50 },
  { building_code: "SC", room: "1404", course: "CS 233", title: "Computer Architecture", days: [2, 4], start_hour: 14, start_min: 0, end_hour: 15, end_min: 15 },
  { building_code: "SC", room: "1302", course: "CS 341", title: "System Programming", days: [1, 3, 5], start_hour: 10, start_min: 0, end_hour: 10, end_min: 50 },
  { building_code: "SC", room: "1302", course: "CS 374", title: "Algorithms & Models of Computation", days: [2, 4], start_hour: 11, start_min: 0, end_hour: 12, end_min: 15 },
  { building_code: "SC", room: "1109", course: "CS 421", title: "Programming Languages", days: [2, 4], start_hour: 9, start_min: 30, end_hour: 10, end_min: 45 },
  { building_code: "SC", room: "1109", course: "CS 440", title: "Artificial Intelligence", days: [1, 3, 5], start_hour: 13, start_min: 0, end_hour: 13, end_min: 50 },
  { building_code: "SC", room: "2405", course: "CS 128", title: "Intro to Computer Science II", days: [1, 3, 5], start_hour: 14, start_min: 0, end_hour: 14, end_min: 50 },
  { building_code: "SC", room: "2405", course: "CS 357", title: "Numerical Methods", days: [2, 4], start_hour: 15, start_min: 30, end_hour: 16, end_min: 45 },

  // ECEB
  { building_code: "ECEB", room: "1002", course: "ECE 110", title: "Intro to Electronics", days: [1, 3, 5], start_hour: 8, start_min: 0, end_hour: 8, end_min: 50 },
  { building_code: "ECEB", room: "1002", course: "ECE 220", title: "Computer Systems & Programming", days: [2, 4], start_hour: 9, start_min: 30, end_hour: 10, end_min: 45 },
  { building_code: "ECEB", room: "1013", course: "ECE 310", title: "Digital Signal Processing", days: [1, 3, 5], start_hour: 10, start_min: 0, end_hour: 10, end_min: 50 },
  { building_code: "ECEB", room: "1013", course: "ECE 385", title: "Digital Systems Laboratory", days: [2, 4], start_hour: 13, start_min: 0, end_hour: 14, end_min: 15 },
  { building_code: "ECEB", room: "3017", course: "ECE 391", title: "Computer Systems Engineering", days: [1, 3, 5], start_hour: 12, start_min: 0, end_hour: 12, end_min: 50 },
  { building_code: "ECEB", room: "3017", course: "ECE 411", title: "Computer Organization & Design", days: [2, 4], start_hour: 15, start_min: 30, end_hour: 16, end_min: 45 },

  // DCL
  { building_code: "DCL", room: "1320", course: "CS 173", title: "Discrete Structures", days: [1, 3, 5], start_hour: 9, start_min: 0, end_hour: 9, end_min: 50 },
  { building_code: "DCL", room: "1320", course: "CS 210", title: "Ethical & Professional Issues", days: [2, 4], start_hour: 11, start_min: 0, end_hour: 12, end_min: 15 },

  // Foellinger Auditorium (FOEL)
  { building_code: "FOEL", room: "AUD", course: "PSYC 100", title: "Intro to Psychology", days: [2, 4], start_hour: 10, start_min: 0, end_hour: 11, end_min: 15 },
  { building_code: "FOEL", room: "AUD", course: "ECON 102", title: "Microeconomic Principles", days: [1, 3, 5], start_hour: 12, start_min: 0, end_hour: 12, end_min: 50 },
  { building_code: "FOEL", room: "AUD", course: "CHEM 102", title: "General Chemistry I", days: [1, 3, 5], start_hour: 8, start_min: 0, end_hour: 8, end_min: 50 },

  // Lincoln Hall (LH)
  { building_code: "LH", room: "1002", course: "HIST 172", title: "US History Since 1877", days: [2, 4], start_hour: 9, start_min: 30, end_hour: 10, end_min: 45 },
  { building_code: "LH", room: "1002", course: "PHIL 101", title: "Intro to Philosophy", days: [1, 3, 5], start_hour: 11, start_min: 0, end_hour: 11, end_min: 50 },
  { building_code: "LH", room: "1090", course: "POLS 150", title: "American Government", days: [2, 4], start_hour: 14, start_min: 0, end_hour: 15, end_min: 15 },
  { building_code: "LH", room: "1090", course: "SOC 100", title: "Intro to Sociology", days: [1, 3, 5], start_hour: 15, start_min: 0, end_hour: 15, end_min: 50 },

  // Loomis Lab (LOOM)
  { building_code: "LOOM", room: "141", course: "PHYS 211", title: "University Physics: Mechanics", days: [1, 3, 5], start_hour: 10, start_min: 0, end_hour: 10, end_min: 50 },
  { building_code: "LOOM", room: "141", course: "PHYS 212", title: "University Physics: Elec & Mag", days: [2, 4], start_hour: 12, start_min: 30, end_hour: 13, end_min: 45 },
  { building_code: "LOOM", room: "151", course: "PHYS 213", title: "Univ Physics: Thermal Physics", days: [1, 3, 5], start_hour: 14, start_min: 0, end_hour: 14, end_min: 50 },

  // Noyes Lab (NOYES)
  { building_code: "NOYES", room: "100", course: "CHEM 104", title: "General Chemistry II", days: [1, 3, 5], start_hour: 9, start_min: 0, end_hour: 9, end_min: 50 },
  { building_code: "NOYES", room: "100", course: "CHEM 232", title: "Elementary Organic Chemistry I", days: [2, 4], start_hour: 11, start_min: 0, end_hour: 12, end_min: 15 },
  { building_code: "NOYES", room: "217", course: "CHEM 236", title: "Organic Chemistry Lab", days: [3], start_hour: 13, start_min: 0, end_hour: 16, end_min: 50 },

  // Altgeld Hall (ALT)
  { building_code: "ALT", room: "314", course: "MATH 241", title: "Calculus III", days: [1, 3, 5], start_hour: 9, start_min: 0, end_hour: 9, end_min: 50 },
  { building_code: "ALT", room: "314", course: "MATH 285", title: "Intro Differential Equations", days: [2, 4], start_hour: 11, start_min: 0, end_hour: 12, end_min: 15 },
  { building_code: "ALT", room: "243", course: "MATH 347", title: "Fundamental Mathematics", days: [1, 3, 5], start_hour: 13, start_min: 0, end_hour: 13, end_min: 50 },
  { building_code: "ALT", room: "243", course: "STAT 400", title: "Statistics & Probability I", days: [2, 4], start_hour: 14, start_min: 0, end_hour: 15, end_min: 15 },

  // Gregory Hall (GREG)
  { building_code: "GREG", room: "100", course: "CMN 101", title: "Public Speaking", days: [1, 3, 5], start_hour: 10, start_min: 0, end_hour: 10, end_min: 50 },
  { building_code: "GREG", room: "100", course: "JOUR 200", title: "Intro to Journalism", days: [2, 4], start_hour: 13, start_min: 0, end_hour: 14, end_min: 15 },
  { building_code: "GREG", room: "223", course: "ADV 150", title: "Intro to Advertising", days: [1, 3, 5], start_hour: 14, start_min: 0, end_hour: 14, end_min: 50 },

  // BIF
  { building_code: "BIF", room: "1064", course: "ACCY 201", title: "Accounting I", days: [2, 4], start_hour: 9, start_min: 30, end_hour: 10, end_min: 45 },
  { building_code: "BIF", room: "1064", course: "FIN 221", title: "Corporate Finance", days: [1, 3, 5], start_hour: 11, start_min: 0, end_hour: 11, end_min: 50 },
  { building_code: "BIF", room: "2060", course: "BADM 310", title: "Management & Organizational Behavior", days: [2, 4], start_hour: 14, start_min: 0, end_hour: 15, end_min: 15 },

  // Engineering Hall (EH)
  { building_code: "EH", room: "106B1", course: "TAM 211", title: "Statics", days: [1, 3, 5], start_hour: 8, start_min: 0, end_hour: 8, end_min: 50 },
  { building_code: "EH", room: "106B1", course: "TAM 212", title: "Introductory Dynamics", days: [2, 4], start_hour: 10, start_min: 0, end_hour: 11, end_min: 15 },

  // Natural History Building (NHB)
  { building_code: "NHB", room: "2079", course: "IB 150", title: "Organismal & Evolutionary Biology", days: [2, 4], start_hour: 9, start_min: 30, end_hour: 10, end_min: 45 },
  { building_code: "NHB", room: "2079", course: "GEOL 107", title: "Physical Geology", days: [1, 3, 5], start_hour: 13, start_min: 0, end_hour: 13, end_min: 50 },

  // Foreign Languages Building (FLB)
  { building_code: "FLB", room: "G27", course: "SPAN 141", title: "Intro to Spanish", days: [1, 2, 3, 4, 5], start_hour: 10, start_min: 0, end_hour: 10, end_min: 50 },
  { building_code: "FLB", room: "G27", course: "FR 101", title: "Elementary French I", days: [1, 2, 3, 4, 5], start_hour: 12, start_min: 0, end_hour: 12, end_min: 50 },

  // Campus Instructional Facility (CIF)
  { building_code: "CIF", room: "0027", course: "CS 411", title: "Database Systems", days: [2, 4], start_hour: 11, start_min: 0, end_hour: 12, end_min: 15 },
  { building_code: "CIF", room: "0027", course: "IS 305", title: "Information Assurance", days: [1, 3, 5], start_hour: 15, start_min: 0, end_hour: 15, end_min: 50 },
  { building_code: "CIF", room: "3039", course: "CS 461", title: "Computer Security", days: [2, 4], start_hour: 9, start_min: 30, end_hour: 10, end_min: 45 },

  // Education Building (EDU)
  { building_code: "EDU", room: "22", course: "EPSY 201", title: "Educational Psychology", days: [2, 4], start_hour: 11, start_min: 0, end_hour: 12, end_min: 15 },

  // Psychology Building (PSYCH)
  { building_code: "PSYCH", room: "21", course: "PSYC 224", title: "Cognitive Psychology", days: [1, 3, 5], start_hour: 10, start_min: 0, end_hour: 10, end_min: 50 },
  { building_code: "PSYCH", room: "21", course: "PSYC 238", title: "Psychopathology", days: [2, 4], start_hour: 14, start_min: 0, end_hour: 15, end_min: 15 },

  // Everitt Lab (EVER)
  { building_code: "EVER", room: "1306", course: "ECE 120", title: "Intro to Computing", days: [1, 3, 5], start_hour: 9, start_min: 0, end_hour: 9, end_min: 50 },

  // Davenport Hall (DAV)
  { building_code: "DAV", room: "135", course: "ANTH 101", title: "Intro to Anthropology", days: [2, 4], start_hour: 10, start_min: 0, end_hour: 11, end_min: 15 },

  // Wohlers Hall (WOH)
  { building_code: "WOH", room: "100", course: "ECON 103", title: "Macroeconomic Principles", days: [1, 3, 5], start_hour: 11, start_min: 0, end_hour: 11, end_min: 50 },
];

/**
 * Check if a class is currently in session for a given building code and room number.
 * Returns the matching class session, or null.
 */
export function getActiveClass(
  buildingCode: string,
  roomNumber: string,
  now?: Date
): ClassSession | null {
  const d = now ?? new Date();
  const dayOfWeek = d.getDay();
  const currentMinutes = d.getHours() * 60 + d.getMinutes();

  const normalized = roomNumber.trim().toUpperCase();

  return (
    CLASS_SCHEDULES.find((s) => {
      if (s.building_code !== buildingCode) return false;
      if (s.room.toUpperCase() !== normalized) return false;
      if (!s.days.includes(dayOfWeek)) return false;
      const startMin = s.start_hour * 60 + s.start_min;
      const endMin = s.end_hour * 60 + s.end_min;
      return currentMinutes >= startMin && currentMinutes < endMin;
    }) ?? null
  );
}

/**
 * Get the next upcoming class for a given building code and room.
 * Useful to show "next class at..." even if nothing is running now.
 */
export function getNextClass(
  buildingCode: string,
  roomNumber: string,
  now?: Date
): ClassSession | null {
  const d = now ?? new Date();
  const dayOfWeek = d.getDay();
  const currentMinutes = d.getHours() * 60 + d.getMinutes();

  const normalized = roomNumber.trim().toUpperCase();

  const todayUpcoming = CLASS_SCHEDULES
    .filter((s) => {
      if (s.building_code !== buildingCode) return false;
      if (s.room.toUpperCase() !== normalized) return false;
      if (!s.days.includes(dayOfWeek)) return false;
      const startMin = s.start_hour * 60 + s.start_min;
      return startMin > currentMinutes;
    })
    .sort((a, b) => (a.start_hour * 60 + a.start_min) - (b.start_hour * 60 + b.start_min));

  return todayUpcoming[0] ?? null;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

export function formatClassTime(session: ClassSession): string {
  const sh = session.start_hour % 12 || 12;
  const sa = session.start_hour < 12 ? "AM" : "PM";
  const eh = session.end_hour % 12 || 12;
  const ea = session.end_hour < 12 ? "AM" : "PM";
  return `${sh}:${pad(session.start_min)} ${sa} – ${eh}:${pad(session.end_min)} ${ea}`;
}
