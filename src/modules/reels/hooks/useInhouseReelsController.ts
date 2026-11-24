import { useState, useEffect, useMemo, useCallback } from 'react';
import { eventsApiClient } from '@/core/api/api-client';
import { UploadedReel } from '../domain/reels.model';
import { useLanguageStore } from '@/core/storage/language-store';

export const useInhouseReelsController = () => {
  const { language } = useLanguageStore();
  const [data, setData] = useState<UploadedReel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [filterTitle, setFilterTitle] = useState('');
  const [filterLang, setFilterLang] = useState<string>(() => language || 'te');
  const recordsPerPage = 10;

  // Sync with global language store if updated to valid supported language
  useEffect(() => {
    if (language && ['te', 'en', 'hi', 'ml'].includes(language)) {
      setFilterLang(language);
    }
  }, [language]);

  const fetchReels = useCallback(
    async (targetLang?: string) => {
      setLoading(true);
      setError(null);
      try {
        const activeLang = targetLang !== undefined ? targetLang : filterLang;
        const params: Record<string, any> = {
          page: 1,
          limit: 100,
          skip: 0,
          take: 100,
        };
        if (activeLang === 'all') {
          params.lang = 'all';
        } else {
          params.lang = activeLang;
          params.language = activeLang;
          params.language_code = activeLang;
        }
        const response = await eventsApiClient.get<any>('/reels', params);
        let reelsArray: UploadedReel[] = [];
        if (Array.isArray(response)) {
          reelsArray = response;
        } else if (response && typeof response === 'object' && Array.isArray(response.data)) {
          reelsArray = response.data;
        }
        setData(reelsArray);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load reels');
      } finally {
        setLoading(false);
      }
    },
    [filterLang]
  );

  useEffect(() => {
    fetchReels();
  }, [fetchReels]);

  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? data : [];
    if (filterLang && filterLang !== 'all') {
      result = result.filter((r) => {
        const reelLang = (r?.language_code || r?.language || r?.lang || 'te').toLowerCase();
        return reelLang === filterLang.toLowerCase();
      });
    }
    if (filterTitle) {
      const lowerFilter = filterTitle.toLowerCase();
      result = result.filter((r) => (r?.title || '').toLowerCase().includes(lowerFilter));
    }
    return result;
  }, [data, filterLang, filterTitle]);

  const totalPages = Math.ceil((filteredData?.length || 0) / recordsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * recordsPerPage;
    return filteredData.slice(startIndex, startIndex + recordsPerPage);
  }, [filteredData, page, recordsPerPage]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedReel, setSelectedReel] = useState<UploadedReel | null>(null);

  const handleAddClick = () => {
    setIsEditMode(false);
    setSelectedReel(null);
    setDrawerOpen(true);
  };

  const handleEditClick = (reel: UploadedReel) => {
    setIsEditMode(true);
    setSelectedReel(reel);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedReel(null);
      setIsEditMode(false);
    }, 300);
  };

  const handleSaveSuccess = (savedLang?: string) => {
    if (savedLang && filterLang !== 'all' && filterLang !== savedLang) {
      setFilterLang(savedLang);
    } else {
      fetchReels(savedLang);
    }
  };

  const handleDelete = async (id: string, confirmMessage?: string, failMessage?: string) => {
    if (!window.confirm(confirmMessage || 'Are you sure you want to delete this reel?')) return;
    try {
      await eventsApiClient.delete(`/reels/${id}`);
      fetchReels();
    } catch (err: any) {
      console.error('Failed to delete:', err);
      alert(err.message || failMessage || 'Failed to delete reel');
    }
  };

  const handleStatusToggle = async (reel: UploadedReel, failMessage?: string) => {
    try {
      const currentStatus = reel.publishing?.isActive ?? false;
      const nextIsActive = !currentStatus;
      await eventsApiClient.patch(`/reels/${reel.id}`, {
        publishing: {
          isActive: nextIsActive,
          status: nextIsActive ? 'published' : 'draft',
        },
      });
      fetchReels();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err.message || failMessage || 'Failed to update status');
    }
  };

  return {
    data,
    filteredData,
    paginatedData,
    loading,
    error,
    page,
    totalPages,
    setPage,
    filterTitle,
    setFilterTitle,
    filterLang,
    setFilterLang,
    fetchReels,
    drawerOpen,
    isEditMode,
    selectedReel,
    handleAddClick,
    handleEditClick,
    handleCloseDrawer,
    handleSaveSuccess,
    handleDelete,
    handleStatusToggle,
  };
};
