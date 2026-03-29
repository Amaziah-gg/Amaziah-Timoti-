export type Protocol = 'Paladin' | 'Mage' | 'Healer' | 'Assassin';

export interface ClassPassive {
  name: string;
  description: string;
  icon: string;
}

export interface Transaction {
  id: number;
  merchant: string;
  amount: number;
  category: 'Needs' | 'Wants' | 'Income';
  date: string;
}

export interface BazaarItem {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'Health' | 'Revive' | 'Mana' | 'Buff';
  icon: string;
}

export interface GuildMember {
  id: number;
  name: string;
  rank: string;
  level: number;
  isOnline: boolean;
}

export interface GuildPerk {
  id: number;
  name: string;
  description: string;
  unlockedAtLevel: number;
  isActive: boolean;
  icon: string;
}

export type Tab = 'Status' | 'Map' | 'Bazaar' | 'Guild';

export interface LoanBoss {
  id: number;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  lastPayment: number;
  isDefeated: boolean;
  type: 'Credit Card' | 'Student Loan' | 'Auto Loan' | 'Mortgage';
}

export interface GameState {
  hp: number;
  maxHp: number;
  xp: number;
  maxXp: number;
  level: number;
  gp: number;
  debt: number;
  maxDebt: number;
  monthlyBudget: number;
  spent: number;
  protocol: Protocol;
  isGhostMode: boolean;
  transactions: Transaction[];
  activeTab: Tab;
  activeLoanBoss?: LoanBoss;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
