import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  Switch,
  Button,
  FormControlLabel,
  Autocomplete,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Movie, Close, CloudUpload } from '@mui/icons-material';
import { UploadedReel } from '../domain/reels.model';
import { eventsApiClient } from '@/core/api/api-client';
import { UploadService } from '@/modules/media/services/upload.service';
import { inhouseReelsTranslations } from '../translations/inhouseReelsTranslations';
import { useLanguageStore } from '@/core/storage/language-store';

interface InhouseReelsDrawerProps {
  open: boolean;
  isEditMode: boolean;
  selectedReel: UploadedReel | null;
  onClose: () => void;
  onSuccess: (savedLang?: string) => void;
  isDark: boolean;
  t?: any;
  defaultLang?: string;
}

export const InhouseReelsDrawer: React.FC<InhouseReelsDrawerProps> = ({
  open,
  isEditMode,
  selectedReel,
  onClose,
  onSuccess,
  isDark,
  t,
  defaultLang,
}) => {
  const { language: currentLang } = useLanguageStore();
  const activeLangKey = (currentLang as keyof typeof inhouseReelsTranslations) || 'en';
  const drawerT = inhouseReelsTranslations[activeLangKey] || inhouseReelsTranslations.en;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'te',
    videoUrl: '',
    thumbnailUrl: '',
    durationSeconds: '',
    isActive: true,
    allowComments: true,
    allowSharing: true,
    allowDownloads: false,
    hashtags: [] as string[],
  });

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (open) {
      if (isEditMode && selectedReel) {
        const reelLang =
          selectedReel.language_code ||
          selectedReel.language ||
          selectedReel.lang ||
          (defaultLang && defaultLang !== 'all' ? defaultLang : 'te');
        setFormData({
          title: selectedReel.title || '',
          description: selectedReel.description || '',
          language: reelLang,
          videoUrl: selectedReel.videoUrl || '',
          thumbnailUrl: selectedReel.thumbnailUrl || '',
          durationSeconds: selectedReel.durationSeconds ? String(selectedReel.durationSeconds) : '',
          isActive: selectedReel.publishing?.isActive ?? true,
          allowComments: selectedReel.settings?.allowComments ?? true,
          allowSharing: selectedReel.settings?.allowSharing ?? true,
          allowDownloads: selectedReel.settings?.allowDownloads ?? false,
          hashtags: selectedReel.hashtags || [],
        });
      } else {
        const initialLang =
          defaultLang && defaultLang !== 'all'
            ? defaultLang
            : currentLang && ['te', 'en', 'hi', 'ml'].includes(currentLang)
              ? currentLang
              : 'te';
        setFormData({
          title: '',
          description: '',
          language: initialLang,
          videoUrl: '',
          thumbnailUrl: '',
          durationSeconds: '',
          isActive: true,
          allowComments: true,
          allowSharing: true,
          allowDownloads: false,
          hashtags: [],
        });
      }
    }
  }, [open, isEditMode, selectedReel, defaultLang, currentLang]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVideo(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const response = await eventsApiClient.post<any>('/reels/upload-video', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response && response.data && response.data.url) {
        setFormData((prev) => ({ ...prev, videoUrl: response.data.url }));
      }
    } catch (error) {
      console.error('Failed to upload video:', error);
      alert(drawerT.failedToUploadVideo);
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const url = await UploadService.uploadImage(file);
      setFormData((prev) => ({ ...prev, thumbnailUrl: url }));
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert(drawerT.failedToUploadThumbnail);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.videoUrl) {
      alert(drawerT.titleAndVideoRequired);
      return;
    }

    const payload: Partial<UploadedReel> & Record<string, any> = {
      title: formData.title,
      description: formData.description,
      language: formData.language || 'te',
      lang: formData.language || 'te',
      language_code: formData.language || 'te',
      videoUrl: formData.videoUrl,
      thumbnailUrl: formData.thumbnailUrl,
      durationSeconds: parseInt(formData.durationSeconds, 10) || 0,
      hashtags: formData.hashtags,
      publishing: {
        status: formData.isActive ? 'published' : 'draft',
        isActive: formData.isActive,
        visibility: 'public',
        scheduledAt: null,
        publishedAt: formData.isActive ? new Date().toISOString() : null,
      },
      settings: {
        allowComments: formData.allowComments,
        allowSharing: formData.allowSharing,
        allowDownloads: formData.allowDownloads,
      },
    };

    try {
      if (isEditMode && selectedReel?.id) {
        await eventsApiClient.patch(`/reels/${selectedReel.id}`, payload);
      } else {
        await eventsApiClient.post('/reels', payload);
      }
      onSuccess(formData.language);
      onClose();
    } catch (error: any) {
      console.error('Failed to save reel:', error);
      alert(error.message || drawerT.failedToSave);
    }
  };

  const textFieldProps = {
    fullWidth: true,
    size: 'small' as const,
    sx: {
      mb: 2,
      '& .MuiOutlinedInput-root': {
        color: isDark ? '#ffffff' : '#1c1445',
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
        borderRadius: '10px',
        '& fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)' },
        '&:hover fieldset': {
          borderColor: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(28,20,69,0.4)',
        },
        '&.Mui-focused fieldset': { borderColor: isDark ? '#facc15' : '#1a1300' },
      },
      '& .MuiInputLabel-root': { color: isDark ? '#d0caeb' : '#5c548a' },
    },
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: '480px' },
          backgroundColor: isDark ? '#1a1140' : '#ffffff',
          borderLeft: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2.5,
          borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          backgroundColor: isDark ? 'rgba(28,22,3,0.5)' : '#f4f3f8',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              backgroundColor: isDark ? 'rgba(166,226,245,0.15)' : 'rgba(28,20,69,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Movie sx={{ color: isDark ? '#facc15' : '#1a1300', fontSize: '1.1rem' }} />
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                color: isDark ? '#ffffff' : '#1c1445',
                fontWeight: 700,
                fontSize: '1rem',
                lineHeight: 1.2,
              }}
            >
              {isEditMode ? drawerT.editInhouseReel : drawerT.addInhouseReel}
            </Typography>
            <Typography variant="caption" sx={{ color: isDark ? '#d0caeb' : '#9e9e9e' }}>
              {drawerT.uploadAndDetails}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: isDark ? '#d0caeb' : '#5c548a' }}>
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column' }}>
        {/* Language Selection */}
        <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
          <InputLabel sx={{ color: isDark ? '#d0caeb' : '#5c548a' }}>
            {drawerT.languageCode} *
          </InputLabel>
          <Select
            label={`${drawerT.languageCode} *`}
            name="language"
            value={formData.language}
            onChange={(e) => setFormData((p) => ({ ...p, language: e.target.value as string }))}
            sx={{
              color: isDark ? '#ffffff' : '#1c1445',
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#ffffff',
              borderRadius: '10px',
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
            <MenuItem value="te">{drawerT.telugu}</MenuItem>
            <MenuItem value="en">{drawerT.english}</MenuItem>
            <MenuItem value="hi">{drawerT.hindi}</MenuItem>
            <MenuItem value="ml">{drawerT.malayalam}</MenuItem>
          </Select>
        </FormControl>

        {/* Video Upload + URL options */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, color: isDark ? '#d0caeb' : '#5c548a', fontWeight: 600 }}
          >
            {drawerT.videoFile} *
          </Typography>
          {formData.videoUrl ? (
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)',
                backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f5f5f5',
                mb: 1.5,
              }}
            >
              <video
                src={formData.videoUrl}
                controls
                style={{ width: '100%', maxHeight: '200px', borderRadius: '8px' }}
              />
              <Button
                size="small"
                color="error"
                onClick={() => setFormData((p) => ({ ...p, videoUrl: '' }))}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                {drawerT.removeVideo}
              </Button>
            </Box>
          ) : (
            <Button
              component="label"
              variant="outlined"
              fullWidth
              disabled={uploadingVideo}
              startIcon={uploadingVideo ? <CircularProgress size={20} /> : <CloudUpload />}
              sx={{ height: 80, borderStyle: 'dashed', mb: 1.5, borderRadius: '10px' }}
            >
              {uploadingVideo ? drawerT.uploadingVideo : drawerT.uploadVideo}
              <input type="file" hidden accept="video/*" onChange={handleVideoUpload} />
            </Button>
          )}
          <TextField
            label={drawerT.videoUrlLabel}
            placeholder="https://..."
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleChange}
            {...textFieldProps}
          />
        </Box>

        {/* Thumbnail Upload + URL options */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{ mb: 1, color: isDark ? '#d0caeb' : '#5c548a', fontWeight: 600 }}
          >
            {drawerT.thumbnailImage}
          </Typography>
          {formData.thumbnailUrl ? (
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.2)',
                backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f5f5f5',
                mb: 1.5,
              }}
            >
              <img
                src={formData.thumbnailUrl}
                alt="Thumbnail"
                style={{
                  width: '100%',
                  maxHeight: '180px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
              <Button
                size="small"
                color="error"
                onClick={() => setFormData((p) => ({ ...p, thumbnailUrl: '' }))}
                sx={{ mt: 1, textTransform: 'none' }}
              >
                {drawerT.removeThumbnail}
              </Button>
            </Box>
          ) : (
            <Button
              component="label"
              variant="outlined"
              fullWidth
              disabled={uploadingImage}
              startIcon={uploadingImage ? <CircularProgress size={20} /> : <CloudUpload />}
              sx={{ height: 80, borderStyle: 'dashed', mb: 1.5, borderRadius: '10px' }}
            >
              {uploadingImage ? drawerT.uploadingThumbnail : drawerT.uploadThumbnail}
              <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
            </Button>
          )}
          <TextField
            label={drawerT.thumbnailUrlLabel}
            placeholder="https://..."
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            {...textFieldProps}
          />
        </Box>

        <TextField
          label={`${drawerT.title} *`}
          name="title"
          value={formData.title}
          onChange={handleChange}
          {...textFieldProps}
        />
        <TextField
          label={drawerT.description}
          name="description"
          value={formData.description}
          onChange={handleChange}
          multiline
          rows={3}
          {...textFieldProps}
        />
        <TextField
          label={drawerT.durationSeconds}
          name="durationSeconds"
          value={formData.durationSeconds}
          onChange={(e) =>
            setFormData((p) => ({ ...p, durationSeconds: e.target.value.replace(/\D/g, '') }))
          }
          {...textFieldProps}
        />

        <Autocomplete
          multiple
          freeSolo
          options={['news', 'breaking', 'sports', 'entertainment']}
          value={formData.hashtags}
          onChange={(_, newValue) => setFormData((p) => ({ ...p, hashtags: newValue }))}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  variant="outlined"
                  label={option}
                  {...tagProps}
                  size="small"
                  sx={{ color: isDark ? '#ffffff' : '#1c1445' }}
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label={drawerT.hashtags}
              placeholder="Select or type..."
              {...textFieldProps}
            />
          )}
        />

        <Box sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleChange}
                name="isActive"
                color="primary"
              />
            }
            label={drawerT.activePublished}
            sx={{ color: isDark ? '#d0caeb' : '#5c548a', ml: 0 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.allowComments}
                onChange={handleChange}
                name="allowComments"
                color="primary"
              />
            }
            label={drawerT.allowComments}
            sx={{ color: isDark ? '#d0caeb' : '#5c548a', ml: 0 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.allowSharing}
                onChange={handleChange}
                name="allowSharing"
                color="primary"
              />
            }
            label={drawerT.allowSharing}
            sx={{ color: isDark ? '#d0caeb' : '#5c548a', ml: 0 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.allowDownloads}
                onChange={handleChange}
                name="allowDownloads"
                color="primary"
              />
            }
            label={drawerT.allowDownloads}
            sx={{ color: isDark ? '#d0caeb' : '#5c548a', ml: 0 }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          p: 3,
          backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#f9f9fc',
          borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          fullWidth
          onClick={onClose}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            color: isDark ? '#d0caeb' : '#5c548a',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
          }}
        >
          {drawerT.cancel}
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 600,
            backgroundColor: isDark ? '#facc15' : '#1a1300',
            color: isDark ? '#1a1300' : '#ffffff',
          }}
        >
          {isEditMode ? drawerT.saveChanges : drawerT.createReel}
        </Button>
      </Box>
    </Drawer>
  );
};
