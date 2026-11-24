import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import { PlayCircleOutline, FavoriteBorder, ChatBubbleOutline } from '@mui/icons-material';
import { UploadedReel } from '../domain/reels.model';
import { inhouseReelsTranslations } from '../translations/inhouseReelsTranslations';
import { useLanguageStore } from '@/core/storage/language-store';

interface InhouseReelsTableProps {
  data: UploadedReel[];
  loading: boolean;
  isDark: boolean;
  t?: any;
  onEdit: (reel: UploadedReel) => void;
  onDelete: (id: string, confirmMessage?: string, failMessage?: string) => void;
  onToggleStatus: (reel: UploadedReel, failMessage?: string) => void;
}

export const InhouseReelsTable: React.FC<InhouseReelsTableProps> = ({
  data,
  loading,
  isDark,
  t,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const { language: currentLang } = useLanguageStore();
  const activeLangKey = (currentLang as keyof typeof inhouseReelsTranslations) || 'en';
  const tableT = inhouseReelsTranslations[activeLangKey] || inhouseReelsTranslations.en;

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#ffffff',
        borderRadius: '16px',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}
    >
      <Table>
        <TableHead sx={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
          <TableRow>
            <TableCell sx={{ color: isDark ? '#d0caeb' : '#5c548a', fontWeight: 600 }}>
              {tableT.videoCol}
            </TableCell>
            <TableCell sx={{ color: isDark ? '#d0caeb' : '#5c548a', fontWeight: 600 }}>
              {tableT.titleDescCol}
            </TableCell>
            <TableCell sx={{ color: isDark ? '#d0caeb' : '#5c548a', fontWeight: 600 }}>
              {tableT.durationCol}
            </TableCell>
            <TableCell sx={{ color: isDark ? '#d0caeb' : '#5c548a', fontWeight: 600 }}>
              {tableT.metricsCol}
            </TableCell>
            <TableCell sx={{ color: isDark ? '#d0caeb' : '#5c548a', fontWeight: 600 }}>
              {tableT.statusCol}
            </TableCell>
            <TableCell
              sx={{ color: isDark ? '#d0caeb' : '#5c548a', fontWeight: 600 }}
              align="center"
            >
              {tableT.actionsCol}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={6}
                align="center"
                sx={{ py: 6, color: isDark ? '#d0caeb' : '#5c548a' }}
              >
                <Typography>{tableT.loading}</Typography>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                align="center"
                sx={{ py: 6, color: isDark ? '#d0caeb' : '#5c548a' }}
              >
                <Typography>{tableT.noReelsFound}</Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow
                key={row.id}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover': {
                    backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  },
                }}
              >
                <TableCell>
                  <Box
                    sx={{
                      width: 60,
                      height: 80,
                      borderRadius: 2,
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundColor: isDark ? '#000' : '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {row.thumbnailUrl ? (
                      <img
                        src={row.thumbnailUrl}
                        alt={row.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <PlayCircleOutline sx={{ color: isDark ? '#fff' : '#888' }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ color: isDark ? '#ffffff' : '#1c1445', maxWidth: 300 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 0.5,
                      flexWrap: 'wrap',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.title}
                    </Typography>
                    <Chip
                      label={(row.language_code || row.language || row.lang || 'te').toUpperCase()}
                      size="small"
                      sx={{
                        height: '18px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        backgroundColor: isDark ? 'rgba(166,226,245,0.12)' : 'rgba(28,20,69,0.06)',
                        color: isDark ? '#facc15' : '#1a1300',
                        border: isDark
                          ? '1px solid rgba(166,226,245,0.3)'
                          : '1px solid rgba(28,20,69,0.15)',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDark ? '#d0caeb' : '#5c548a',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {row.description || tableT.noDesc}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: isDark ? '#d0caeb' : '#1c1445' }}>
                  {row.durationSeconds ? `${row.durationSeconds}s` : 'N/A'}
                </TableCell>
                <TableCell sx={{ color: isDark ? '#d0caeb' : '#1c1445' }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PlayCircleOutline fontSize="small" /> {row.analytics?.viewCount || 0}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <FavoriteBorder fontSize="small" /> {row.analytics?.likeCount || 0}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ChatBubbleOutline fontSize="small" /> {row.analytics?.commentCount || 0}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    variant={row.publishing?.isActive ? 'contained' : 'outlined'}
                    onClick={() => onToggleStatus(row, tableT.failedToUpdateStatus)}
                    sx={{
                      textTransform: 'none',
                      borderRadius: '8px',
                      boxShadow: 'none',
                      backgroundColor: row.publishing?.isActive
                        ? isDark
                          ? 'rgba(76, 175, 80, 0.2)'
                          : '#e8f5e9'
                        : 'transparent',
                      color: row.publishing?.isActive ? '#4caf50' : '#f44336',
                      borderColor: row.publishing?.isActive
                        ? 'transparent'
                        : isDark
                          ? 'rgba(244, 67, 54, 0.5)'
                          : 'rgba(244, 67, 54, 0.5)',
                      '&:hover': {
                        backgroundColor: row.publishing?.isActive
                          ? isDark
                            ? 'rgba(76, 175, 80, 0.3)'
                            : '#c8e6c9'
                          : isDark
                            ? 'rgba(244, 67, 54, 0.1)'
                            : '#ffebee',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {row.publishing?.isActive ? tableT.active : tableT.inactive}
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => row.videoUrl && window.open(row.videoUrl, '_blank')}
                      sx={{ textTransform: 'none', color: isDark ? '#d0caeb' : '#5c548a' }}
                    >
                      {tableT.view}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => onEdit(row)}
                      sx={{ textTransform: 'none', color: isDark ? '#facc15' : '#b45309' }}
                    >
                      {tableT.edit}
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() =>
                        row.id && onDelete(row.id, tableT.confirmDelete, tableT.failedToDelete)
                      }
                      sx={{ textTransform: 'none' }}
                    >
                      {tableT.delete}
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
