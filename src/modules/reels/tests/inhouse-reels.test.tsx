import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useInhouseReelsController } from '../hooks/useInhouseReelsController';
import { InhouseReelsTab } from '../components/InhouseReelsTab';
import { InhouseReelsTable } from '../components/InhouseReelsTable';
import { InhouseReelsDrawer } from '../components/InhouseReelsDrawer';
import { inhouseReelsTranslations } from '../translations/inhouseReelsTranslations';
import { eventsApiClient } from '@/core/api/api-client';
import { useLanguageStore } from '@/core/storage/language-store';
import { UploadService } from '@/modules/media/services/upload.service';

jest.mock('@/core/api/api-client', () => ({
  eventsApiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/modules/media/services/upload.service', () => ({
  UploadService: {
    uploadImage: jest.fn(),
  },
}));

describe('Inhouse Reels - Complete Suite', () => {
  const mockReels = [
    {
      id: 'reel-1',
      title: 'Telugu News Reel',
      description: 'First reel',
      language: 'te',
      lang: 'te',
      language_code: 'te',
      videoUrl: 'https://cdn.example.com/video1.mp4',
      thumbnailUrl: 'https://cdn.example.com/thumb1.png',
      durationSeconds: 30,
      publishing: { isActive: true, status: 'published' },
      analytics: { viewCount: 100, likeCount: 10, commentCount: 2 },
    },
    {
      id: 'reel-2',
      title: 'Cinema Updates',
      description: 'Second reel',
      language: 'te',
      lang: 'te',
      language_code: 'te',
      videoUrl: 'https://cdn.example.com/video2.mp4',
      thumbnailUrl: 'https://cdn.example.com/thumb2.png',
      durationSeconds: 45,
      publishing: { isActive: false, status: 'draft' },
      analytics: { viewCount: 50, likeCount: 5, commentCount: 1 },
    },
    {
      id: 'reel-3',
      title: 'Malayalam Flash News',
      description: 'Third reel in Malayalam',
      language: 'ml',
      lang: 'ml',
      language_code: 'ml',
      videoUrl: 'https://cdn.example.com/video3.mp4',
      thumbnailUrl: 'https://cdn.example.com/thumb3.png',
      durationSeconds: 20,
      publishing: { isActive: true, status: 'published' },
      analytics: { viewCount: 200, likeCount: 25, commentCount: 8 },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useLanguageStore.setState({ language: 'te' });
    (eventsApiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReels,
    });
  });

  describe('useInhouseReelsController hook', () => {
    it('should fetch in-house reels on mount with default Telugu language and pagination params', async () => {
      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      expect(eventsApiClient.get).toHaveBeenCalledWith('/reels', {
        lang: 'te',
        language: 'te',
        language_code: 'te',
        page: 1,
        limit: 100,
        skip: 0,
        take: 100,
      });
      expect(hookResult.result.current.data.length).toBe(3);
      // Filtered data for 'te' language should only have Telugu reels
      expect(hookResult.result.current.filteredData.length).toBe(2);
      expect(hookResult.result.current.loading).toBe(false);
      expect(hookResult.result.current.error).toBeNull();
    });

    it('should fetch reels with lang=all when filterLang is all', async () => {
      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      await act(async () => {
        hookResult.result.current.setFilterLang('all');
      });

      expect(eventsApiClient.get).toHaveBeenCalledWith('/reels', {
        lang: 'all',
        page: 1,
        limit: 100,
        skip: 0,
        take: 100,
      });
      expect(hookResult.result.current.filteredData.length).toBe(3);
    });

    it('should filter reels by title in filteredData and paginatedData', async () => {
      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      act(() => {
        hookResult.result.current.setFilterTitle('Cinema');
      });

      expect(hookResult.result.current.paginatedData.length).toBe(1);
      expect(hookResult.result.current.paginatedData[0].title).toBe('Cinema Updates');
    });

    it('should update filterLang when language store changes', async () => {
      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      await act(async () => {
        useLanguageStore.setState({ language: 'ml' });
      });

      expect(hookResult.result.current.filterLang).toBe('ml');
    });

    it('should handle save success and switch language view when saved language is different', async () => {
      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      expect(hookResult.result.current.filterLang).toBe('te');

      await act(async () => {
        hookResult.result.current.handleSaveSuccess('ml');
      });

      expect(hookResult.result.current.filterLang).toBe('ml');
    });

    it('should handle save success and refetch reels when saved language is the same', async () => {
      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      await act(async () => {
        hookResult.result.current.handleSaveSuccess('te');
      });

      expect(eventsApiClient.get).toHaveBeenCalled();
    });

    it('should handle drawer open, edit, and close actions', async () => {
      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      act(() => {
        hookResult.result.current.handleAddClick();
      });
      expect(hookResult.result.current.drawerOpen).toBe(true);
      expect(hookResult.result.current.isEditMode).toBe(false);
      expect(hookResult.result.current.selectedReel).toBeNull();

      act(() => {
        hookResult.result.current.handleEditClick(mockReels[0]);
      });
      expect(hookResult.result.current.drawerOpen).toBe(true);
      expect(hookResult.result.current.isEditMode).toBe(true);
      expect(hookResult.result.current.selectedReel).toEqual(mockReels[0]);

      act(() => {
        hookResult.result.current.handleCloseDrawer();
      });
      expect(hookResult.result.current.drawerOpen).toBe(false);
    });

    it('should delete a reel when confirmed', async () => {
      window.confirm = jest.fn(() => true);
      (eventsApiClient.delete as jest.Mock).mockResolvedValueOnce({ success: true });

      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      await act(async () => {
        await hookResult.result.current.handleDelete('reel-1');
      });

      expect(eventsApiClient.delete).toHaveBeenCalledWith('/reels/reel-1');
      expect(eventsApiClient.get).toHaveBeenCalled();
    });

    it('should not delete a reel when confirmation is cancelled', async () => {
      window.confirm = jest.fn(() => false);

      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      await act(async () => {
        await hookResult.result.current.handleDelete('reel-1');
      });

      expect(eventsApiClient.delete).not.toHaveBeenCalled();
    });

    it('should alert if delete fails', async () => {
      window.confirm = jest.fn(() => true);
      window.alert = jest.fn();
      (eventsApiClient.delete as jest.Mock).mockRejectedValueOnce(new Error('Delete error'));

      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      await act(async () => {
        await hookResult.result.current.handleDelete('reel-1');
      });

      expect(window.alert).toHaveBeenCalledWith('Delete error');
    });

    it('should toggle reel publish status via patch', async () => {
      (eventsApiClient.patch as jest.Mock).mockResolvedValueOnce({ success: true });

      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      await act(async () => {
        await hookResult.result.current.handleStatusToggle(mockReels[1] as any);
      });

      expect(eventsApiClient.patch).toHaveBeenCalledWith('/reels/reel-2', {
        publishing: {
          isActive: true,
          status: 'published',
        },
      });
    });

    it('should alert if status toggle fails', async () => {
      window.alert = jest.fn();
      (eventsApiClient.patch as jest.Mock).mockRejectedValueOnce(new Error('Patch error'));

      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      await act(async () => {
        await hookResult.result.current.handleStatusToggle(mockReels[1] as any);
      });

      expect(window.alert).toHaveBeenCalledWith('Patch error');
    });

    it('should set error state when fetchReels fails', async () => {
      (eventsApiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      expect(hookResult.result.current.error).toBe('Network failure');
      expect(hookResult.result.current.loading).toBe(false);
    });

    it('should handle raw array response format from backend', async () => {
      (eventsApiClient.get as jest.Mock).mockResolvedValueOnce(mockReels);

      let hookResult: any;
      await act(async () => {
        hookResult = renderHook(() => useInhouseReelsController());
      });

      expect(hookResult.result.current.data.length).toBe(3);
    });
  });

  describe('InhouseReelsTable component', () => {
    it('should render table rows and display language badges correctly', () => {
      render(
        <InhouseReelsTable
          data={mockReels as any}
          loading={false}
          isDark={false}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onToggleStatus={jest.fn()}
        />
      );

      expect(screen.getByText('Telugu News Reel')).toBeInTheDocument();
      expect(screen.getByText('Malayalam Flash News')).toBeInTheDocument();
      expect(screen.getAllByText('TE').length).toBe(2);
      expect(screen.getByText('ML')).toBeInTheDocument();
    });

    it('should render loading indicator when loading is true', () => {
      render(
        <InhouseReelsTable
          data={[]}
          loading={true}
          isDark={false}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onToggleStatus={jest.fn()}
        />
      );

      expect(screen.getByText(inhouseReelsTranslations.te.loading)).toBeInTheDocument();
    });

    it('should render empty state when no reels are available', () => {
      render(
        <InhouseReelsTable
          data={[]}
          loading={false}
          isDark={true}
          onEdit={jest.fn()}
          onDelete={jest.fn()}
          onToggleStatus={jest.fn()}
        />
      );

      expect(screen.getByText(inhouseReelsTranslations.te.noReelsFound)).toBeInTheDocument();
    });

    it('should trigger onEdit, onDelete, and onToggleStatus callbacks', () => {
      const handleEdit = jest.fn();
      const handleDelete = jest.fn();
      const handleToggleStatus = jest.fn();

      render(
        <InhouseReelsTable
          data={mockReels as any}
          loading={false}
          isDark={false}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      );

      const editButtons = screen.getAllByText(inhouseReelsTranslations.te.edit);
      fireEvent.click(editButtons[0]);
      expect(handleEdit).toHaveBeenCalledWith(mockReels[0]);

      const deleteButtons = screen.getAllByText(inhouseReelsTranslations.te.delete);
      fireEvent.click(deleteButtons[0]);
      expect(handleDelete).toHaveBeenCalledWith(
        'reel-1',
        inhouseReelsTranslations.te.confirmDelete,
        inhouseReelsTranslations.te.failedToDelete
      );

      const activeButtons = screen.getAllByText(inhouseReelsTranslations.te.active);
      fireEvent.click(activeButtons[0]);
      expect(handleToggleStatus).toHaveBeenCalled();
    });
  });

  describe('InhouseReelsDrawer component', () => {
    it('should submit a new reel with selected language code', async () => {
      (eventsApiClient.post as jest.Mock).mockResolvedValueOnce({ success: true, id: 'new-reel' });
      const handleSuccess = jest.fn();
      const handleClose = jest.fn();

      render(
        <InhouseReelsDrawer
          open={true}
          isEditMode={false}
          selectedReel={null}
          defaultLang="ml"
          onClose={handleClose}
          onSuccess={handleSuccess}
          isDark={false}
        />
      );

      // Fill in title
      const titleInput = screen.getByLabelText(/శీర్షిక \*/i);
      fireEvent.change(titleInput, { target: { name: 'title', value: 'New Malayalam Story' } });

      // Fill in direct video URL
      const videoUrlInputs = screen.getAllByPlaceholderText('https://...');
      fireEvent.change(videoUrlInputs[0], {
        target: { name: 'videoUrl', value: 'https://cdn.example.com/ml-story.mp4' },
      });

      // Submit
      const submitButton = screen.getByText(inhouseReelsTranslations.te.createReel);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(eventsApiClient.post).toHaveBeenCalledWith(
          '/reels',
          expect.objectContaining({
            title: 'New Malayalam Story',
            videoUrl: 'https://cdn.example.com/ml-story.mp4',
            language: 'ml',
            lang: 'ml',
            language_code: 'ml',
          })
        );
        expect(handleSuccess).toHaveBeenCalledWith('ml');
        expect(handleClose).toHaveBeenCalled();
      });
    });

    it('should update existing reel language code on edit', async () => {
      (eventsApiClient.patch as jest.Mock).mockResolvedValueOnce({ success: true });
      const handleSuccess = jest.fn();
      const handleClose = jest.fn();

      render(
        <InhouseReelsDrawer
          open={true}
          isEditMode={true}
          selectedReel={mockReels[0] as any}
          defaultLang="te"
          onClose={handleClose}
          onSuccess={handleSuccess}
          isDark={true}
        />
      );

      expect(screen.getByDisplayValue('Telugu News Reel')).toBeInTheDocument();

      // Submit the edit
      const saveButton = screen.getByText(inhouseReelsTranslations.te.saveChanges);
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(eventsApiClient.patch).toHaveBeenCalledWith(
          '/reels/reel-1',
          expect.objectContaining({
            title: 'Telugu News Reel',
            language: 'te',
            lang: 'te',
            language_code: 'te',
          })
        );
        expect(handleSuccess).toHaveBeenCalledWith('te');
      });
    });

    it('should upload video file and set videoUrl', async () => {
      (eventsApiClient.post as jest.Mock).mockResolvedValueOnce({
        data: { url: 'https://cdn.example.com/uploaded-video.mp4' },
      });

      render(
        <InhouseReelsDrawer
          open={true}
          isEditMode={false}
          selectedReel={null}
          defaultLang="te"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isDark={false}
        />
      );

      const fileInput = document.body.querySelector('input[type="file"][accept="video/*"]');
      expect(fileInput).toBeInTheDocument();

      const file = new File(['dummy-video-content'], 'test-video.mp4', { type: 'video/mp4' });
      fireEvent.change(fileInput!, { target: { files: [file] } });

      await waitFor(() => {
        expect(eventsApiClient.post).toHaveBeenCalledWith(
          '/reels/upload-video',
          expect.any(FormData),
          expect.any(Object)
        );
      });
    });

    it('should upload thumbnail image and set thumbnailUrl', async () => {
      (UploadService.uploadImage as jest.Mock).mockResolvedValueOnce(
        'https://cdn.example.com/uploaded-thumb.png'
      );

      render(
        <InhouseReelsDrawer
          open={true}
          isEditMode={false}
          selectedReel={null}
          defaultLang="te"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isDark={false}
        />
      );

      const fileInput = document.body.querySelector('input[type="file"][accept="image/*"]');
      expect(fileInput).toBeInTheDocument();

      const file = new File(['dummy-image-content'], 'test-thumb.png', { type: 'image/png' });
      fireEvent.change(fileInput!, { target: { files: [file] } });

      await waitFor(() => {
        expect(UploadService.uploadImage).toHaveBeenCalledWith(file);
      });
    });

    it('should validate required fields before submission', async () => {
      window.alert = jest.fn();

      render(
        <InhouseReelsDrawer
          open={true}
          isEditMode={false}
          selectedReel={null}
          defaultLang="te"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isDark={false}
        />
      );

      const submitButton = screen.getByText(inhouseReelsTranslations.te.createReel);
      fireEvent.click(submitButton);

      expect(window.alert).toHaveBeenCalledWith(inhouseReelsTranslations.te.titleAndVideoRequired);
      expect(eventsApiClient.post).not.toHaveBeenCalled();
    });

    it('should handle video removal and thumbnail removal', () => {
      render(
        <InhouseReelsDrawer
          open={true}
          isEditMode={true}
          selectedReel={mockReels[0] as any}
          defaultLang="te"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isDark={true}
        />
      );

      const removeVideoBtn = screen.getByText(inhouseReelsTranslations.te.removeVideo);
      fireEvent.click(removeVideoBtn);
      expect(screen.getByText(inhouseReelsTranslations.te.uploadVideo)).toBeInTheDocument();

      const removeThumbBtn = screen.getByText(inhouseReelsTranslations.te.removeThumbnail);
      fireEvent.click(removeThumbBtn);
      expect(screen.getByText(inhouseReelsTranslations.te.uploadThumbnail)).toBeInTheDocument();
    });

    it('should handle form fields changes: switches, duration, hashtags', () => {
      render(
        <InhouseReelsDrawer
          open={true}
          isEditMode={false}
          selectedReel={null}
          defaultLang="te"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isDark={false}
        />
      );

      // Duration input
      const durationInput = screen.getByLabelText(inhouseReelsTranslations.te.durationSeconds);
      fireEvent.change(durationInput, { target: { name: 'durationSeconds', value: '45abc' } });

      // Description input
      const descInput = screen.getByLabelText(inhouseReelsTranslations.te.description);
      fireEvent.change(descInput, { target: { name: 'description', value: 'New description' } });

      // Toggles
      const allowCommentsSwitch = screen.getByLabelText(inhouseReelsTranslations.te.allowComments);
      fireEvent.click(allowCommentsSwitch);

      const allowSharingSwitch = screen.getByLabelText(inhouseReelsTranslations.te.allowSharing);
      fireEvent.click(allowSharingSwitch);

      const allowDownloadsSwitch = screen.getByLabelText(
        inhouseReelsTranslations.te.allowDownloads
      );
      fireEvent.click(allowDownloadsSwitch);
    });

    it('should handle video upload error and thumbnail upload error', async () => {
      window.alert = jest.fn();
      (eventsApiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

      render(
        <InhouseReelsDrawer
          open={true}
          isEditMode={false}
          selectedReel={null}
          defaultLang="te"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isDark={false}
        />
      );

      const fileInput = document.body.querySelector('input[type="file"][accept="video/*"]');
      const file = new File(['data'], 'test.mp4', { type: 'video/mp4' });
      fireEvent.change(fileInput!, { target: { files: [file] } });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(inhouseReelsTranslations.te.failedToUploadVideo);
      });

      // Thumbnail upload error
      (UploadService.uploadImage as jest.Mock).mockRejectedValueOnce(new Error('Image failed'));
      const imgInput = document.body.querySelector('input[type="file"][accept="image/*"]');
      const imgFile = new File(['data'], 'test.jpg', { type: 'image/jpeg' });
      fireEvent.change(imgInput!, { target: { files: [imgFile] } });

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          inhouseReelsTranslations.te.failedToUploadThumbnail
        );
      });
    });

    it('should alert if save reel fails', async () => {
      window.alert = jest.fn();
      (eventsApiClient.post as jest.Mock).mockRejectedValueOnce(new Error('Save failed'));

      render(
        <InhouseReelsDrawer
          open={true}
          isEditMode={false}
          selectedReel={null}
          defaultLang="te"
          onClose={jest.fn()}
          onSuccess={jest.fn()}
          isDark={false}
        />
      );

      const titleInput = screen.getByLabelText(/శీర్షిక \*/i);
      fireEvent.change(titleInput, { target: { name: 'title', value: 'Test' } });

      const videoUrlInputs = screen.getAllByPlaceholderText('https://...');
      fireEvent.change(videoUrlInputs[0], {
        target: { name: 'videoUrl', value: 'https://cdn.example.com/test.mp4' },
      });

      const submitButton = screen.getByText(inhouseReelsTranslations.te.createReel);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Save failed');
      });
    });
  });

  describe('InhouseReelsTab component', () => {
    it('should render InhouseReelsTab with language selection options and filter by search and language', async () => {
      render(<InhouseReelsTab isDark={true} />);

      await waitFor(() => {
        expect(screen.getByText(inhouseReelsTranslations.te.addInhouseReel)).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(inhouseReelsTranslations.te.searchTitle);
      fireEvent.change(searchInput, { target: { value: 'Telugu' } });

      // Clear search
      const clearBtn = screen.getByText('✕');
      fireEvent.click(clearBtn);
      expect(searchInput).toHaveValue('');

      // Click Add button to open drawer
      const addBtn = screen.getByText(inhouseReelsTranslations.te.addInhouseReel);
      fireEvent.click(addBtn);

      await waitFor(() => {
        expect(screen.getByText(inhouseReelsTranslations.te.uploadAndDetails)).toBeInTheDocument();
      });
    });
  });

  describe('inhouseReelsTranslations coverage for all 4 languages', () => {
    it('should have complete translations for en, te, hi, and ml', () => {
      const languages = ['en', 'te', 'hi', 'ml'] as const;
      const baseKeys = Object.keys(inhouseReelsTranslations.en);

      languages.forEach((lang) => {
        const trans = inhouseReelsTranslations[lang];
        expect(trans).toBeDefined();
        baseKeys.forEach((key) => {
          expect(trans[key as keyof typeof trans]).toBeDefined();
          expect(typeof trans[key as keyof typeof trans]).toBe('string');
          expect((trans[key as keyof typeof trans] as string).length).toBeGreaterThan(0);
        });
      });
    });
  });
});
