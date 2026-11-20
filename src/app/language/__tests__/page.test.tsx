import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import LanguageSelectionPage from '../page';
import { useLanguageStore } from '@/core/storage/language-store';
import { useUserStore } from '@/core/storage/user-store';
import { apiClient } from '@/core/api/api-client';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/core/api/api-client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('LanguageSelectionPage - Malayalam Static Enablement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLanguageStore.setState({
      language: 'en',
      activeLanguages: ['en', 'te', 'hi', 'ml'],
    });
    useUserStore.setState({
      user: {
        username: 'testuser',
        role: 'Administrator',
        isLoggedIn: true,
      },
    });
  });

  it('statically enables Malayalam when API returns only Telugu', async () => {
    // API returns only Telugu
    (apiClient.get as jest.Mock).mockResolvedValueOnce([
      {
        id: 2,
        code: 'te',
        name: { en: 'Telugu', te: 'తెలుగు', hi: 'तेलुगु', ml: 'തെലുങ്ക്' },
        status: true,
        symbol: 'అ',
      },
    ]);

    await act(async () => {
      render(<LanguageSelectionPage />);
    });

    await waitFor(() => {
      // Malayalam card should be rendered
      expect(screen.getByTestId('language-card-ml')).toBeTruthy();
      expect(screen.getByText('മലയാളം')).toBeTruthy();
    });

    // Check that Malayalam is statically enabled in activeLanguages
    const activeLanguages = useLanguageStore.getState().activeLanguages;
    expect(activeLanguages).toContain('ml');

    // Check system languages in store
    const systemLanguages = useLanguageStore.getState().systemLanguages;
    const mlLang = systemLanguages.find((l) => l.code === 'ml');
    expect(mlLang).toBeDefined();
    expect(mlLang?.isSystemActive).toBe(true);
    expect(mlLang?.symbol).toBe('മ');
  });

  it('allows clicking Malayalam card and updates language store to ml', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce([
      {
        id: 2,
        code: 'te',
        name: { en: 'Telugu', te: 'తెలుగు' },
        status: true,
        symbol: 'అ',
      },
    ]);

    await act(async () => {
      render(<LanguageSelectionPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('language-card-ml')).toBeTruthy();
    });

    const mlCard = screen.getByTestId('language-card-ml');
    fireEvent.click(mlCard);

    expect(useLanguageStore.getState().language).toBe('ml');

    // UI should display Malayalam translations
    expect(screen.getByText('ഭാഷ തിരഞ്ഞെടുക്കുക')).toBeTruthy();
    expect(screen.getByText('തുടരുക')).toBeTruthy();
  });

  it('uses fallback with statically enabled Malayalam when API call fails', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<LanguageSelectionPage />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('language-card-ml')).toBeTruthy();
      expect(screen.getByText('മലയാളം')).toBeTruthy();
    });

    const mlCard = screen.getByTestId('language-card-ml');
    fireEvent.click(mlCard);

    expect(useLanguageStore.getState().language).toBe('ml');
  });

  it('navigates to appropriate dashboard/creator path on continue button click', async () => {
    (apiClient.get as jest.Mock).mockResolvedValueOnce([]);

    await act(async () => {
      render(<LanguageSelectionPage />);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy();
    });

    // Administrator navigates to /dashboard
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');

    // Epaper creator navigates to /epapers
    useUserStore.setState({ user: { username: 'ep', role: 'epaper_creator', isLoggedIn: true } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenCalledWith('/epapers');

    // Movie creator navigates to /movies
    useUserStore.setState({ user: { username: 'mv', role: 'movie_creator', isLoggedIn: true } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenCalledWith('/movies');

    // Notification creator navigates to /notifications
    useUserStore.setState({
      user: { username: 'nc', role: 'notification_creator', isLoggedIn: true },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenCalledWith('/notifications');

    // Ads creator navigates to /ads-dynapix
    useUserStore.setState({
      user: { username: 'ads', role: 'adsdynapix_creator', isLoggedIn: true },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenCalledWith('/ads-dynapix');
  });
});
