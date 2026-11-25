'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Chip,
  Alert,
} from '@mui/material';
import { Close, AccessTime, Clear } from '@mui/icons-material';
import { VideoTag } from '../domain/LiveTvVideo';

interface TagTimingModalProps {
  open: boolean;
  onClose: () => void;
  tag: VideoTag | null;
  onSave: (slug: string, startTime: string | null, endTime: string | null) => Promise<any>;
  isDark: boolean;
  t: Record<string, string>;
}

export const TagTimingModal: React.FC<TagTimingModalProps> = ({
  open,
  onClose,
  tag,
  onSave,
  isDark,
  t,
}) => {
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tag && open) {
      setStartTime(tag.startTime || '');
      setEndTime(tag.endTime || '');
      setError(null);
    } else {
      setStartTime('');
      setEndTime('');
      setError(null);
    }
  }, [tag, open]);

  const handleClear = () => {
    setStartTime('');
    setEndTime('');
  };

  const handleSubmit = async () => {
    if (!tag) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await onSave(
        tag.slug,
        startTime.trim() ? startTime.trim() : null,
        endTime.trim() ? endTime.trim() : null
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update show timing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      maxWidth="xs"
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
        },
      }}
    >
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime sx={{ color: isDark ? '#facc15' : '#d97706', fontSize: 24 }} />
          <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
            {t.editTimingModalTitle || 'Show Timings Schedule'}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          disabled={isSubmitting}
          sx={{ color: isDark ? '#ffffff' : '#1a1300' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {tag && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: '12px',
                backgroundColor: isDark ? 'rgba(234, 179, 8, 0.08)' : 'rgba(254, 243, 199, 0.4)',
                border: isDark
                  ? '1px solid rgba(250, 204, 21, 0.2)'
                  : '1px solid rgba(217, 119, 6, 0.15)',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: isDark ? '#fde68a' : '#78350f' }}
              >
                {tag.name}
              </Typography>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#71717a' }}>
                Slug: {tag.slug} {tag.language ? `• ${tag.language.toUpperCase()}` : ''}
              </Typography>
            </Box>
          )}

          <Alert severity="info" sx={{ borderRadius: '12px', fontSize: '0.8rem' }}>
            Daily broadcast hours in IST (Asia/Kolkata). Active show will automatically appear first
            in listings.
          </Alert>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label={t.startTimeLabel || 'Broadcast Start Time'}
              type="time"
              fullWidth
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true, style: { color: isDark ? '#94a3b8' : undefined } }}
              InputProps={{
                style: { color: isDark ? '#ffffff' : undefined },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(250, 204, 21, 0.25)' : 'rgba(217, 119, 6, 0.25)',
                  },
                },
              }}
            />

            <TextField
              label={t.endTimeLabel || 'Broadcast End Time'}
              type="time"
              fullWidth
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true, style: { color: isDark ? '#94a3b8' : undefined } }}
              InputProps={{
                style: { color: isDark ? '#ffffff' : undefined },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(250, 204, 21, 0.25)' : 'rgba(217, 119, 6, 0.25)',
                  },
                },
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="text"
              size="small"
              startIcon={<Clear sx={{ fontSize: 16 }} />}
              onClick={handleClear}
              disabled={isSubmitting || (!startTime && !endTime)}
              sx={{
                color: isDark ? '#f87171' : '#dc2626',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.78rem',
              }}
            >
              {t.clearTiming || 'Clear Timing'}
            </Button>
          </Box>

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={isSubmitting}
          sx={{ color: isDark ? '#94a3b8' : undefined }}
        >
          {t.cancel || 'Cancel'}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting}
          sx={{
            background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%)',
            color: '#1a1300',
            fontWeight: 700,
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(234, 179, 8, 0.35)',
            '&:hover': {
              background: 'linear-gradient(135deg, #fde047 0%, #d97706 100%)',
              boxShadow: '0 6px 20px rgba(234, 179, 8, 0.5)',
            },
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} sx={{ color: '#1a1300' }} />
          ) : (
            t.save || 'Save'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
