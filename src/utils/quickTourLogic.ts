export type TourLang = 'ml' | 'en';

export type TourRoleContext = 'principal' | 'principal_demo' | 'master';

export interface TourStep {
  id: string;
  emoji: string;
  targetSelector: string;
  fallbackSelector?: string;
  view?: 'principal' | 'analytics' | 'teacher' | 'schedules' | 'parent' | 'master';
  principalTab?: 'portfolios' | 'enroll' | 'notices' | 'settings';
  title: {
    en: string;
    ml: string;
  };
  description: {
    en: string;
    ml: string;
  };
  tip: {
    en: string;
    ml: string;
  };
}

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface TourCardPlacement {
  top: number;
  left: number;
  width: number;
  placement: 'bottom' | 'top' | 'right' | 'left' | 'center';
  arrowLeft?: number;
  spotlightRect: Rect | null;
}

export interface TourUiStrings {
  stepLabel: (current: number, total: number) => string;
  quickTipPrefix: string;
  skip: string;
  back: string;
  next: string;
  finish: string;
  closeAria: string;
  langToggleAria: string;
  finishedToast: string;
  progressAria: string;
}

const PRINCIPAL_BASE_STEPS: TourStep[] = [
  {
    id: 'workspace-nav',
    emoji: '🧭',
    targetSelector: '#main-nav-tabs',
    fallbackSelector: '#main-app-header',
    view: 'principal',
    principalTab: 'portfolios',
    title: {
      en: 'Welcome! Your Main Navigation Bar',
      ml: 'സ്വാഗതം! പ്രധാന മെനു ബാർ',
    },
    description: {
      en: 'Use these tabs at the top to jump smoothly between Student Portfolios, Analytics & Alerts, Notice Desk, and Campus Settings anytime.',
      ml: 'മുകളിലുള്ള ഈ ടാബുകൾ ഉപയോഗിച്ച് വിദ്യാർത്ഥി പോർട്ട്ഫോളിയോ, അനലിറ്റിക്സ് & അലേർട്ടുകൾ, നോട്ടീസ് ഡെസ്ക്, ക്യാമ്പസ് സെറ്റിംഗ്സ് എന്നിവയിലേക്ക് എളുപ്പത്തിൽ മാറാം.',
    },
    tip: {
      en: 'You can switch between മലയാളം and English anytime using the toggle above!',
      ml: 'മുകളിലുള്ള ബട്ടൺ വഴി എപ്പോൾ വേണമെങ്കിലും മലയാളത്തിലേക്കോ ഇംഗ്ലീഷിലേക്കോ മാറാം!',
    },
  },
  {
    id: 'demo-mode',
    emoji: '🧪',
    targetSelector: '#principal-demo-mode-wrap',
    fallbackSelector: '.principal-header-bar',
    view: 'principal',
    principalTab: 'portfolios',
    title: {
      en: 'Safe Demo Mode Sandbox',
      ml: 'സുരക്ഷിത ഡെമോ മോഡ് (Demo Mode)',
    },
    description: {
      en: 'New here? Turn on Demo Mode to explore sample students, Ustadh Verification Desk, and Parent Portal safely — your real Firestore records stay 100% untouched.',
      ml: 'ആദ്യമായി ഉപയോഗിക്കുന്നവർക്ക് സാമ്പിൾ വിവരങ്ങളോടെ പ്രിൻസിപ്പൽ, ഉസ്താദ്, പാരന്റ് പോർട്ടലുകൾ സുരക്ഷിതമായി പരീക്ഷിച്ചു നോക്കാൻ ഡെമോ മോഡ് ഓൺ ആക്കാം. യഥാർത്ഥ ഡാറ്റയ്ക്ക് ഒന്നും സംഭവിക്കില്ല.',
    },
    tip: {
      en: 'Toggle Demo Mode OFF anytime to jump right back to your live campus data.',
      ml: 'പരിശോധന കഴിഞ്ഞാൽ ഡെമോ മോഡ് ഓഫ് ചെയ്താൽ ഉടൻ ലൈവ് ഡാറ്റയിലേക്ക് തിരിച്ചെത്താം.',
    },
  },
  {
    id: 'progress-trend',
    emoji: '📈',
    targetSelector: '#principal-portfolio-trend-card',
    view: 'principal',
    principalTab: 'portfolios',
    title: {
      en: '6-Month Hifz Progress Chart',
      ml: '6 മാസത്തെ ഹിഫ്ള് പുരോഗതി ചാർട്ട്',
    },
    description: {
      en: 'See how your students are progressing over the past 6 months. Filter by a single student or compare the whole campus across Cumulative Juz and Monthly Sabaq pages.',
      ml: 'കഴിഞ്ഞ 6 മാസത്തെ വിദ്യാർത്ഥികളുടെ ജുസ്അ് പൂർത്തീകരണവും പ്രതിമാസ സബഖ് പേജുകളും ഇവിടെ ഗ്രാഫിലൂടെ കാണാം. ഓരോ വിദ്യാർത്ഥിയെയും പ്രത്യേകം തിരഞ്ഞെടുത്ത് പരിശോധിക്കാം.',
    },
    tip: {
      en: 'Hover or tap any point on the chart lines to see exact monthly numbers.',
      ml: 'ചാർട്ടിലെ ഓരോ പോയിന്റിലും തൊട്ടാൽ കൃത്യമായ മാസക്കണക്കുകൾ കാണാൻ കഴിയും.',
    },
  },
  {
    id: 'student-portfolios',
    emoji: '📚',
    targetSelector: '#principal-students-card',
    fallbackSelector: '#principal-students-list',
    view: 'principal',
    principalTab: 'portfolios',
    title: {
      en: 'Student Portfolios & Report Cards',
      ml: 'വിദ്യാർത്ഥി പോർട്ട്ഫോളിയോ & റിപ്പോർട്ട് കാർഡ്',
    },
    description: {
      en: 'Tap any student card to inspect their 30-Juz map, automatic monthly Akhlaq grade, and daily memorization history — or print a neat 1-page Monthly Report Card.',
      ml: 'ഏതൊരു വിദ്യാർത്ഥിയുടെയും കാർഡിൽ ക്ലിക്ക് ചെയ്താൽ 30 ജുസ്അ് പ്രോഗ്രസ്, ഓട്ടോമാറ്റിക് അഖ്‌ലാഖ് ഗ്രേഡ്, ദൈനംദിന വിവരങ്ങൾ എന്നിവ കാണാനും 1-പേജ് റിപ്പോർട്ട് കാർഡ് പ്രിന്റ് ചെയ്യാനും സാധിക്കും.',
    },
    tip: {
      en: 'Akhlaq grades calculate automatically from daily Ustadh logs each month.',
      ml: 'ഉസ്താദുമാർ രേഖപ്പെടുത്തുന്ന ദൈനംദിന പോയിന്റുകളിൽ നിന്ന് അഖ്‌ലാഖ് ഗ്രേഡ് തനിയെ കണക്കാക്കും.',
    },
  },
  {
    id: 'add-student-ustadh',
    emoji: '✍️',
    targetSelector: '#p-tab-enroll',
    fallbackSelector: '#ptab-btn-enroll',
    view: 'principal',
    principalTab: 'enroll',
    title: {
      en: 'Enroll Students & Register Ustadhs',
      ml: 'പുതിയ വിദ്യാർത്ഥികളെയും ഉസ്താദുമാരെയും ചേർക്കുക',
    },
    description: {
      en: 'Add new Hifz students with their Admission ID, Halqa, and Parent PIN, or create login accounts for your Ustadhs — everything syncs instantly to the cloud.',
      ml: 'പുതിയ ഹിഫ്ള് വിദ്യാർത്ഥികളെ അഡ്മിഷൻ നമ്പറും പാരന്റ് പിൻ നമ്പറും നൽകി ചേർക്കാം. ഒപ്പം ഉസ്താദുമാർക്കുള്ള ലോഗിൻ അക്കൗണ്ടുകളും ഇവിടെ നിന്ന് തയ്യാറാക്കാം.',
    },
    tip: {
      en: 'Share the Madrasa Code, Admission ID, and PIN with parents so they can sign in.',
      ml: 'മദ്രസ കോഡും അഡ്മിഷൻ നമ്പറും പിൻ നമ്പറും നൽകിയാൽ രക്ഷിതാക്കൾക്ക് ലോഗിൻ ചെയ്യാം.',
    },
  },
  {
    id: 'analytics-alerts',
    emoji: '🚨',
    targetSelector: '#view-analytics',
    fallbackSelector: '#analytics-kpi-strip',
    view: 'analytics',
    title: {
      en: 'Analytics & Automated Feedback Alerts',
      ml: 'അനലിറ്റിക്സ് & ഓട്ടോമാറ്റിക് അലേർട്ടുകൾ',
    },
    description: {
      en: 'Spot students who need extra care right away. This dashboard automatically flags Sabaq stalls, Manzil revision dips, attendance drops, and Akhlaq alerts.',
      ml: 'പ്രത്യേക ശ്രദ്ധ ആവശ്യമുള്ള വിദ്യാർത്ഥികളെ ഉടൻ കണ്ടെത്താം. സബഖ് മന്ദഗതി, മൻസിൽ വീഴ്ച, ഹാജർ കുറവ്, അഖ്‌ലാഖ് മാറ്റങ്ങൾ എന്നിവ ഇവിടെ തനിയെ മുന്നറിയിപ്പായി ലഭിക്കും.',
    },
    tip: {
      en: 'Use the performance matrix table on the right to compare all students at a glance.',
      ml: 'വലതുവശത്തുള്ള പട്ടികയിലൂടെ എല്ലാ വിദ്യാർത്ഥികളുടെയും നിലവാരം ഒറ്റനോട്ടത്തിൽ താരതമ്യം ചെയ്യാം.',
    },
  },
  {
    id: 'notice-desk',
    emoji: '📢',
    targetSelector: '#p-tab-notices',
    fallbackSelector: '#nav-notices',
    view: 'principal',
    principalTab: 'notices',
    title: {
      en: 'Notice Desk & Campus Circulars',
      ml: 'നോട്ടീസ് ഡെസ്ക് & ക്യാമ്പസ് അറിയിപ്പുകൾ',
    },
    description: {
      en: 'Publish official announcements, exam schedules, or holiday circulars for All Users, Parents Only, or Ustadhs Only — delivered directly to their portals.',
      ml: 'പരീക്ഷാ വിവരങ്ങൾ, അവധി അറിയിപ്പുകൾ തുടങ്ങിയ ക്യാമ്പസ് സർക്കുലറുകൾ രക്ഷിതാക്കൾക്കും ഉസ്താദുമാർക്കും നേരിട്ട് അവരുടെ പോർട്ടലിലേക്ക് അയക്കാം.',
    },
    tip: {
      en: 'Choose the exact target audience before posting so only the right people see it.',
      ml: 'അറിയിപ്പ് പ്രസിദ്ധീകരിക്കുമ്പോൾ എല്ലാവർക്കോ, രക്ഷിതാക്കൾക്കോ, ഉസ്താദുമാർക്കോ എന്ന് തിരഞ്ഞെടുക്കാം.',
    },
  },
  {
    id: 'campus-settings',
    emoji: '⚙️',
    targetSelector: '#p-tab-settings',
    fallbackSelector: '#nav-settings',
    view: 'principal',
    principalTab: 'settings',
    title: {
      en: 'Campus Settings & Akhlaq Traits',
      ml: 'ക്യാമ്പസ് സെറ്റിംഗ്സ് & സ്വഭാവ ടാഗുകൾ',
    },
    description: {
      en: 'Customize your campus name, academic term, 5-Time Salah tracking, Transit controls, Principal password, and custom positive or warning Akhlaq traits.',
      ml: 'സ്ഥാപനത്തിന്റെ പേര്, അക്കാദമിക് ടേം, 5 വഖ്ത് നമസ്കാര പരിശോധന, പ്രിൻസിപ്പൽ പാസ്‌വേഡ്, കൂടാതെ ഉസ്താദുമാർക്കുള്ള ഇഷ്ടാനുസൃത അഖ്‌ലാഖ് ടാഗുകൾ എന്നിവ ഇവിടെ ക്രമീകരിക്കാം.',
    },
    tip: {
      en: 'Any new Akhlaq trait you add here appears automatically on the Ustadh Desk!',
      ml: 'ഇവിടെ ചേർക്കുന്ന പുതിയ സ്വഭാവ ടാഗുകൾ ഉടൻ തന്നെ ഉസ്താദ് ഡെസ്കിൽ ലഭ്യമാകും!',
    },
  },
];

const DEMO_EXTRA_STEPS: TourStep[] = [
  {
    id: 'demo-desk-switcher',
    emoji: '🔀',
    targetSelector: '#demo-preview-switcher-bar',
    fallbackSelector: '#main-app-header',
    view: 'principal',
    principalTab: 'portfolios',
    title: {
      en: 'Switch Between All 3 Portals',
      ml: '3 പോർട്ടലുകളിലേക്കും ഒറ്റ ക്ലിക്കിൽ മാറാം',
    },
    description: {
      en: 'While Demo Mode is active, this bar lets you hop between Principal View, Ustadh Verification Desk, and Parent Portal without logging out.',
      ml: 'ഡെമോ മോഡ് ഓൺ ആയിരിക്കുമ്പോൾ ലോഗൗട്ട് ചെയ്യാതെ തന്നെ പ്രിൻസിപ്പൽ, ഉസ്താദ് ഡെസ്ക്, രക്ഷിതാക്കളുടെ പോർട്ടൽ എന്നിവ പരിശോധിക്കാൻ ഈ ബാർ സഹായിക്കും.',
    },
    tip: {
      en: 'Click "Turn Off Demo Mode" anytime to return straight to your real workspace.',
      ml: 'എപ്പോൾ വേണമെങ്കിലും "ഡെമോ മോഡ് ഓഫ് ചെയ്യുക" ക്ലിക്ക് ചെയ്ത് യഥാർത്ഥ അക്കൗണ്ടിലേക്ക് മടങ്ങാം.',
    },
  },
  {
    id: 'ustadh-desk',
    emoji: '👨‍🏫',
    targetSelector: '#view-teacher',
    fallbackSelector: '#teacher-verification-form',
    view: 'teacher',
    title: {
      en: 'Ustadh Daily Verification Desk',
      ml: 'ഉസ്താദ് ദൈനംദിന വെരിഫിക്കേഷൻ ഡെസ്ക്',
    },
    description: {
      en: 'This is where Ustadhs record daily attendance, Sabaq, Sabqi, Manzil grades, shift/transit details, and Akhlaq points for each student in seconds.',
      ml: 'ഓരോ ദിവസത്തെയും ഹാജർ, സബഖ്, സബ്ഖി, മൻസിൽ ഗ്രേഡുകൾ, ഷിഫ്റ്റ് വിവരങ്ങൾ, അഖ്‌ലാഖ് പോയിന്റുകൾ എന്നിവ ഉസ്താദുമാർ എളുപ്പത്തിൽ രേഖപ്പെടുത്തുന്ന ഭാഗമാണിത്.',
    },
    tip: {
      en: 'Quick portion chips and Akhlaq tags make daily entry super fast on phones too.',
      ml: 'ദ്രുത ബട്ടണുകൾ ഉപയോഗിച്ച് ഫോണിൽ നിന്നും വളരെ വേഗത്തിൽ ദിവസേനയുള്ള വിവരങ്ങൾ ചേർക്കാം.',
    },
  },
  {
    id: 'schedules-vault',
    emoji: '🗓️',
    targetSelector: '#view-schedules',
    fallbackSelector: '#schedules-vault-list',
    view: 'schedules',
    title: {
      en: 'Memorization Schedules Vault',
      ml: 'ഹിഫ്ള് ഷെഡ്യൂൾ വോൾട്ട്',
    },
    description: {
      en: 'Assign structured Juz targets, daily Sabaq quotas, Sabqi windows, and Manzil rotation cycles so every student stays on a clear roadmap.',
      ml: 'ഓരോ വിദ്യാർത്ഥിക്കും കൃത്യമായ ജുസ്അ് ലക്ഷ്യങ്ങൾ, ദൈനംദിന സബഖ് അളവ്, മൻസിൽ റിവിഷൻ പ്ലാൻ എന്നിവ ഇവിടെ നിശ്ചയിച്ചു സൂക്ഷിക്കാം.',
    },
    tip: {
      en: 'Update progress percentages as students complete milestones toward their target date.',
      ml: 'വിദ്യാർത്ഥികൾ ലക്ഷ്യം കൈവരിക്കുന്നതിനനുസരിച്ച് പുരോഗതി ശതമാനം ഇവിടെ അപ്‌ഡേറ്റ് ചെയ്യാം.',
    },
  },
  {
    id: 'parent-portal',
    emoji: '👨‍👩‍👦',
    targetSelector: '#view-parent',
    fallbackSelector: '#parent-juz-grid',
    view: 'parent',
    title: {
      en: 'Parent Progress Portal',
      ml: 'രക്ഷിതാക്കളുടെ പുരോഗതി പോർട്ടൽ',
    },
    description: {
      en: 'Parents can view their child’s 30-Juz map, sign off on Home Revision, notify school exams or leave, message the Halqa Ustadh, and print report cards.',
      ml: 'മക്കളുടെ 30 ജുസ്അ് പുരോഗതി കാണാനും, വീട്ടിലെ റിവിഷൻ സാക്ഷ്യപ്പെടുത്താനും, അവധി/പരീക്ഷ അറിയിക്കാനും, റിപ്പോർട്ട് കാർഡ് പ്രിന്റ് ചെയ്യാനും രക്ഷിതാക്കൾക്ക് ഇവിടെ സാധിക്കും.',
    },
    tip: {
      en: 'You are all set! Click Finish to return smoothly to your dashboard.',
      ml: 'എല്ലാം തയ്യാറായി! ടൂർ പൂർത്തിയാക്കി ഡാഷ്‌ബോർഡിലേക്ക് മടങ്ങാൻ താഴെ ക്ലിക്ക് ചെയ്യുക.',
    },
  },
];

const HEADER_FINISH_STEP: TourStep = {
  id: 'notifications-language',
  emoji: '🔔',
  targetSelector: '#header-notif-container',
  fallbackSelector: '.header-actions',
  view: 'principal',
  principalTab: 'portfolios',
  title: {
    en: 'Alerts Bell & Quick Language Switch',
    ml: 'നോട്ടിഫിക്കേഷൻ ബെൽ & ഭാഷാ മാറ്റം',
  },
  description: {
    en: 'Check real-time alerts and updates from the bell icon anytime, or switch the entire portal between മലയാളം and English from the top right corner.',
    ml: 'പുതിയ അറിയിപ്പുകളും അലേർട്ടുകളും മുകളിലെ ബെൽ ഐക്കണിൽ കാണാം. വലതുവശത്തുള്ള മെനുവിലൂടെ മുഴുവൻ ആപ്പിന്റെയും ഭാഷ മലയാളത്തിലേക്കോ ഇംഗ്ലീഷിലേക്കോ മാറ്റാം.',
  },
  tip: {
    en: 'You are ready to go! Click "🎯 Quick Tour" anytime if you want a quick refresher.',
    ml: 'ഇനി ധൈര്യമായി തുടങ്ങാം! എപ്പോൾ വേണമെങ്കിലും "🎯 Quick Tour" ക്ലിക്ക് ചെയ്ത് ഈ ഗൈഡ് വീണ്ടും കാണാം.',
  },
};

const MASTER_ADMIN_STEPS: TourStep[] = [
  {
    id: 'master-header',
    emoji: '🛡️',
    targetSelector: '#view-master .workspace-header',
    fallbackSelector: '#view-master',
    view: 'master',
    title: {
      en: 'Master Super Admin Control Center',
      ml: 'മാസ്റ്റർ സൂപ്പർ അഡ്മിൻ കൺട്രോൾ സെന്റർ',
    },
    description: {
      en: 'Welcome! From here you manage every registered Madrasa workspace, monitor global activity, and keep multi-tenant data cleanly isolated.',
      ml: 'സ്വാഗതം! രജിസ്റ്റർ ചെയ്ത എല്ലാ മദ്രസ വർക്ക്സ്പേസുകളും നിയന്ത്രിക്കാനും ആഗോള വിവരങ്ങൾ നിരീക്ഷിക്കാനുമുള്ള പ്രധാന കേന്ദ്രമാണിത്.',
    },
    tip: {
      en: 'Use the Refresh button anytime to sync the latest Madrasa counts from the cloud.',
      ml: 'ഏറ്റവും പുതിയ വിവരങ്ങൾ ലഭിക്കാൻ മുകളിലെ റീഫ്രഷ് ബട്ടൺ എപ്പോൾ വേണമെങ്കിലും ഉപയോഗിക്കാം.',
    },
  },
  {
    id: 'master-kpis',
    emoji: '📊',
    targetSelector: '#master-kpi-strip',
    fallbackSelector: '#view-master .kpi-strip',
    view: 'master',
    title: {
      en: 'Global Multi-Campus Metrics',
      ml: 'ആകെ മദ്രസ & വിദ്യാർത്ഥി കണക്കുകൾ',
    },
    description: {
      en: 'See total registered Madrasas, total Hifz students, total Ustadhs, and live cloud sync status across every campus at a single glance.',
      ml: 'എല്ലാ ക്യാമ്പസുകളിലെയും ആകെ മദ്രസകൾ, ഹിഫ്ള് വിദ്യാർത്ഥികൾ, ഉസ്താദുമാർ, ക്ലൗഡ് സിങ്ക് അവസ്ഥ എന്നിവ ഒറ്റനോട്ടത്തിൽ ഇവിടെ കാണാം.',
    },
    tip: {
      en: 'Numbers update automatically as new campuses enroll students and teachers.',
      ml: 'പുതിയ വിദ്യാർത്ഥികളെയും ഉസ്താദുമാരെയും ചേർക്കുമ്പോൾ ഈ കണക്കുകൾ തനിയെ പുതുക്കപ്പെടും.',
    },
  },
  {
    id: 'master-create-madrasa',
    emoji: '➕',
    targetSelector: '#master-create-card',
    fallbackSelector: '#master-create-card-title',
    view: 'master',
    title: {
      en: 'Create New Madrasa Workspace',
      ml: 'പുതിയ മദ്രസ വർക്ക്സ്പേസ് സൃഷ്ടിക്കുക',
    },
    description: {
      en: 'Launch a brand-new isolated campus by entering a unique Madrasa Code, campus name, mode (Day / Residential / Online), and Principal login details.',
      ml: 'പുതിയ മദ്രസ കോഡ്, പേര്, ക്യാമ്പസ് മോഡ് (ഡേ / റെസിഡൻഷ്യൽ / ഓൺലൈൻ), പ്രിൻസിപ്പൽ ലോഗിൻ എന്നിവ നൽകി പുതിയ വർക്ക്സ്പേസ് തുടങ്ങാം.',
    },
    tip: {
      en: 'Each Madrasa Code gets its own completely isolated Firestore workspace.',
      ml: 'ഓരോ മദ്രസ കോഡിനും തികച്ചും സ്വതന്ത്രവും സുരക്ഷിതവുമായ ഡാറ്റാബേസ് ലഭിക്കും.',
    },
  },
  {
    id: 'master-global-broadcast',
    emoji: '📢',
    targetSelector: '#master-global-card',
    fallbackSelector: '#master-global-card-title',
    view: 'master',
    title: {
      en: 'Global Broadcasts & Master Security',
      ml: 'പൊതു അറിയിപ്പുകളും മാസ്റ്റർ സുരക്ഷയും',
    },
    description: {
      en: 'Send system-wide announcements to every Madrasa at once and update your Master Super Admin username and password safely right here.',
      ml: 'എല്ലാ മദ്രസകളിലേക്കും ഒരുമിച്ച് പൊതു അറിയിപ്പുകൾ അയക്കാനും മാസ്റ്റർ അഡ്മിൻ പാസ്‌വേഡ് സുരക്ഷിതമായി മാറ്റാനും ഇവിടെ സാധിക്കും.',
    },
    tip: {
      en: 'Mark critical updates as Urgent Alert so every Principal notices right away.',
      ml: 'പ്രധാനപ്പെട്ട സന്ദേശങ്ങൾക്ക് "അടിയന്തര അറിയിപ്പ്" തിരഞ്ഞെടുത്താൽ എല്ലാവരുടെയും ശ്രദ്ധയിൽ പെടും.',
    },
  },
  {
    id: 'master-directory',
    emoji: '🏛️',
    targetSelector: '#master-directory-card',
    fallbackSelector: '#master-madrasas-table',
    view: 'master',
    title: {
      en: 'Registered Madrasas Directory',
      ml: 'രജിസ്റ്റർ ചെയ്ത മദ്രസകളുടെ ലിസ്റ്റ്',
    },
    description: {
      en: 'Search any Madrasa, edit its code or mode, reset Principal passwords, or open a campus workspace directly to inspect and assist.',
      ml: 'ഏത് മദ്രസയും തിരയാനും, ക്യാമ്പസ് മോഡ് അല്ലെങ്കിൽ പ്രിൻസിപ്പൽ പാസ്‌വേഡ് മാറ്റാനും, ഏത് വർക്ക്സ്പേസും നേരിട്ട് തുറന്നു പരിശോധിക്കാനും ഇവിടെ കഴിയും.',
    },
    tip: {
      en: 'Click "Open Workspace" on any row to step inside that Madrasa as Principal.',
      ml: 'ഏതൊരു മദ്രസയുടെയും വിവരങ്ങൾ പരിശോധിക്കാൻ അതിന്റെ വർക്ക്സ്പേസ് നേരിട്ട് തുറക്കാം.',
    },
  },
];

export function getTourSteps(context: TourRoleContext): TourStep[] {
  if (context === 'master') {
    return MASTER_ADMIN_STEPS.slice();
  }
  if (context === 'principal_demo') {
    return [...PRINCIPAL_BASE_STEPS, ...DEMO_EXTRA_STEPS];
  }
  return [...PRINCIPAL_BASE_STEPS, HEADER_FINISH_STEP];
}

export function getNextStepIndex(currentIndex: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.min(totalSteps - 1, Math.max(0, currentIndex + 1));
}

export function getPrevStepIndex(currentIndex: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.max(0, Math.min(totalSteps - 1, currentIndex - 1));
}

export function toggleTourLanguage(lang: TourLang): TourLang {
  return lang === 'ml' ? 'en' : 'ml';
}

export function getTourProgressPercent(currentIndex: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  const clamped = Math.max(0, Math.min(totalSteps - 1, currentIndex));
  return Math.round(((clamped + 1) / totalSteps) * 100);
}

export function getTourUiStrings(lang: TourLang): TourUiStrings {
  if (lang === 'ml') {
    return {
      stepLabel: (current, total) => `ഘട്ടം ${current} / ${total}`,
      quickTipPrefix: 'സൂചന',
      skip: 'ഒഴിവാക്കുക',
      back: '← പിന്നിലേക്ക്',
      next: 'അടുത്തത് →',
      finish: 'പൂർത്തിയായി ✓',
      closeAria: 'ക്വിക്ക് ടൂർ അവസാനിപ്പിക്കുക',
      langToggleAria: 'ടൂർ ഭാഷ മാറ്റുക: മലയാളം അല്ലെങ്കിൽ English',
      finishedToast: '🎉 ക്വിക്ക് ടൂർ പൂർത്തിയായി! ഇനി ആപ്പ് എളുപ്പത്തിൽ ഉപയോഗിച്ചു തുടങ്ങാം.',
      progressAria: 'ടൂർ പുരോഗതി',
    };
  }
  return {
    stepLabel: (current, total) => `Step ${current} of ${total}`,
    quickTipPrefix: 'Tip',
    skip: 'Skip',
    back: '← Back',
    next: 'Next →',
    finish: 'Finish ✓',
    closeAria: 'Close Quick Tour',
    langToggleAria: 'Switch tour language between Malayalam and English',
    finishedToast: '🎉 Quick Tour complete! You are all set to explore the portal.',
    progressAria: 'Tour progress',
  };
}

export function clampSpotlightRect(
  rect: Rect,
  viewportWidth: number,
  viewportHeight: number,
  padding = 8
): Rect {
  const safeEdge = 6;
  const rawLeft = Math.max(safeEdge, rect.left - padding);
  const rawTop = Math.max(safeEdge, rect.top - padding);
  const rawRight = Math.min(viewportWidth - safeEdge, rect.left + rect.width + padding);
  const rawBottom = Math.min(viewportHeight - safeEdge, rect.top + rect.height + padding);

  const width = Math.max(24, rawRight - rawLeft);
  const maxSpotlightHeight = Math.max(120, Math.round(viewportHeight * 0.62));
  const height = Math.max(24, Math.min(rawBottom - rawTop, maxSpotlightHeight));

  return {
    top: Math.round(rawTop),
    left: Math.round(rawLeft),
    width: Math.round(width),
    height: Math.round(height),
  };
}

export function computeTourCardPosition(params: {
  targetRect: Rect | null;
  viewportWidth: number;
  viewportHeight: number;
  cardWidth: number;
  cardHeight: number;
  margin?: number;
  gap?: number;
}): TourCardPlacement {
  const margin = params.margin ?? 14;
  const gap = params.gap ?? 14;
  const vw = Math.max(320, params.viewportWidth);
  const vh = Math.max(420, params.viewportHeight);
  const isMobile = vw <= 640;

  const effectiveWidth = Math.min(params.cardWidth, vw - margin * 2);
  const effectiveHeight = Math.min(params.cardHeight, vh - margin * 2);

  if (!params.targetRect || params.targetRect.width <= 0 || params.targetRect.height <= 0) {
    return {
      top: Math.max(margin, Math.round((vh - effectiveHeight) / 2)),
      left: Math.max(margin, Math.round((vw - effectiveWidth) / 2)),
      width: Math.round(effectiveWidth),
      placement: 'center',
      spotlightRect: null,
    };
  }

  const spot = clampSpotlightRect(params.targetRect, vw, vh, isMobile ? 6 : 8);

  if (isMobile) {
    const spaceBelow = vh - (spot.top + spot.height) - margin;
    const spaceAbove = spot.top - margin;
    const dockTop = spaceBelow < effectiveHeight + 8 && spaceAbove >= spaceBelow;
    const mobileTop = dockTop
      ? Math.max(margin, Math.min(spot.top - effectiveHeight - gap, vh - effectiveHeight - margin))
      : Math.max(margin, vh - effectiveHeight - margin);

    return {
      top: Math.round(mobileTop),
      left: Math.round((vw - effectiveWidth) / 2),
      width: Math.round(effectiveWidth),
      placement: dockTop ? 'top' : 'bottom',
      spotlightRect: spot,
    };
  }

  const spaceBelow = vh - (spot.top + spot.height) - margin;
  const spaceAbove = spot.top - margin;
  const spaceRight = vw - (spot.left + spot.width) - margin;
  const spaceLeft = spot.left - margin;

  const clampX = (x: number) =>
    Math.max(margin, Math.min(vw - effectiveWidth - margin, Math.round(x)));
  const clampY = (y: number) =>
    Math.max(margin, Math.min(vh - effectiveHeight - margin, Math.round(y)));

  const targetCenterX = spot.left + spot.width / 2;

  // 1. Prefer below target
  if (spaceBelow >= effectiveHeight + gap) {
    const left = clampX(targetCenterX - effectiveWidth / 2);
    return {
      top: clampY(spot.top + spot.height + gap),
      left,
      width: Math.round(effectiveWidth),
      placement: 'bottom',
      arrowLeft: Math.max(24, Math.min(effectiveWidth - 24, Math.round(targetCenterX - left))),
      spotlightRect: spot,
    };
  }

  // 2. Try above target
  if (spaceAbove >= effectiveHeight + gap) {
    const left = clampX(targetCenterX - effectiveWidth / 2);
    return {
      top: clampY(spot.top - effectiveHeight - gap),
      left,
      width: Math.round(effectiveWidth),
      placement: 'top',
      arrowLeft: Math.max(24, Math.min(effectiveWidth - 24, Math.round(targetCenterX - left))),
      spotlightRect: spot,
    };
  }

  // 3. Try right of target
  if (spaceRight >= effectiveWidth + gap) {
    return {
      top: clampY(spot.top + spot.height / 2 - effectiveHeight / 2),
      left: clampX(spot.left + spot.width + gap),
      width: Math.round(effectiveWidth),
      placement: 'right',
      spotlightRect: spot,
    };
  }

  // 4. Try left of target
  if (spaceLeft >= effectiveWidth + gap) {
    return {
      top: clampY(spot.top + spot.height / 2 - effectiveHeight / 2),
      left: clampX(spot.left - effectiveWidth - gap),
      width: Math.round(effectiveWidth),
      placement: 'left',
      spotlightRect: spot,
    };
  }

  // 5. Large-section fallback: dock neatly at bottom-right so user can still read highlighted content
  return {
    top: clampY(vh - effectiveHeight - margin),
    left: clampX(vw - effectiveWidth - margin),
    width: Math.round(effectiveWidth),
    placement: 'bottom',
    spotlightRect: spot,
  };
}
