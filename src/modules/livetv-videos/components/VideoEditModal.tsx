import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { CloudUpload, Close, ImageOutlined } from '@mui/icons-material';
import { TagVideo } from '../domain/LiveTvVideo';
import { UploadService } from '@/modules/media/services/upload.service';

interface VideoEditModalProps {
  open: boolean;
  onClose: () => void;
  video: TagVideo | null;
  onSave: (
    videoId: string,
    fileName: string,
    viewCount: number,
    thumbnailUrl?: string
  ) => Promise<void>;
  isDark: boolean;
  t: Record<string, string>;
}

export const VideoEditModal: React.FC<VideoEditModalProps> = ({
  open,
  onClose,
  video,
  onSave,
  isDark,
  t,
}) => {
  const [fileName, setFileName] = useState('');
  const [viewCount, setViewCount] = useState<number>(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && video) {
      setFileName(video.fileName || '');
      setViewCount(video.viewCount || 0);
      setThumbnailUrl(video.thumbnailUrl || '');
      setError(null);
    }
  }, [open, video]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset native input so choosing the same file again triggers change
    e.target.value = '';

    setUploading(true);
    setError(null);
    try {
      const uploadedUrl = await UploadService.uploadImage(file);
      setThumbnailUrl(uploadedUrl);
    } catch (err: any) {
      setError(err?.message || t.uploadFailed || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailUrl('');
  };

  const handleSave = async () => {
    if (!fileName.trim()) {
      setError(t.errorFileNameRequired || 'File name is required');
      return;
    }
    if (viewCount < 0) {
      setError(t.errorInvalidViewCount || 'View count cannot be negative');
      return;
    }

    if (!video || !video.id) {
      setError(t.errorVideoIdMissing || 'Video ID is missing. Cannot update.');
      return;
    }

    try {
      setLoading(true);
      await onSave(video.id, fileName.trim(), viewCount, thumbnailUrl.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading || uploading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          backgroundColor: isDark ? '#140e36' : '#ffffff',
          color: isDark ? '#ffffff' : '#1c1445',
          borderRadius: '16px',
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 700,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{t.editVideo || 'Edit Video'}</span>
        <IconButton
          onClick={onClose}
          disabled={loading || uploading}
          size="small"
          sx={{ color: isDark ? '#94a3b8' : '#64748b' }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          <TextField
            label={t.colFileName || 'File Name'}
            fullWidth
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            disabled={loading || uploading}
            InputLabelProps={{ sx: { color: isDark ? '#a5b4fc' : '#5c548a' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: isDark ? '#ffffff' : '#1c1445',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                },
                '&:hover fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                },
              },
            }}
          />

          <TextField
            label={t.colViewCount || 'View Count'}
            type="number"
            fullWidth
            value={viewCount}
            onChange={(e) => setViewCount(parseInt(e.target.value, 10) || 0)}
            disabled={loading || uploading}
            InputLabelProps={{ sx: { color: isDark ? '#a5b4fc' : '#5c548a' } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: isDark ? '#ffffff' : '#1c1445',
                '& fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                },
                '&:hover fieldset': {
                  borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                },
              },
            }}
          />

          {/* Video Thumbnail Upload & Preview Section */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: 2,
              borderRadius: '12px',
              border: isDark ? '1px dashed rgba(255,255,255,0.2)' : '1px dashed rgba(0,0,0,0.2)',
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fafafa',
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600, color: isDark ? '#a5b4fc' : '#5c548a' }}
            >
              {t.thumbnailLabel || 'Thumbnail Image'}
            </Typography>

            {/* Thumbnail Preview if available */}
            {thumbnailUrl && (
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 160,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: isDark
                    ? '1px solid rgba(255,255,255,0.15)'
                    : '1px solid rgba(0,0,0,0.15)',
                  backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  component="img"
                  src={thumbnailUrl}
                  alt="Thumbnail Preview"
                  data-testid="edit-video-thumbnail-preview"
                  onError={(e: any) => {
                    e.currentTarget.style.opacity = '0.3';
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
                <Tooltip title={t.removeThumbnail || 'Remove Thumbnail'}>
                  <IconButton
                    size="small"
                    onClick={handleRemoveThumbnail}
                    disabled={loading || uploading}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      color: '#ffffff',
                      '&:hover': { backgroundColor: 'rgba(239,68,68,0.9)' },
                    }}
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Upload Button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                component="label"
                disabled={loading || uploading}
                startIcon={
                  uploading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <CloudUpload fontSize="small" />
                  )
                }
                sx={{
                  borderRadius: '8px',
                  borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                  color: isDark ? '#ffffff' : '#1c1445',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: isDark ? '#a5b4fc' : '#2563eb',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(37,99,235,0.05)',
                  },
                }}
              >
                {uploading
                  ? t.uploading || 'Uploading...'
                  : t.uploadThumbnail || 'Upload Thumbnail'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload}
                  data-testid="video-thumbnail-file-input"
                />
              </Button>
            </Box>

            {/* Thumbnail URL Input */}
            <TextField
              label={t.thumbnailUrlLabel || 'Thumbnail URL'}
              placeholder={t.thumbnailUrlPlaceholder || 'https://... or upload an image'}
              fullWidth
              size="small"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              disabled={loading || uploading}
              InputLabelProps={{ sx: { color: isDark ? '#a5b4fc' : '#5c548a' } }}
              InputProps={{
                startAdornment: (
                  <ImageOutlined
                    sx={{
                      mr: 1,
                      fontSize: 20,
                      color: isDark ? '#94a3b8' : '#64748b',
                    }}
                  />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: isDark ? '#ffffff' : '#1c1445',
                  '& fieldset': {
                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                  },
                },
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading || uploading}
          sx={{ color: isDark ? '#94a3b8' : undefined }}
        >
          {t.cancel || 'Cancel'}
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || uploading}
          variant="contained"
          sx={{
            borderRadius: '8px',
            backgroundColor: '#2563eb',
            '&:hover': { backgroundColor: '#1d4ed8' },
          }}
        >
          {loading ? t.saving || 'Saving...' : t.save || 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
