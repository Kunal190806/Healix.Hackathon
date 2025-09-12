

export type UserProfile = {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
}

export type Prescription = {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  time?: string;
};

export type PainLog = {
  id: string;
  userId: string;
  level: number;
  symptoms: string;
  date: string;
};

export type JournalEntry = {
  id: string;
  userId: string;
  content: string;
  date: string;
};

export type SupportPost = {
  id: string;
  content: string;
  date: string;
  author: string;
};

export type BloodDonor = {
  id: string;
  name: string;
  bloodType: string;
  location: string;
};

export type FitnessTrainer = {
  id: string;
  name: string;
  skills: string;
  availability: string;
  location: string;
};

export type Hospital = {
  id: string;
  name: string;
  city: string;
  specialty: string;
  address: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  city: string;
  fees: number;
  hospital: string;
  bio: string;
  image: string;
};

export type VitalLog = {
  id: string;
  userId: string;
  date: string;
  bloodPressure?: { systolic: number; diastolic: number };
  bloodSugar?: number;
  heartRate?: number;
  weight?: number;
  notes?: string;
};

export type Appointment = {
  id: string;
  userId: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: "Confirmed" | "Cancelled" | "Completed";
};

export type HearingResult = {
  frequency: number;
  decibel: number | null;
  ear: 'left' | 'right';
};

export type HearingTestRecord = {
    userId: string;
    results: HearingResult[];
    date: string;
};

export type EyeTestResult = {
    userId: string;
    score: string;
    interpretation: string;
    date: string;
};

export type ResponseTimeResult = {
    userId: string;
    average: number;
    scores: number[];
    date: string;
};
