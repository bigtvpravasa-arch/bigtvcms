'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, Box, Typography, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';
import { TagVideo } from '../domain/LiveTvVideo';

interface VideoPlayerModalProps {
  open: boolean;
  onClose: () => void;
  video: TagVideo | null;
  isDark: boolean;
  t: Record<string, string>;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  open,
  onClose,
  video,
  isDark,
  t,
}) => {
  if (!video) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
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
          overflow: 'hidden',
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
          {video.fileName}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: isDark ? '#ffffff' : '#1a1300' }}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        <Box
          sx={{
            width: '100%',
            height: { xs: 260, sm: 420 },
            backgroundColor: '#000000',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {video.url ? (
            <video
              src={video.url}
              poster={video.thumbnailUrl || undefined}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Typography variant="body1" sx={{ color: '#ffffff', opacity: 0.7 }}>
              {t.streamNotAvailable || 'Video Stream is not available.'}
            </Typography>
          )}
        </Box>

        <Box sx={{ mt: 2 }}>
          {video.url && (
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                opacity: 0.6,
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}
            >
              Stream URL: {video.url}
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
