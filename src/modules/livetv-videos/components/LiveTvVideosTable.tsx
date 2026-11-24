'use client';

import React from 'react';
import { Box, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import {
  PlayCircleOutline,
  LiveTv,
  DeleteOutline,
  Edit,
  FolderOpen,
  Visibility,
} from '@mui/icons-material';
import { TagVideo } from '../domain/LiveTvVideo';

interface LiveTvVideosTableProps {
  videos: TagVideo[];
  t: Record<string, string>;
  isDark: boolean;
  onPlay: (video: TagVideo) => void;
  onEditVideo?: (video: TagVideo) => void;
  onDeleteVideo?: (fileName: string) => void;
}

export const LiveTvVideosTable: React.FC<LiveTvVideosTableProps> = ({
  videos,
  t,
  isDark,
  onPlay,
  onEditVideo,
  onDeleteVideo,
}) => {
  const rowColors = ['#f59e0b', '#eab308', '#d97706', '#facc15', '#b45309', '#ca8a04', '#fbbf24'];

  const colStyle = (flex: number) => ({
    flex,
    display: 'flex',
    alignItems: 'center',
    px: 1.5,
  });

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  return (
    <Box
      data-testid="livetv-videos-table"
      sx={{
        backgroundColor: isDark ? 'rgba(28, 22, 3, 0.72)' : '#ffffff',
        backdropFilter: isDark ? 'blur(20px)' : 'none',
        border: isDark ? '1px solid rgba(250, 204, 21, 0.25)' : '1px solid rgba(217, 119, 6, 0.2)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: isDark
          ? '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(234, 179, 8, 0.1)'
          : '0 8px 30px rgba(217, 119, 6, 0.08)',
      }}
    >
      {/* Table Header Row — matching Notifications Table Style & Login Flow Warm Palette */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.8,
          color: isDark ? '#fde68a' : '#78350f',
          fontWeight: 700,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          borderBottom: isDark
            ? '1px solid rgba(250, 204, 21, 0.18)'
            : '1px solid rgba(217, 119, 6, 0.15)',
          backgroundColor: isDark ? 'rgba(234, 179, 8, 0.06)' : 'rgba(254, 243, 199, 0.35)',
        }}
      >
        <Box sx={{ flex: '0 0 46px', px: 0.5 }}>#</Box>
        <Box sx={colStyle(3.5)}>{t.colFileName || 'File Name'}</Box>
        <Box sx={colStyle(1.2)}>{t.folder || 'Folder'}</Box>
        <Box sx={colStyle(1.3)}>{t.colSize || 'Size'}</Box>
        <Box sx={colStyle(1.8)}>{t.colDate || 'Created At'}</Box>
        <Box sx={{ ...colStyle(1.6), justifyContent: 'flex-end' }}>{t.colActions || 'Actions'}</Box>
      </Box>

      {/* Table Body Rows */}
      {videos.length > 0 ? (
        videos.map((item, idx) => {
          const rowColor = rowColors[idx % rowColors.length];

          return (
            <Box key={`${item.fileName}-${idx}`}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1.6,
                  color: isDark ? '#ffffff' : '#1a1300',
                  transition: 'background-color 0.2s ease',
                  borderBottom: isDark
                    ? '1px solid rgba(250, 204, 21, 0.06)'
                    : '1px solid rgba(0, 0, 0, 0.04)',
                  '&:last-child': { borderBottom: 0 },
                  '&:hover': {
                    backgroundColor: isDark
                      ? 'rgba(234, 179, 8, 0.06)'
                      : 'rgba(254, 243, 199, 0.25)',
                  },
                }}
              >
                {/* Row # Badge */}
                <Box sx={{ flex: '0 0 46px', px: 0.5 }}>
                  <Box
                    sx={{
                      px: 0.8,
                      py: 0.3,
                      borderRadius: '6px',
                      backgroundColor: `${rowColor}22`,
                      border: `1px solid ${rowColor}55`,
                      display: 'inline-block',
                      textAlign: 'center',
                      minWidth: '24px',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: rowColor, fontWeight: 700, fontSize: '0.75rem' }}
                    >
                      {idx + 1}
                    </Typography>
                  </Box>
                </Box>

                {/* File Name & Thumbnail */}
                <Box sx={colStyle(3.5)}>
                  <Box
                    onClick={() => onPlay(item)}
                    sx={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      minWidth: 0,
                    }}
                  >
                    {item.thumbnailUrl ? (
                      <Box
                        component="img"
                        src={item.thumbnailUrl}
                        alt={item.fileName}
                        data-testid={`video-thumbnail-${idx}`}
                        onError={(e: any) => {
                          e.currentTarget.style.display = 'none';
                          const fallbackIcon =
                            e.currentTarget.parentElement?.querySelector('.video-fallback-icon');
                          if (fallbackIcon) {
                            (fallbackIcon as HTMLElement).style.display = 'block';
                          }
                        }}
                        sx={{
                          width: 48,
                          height: 32,
                          borderRadius: '8px',
                          objectFit: 'cover',
                          flexShrink: 0,
                          border: isDark
                            ? '1px solid rgba(250, 204, 21, 0.25)'
                            : '1px solid rgba(217, 119, 6, 0.2)',
                          backgroundColor: isDark
                            ? 'rgba(255, 255, 255, 0.05)'
                            : 'rgba(0, 0, 0, 0.05)',
                        }}
                      />
                    ) : null}
                    <LiveTv
                      className="video-fallback-icon"
                      sx={{
                        fontSize: 24,
                        color: isDark ? '#facc15' : '#b45309',
                        display: item.thumbnailUrl ? 'none' : 'block',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          wordBreak: 'break-all',
                          '&:hover': { color: isDark ? '#fde047' : '#d97706' },
                        }}
                      >
                        {item.fileName}
                      </Typography>
                      {item.viewCount !== undefined && item.viewCount > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                          <Visibility
                            sx={{
                              fontSize: 13,
                              color: isDark ? '#fde68a' : '#78350f',
                              opacity: 0.7,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: isDark ? '#fde68a' : '#78350f', opacity: 0.8 }}
                          >
                            {item.viewCount} {t.views || 'views'}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Box>

                {/* Folder */}
                <Box sx={colStyle(1.2)}>
                  <Chip
                    icon={
                      <FolderOpen
                        sx={{
                          fontSize: '14px !important',
                          color: isDark ? '#fde68a !important' : '#78350f !important',
                        }}
                      />
                    }
                    label={item.folder || 'root'}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: isDark
                        ? 'rgba(234, 179, 8, 0.12)'
                        : 'rgba(234, 179, 8, 0.08)',
                      color: isDark ? '#fde68a' : '#78350f',
                      border: isDark
                        ? '1px solid rgba(250, 204, 21, 0.25)'
                        : '1px solid rgba(217, 119, 6, 0.2)',
                    }}
                  />
                </Box>

                {/* Size */}
                <Box sx={colStyle(1.3)}>
                  <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                    {formatSize(item.sizeBytes)}
                  </Typography>
                </Box>

                {/* Date */}
                <Box sx={colStyle(1.8)}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      fontSize: '0.82rem',
                      color: isDark ? '#fde68a' : '#78350f',
                    }}
                  >
                    {formatDate(item.createdAt)}
                  </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ ...colStyle(1.6), justifyContent: 'flex-end' }}>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title={t.playStream || 'Play Stream / View'}>
                      <IconButton
                        size="small"
                        onClick={() => onPlay(item)}
                        sx={{
                          color: isDark ? '#facc15' : '#b45309',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            color: isDark ? '#fde047' : '#d97706',
                            transform: 'scale(1.15)',
                          },
                        }}
                      >
                        <PlayCircleOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {onEditVideo && (
                      <Tooltip title={t.editVideo || 'Edit Video'}>
                        <IconButton
                          size="small"
                          onClick={() => onEditVideo(item)}
                          sx={{
                            color: isDark ? '#fde68a' : '#78350f',
                            '&:hover': { color: '#facc15' },
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onDeleteVideo && (
                      <Tooltip title={t.deleteVideo || 'Delete Video'}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            if (
                              window.confirm(
                                t.confirmDeleteVideo ||
                                  'Are you sure you want to delete this video?'
                              )
                            ) {
                              onDeleteVideo(item.fileName);
                            }
                          }}
                          sx={{ color: '#ef4444' }}
                        >
                          <DeleteOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })
      ) : (
        <Box
          sx={{
            py: 8,
            textAlign: 'center',
            color: isDark ? '#fde68a' : '#78350f',
          }}
        >
          <LiveTv
            sx={{
              fontSize: 56,
              mb: 1.5,
              color: '#facc15',
              opacity: 0.85,
              filter: isDark ? 'drop-shadow(0 0 15px rgba(250, 204, 21, 0.4))' : 'none',
            }}
          />
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {t.noRecordsFound || 'No videos available in this tag folder.'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
