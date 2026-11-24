'use client';

import React from 'react';
import { Header } from '@/shared/components/Header';
import { Sidebar } from '@/shared/components/Sidebar';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Pagination,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Search,
  Add,
  Event as EventIcon,
  EventAvailable,
  ConfirmationNumber,
  MeetingRoom,
  LocalOffer,
  Settings,
  BookOnline,
  QrCodeScanner,
} from '@mui/icons-material';
import { useLanguageStore } from '@/core/storage/language-store';
import { useAppTheme } from '@/shared/providers/ThemeProvider';
import { useEventsController } from '../hooks/useEventsController';
import { EventsTable } from '../components/EventsTable';
import { EventDrawer } from '../components/EventDrawer';
import { TicketsTable } from '../components/TicketsTable';
import { TicketModal } from '../components/TicketModal';
import { CouponsTable } from '../components/CouponsTable';
import { CouponModal } from '../components/CouponModal';
import { AppConfigPanel } from '../components/AppConfigPanel';
import { BookingAnalyticsCards } from '../components/BookingAnalyticsCards';
import { BookingsTable } from '../components/BookingsTable';
import { BookingStatusModal } from '../components/BookingStatusModal';
import { CreateBookingModal } from '../components/CreateBookingModal';
import { TicketQrModal } from '../components/TicketQrModal';
import { QrCheckInModal } from '../components/QrCheckInModal';
import { Loader } from '@/shared/components/Loader';
import { eventTranslations } from '../translations';

export const EventsPage: React.FC = () => {
  const { language } = useLanguageStore();
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';
  const t = eventTranslations[language] || eventTranslations.en;

  const {
    activeTab,
    setActiveTab,
    events,
    allEvents,
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
    isModalOpen,
    selectedEvent,
    handleOpenAddDrawer,
    handleOpenAddModal,
    handleOpenEditDrawer,
    handleOpenEditModal,
    handleCloseDrawer,
    handleCloseModal,
    handleSaveEvent,
    handleDeleteEvent,
    handleToggleAvailability,

    // Bookings
    bookings,
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
  } = useEventsController();

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar activeHref="/events" />

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: isDark ? '#0b0f19' : '#f8fafc',
            color: isDark ? '#f8fafc' : '#0f172a',
          }}
        >
          {/* Header Row */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
                {t.pageTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5 }}>
                {t.subTitle}
              </Typography>
            </Box>

            {/* Top Action Buttons based on Active Tab */}
            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              {activeTab === 'events' && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenAddModal}
                  sx={{
                    borderRadius: '12px',
                    px: 2.5,
                    py: 1.2,
                    fontWeight: 700,
                    textTransform: 'none',
                    backgroundColor: '#facc15',
                    color: '#1a1300',
                    boxShadow: '0 4px 14px rgba(250, 204, 21, 0.35)',
                    '&:hover': { backgroundColor: '#fde047' },
                  }}
                >
                  {t.addEvent}
                </Button>
              )}

              {activeTab === 'bookings' && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<QrCodeScanner />}
                    onClick={() => handleOpenCheckInModal()}
                    sx={{
                      borderRadius: '12px',
                      px: 2,
                      py: 1.2,
                      fontWeight: 700,
                      textTransform: 'none',
                      borderColor: '#ea580c',
                      color: '#ea580c',
                      '&:hover': {
                        borderColor: '#c2410c',
                        backgroundColor: 'rgba(234, 88, 12, 0.08)',
                      },
                    }}
                  >
                    {t.btnGateCheckIn || 'Gate Check-in / Verify'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenCreateBookingModal}
                    sx={{
                      borderRadius: '12px',
                      px: 2.5,
                      py: 1.2,
                      fontWeight: 700,
                      textTransform: 'none',
                      backgroundColor: '#ea580c',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                      '&:hover': { backgroundColor: '#c2410c' },
                    }}
                  >
                    {t.btnNewBooking || 'New Ticket Booking'}
                  </Button>
                </>
              )}

              {activeTab === 'tickets' && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenAddTicketModal}
                  sx={{
                    borderRadius: '12px',
                    px: 2.5,
                    py: 1.2,
                    fontWeight: 700,
                    textTransform: 'none',
                    backgroundColor: '#facc15',
                    color: '#1a1300',
                    boxShadow: '0 4px 14px rgba(250, 204, 21, 0.35)',
                    '&:hover': { backgroundColor: '#fde047' },
                  }}
                >
                  {t.addTicket}
                </Button>
              )}

              {activeTab === 'coupons' && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenAddCouponModal}
                  sx={{
                    borderRadius: '12px',
                    px: 2.5,
                    py: 1.2,
                    fontWeight: 700,
                    textTransform: 'none',
                    backgroundColor: '#10b981',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                    '&:hover': { backgroundColor: '#059669' },
                  }}
                >
                  {t.addCoupon}
                </Button>
              )}
            </Box>
          </Box>

          {/* Top Tabs Bar */}
          <Box
            sx={{
              borderBottom: isDark
                ? '1px solid rgba(255,255,255,0.08)'
                : '1px solid rgba(0,0,0,0.08)',
              mb: 3,
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: isDark ? '#94a3b8' : '#64748b',
                  minHeight: 48,
                  '&.Mui-selected': {
                    color: isDark ? '#fde047' : '#b45309',
                  },
                },
              }}
            >
              <Tab label={t.tabEvents} icon={<EventIcon />} iconPosition="start" value="events" />
              <Tab
                label={t.tabBookings || 'Folk Night Bookings'}
                icon={<BookOnline />}
                iconPosition="start"
                value="bookings"
              />
              <Tab
                label={t.tabTickets}
                icon={<ConfirmationNumber />}
                iconPosition="start"
                value="tickets"
              />
              <Tab
                label={t.tabCoupons}
                icon={<LocalOffer />}
                iconPosition="start"
                value="coupons"
              />
              <Tab label={t.tabConfig} icon={<Settings />} iconPosition="start" value="config" />
            </Tabs>
          </Box>

          {loading ? (
            <Loader />
          ) : (
            <>
              {/* ======================================================= */}
              {/* 1. EVENTS SUB-TAB */}
              {/* ======================================================= */}
              {activeTab === 'events' && (
                <>
                  {/* Stat Cards */}
                  <Grid container spacing={2.5} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          backgroundColor: isDark ? 'rgba(28,22,3,0.45)' : '#ffffff',
                          backdropFilter: isDark ? 'blur(16px)' : 'none',
                          borderRadius: 3,
                          border: isDark
                            ? '1px solid rgba(255,255,255,0.08)'
                            : '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              backgroundColor: 'rgba(59, 130, 246, 0.15)',
                              color: '#3b82f6',
                            }}
                          >
                            <EventIcon />
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              {t.statTotal}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {stats.totalEvents}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          backgroundColor: isDark ? 'rgba(28,22,3,0.45)' : '#ffffff',
                          backdropFilter: isDark ? 'blur(16px)' : 'none',
                          borderRadius: 3,
                          border: isDark
                            ? '1px solid rgba(255,255,255,0.08)'
                            : '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              backgroundColor: 'rgba(99, 102, 241, 0.15)',
                              color: '#6366f1',
                            }}
                          >
                            <EventAvailable />
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              {t.statUpcoming}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {stats.upcomingEvents}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          backgroundColor: isDark ? 'rgba(28,22,3,0.45)' : '#ffffff',
                          backdropFilter: isDark ? 'blur(16px)' : 'none',
                          borderRadius: 3,
                          border: isDark
                            ? '1px solid rgba(255,255,255,0.08)'
                            : '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              backgroundColor: 'rgba(34, 197, 94, 0.15)',
                              color: '#22c55e',
                            }}
                          >
                            <EventAvailable />
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              {t.statLive}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {stats.liveEvents}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Card
                        sx={{
                          backgroundColor: isDark ? 'rgba(28,22,3,0.45)' : '#ffffff',
                          backdropFilter: isDark ? 'blur(16px)' : 'none',
                          borderRadius: 3,
                          border: isDark
                            ? '1px solid rgba(255,255,255,0.08)'
                            : '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 2.5,
                              backgroundColor: 'rgba(245, 158, 11, 0.15)',
                              color: '#f59e0b',
                            }}
                          >
                            <MeetingRoom />
                          </Box>
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: isDark ? '#94a3b8' : '#64748b' }}
                            >
                              {t.statSeats}
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                              {stats.availableSeats} / {stats.totalSeats}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  {/* Search & Filter Row */}
                  <Box
                    sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}
                  >
                    <TextField
                      placeholder={t.searchPlaceholder}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      size="small"
                      sx={{ flexGrow: 1, minWidth: 260 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>{t.filterCity}</InputLabel>
                      <Select
                        value={selectedCity}
                        label={t.filterCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                      >
                        <MenuItem value="ALL">{t.allCities}</MenuItem>
                        <MenuItem value="Hyderabad">Hyderabad</MenuItem>
                        <MenuItem value="Visakhapatnam">Visakhapatnam</MenuItem>
                        <MenuItem value="Vijayawada">Vijayawada</MenuItem>
                        <MenuItem value="Tirupati">Tirupati</MenuItem>
                        <MenuItem value="Bengaluru">Bengaluru</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>{t.filterStatus}</InputLabel>
                      <Select
                        value={selectedStatus}
                        label={t.filterStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <MenuItem value="ALL">{t.allStatuses}</MenuItem>
                        <MenuItem value="UPCOMING">{t.statusUpcoming}</MenuItem>
                        <MenuItem value="LIVE">{t.statusLive}</MenuItem>
                        <MenuItem value="COMPLETED">{t.statusCompleted}</MenuItem>
                        <MenuItem value="CANCELLED">{t.statusCancelled}</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <EventsTable
                    events={events}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteEvent}
                    onToggleAvailability={handleToggleAvailability}
                    translations={t}
                  />

                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, val) => setPage(val)}
                        color="primary"
                      />
                    </Box>
                  )}
                </>
              )}

              {/* ======================================================= */}
              {/* 2. FOLK NIGHT BOOKINGS SUB-TAB */}
              {/* ======================================================= */}
              {activeTab === 'bookings' && (
                <Box>
                  <BookingAnalyticsCards
                    stats={bookingStats}
                    onSyncInventory={handleSyncInventory}
                    isSyncing={syncingInventory}
                    translations={t}
                  />

                  {/* Search & Filter Row */}
                  <Box
                    sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}
                  >
                    <TextField
                      placeholder={
                        t.searchPlaceholder || 'Search booking code, customer, mobile...'
                      }
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      size="small"
                      sx={{ flexGrow: 1, minWidth: 260 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />
                          </InputAdornment>
                        ),
                      }}
                    />

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>{t.filterPaymentStatus || 'Payment Status'}</InputLabel>
                      <Select
                        value={selectedPaymentStatus}
                        label={t.filterPaymentStatus || 'Payment Status'}
                        onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                      >
                        <MenuItem value="ALL">{t.allPaymentStatuses || 'All Payments'}</MenuItem>
                        <MenuItem value="PAID">PAID</MenuItem>
                        <MenuItem value="PENDING">PENDING</MenuItem>
                        <MenuItem value="FAILED">FAILED</MenuItem>
                        <MenuItem value="REFUNDED">REFUNDED</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>{t.filterBookingStatus || 'Booking Status'}</InputLabel>
                      <Select
                        value={selectedBookingStatus}
                        label={t.filterBookingStatus || 'Booking Status'}
                        onChange={(e) => setSelectedBookingStatus(e.target.value)}
                      >
                        <MenuItem value="ALL">{t.allBookingStatuses || 'All Bookings'}</MenuItem>
                        <MenuItem value="CONFIRMED">CONFIRMED</MenuItem>
                        <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                        <MenuItem value="PENDING">PENDING</MenuItem>
                        <MenuItem value="CANCELLED">CANCELLED</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  <BookingsTable
                    bookings={bookings}
                    onOpenStatusModal={handleOpenStatusModal}
                    onOpenTicketQrModal={handleOpenTicketQrModal}
                    onCheckIn={handleCheckIn}
                    translations={t}
                  />

                  {bookingTotalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                      <Pagination
                        count={bookingTotalPages}
                        page={bookingPage}
                        onChange={(_, val) => setBookingPage(val)}
                        color="primary"
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* ======================================================= */}
              {/* 3. TICKETS SUB-TAB */}
              {/* ======================================================= */}
              {activeTab === 'tickets' && (
                <Box>
                  {/* Event Filter dropdown */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <FormControl size="small" sx={{ minWidth: 300 }}>
                      <InputLabel>{t.labelSelectEvent || 'Filter by Event'}</InputLabel>
                      <Select
                        value={selectedTicketEventId}
                        label={t.labelSelectEvent || 'Filter by Event'}
                        onChange={(e) => setSelectedTicketEventId(e.target.value)}
                      >
                        <MenuItem value="ALL">All Events</MenuItem>
                        {allEvents.map((evt) => (
                          <MenuItem key={evt.id} value={evt.id}>
                            {evt.name} ({evt.code})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>

                  <TicketsTable
                    tickets={tickets}
                    onEdit={handleOpenEditTicketModal}
                    onToggleStatus={handleToggleTicketStatus}
                    onDelete={handleDeleteTicket}
                    translations={t}
                  />
                </Box>
              )}

              {/* ======================================================= */}
              {/* 4. COUPONS SUB-TAB */}
              {/* ======================================================= */}
              {activeTab === 'coupons' && (
                <CouponsTable
                  coupons={coupons}
                  onEdit={handleOpenEditCouponModal}
                  onToggleStatus={handleToggleCouponStatus}
                  onDelete={handleDeleteCoupon}
                  translations={t}
                />
              )}

              {/* ======================================================= */}
              {/* 5. CONFIG SUB-TAB */}
              {/* ======================================================= */}
              {activeTab === 'config' && (
                <AppConfigPanel
                  config={appConfig}
                  onUpdateConfig={handleUpdateConfig}
                  translations={t}
                />
              )}
            </>
          )}

          {/* Modals & Side Windows */}
          <EventDrawer
            open={isDrawerOpen}
            onClose={handleCloseDrawer}
            onSave={handleSaveEvent}
            event={selectedEvent}
            translations={t}
          />

          <BookingStatusModal
            open={isBookingStatusModalOpen}
            booking={selectedBooking}
            onClose={handleCloseStatusModal}
            onSave={handleUpdateBookingStatus}
            translations={t}
          />

          <CreateBookingModal
            open={isCreateBookingModalOpen}
            onClose={handleCloseCreateBookingModal}
            onSave={handleCreateBooking}
            translations={t}
          />

          <TicketQrModal
            open={isTicketQrModalOpen}
            booking={selectedBooking}
            onClose={handleCloseTicketQrModal}
            onCheckIn={handleCheckIn}
            translations={t}
          />

          <QrCheckInModal
            open={isCheckInModalOpen}
            initialCode={selectedBooking?.bookingCode}
            onClose={handleCloseCheckInModal}
            onVerify={handleVerifyQr}
            onCheckIn={handleCheckIn}
            translations={t}
          />

          <TicketModal
            open={isTicketModalOpen}
            onClose={handleCloseTicketModal}
            onSave={handleSaveTicket}
            ticket={selectedTicket}
            events={allEvents}
            translations={t}
          />

          <CouponModal
            open={isCouponModalOpen}
            onClose={handleCloseCouponModal}
            onSave={handleSaveCoupon}
            initialData={selectedCoupon}
            events={allEvents}
            translations={t}
          />
        </Box>
      </Box>
    </Box>
  );
};
