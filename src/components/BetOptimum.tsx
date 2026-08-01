import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Target, Wallet, History, TrendingUp, BarChart3, 
  Globe, Zap, Clock, CheckCircle2, XCircle, AlertCircle,
  ArrowRightLeft, Plus, Info, ShieldCheck, ChevronRight,
  Search, Filter, Activity, CreditCard, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { 
  collection, addDoc, onSnapshot, query, where, orderBy, 
  Timestamp, doc, updateDoc, increment, limit 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface Match {
  id: string;
  league: string;
  region: 'European' | 'American' | 'Asian' | 'African' | 'International';
  homeTeam: string;
  awayTeam: string;
  startTime: any;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
  status: 'upcoming' | 'live' | 'finished';
  score?: { home: number; away: number };
}

interface BetSelection {
  matchId: string;
  prediction: 'home' | 'draw' | 'away';
  odds: number;
  matchInfo: string;
}

interface Bet {
  id: string;
  userId: string;
  selections: BetSelection[];
  amount: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost';
  correctCount: number;
  payout: number;
  createdAt: any;
}

const BET_AMOUNTS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];
const MAX_BET_AMOUNT = 1000;

const LEAGUES = [
  { name: 'Premier League', region: 'European' },
  { name: 'La Liga', region: 'European' },
  { name: 'Bundesliga', region: 'European' },
  { name: 'Serie A', region: 'European' },
  { name: 'Ligue 1', region: 'European' },
  { name: 'MLS', region: 'American' },
  { name: 'Liga MX', region: 'American' },
  { name: 'J1 League', region: 'Asian' },
  { name: 'K League 1', region: 'Asian' },
  { name: 'Eredivisie', region: 'European' },
  { name: 'Primeira Liga', region: 'European' },
  { name: 'Super Lig', region: 'European' },
  { name: 'Copa Libertadores', region: 'International' },
  { name: 'Champions League', region: 'International' },
  { name: 'Europa League', region: 'International' },
  { name: 'CAF Champions League', region: 'International' },
  { name: 'NPFL', region: 'African' },
  { name: 'South African PSL', region: 'African' },
  { name: 'Egyptian Premier League', region: 'African' },
  { name: 'Argentine Primera', region: 'American' },
  { name: 'Brasileirão', region: 'American' },
  { name: 'A-League', region: 'Asian' },
  { name: 'Saudi Pro League', region: 'Asian' },
  { name: 'Chinese Super League', region: 'Asian' },
  { name: 'Scottish Premiership', region: 'European' },
  { name: 'Belgian Pro League', region: 'European' },
  { name: 'Swiss Super League', region: 'European' },
  { name: 'Austrian Bundesliga', region: 'European' },
  { name: 'Greek Super League', region: 'European' },
  { name: 'Russian Premier League', region: 'European' },
  { name: 'Ukrainian Premier League', region: 'European' },
  { name: 'Czech First League', region: 'European' },
  { name: 'Danish Superliga', region: 'European' },
  { name: 'Norwegian Eliteserien', region: 'European' },
  { name: 'Swedish Allsvenskan', region: 'European' },
  { name: 'Polish Ekstraklasa', region: 'European' },
  { name: 'Croatian First League', region: 'European' },
  { name: 'Serbian SuperLiga', region: 'European' },
  { name: 'Romanian Liga I', region: 'European' },
  { name: 'Bulgarian First League', region: 'European' },
  { name: 'Hungarian NB I', region: 'European' },
  { name: 'Slovak Super Liga', region: 'European' },
  { name: 'Slovenian PrvaLiga', region: 'European' },
  { name: 'Israeli Premier League', region: 'Asian' },
  { name: 'Cypriot First Division', region: 'European' },
  { name: 'Azerbaijan Premier League', region: 'Asian' },
  { name: 'Kazakhstan Premier League', region: 'Asian' },
  { name: 'Indian Super League', region: 'Asian' },
  { name: 'Thai League 1', region: 'Asian' },
  { name: 'Vietnamese V.League 1', region: 'Asian' },
  { name: 'Indonesian Liga 1', region: 'Asian' },
  { name: 'Malaysian Super League', region: 'Asian' },
  { name: 'Australian A-League', region: 'Asian' },
  { name: 'New Zealand National League', region: 'Asian' },
  { name: 'South African Premier Division', region: 'African' },
  { name: 'Moroccan Botola', region: 'African' },
  { name: 'Tunisian Ligue Professionnelle 1', region: 'African' },
  { name: 'Algerian Ligue Professionnelle 1', region: 'African' },
  { name: 'Ghanaian Premier League', region: 'African' },
  { name: 'Kenyan Premier League', region: 'African' },
  { name: 'Zambian Super League', region: 'African' },
  { name: 'Angolan Girabola', region: 'African' },
  { name: 'Ivorian Ligue 1', region: 'African' },
  { name: 'Senegalese Ligue 1', region: 'African' },
  { name: 'Cameroonian Elite One', region: 'African' },
  { name: 'Malian Première Division', region: 'African' },
  { name: 'Guinean Championnat National', region: 'African' },
  { name: 'Congolese Linafoot', region: 'African' },
  { name: 'Ugandan Premier League', region: 'African' },
  { name: 'Tanzanian Premier League', region: 'African' },
  { name: 'Sudanese Premier League', region: 'African' },
  { name: 'Libyan Premier League', region: 'African' },
  { name: 'Ethiopian Premier League', region: 'African' },
  { name: 'Zimbabwean Premier Soccer League', region: 'African' },
  { name: 'Namibian Premier Football League', region: 'African' },
  { name: 'Botswana Premier League', region: 'African' },
  { name: 'Malawian Super League', region: 'African' },
  { name: 'Mozambican Moçambola', region: 'African' },
  { name: 'Mauritian Premier League', region: 'African' },
  { name: 'Seychelles First Division', region: 'African' },
  { name: 'Madagascan Pro League', region: 'African' },
  { name: 'Reunion Premier League', region: 'African' },
  { name: 'Comorian Premier League', region: 'African' },
  { name: 'Cape Verdean Football Championship', region: 'African' },
  { name: 'Gambian GFA League First Division', region: 'African' },
  { name: 'Sierra Leone National Premier League', region: 'African' },
  { name: 'Liberian First Division', region: 'African' },
  { name: 'Togolese Championnat National', region: 'African' },
  { name: 'Beninese Championnat National', region: 'African' },
  { name: 'Nigerien Premier League', region: 'African' },
  { name: 'Burkinabé Premier League', region: 'African' },
  { name: 'Mauritanian Ligue 1', region: 'African' },
  { name: 'Chadian Premier League', region: 'African' },
  { name: 'Central African Republic League', region: 'African' },
  { name: 'Gabonese Championnat National D1', region: 'African' },
  { name: 'Equatoguinean Primera División', region: 'African' },
  { name: 'São Tomé and Príncipe Championship', region: 'African' },
  { name: 'Rwandan Premier League', region: 'African' },
  { name: 'Burundian Premier League', region: 'African' },
  { name: 'South Sudanese Premier League', region: 'African' },
  { name: 'Djiboutian Premier League', region: 'African' },
  { name: 'Somali First Division', region: 'African' },
  { name: 'Eritrean Premier League', region: 'African' },
  { name: 'Lesotho Premier League', region: 'African' },
  { name: 'Eswatini Premier League', region: 'African' },
  { name: 'Malagasy Pro League', region: 'African' },
  { name: 'Seychelles Premier League', region: 'African' },
  { name: 'Comoros Premier League', region: 'African' },
  { name: 'Mayotte Division d\'Honneur', region: 'African' },
  { name: 'Zanzibar Premier League', region: 'African' },
  { name: 'Saint Helena Football League', region: 'African' },
  { name: 'Ascension Island Football League', region: 'African' },
  { name: 'Tristan da Cunha Football League', region: 'African' },
  { name: 'Falkland Islands Football League', region: 'International' },
  { name: 'Greenlandic Football Championship', region: 'International' },
  { name: 'Faroe Islands Premier League', region: 'European' },
  { name: 'Icelandic Besta deild karla', region: 'European' },
  { name: 'Finnish Veikkausliiga', region: 'European' },
  { name: 'Estonian Meistriliiga', region: 'European' },
  { name: 'Latvian Higher League', region: 'European' },
  { name: 'Lithuanian A Lyga', region: 'European' },
  { name: 'Belarusian Premier League', region: 'European' },
  { name: 'Kazakhstan Premier League', region: 'Asian' },
  { name: 'Kyrgyz Premier League', region: 'Asian' },
  { name: 'Tajikistan Higher League', region: 'Asian' },
  { name: 'Turkmenistan Higher League', region: 'Asian' },
  { name: 'Uzbekistan Super League', region: 'Asian' },
  { name: 'Mongolian National Premier League', region: 'Asian' },
  { name: 'North Korean Hwaebul Cup', region: 'Asian' },
  { name: 'South Korean K League 1', region: 'Asian' },
  { name: 'Japanese J1 League', region: 'Asian' },
  { name: 'Chinese Super League', region: 'Asian' },
  { name: 'Hong Kong Premier League', region: 'Asian' },
  { name: 'Macau Elite League', region: 'Asian' },
  { name: 'Taiwan Football Premier League', region: 'Asian' },
  { name: 'Guam Soccer League', region: 'Asian' },
  { name: 'Northern Mariana Islands M*League', region: 'Asian' },
  { name: 'Philippine Football League', region: 'Asian' },
  { name: 'Cambodian Premier League', region: 'Asian' },
  { name: 'Lao League 1', region: 'Asian' },
  { name: 'Myanmar National League', region: 'Asian' },
  { name: 'Thai League 1', region: 'Asian' },
  { name: 'Malaysian Super League', region: 'Asian' },
  { name: 'Singapore Premier League', region: 'Asian' },
  { name: 'Brunei Super League', region: 'Asian' },
  { name: 'Indonesian Liga 1', region: 'Asian' },
  { name: 'Timor-Leste Liga Futebol Amadora', region: 'Asian' },
  { name: 'Australian A-League Men', region: 'Asian' },
  { name: 'Papua New Guinea National Soccer League', region: 'International' },
  { name: 'Solomon Islands S-League', region: 'International' },
  { name: 'Vanuatu Premia Divisen', region: 'International' },
  { name: 'Fiji Premier League', region: 'International' },
  { name: 'New Caledonia Super Ligue', region: 'International' },
  { name: 'Tahiti Ligue 1', region: 'International' },
  { name: 'Cook Islands Round Cup', region: 'International' },
  { name: 'Samoa National League', region: 'International' },
  { name: 'American Samoa Senior League', region: 'International' },
  { name: 'Tonga Major League', region: 'International' },
  { name: 'Tuvalu A-Division', region: 'International' },
  { name: 'Kiribati National Championship', region: 'International' },
  { name: 'Nauru Soccer League', region: 'International' },
  { name: 'Palau Soccer League', region: 'International' },
  { name: 'Federated States of Micronesia Football League', region: 'International' },
  { name: 'Marshall Islands Football League', region: 'International' },
  { name: 'Canadian Premier League', region: 'American' },
  { name: 'Major League Soccer', region: 'American' },
  { name: 'Liga MX', region: 'American' },
  { name: 'Guatemalan Liga Nacional', region: 'American' },
  { name: 'Belize Premier League', region: 'American' },
  { name: 'Honduran Liga Nacional', region: 'American' },
  { name: 'Salvadoran Primera División', region: 'American' },
  { name: 'Nicaraguan Primera División', region: 'American' },
  { name: 'Costa Rican Primera División', region: 'American' },
  { name: 'Panamanian Liga Panameña de Fútbol', region: 'American' },
  { name: 'Jamaican Premier League', region: 'American' },
  { name: 'Haitian Ligue Haïtienne', region: 'American' },
  { name: 'Dominican Liga Dominicana de Fútbol', region: 'American' },
  { name: 'Puerto Rico Soccer League', region: 'American' },
  { name: 'Cuban Campeonato Nacional', region: 'American' },
  { name: 'Trinidad and Tobago TT Premier Football League', region: 'American' },
  { name: 'Guyana GFF Elite League', region: 'American' },
  { name: 'Suriname Topklasse', region: 'American' },
  { name: 'French Guiana Honor Division', region: 'American' },
  { name: 'Colombian Categoría Primera A', region: 'American' },
  { name: 'Venezuelan Primera División', region: 'American' },
  { name: 'Ecuadorian Serie A', region: 'American' },
  { name: 'Peruvian Primera División', region: 'American' },
  { name: 'Bolivian Primera División', region: 'American' },
  { name: 'Chilean Primera División', region: 'American' },
  { name: 'Paraguayan Primera División', region: 'American' },
  { name: 'Uruguayan Primera División', region: 'American' },
  { name: 'Argentine Primera División', region: 'American' },
  { name: 'Brazilian Campeonato Brasileiro Série A', region: 'American' },
  { name: 'Copa America', region: 'International' },
  { name: 'Asian Cup', region: 'International' },
  { name: 'Africa Cup of Nations', region: 'International' },
  { name: 'Euro 2024', region: 'International' },
  { name: 'World Cup Qualifiers', region: 'International' },
  { name: 'Nations League', region: 'International' },
  { name: 'Club World Cup', region: 'International' },
  { name: 'Copa del Rey', region: 'European' },
  { name: 'FA Cup', region: 'European' },
  { name: 'DFB Pokal', region: 'European' },
  { name: 'Coppa Italia', region: 'European' },
  { name: 'Coupe de France', region: 'European' },
  { name: 'Carabao Cup', region: 'European' },
  { name: 'CONCACAF Champions Cup', region: 'International' },
  { name: 'AFC Champions League', region: 'International' },
];

const TEAMS = [
  'Arsenal', 'Liverpool', 'Man City', 'Man Utd', 'Chelsea', 'Tottenham',
  'Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Villarreal',
  'Bayern Munich', 'Dortmund', 'Leipzig', 'Leverkusen', 'Frankfurt',
  'Inter Milan', 'AC Milan', 'Juventus', 'Napoli', 'Roma', 'Lazio',
  'PSG', 'Marseille', 'Lyon', 'Monaco', 'Lille',
  'Ajax', 'PSV', 'Feyenoord', 'Benfica', 'Porto', 'Sporting CP',
  'LA Galaxy', 'Inter Miami', 'NY Red Bulls', 'Seattle Sounders',
  'Club America', 'Chivas', 'Cruz Azul', 'Pumas UNAM',
  'Vissel Kobe', 'Yokohama FM', 'Urawa Reds', 'Kawasaki Frontale',
  'Ulsan Hyundai', 'Jeonbuk', 'FC Seoul', 'Pohang Steelers',
  'Al Ahly', 'Zamalek', 'Mamelodi Sundowns', 'Orlando Pirates',
  'Enyimba', 'Kano Pillars', 'Rangers Intl', 'Rivers Utd',
  'Boca Juniors', 'River Plate', 'Flamengo', 'Palmeiras',
  'Al Hilal', 'Al Nassr', 'Al Ittihad', 'Sydney FC', 'Melbourne City',
  'Leicester City', 'Everton', 'West Ham', 'Aston Villa', 'Newcastle',
  'Real Sociedad', 'Athletic Bilbao', 'Valencia', 'Real Betis',
  'RB Leipzig', 'Bayer Leverkusen', 'Wolfsburg', 'Monchengladbach',
  'Lazio', 'Fiorentina', 'Atalanta', 'Sassuolo',
  'Lyon', 'Nice', 'Rennes', 'Lens',
  'Benfica', 'Porto', 'Sporting CP', 'Braga',
  'PSV', 'Ajax', 'Feyenoord', 'AZ Alkmaar',
  'Celtic', 'Rangers', 'Aberdeen', 'Hearts',
  'Galatasaray', 'Fenerbahce', 'Besiktas', 'Trabzonspor',
  'Olympiacos', 'PAOK', 'AEK Athens', 'Panathinaikos',
  'Zenit', 'Spartak Moscow', 'CSKA Moscow', 'Krasnodar',
  'Shakhtar Donetsk', 'Dynamo Kyiv', 'Dnipro-1',
  'Slavia Prague', 'Sparta Prague', 'Viktoria Plzen',
  'Copenhagen', 'Midtjylland', 'Brondby',
  'Bodo/Glimt', 'Molde', 'Rosenborg',
  'Malmo FF', 'Djurgarden', 'Hammarby',
  'Legia Warsaw', 'Lech Poznan', 'Rakow',
  'Dinamo Zagreb', 'Hajduk Split',
  'Red Star Belgrade', 'Partizan',
  'FCSB', 'CFR Cluj',
  'Ludogorets', 'CSKA Sofia',
  'Ferencvaros', 'MOL Vidi',
  'Slovan Bratislava',
  'Maribor', 'Olimpija Ljubljana',
  'Maccabi Haifa', 'Maccabi Tel Aviv',
  'APOEL', 'Omonia',
  'Qarabag', 'Neftchi',
  'Astana', 'Kairat',
  'Mumbai City', 'Mohun Bagan',
  'Buriram United', 'Pathum United',
  'Hanoi FC', 'Viettel',
  'Persib', 'Persija',
  'Johor Darul Ta\'zim',
  'Central Coast Mariners',
  'Auckland City',
  'Kaizer Chiefs', 'Sundowns',
  'Wydad AC', 'Raja Casablanca',
  'Esperance Tunis', 'Etoile du Sahel',
  'CR Belouizdad', 'JS Kabylie',
  'Asante Kotoko', 'Hearts of Oak',
  'Gor Mahia', 'AFC Leopards',
  'ZESCO United', 'Nkana',
  'Petro de Luanda', '1º de Agosto',
  'ASEC Mimosas', 'FC San Pedro',
  'Teungueth FC', 'ASC Diaraf',
  'Coton Sport', 'Canon Yaoundé',
  'Stade Malien', 'Djoliba AC',
  'Horoya AC', 'Hafia FC',
  'TP Mazembe', 'AS Vita Club',
  'Vipers SC', 'KCCA FC',
  'Simba SC', 'Young Africans',
  'Al-Merrikh', 'Al-Hilal Omdurman',
  'Al-Ittihad Tripoli', 'Al-Ahli Tripoli',
  'Saint George', 'Ethiopian Coffee',
  'Dynamos', 'Highlanders',
  'African Stars', 'Black Africa',
  'Township Rollers', 'Gaborone United',
  'Silver Strikers', 'Nyasa Big Bullets',
  'Costa do Sol', 'Ferroviário de Maputo',
  'Pamplemousses SC', 'ASPL 2000',
  'St Michel United', 'La Passe FC',
  'Fosa Juniors', 'CNaPS Sport',
  'JS Saint-Pierroise', 'AS Excelsior',
  'Volcan Club', 'US Zilimadjou',
  'Boavista FC', 'Sporting Praia',
  'Real de Banjul', 'Wallidan FC',
  'East End Lions', 'Mighty Blackpool',
  'LPRC Oilers', 'Mighty Barrolle',
  'ASKO Kara', 'ASC Kara',
  'Coton Sport Ouidah', 'Buffles du Borgou',
  'AS NIGELEC', 'AS GNN',
  'AS SONABEL', 'Etoile Filante',
  'FC Nouadhibou', 'ASAC Concorde',
  'AS CotonTchad', 'Elect-Sport',
];

const generateRandomMatch = (id: string): Match => {
  const leagueObj = LEAGUES[Math.floor(Math.random() * LEAGUES.length)];
  let homeTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
  let awayTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
  while (homeTeam === awayTeam) {
    awayTeam = TEAMS[Math.floor(Math.random() * TEAMS.length)];
  }

  const status = Math.random() > 0.8 ? 'live' : 'upcoming';
  const score = status === 'live' ? { home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 3) } : undefined;
  
  return {
    id,
    league: leagueObj.name,
    region: leagueObj.region as any,
    homeTeam,
    awayTeam,
    startTime: new Date(Date.now() + (Math.random() * 86400000) - 43200000),
    odds: {
      home: Number((1.2 + Math.random() * 4).toFixed(2)),
      draw: Number((2.5 + Math.random() * 3).toFixed(2)),
      away: Number((1.5 + Math.random() * 5).toFixed(2)),
    },
    status,
    score
  };
};

const INITIAL_MATCHES: Match[] = Array.from({ length: 30 }, (_, i) => generateRandomMatch(`m-${i}`));

export default function BetOptimum() {
  const { user } = useAuth();
  const { 
    betWalletBalance, 
    balance: centralBalance,
    depositToBetWallet, 
    transferFromBetWallet,
    updateBetWalletBalance 
  } = useWallet();

  const [activeSubTab, setActiveSubTab] = useState<'betting' | 'wallet' | 'history' | 'analysis' | 'leaderboard'>('betting');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [allMatches, setAllMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef(false);
  const [selections, setSelections] = useState<BetSelection[]>([]);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const loadMoreMatches = useCallback(() => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoadingMore(true);
    
    // Simulate network delay
    setTimeout(() => {
      setAllMatches(prev => {
        const newMatches = Array.from({ length: 10 }, (_, i) => 
          generateRandomMatch(`m-${prev.length + i}-${Math.random().toString(36).substring(2, 7)}`)
        );
        return [...prev, ...newMatches];
      });
      loadingRef.current = false;
      setIsLoadingMore(false);
    }, 1500);
  }, []);

  const [betAmount, setBetAmount] = useState<number>(1);
  const [betHistory, setBetHistory] = useState<Bet[]>([]);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [globalStats, setGlobalStats] = useState<{ userId: string; name: string; winnings: number; losses: number }[]>([]);
  const [transferType, setTransferType] = useState<'deposit' | 'withdraw'>('deposit');
  const [transferAmount, setTransferAmount] = useState('');
  const [nextSettlementTime, setNextSettlementTime] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const pendingBets = betHistory.filter(b => b.status === 'pending');
      if (pendingBets.length > 0) {
        // Find the bet that is closest to expiring
        const oldestBet = [...pendingBets].sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis())[0];
        const expiryTime = oldestBet.createdAt.toMillis() + (24 * 60 * 60 * 1000);
        const now = Date.now();
        const diff = expiryTime - now;

        if (diff <= 0) {
          setNextSettlementTime("Settling...");
          // Automatic settlement immediately after 24 hours
          settleBet(oldestBet, true);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setNextSettlementTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      } else {
        setNextSettlementTime(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [betHistory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMoreMatches();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMoreMatches, isLoadingMore]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bets'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history: Bet[] = [];
      snapshot.forEach((doc) => {
        history.push({ id: doc.id, ...doc.data() } as Bet);
      });
      // Sort in memory by createdAt descending
      history.sort((a, b) => {
        const timeA = a.createdAt?.toDate?.()?.getTime() || (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.createdAt?.toDate?.()?.getTime() || (b.createdAt ? new Date(b.createdAt).getTime() : 0);
        return timeB - timeA;
      });
      setBetHistory(history);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'bets');
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    // Fetch global betting stats for leaderboard
    const q = query(collection(db, 'bets'), limit(500));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const statsMap: Record<string, { winnings: number; losses: number; name: string }> = {};
      snapshot.forEach((doc) => {
        const data = doc.data();
        const uid = data.userId;
        if (!statsMap[uid]) statsMap[uid] = { winnings: 0, losses: 0, name: 'User' };
        if (data.status === 'won') statsMap[uid].winnings += data.payout;
        if (data.status === 'lost') statsMap[uid].losses += data.amount;
      });
      
      const sortedStats = Object.entries(statsMap).map(([userId, stats]) => ({
        userId,
        ...stats
      })).sort((a, b) => b.winnings - a.winnings);
      
      setGlobalStats(sortedStats);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && activeSubTab === 'betting') {
          loadMoreMatches();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoadingMore, activeSubTab, loadMoreMatches]);

  const toggleSelection = (match: Match, prediction: 'home' | 'draw' | 'away') => {
    const existing = selections.find(s => s.matchId === match.id);
    const odds = match.odds[prediction];
    const matchInfo = `${match.homeTeam} vs ${match.awayTeam}`;

    if (existing) {
      if (existing.prediction === prediction) {
        setSelections(selections.filter(s => s.matchId !== match.id));
      } else {
        setSelections(selections.map(s => 
          s.matchId === match.id ? { ...s, prediction, odds } : s
        ));
      }
    } else {
      if (selections.length >= 6) {
        toast.error('Maximum 6 selections allowed for Bet Optimum');
        return;
      }
      setSelections([...selections, { matchId: match.id, prediction, odds, matchInfo }]);
    }
  };

  const calculatePotentialWin = () => {
    return betAmount * 6;
  };

  const handlePlaceBet = async () => {
    if (!user) return;
    if (selections.length !== 6) {
      toast.error('You must select exactly 6 matches for Bet Optimum');
      return;
    }
    if (betWalletBalance < betAmount) {
      toast.error('Insufficient Bet Wallet balance. Please deposit funds.');
      return;
    }
    if (betAmount > MAX_BET_AMOUNT) {
      toast.error(`Maximum bet amount is $${MAX_BET_AMOUNT}`);
      return;
    }

    setIsPlacingBet(true);
    try {
      const potentialWin = calculatePotentialWin();
      const betData = {
        userId: user.uid,
        selections,
        amount: betAmount,
        potentialWin,
        status: 'pending',
        correctCount: 0,
        payout: 0,
        createdAt: Timestamp.now(),
        betSlipId: 'SLIP-' + Math.random().toString(36).substr(2, 9).toUpperCase()
      };

      await addDoc(collection(db, 'bets'), betData);
      await updateBetWalletBalance(-betAmount);
      
      toast.success(`Bet of $${betAmount} placed successfully!`, {
        action: {
          label: 'Print Slip',
          onClick: () => handlePrintSlip({ ...betData, id: 'PENDING' } as any)
        }
      });
      setSelections([]);
      // Keep the user in the betting tab to allow multiple betting
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bets');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const settleBet = async (bet: Bet, isTimeout: boolean = false) => {
    if (bet.status !== 'pending') return;
    setIsSettling(true);
    try {
      let correctCount = 0;
      let status: 'won' | 'lost' = 'lost';
      let payout = 0;

      if (isTimeout) {
        // Forced loss due to 24h timeout
        status = 'lost';
        correctCount = Math.floor(Math.random() * 4); // Less than 4
      } else {
        // Simulate results
        correctCount = Math.floor(Math.random() * 7); // 0 to 6
        if (correctCount === 4) {
          status = 'won';
          payout = bet.amount * 0.3; // 30% cashback
        } else if (correctCount === 5) {
          status = 'won';
          payout = bet.amount * 0.5; // 50% cashback
        } else if (correctCount === 6) {
          status = 'won';
          payout = bet.amount * 6; // 6x payout
        }
      }

      await updateDoc(doc(db, 'bets', bet.id), {
        status,
        correctCount,
        payout,
        settledAt: Timestamp.now()
      });

      if (status === 'won') {
        await updateBetWalletBalance(payout, `Bet Won: ${correctCount}/6 correct`, 'bet-payout');
        toast.success(`Bet Won! ${correctCount}/6 correct. $${payout.toFixed(2)} added to Bet Wallet.`);
      } else {
        await updateBetWalletBalance(0, `Bet Lost: ${correctCount}/6 correct`, 'bet-loss');
        toast.error(`Bet Lost. ${correctCount}/6 correct. Stake goes to Supreme Account.`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bets/${bet.id}`);
    } finally {
      setIsSettling(false);
    }
  };

  const handlePrintSlip = (bet: Bet) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Bet Slip - ${bet.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; }
            .slip { border: 2px dashed #ccc; padding: 30px; max-width: 500px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #4a0404; font-size: 24px; }
            .header p { margin: 5px 0; color: #666; font-size: 12px; }
            .details { margin-bottom: 20px; }
            .details div { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
            .selections { border-top: 1px solid #eee; padding-top: 20px; }
            .selection { margin-bottom: 15px; font-size: 13px; }
            .selection-header { font-weight: bold; margin-bottom: 3px; }
            .selection-odds { color: #666; font-style: italic; }
            .footer { text-align: center; margin-top: 30px; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            .payout { font-size: 20px; font-weight: 900; color: #b45309; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="slip">
            <div class="header">
              <h1>SUPREME BET OPTIMUM</h1>
              <p>Official Betting Slip</p>
              <p>ID: ${bet.id}</p>
              <p>Date: ${bet.createdAt?.toDate().toLocaleString()}</p>
            </div>
            <div class="details">
              <div><span>Stake:</span> <strong>$${bet.amount.toFixed(2)}</strong></div>
              <div><span>Potential Win:</span> <strong>$${bet.potentialWin.toFixed(2)}</strong></div>
              <div><span>Status:</span> <strong>${bet.status.toUpperCase()}</strong></div>
            </div>
            <div class="selections">
              ${bet.selections.map((s, i) => `
                <div class="selection">
                  <div class="selection-header">${i + 1}. ${s.matchInfo}</div>
                  <div class="selection-odds">Prediction: ${s.prediction.toUpperCase()} @ ${s.odds.toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            <div class="payout">
              ${bet.status === 'won' ? `WINNINGS: $${bet.payout.toFixed(2)}` : `POTENTIAL WIN: $${bet.potentialWin.toFixed(2)}`}
            </div>
            <div class="footer">
              <p>Thank you for betting with Supreme Bet Optimum.</p>
              <p>All bets are subject to terms and conditions.</p>
              <p>24-hour settlement policy applies.</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleTransfer = async () => {
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (transferType === 'deposit') {
      await depositToBetWallet(amount);
    } else {
      await transferFromBetWallet(amount);
    }
    setShowTransferModal(false);
    setTransferAmount('');
  };

  const filteredMatches = selectedRegion === 'All' 
    ? allMatches 
    : allMatches.filter(m => m.region === selectedRegion);

  return (
    <div className="space-y-8 bg-[var(--color-bet-purple-dark)] p-6 md:p-10 rounded-[40px] border border-purple-900/50 shadow-2xl">
      {/* Bet Optimum Header */}
      <div className="bg-gradient-to-r from-[var(--color-bet-purple-dark)] to-[var(--color-bet-purple)] p-8 rounded-3xl text-white shadow-2xl border border-purple-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-800/30 rounded-xl border border-purple-700/50 backdrop-blur-sm">
                <Trophy className="w-8 h-8 text-[var(--color-supreme-gold)]" />
              </div>
              <h2 className="text-3xl font-bold tracking-tight">Bet Optimum</h2>
            </div>
            <p className="text-purple-100/80 max-w-xl">
              International football betting with optimized payouts. Predict 6 matches to win big!
            </p>
            
            {nextSettlementTime ? (
              <div className="mt-6 flex items-center gap-4 p-5 bg-black/40 backdrop-blur-xl rounded-3xl border border-[var(--color-supreme-gold)]/30 w-fit shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-3 bg-[var(--color-supreme-gold)] rounded-2xl shadow-lg shadow-yellow-900/40">
                  <Clock className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-[var(--color-supreme-gold)] tracking-[0.2em] mb-1">24H Settlement Countdown</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-black font-mono text-white tracking-tighter">{nextSettlementTime}</p>
                    <span className="text-[10px] font-bold text-purple-300/50 uppercase">Remaining</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex items-center gap-4 p-5 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 w-fit">
                <div className="p-3 bg-white/10 rounded-2xl">
                  <Zap className="w-6 h-6 text-purple-300" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black text-purple-300/50 tracking-[0.2em] mb-1">System Status</p>
                  <p className="text-xl font-bold text-white">Ready for next Bet Optimum</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl text-center min-w-[160px]">
              <p className="text-[10px] uppercase font-black text-purple-300/50 tracking-widest mb-1">Bet Wallet</p>
              <p className="text-2xl font-black text-[var(--color-supreme-gold)]">${betWalletBalance.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => { setTransferType('deposit'); setShowTransferModal(true); }}
              className="p-4 bg-[var(--color-supreme-gold)] text-white rounded-2xl shadow-lg hover:bg-[var(--color-supreme-gold-light)] transition-all group"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl w-fit mx-auto border border-white/5 overflow-x-auto no-scrollbar">
        {[
          { id: 'betting', label: 'Live Betting', icon: Activity },
          { id: 'wallet', label: 'Bet Wallet', icon: Wallet },
          { id: 'history', label: 'Bet History', icon: History },
          { id: 'analysis', label: 'Analysis', icon: BarChart3 },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={clsx(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeSubTab === tab.id 
                ? "bg-[var(--color-supreme-gold)] text-white shadow-lg shadow-yellow-900/20" 
                : "text-purple-200/60 hover:text-white hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'betting' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Matches List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {['All', 'European', 'American', 'Asian', 'International'].map(region => (
                  <button
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={clsx(
                      "px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border",
                      selectedRegion === region 
                        ? "bg-[var(--color-supreme-green)] text-white border-[var(--color-supreme-green)] shadow-lg shadow-emerald-900/20" 
                        : "bg-white/5 text-purple-200/70 border-white/10 hover:border-white/20 hover:bg-white/10"
                    )}
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredMatches.map(match => (
                <motion.div 
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-md p-6 rounded-[32px] border border-white/10 shadow-xl hover:border-[var(--color-supreme-gold)]/30 transition-all group"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[var(--color-supreme-gold)]" />
                      <span className="text-[10px] font-black text-purple-300/50 uppercase tracking-widest">{match.league}</span>
                    </div>
                    {match.status === 'live' && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-[10px] font-bold border border-red-500/20 animate-pulse">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        LIVE {match.score?.home} - {match.score?.away}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex-1 text-center">
                      <p className="text-xl font-bold text-white">{match.homeTeam}</p>
                    </div>
                    <div className="text-[var(--color-supreme-gold)] font-black italic opacity-40">VS</div>
                    <div className="flex-1 text-center">
                      <p className="text-xl font-bold text-white">{match.awayTeam}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {(['home', 'draw', 'away'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => toggleSelection(match, type)}
                        className={clsx(
                          "p-4 rounded-2xl border transition-all flex flex-col items-center gap-1",
                          selections.find(s => s.matchId === match.id && s.prediction === type)
                            ? "bg-[var(--color-supreme-gold)] border-[var(--color-supreme-gold)] text-white shadow-lg"
                            : "bg-white/5 border-white/10 text-purple-200/60 hover:border-white/30 hover:bg-white/10"
                        )}
                      >
                        <span className="text-[10px] font-black uppercase opacity-50">{type}</span>
                        <span className="text-lg font-black">{match.odds[type].toFixed(2)}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}

              </div>

            {/* Infinite Loading Trigger */}
            <div ref={loadMoreRef} className="py-10 flex flex-col items-center justify-center gap-4">
                {isLoadingMore ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-12 h-12">
                      <motion.div 
                        className="absolute inset-0 border-4 border-[var(--color-supreme-gold)]/20 rounded-full"
                      />
                      <motion.div 
                        className="absolute inset-0 border-4 border-[var(--color-supreme-gold)] rounded-full border-t-transparent"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                    </div>
                    <p className="text-purple-200/40 text-xs font-bold uppercase tracking-widest animate-pulse">
                      Scanning Global Markets...
                    </p>
                  </div>
                ) : (
                  <button 
                    onClick={loadMoreMatches}
                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-purple-200/60 text-sm font-bold hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 group"
                  >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    Load More Matches
                  </button>
                )}
              </div>
            </div>

          {/* Bet Slip */}
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl sticky top-24">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white">Bet Slip</h3>
                <div className="px-4 py-1.5 bg-[var(--color-supreme-green)]/20 text-[var(--color-supreme-green-light)] rounded-full text-[10px] font-black border border-[var(--color-supreme-green)]/30">
                  {selections.length}/6 SELECTIONS
                </div>
              </div>

              <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {selections.length === 0 ? (
                  <div className="text-center py-16 text-purple-200/30">
                    <Target className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="font-medium text-sm">Select 6 matches to build your Bet Optimum</p>
                  </div>
                ) : (
                  selections.map((sel, i) => (
                    <div key={sel.matchId} className="p-5 bg-white/5 rounded-3xl border border-white/5 relative group hover:bg-white/10 transition-all">
                      <button 
                        onClick={() => setSelections(selections.filter(s => s.matchId !== sel.matchId))}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <p className="text-[10px] font-black text-[var(--color-supreme-gold)] uppercase tracking-widest mb-2">Selection {i + 1}</p>
                      <p className="text-sm font-bold text-white mb-2">{sel.matchInfo}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[var(--color-supreme-green-light)] uppercase">Prediction: {sel.prediction}</span>
                        <span className="text-lg font-black text-white">@{sel.odds.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {selections.length > 0 && (
                <div className="space-y-8 pt-8 border-t border-white/10">
                  <div>
                    <label className="block text-[10px] font-black text-purple-300/50 uppercase tracking-widest mb-4">Bet Amount</label>
                    <div className="grid grid-cols-4 gap-2.5">
                      {BET_AMOUNTS.slice(0, 8).map(amt => (
                        <button
                          key={amt}
                          onClick={() => setBetAmount(amt)}
                          className={clsx(
                            "py-2.5 rounded-xl text-xs font-bold border transition-all",
                            betAmount === amt 
                              ? "bg-[var(--color-supreme-gold)] border-[var(--color-supreme-gold)] text-white shadow-lg" 
                              : "bg-white/5 border-white/5 text-purple-200/60 hover:border-white/20"
                          )}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4 relative">
                      <input 
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.min(MAX_BET_AMOUNT, Number(e.target.value)))}
                        className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-white outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                        placeholder="Custom amount"
                        max={MAX_BET_AMOUNT}
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--color-supreme-gold)] font-bold">$</span>
                    </div>
                    <p className="text-[10px] text-purple-300/40 mt-2 italic">Max bet: ${MAX_BET_AMOUNT}</p>
                  </div>

                  <div className="space-y-4 bg-[var(--color-supreme-green)]/10 p-6 rounded-3xl border border-[var(--color-supreme-green)]/20">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-100 font-bold">Potential Payout</span>
                      <span className="text-2xl font-black text-[var(--color-supreme-gold)]">${calculatePotentialWin().toFixed(2)}</span>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <div className="flex justify-between text-xs font-bold text-[var(--color-supreme-green-light)]">
                        <span>4/6 Correct (30% Cashback)</span>
                        <span>${(betAmount * 0.3).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-[var(--color-supreme-green-light)]">
                        <span>5/6 Correct (50% Cashback)</span>
                        <span>${(betAmount * 0.5).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-[var(--color-supreme-green-light)]">
                        <span>6/6 Correct (6x Payout)</span>
                        <span>${(betAmount * 6).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceBet}
                    disabled={isPlacingBet || selections.length !== 6}
                    className={clsx(
                      "w-full py-5 rounded-2xl font-black text-white shadow-2xl transition-all flex items-center justify-center gap-3 text-lg",
                      selections.length === 6 
                        ? "bg-gradient-to-r from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] hover:scale-[1.02] active:scale-95 shadow-yellow-900/40" 
                        : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                    )}
                  >
                    {isPlacingBet ? (
                      <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-6 h-6" />
                        Place Bet Optimum
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'wallet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-8">Bet Wallet Management</h3>
            <div className="p-8 bg-gradient-to-br from-[var(--color-bet-purple)] to-[var(--color-bet-purple-dark)] rounded-[32px] text-white mb-8 relative overflow-hidden border border-white/10">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl" />
              <p className="text-purple-200/60 text-xs font-bold uppercase tracking-widest mb-3">Available Balance</p>
              <h4 className="text-5xl font-black mb-8 text-[var(--color-supreme-gold)]">${betWalletBalance.toFixed(2)}</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => { setTransferType('deposit'); setShowTransferModal(true); }}
                  className="flex-1 py-4 bg-[var(--color-supreme-gold)] text-white rounded-2xl font-bold hover:bg-[var(--color-supreme-gold-light)] transition-all flex items-center justify-center gap-2 shadow-lg shadow-yellow-900/20"
                >
                  <Plus className="w-5 h-5" /> Central Transfer
                </button>
                <button 
                  onClick={() => {
                    const amt = prompt('Enter amount to deposit from external account:');
                    if (amt) {
                      const amount = parseFloat(amt);
                      if (!isNaN(amount) && amount > 0) {
                        depositToBetWallet(amount, true);
                      }
                    }
                  }}
                  className="flex-1 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" /> External Deposit
                </button>
              </div>
              <button 
                onClick={() => { setTransferType('withdraw'); setShowTransferModal(true); }}
                className="w-full mt-4 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <ArrowRightLeft className="w-5 h-5" /> Transfer to Central
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5">
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                  <ShieldCheck className="w-7 h-7 text-[var(--color-supreme-green)]" />
                </div>
                <div>
                  <p className="font-bold text-white">Secure Betting</p>
                  <p className="text-xs text-purple-200/50">Your funds are protected by Supreme Security.</p>
                </div>
              </div>
              <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5">
                <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10">
                  <Zap className="w-7 h-7 text-[var(--color-supreme-gold)]" />
                </div>
                <div>
                  <p className="font-bold text-white">Instant Winnings</p>
                  <p className="text-xs text-purple-200/50">Winnings are credited immediately after match conclusion.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-8 rounded-[40px] border border-white/10 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-8">Central Wallet</h3>
            <div className="p-8 bg-black/40 rounded-[32px] text-white mb-8 border border-white/5">
              <p className="text-purple-200/40 text-xs font-bold uppercase tracking-widest mb-3">Central Balance</p>
              <h4 className="text-5xl font-black mb-8 text-[var(--color-supreme-gold)]">${centralBalance.toFixed(2)}</h4>
              <p className="text-sm text-purple-200/60 leading-relaxed">
                Transfer funds from your central wallet to your bet wallet to start placing bets. 
                Winnings can be transferred back to your central wallet at any time.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-white/5 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                <History className="w-7 h-7 text-[var(--color-supreme-gold)]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Betting History</h3>
                <p className="text-sm text-purple-200/50">Track your wins, losses, and pending bets</p>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-y border-white/5">
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest">Date</th>
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest">Amount</th>
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest">Selections</th>
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest">Correct</th>
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest">Payout</th>
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {betHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-10 py-20 text-center text-purple-200/30 font-medium">
                      No betting history found. Place your first bet to see it here.
                    </td>
                  </tr>
                ) : (
                  betHistory.map((bet) => (
                    <tr key={bet.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-10 py-5 text-sm text-purple-200/60 font-medium">
                        {bet.createdAt?.toDate().toLocaleString()}
                      </td>
                      <td className="px-10 py-5 font-bold text-white">
                        ${bet.amount.toFixed(2)}
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex -space-x-2">
                          {bet.selections.map((s, i) => (
                            <div 
                              key={i} 
                              className="w-7 h-7 rounded-full bg-[var(--color-supreme-gold)]/20 border-2 border-[var(--color-bet-purple-dark)] flex items-center justify-center text-[10px] font-black text-[var(--color-supreme-gold)]"
                              title={s.matchInfo}
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-10 py-5 font-bold text-white">
                        {bet.correctCount}/6
                      </td>
                      <td className="px-10 py-5 font-black text-[var(--color-supreme-green)]">
                        {bet.payout > 0 ? `+$${bet.payout.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-10 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handlePrintSlip(bet)}
                            className="p-2 bg-white/5 text-purple-300 rounded-lg hover:bg-white/10 transition-all"
                            title="Print Slip"
                          >
                            <CreditCard className="w-4 h-4" />
                          </button>
                          {bet.status === 'pending' ? (
                            <button 
                              onClick={() => settleBet(bet)}
                              disabled={isSettling}
                              className="px-5 py-2 bg-[var(--color-supreme-gold)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--color-supreme-gold-light)] transition-all shadow-lg shadow-yellow-900/20"
                            >
                              {isSettling ? '...' : 'Settle'}
                            </button>
                          ) : (
                            <span className={clsx(
                              "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                              bet.status === 'won' ? "bg-[var(--color-supreme-green)]/10 text-[var(--color-supreme-green)] border-[var(--color-supreme-green)]/20" :
                              "bg-red-500/10 text-red-400 border-red-500/20"
                            )}>
                              {bet.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'analysis' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[40px] border border-white/10 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-8">Winnings Analysis</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="p-8 bg-[var(--color-supreme-green)]/10 rounded-[32px] border border-[var(--color-supreme-green)]/20">
                <p className="text-[10px] font-black text-[var(--color-supreme-green-light)] uppercase tracking-widest mb-2">Total Winnings</p>
                <p className="text-3xl font-black text-[var(--color-supreme-green)]">
                  ${betHistory.filter(b => b.status === 'won').reduce((acc, b) => acc + b.payout, 0).toFixed(2)}
                </p>
              </div>
              <div className="p-8 bg-red-500/10 rounded-[32px] border border-red-500/20">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Total Losses</p>
                <p className="text-3xl font-black text-red-500">
                  ${betHistory.filter(b => b.status === 'lost').reduce((acc, b) => acc + b.amount, 0).toFixed(2)}
                </p>
              </div>
                <div className="p-8 bg-[var(--color-supreme-green)]/10 rounded-[32px] border border-[var(--color-supreme-green)]/20">
                  <p className="text-[10px] font-black text-[var(--color-supreme-green-light)] uppercase tracking-widest mb-2">Win Rate</p>
                  <p className="text-3xl font-black text-[var(--color-supreme-green)]">
                    {betHistory.length > 0 
                      ? `${((betHistory.filter(b => b.status === 'won').length / betHistory.length) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
            </div>

            <div className="p-8 bg-black/40 rounded-[32px] text-white mb-10 border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheck className="w-8 h-8 text-[var(--color-supreme-gold)]" />
                <h4 className="text-xl font-bold">Supreme Revenue Contribution</h4>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-purple-200/40 mb-1">Total losses contributed to Supreme Account</p>
                  <p className="text-4xl font-black text-[var(--color-supreme-gold)]">
                    ${betHistory.filter(b => b.status === 'lost').reduce((acc, b) => acc + b.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-purple-200/40 mb-1">Loss Percentage</p>
                  <p className="text-2xl font-bold text-red-500">
                    {betHistory.length > 0 
                      ? `${((betHistory.filter(b => b.status === 'lost').length / betHistory.length) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white">Payout Rules</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-white/5 rounded-[24px] border border-white/5">
                  <p className="text-xs font-bold text-purple-200/40 mb-2">4/6 Correct</p>
                  <p className="text-2xl font-black text-white">60% Payout</p>
                </div>
                <div className="p-6 bg-white/5 rounded-[24px] border border-white/5">
                  <p className="text-xs font-bold text-purple-200/40 mb-2">5/6 Correct</p>
                  <p className="text-2xl font-black text-white">70% Payout</p>
                </div>
                <div className="p-6 bg-white/5 rounded-[24px] border border-white/5">
                  <p className="text-xs font-bold text-purple-200/40 mb-2">6/6 Correct</p>
                  <p className="text-2xl font-black text-white">100% Payout</p>
                </div>
              </div>
              <p className="text-xs text-purple-200/30 italic">
                * Winnings are calculated based on the total parlay odds. If 1, 2, or 3 bets are lost, the entire stake goes to the Supreme Account.
              </p>
            </div>
          </div>

            <div className="bg-white/5 backdrop-blur-md p-10 rounded-[40px] border border-white/10 shadow-xl">
              <h3 className="text-2xl font-bold text-white mb-8">Live Bet Tracking</h3>
              <div className="space-y-6">
                {betHistory.filter(b => b.status === 'pending').length === 0 ? (
                  <p className="text-center py-12 text-purple-200/20 text-sm">No active bets to track.</p>
                ) : (
                  betHistory.filter(b => b.status === 'pending').map(bet => (
                    <div key={bet.id} className="p-6 bg-[var(--color-supreme-green)]/5 rounded-[32px] border border-[var(--color-supreme-green)]/10">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-[var(--color-supreme-gold)] uppercase tracking-widest">Bet ID: {bet.id.substring(0, 8)}</span>
                        <span className="text-[10px] font-bold text-[var(--color-supreme-green-light)]">{bet.selections.length} Selections</span>
                      </div>
                      <div className="space-y-3">
                        {bet.selections.map((s, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-purple-100/60 truncate max-w-[150px]">{s.matchInfo}</span>
                            <span className="font-bold text-white">{s.prediction.toUpperCase()} @{s.odds.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                        <span className="text-sm font-bold text-white">Potential: <span className="text-[var(--color-supreme-gold)]">${bet.potentialWin.toFixed(2)}</span></span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-[var(--color-supreme-green)] rounded-full animate-ping" />
                          <span className="text-[10px] font-black text-[var(--color-supreme-green)] uppercase tracking-widest">Tracking</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-10 rounded-[40px] border border-white/10 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-8">Live Predictions</h3>
            <div className="space-y-6">
              {allMatches.filter(m => m.status === 'live').map(match => (
                <div key={match.id} className="p-6 bg-white/5 rounded-[32px] border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-red-400 uppercase animate-pulse tracking-widest">Live Now</span>
                    <span className="text-[10px] font-bold text-purple-200/40">{match.league}</span>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-white">{match.homeTeam}</span>
                    <span className="font-black text-[var(--color-supreme-gold)] text-xl">{match.score?.home} - {match.score?.away}</span>
                    <span className="font-bold text-white">{match.awayTeam}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-[var(--color-supreme-green)] to-[var(--color-supreme-green-light)]"
                      initial={{ width: "0%" }}
                      animate={{ width: "65%" }}
                    />
                  </div>
                  <p className="text-[10px] text-purple-200/30 mt-3 text-center italic">Prediction: Home Win (65% confidence)</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'leaderboard' && (
        <div className="bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-10 border-b border-white/5 bg-white/5 flex items-center gap-4">
            <div className="p-3 bg-[var(--color-supreme-gold)]/10 rounded-2xl border border-[var(--color-supreme-gold)]/20">
              <Trophy className="w-7 h-7 text-[var(--color-supreme-gold)]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Betting Leaderboard</h3>
              <p className="text-sm text-purple-200/50">Global rankings of top winners and contributors</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-y border-white/5">
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest">Rank</th>
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest">User</th>
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest">Total Winnings</th>
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest">Total Losses</th>
                  <th className="px-10 py-5 text-[10px] font-black text-purple-300/50 uppercase tracking-widest text-right">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {globalStats.map((stat, i) => (
                  <tr key={`${stat.userId}-${i}`} className={clsx("hover:bg-white/5 transition-colors", stat.userId === user?.uid && "bg-[var(--color-supreme-gold)]/5")}>
                    <td className="px-10 py-5">
                      <div className={clsx(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border shadow-lg",
                        i === 0 ? "bg-[var(--color-supreme-gold)] text-white border-[var(--color-supreme-gold)] shadow-yellow-900/20" :
                        i === 1 ? "bg-gray-400 text-white border-gray-300 shadow-gray-900/20" :
                        i === 2 ? "bg-amber-700 text-white border-amber-600 shadow-orange-900/20" :
                        "bg-white/5 text-purple-200/40 border-white/5"
                      )}>
                        {i + 1}
                      </div>
                    </td>
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold text-xs">
                          {stat.userId.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {stat.userId === user?.uid ? 'You' : `User_${stat.userId.substring(0, 5)}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-5 font-black text-[var(--color-supreme-green)]">
                      ${stat.winnings.toFixed(2)}
                    </td>
                    <td className="px-10 py-5 font-black text-red-500">
                      ${stat.losses.toFixed(2)}
                    </td>
                    <td className="px-10 py-5 text-right font-black text-white">
                      ${(stat.winnings - stat.losses).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[var(--color-bet-purple-dark)] w-full max-w-md rounded-[3rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-supreme-gold)]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <button 
                onClick={() => setShowTransferModal(false)}
                className="absolute top-8 right-8 p-2 text-purple-200/40 hover:text-white transition-colors"
              >
                <XCircle className="w-7 h-7" />
              </button>

              <h3 className="text-3xl font-bold text-white mb-3">
                {transferType === 'deposit' ? 'Deposit Funds' : 'Transfer Out'}
              </h3>
              <p className="text-purple-200/50 text-sm mb-10">
                {transferType === 'deposit' 
                  ? 'Move funds from your central wallet to start betting.' 
                  : 'Transfer your winnings back to your central wallet.'}
              </p>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-purple-300/50 uppercase tracking-widest mb-4">Amount to Transfer</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl font-black text-2xl text-white outline-none focus:border-[var(--color-supreme-gold)] transition-all"
                      placeholder="0.00"
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-supreme-gold)] font-black text-xl">$</span>
                  </div>
                  <div className="flex justify-between mt-4">
                    <span className="text-xs text-purple-200/40">
                      Available: <span className="text-white font-bold">${transferType === 'deposit' ? centralBalance.toFixed(2) : betWalletBalance.toFixed(2)}</span>
                    </span>
                    <button 
                      onClick={() => setTransferAmount((transferType === 'deposit' ? centralBalance : betWalletBalance).toString())}
                      className="text-xs font-black text-[var(--color-supreme-gold)] hover:text-[var(--color-supreme-gold-light)] transition-colors uppercase tracking-widest"
                    >
                      Use Max
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleTransfer}
                  className="w-full py-5 bg-gradient-to-r from-[var(--color-supreme-gold)] to-[var(--color-supreme-gold-light)] text-white rounded-2xl font-black shadow-2xl shadow-yellow-900/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
                >
                  <Zap className="w-6 h-6" />
                  Confirm Transfer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
