export type Prescription = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
};

export type PainLog = {
  id: string;
  level: number;
  symptoms: string;
  date: string;
};

export type JournalEntry = {
  id: string;
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
