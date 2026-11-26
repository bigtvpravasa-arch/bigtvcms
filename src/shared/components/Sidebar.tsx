'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Box, Typography, Divider, Collapse } from '@mui/material';
import {
  AddCircleOutline,
  Notifications as NotificationsIcon,
  GraphicEq as GraphicEqIcon,
  LiveTv,
  LocationOn,
  People,
  Article,
  Language as LanguageIcon,
  AutoAwesome,
  Category as CategoryIcon,
  Settings,
  Movie,
  Web as WebIcon,
  Newspaper as NewspaperIcon,
  Campaign as CampaignIcon,
  RssFeed,
  AssignmentInd,
  SportsEsports,
  StarRate,
  Tune,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useLanguageStore } from '@/core/storage/language-store';
import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useUserStore } from '@/core/storage/user-store';

const sidebarTranslations = {
  en: {
    menuAnalytics: 'Analytics',
    menuCreate: 'Create News',
    menuNotifications: 'Notifications',
    menuRatings: 'BigTV Special',
    menuCricket: 'Cricket Scores',
    menuReels: 'Reels',
    menuMovies: 'Movies',
    menuLiveTvVideos: 'Live TV Videos',
    menuWebArticles: 'Web Articles',
    menuEpapers: 'E-Papers',
    menuLocations: 'Locations',
    menuCreators: 'Creators',
    menuPostTypes: 'Post Types',
    menuLanguages: 'Languages',
    menuAiTags: 'AiTags',
    menuCategories: 'Categories',
    menuAdsDynapix: 'Ads Dynapix',
    menuMoreFollow: 'More Follow Menu',
    menuAdminContent: 'Upload Content',
    menuSettings: 'Settings',
    menuReporters: 'Reporters',
    menuGames: 'Games',
    menuTts: 'Telugu TTS',
    menuAppConfig: 'App Config',
  },
  te: {
    menuAnalytics: 'అనలిటిక్స్',
    menuCreate: 'వార్తలను సృష్టించండి',
    menuNotifications: 'నోటిఫికేషన్లు',
    menuRatings: 'బిగ్ టీవీ స్పెషల్',
    menuCricket: 'క్రికెట్ స్కోర్లు',
    menuReels: 'రీల్స్',
    menuMovies: 'సినిమాలు',
    menuLiveTvVideos: 'లైవ్ టీవీ వీడియోలు',
    menuWebArticles: 'వెబ్ కథనాలు',
    menuEpapers: 'ఈ-పేపర్లు',
    menuLocations: 'ప్రాంతాలు',
    menuCreators: 'క్రియేటర్లు',
    menuPostTypes: 'పోస్ట్ రకాలు',
    menuLanguages: 'భాషలు',
    menuAiTags: 'AiTags',
    menuCategories: 'విభాగాలు',
    menuAdsDynapix: 'యాడ్స్ డైనపిక్స్',
    menuMoreFollow: 'మరింత ఫాలో మెనూ',
    menuAdminContent: 'కంటెంట్ అప్‌లోడ్ చేయండి',
    menuSettings: 'సెట్టింగ్‌లు',
    menuReporters: 'రిపోర్టర్లు',
    menuGames: 'గేమ్స్',
    menuTts: 'తెలుగు TTS',
    menuAppConfig: 'యాప్ కాన్ఫిగ్',
  },
  hi: {
    menuAnalytics: 'एनालिटिक्स',
    menuCreate: 'समाचार बनाएं',
    menuNotifications: 'सूचनाएं',
    menuRatings: 'बिग टीवी स्पेशल',
    menuCricket: 'क्रिकेट स्कोर',
    menuReels: 'रील्स',
    menuMovies: 'मूवीज',
    menuLiveTvVideos: 'लाइव टीवी वीडियो',
    menuWebArticles: 'वेब लेख',
    menuEpapers: 'ई-पेपर्स',
    menuLocations: 'स्थान',
    menuCreators: 'निर्माता',
    menuPostTypes: 'पोस्ट प्रकार',
    menuLanguages: 'भाषाएं',
    menuAiTags: 'AiTags',
    menuCategories: 'श्रेणियाँ',
    menuAdsDynapix: 'विज्ञापन डायनापिक्स',
    menuMoreFollow: 'अधिक फॉलो मेनू',
    menuAdminContent: 'सामग्री अपलोड करें',
    menuSettings: 'सेटिंग्स',
    menuReporters: 'रिपोर्टर',
    menuGames: 'गेम्स',
    menuTts: 'तेलुगु TTS',
    menuAppConfig: 'ऐप कॉन्फ़िग',
  },
  ml: {
    menuAnalytics: 'അനലിറ്റിക്‌സ്',
    menuCreate: 'വാർത്ത സൃഷ്ടിക്കുക',
    menuNotifications: 'അറിയിപ്പുകൾ',
    menuRatings: 'ബിഗ് ടിവി സ്പെഷ്യൽ',
    menuCricket: 'ക്രിക്കറ്റ് സ്കോറുകൾ',
    menuReels: 'റീലുകൾ',
    menuMovies: 'സിനിമകൾ',
    menuLiveTvVideos: 'ലൈവ് ടിവി വീഡിയോകൾ',
    menuWebArticles: 'വെബ് ലേഖനങ്ങൾ',
    menuEpapers: 'ഇ-പേപ്പറുകൾ',
    menuLocations: 'സ്ഥലങ്ങൾ',
    menuCreators: 'സ്രഷ്‌ടാക്കൾ',
    menuPostTypes: 'പോസ്റ്റ് തരങ്ങൾ',
    menuLanguages: 'ഭാഷകൾ',
    menuAiTags: 'AiTags',
    menuCategories: 'വിഭാഗങ്ങൾ',
    menuAdsDynapix: 'ആഡ്സ് ഡൈനാപിക്സ്',
    menuMoreFollow: 'കൂടുതൽ ഫോളോ മെനു',
    menuAdminContent: 'ഉള്ളടക്കം അപ്‌ലോഡ് ചെയ്യുക',
    menuSettings: 'ക്രമീകരണങ്ങൾ',
    menuReporters: 'റിപ്പോർട്ടർമാർ',
    menuGames: 'ഗെയിമുകൾ',
    menuTts: 'തെലുങ്ക് TTS',
    menuAppConfig: 'ആപ്പ് കോൺഫിഗ്',
  },
};

interface SidebarProps {
  activeHref?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeHref }) => {
  const nextPathname = usePathname();
  const currentPath = activeHref || nextPathname || '';
  const normalizedPath = currentPath.replace(/\/$/, '') || '/';
  const { language } = useLanguageStore();
  const { mode } = useAppTheme();
  const { user } = useUserStore();
  const isDark = mode === 'dark';
  const t = sidebarTranslations[language] || sidebarTranslations.en;

  // Main Top-level menu items (excluding items moved to App Config)
  const allMainMenuItems = [
    { text: t.menuCreate, icon: <AddCircleOutline />, href: '/dashboard' },
    { text: t.menuNotifications, icon: <NotificationsIcon />, href: '/notifications' },
    { text: t.menuRatings, icon: <StarRate />, href: '/ratings' },
    { text: t.menuReels, icon: <Movie />, href: '/reels' },
    { text: t.menuLiveTvVideos, icon: <LiveTv />, href: '/livetvvideos' },
    { text: t.menuWebArticles, icon: <WebIcon />, href: '/web-articles' },
    { text: t.menuEpapers, icon: <NewspaperIcon />, href: '/epapers' },
    { text: t.menuReporters, icon: <AssignmentInd />, href: '/reporters' },
    { text: t.menuAdsDynapix, icon: <CampaignIcon />, href: '/ads-dynapix' },
    { text: t.menuMoreFollow, icon: <RssFeed />, href: '/more-follow' },
  ];

  // 7 Sub-items moved under App Config
  const allAppConfigSubItems = [
    { text: t.menuAiTags, icon: <AutoAwesome sx={{ fontSize: 18 }} />, href: '/aitags' },
    { text: t.menuCategories, icon: <CategoryIcon sx={{ fontSize: 18 }} />, href: '/categories' },
    { text: t.menuLocations, icon: <LocationOn sx={{ fontSize: 18 }} />, href: '/locations' },
    { text: t.menuLanguages, icon: <LanguageIcon sx={{ fontSize: 18 }} />, href: '/languages' },
    { text: t.menuPostTypes, icon: <Article sx={{ fontSize: 18 }} />, href: '/post-types' },
    { text: t.menuCreators, icon: <People sx={{ fontSize: 18 }} />, href: '/creators' },
    { text: t.menuTts, icon: <GraphicEqIcon sx={{ fontSize: 18 }} />, href: '/tts' },
  ];

  const userRole = (user?.role || '').toLowerCase().trim();
  const isCreator = userRole === 'creator' || userRole === 'creators';
  const isAdmin = userRole === 'admin' || userRole === 'administrator';
  const isSuperAdmin = userRole === 'superadmin' || userRole === 'super_admin';
  const isEpaperCreator = userRole === 'epaper_creator';
  const isMovieCreator = userRole === 'movie_creator';
  const isNotificationCreator = userRole === 'notification_creator';
  const isAdsDynapixCreator =
    userRole === 'adsdynapic' ||
    userRole === 'ads_dynapic' ||
    userRole === 'adsdynapix' ||
    userRole === 'ads_dynapix' ||
    userRole === 'adsdynapix_creator' ||
    userRole === 'ads_dynapix_creator';

  const creatorHrefs = [
    '/dashboard',
    '/reels',
    '/tts',
    '/events',
    '/livetvvideos',
    '/web-articles',
    '/ratings',
    '/settings',
  ];
  const epaperCreatorHrefs = ['/epapers', '/settings'];
  const movieCreatorHrefs = ['/movies', '/settings'];
  const notificationCreatorHrefs = ['/dashboard', '/web-articles', '/notifications', '/settings'];
  const adsDynapixCreatorHrefs = ['/ads-dynapix'];

  const adminHrefs = [
    '/dashboard',
    '/notifications',
    '/ratings',
    '/reels',
    '/tts',
    '/events',
    '/livetvvideos',
    '/web-articles',
    '/epapers',
    '/aitags',
    '/categories',
    '/locations',
    '/post-types',
    '/creators',
    '/reporters',
    '/games',
    '/languages',
    '/ads-dynapix',
    '/more-follow',
    '/settings',
  ];

  // Role-filtered main menu
  const menuItems = allMainMenuItems.filter((item) => {
    if (isAdsDynapixCreator) return adsDynapixCreatorHrefs.includes(item.href);
    if (isEpaperCreator) return epaperCreatorHrefs.includes(item.href);
    if (isMovieCreator) return movieCreatorHrefs.includes(item.href);
    if (isNotificationCreator) return notificationCreatorHrefs.includes(item.href);
    if (isCreator) return creatorHrefs.includes(item.href);
    if (isAdmin) return adminHrefs.includes(item.href);
    if (isSuperAdmin) return true;
    return false;
  });

  // Role-filtered App Config sub-items
  const visibleSubItems = allAppConfigSubItems.filter((item) => {
    if (isAdsDynapixCreator) return adsDynapixCreatorHrefs.includes(item.href);
    if (isEpaperCreator) return epaperCreatorHrefs.includes(item.href);
    if (isMovieCreator) return movieCreatorHrefs.includes(item.href);
    if (isNotificationCreator) return notificationCreatorHrefs.includes(item.href);
    if (isCreator) return creatorHrefs.includes(item.href);
    if (isAdmin) return adminHrefs.includes(item.href);
    if (isSuperAdmin) return true;
    return false;
  });

  // Check if any App Config child route is active
  const isAnySubItemActive = visibleSubItems.some((sub) => {
    return (
      normalizedPath === sub.href ||
      normalizedPath.startsWith(sub.href) ||
      (sub.href === '/languages' && normalizedPath.startsWith('/language'))
    );
  });

  // Collapse state for App Config menu
  const [appConfigOpen, setAppConfigOpen] = useState(isAnySubItemActive);

  // Auto-expand App Config when navigating to a child page
  useEffect(() => {
    if (isAnySubItemActive) {
      setAppConfigOpen(true);
    }
  }, [isAnySubItemActive]);

  const showSettings =
    isSuperAdmin ||
    isAdmin ||
    isCreator ||
    isEpaperCreator ||
    isMovieCreator ||
    isNotificationCreator;

  return (
    <Box
      data-testid="sidebar"
      sx={{
        width: '240px',
        backgroundColor: isDark ? 'rgba(28, 22, 3, 0.85)' : '#fcfbf7',
        backdropFilter: isDark ? 'blur(20px)' : 'none',
        borderRight: isDark
          ? '1px solid rgba(250, 204, 21, 0.15)'
          : '1px solid rgba(217, 119, 6, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        pt: 1,
        px: 2,
        pb: 2,
        flexShrink: 0,
        height: '100%',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {/* Logo — top left corner */}
      <Box sx={{ mb: 1, mt: 0 }}>
        <Box
          component="img"
          src="/bigtv_logo.png"
          alt="BigTV"
          sx={{
            width: '100%',
            maxWidth: '180px',
            height: 'auto',
            borderRadius: '8px',
            display: 'block',
          }}
        />
      </Box>
      <Divider
        sx={{
          mb: 1.5,
          borderColor: isDark ? 'rgba(250, 204, 21, 0.12)' : 'rgba(217, 119, 6, 0.12)',
        }}
      />

      {/* Main Menu List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {menuItems.map((item) => {
          const isActive =
            normalizedPath === item.href ||
            (item.href !== '/dashboard' && normalizedPath.startsWith(item.href)) ||
            (item.href === '/dashboard' &&
              (normalizedPath === '/' || normalizedPath === '/dashboard')) ||
            (item.href === '/ratings' && normalizedPath.startsWith('/games'));

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: 'none', display: 'block' }}
              prefetch={true}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: isActive ? '#1a1300' : isDark ? '#fde68a' : '#78350f',
                  background: isActive
                    ? 'linear-gradient(135deg, #facc15 0%, #eab308 100%)'
                    : 'transparent',
                  fontWeight: isActive ? 700 : 500,
                  boxShadow: isActive ? '0 4px 15px rgba(234, 179, 8, 0.35)' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: isActive
                      ? 'linear-gradient(135deg, #fde047 0%, #d97706 100%)'
                      : isDark
                        ? 'rgba(234, 179, 8, 0.12)'
                        : 'rgba(234, 179, 8, 0.08)',
                    color: isActive ? '#1a1300' : isDark ? '#ffffff' : '#1a1300',
                  },
                }}
              >
                {item.icon}
                <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                  {item.text}
                </Typography>
              </Box>
            </Link>
          );
        })}

        {/* ============================================================== */}
        {/* APP CONFIG (Collapsible Dropdown in Side Menu) */}
        {/* ============================================================== */}
        {visibleSubItems.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            {/* Header / Toggle Button */}
            <Box
              onClick={() => setAppConfigOpen((prev) => !prev)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: '12px',
                cursor: 'pointer',
                userSelect: 'none',
                color: isAnySubItemActive
                  ? isDark
                    ? '#facc15'
                    : '#b45309'
                  : isDark
                    ? '#fde68a'
                    : '#78350f',
                backgroundColor:
                  isAnySubItemActive && !appConfigOpen
                    ? isDark
                      ? 'rgba(234, 179, 8, 0.15)'
                      : 'rgba(234, 179, 8, 0.08)'
                    : isDark
                      ? 'rgba(255,255,255,0.03)'
                      : 'rgba(0,0,0,0.02)',
                border: isAnySubItemActive
                  ? isDark
                    ? '1px solid rgba(250, 204, 21, 0.4)'
                    : '1px solid rgba(217, 119, 6, 0.35)'
                  : '1px solid transparent',
                fontWeight: isAnySubItemActive ? 700 : 600,
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: isDark ? 'rgba(234, 179, 8, 0.12)' : 'rgba(234, 179, 8, 0.06)',
                  color: isDark ? '#ffffff' : '#1a1300',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tune sx={{ fontSize: 22 }} />
                <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                  {t.menuAppConfig}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    px: 0.8,
                    py: 0.1,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    borderRadius: '6px',
                    backgroundColor: isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.1)',
                    color: isDark ? '#facc15' : '#b45309',
                  }}
                >
                  {visibleSubItems.length}
                </Box>
                {appConfigOpen ? (
                  <ExpandLess sx={{ fontSize: 18, color: isDark ? '#facc15' : '#b45309' }} />
                ) : (
                  <ExpandMore sx={{ fontSize: 18, color: isDark ? '#facc15' : '#b45309' }} />
                )}
              </Box>
            </Box>

            {/* Collapsible Sub-menu items */}
            <Collapse in={appConfigOpen} timeout="auto" unmountOnExit>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  mt: 0.5,
                  ml: 1.5,
                  pl: 1.5,
                  borderLeft: isDark
                    ? '2px solid rgba(250, 204, 21, 0.25)'
                    : '2px solid rgba(217, 119, 6, 0.25)',
                }}
              >
                {visibleSubItems.map((sub) => {
                  const isSubActive =
                    normalizedPath === sub.href ||
                    normalizedPath.startsWith(sub.href) ||
                    (sub.href === '/languages' && normalizedPath.startsWith('/language'));

                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      style={{ textDecoration: 'none', display: 'block' }}
                      prefetch={true}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          py: 1.1,
                          px: 1.5,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          color: isSubActive ? '#1a1300' : isDark ? '#fde68a' : '#78350f',
                          background: isSubActive
                            ? 'linear-gradient(135deg, #facc15 0%, #eab308 100%)'
                            : 'transparent',
                          fontWeight: isSubActive ? 700 : 500,
                          fontSize: '0.85rem',
                          boxShadow: isSubActive ? '0 3px 10px rgba(234, 179, 8, 0.35)' : 'none',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            background: isSubActive
                              ? 'linear-gradient(135deg, #fde047 0%, #d97706 100%)'
                              : isDark
                                ? 'rgba(234, 179, 8, 0.12)'
                                : 'rgba(234, 179, 8, 0.06)',
                            color: isSubActive ? '#1a1300' : isDark ? '#ffffff' : '#1a1300',
                          },
                        }}
                      >
                        {sub.icon}
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 'inherit', fontSize: '0.84rem' }}
                        >
                          {sub.text}
                        </Typography>
                      </Box>
                    </Link>
                  );
                })}
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Settings (Bottom) */}
        {showSettings && (
          <Link
            href="/settings"
            style={{ textDecoration: 'none', display: 'block' }}
            prefetch={true}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: '12px',
                cursor: 'pointer',
                color:
                  normalizedPath === '/settings' || normalizedPath.startsWith('/settings')
                    ? '#1a1300'
                    : isDark
                      ? '#fde68a'
                      : '#78350f',
                background:
                  normalizedPath === '/settings' || normalizedPath.startsWith('/settings')
                    ? 'linear-gradient(135deg, #facc15 0%, #eab308 100%)'
                    : 'transparent',
                fontWeight:
                  normalizedPath === '/settings' || normalizedPath.startsWith('/settings')
                    ? 700
                    : 500,
                boxShadow:
                  normalizedPath === '/settings' || normalizedPath.startsWith('/settings')
                    ? '0 4px 15px rgba(234, 179, 8, 0.35)'
                    : 'none',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background:
                    normalizedPath === '/settings'
                      ? 'linear-gradient(135deg, #fde047 0%, #d97706 100%)'
                      : isDark
                        ? 'rgba(234, 179, 8, 0.12)'
                        : 'rgba(234, 179, 8, 0.08)',
                  color:
                    normalizedPath === '/settings' ? '#1a1300' : isDark ? '#ffffff' : '#1a1300',
                },
              }}
            >
              <Settings />
              <Typography variant="body2" sx={{ fontWeight: 'inherit' }}>
                {t.menuSettings}
              </Typography>
            </Box>
          </Link>
        )}
      </Box>
    </Box>
  );
};
