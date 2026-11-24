import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Pagination,
  Button,
  Select,
  MenuItem,
} from '@mui/material';
import { Search, Add } from '@mui/icons-material';
import { useInhouseReelsController } from '../hooks/useInhouseReelsController';
import { InhouseReelsTable } from './InhouseReelsTable';
import { InhouseReelsDrawer } from './InhouseReelsDrawer';
import { inhouseReelsTranslations } from '../translations/inhouseReelsTranslations';
import { useLanguageStore } from '@/core/storage/language-store';

interface InhouseReelsTabProps {
  isDark: boolean;
  t?: any;
}

export const InhouseReelsTab: React.FC<InhouseReelsTabProps> = ({ isDark, t }) => {
  const { language: currentLang } = useLanguageStore();
  const activeLangKey = (currentLang as keyof typeof inhouseReelsTranslations) || 'en';
  const tabT = inhouseReelsTranslations[activeLangKey] || inhouseReelsTranslations.en;

  const {
    paginatedData,
    loading,
    page,
    totalPages,
    setPage,
    filterTitle,
    setFilterTitle,
    filterLang,
    setFilterLang,
    drawerOpen,
    isEditMode,
    selectedReel,
    handleAddClick,
    handleEditClick,
    handleCloseDrawer,
    handleSaveSuccess,
    handleDelete,
    handleStatusToggle,
  } = useInhouseReelsController();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder={tabT.searchTitle}
          variant="outlined"
          size="small"
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
          sx={{
            minWidth: '220px',
            '& .MuiOutlinedInput-root': {
              color: isDark ? '#ffffff' : '#1c1445',
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
              borderRadius: '12px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: isDark ? '#d0caeb' : '#5c548a', fontSize: '1.1rem' }} />
              </InputAdornment>
            ),
            endAdornment: filterTitle ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setFilterTitle('')}
                  sx={{ color: isDark ? '#d0caeb' : '#9e9e9e', p: 0.3 }}
                >
                  <Typography sx={{ fontSize: '0.75rem', lineHeight: 1 }}>✕</Typography>
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <Select
          size="small"
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value as string)}
          sx={{
            minWidth: '190px',
            color: isDark ? '#ffffff' : '#1c1445',
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#ffffff',
            borderRadius: '12px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#facc15' : '#1a1300',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: isDark ? '#facc15' : '#1a1300',
            },
            '& .MuiSelect-icon': {
              color: isDark ? '#d0caeb' : '#5c548a',
            },
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: isDark ? '#1a1140' : '#ffffff',
                color: isDark ? '#ffffff' : '#1c1445',
                borderRadius: '12px',
              },
            },
          }}
        >
          <MenuItem value="te">{tabT.telugu}</MenuItem>
          <MenuItem value="en">{tabT.english}</MenuItem>
          <MenuItem value="hi">{tabT.hindi}</MenuItem>
          <MenuItem value="ml">{tabT.malayalam}</MenuItem>
          <MenuItem value="all">{tabT.allLanguages}</MenuItem>
        </Select>

        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddClick}
          sx={{
            backgroundColor: isDark ? '#facc15' : '#1a1300',
            color: isDark ? '#1a1300' : '#ffffff',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            '&:hover': {
              backgroundColor: isDark ? '#8bc5d6' : '#130d30',
            },
          }}
        >
          {tabT.addInhouseReel}
        </Button>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        <InhouseReelsTable
          data={paginatedData}
          loading={loading}
          isDark={isDark}
          t={t}
          onEdit={handleEditClick}
          onDelete={handleDelete}
          onToggleStatus={handleStatusToggle}
        />

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              variant="outlined"
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: isDark ? '#d0caeb' : '#5c548a',
                  borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: isDark ? 'rgba(166,226,245,0.15)' : 'rgba(28,20,69,0.1)',
                    color: isDark ? '#facc15' : '#1a1300',
                    borderColor: isDark ? '#facc15' : '#1a1300',
                    '&:hover': {
                      backgroundColor: isDark ? 'rgba(166,226,245,0.25)' : 'rgba(28,20,69,0.15)',
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </Box>

      <InhouseReelsDrawer
        open={drawerOpen}
        isEditMode={isEditMode}
        selectedReel={selectedReel}
        defaultLang={filterLang}
        onClose={handleCloseDrawer}
        onSuccess={handleSaveSuccess}
        isDark={isDark}
        t={t}
      />
    </Box>
  );
};
