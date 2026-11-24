export type EventStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export interface EventItem {
  id: string;
  name: string;
  code: string;
  description: string;
  type: string;
  images: string[];
  date: string;
  endDate: string;
  time: string;
  location: string;
  city: string;
  availability: boolean;
  totalSeats: number;
  availableSeats: number;
  language: string;
  ageLimit: string;
  duration: string;
  organizer: string;
  terms: string;
  status: EventStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  liveEvents: number;
  completedEvents: number;
  totalSeats: number;
  availableSeats: number;
}

export interface CreateEventInput {
  name: string;
  code: string;
  description: string;
  type: string;
  images: string[];
  date: string;
  endDate: string;
  time: string;
  location: string;
  city: string;
  availability: boolean;
  totalSeats: number;
  availableSeats: number;
  language: string;
  ageLimit: string;
  duration: string;
  organizer: string;
  terms: string;
  status: EventStatus;
}

export interface UpdateEventInput extends Partial<CreateEventInput> {}

// --- Ticket Types ---
export interface TicketTypeItem {
  id: string;
  eventId: string;
  eventName?: string;
  name: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  description: string;
  isActive: boolean;
}

export interface CreateTicketTypeInput {
  eventId: string;
  name: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
  description: string;
  isActive: boolean;
}

export interface UpdateTicketTypeInput extends Partial<CreateTicketTypeInput> {}

// --- Discount Coupons ---
export type DiscountType = 'PERCENTAGE' | 'FLAT';

export interface CouponItem {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  totalUsageLimit: number;
  usageCount: number;
  validFrom?: string;
  validUntil: string;
  eventId?: string;
  eventCode?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponInput {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  totalUsageLimit: number;
  validFrom?: string;
  validUntil: string;
  eventId?: string;
  eventCode?: string;
  isActive: boolean;
}

export interface UpdateCouponInput extends Partial<CreateCouponInput> {}

// --- App Config & Feature Flags ---
export interface AppConfigItem {
  id: string;
  key: string;
  webEnable: boolean;
  eventsEnable: boolean;
  folkNight: boolean;
  cricket: boolean;
  bannersEnable: boolean;
  razorpayKeyId: string;
  razorpayKeySecret?: string;
  isTestMode: boolean;
  maintenanceMode: boolean;
}

// --- Bookings & Show Tickets ---
export type BookingStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';

export interface BookingItem {
  id: string;
  bookingCode: string;
  userId?: string | null;
  userName: string;
  userEmail?: string | null;
  userPhone: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
  discountAmount: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  eventId: string;
  eventName?: string;
  ticketTypeId: string;
  ticketTypeName?: string;
  event?: {
    id: string;
    name: string;
    code?: string;
    date: string;
    location: string;
  };
  ticketType?: {
    id: string;
    name: string;
    price: number;
  };
  verifyUrl?: string;
  qrCodeBase64?: string;
  testScenario?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBookingInput {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  userName: string;
  userPhone: string;
  userEmail?: string;
  couponCode?: string;
  userId?: string;
}

export interface UpdateBookingStatusInput {
  paymentStatus?: PaymentStatus;
  bookingStatus?: BookingStatus;
}

export interface VerifyQrResult {
  isValid: boolean;
  reason: string;
  booking?: BookingItem;
}

export interface BookingAdminStats {
  totalBookings: number;
  confirmedCount: number;
  cancelledCount: number;
  failedCount: number;
  pendingCount: number;
  totalRevenue: number;
  totalTicketsBooked: number;
  totalTicketsFailed: number;
  totalTicketsPending: number;
  totalFailedPayments: number;
  summary: {
    totalBookings: number;
    confirmedBookings: number;
    failedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    refundedBookings: number;
  };
  tickets: {
    booked: number;
    failed: number;
    paymentFailed: number;
    cancelled: number;
    pending: number;
    refunded: number;
    total: number;
  };
  payments: {
    totalRevenue: number;
    failedAmount: number;
    pendingAmount: number;
    cancelledAmount: number;
    refundedAmount: number;
    totalDiscount: number;
    currency: string;
    breakdown: Record<string, { bookings: number; tickets: number; amount: number }>;
  };
  event?: {
    id: string;
    name: string;
    code: string;
    totalSeats: number;
    availableSeats: number;
    bookedSeats: number;
    occupancyPercentage: string;
  };
  byTicketType?: Array<{
    ticketTypeId: string;
    name: string;
    price: number;
    totalQuantity: number;
    availableQuantity: number;
    bookedTickets: number;
    failedTickets: number;
    pendingTickets: number;
    cancelledTickets: number;
    revenue: number;
  }>;
  byEvent?: Array<{
    eventId: string;
    eventName: string;
    eventCode: string;
    totalSeats: number;
    availableSeats: number;
    bookedTickets: number;
    failedTickets: number;
    pendingTickets: number;
    revenue: number;
  }>;
}
