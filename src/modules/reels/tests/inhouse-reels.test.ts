import { renderHook, act } from '@testing-library/react';
import { useInhouseReelsController } from '../hooks/useInhouseReelsController';
import { eventsApiClient } from '@/core/api/api-client';

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

describe('useInhouseReelsController hook', () => {
  const mockReels = [
    {
      id: 'reel-1',
      title: 'Telugu News Reel',
      description: 'First reel',
      language: 'te',
      videoUrl: 'https://cdn.example.com/video1.mp4',
      thumbnailUrl: 'https://cdn.example.com/thumb1.png',
      publishing: { isActive: true, status: 'published' },
    },
    {
      id: 'reel-2',
      title: 'Cinema Updates',
      description: 'Second reel',
      language: 'te',
      videoUrl: 'https://cdn.example.com/video2.mp4',
      thumbnailUrl: 'https://cdn.example.com/thumb2.png',
      publishing: { isActive: false, status: 'draft' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (eventsApiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReels,
    });
  });

  it('should fetch in-house reels on mount with default Telugu language and pagination params', async () => {
    let hookResult: any;
    await act(async () => {
      hookResult = renderHook(() => useInhouseReelsController());
    });

    expect(eventsApiClient.get).toHaveBeenCalledWith('/reels', {
      lang: 'te',
      page: 1,
      limit: 100,
      skip: 0,
      take: 100,
    });
    expect(hookResult.result.current.data.length).toBe(2);
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
    expect(eventsApiClient.get).toHaveBeenCalledTimes(2); // Initial + refetch
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

  it('should set error state when fetchReels fails', async () => {
    (eventsApiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

    let hookResult: any;
    await act(async () => {
      hookResult = renderHook(() => useInhouseReelsController());
    });

    expect(hookResult.result.current.error).toBe('Network failure');
    expect(hookResult.result.current.loading).toBe(false);
  });
});
