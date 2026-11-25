'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '@/shared/components/Header';
import { Sidebar } from '@/shared/components/Sidebar';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Pagination,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
  Avatar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Search,
  LiveTv,
  Lock,
  AddCircleOutline,
  Edit,
  DeleteSweep,
  Sync,
  ExpandMore,
  FilterListOff,
  AccessTime,
} from '@mui/icons-material';
import { useLanguageStore } from '@/core/storage/language-store';
import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useUserStore } from '@/core/storage/user-store';
import { useLiveTvVideosController } from '../hooks/useLiveTvVideosController';
import { LiveTvVideosTable } from '../components/LiveTvVideosTable';
import { VideoPlayerModal } from '../components/VideoPlayerModal';
import { TagCreateModal } from '../components/TagCreateModal';
import { TagEditModal } from '../components/TagEditModal';
import { TagTimingModal } from '../components/TagTimingModal';
import { VideoEditModal } from '../components/VideoEditModal';
import { Loader } from '@/shared/components/Loader';
import { LanguageCode, TagLanguage, VideoTag } from '../domain/LiveTvVideo';

const translations = {
  en: {
    pageTitle: 'Video Tags & Stream Management',
    pageSubtitle: 'Manage dynamic video folders and view streaming content across languages',
    createTagBtn: '+ New Video Tag',
    allLanguagesTab: 'All Languages',
    teluguTab: 'Telugu (te) ★Default',
    malayalamTab: 'Malayalam (ml)',
    englishTab: 'English (en)',
    teluguBadge: 'Telugu',
    malayalamBadge: 'Malayalam',
    englishBadge: 'English',
    dailySyncBtn: 'Daily Sync',
    syncingBtn: 'Syncing...',
    syncSuccessMsg: 'Videos synced successfully for',
    alreadySyncedMsg: 'Videos for this tag are already synced',
    searchPlaceholder: 'Search videos by file name...',
    clearFilters: 'Clear Filters',
    totalVideos: 'Total Videos',
    editTag: 'Edit Tag',
    deleteTag: 'Delete Tag',
    accessDeniedTitle: 'Access Restricted',
    accessDeniedDesc: 'Only authorized roles can access the Live TV Videos management page.',
    deleteConfirmTitle: 'Delete Video Tag?',
    deleteConfirmDesc:
      'Are you sure you want to delete this tag? This will also permanently delete the associated physical folder and all videos inside it.',
    cancel: 'Cancel',
    delete: 'Delete',
    editVideo: 'Edit Video',
    noTagsFound: 'No video tags found for this language.',
    selectTagPrompt: 'Select a video tag to view its videos and streaming files.',
    viewVideosBtn: 'View Videos',
    folder: 'Folder',
    views: 'views',
    language: 'Language',
    teluguOption: 'Telugu (te)',
    malayalamOption: 'Malayalam (ml)',
    englishOption: 'English (en)',
    slugChangeWarning:
      'Changing language will automatically relocate the show folder on the server.',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Enter brief show summary...',
    tagNameLabel: 'Tag Name',
    tagSlugLabel: 'Tag Slug',
    tagSlugHelper: 'Used for physical folder name. Alphanumeric and dashes only.',
    tagSlugEditHelper: 'Slug identifier cannot be edited to prevent storage desync.',
    tagImageLabel: 'Thumbnail Image (Optional)',
    uploadImage: 'Upload Image',
    save: 'Save',
    errorFieldsRequired: 'Name and slug are required',
    createTagModalTitle: 'Create Video Tag',
    editTagModalTitle: 'Edit Video Tag',
    colFileName: 'File Name',
    colSize: 'Size',
    colDate: 'Created At',
    colActions: 'Actions',
    playStream: 'Play Stream / View',
    confirmDeleteVideo: 'Are you sure you want to delete this video?',
    noRecordsFound: 'No videos available in this tag folder.',
    teluguShowsHeading: 'Telugu Shows (Default)',
    malayalamShowsHeading: 'Malayalam Shows',
    englishShowsHeading: 'English Shows',
    colViewCount: 'View Count',
    thumbnailLabel: 'Thumbnail Image',
    uploadThumbnail: 'Upload Thumbnail',
    uploading: 'Uploading...',
    removeThumbnail: 'Remove Thumbnail',
    thumbnailUrlLabel: 'Thumbnail URL',
    thumbnailUrlPlaceholder: 'https://... or upload an image',
    uploadFailed: 'Failed to upload image',
    errorFileNameRequired: 'File name is required',
    errorInvalidViewCount: 'View count cannot be negative',
    errorVideoIdMissing: 'Video ID is missing. Cannot update.',
    showing: 'Showing',
    of: 'of',
    items: 'items',
    startTimeLabel: 'Broadcast Start Time',
    endTimeLabel: 'Broadcast End Time',
    editTiming: 'Set Timing',
    editTimingModalTitle: 'Show Timings Schedule',
    timingUpdatedSuccess: 'Video tag timing updated successfully',
    clearTiming: 'Clear Timing',
    liveBadge: 'LIVE NOW',
    simulateTimePlaceholder: 'Simulate Time (HH:mm)',
    simulateTimeTooltip: 'Simulate IST time to preview active shows (e.g. 07:30)',
    clearSimulation: 'Reset Simulation',
    timingLabel: 'Timing',
  },
  te: {
    pageTitle: 'వీడియో ట్యాగ్‌లు & స్ట్రీమ్ నిర్వహణ',
    pageSubtitle:
      'డైనమిక్ వీడియో ఫోల్డర్‌లను నిర్వహించండి మరియు వివిధ భాషలలో స్ట్రీమింగ్ కంటెంట్‌ను వీక్షించండి',
    createTagBtn: '+ కొత్త వీడియో ట్యాగ్',
    allLanguagesTab: 'అన్ని భాషలు',
    teluguTab: 'తెలుగు (te) ★డిఫాల్ట్',
    malayalamTab: 'మలయాళం (ml)',
    englishTab: 'ఇంగ్లీష్ (en)',
    teluguBadge: 'తెలుగు',
    malayalamBadge: 'మలయాళం',
    englishBadge: 'ఇంగ్లీష్',
    dailySyncBtn: 'రోజువారీ సమకాలీకరణ',
    syncingBtn: 'సమకాలీకరిస్తోంది...',
    syncSuccessMsg: 'వీడియోలు విజయవంతంగా సమకాలీకరించబడ్డాయి:',
    alreadySyncedMsg: 'ఈ ట్యాగ్ కోసం వీడియోలు ఇప్పటికే సమకాలీకరించబడ్డాయి',
    searchPlaceholder: 'ఫైల్ పేరు ద్వారా వీడియోలను శోధించండి...',
    clearFilters: 'ఫిల్టర్‌లను తొలగించు',
    totalVideos: 'మొత్తం వీడియోలు',
    editTag: 'ట్యాగ్‌ని సవరించు',
    deleteTag: 'ట్యాగ్‌ని తొలగించు',
    accessDeniedTitle: 'ప్రవేశం పరిమితం చేయబడింది',
    accessDeniedDesc: 'అధికారం కలిగిన పాత్రలు మాత్రమే ఈ పేజీని యాక్సెస్ చేయగలరు.',
    deleteConfirmTitle: 'వీడియో ట్యాగ్‌ని తొలగించాలా?',
    deleteConfirmDesc:
      'ఈ ట్యాగ్‌ని ఖచ్చితంగా తొలగించాలనుకుంటున్నారా? ఇది సంబంధిత ఫిజికల్ ఫోల్డర్‌ను మరియు అందలి అన్ని వీడియోలను శాశ్వతంగా తొలగిస్తుంది.',
    cancel: 'రద్దు చేయి',
    delete: 'తొలగించు',
    editVideo: 'వీడియోను సవరించండి',
    noTagsFound: 'ఈ భాష కోసం వీడియో ట్యాగ్‌లు కనుగొనబడలేదు.',
    selectTagPrompt:
      'వీడియోలు మరియు స్ట్రీమింగ్ ఫైళ్ళను వీక్షించడానికి వీడియో ట్యాగ్‌ని ఎంచుకోండి.',
    viewVideosBtn: 'వీడియోలను చూడండి',
    folder: 'ఫోల్డర్',
    views: 'వీక్షణలు',
    language: 'భాష',
    teluguOption: 'తెలుగు (te)',
    malayalamOption: 'మలయాళం (ml)',
    englishOption: 'ఇంగ్లీష్ (en)',
    slugChangeWarning: 'భాషను మార్చడం వలన సర్వర్‌లో షో ఫోల్డర్ స్వయంచాలకంగా తరలించబడుతుంది.',
    descriptionLabel: 'వివరణ',
    descriptionPlaceholder: 'క్లుప్త వివరణను నమోదు చేయండి...',
    tagNameLabel: 'ట్యాగ్ పేరు',
    tagSlugLabel: 'ట్యాగ్ స్లగ్',
    tagSlugHelper: 'ఫోల్డర్ పేరు కోసం ఉపయోగించబడుతుంది. ఆల్ఫాన్యూమరిక్ మరియు డాష్‌లు మాత్రమే.',
    tagSlugEditHelper: 'స్టోరేజ్ డీసింక్ నిరోధించడానికి స్లగ్ మార్చబడదు.',
    tagImageLabel: 'థంబ్‌నెయిల్ చిత్రం (ఐచ్ఛికం)',
    uploadImage: 'చిత్రాన్ని అప్‌లోడ్ చేయండి',
    save: 'భద్రపరచు',
    errorFieldsRequired: 'పేరు మరియు స్లగ్ అవసరం',
    createTagModalTitle: 'వీడియో ట్యాగ్‌ని సృష్టించండి',
    editTagModalTitle: 'వీడియో ట్యాగ్‌ని సవరించండి',
    colFileName: 'ఫైల్ పేరు',
    colSize: 'పరిమాణం',
    colDate: 'సృష్టించబడిన తేదీ',
    colActions: 'చర్యలు',
    playStream: 'స్ట్రీమ్ ప్లే చేయండి / చూడండి',
    confirmDeleteVideo: 'మీరు ఖచ్చితంగా ఈ వీడియోను తొలగించాలనుకుంటున్నారా?',
    noRecordsFound: 'ఈ ట్యాగ్ ఫోల్డర్‌లో వీడియోలు అందుబాటులో లేవు.',
    teluguShowsHeading: 'తెలుగు షోలు (డిఫాల్ట్)',
    malayalamShowsHeading: 'మలయాళం షోలు',
    englishShowsHeading: 'ఇంగ్లీష్ షోలు',
    colViewCount: 'వీక్షణల సంఖ్య',
    thumbnailLabel: 'థంబ్‌నెయిల్ చిత్రం',
    uploadThumbnail: 'థంబ్‌నెయిల్‌ను అప్‌లోడ్ చేయండి',
    uploading: 'అప్‌లోడ్ అవుతోంది...',
    removeThumbnail: 'థంబ్‌నెయిల్‌ను తీసివేయండి',
    thumbnailUrlLabel: 'థంబ్‌నెయిల్ URL',
    thumbnailUrlPlaceholder: 'https://... లేదా చిత్రాన్ని అప్‌లోడ్ చేయండి',
    uploadFailed: 'చిత్రాన్ని అప్‌లోడ్ చేయడం విఫలమైంది',
    errorFileNameRequired: 'ఫైల్ పేరు అవసరం',
    errorInvalidViewCount: 'వీక్షణల సంఖ్య రుణాత్మకంగా ఉండకూడదు',
    errorVideoIdMissing: 'వీడియో ID లేదు. నవీకరించడం సాధ్యం కాదు.',
    showing: 'చూపిస్తున్నవి',
    of: 'నుండి',
    items: 'వీడియోలు',
    startTimeLabel: 'ప్రసార ప్రారంభ సమయం',
    endTimeLabel: 'ప్రసార ముగింపు సమయం',
    editTiming: 'సమయాన్ని సెట్ చేయండి',
    editTimingModalTitle: 'షో సమయాల షెడ్యూల్',
    timingUpdatedSuccess: 'వీడియో ట్యాగ్ సమయం విజయవంతంగా నవీకరించబడింది',
    clearTiming: 'సమయాన్ని తీసివేయండి',
    liveBadge: 'ప్రత్యక్ష ప్రసారం',
    simulateTimePlaceholder: 'సమయాన్ని అనుకరించండి (HH:mm)',
    simulateTimeTooltip: 'యాక్టివ్ షోలను ప్రివ్యూ చేయడానికి IST సమయాన్ని అనుకరించండి (ఉదా. 07:30)',
    clearSimulation: 'సిమ్యులేషన్‌ను రీసెట్ చేయండి',
    timingLabel: 'సమయం',
  },
  hi: {
    pageTitle: 'वीडियो टैग और स्ट्रीम प्रबंधन',
    pageSubtitle:
      'डायनामिक वीडियो फ़ोल्डर्स प्रबंधित करें और विभिन्न भाषाओं में स्ट्रीमिंग सामग्री देखें',
    createTagBtn: '+ नया वीडियो टैग',
    allLanguagesTab: 'सभी भाषाएं',
    teluguTab: 'तेलुगु (te) ★डिफ़ॉल्ट',
    malayalamTab: 'मलयालम (ml)',
    englishTab: 'अंग्रेज़ी (en)',
    teluguBadge: 'तेलुगु',
    malayalamBadge: 'मलयालम',
    englishBadge: 'अंग्रेज़ी',
    dailySyncBtn: 'दैनिक सिंक',
    syncingBtn: 'सिंक हो रहा है...',
    syncSuccessMsg: 'के लिए वीडियो सफलतापूर्वक सिंक किए गए:',
    alreadySyncedMsg: 'इस टैग के वीडियो पहले से ही सिंक हैं',
    searchPlaceholder: 'फ़ाइल नाम से वीडियो खोजें...',
    clearFilters: 'फ़िल्टर हटाएं',
    totalVideos: 'कुल वीडियो',
    editTag: 'टैग संपादित करें',
    deleteTag: 'टैग हटाएं',
    accessDeniedTitle: 'पहुंच प्रतिबंधित है',
    accessDeniedDesc: 'केवल अधिकृत भूमिकाएं ही इस पृष्ठ तक पहुंच सकती हैं।',
    deleteConfirmTitle: 'वीडियो टैग हटाएं?',
    deleteConfirmDesc:
      'क्या आप वाकई इस टैग को हटाना चाहते हैं? यह संबंधित भौतिक फ़ोल्डर और उसके अंदर के सभी वीडियो को भी स्थायी रूप से हटा देगा।',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    editVideo: 'वीडियो संपादित करें',
    noTagsFound: 'इस भाषा के लिए कोई वीडियो टैग नहीं मिला।',
    selectTagPrompt: 'इसके वीडियो और स्ट्रीमिंग फ़ाइलें देखने के लिए एक वीडियो टैग चुनें।',
    viewVideosBtn: 'वीडियो देखें',
    folder: 'फ़ोल्डर',
    views: 'व्यूज़',
    language: 'भाषा',
    teluguOption: 'तेलुगु (te)',
    malayalamOption: 'मलयालम (ml)',
    englishOption: 'अंग्रेज़ी (en)',
    slugChangeWarning: 'भाषा बदलने पर सर्वर पर शो फ़ोल्डर स्वचालित रूप से स्थानांतरित हो जाएगा।',
    descriptionLabel: 'विवरण',
    descriptionPlaceholder: 'संक्षिप्त विवरण दर्ज करें...',
    tagNameLabel: 'टैग नाम',
    tagSlugLabel: 'टैग स्लग',
    tagSlugHelper: 'भौतिक फ़ोल्डर नाम के लिए उपयोग किया जाता है। केवल अल्फ़ान्यूमेरिक और डैश।',
    tagSlugEditHelper: 'स्टोरेज डिसिंक से बचने के लिए स्लग बदला नहीं जा सकता।',
    tagImageLabel: 'थंबनेल छवि (वैकल्पिक)',
    uploadImage: 'छवि अपलोड करें',
    save: 'सहेजें',
    errorFieldsRequired: 'नाम और स्लग आवश्यक हैं',
    createTagModalTitle: 'वीडियो टैग बनाएं',
    editTagModalTitle: 'वीडियो टैग संपादित करें',
    colFileName: 'फ़ाइल नाम',
    colSize: 'आकार',
    colDate: 'निर्माण तिथि',
    colActions: 'कार्रवाई',
    playStream: 'स्ट्रीम चलाएं / देखें',
    confirmDeleteVideo: 'क्या आप वाकई इस वीडियो को हटाना चाहते हैं?',
    noRecordsFound: 'इस टैग फ़ोल्डर में कोई वीडियो उपलब्ध नहीं है।',
    teluguShowsHeading: 'तेलुगु शो (डिफ़ॉल्ट)',
    malayalamShowsHeading: 'मलयालम शो',
    englishShowsHeading: 'अंग्रेज़ी शो',
    colViewCount: 'व्यू काउंट',
    thumbnailLabel: 'थंबनेल छवि',
    uploadThumbnail: 'थंबनेल अपलोड करें',
    uploading: 'अपलोड हो रहा है...',
    removeThumbnail: 'थंबनेल हटाएं',
    thumbnailUrlLabel: 'थंबनेल URL',
    thumbnailUrlPlaceholder: 'https://... या छवि अपलोड करें',
    uploadFailed: 'छवि अपलोड विफल रही',
    errorFileNameRequired: 'फ़ाइल नाम आवश्यक है',
    errorInvalidViewCount: 'व्यू काउंट नकारात्मक नहीं हो सकता',
    errorVideoIdMissing: 'वीडियो आईडी अनुपलब्ध है। अद्यतन नहीं किया जा सकता।',
    showing: 'दिखा रहा है',
    of: 'का',
    items: 'आइटम',
    startTimeLabel: 'प्रसारण प्रारंभ समय',
    endTimeLabel: 'प्रसारण समाप्ति समय',
    editTiming: 'समय निर्धारित करें',
    editTimingModalTitle: 'शो समय सारणी',
    timingUpdatedSuccess: 'वीडियो टैग समय सफलतापूर्वक अपडेट किया गया',
    clearTiming: 'समय हटाएं',
    liveBadge: 'लाइव प्रसारण',
    simulateTimePlaceholder: 'समय सिमुलेट करें (HH:mm)',
    simulateTimeTooltip: 'सक्रिय शो देखने के लिए IST समय का अनुकरण करें (उदा. 07:30)',
    clearSimulation: 'सिमुलेशन रीसेट करें',
    timingLabel: 'समय',
  },
  ml: {
    pageTitle: 'വീഡിയോ ടാഗുകളും സ്ട്രീം മാനേജ്മെൻ്റും',
    pageSubtitle:
      'ഡൈനാമിക് വീഡിയോ ഫോൾഡറുകൾ നിയന്ത്രിക്കുകയും ഭാഷകളിലുടനീളം സ്ട്രീമിംഗ് ഉള്ളടക്കം കാണുകയും ചെയ്യുക',
    createTagBtn: '+ പുതിയ വീഡിയോ ടാഗ്',
    allLanguagesTab: 'എല്ലാ ഭാഷകളും',
    teluguTab: 'തെലുങ്ക് (te) ★സ്ഥിരസ്ഥിതി',
    malayalamTab: 'മലയാളം (ml)',
    englishTab: 'ഇംഗ്ലീഷ് (en)',
    teluguBadge: 'തെലുങ്ക്',
    malayalamBadge: 'മലയാളം',
    englishBadge: 'ഇംഗ്ലീഷ്',
    dailySyncBtn: 'പ്രതിദിന സമന്വയം',
    syncingBtn: 'സമന്വയിപ്പിക്കുന്നു...',
    syncSuccessMsg: 'വീഡിയോകൾ വിജയകരമായി സമന്വയിപ്പിച്ചു:',
    alreadySyncedMsg: 'ഈ ടാഗിനായുള്ള വീഡിയോകൾ ഇതിനകം സമന്വയിപ്പിച്ചു',
    searchPlaceholder: 'ഫയലിന്റെ പേര് ഉപയോഗിച്ച് വീഡിയോകൾ തിരയുക...',
    clearFilters: 'ഫിൽട്ടറുകൾ നീക്കം ചെയ്യുക',
    totalVideos: 'ആകെ വീഡിയോകൾ',
    editTag: 'ടാഗ് എഡിറ്റുചെയ്യുക',
    deleteTag: 'ടാഗ് ഡിലീറ്റ് ചെയ്യുക',
    accessDeniedTitle: 'പ്രവേശനം പരിമിതപ്പെടുത്തിയിരിക്കുന്നു',
    accessDeniedDesc: 'അംഗീകൃത റോളുകൾക്ക് മാത്രമേ ഈ പേജ് ആക്സസ് ചെയ്യാൻ കഴിയൂ.',
    deleteConfirmTitle: 'വീഡിയോ ടാഗ് ഡിലീറ്റ് ചെയ്യണോ?',
    deleteConfirmDesc:
      'ഈ ടാഗ് തീർച്ചയായും ഡിലീറ്റ് ചെയ്യണോ? ഇത് ബന്ധപ്പെട്ട ഫിസിക്കൽ ഫോൾഡറും അതിലെ എല്ലാ വീഡിയോകളും ശാശ്വതമായി ഇല്ലാതാക്കും.',
    cancel: 'റദ്ദാക്കുക',
    delete: 'ഡിലീറ്റ് ചെയ്യുക',
    editVideo: 'വീഡിയോ എഡിറ്റ് ചെയ്യുക',
    noTagsFound: 'ഈ ഭാഷയ്ക്കായി വീഡിയോ ടാഗുകളൊന്നും കണ്ടെത്തിയില്ല.',
    selectTagPrompt: 'വീഡിയോകളും സ്ട്രീമിംഗ് ഫയലുകളും കാണുന്നതിന് ഒരു വീഡിയോ ടാഗ് തിരഞ്ഞെടുക്കുക.',
    viewVideosBtn: 'വീഡിയോകൾ കാണുക',
    folder: 'ഫോൾഡർ',
    views: 'കാഴ്ചകൾ',
    language: 'ഭാഷ',
    teluguOption: 'തെലുങ്ക് (te)',
    malayalamOption: 'മലയാളം (ml)',
    englishOption: 'ഇംഗ്ലീഷ് (en)',
    slugChangeWarning: 'ഭാഷ മാറ്റുന്നത് സെർവറിലെ ഷോ ഫോൾഡർ സ്വയമേവ മാറ്റിസ്ഥാപിക്കും.',
    descriptionLabel: 'വിവരണം',
    descriptionPlaceholder: 'ചുരുങ്ങിയ വിവരണം നൽകുക...',
    tagNameLabel: 'ടാഗ് നാമം',
    tagSlugLabel: 'ടാഗ് സ്ലഗ്',
    tagSlugHelper: 'ഫിസിക്കൽ ഫോൾഡർ നാമത്തിനായി ഉപയോഗിക്കുന്നു. ആൽഫാന്യൂമെറിക്, ഡാഷുകൾ മാത്രം.',
    tagSlugEditHelper: 'സ്റ്റോറേജ് മാറ്റങ്ങൾ ഒഴിവാക്കാൻ സ്ലഗ് മാറ്റാൻ കഴിയില്ല.',
    tagImageLabel: 'ലഘുചിത്രം (ഓപ്ഷണൽ)',
    uploadImage: 'ചിത്രം അപ്‌ലോഡ് ചെയ്യുക',
    save: 'സേവ് ചെയ്യുക',
    errorFieldsRequired: 'പേരും സ്ലഗ്ഗും ആവശ്യമാണ്',
    createTagModalTitle: 'വീഡിയോ ടാഗ് സൃഷ്ടിക്കുക',
    editTagModalTitle: 'വീഡിയോ ടാഗ് എഡിറ്റ് ചെയ്യുക',
    colFileName: 'ഫയൽ നാമം',
    colSize: 'വലിപ്പം',
    colDate: 'സൃഷ്ടിച്ച തീയതി',
    colActions: 'നടപടികൾ',
    playStream: 'സ്ട്രീം പ്ലേ ചെയ്യുക / കാണുക',
    confirmDeleteVideo: 'ഈ വീഡിയോ തീർച്ചയായും ഡിലീറ്റ് ചെയ്യണോ?',
    noRecordsFound: 'ഈ ടാഗ് ഫോൾഡറിൽ വീഡിയോകളൊന്നും ലഭ്യമല്ല.',
    teluguShowsHeading: 'തെലുങ്ക് ഷോകൾ (സ്ഥിരസ്ഥിതി)',
    malayalamShowsHeading: 'മലയാളം ഷോകൾ',
    englishShowsHeading: 'ഇംഗ്ലീഷ് ഷോകൾ',
    colViewCount: 'കാഴ്ചകളുടെ എണ്ണം',
    thumbnailLabel: 'ലഘുചിത്രം',
    uploadThumbnail: 'ലഘുചിത്രം അപ്‌ലോഡ് ചെയ്യുക',
    uploading: 'അപ്‌ലോഡ് ചെയ്യുന്നു...',
    removeThumbnail: 'ലഘുചിത്രം നീക്കം ചെയ്യുക',
    thumbnailUrlLabel: 'ലഘുചിത്ര URL',
    thumbnailUrlPlaceholder: 'https://... അല്ലെങ്കിൽ ചിത്രം അപ്‌ലോഡ് ചെയ്യുക',
    uploadFailed: 'ചിത്രം അപ്‌ലോഡ് ചെയ്യുന്നത് പരാജയപ്പെട്ടു',
    errorFileNameRequired: 'ഫയൽ നാമം ആവശ്യമാണ്',
    errorInvalidViewCount: 'കാഴ്ചകളുടെ എണ്ണം നെഗറ്റീവ് ആകാൻ പാടില്ല',
    errorVideoIdMissing: 'വീഡിയോ ഐഡി ലഭ്യമല്ല. അപ്ഡേറ്റ് ചെയ്യാൻ കഴിയില്ല.',
    showing: 'കാണിക്കുന്നത്',
    of: 'ൽ',
    items: 'ഇനങ്ങൾ',
    startTimeLabel: 'സംപ്രേക്ഷണ ആരംഭ സമയം',
    endTimeLabel: 'സംപ്രേക്ഷണ അവസാന സമയം',
    editTiming: 'സമയം ക്രമീകരിക്കുക',
    editTimingModalTitle: 'ഷോ സമയക്രമം',
    timingUpdatedSuccess: 'വീడియో ടാഗ് സമയം വിജയകരമായി അപ്‌ഡേറ്റുചെയ്‌തു',
    clearTiming: 'സമയം മായ്‌ക്കുക',
    liveBadge: 'തത്സമയം',
    simulateTimePlaceholder: 'സമയം അനുകരിക്കുക (HH:mm)',
    simulateTimeTooltip: 'സജീവ ഷോകൾ പ്രിവ്യൂ ചെയ്യുന്നതിനായി IST സമയം അനുകരിക്കുക (ഉദാ. 07:30)',
    clearSimulation: 'സിമുലേഷൻ പുനഃക്രമീകരിക്കുക',
    timingLabel: 'സമയം',
  },
};

export const LiveTvVideosPage: React.FC = () => {
  const { language } = useLanguageStore();
  const { mode } = useAppTheme();
  const { user } = useUserStore();
  const isDark = mode === 'dark';
  const t = translations[language] || translations.en;

  const {
    selectedLanguage,
    setSelectedLanguage,
    tags,
    segregatedTags,
    selectedTagSlug,
    handleTagSelect,
    videos,
    loading,
    isSyncing,
    actionError,
    actionSuccess,
    actionInfo,
    setActionError,
    setActionSuccess,
    setActionInfo,
    searchQuery,
    setSearchQuery,
    simulatedTime,
    handleSimulatedTimeChange,
    page,
    setPage,
    totalPages,
    paginatedVideos,
    stats,
    // Modals
    createTagModalOpen,
    setCreateTagModalOpen,
    editTagModalOpen,
    setEditTagModalOpen,
    timingModalOpen,
    setTimingModalOpen,
    playerModalOpen,
    setPlayerModalOpen,
    editVideoModalOpen,
    setEditVideoModalOpen,
    activeTagForEdit,
    activeTagForTiming,
    activeVideoForPlayer,
    activeVideoForEdit,
    // Handlers
    handleCreateTag,
    handleUpdateTag,
    handleUpdateTagTiming,
    handleDeleteTag,
    handleDailySync,
    handlePlayVideo,
    handleDeleteVideo,
    handleOpenEditTagModal,
    handleOpenTimingModal,
    handleOpenEditVideoModal,
    handleUpdateVideo,
  } = useLiveTvVideosController();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const userRole = (user?.role || '').toLowerCase().trim();
  const canAccess =
    userRole === 'admin' ||
    userRole === 'administrator' ||
    userRole === 'superadmin' ||
    userRole === 'super_admin' ||
    userRole === 'creator' ||
    userRole === 'creators';

  const allowedLanguages: TagLanguage[] = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlLang = (
          params.get('lang') ||
          params.get('language') ||
          params.get('lan') ||
          params.get('from') ||
          ''
        )
          .toLowerCase()
          .trim();
        if (urlLang === 'ml' || urlLang === 'malayala' || urlLang === 'malayalam') return ['ml'];
        if (urlLang === 'te' || urlLang === 'telugu') return ['te'];
        if (urlLang === 'en' || urlLang === 'english') return ['en'];
        if (urlLang === 'all') return ['te', 'ml', 'en'];
      } catch (e) {}
    }
    const currentLang = (language || '').toLowerCase().trim();
    if (currentLang === 'ml' || currentLang === 'malayala' || currentLang === 'malayalam') {
      return ['ml'];
    }
    if (currentLang === 'te' || currentLang === 'telugu') {
      return ['te'];
    }
    return ['te', 'ml', 'en'];
  }, [language]);

  const selectedTag = tags.find((t) => t.slug === selectedTagSlug);

  const confirmDeleteTag = () => {
    if (selectedTagSlug) {
      handleDeleteTag(selectedTagSlug);
    }
    setDeleteConfirmOpen(false);
  };

  const renderLiveBadge = () => (
    <Chip
      size="small"
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              boxShadow: '0 0 6px #22c55e',
            }}
          />
          <span>{t.liveBadge || 'LIVE NOW'}</span>
        </Box>
      }
      sx={{
        fontWeight: 800,
        fontSize: '0.68rem',
        height: 20,
        backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)',
        color: isDark ? '#4ade80' : '#15803d',
        border: isDark ? '1px solid rgba(74, 222, 128, 0.4)' : '1px solid rgba(34, 197, 94, 0.35)',
        boxShadow: isDark ? '0 0 8px rgba(74, 222, 128, 0.25)' : 'none',
      }}
    />
  );

  const renderTimingChip = (startTime?: string | null, endTime?: string | null) => {
    if (!startTime && !endTime) return null;
    const text =
      startTime && endTime ? `${startTime} - ${endTime} IST` : `${startTime || endTime} IST`;
    return (
      <Chip
        size="small"
        icon={
          <AccessTime
            sx={{
              fontSize: '13px !important',
              color: isDark ? '#fde68a !important' : '#78350f !important',
            }}
          />
        }
        label={text}
        sx={{
          fontWeight: 600,
          fontSize: '0.72rem',
          height: 22,
          backgroundColor: isDark ? 'rgba(234, 179, 8, 0.12)' : 'rgba(234, 179, 8, 0.08)',
          color: isDark ? '#fde68a' : '#78350f',
          border: isDark
            ? '1px solid rgba(250, 204, 21, 0.2)'
            : '1px solid rgba(217, 119, 6, 0.18)',
          borderRadius: '6px',
        }}
      />
    );
  };

  const renderLanguageBadge = (lang?: string) => {
    const code = (lang || 'te').toLowerCase();
    let label = t.teluguBadge;
    let bg = isDark ? 'rgba(234, 179, 8, 0.15)' : 'rgba(234, 179, 8, 0.12)';
    let color = isDark ? '#facc15' : '#b45309';
    let border = isDark ? 'rgba(250, 204, 21, 0.35)' : 'rgba(217, 119, 6, 0.35)';

    if (code === 'ml') {
      label = t.malayalamBadge;
      bg = 'rgba(16, 185, 129, 0.15)';
      color = isDark ? '#6ee7b7' : '#047857';
      border = isDark ? 'rgba(110, 231, 183, 0.3)' : 'rgba(16, 185, 129, 0.3)';
    } else if (code === 'en') {
      label = t.englishBadge;
      bg = 'rgba(139, 92, 246, 0.15)';
      color = isDark ? '#c4b5fd' : '#6d28d9';
      border = isDark ? 'rgba(196, 181, 253, 0.3)' : 'rgba(139, 92, 246, 0.3)';
    }

    return (
      <Chip
        size="small"
        label={label}
        sx={{
          fontWeight: 700,
          fontSize: '0.72rem',
          backgroundColor: bg,
          color: color,
          border: `1px solid ${border}`,
          borderRadius: '6px',
        }}
      />
    );
  };

  const recordsPerPage = 20;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(circle at 10% 20%, rgba(234, 179, 8, 0.1) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.12) 0%, transparent 45%), linear-gradient(135deg, #161202 0%, #261e05 45%, #181300 100%)'
          : '#fffdfa',
        color: isDark ? '#ffffff' : '#1a1300',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Fixed Sidebar Panel */}
      <Sidebar activeHref="/livetvvideos" />

      {/* Main Content Area */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Top Header with Page Title matching Notification UI */}
        <Header title={t.pageTitle} />

        {/* Scrollable Body Area matching Notification UI */}
        <Box sx={{ pt: 2, px: 2, pb: 4, flex: 1, overflowY: 'auto' }}>
          {!canAccess ? (
            <Box
              sx={{
                p: 5,
                textAlign: 'center',
                backgroundColor: isDark ? 'rgba(28, 22, 3, 0.72)' : '#ffffff',
                borderRadius: '20px',
                border: isDark
                  ? '1px solid rgba(250, 204, 21, 0.25)'
                  : '1px solid rgba(217, 119, 6, 0.2)',
                boxShadow: isDark
                  ? '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(234, 179, 8, 0.1)'
                  : '0 8px 30px rgba(217, 119, 6, 0.08)',
                my: 'auto',
              }}
            >
              <Lock sx={{ fontSize: 60, color: '#ef4444', mb: 2 }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, mb: 1, color: isDark ? '#ffffff' : '#1a1300' }}
              >
                {t.accessDeniedTitle}
              </Typography>
              <Typography variant="body1" sx={{ color: isDark ? '#fde68a' : '#78350f' }}>
                {t.accessDeniedDesc}
              </Typography>
            </Box>
          ) : (
            <>
              {/* Header Banner Section */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                  <LiveTv
                    sx={{
                      color: '#facc15',
                      fontSize: 28,
                      filter: isDark ? 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.45))' : 'none',
                    }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.25rem', md: '1.5rem' },
                      color: isDark ? '#ffffff' : '#1a1300',
                    }}
                  >
                    {t.pageTitle}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: isDark ? '#fde68a' : '#78350f' }}>
                  {t.pageSubtitle}
                </Typography>
              </Box>

              {/* Action Notifications */}
              {actionError && (
                <Alert
                  severity="error"
                  onClose={() => setActionError(null)}
                  sx={{ borderRadius: '12px', mb: 2 }}
                >
                  {actionError}
                </Alert>
              )}
              {actionSuccess && (
                <Alert
                  severity="success"
                  onClose={() => setActionSuccess(null)}
                  sx={{ borderRadius: '12px', mb: 2 }}
                >
                  {actionSuccess}
                </Alert>
              )}
              {actionInfo && (
                <Alert
                  severity="info"
                  onClose={() => setActionInfo(null)}
                  sx={{ borderRadius: '12px', mb: 2 }}
                >
                  {actionInfo}
                </Alert>
              )}

              {/* ── Language Filter Tabs (Single-Row Pills matching Notification UI & Login Flow Colors) ── */}
              {allowedLanguages.length > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    mb: 2,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  {allowedLanguages.includes('te') && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelectedLanguage('te')}
                      sx={{
                        textTransform: 'none',
                        fontWeight: selectedLanguage === 'te' ? 700 : 500,
                        fontSize: '0.8rem',
                        borderRadius: '10px',
                        px: 2,
                        py: 0.6,
                        backgroundColor:
                          selectedLanguage === 'te'
                            ? '#facc15'
                            : isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : 'rgba(234, 179, 8, 0.08)',
                        color:
                          selectedLanguage === 'te' ? '#1a1300' : isDark ? '#fde68a' : '#78350f',
                        border: '1px solid',
                        borderColor:
                          selectedLanguage === 'te'
                            ? '#facc15'
                            : isDark
                              ? 'rgba(250, 204, 21, 0.2)'
                              : 'rgba(217, 119, 6, 0.25)',
                        boxShadow:
                          selectedLanguage === 'te' ? '0 4px 15px rgba(234, 179, 8, 0.35)' : 'none',
                        '&:hover': {
                          backgroundColor:
                            selectedLanguage === 'te'
                              ? '#fde047'
                              : isDark
                                ? 'rgba(234, 179, 8, 0.15)'
                                : 'rgba(234, 179, 8, 0.14)',
                          borderColor: '#facc15',
                          boxShadow:
                            selectedLanguage === 'te'
                              ? '0 6px 18px rgba(234, 179, 8, 0.45)'
                              : 'none',
                        },
                      }}
                    >
                      {t.teluguTab}
                    </Button>
                  )}

                  {allowedLanguages.includes('ml') && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelectedLanguage('ml')}
                      sx={{
                        textTransform: 'none',
                        fontWeight: selectedLanguage === 'ml' ? 700 : 500,
                        fontSize: '0.8rem',
                        borderRadius: '10px',
                        px: 2,
                        py: 0.6,
                        backgroundColor:
                          selectedLanguage === 'ml'
                            ? '#facc15'
                            : isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : 'rgba(234, 179, 8, 0.08)',
                        color:
                          selectedLanguage === 'ml' ? '#1a1300' : isDark ? '#fde68a' : '#78350f',
                        border: '1px solid',
                        borderColor:
                          selectedLanguage === 'ml'
                            ? '#facc15'
                            : isDark
                              ? 'rgba(250, 204, 21, 0.2)'
                              : 'rgba(217, 119, 6, 0.25)',
                        boxShadow:
                          selectedLanguage === 'ml' ? '0 4px 15px rgba(234, 179, 8, 0.35)' : 'none',
                        '&:hover': {
                          backgroundColor:
                            selectedLanguage === 'ml'
                              ? '#fde047'
                              : isDark
                                ? 'rgba(234, 179, 8, 0.15)'
                                : 'rgba(234, 179, 8, 0.14)',
                          borderColor: '#facc15',
                          boxShadow:
                            selectedLanguage === 'ml'
                              ? '0 6px 18px rgba(234, 179, 8, 0.45)'
                              : 'none',
                        },
                      }}
                    >
                      {t.malayalamTab}
                    </Button>
                  )}

                  {allowedLanguages.includes('en') && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => setSelectedLanguage('en')}
                      sx={{
                        textTransform: 'none',
                        fontWeight: selectedLanguage === 'en' ? 700 : 500,
                        fontSize: '0.8rem',
                        borderRadius: '10px',
                        px: 2,
                        py: 0.6,
                        backgroundColor:
                          selectedLanguage === 'en'
                            ? '#facc15'
                            : isDark
                              ? 'rgba(255, 255, 255, 0.06)'
                              : 'rgba(234, 179, 8, 0.08)',
                        color:
                          selectedLanguage === 'en' ? '#1a1300' : isDark ? '#fde68a' : '#78350f',
                        border: '1px solid',
                        borderColor:
                          selectedLanguage === 'en'
                            ? '#facc15'
                            : isDark
                              ? 'rgba(250, 204, 21, 0.2)'
                              : 'rgba(217, 119, 6, 0.25)',
                        boxShadow:
                          selectedLanguage === 'en' ? '0 4px 15px rgba(234, 179, 8, 0.35)' : 'none',
                        '&:hover': {
                          backgroundColor:
                            selectedLanguage === 'en'
                              ? '#fde047'
                              : isDark
                                ? 'rgba(234, 179, 8, 0.15)'
                                : 'rgba(234, 179, 8, 0.14)',
                          borderColor: '#facc15',
                          boxShadow:
                            selectedLanguage === 'en'
                              ? '0 6px 18px rgba(234, 179, 8, 0.45)'
                              : 'none',
                        },
                      }}
                    >
                      {t.englishTab}
                    </Button>
                  )}

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setSelectedLanguage('all')}
                    sx={{
                      textTransform: 'none',
                      fontWeight: selectedLanguage === 'all' ? 700 : 500,
                      fontSize: '0.8rem',
                      borderRadius: '10px',
                      px: 2,
                      py: 0.6,
                      backgroundColor:
                        selectedLanguage === 'all'
                          ? '#facc15'
                          : isDark
                            ? 'rgba(255, 255, 255, 0.06)'
                            : 'rgba(234, 179, 8, 0.08)',
                      color:
                        selectedLanguage === 'all' ? '#1a1300' : isDark ? '#fde68a' : '#78350f',
                      border: '1px solid',
                      borderColor:
                        selectedLanguage === 'all'
                          ? '#facc15'
                          : isDark
                            ? 'rgba(250, 204, 21, 0.2)'
                            : 'rgba(217, 119, 6, 0.25)',
                      boxShadow:
                        selectedLanguage === 'all' ? '0 4px 15px rgba(234, 179, 8, 0.35)' : 'none',
                      '&:hover': {
                        backgroundColor:
                          selectedLanguage === 'all'
                            ? '#fde047'
                            : isDark
                              ? 'rgba(234, 179, 8, 0.15)'
                              : 'rgba(234, 179, 8, 0.14)',
                        borderColor: '#facc15',
                        boxShadow:
                          selectedLanguage === 'all'
                            ? '0 6px 18px rgba(234, 179, 8, 0.45)'
                            : 'none',
                      },
                    }}
                  >
                    {t.allLanguagesTab}
                  </Button>
                </Box>
              )}

              {/* ── Single-Line Filter Panel with Action Buttons matching Notification UI & Login Flow Colors ── */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  mb: 2.5,
                  alignItems: 'center',
                  flexWrap: { xs: 'wrap', md: 'nowrap' },
                }}
              >
                {/* 1. Live Search */}
                <TextField
                  placeholder={t.searchPlaceholder}
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    width: { xs: '100%', sm: '260px' },
                    flexShrink: 0,
                    '& .MuiOutlinedInput-root': {
                      color: isDark ? '#ffffff' : '#1a1300',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      height: '34px',
                      '& fieldset': {
                        borderColor: isDark
                          ? 'rgba(250, 204, 21, 0.25)'
                          : 'rgba(217, 119, 6, 0.25)',
                      },
                      '&:hover fieldset': {
                        borderColor: isDark ? 'rgba(250, 204, 21, 0.5)' : 'rgba(217, 119, 6, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#facc15',
                        boxShadow: '0 0 10px rgba(250, 204, 21, 0.25)',
                      },
                    },
                    '& .MuiInputBase-input': { py: 0.6, px: 1, fontSize: '0.75rem' },
                  }}
                  InputProps={{
                    endAdornment: (
                      <Search sx={{ color: isDark ? '#facc15' : '#d97706', fontSize: '0.95rem' }} />
                    ),
                  }}
                />

                {/* Clear Filter Button */}
                {searchQuery && (
                  <Tooltip title={t.clearFilters || 'Clear Filters'}>
                    <IconButton
                      onClick={() => setSearchQuery('')}
                      sx={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        color: '#f44336',
                        backgroundColor: isDark ? 'rgba(244,67,54,0.12)' : 'rgba(244,67,54,0.08)',
                        border: isDark
                          ? '1px solid rgba(244,67,54,0.3)'
                          : '1px solid rgba(244,67,54,0.3)',
                        '&:hover': { backgroundColor: 'rgba(244,67,54,0.2)' },
                        flexShrink: 0,
                      }}
                    >
                      <FilterListOff sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                  </Tooltip>
                )}

                {/* 2. Simulated Time Preview */}
                <Tooltip
                  title={
                    t.simulateTimeTooltip ||
                    'Simulate IST time to preview active shows (e.g. 07:30)'
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TextField
                      type="time"
                      size="small"
                      value={simulatedTime}
                      onChange={(e) => handleSimulatedTimeChange(e.target.value)}
                      placeholder={t.simulateTimePlaceholder}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        width: { xs: '130px', sm: '145px' },
                        flexShrink: 0,
                        '& .MuiOutlinedInput-root': {
                          color: isDark ? '#ffffff' : '#1a1300',
                          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          height: '34px',
                          '& fieldset': {
                            borderColor: simulatedTime
                              ? '#22c55e'
                              : isDark
                                ? 'rgba(250, 204, 21, 0.25)'
                                : 'rgba(217, 119, 6, 0.25)',
                          },
                          '&:hover fieldset': {
                            borderColor: isDark
                              ? 'rgba(250, 204, 21, 0.5)'
                              : 'rgba(217, 119, 6, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#facc15',
                            boxShadow: '0 0 10px rgba(250, 204, 21, 0.25)',
                          },
                        },
                        '& .MuiInputBase-input': { py: 0.6, px: 1, fontSize: '0.75rem' },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTime
                              sx={{ color: isDark ? '#facc15' : '#d97706', fontSize: '0.95rem' }}
                            />
                          </InputAdornment>
                        ),
                      }}
                    />
                    {simulatedTime && (
                      <Tooltip title={t.clearSimulation || 'Reset Simulation'}>
                        <IconButton
                          size="small"
                          onClick={() => handleSimulatedTimeChange('')}
                          sx={{
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            color: '#f44336',
                            backgroundColor: isDark
                              ? 'rgba(244,67,54,0.12)'
                              : 'rgba(244,67,54,0.08)',
                            border: '1px solid rgba(244,67,54,0.3)',
                            '&:hover': { backgroundColor: 'rgba(244,67,54,0.2)' },
                          }}
                        >
                          <FilterListOff sx={{ fontSize: '1rem' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Tooltip>

                {/* Right: Action Buttons matching Notification UI & Login Flow Warm Palette */}
                <Box
                  sx={{
                    ml: { xs: 0, md: 'auto' },
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    width: { xs: '100%', md: 'auto' },
                  }}
                >
                  {selectedTag && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        isSyncing ? <CircularProgress size={14} /> : <Sync sx={{ fontSize: 16 }} />
                      }
                      disabled={isSyncing}
                      onClick={() => handleDailySync(selectedTag.slug)}
                      sx={{
                        borderRadius: '10px',
                        height: '34px',
                        px: 1.8,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        borderColor: isDark ? 'rgba(250, 204, 21, 0.4)' : 'rgba(217, 119, 6, 0.4)',
                        color: isDark ? '#fef9c3' : '#92400e',
                        backgroundColor: isDark
                          ? 'rgba(234, 179, 8, 0.08)'
                          : 'rgba(234, 179, 8, 0.05)',
                        '&:hover': {
                          borderColor: '#facc15',
                          backgroundColor: isDark
                            ? 'rgba(234, 179, 8, 0.2)'
                            : 'rgba(234, 179, 8, 0.14)',
                          boxShadow: '0 0 15px rgba(234, 179, 8, 0.25)',
                        },
                      }}
                    >
                      {isSyncing ? t.syncingBtn : t.dailySyncBtn}
                    </Button>
                  )}

                  {selectedTag && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AccessTime sx={{ fontSize: 16 }} />}
                      onClick={() => handleOpenTimingModal(selectedTag)}
                      sx={{
                        borderRadius: '10px',
                        height: '34px',
                        px: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(217, 119, 6, 0.3)',
                        color: isDark ? '#fde68a' : '#78350f',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                        '&:hover': {
                          borderColor: '#facc15',
                          backgroundColor: isDark
                            ? 'rgba(234, 179, 8, 0.15)'
                            : 'rgba(234, 179, 8, 0.08)',
                          boxShadow: '0 0 12px rgba(234, 179, 8, 0.2)',
                        },
                      }}
                    >
                      {t.editTiming}
                    </Button>
                  )}

                  {selectedTag && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit sx={{ fontSize: 16 }} />}
                      onClick={() => handleOpenEditTagModal(selectedTag)}
                      sx={{
                        borderRadius: '10px',
                        height: '34px',
                        px: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        borderColor: isDark ? 'rgba(250, 204, 21, 0.3)' : 'rgba(217, 119, 6, 0.3)',
                        color: isDark ? '#fde68a' : '#78350f',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : '#ffffff',
                        '&:hover': {
                          borderColor: '#facc15',
                          backgroundColor: isDark
                            ? 'rgba(234, 179, 8, 0.15)'
                            : 'rgba(234, 179, 8, 0.08)',
                          boxShadow: '0 0 12px rgba(234, 179, 8, 0.2)',
                        },
                      }}
                    >
                      {t.editTag}
                    </Button>
                  )}

                  {selectedTag && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteSweep sx={{ fontSize: 16 }} />}
                      onClick={() => setDeleteConfirmOpen(true)}
                      sx={{
                        borderRadius: '10px',
                        height: '34px',
                        px: 1.5,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                      }}
                    >
                      {t.deleteTag}
                    </Button>
                  )}

                  <Button
                    id="create-tag-btn"
                    variant="contained"
                    startIcon={<AddCircleOutline sx={{ fontSize: '1rem' }} />}
                    onClick={() => setCreateTagModalOpen(true)}
                    sx={{
                      borderRadius: '10px',
                      height: '34px',
                      px: 2,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                      color: '#1a1300',
                      boxShadow: '0 4px 15px rgba(234, 179, 8, 0.35)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)',
                        boxShadow: '0 8px 25px rgba(234, 179, 8, 0.5)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {t.createTagBtn}
                  </Button>
                </Box>
              </Box>

              {/* Categorized Accordions if "All Languages" is selected */}
              {selectedLanguage === 'all' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                  {/* Telugu Group */}
                  <Accordion
                    defaultExpanded
                    sx={{
                      backgroundColor: isDark ? 'rgba(28, 22, 3, 0.72)' : '#ffffff',
                      color: isDark ? '#ffffff' : '#1a1300',
                      borderRadius: '16px !important',
                      border: isDark
                        ? '1px solid rgba(250, 204, 21, 0.25)'
                        : '1px solid rgba(217, 119, 6, 0.2)',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ color: isDark ? '#facc15' : '#b45309' }} />}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{t.teluguShowsHeading}</Typography>
                        <Chip
                          size="small"
                          label={`${segregatedTags.te?.length || 0}`}
                          sx={{
                            fontWeight: 700,
                            height: 22,
                            backgroundColor: isDark
                              ? 'rgba(234, 179, 8, 0.15)'
                              : 'rgba(234, 179, 8, 0.12)',
                            color: isDark ? '#facc15' : '#b45309',
                          }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        {segregatedTags.te?.length > 0 ? (
                          segregatedTags.te.map((tag) => (
                            <Button
                              key={tag.slug}
                              variant={selectedTagSlug === tag.slug ? 'contained' : 'outlined'}
                              onClick={() => handleTagSelect(tag.slug)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '10px',
                                ...(selectedTagSlug === tag.slug
                                  ? {
                                      background:
                                        'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                                      color: '#1a1300',
                                      boxShadow: '0 4px 15px rgba(234, 179, 8, 0.35)',
                                    }
                                  : {
                                      borderColor: isDark
                                        ? 'rgba(250, 204, 21, 0.25)'
                                        : 'rgba(217, 119, 6, 0.25)',
                                      color: isDark ? '#fde68a' : '#78350f',
                                      backgroundColor: isDark
                                        ? 'rgba(255, 255, 255, 0.04)'
                                        : '#ffffff',
                                      '&:hover': {
                                        borderColor: '#facc15',
                                        backgroundColor: isDark
                                          ? 'rgba(234, 179, 8, 0.12)'
                                          : 'rgba(234, 179, 8, 0.08)',
                                      },
                                    }),
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <span>{tag.name}</span>
                                {(tag.isLive || tag.isActive) && renderLiveBadge()}
                              </Box>
                            </Button>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ opacity: 0.6 }}>
                            {t.noTagsFound}
                          </Typography>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* Malayalam Group */}
                  <Accordion
                    sx={{
                      backgroundColor: isDark ? 'rgba(28, 22, 3, 0.72)' : '#ffffff',
                      color: isDark ? '#ffffff' : '#1a1300',
                      borderRadius: '16px !important',
                      border: isDark
                        ? '1px solid rgba(250, 204, 21, 0.25)'
                        : '1px solid rgba(217, 119, 6, 0.2)',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ color: isDark ? '#facc15' : '#b45309' }} />}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{t.malayalamShowsHeading}</Typography>
                        <Chip
                          size="small"
                          label={`${segregatedTags.ml?.length || 0}`}
                          sx={{
                            fontWeight: 700,
                            height: 22,
                            backgroundColor: isDark
                              ? 'rgba(234, 179, 8, 0.15)'
                              : 'rgba(234, 179, 8, 0.12)',
                            color: isDark ? '#facc15' : '#b45309',
                          }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        {segregatedTags.ml?.length > 0 ? (
                          segregatedTags.ml.map((tag) => (
                            <Button
                              key={tag.slug}
                              variant={selectedTagSlug === tag.slug ? 'contained' : 'outlined'}
                              onClick={() => handleTagSelect(tag.slug)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '10px',
                                ...(selectedTagSlug === tag.slug
                                  ? {
                                      background:
                                        'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                                      color: '#1a1300',
                                      boxShadow: '0 4px 15px rgba(234, 179, 8, 0.35)',
                                    }
                                  : {
                                      borderColor: isDark
                                        ? 'rgba(250, 204, 21, 0.25)'
                                        : 'rgba(217, 119, 6, 0.25)',
                                      color: isDark ? '#fde68a' : '#78350f',
                                      backgroundColor: isDark
                                        ? 'rgba(255, 255, 255, 0.04)'
                                        : '#ffffff',
                                      '&:hover': {
                                        borderColor: '#facc15',
                                        backgroundColor: isDark
                                          ? 'rgba(234, 179, 8, 0.12)'
                                          : 'rgba(234, 179, 8, 0.08)',
                                      },
                                    }),
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <span>{tag.name}</span>
                                {(tag.isLive || tag.isActive) && renderLiveBadge()}
                              </Box>
                            </Button>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ opacity: 0.6 }}>
                            {t.noTagsFound}
                          </Typography>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>

                  {/* English Group */}
                  <Accordion
                    sx={{
                      backgroundColor: isDark ? 'rgba(28, 22, 3, 0.72)' : '#ffffff',
                      color: isDark ? '#ffffff' : '#1a1300',
                      borderRadius: '16px !important',
                      border: isDark
                        ? '1px solid rgba(250, 204, 21, 0.25)'
                        : '1px solid rgba(217, 119, 6, 0.2)',
                      '&:before': { display: 'none' },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore sx={{ color: isDark ? '#facc15' : '#b45309' }} />}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography sx={{ fontWeight: 700 }}>{t.englishShowsHeading}</Typography>
                        <Chip
                          size="small"
                          label={`${segregatedTags.en?.length || 0}`}
                          sx={{
                            fontWeight: 700,
                            height: 22,
                            backgroundColor: isDark
                              ? 'rgba(234, 179, 8, 0.15)'
                              : 'rgba(234, 179, 8, 0.12)',
                            color: isDark ? '#facc15' : '#b45309',
                          }}
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        {segregatedTags.en?.length > 0 ? (
                          segregatedTags.en.map((tag) => (
                            <Button
                              key={tag.slug}
                              variant={selectedTagSlug === tag.slug ? 'contained' : 'outlined'}
                              onClick={() => handleTagSelect(tag.slug)}
                              sx={{
                                textTransform: 'none',
                                fontWeight: 700,
                                borderRadius: '10px',
                                ...(selectedTagSlug === tag.slug
                                  ? {
                                      background:
                                        'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
                                      color: '#1a1300',
                                      boxShadow: '0 4px 15px rgba(234, 179, 8, 0.35)',
                                    }
                                  : {
                                      borderColor: isDark
                                        ? 'rgba(250, 204, 21, 0.25)'
                                        : 'rgba(217, 119, 6, 0.25)',
                                      color: isDark ? '#fde68a' : '#78350f',
                                      backgroundColor: isDark
                                        ? 'rgba(255, 255, 255, 0.04)'
                                        : '#ffffff',
                                      '&:hover': {
                                        borderColor: '#facc15',
                                        backgroundColor: isDark
                                          ? 'rgba(234, 179, 8, 0.12)'
                                          : 'rgba(234, 179, 8, 0.08)',
                                      },
                                    }),
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                <span>{tag.name}</span>
                                {(tag.isLive || tag.isActive) && renderLiveBadge()}
                              </Box>
                            </Button>
                          ))
                        ) : (
                          <Typography variant="body2" sx={{ opacity: 0.6 }}>
                            {t.noTagsFound}
                          </Typography>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </Box>
              )}

              {/* Tag Selector Tabs for Single-Language mode */}
              {selectedLanguage !== 'all' && tags.length > 0 && (
                <Box
                  sx={{
                    borderBottom: 1,
                    borderColor: isDark ? 'rgba(250, 204, 21, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                    mb: 2.5,
                  }}
                >
                  <Tabs
                    value={selectedTagSlug || false}
                    onChange={(_, val) => handleTagSelect(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      minHeight: '40px',
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        minHeight: '38px',
                        py: 0.5,
                        px: 1.8,
                        color: isDark ? '#fde68a' : '#78350f',
                        '&.Mui-selected': {
                          color: isDark ? '#facc15' : '#b45309',
                        },
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#facc15',
                        height: 2.5,
                      },
                    }}
                  >
                    {tags.map((tag) => (
                      <Tab
                        key={tag.slug}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{tag.name}</span>
                            {(tag.isLive || tag.isActive) && renderLiveBadge()}
                            {renderLanguageBadge(tag.language)}
                          </Box>
                        }
                        value={tag.slug}
                      />
                    ))}
                  </Tabs>
                </Box>
              )}

              {/* Selected Tag Header info */}
              {selectedTag ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  {selectedTag.thumbnailUrl ? (
                    <Avatar
                      src={selectedTag.thumbnailUrl}
                      variant="rounded"
                      sx={{ width: 36, height: 36, borderRadius: '8px' }}
                    />
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        backgroundColor: isDark
                          ? 'rgba(234, 179, 8, 0.15)'
                          : 'rgba(234, 179, 8, 0.12)',
                        color: '#facc15',
                      }}
                    >
                      <LiveTv fontSize="small" />
                    </Avatar>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 800, color: isDark ? '#ffffff' : '#1a1300' }}
                    >
                      {selectedTag.name}
                    </Typography>
                    {(selectedTag.isLive || selectedTag.isActive) && renderLiveBadge()}
                    {renderTimingChip(selectedTag.startTime, selectedTag.endTime)}
                    {renderLanguageBadge(selectedTag.language)}
                    <Chip
                      size="small"
                      label={`${stats.total || 0} ${t.items || 'items'}`}
                      sx={{
                        fontWeight: 700,
                        height: 22,
                        fontSize: '0.72rem',
                        backgroundColor: isDark
                          ? 'rgba(234, 179, 8, 0.12)'
                          : 'rgba(234, 179, 8, 0.08)',
                        color: isDark ? '#fde68a' : '#78350f',
                        border: isDark
                          ? '1px solid rgba(250, 204, 21, 0.2)'
                          : '1px solid rgba(217, 119, 6, 0.15)',
                      }}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography
                    variant="body1"
                    sx={{ color: isDark ? '#fde68a' : '#78350f', opacity: 0.8 }}
                  >
                    {tags.length === 0 ? t.noTagsFound : t.selectTagPrompt}
                  </Typography>
                </Box>
              )}

              {/* Table View */}
              {loading ? (
                <Loader message="Loading streaming videos..." minHeight="300px" />
              ) : (
                selectedTag && (
                  <LiveTvVideosTable
                    videos={paginatedVideos}
                    t={t}
                    isDark={isDark}
                    onPlay={handlePlayVideo}
                    onEditVideo={handleOpenEditVideoModal}
                    onDeleteVideo={handleDeleteVideo}
                  />
                )
              )}

              {/* Footer Pagination — matching Notification UI & Login Flow Styling */}
              {stats.total > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mt: 2.5,
                    px: 1,
                    flexWrap: 'wrap',
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: isDark ? '#fde68a' : '#78350f',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                    }}
                  >
                    {t.showing || 'Showing'} {(page - 1) * recordsPerPage + 1}–
                    {Math.min(page * recordsPerPage, stats.total)} {t.of || 'of'} {stats.total}{' '}
                    {t.items || 'items'}
                  </Typography>

                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, val) => setPage(val)}
                    shape="rounded"
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: isDark ? '#fde68a' : '#1a1300',
                        fontWeight: 600,
                        borderRadius: '8px',
                        '&:hover': {
                          backgroundColor: isDark
                            ? 'rgba(234, 179, 8, 0.2)'
                            : 'rgba(234, 179, 8, 0.14)',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#facc15 !important',
                          color: '#1a1300 !important',
                          fontWeight: 700,
                          boxShadow: '0 2px 8px rgba(234, 179, 8, 0.35)',
                          '&:hover': {
                            backgroundColor: '#fde047 !important',
                          },
                        },
                      },
                    }}
                  />
                </Box>
              )}

              {/* Modals */}
              <TagCreateModal
                open={createTagModalOpen}
                onClose={() => setCreateTagModalOpen(false)}
                onSave={handleCreateTag}
                isDark={isDark}
                t={t}
                initialLanguage={
                  (selectedLanguage === 'all'
                    ? allowedLanguages[0] || 'te'
                    : selectedLanguage) as TagLanguage
                }
                allowedLanguages={allowedLanguages}
              />

              <TagEditModal
                open={editTagModalOpen}
                onClose={() => setEditTagModalOpen(false)}
                tag={activeTagForEdit}
                onSave={handleUpdateTag}
                isDark={isDark}
                t={t}
                allowedLanguages={allowedLanguages}
              />

              <TagTimingModal
                open={timingModalOpen}
                onClose={() => setTimingModalOpen(false)}
                tag={activeTagForTiming}
                onSave={handleUpdateTagTiming}
                isDark={isDark}
                t={t}
              />

              <VideoPlayerModal
                open={playerModalOpen}
                onClose={() => setPlayerModalOpen(false)}
                video={activeVideoForPlayer}
                isDark={isDark}
                t={t}
              />

              <VideoEditModal
                open={editVideoModalOpen}
                onClose={() => setEditVideoModalOpen(false)}
                video={activeVideoForEdit}
                onSave={handleUpdateVideo}
                isDark={isDark}
                t={t}
              />

              {/* Delete Confirm Dialog */}
              <Dialog
                open={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                PaperProps={{
                  sx: {
                    backgroundColor: isDark ? 'rgba(28, 22, 3, 0.96)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#1a1300',
                    border: isDark
                      ? '1px solid rgba(250, 204, 21, 0.25)'
                      : '1px solid rgba(217, 119, 6, 0.2)',
                    borderRadius: '20px',
                    boxShadow: isDark
                      ? '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(234, 179, 8, 0.15)'
                      : '0 10px 40px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <DialogTitle sx={{ fontWeight: 700, color: '#ef4444' }}>
                  {t.deleteConfirmTitle}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText sx={{ color: isDark ? '#fde68a' : '#78350f' }}>
                    {t.deleteConfirmDesc}
                  </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                  <Button
                    onClick={() => setDeleteConfirmOpen(false)}
                    sx={{ color: isDark ? '#fde68a' : undefined }}
                  >
                    {t.cancel}
                  </Button>
                  <Button
                    onClick={confirmDeleteTag}
                    color="error"
                    variant="contained"
                    sx={{ borderRadius: '8px' }}
                  >
                    {t.delete}
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};
