import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EventsPage } from '../pages/EventsPage';
import { EventsTable } from '../components/EventsTable';
import { TicketsTable } from '../components/TicketsTable';
import { CouponsTable } from '../components/CouponsTable';
import { AppConfigPanel } from '../components/AppConfigPanel';
import { EventDrawer } from '../components/EventDrawer';
import { TicketModal } from '../components/TicketModal';
import { CouponModal } from '../components/CouponModal';
import { BookingAnalyticsCards } from '../components/BookingAnalyticsCards';
import { BookingsTable } from '../components/BookingsTable';
import { BookingStatusModal } from '../components/BookingStatusModal';
import { CreateBookingModal } from '../components/CreateBookingModal';
import { TicketQrModal } from '../components/TicketQrModal';
import { QrCheckInModal } from '../components/QrCheckInModal';
import { eventsRepository, FOLK_NIGHT_EVENT_ID, FOLK_NIGHT_EVENT_CODE } from '../repositories/events.repository';
import {
  EventItem,
  TicketTypeItem,
  CouponItem,
  AppConfigItem,
  BookingItem,
  BookingAdminStats,
} from '../domain/event.types';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/events',
}));

jest.mock('@/core/api/api-client', () => {
  const clientMock = {
    get: jest.fn().mockImplementation((url: string) => {
      if (url === '/app-config') {
        if (url.startsWith('/bookings/') && !url.includes('/admin/stats')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
          data: {
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
          },
        });
      }
      if (url === '/events/stats') {
        if (url.startsWith('/bookings/') && !url.includes('/admin/stats')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
          data: {
            totalEvents: 4,
            upcomingEvents: 2,
            liveEvents: 1,
            completedEvents: 1,
            totalSeats: 18800,
            availableSeats: 4730,
          },
        });
      }
      if (url.includes('/bookings/admin/stats')) {
        if (url.startsWith('/bookings/') && !url.includes('/admin/stats')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
          data: {
            success: true,
            data: {
              totalBookings: 12,
              confirmedCount: 10,
              cancelledCount: 0,
              failedCount: 2,
              pendingCount: 0,
              totalRevenue: 15400,
              totalTicketsBooked: 14,
              totalTicketsFailed: 2,
              totalTicketsPending: 0,
              totalFailedPayments: 2000,
              summary: {
                totalBookings: 12,
                confirmedBookings: 10,
                failedBookings: 2,
                pendingBookings: 0,
                cancelledBookings: 0,
                refundedBookings: 0,
              },
              tickets: {
                booked: 14,
                failed: 2,
                paymentFailed: 2,
                cancelled: 0,
                pending: 0,
                refunded: 0,
                total: 16,
              },
              payments: {
                totalRevenue: 15400,
                failedAmount: 2000,
                pendingAmount: 0,
                cancelledAmount: 0,
                refundedAmount: 0,
                totalDiscount: 1200,
                currency: 'INR',
                breakdown: {},
              },
              event: {
                id: 'e4d962de-5393-4541-a792-4c23f1429f9c',
                name: 'BIGTV Folk Night 2026',
                code: 'Bigtv-2026',
                totalSeats: 10000,
                availableSeats: 9986,
                bookedSeats: 14,
                occupancyPercentage: '0.1%',
              },
              byTicketType: [
                {
                  ticketTypeId: 'db5b7a7b-61d8-4460-bd63-f23acfe8ed53',
                  name: 'Regular',
                  price: 500,
                  totalQuantity: 5000,
                  availableQuantity: 4992,
                  bookedTickets: 8,
                  failedTickets: 0,
                  pendingTickets: 0,
                  cancelledTickets: 0,
                  revenue: 4000,
                },
              ],
            },
          },
        });
      }
      if (url.startsWith('/bookings/') && !url.includes('/admin/stats')) {
        return Promise.reject(new Error('Network error'));
      }
      return Promise.resolve({
        data: [
          {
            id: 'e4d962de-5393-4541-a792-4c23f1429f9c',
            name: 'BIGTV Folk Night 2026',
            code: 'Bigtv-2026',
            description: 'The Big Folk Night concert',
            type: 'Concert',
            images: ['https://i.ibb.co/bRbkYdyY/folknight4.png'],
            date: '2026-12-12T18:00:00.000Z',
            endDate: '2026-12-12T23:00:00.000Z',
            time: '06:00 PM',
            location: 'Boulder Hills Golf Club, Gachibowli, Hyderabad',
            city: 'Hyderabad',
            availability: true,
            totalSeats: 10000,
            availableSeats: 9986,
            language: 'Telugu',
            ageLimit: 'All Ages',
            duration: '4h 00m',
            organizer: 'BIG TV Media & Entertainment',
            terms: 'Standard terms apply.',
            status: 'UPCOMING',
          },
        ],
      });
    }),
    post: jest.fn().mockRejectedValue(new Error('Network error')),
    put: jest.fn().mockRejectedValue(new Error('Network error')),
    patch: jest.fn().mockRejectedValue(new Error('Network error')),
    delete: jest.fn().mockRejectedValue(new Error('Network error')),
  };

  return {
    apiClient: clientMock,
    eventsApiClient: clientMock,
  };
});

describe('Events Feature Module & Folk Night Show Booking', () => {
  describe('EventsRepository', () => {
    it('fetches events list, stats, ticket types, coupons, and config successfully', async () => {
      const events = await eventsRepository.getEvents();
      expect(Array.isArray(events)).toBe(true);

      const stats = await eventsRepository.getStats();
      expect(stats.totalEvents).toBeGreaterThan(0);

      const tickets = await eventsRepository.getTicketTypes();
      expect(tickets.length).toBeGreaterThan(0);

      const coupons = await eventsRepository.getCoupons();
      expect(coupons.length).toBeGreaterThan(0);

      const config = await eventsRepository.getAppConfig();
      expect(config.key).toBe('default');
    });

    it('creates, updates, toggles, and deletes ticket types, coupons, and app config', async () => {
      const newTicket = await eventsRepository.createTicketType({
        eventId: FOLK_NIGHT_EVENT_ID,
        name: 'VIP Pass',
        price: 2500,
        totalQuantity: 200,
        availableQuantity: 200,
        description: 'VIP seats',
        isActive: true,
      });
      expect(newTicket.name).toBe('VIP Pass');

      const updatedTicket = await eventsRepository.updateTicketType(newTicket.id, { price: 2800 });
      expect(updatedTicket.price).toBe(2800);

      const toggledTicket = await eventsRepository.toggleTicketStatus(newTicket.id, true);
      expect(toggledTicket.isActive).toBe(false);

      const deletedTicket = await eventsRepository.deleteTicketType(newTicket.id);
      expect(deletedTicket).toBe(true);

      const newCoupon = await eventsRepository.createCoupon({
        code: 'TEST50',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        totalUsageLimit: 100,
        validUntil: '2026-12-31',
        isActive: true,
      });
      expect(newCoupon.code).toBe('TEST50');

      const updatedCoupon = await eventsRepository.updateCoupon(newCoupon.id, { discountValue: 60 });
      expect(updatedCoupon.discountValue).toBe(60);

      const toggledCoupon = await eventsRepository.toggleCouponStatus(newCoupon.id, true);
      expect(toggledCoupon.isActive).toBe(false);

      const deletedCoupon = await eventsRepository.deleteCoupon(newCoupon.id);
      expect(deletedCoupon).toBe(true);

      const updatedConfig = await eventsRepository.updateAppConfig({ maintenanceMode: true });
      expect(updatedConfig.maintenanceMode).toBe(true);
    });

    it('handles bookings API methods (get, create, status update, qr verify, check-in, stats, sync)', async () => {
      const bookingsResult = await eventsRepository.getBookings();
      expect(Array.isArray(bookingsResult.data)).toBe(true);
      expect(bookingsResult.data.length).toBeGreaterThan(0);

      const createdBooking = await eventsRepository.createBooking({
        eventId: FOLK_NIGHT_EVENT_ID,
        ticketTypeId: '690b2622-f9b4-457a-843e-a9cf2c7a15fb',
        quantity: 2,
        userName: 'Ramesh Kumar',
        userPhone: '9876543210',
        userEmail: 'ramesh@example.com',
        couponCode: 'BIGTVFN30',
      });
      expect(createdBooking.bookingCode).toContain('BTV-FN26-');
      expect(createdBooking.userName).toBe('Ramesh Kumar');
      expect(createdBooking.discountAmount).toBeGreaterThan(0);

      const fetchedBooking = await eventsRepository.getBookingByIdOrCode(createdBooking.bookingCode);
      expect(fetchedBooking).not.toBeNull();
      expect(fetchedBooking?.id).toBe(createdBooking.id);

      const updatedBooking = await eventsRepository.updateBookingStatus(createdBooking.id, {
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
      });
      expect(updatedBooking.paymentStatus).toBe('PAID');
      expect(updatedBooking.bookingStatus).toBe('CONFIRMED');

      const verifyResult = await eventsRepository.verifyQrCode(createdBooking.bookingCode);
      expect(verifyResult.isValid).toBe(true);

      const checkInResult = await eventsRepository.checkInTicket(createdBooking.bookingCode);
      expect(checkInResult.data.bookingStatus).toBe('COMPLETED');

      const verifyAfterCheckIn = await eventsRepository.verifyQrCode(createdBooking.bookingCode);
      expect(verifyAfterCheckIn.isValid).toBe(false);
      expect(verifyAfterCheckIn.reason).toContain('ALREADY');

      const adminStats = await eventsRepository.getBookingAdminStats();
      expect(adminStats.totalBookings).toBeGreaterThan(0);

      const syncResult = await eventsRepository.syncInventory();
      expect(syncResult.success).toBe(true);
    });
  });

  describe('Sub-Module Components', () => {
    it('renders BookingAnalyticsCards with KPI values and triggers sync inventory', () => {
      const onSync = jest.fn();
      const mockStats: BookingAdminStats = {
        totalBookings: 12,
        confirmedCount: 10,
        cancelledCount: 0,
        failedCount: 2,
        pendingCount: 0,
        totalRevenue: 15400,
        totalTicketsBooked: 14,
        totalTicketsFailed: 2,
        totalTicketsPending: 0,
        totalFailedPayments: 2000,
        summary: {
          totalBookings: 12,
          confirmedBookings: 10,
          failedBookings: 2,
          pendingBookings: 0,
          cancelledBookings: 0,
          refundedBookings: 0,
        },
        tickets: {
          booked: 14,
          failed: 2,
          paymentFailed: 2,
          cancelled: 0,
          pending: 0,
          refunded: 0,
          total: 16,
        },
        payments: {
          totalRevenue: 15400,
          failedAmount: 2000,
          pendingAmount: 0,
          cancelledAmount: 0,
          refundedAmount: 0,
          totalDiscount: 1200,
          currency: 'INR',
          breakdown: {},
        },
        event: {
          id: FOLK_NIGHT_EVENT_ID,
          name: 'BIGTV Folk Night 2026',
          code: FOLK_NIGHT_EVENT_CODE,
          totalSeats: 10000,
          availableSeats: 9986,
          bookedSeats: 14,
          occupancyPercentage: '0.1%',
        },
        byTicketType: [
          {
            ticketTypeId: 't1',
            name: 'Regular',
            price: 500,
            totalQuantity: 5000,
            availableQuantity: 4992,
            bookedTickets: 8,
            failedTickets: 0,
            pendingTickets: 0,
            cancelledTickets: 0,
            revenue: 4000,
          },
        ],
      };

      render(
        <BookingAnalyticsCards
          stats={mockStats}
          onSyncInventory={onSync}
          isSyncing={false}
          translations={{
            statBookingsTotal: 'Total Bookings',
            statBookingsConfirmed: 'Confirmed Bookings',
            statTotalRevenue: 'Total Revenue',
            btnSyncInventory: 'Sync Inventory',
          }}
        />
      );

      expect(screen.getByText(/BIGTV Folk Night 2026/i)).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('₹15,400')).toBeInTheDocument();

      const syncBtn = screen.getByRole('button', { name: /Sync Inventory/i });
      fireEvent.click(syncBtn);
      expect(onSync).toHaveBeenCalled();
    });

    it('renders BookingsTable and triggers status update, qr view, and check-in callbacks', () => {
      const onOpenStatus = jest.fn();
      const onOpenQr = jest.fn();
      const onCheckIn = jest.fn();

      const mockBookings: BookingItem[] = [
        {
          id: 'b1',
          bookingCode: 'BTV-FN26-K92A',
          userName: 'Ramesh Kumar',
          userPhone: '9876543210',
          quantity: 2,
          unitPrice: 1000,
          subTotal: 2000,
          discountAmount: 600,
          totalAmount: 1400,
          paymentStatus: 'PAID',
          bookingStatus: 'CONFIRMED',
          eventId: FOLK_NIGHT_EVENT_ID,
          ticketTypeId: 't1',
          ticketTypeName: 'Early Bird',
          createdAt: new Date().toISOString(),
        },
      ];

      render(
        <BookingsTable
          bookings={mockBookings}
          onOpenStatusModal={onOpenStatus}
          onOpenTicketQrModal={onOpenQr}
          onCheckIn={onCheckIn}
          translations={{
            colBookingCode: 'Booking Code',
            colCustomer: 'Customer',
            statusPaid: 'PAID',
            statusConfirmed: 'CONFIRMED',
          }}
        />
      );

      expect(screen.getByText('BTV-FN26-K92A')).toBeInTheDocument();
      expect(screen.getByText('Ramesh Kumar')).toBeInTheDocument();
      expect(screen.getByText('₹1,400')).toBeInTheDocument();

      const actionButtons = screen.getAllByRole('button');
      // Click edit status button
      fireEvent.click(actionButtons[1]);
      expect(onOpenStatus).toHaveBeenCalledWith(mockBookings[0]);

      // Click QR code view button
      fireEvent.click(actionButtons[2]);
      expect(onOpenQr).toHaveBeenCalledWith(mockBookings[0]);

      // Click check-in button
      fireEvent.click(actionButtons[3]);
      expect(onCheckIn).toHaveBeenCalledWith('BTV-FN26-K92A');
    });

    it('renders BookingStatusModal and updates booking status', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const mockBooking: BookingItem = {
        id: 'b1',
        bookingCode: 'BTV-FN26-K92A',
        userName: 'Ramesh Kumar',
        userPhone: '9876543210',
        quantity: 2,
        unitPrice: 1000,
        subTotal: 2000,
        discountAmount: 600,
        totalAmount: 1400,
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
        eventId: FOLK_NIGHT_EVENT_ID,
        ticketTypeId: 't1',
        createdAt: new Date().toISOString(),
      };

      render(
        <BookingStatusModal
          open={true}
          booking={mockBooking}
          onClose={jest.fn()}
          onSave={onSave}
          translations={{
            modalUpdateStatusTitle: 'Update Booking & Payment Status',
            btnUpdate: 'Update',
          }}
        />
      );

      expect(screen.getByText('Update Booking & Payment Status')).toBeInTheDocument();
      expect(screen.getByText('BTV-FN26-K92A')).toBeInTheDocument();

      const updateBtn = screen.getByRole('button', { name: /Update/i });
      fireEvent.click(updateBtn);
      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
      });
    });

    it('renders CreateBookingModal and creates ticket booking with coupon', async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);

      render(
        <CreateBookingModal
          open={true}
          onClose={jest.fn()}
          onSave={onSave}
          translations={{
            modalCreateBookingTitle: 'Create Ticket Booking',
            btnSave: 'Create Booking',
          }}
        />
      );

      expect(screen.getByText('Create Ticket Booking')).toBeInTheDocument();

      const nameInput = screen.getByPlaceholderText('e.g. Ramesh Kumar');
      const phoneInput = screen.getByPlaceholderText('e.g. 9876543210');

      fireEvent.change(nameInput, { target: { value: 'Suresh Babu' } });
      fireEvent.change(phoneInput, { target: { value: '9848011223' } });

      const submitBtn = screen.getByRole('button', { name: /Create Booking/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            userName: 'Suresh Babu',
            userPhone: '9848011223',
            couponCode: 'BIGTVFN30',
          })
        );
      });
    });

    it('renders TicketQrModal with booking details and QR pass', () => {
      const onCheckIn = jest.fn();
      const mockBooking: BookingItem = {
        id: 'b1',
        bookingCode: 'BTV-FN26-K92A',
        userName: 'Ramesh Kumar',
        userPhone: '9876543210',
        quantity: 2,
        unitPrice: 1000,
        subTotal: 2000,
        discountAmount: 600,
        totalAmount: 1400,
        paymentStatus: 'PAID',
        bookingStatus: 'CONFIRMED',
        eventId: FOLK_NIGHT_EVENT_ID,
        ticketTypeId: 't1',
        ticketTypeName: 'Early Bird',
        verifyUrl: 'https://api.pravasamedia.com/api/v1/bookings/verify-qr/BTV-FN26-K92A',
        createdAt: new Date().toISOString(),
      };

      render(
        <TicketQrModal
          open={true}
          booking={mockBooking}
          onClose={jest.fn()}
          onCheckIn={onCheckIn}
          translations={{
            btnConfirmCheckIn: 'Check-in Gate Entry',
          }}
        />
      );

      expect(screen.getByText('BIGTV FOLK NIGHT 2026')).toBeInTheDocument();
      expect(screen.getByText('BTV-FN26-K92A')).toBeInTheDocument();
      expect(screen.getByText(/Ramesh Kumar/i)).toBeInTheDocument();

      const checkInBtn = screen.getByRole('button', { name: /Check-in Gate Entry/i });
      fireEvent.click(checkInBtn);
      expect(onCheckIn).toHaveBeenCalledWith('BTV-FN26-K92A');
    });

    it('renders QrCheckInModal and handles verification and check-in', async () => {
      const onVerify = jest.fn().mockResolvedValue({
        isValid: true,
        reason: 'Valid Ticket QR Code. Gate Entry Allowed.',
        booking: {
          id: 'b1',
          bookingCode: 'BTV-FN26-K92A',
          userName: 'Ramesh Kumar',
          quantity: 2,
          ticketTypeName: 'Early Bird',
          paymentStatus: 'PAID',
          bookingStatus: 'CONFIRMED',
        },
      });
      const onCheckIn = jest.fn().mockResolvedValue({
        message: 'Ticket scanned successfully. Customer checked in for event.',
      });

      render(
        <QrCheckInModal
          open={true}
          initialCode="BTV-FN26-K92A"
          onClose={jest.fn()}
          onVerify={onVerify}
          onCheckIn={onCheckIn}
          translations={{
            modalGateCheckInTitle: 'Gate Check-in & QR Verification',
            btnScanVerify: 'Verify Ticket',
            btnConfirmCheckIn: 'Confirm Gate Check-in',
          }}
        />
      );

      expect(screen.getByText('Gate Check-in & QR Verification')).toBeInTheDocument();

      await waitFor(() => {
        expect(onVerify).toHaveBeenCalledWith('BTV-FN26-K92A');
      });

      expect(await screen.findByText('GATE ENTRY ALLOWED')).toBeInTheDocument();

      const confirmBtn = await screen.findByRole('button', { name: /Confirm Gate Check-in/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(onCheckIn).toHaveBeenCalledWith('BTV-FN26-K92A');
      });
    });

    it('renders EventsTable and triggers edit, delete, availability actions', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const onToggleAvailability = jest.fn();

      const mockEvents: EventItem[] = [
        {
          id: 'evt-1',
          name: 'Sunburn Fest 2026',
          code: 'sunburn-2026',
          description: 'EDM festival',
          type: 'Concert',
          images: [],
          date: '2026-11-20',
          endDate: '2026-11-21',
          time: '18:00',
          location: 'Goa',
          city: 'Goa',
          availability: true,
          totalSeats: 1000,
          availableSeats: 500,
          language: 'English',
          ageLimit: '18+',
          duration: '6h',
          organizer: 'Sunburn',
          terms: 'Terms',
          status: 'UPCOMING',
        },
      ];

      render(
        <EventsTable
          events={mockEvents}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleAvailability={onToggleAvailability}
          translations={{ btnEdit: 'Edit', btnDelete: 'Delete' }}
        />
      );

      expect(screen.getByText('Sunburn Fest 2026')).toBeInTheDocument();
      expect(screen.getByText('sunburn-2026')).toBeInTheDocument();
    });

    it('renders TicketsTable details and triggers edit button', () => {
      const onEdit = jest.fn();
      const mockTickets: TicketTypeItem[] = [
        {
          id: 'tkt-1',
          eventId: 'evt-1',
          name: 'Platinum Pass',
          price: 5000,
          totalQuantity: 100,
          availableQuantity: 40,
          description: 'VIP access',
          isActive: true,
        },
      ];

      render(
        <TicketsTable
          tickets={mockTickets}
          onEdit={onEdit}
          onToggleStatus={jest.fn()}
          onDelete={jest.fn()}
          translations={{ colTicketTier: 'Tier Name' }}
        />
      );

      expect(screen.getAllByText('Platinum Pass')[0]).toBeInTheDocument();
      expect(screen.getByText('₹5000')).toBeInTheDocument();
    });

    it('renders CouponsTable details and triggers edit button', () => {
      const onEdit = jest.fn();
      const mockCoupons: CouponItem[] = [
        {
          id: 'cpn-1',
          code: 'FESTIVE50',
          discountType: 'PERCENTAGE',
          discountValue: 50,
          totalUsageLimit: 100,
          usageCount: 10,
          validUntil: '2026-12-31',
          isActive: true,
        },
      ];

      render(
        <CouponsTable
          coupons={mockCoupons}
          onEdit={onEdit}
          onToggleStatus={jest.fn()}
          onDelete={jest.fn()}
          translations={{ colCouponCode: 'Coupon Code' }}
        />
      );

      expect(screen.getAllByText('FESTIVE50')[0]).toBeInTheDocument();
      expect(screen.getByText('50% OFF')).toBeInTheDocument();
    });
  });

  describe('EventsPage Component & Tab Switching', () => {
    it('renders top tabs (Events, Folk Night Bookings, Ticket Types, Discount Coupons, App Config) and switches tabs', async () => {
      render(<EventsPage />);

      expect(screen.getByText(/Events & Booking CMS/i)).toBeInTheDocument();

      // Check tab buttons
      const bookingsTab = screen.getByRole('tab', { name: /Folk Night Bookings|Bookings/i });
      const ticketTab = screen.getByRole('tab', { name: /Ticket Types|Tickets/i });
      const couponTab = screen.getByRole('tab', { name: /Discount Coupons|Coupons/i });
      const configTab = screen.getByRole('tab', { name: /App Config|Config/i });

      expect(bookingsTab).toBeInTheDocument();
      expect(ticketTab).toBeInTheDocument();
      expect(couponTab).toBeInTheDocument();
      expect(configTab).toBeInTheDocument();

      // Switch to Folk Night Bookings tab
      fireEvent.click(bookingsTab);
      await waitFor(() => {
        expect(screen.getByText(/BIGTV Folk Night 2026/i)).toBeInTheDocument();
      });

      // Switch to Ticket Types tab
      fireEvent.click(ticketTab);
      await waitFor(() => {
        expect(screen.getByTestId('tickets-table')).toBeInTheDocument();
      });

      // Switch to Coupons tab
      fireEvent.click(couponTab);
      await waitFor(() => {
        expect(screen.getByTestId('coupons-table')).toBeInTheDocument();
      });

      // Switch to Config tab
      fireEvent.click(configTab);
      await waitFor(() => {
        expect(screen.getByTestId('app-config-panel')).toBeInTheDocument();
      });
    });
  });
});
