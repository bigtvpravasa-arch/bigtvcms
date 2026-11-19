'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Divider,
} from '@mui/material';
import {
  BookingItem,
  PaymentStatus,
  BookingStatus,
  UpdateBookingStatusInput,
} from '../domain/event.types';
import { useAppTheme } from '@/shared/providers/ThemeProvider';

interface BookingStatusModalProps {
  open: boolean;
  booking: BookingItem | null;
  onClose: () => void;
  onSave: (input: UpdateBookingStatusInput) => Promise<void>;
  translations: Record<string, string>;
}

export const BookingStatusModal: React.FC<BookingStatusModalProps> = ({
  open,
  booking,
  onClose,
  onSave,
  translations: t,
}) => {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('CONFIRMED');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (booking) {
      setPaymentStatus(booking.paymentStatus || 'PAID');
      setBookingStatus(booking.bookingStatus || 'CONFIRMED');
    }
  }, [booking]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({ paymentStatus, bookingStatus });
    } finally {
      setLoading(false);
    }
  };

  const isRestoringSeats = paymentStatus === 'FAILED' || bookingStatus === 'CANCELLED';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDark ? '#141824' : '#FFFFFF',
          backgroundImage: 'none',
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, color: isDark ? '#FFFFFF' : '#0f172a' }}>
        {t.modalUpdateStatusTitle || 'Update Booking & Payment Status'}
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
      >
        {booking && (
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: 1.5,
              bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="body2"
                sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}
              >
                Booking Code:
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: '#ea580c', fontFamily: 'monospace' }}
              >
                {booking.bookingCode}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="body2"
                sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}
              >
                Customer:
              </Typography>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: isDark ? '#FFFFFF' : '#1e293b' }}
              >
                {booking.userName} ({booking.userPhone})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                variant="body2"
                sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}
              >
                Total Payable:
              </Typography>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}
              >
                ₹{booking.totalAmount?.toLocaleString('en-IN') ?? 0} ({booking.quantity} tickets)
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel id="payment-status-label">
              {t.lblPaymentStatus || 'Payment Status'}
            </InputLabel>
            <Select
              labelId="payment-status-label"
              value={paymentStatus}
              label={t.lblPaymentStatus || 'Payment Status'}
              onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            >
              <MenuItem value="PAID">PAID (Payment Gateway Success)</MenuItem>
              <MenuItem value="PENDING">PENDING (Awaiting Payment Callback)</MenuItem>
              <MenuItem value="FAILED">FAILED (Payment Failed / Gateway Dropped)</MenuItem>
              <MenuItem value="REFUNDED">REFUNDED (Reversed)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel id="booking-status-label">
              {t.lblBookingStatus || 'Booking Status'}
            </InputLabel>
            <Select
              labelId="booking-status-label"
              value={bookingStatus}
              label={t.lblBookingStatus || 'Booking Status'}
              onChange={(e) => setBookingStatus(e.target.value as BookingStatus)}
            >
              <MenuItem value="CONFIRMED">CONFIRMED (Valid for Gate Entry)</MenuItem>
              <MenuItem value="PENDING">PENDING (Seat Reserved Temporary)</MenuItem>
              <MenuItem value="COMPLETED">COMPLETED (Checked In at Venue)</MenuItem>
              <MenuItem value="CANCELLED">CANCELLED (Void / Released)</MenuItem>
            </Select>
          </FormControl>

          {isRestoringSeats && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              Marking payment as <strong>FAILED</strong> or booking as <strong>CANCELLED</strong>{' '}
              automatically releases reserved seats back to the Folk Night inventory.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{ p: 2, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
      >
        <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none' }}>
          {t.btnCancel || 'Cancel'}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            textTransform: 'none',
            bgcolor: '#ea580c',
            '&:hover': { bgcolor: '#c2410c' },
          }}
        >
          {loading ? 'Saving...' : t.btnUpdate || 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
