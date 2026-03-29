import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Zap, 
  Star, 
  Coins, 
  Skull, 
  MessageSquare, 
  Settings, 
  Map as MapIcon, 
  Store, 
  Users,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Terminal,
  Ghost,
  Heart,
  RefreshCw,
  Flame,
  Coffee,
  Sword,
  Compass,
  Mountain,
  Waves,
  Trees,
  ShieldCheck,
  Tag,
  Wand2,
  Crosshair,
  Activity,
  Sword as SwordIcon,
  Flame as FlameIcon,
  Trophy,
  Dices
} from 'lucide-react';
import { GameState, Message, Transaction, Protocol, Tab, BazaarItem, GuildMember, GuildPerk, ClassPassive, LoanBoss } from './types';
import { HandlerAI } from './services/aiService';

const INITIAL_STATE: GameState = {
  hp: 85,
  maxHp: 100,
  xp: 12400,
  maxXp: 15000,
  level: 750,
  gp: 2450.00,
  debt: 15000.00,
  maxDebt: 50000.00,
  monthlyBudget: 1200.00,
  spent: 850.00,
  protocol: 'Paladin',
  isGhostMode: false,
  activeTab: 'Status',
  activeLoanBoss: {
    id: 1,
    name: "The Interest Titan",
    totalAmount: 5000,
    remainingAmount: 3200,
    lastPayment: 0,
    isDefeated: false,
    type: 'Credit Card'
  },
  transactions: [
    { id: 1, merchant: "Amazon.com", amount: -42.50, category: "Wants", date: "2024-03-02" },
    { id: 2, merchant: "Employer Payroll", amount: 2100.00, category: "Income", date: "2024-03-01" },
    { id: 3, merchant: "Starbucks", amount: -6.50, category: "Wants", date: "2024-02-28" },
    { id: 4, merchant: "Rent Payment", amount: -1200.00, category: "Needs", date: "2024-02-27" }
  ]
};

const BAZAAR_ITEMS: BazaarItem[] = [
  { id: 1, name: 'Health Potion', description: 'Restores 50 HP. Essential for surviving a bad spending spree.', price: 100, type: 'Health', icon: 'Heart' },
  { id: 2, name: 'Revive Potion', description: 'Brings you back from Ghost Mode instantly.', price: 500, type: 'Revive', icon: 'RefreshCw' },
  { id: 3, name: 'Mana Potion', description: 'Restores 50 Stamina (Monthly Budget). Use wisely.', price: 200, type: 'Mana', icon: 'Zap' },
  { id: 4, name: 'Buff Potion', description: 'Grants 2x XP for the next 24 hours.', price: 150, type: 'Buff', icon: 'Flame' },
];

const GUILD_PERKS: GuildPerk[] = [
  { id: 1, name: 'Interest Shield', description: 'Reduces Debt Dragon interest damage by 15%.', unlockedAtLevel: 10, isActive: true, icon: 'ShieldCheck' },
  { id: 2, name: 'Loot Multiplier', description: 'Increases Data-Shard (GP) earnings from quests by 10%.', unlockedAtLevel: 25, isActive: true, icon: 'TrendingUp' },
  { id: 3, name: 'Ghost Resistance', description: 'Reduces Ghost Mode duration by 12 hours.', unlockedAtLevel: 40, isActive: true, icon: 'Zap' },
  { id: 4, name: 'Bazaar Discount', description: 'All items in the Bazaar cost 5% less GP.', unlockedAtLevel: 50, isActive: false, icon: 'Tag' },
];

const CLASS_PASSIVES: Record<Protocol, ClassPassive> = {
  Paladin: { name: 'Aegis of Credit', description: '15% reduction in Debt Dragon damage.', icon: 'Shield' },
  Mage: { name: 'Data Weaver', description: '10% bonus to GP from all sources.', icon: 'Wand2' },
  Healer: { name: 'Vitality Surge', description: '20% faster HP recovery from potions.', icon: 'Activity' },
  Assassin: { name: 'Critical Strike', description: '2x XP for $0 spend days, but 2x damage from overspending.', icon: 'Crosshair' },
};

const GUILD_MEMBERS: GuildMember[] = [
  { id: 1, name: 'Sir Save-a-Lot', rank: 'Guild Master', level: 750, isOnline: true },
  { id: 2, name: 'PennyPincher99', rank: 'Officer', level: 620, isOnline: true },
  { id: 3, name: 'DebtSlayer', rank: 'Veteran', level: 580, isOnline: false },
  { id: 4, name: 'FrugalFox', rank: 'Member', level: 410, isOnline: true },
  { id: 5, name: 'BudgetBlade', rank: 'Member', level: 350, isOnline: false },
  { id: 6, name: 'CryptoKnight', rank: 'Member', level: 290, isOnline: true },
  { id: 7, name: 'SavingsSamurai', rank: 'Member', level: 210, isOnline: false },
  { id: 8, name: 'ThriftyThief', rank: 'Member', level: 180, isOnline: true },
  { id: 9, name: 'CoinCollector', rank: 'Member', level: 150, isOnline: false },
  { id: 10, name: 'WealthWizard', rank: 'Member', level: 120, isOnline: true },
  // ... up to 20
].concat(Array.from({ length: 10 }, (_, i) => ({
  id: i + 11,
  name: `Netrunner_${i + 11}`,
  rank: 'Recruit',
  level: Math.floor(Math.random() * 100) + 1,
  isOnline: Math.random() > 0.5
})));

export default function App() {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Systems online, Netrunner. The Debt Dragon is breathing down our necks. What's the move?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiHandler = useRef(new HandlerAI());

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await aiHandler.current.chat(input, messages);
    const modelMsg: Message = { role: 'model', text: response, timestamp: Date.now() };
    setMessages(prev => [...prev, modelMsg]);
    setIsLoading(false);
  };

  const toggleGhostMode = () => {
    setState(prev => ({ ...prev, isGhostMode: !prev.isGhostMode }));
  };

  const handleAttackBoss = (amount: number) => {
    if (!state.activeLoanBoss || state.activeLoanBoss.isDefeated) return;

    const newRemaining = Math.max(0, state.activeLoanBoss.remainingAmount - amount);
    const isDefeated = newRemaining === 0;

    setState(prev => ({
      ...prev,
      gp: prev.gp - amount,
      debt: prev.debt - amount,
      xp: prev.xp + (amount * 2), // Bonus XP for attacking boss
      activeLoanBoss: prev.activeLoanBoss ? {
        ...prev.activeLoanBoss,
        remainingAmount: newRemaining,
        lastPayment: amount,
        isDefeated
      } : undefined
    }));

    // AI Handler reaction
    const bossMsg: Message = {
      role: 'model',
      text: isDefeated 
        ? `BOSS DEFEATED! The ${state.activeLoanBoss.name} has been purged from your ledger. Your credit score echoes in the halls of Valhalla!`
        : `CRITICAL HIT! You dealt ${amount} damage to ${state.activeLoanBoss.name}. Keep pushing, Netrunner!`,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, bossMsg]);
  };

  const renderStatus = () => (
    <>
      {/* Level Banner */}
      <div className="mt-4 py-2 bg-neon-green/10 border-y border-neon-green/30 flex justify-center items-center gap-4 relative">
        <span className="text-yellow-400 font-bold text-xs tracking-widest">LVL. {state.level}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xs tracking-widest uppercase">{state.protocol} Warrior</span>
          <button 
            onClick={() => setIsClassModalOpen(true)}
            className="p-1 bg-white/10 rounded hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-neon-green" />
          </button>
        </div>
      </div>

      {/* Class Passive Card */}
      <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3">
        <div className="p-2 bg-neon-blue/20 rounded-lg">
          {state.protocol === 'Paladin' && <Shield className="w-5 h-5 text-neon-blue" />}
          {state.protocol === 'Mage' && <Wand2 className="w-5 h-5 text-neon-blue" />}
          {state.protocol === 'Healer' && <Activity className="w-5 h-5 text-neon-blue" />}
          {state.protocol === 'Assassin' && <Crosshair className="w-5 h-5 text-neon-blue" />}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neon-blue">{CLASS_PASSIVES[state.protocol].name}</p>
          <p className="text-[9px] text-white/60 leading-tight">{CLASS_PASSIVES[state.protocol].description}</p>
        </div>
      </div>

      {/* Avatar & GP Section */}
      <div className="relative py-8 flex flex-col items-center">
        <div className="absolute top-0 right-4 flex flex-col items-end">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-[0_4px_0_0_#854d0e]">
              <Coins className="w-5 h-5 text-yellow-900" />
            </div>
            <span className="text-xl font-bold text-yellow-500 tracking-tight">{state.gp.toFixed(2)} GP</span>
          </div>
        </div>

        <div className="relative group">
          <div className="w-40 h-40 bg-cyber-gray rounded-2xl border-4 border-neon-green/40 p-2 shadow-2xl overflow-hidden relative">
            <img 
              src="https://picsum.photos/seed/cyberpunk-avatar/400/400" 
              alt="Netrunner Avatar" 
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyber-black/60 to-transparent" />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-neon-green text-cyber-black px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">
            Sir Save-a-Lot
          </div>
        </div>
        
        <p className="mt-6 text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium">
          Grand Treasurer of the Digital Realm
        </p>
      </div>

      {/* Stats Bars */}
      <div className="space-y-6 mt-4">
        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-green" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Stamina (Monthly Budget)</span>
            </div>
            <span className="text-[10px] font-mono text-neon-green">{state.spent} / {state.monthlyBudget} MP</span>
          </div>
          <div className="h-3 w-full bg-cyber-gray rounded-full border border-white/5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(state.spent / state.monthlyBudget) * 100}%` }}
              className="h-full bg-neon-green shadow-[0_0_15px_rgba(37,244,106,0.5)]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">EXP (Savings Goal)</span>
            </div>
            <span className="text-[10px] font-mono text-yellow-500">{state.xp} / {state.maxXp} XP</span>
          </div>
          <div className="h-3 w-full bg-cyber-gray rounded-full border border-white/5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(state.xp / state.maxXp) * 100}%` }}
              className="h-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]"
            />
          </div>
        </div>
      </div>

      {/* Debt Dragon Visualization */}
      <div className="mt-10 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2">
          <Skull className="w-4 h-4 text-red-500/40" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">The Debt Dragon</h3>
          <span className="text-[10px] font-mono text-red-400">HP: {state.debt.toLocaleString()}</span>
        </div>
        <div className="h-2 w-full bg-cyber-gray rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${(state.debt / state.maxDebt) * 100}%` }}
            className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          />
        </div>
        <p className="text-[10px] text-white/40 leading-relaxed italic">
          The beast grows with every credit swipe. Pay it down to land a critical hit.
        </p>
      </div>

      {/* Personal Boss Fight Section */}
      {state.activeLoanBoss && (
        <div className="mt-10 p-6 bg-cyber-gray border-2 border-neon-blue/30 rounded-3xl relative overflow-hidden shadow-[0_0_30px_rgba(0,243,255,0.1)]">
          <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-neon-blue/20 rounded-2xl border border-neon-blue/30">
                  <SwordIcon className={`w-6 h-6 ${state.activeLoanBoss.isDefeated ? 'text-white/20' : 'text-neon-blue animate-pulse'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-white">Personal Boss</h3>
                  <p className="text-[10px] text-neon-blue font-mono uppercase">{state.activeLoanBoss.name}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-white/40 uppercase tracking-widest">Type: {state.activeLoanBoss.type}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Boss Integrity</span>
                <span className="text-[10px] font-mono text-neon-blue">
                  {state.activeLoanBoss.remainingAmount.toLocaleString()} / {state.activeLoanBoss.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="h-4 w-full bg-cyber-black rounded-full border border-white/5 overflow-hidden p-0.5">
                <motion.div 
                  initial={{ width: '100%' }}
                  animate={{ width: `${(state.activeLoanBoss.remainingAmount / state.activeLoanBoss.totalAmount) * 100}%` }}
                  className={`h-full rounded-full shadow-[0_0_15px_rgba(0,243,255,0.5)] transition-colors ${
                    state.activeLoanBoss.isDefeated ? 'bg-white/10' : 'bg-neon-blue'
                  }`}
                />
              </div>

              {state.activeLoanBoss.isDefeated ? (
                <div className="py-4 flex flex-col items-center gap-2">
                  <Trophy className="w-12 h-12 text-yellow-500 animate-bounce" />
                  <p className="text-xs font-bold text-yellow-500 uppercase tracking-[0.2em]">Boss Vanquished</p>
                  <p className="text-[10px] text-white/40 text-center">Your financial discipline has shattered this debt.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => handleAttackBoss(100)}
                    disabled={state.gp < 100}
                    className="py-3 bg-neon-blue/20 border border-neon-blue/40 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-neon-blue/30 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    <SwordIcon className="w-3 h-3" />
                    Strike (100 GP)
                  </button>
                  <button 
                    onClick={() => handleAttackBoss(500)}
                    disabled={state.gp < 500}
                    className="py-3 bg-neon-blue text-cyber-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-neon-blue/80 transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                  >
                    <FlameIcon className="w-3 h-3" />
                    Heavy Hit (500 GP)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transaction Log */}
      <div className="mt-10 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Recent Loot Log</h3>
          <button className="text-[9px] font-bold uppercase tracking-widest text-neon-green">View All</button>
        </div>
        <div className="space-y-2">
          {state.transactions.map((t) => (
            <div key={t.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${t.amount > 0 ? 'bg-neon-green/20' : 'bg-red-500/20'}`}>
                  {t.amount > 0 ? <TrendingUp className="w-4 h-4 text-neon-green" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                </div>
                <div>
                  <p className="text-xs font-bold">{t.merchant}</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-tighter">{t.category} • {t.date}</p>
                </div>
              </div>
              <p className={`text-xs font-mono font-bold ${t.amount > 0 ? 'text-neon-green' : 'text-red-500'}`}>
                {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)} GP
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderBazaar = () => (
    <div className="mt-6 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold tracking-widest uppercase text-yellow-500">The Bazaar</h2>
        <p className="text-[10px] text-white/40 uppercase tracking-widest">Exchange GP for essential gear</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {BAZAAR_ITEMS.map((item) => (
          <div key={item.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:border-yellow-500/50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center border border-yellow-500/20 group-hover:scale-110 transition-transform">
                {item.icon === 'Heart' && <Heart className="w-6 h-6 text-red-500" />}
                {item.icon === 'RefreshCw' && <RefreshCw className="w-6 h-6 text-neon-blue" />}
                {item.icon === 'Zap' && <Zap className="w-6 h-6 text-neon-green" />}
                {item.icon === 'Flame' && <Flame className="w-6 h-6 text-orange-500" />}
              </div>
              <div>
                <h3 className="text-sm font-bold">{item.name}</h3>
                <p className="text-[10px] text-white/40 leading-tight pr-4">{item.description}</p>
              </div>
            </div>
            <button className="flex flex-col items-center gap-1 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl hover:bg-yellow-500/40 transition-colors">
              <span className="text-xs font-bold text-yellow-500">{item.price} GP</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-yellow-500/60">Buy</span>
            </button>
          </div>
        ))}
      </div>

      <div className="p-4 bg-cyber-gray/50 border border-dashed border-white/10 rounded-2xl flex flex-col items-center gap-2">
        <Store className="w-8 h-8 text-white/10" />
        <p className="text-[9px] text-white/20 uppercase tracking-widest">New stock arriving in 14:22:05</p>
      </div>
    </div>
  );

  const renderGuild = () => (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-widest uppercase text-neon-pink">The Guild</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">20 / 20 Members • Level 42 Guild</p>
        </div>
        <div className="p-2 bg-neon-pink/20 rounded-lg border border-neon-pink/30">
          <Users className="w-6 h-6 text-neon-pink" />
        </div>
      </div>

      {/* Guild Raid Section */}
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-20">
          <SwordIcon className="w-12 h-12 text-red-500" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <FlameIcon className="w-4 h-4 text-red-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">Active Raid: The Interest Void</h3>
          </div>
          <p className="text-[10px] text-white/60 mb-4 leading-relaxed">
            Join your guildmates to suppress the global interest rate. Success grants 500 Data-Shards to all participants.
          </p>
          <div className="flex items-center gap-3">
            <button className="flex-1 py-2 bg-red-500 text-cyber-black font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-400 transition-colors">
              Join Raid
            </button>
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-cyber-black overflow-hidden bg-cyber-gray">
                  <img src={`https://picsum.photos/seed/raid-${i}/50/50`} alt="Raid Member" className="w-full h-full object-cover" />
                </div>
              ))}
              <div className="w-6 h-6 rounded-full border-2 border-cyber-black bg-white/10 flex items-center justify-center text-[8px] font-bold">
                +12
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guild Perks Section */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Active Guild Perks</h3>
        <div className="grid grid-cols-1 gap-2">
          {GUILD_PERKS.map((perk) => (
            <div key={perk.id} className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
              perk.isActive 
                ? 'bg-neon-pink/5 border-neon-pink/20' 
                : 'bg-white/5 border-white/5 opacity-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${perk.isActive ? 'bg-neon-pink/20' : 'bg-white/10'}`}>
                  {perk.icon === 'ShieldCheck' && <ShieldCheck className={`w-4 h-4 ${perk.isActive ? 'text-neon-pink' : 'text-white/40'}`} />}
                  {perk.icon === 'TrendingUp' && <TrendingUp className={`w-4 h-4 ${perk.isActive ? 'text-neon-pink' : 'text-white/40'}`} />}
                  {perk.icon === 'Zap' && <Zap className={`w-4 h-4 ${perk.isActive ? 'text-neon-pink' : 'text-white/40'}`} />}
                  {perk.icon === 'Tag' && <Tag className={`w-4 h-4 ${perk.isActive ? 'text-neon-pink' : 'text-white/40'}`} />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold">{perk.name}</p>
                    {!perk.isActive && (
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/40">LVL {perk.unlockedAtLevel}</span>
                    )}
                  </div>
                  <p className="text-[9px] text-white/40 leading-tight">{perk.description}</p>
                </div>
              </div>
              {perk.isActive && (
                <div className="w-1.5 h-1.5 bg-neon-pink rounded-full shadow-[0_0_8px_rgba(255,0,255,0.8)]" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">Guild Members</h3>
        <div className="space-y-2">
          {GUILD_MEMBERS.map((member) => (
            <div key={member.id} className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-cyber-gray rounded-lg border border-white/10 overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/guild-${member.id}/100/100`} 
                      alt={member.name} 
                      className="w-full h-full object-cover opacity-60"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  {member.isOnline && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full border-2 border-cyber-black" />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold">{member.name}</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-tighter">{member.rank} • LVL {member.level}</p>
                </div>
              </div>
              <button className="p-2 text-white/20 hover:text-neon-pink transition-colors">
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMap = () => (
    <div className="mt-6 space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold tracking-widest uppercase text-orange-200/80 font-serif italic">Legacy Data Map</h2>
        <p className="text-[9px] text-orange-200/40 uppercase tracking-widest font-serif">The Realm of Middle-Finance</p>
      </div>

      <div className="relative aspect-[3/4] w-full bg-[#e6d5b8] rounded-2xl border-4 border-[#8b7355] shadow-2xl overflow-hidden p-6 font-serif text-[#5d4037]">
        {/* Parchment Texture Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/parchment.png")' }} />
        
        {/* Map Elements */}
        <div className="relative h-full w-full border border-[#8b7355]/30 rounded-lg p-4">
          <div className="absolute top-10 left-10 flex flex-col items-center gap-1 group cursor-pointer">
            <Mountain className="w-8 h-8 text-[#8b7355]" />
            <span className="text-[10px] font-bold uppercase tracking-tighter group-hover:scale-110 transition-transform">The Peaks of Profit</span>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 group cursor-pointer">
            <div className="relative">
              <Skull className="w-12 h-12 text-red-900/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-red-600 rounded-full animate-ping" />
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter text-red-900 group-hover:scale-110 transition-transform">Mordor of Debt</span>
          </div>

          <div className="absolute bottom-20 right-10 flex flex-col items-center gap-1 group cursor-pointer">
            <Trees className="w-8 h-8 text-[#4a5d23]" />
            <span className="text-[10px] font-bold uppercase tracking-tighter group-hover:scale-110 transition-transform">The Shire of Savings</span>
          </div>

          <div className="absolute top-1/4 right-1/4 flex flex-col items-center gap-1 group cursor-pointer">
            <Waves className="w-8 h-8 text-[#4682b4]" />
            <span className="text-[10px] font-bold uppercase tracking-tighter group-hover:scale-110 transition-transform">The Sea of Solvency</span>
          </div>

          <div className="absolute bottom-10 left-20 flex flex-col items-center gap-1 group cursor-pointer">
            <Compass className="w-6 h-6 text-[#8b7355] animate-[spin_10s_linear_infinite]" />
            <span className="text-[8px] font-bold uppercase tracking-widest">True North</span>
          </div>

          {/* Decorative Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 100 100">
            <path d="M10,10 Q50,30 90,10" fill="none" stroke="#8b7355" strokeWidth="0.5" strokeDasharray="2,2" />
            <path d="M10,90 Q50,70 90,90" fill="none" stroke="#8b7355" strokeWidth="0.5" strokeDasharray="2,2" />
            <path d="M10,10 Q30,50 10,90" fill="none" stroke="#8b7355" strokeWidth="0.5" strokeDasharray="2,2" />
            <path d="M90,10 Q70,50 90,90" fill="none" stroke="#8b7355" strokeWidth="0.5" strokeDasharray="2,2" />
          </svg>
        </div>

        {/* Compass Rose */}
        <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-[#8b7355] rounded-full flex items-center justify-center opacity-40">
          <div className="w-1 h-full bg-[#8b7355] absolute rotate-45" />
          <div className="w-1 h-full bg-[#8b7355] absolute -rotate-45" />
          <div className="w-full h-1 bg-[#8b7355] absolute" />
          <div className="w-1 h-full bg-[#8b7355] absolute" />
        </div>
      </div>

      <div className="p-4 bg-orange-200/5 border border-orange-200/10 rounded-2xl">
        <p className="text-[10px] text-orange-200/60 leading-relaxed italic font-serif">
          "Not all those who wander are lost, but those who overspend definitely are." 
          <br />— Gandalf the Green (Budgeter)
        </p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex flex-col max-w-[430px] mx-auto border-x border-white/5 relative overflow-hidden ${state.isGhostMode ? 'ghost-mode' : ''}`}>
      <div className="scanline" />
      
      {/* Header HUD */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-20 bg-cyber-black/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-green/20 rounded-lg border border-neon-green/30">
            <Shield className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-widest uppercase">Hero's Status</h1>
            <p className="text-[10px] text-neon-green font-mono uppercase tracking-tighter">Rank: Mythic Saver</p>
          </div>
        </div>
        <button 
          onClick={toggleGhostMode}
          className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
        >
          <Settings className="w-5 h-5 text-white/60" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {state.activeTab === 'Status' && renderStatus()}
            {state.activeTab === 'Bazaar' && renderBazaar()}
            {state.activeTab === 'Guild' && renderGuild()}
            {state.activeTab === 'Map' && renderMap()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 w-full max-w-[430px] bg-cyber-black/90 backdrop-blur-xl border-t border-white/5 px-6 pb-8 pt-4 flex justify-between items-center z-30">
        <button 
          onClick={() => setState(prev => ({ ...prev, activeTab: 'Status' }))}
          className={`flex flex-col items-center gap-1 transition-colors ${state.activeTab === 'Status' ? 'text-neon-green' : 'text-white/40'}`}
        >
          <Shield className="w-6 h-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Status</span>
        </button>
        <button 
          onClick={() => setState(prev => ({ ...prev, activeTab: 'Map' }))}
          className={`flex flex-col items-center gap-1 transition-colors ${state.activeTab === 'Map' ? 'text-neon-blue' : 'text-white/40'}`}
        >
          <MapIcon className="w-6 h-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Map</span>
        </button>
        <button 
          onClick={() => setIsChatOpen(true)}
          className="w-14 h-14 -mt-10 bg-neon-green rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(37,244,106,0.4)] border-4 border-cyber-black hover:scale-110 transition-transform"
        >
          <MessageSquare className="w-6 h-6 text-cyber-black" />
        </button>
        <button 
          onClick={() => setState(prev => ({ ...prev, activeTab: 'Bazaar' }))}
          className={`flex flex-col items-center gap-1 transition-colors ${state.activeTab === 'Bazaar' ? 'text-yellow-500' : 'text-white/40'}`}
        >
          <Store className="w-6 h-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Bazaar</span>
        </button>
        <button 
          onClick={() => setState(prev => ({ ...prev, activeTab: 'Guild' }))}
          className={`flex flex-col items-center gap-1 transition-colors ${state.activeTab === 'Guild' ? 'text-neon-pink' : 'text-white/40'}`}
        >
          <Users className="w-6 h-6" />
          <span className="text-[8px] font-bold uppercase tracking-widest">Guild</span>
        </button>
      </nav>

      {/* AI Handler Chat Modal */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-0 z-50 bg-cyber-black flex flex-col max-w-[430px] mx-auto"
          >
            <header className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-neon-green/20 rounded-full flex items-center justify-center border border-neon-green/30">
                  <Terminal className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-widest uppercase">The Handler</h2>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
                    <span className="text-[8px] text-neon-green font-mono uppercase">Link Established</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-2 text-white/40 hover:text-white"
              >
                <ChevronRight className="w-6 h-6 rotate-90" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-neon-green text-cyber-black font-bold' 
                      : 'bg-white/5 border border-white/10 text-white font-mono'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 p-3 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 bg-neon-green rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-neon-green rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-neon-green rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-cyber-black">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type command..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-xs focus:outline-none focus:border-neon-green transition-colors font-mono"
                />
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neon-green disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ghost Mode Overlay */}
      <AnimatePresence>
        {state.isGhostMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none bg-cyber-black/20 backdrop-grayscale"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Ghost className="w-20 h-20 text-white/20 animate-pulse" />
                <h2 className="text-2xl font-bold tracking-[0.5em] uppercase text-white/20 glitch-text">Ghost Mode</h2>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Class Change Modal */}
      <AnimatePresence>
        {isClassModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-cyber-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="w-full max-w-sm bg-cyber-gray border border-white/10 rounded-3xl p-6 space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold tracking-widest uppercase text-neon-green">Class Selection</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">Choose your financial protocol</p>
              </div>

              <div className="space-y-3">
                {(Object.keys(CLASS_PASSIVES) as Protocol[]).map((p) => (
                  <button 
                    key={p}
                    onClick={() => {
                      setState(prev => ({ ...prev, protocol: p }));
                      setIsClassModalOpen(false);
                    }}
                    className={`w-full p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                      state.protocol === p 
                        ? 'bg-neon-green/10 border-neon-green shadow-[0_0_15px_rgba(37,244,106,0.2)]' 
                        : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${state.protocol === p ? 'bg-neon-green/20' : 'bg-white/10'}`}>
                      {p === 'Paladin' && <Shield className={`w-6 h-6 ${state.protocol === p ? 'text-neon-green' : 'text-white/40'}`} />}
                      {p === 'Mage' && <Wand2 className={`w-6 h-6 ${state.protocol === p ? 'text-neon-green' : 'text-white/40'}`} />}
                      {p === 'Healer' && <Activity className={`w-6 h-6 ${state.protocol === p ? 'text-neon-green' : 'text-white/40'}`} />}
                      {p === 'Assassin' && <Crosshair className={`w-6 h-6 ${state.protocol === p ? 'text-neon-green' : 'text-white/40'}`} />}
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${state.protocol === p ? 'text-neon-green' : 'text-white'}`}>{p}</p>
                      <p className="text-[9px] text-white/40 leading-tight">{CLASS_PASSIVES[p].description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setIsClassModalOpen(false)}
                className="w-full py-3 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
