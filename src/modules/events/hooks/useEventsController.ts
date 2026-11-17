import { useState, useEffect, useCallback } from 'react';
import {
  EventItem,
  EventStats,
  CreateEventInput,
  UpdateEventInput,
  TicketTypeItem,
  CreateTicketTypeInput,
  CouponItem,
  CreateCouponInput,
  AppConfigItem,
  BookingItem,
  CreateBookingInput,
  UpdateBookingStatusInput,
  VerifyQrResult,
  BookingAdminStats,
} from '../domain/event.types';
import { eventsRepository, FOLK_NIGHT_EVENT_ID } from '../repositories/events.repository';

export type EventTabType = 'events' | 'bookings' | 'tickets' | 'coupons' | 'config';

export const useEventsController = () => {
  const [activeTab, setActiveTab] = useState<EventTabType>('events');

  // Events State
  const [events, setEvents] = useState<EventItem[]>([]);
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    liveEvents: 0,
    completedEvents: 0,
    totalSeats: 0,
    availableSeats: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Tickets State
  const [tickets, setTickets] = useState<TicketTypeItem[]>([]);
  const [selectedTicketEventId, setSelectedTicketEventId] = useState<string>('ALL');
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);

  // Coupons State
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponItem | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);

  // Discount Coupons Handlers
  const handleOpenAddCouponModal = () => {
    setSelectedCoupon(null);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCouponModal = (coupon: CouponItem) => {
    setSelectedCoupon(coupon);
    setIsCouponModalOpen(true);
  };

  const handleCloseCouponModal = () => {
    setIsCouponModalOpen(false);
    setSelectedCoupon(null);
  };

  const handleSaveCoupon = async (input: CreateCouponInput) => {
    if (selectedCoupon) {
      await eventsRepository.updateCoupon(selectedCoupon.id, input);
    } else {
      await eventsRepository.createCoupon(input);
    }
    handleCloseCouponModal();
    fetchAllData();
  };

  const handleToggleCouponStatus = async (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
    await eventsRepository.toggleCouponStatus(id);
    fetchAllData();
  };

  const handleDeleteCoupon = async (id: string) => {
    await eventsRepository.deleteCoupon(id);
    fetchAllData();
  };

  // App Config State
  const [appConfig, setAppConfig] = useState<AppConfigItem>({
    id: 'cfg_default_001',
    key: 'default',
    webEnable: true,
    eventsEnable: true,
    folkNight: true,
    cricket: true,
    bannersEnable: true,
    razorpayKeyId: 'rzp_test_TThQ1dclehkMIs',
    isTestMode: true,
    maintenanceMode: false,
  });

  // Bookings State
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [bookingStats, setBookingStats] = useState<BookingAdminStats | null>(null);
  const [bookingSearch, setBookingSearch] = useState<string>('');
  const [selectedBookingStatus, setSelectedBookingStatus] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');
  const [bookingPage, setBookingPage] = useState<number>(1);
  const bookingItemsPerPage = 6;
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [isBookingStatusModalOpen, setIsBookingStatusModalOpen] = useState<boolean>(false);
  const [isCreateBookingModalOpen, setIsCreateBookingModalOpen] = useState<boolean>(false);
  const [isTicketQrModalOpen, setIsTicketQrModalOpen] = useState<boolean>(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState<boolean>(false);
  const [syncingInventory, setSyncingInventory] = useState<boolean>(false);

  // Drawer State for Events
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedEvents, fetchedStats, fetchedTickets, fetchedCoupons, fetchedConfig, fetchedBookings, fetchedBookingStats] =
        await Promise.all([
          eventsRepository.getEvents(search, selectedCity, selectedStatus),
          eventsRepository.getStats(),
          eventsRepository.getTicketTypes(selectedTicketEventId),
          eventsRepository.getCoupons(),
          eventsRepository.getAppConfig(),
          eventsRepository.getBookings({
            eventId: FOLK_NIGHT_EVENT_ID,
            bookingStatus: selectedBookingStatus,
            paymentStatus: selectedPaymentStatus,
            search: bookingSearch,
          }),
          eventsRepository.getBookingAdminStats(FOLK_NIGHT_EVENT_ID),
        ]);

      setEvents(fetchedEvents);
      setStats(fetchedStats);
      setTickets(fetchedTickets);
      setCoupons(fetchedCoupons);
      if (fetchedConfig) setAppConfig(fetchedConfig);
      setBookings(fetchedBookings.data || []);
      if (fetchedBookingStats) setBookingStats(fetchedBookingStats);
    } catch {
      // Handled in repository fallback
    } finally {
      setLoading(false);
    }
  }, [search, selectedCity, selectedStatus, selectedTicketEventId, bookingSearch, selectedBookingStatus, selectedPaymentStatus]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Events Handlers
  const totalPages = Math.max(1, Math.ceil(events.length / itemsPerPage));
  const paginatedEvents = events.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleOpenAddDrawer = () => {
    setSelectedEvent(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEditDrawer = (event: EventItem) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = async (input: CreateEventInput | UpdateEventInput) => {
    if (selectedEvent) {
      await eventsRepository.updateEvent(selectedEvent.id, input);
    } else {
      await eventsRepository.createEvent(input as CreateEventInput);
    }
    handleCloseDrawer();
    fetchAllData();
  };

  const handleDeleteEvent = async (id: string) => {
    await eventsRepository.deleteEvent(id);
    fetchAllData();
  };

  const handleToggleAvailability = async (id: string) => {
    await eventsRepository.toggleAvailability(id);
    fetchAllData();
  };

  // Ticket Types Handlers
  const [selectedTicket, setSelectedTicket] = useState<TicketTypeItem | null>(null);

  const handleOpenAddTicketModal = () => {
    setSelectedTicket(null);
    setIsTicketModalOpen(true);
  };

  const handleOpenEditTicketModal = (ticket: TicketTypeItem) => {
    setSelectedTicket(ticket);
    setIsTicketModalOpen(true);
  };

  const handleCloseTicketModal = () => {
    setIsTicketModalOpen(false);
    setSelectedTicket(null);
  };

  const handleSaveTicket = async (input: CreateTicketTypeInput) => {
    if (selectedTicket) {
      await eventsRepository.updateTicketType(selectedTicket.id, input);
    } else {
      await eventsRepository.createTicketType(input);
    }
    handleCloseTicketModal();
    fetchAllData();
  };

  const handleToggleTicketStatus = async (id: string) => {
    await eventsRepository.toggleTicketStatus(id);
    fetchAllData();
  };

  const handleDeleteTicket = async (id: string) => {
    await eventsRepository.deleteTicketType(id);
    fetchAllData();
  };

  // App Config Handlers
  const handleUpdateConfig = async (updated: Partial<AppConfigItem>) => {
    const newConfig = await eventsRepository.updateAppConfig(updated);
    setAppConfig(newConfig);
  };

  // Bookings Handlers & Pagination
  const bookingTotalPages = Math.max(1, Math.ceil(bookings.length / bookingItemsPerPage));
  const paginatedBookings = bookings.slice((bookingPage - 1) * bookingItemsPerPage, bookingPage * bookingItemsPerPage);

  const handleOpenStatusModal = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setIsBookingStatusModalOpen(true);
  };

  const handleCloseStatusModal = () => {
    setIsBookingStatusModalOpen(false);
    setSelectedBooking(null);
  };

  const handleUpdateBookingStatus = async (input: UpdateBookingStatusInput) => {
    if (!selectedBooking) return;
    await eventsRepository.updateBookingStatus(selectedBooking.id, input);
    handleCloseStatusModal();
    fetchAllData();
  };

  const handleOpenCreateBookingModal = () => {
    setIsCreateBookingModalOpen(true);
  };

  const handleCloseCreateBookingModal = () => {
    setIsCreateBookingModalOpen(false);
  };

  const handleCreateBooking = async (input: CreateBookingInput) => {
    await eventsRepository.createBooking(input);
    handleCloseCreateBookingModal();
    fetchAllData();
  };

  const handleOpenTicketQrModal = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setIsTicketQrModalOpen(true);
  };

  const handleCloseTicketQrModal = () => {
    setIsTicketQrModalOpen(false);
    setSelectedBooking(null);
  };

  const handleOpenCheckInModal = (booking?: BookingItem) => {
    setSelectedBooking(booking || null);
    setIsCheckInModalOpen(true);
  };

  const handleCloseCheckInModal = () => {
    setIsCheckInModalOpen(false);
    setSelectedBooking(null);
  };

  const handleVerifyQr = async (code: string) => {
    return await eventsRepository.verifyQrCode(code);
  };

  const handleCheckIn = async (code: string) => {
    const res = await eventsRepository.checkInTicket(code);
    fetchAllData();
    return res;
  };

  const handleSyncInventory = async () => {
    setSyncingInventory(true);
    try {
      await eventsRepository.syncInventory(FOLK_NIGHT_EVENT_ID);
      await fetchAllData();
    } finally {
      setSyncingInventory(false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    events: paginatedEvents,
    allEvents: events,
    stats,
    loading,
    search,
    setSearch,
    selectedCity,
    setSelectedCity,
    selectedStatus,
    setSelectedStatus,
    page,
    totalPages,
    setPage,
    isDrawerOpen,
    isModalOpen: isDrawerOpen,
    selectedEvent,
    handleOpenAddDrawer,
    handleOpenAddModal: handleOpenAddDrawer,
    handleOpenEditDrawer,
    handleOpenEditModal: handleOpenEditDrawer,
    handleCloseDrawer,
    handleCloseModal: handleCloseDrawer,
    handleSaveEvent,
    handleDeleteEvent,
    handleToggleAvailability,

    // Bookings
    bookings: paginatedBookings,
    allBookings: bookings,
    bookingStats,
    bookingSearch,
    setBookingSearch,
    selectedBookingStatus,
    setSelectedBookingStatus,
    selectedPaymentStatus,
    setSelectedPaymentStatus,
    bookingPage,
    setBookingPage,
    bookingTotalPages,
    selectedBooking,
    isBookingStatusModalOpen,
    handleOpenStatusModal,
    handleCloseStatusModal,
    handleUpdateBookingStatus,
    isCreateBookingModalOpen,
    handleOpenCreateBookingModal,
    handleCloseCreateBookingModal,
    handleCreateBooking,
    isTicketQrModalOpen,
    handleOpenTicketQrModal,
    handleCloseTicketQrModal,
    isCheckInModalOpen,
    handleOpenCheckInModal,
    handleCloseCheckInModal,
    handleVerifyQr,
    handleCheckIn,
    syncingInventory,
    handleSyncInventory,

    // Tickets
    tickets,
    selectedTicketEventId,
    setSelectedTicketEventId,
    selectedTicket,
    isTicketModalOpen,
    setIsTicketModalOpen,
    handleOpenAddTicketModal,
    handleOpenEditTicketModal,
    handleCloseTicketModal,
    handleSaveTicket,
    handleToggleTicketStatus,
    handleDeleteTicket,

    // Coupons
    coupons,
    selectedCoupon,
    isCouponModalOpen,
    setIsCouponModalOpen,
    handleOpenAddCouponModal,
    handleOpenEditCouponModal,
    handleCloseCouponModal,
    handleSaveCoupon,
    handleToggleCouponStatus,
    handleDeleteCoupon,

    // Config
    appConfig,
    handleUpdateConfig,

    refresh: fetchAllData,
  };
};
