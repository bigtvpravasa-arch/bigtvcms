'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import {
  Festival,
  CalendarToday,
  LocationOn,
  QrCode2,
  CheckCircle,
} from '@mui/icons-material';
import { BookingItem } from '../domain/event.types';
import { useAppTheme } from '@/shared/providers/ThemeProvider';

interface TicketQrModalProps {
  open: boolean;
  booking: BookingItem | null;
  onClose: () => void;
  onCheckIn: (code: string) => void;
  translations: Record<string, string>;
}

export const TicketQrModal: React.FC<TicketQrModalProps> = ({
  open,
  booking,
  onClose,
  onCheckIn,
  translations: t,
}) => {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  if (!booking) return null;

  const qrSrc =
    booking.qrCodeBase64 ||
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      booking.verifyUrl || `https://api.pravasamedia.com/api/v1/bookings/verify-qr/${booking.bookingCode}`
    )}`;

  const isConfirmed = booking.bookingStatus === 'CONFIRMED' && booking.paymentStatus === 'PAID';
  const isCompleted = booking.bookingStatus === 'COMPLETED';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDark ? '#141824' : '#FFFFFF',
          backgroundImage: 'none',
          borderRadius: 3,
          overflow: 'hidden',
        },
      }}
    >
      {/* Event Header Banner */}
      <Box
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
          color: '#FFFFFF',
          textAlign: 'center',
        }}
      >
        <Festival sx={{ fontSize: 36, mb: 0.5 }} />
        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
          BIGTV FOLK NIGHT 2026
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }}>
          Official Gate Entry Pass • {booking.ticketType?.name || booking.ticketTypeName || 'Concert Ticket'}
        </Typography>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {/* QR Code Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2,
            mb: 2.5,
            bgcolor: '#FFFFFF',
            borderRadius: 2,
            border: '2px dashed rgba(234, 88, 12, 0.4)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrSrc}
            alt={`QR Code for ${booking.bookingCode}`}
            width={180}
            height={180}
            style={{ display: 'block', borderRadius: 8 }}
          />
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ color: '#0f172a', fontFamily: 'monospace', letterSpacing: 2, mt: 1 }}
          >
            {booking.bookingCode}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            Scan at Boulder Hills gate for entry
          </Typography>
        </Box>

        {/* Ticket Details */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarToday sx={{ fontSize: 18, color: '#ea580c' }} />
            <Typography variant="body2" sx={{ color: isDark ? '#FFFFFF' : '#1e293b', fontWeight: 600 }}>
              Saturday, Dec 12, 2026 • 06:00 PM IST
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn sx={{ fontSize: 18, color: '#ea580c' }} />
            <Typography variant="body2" sx={{ color: isDark ? '#FFFFFF' : '#1e293b' }}>
              Boulder Hills Golf Club, Gachibowli, Hyderabad
            </Typography>
          </Box>

          <Divider sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
              Attendee:
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}>
              {booking.userName}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
              Mobile Phone:
            </Typography>
            <Typography variant="body2" sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}>
              {booking.userPhone}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
              Quantity & Tier:
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}>
              {booking.quantity} × {booking.ticketType?.name || booking.ticketTypeName || 'Ticket'} (₹{booking.totalAmount})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
              Status:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={booking.paymentStatus}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: booking.paymentStatus === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: booking.paymentStatus === 'PAID' ? '#10b981' : '#ef4444',
                }}
              />
              <Chip
                label={booking.bookingStatus}
                size="small"
                sx={{
                  fontWeight: 600,
                  bgcolor: isCompleted
                    ? 'rgba(59, 130, 246, 0.15)'
                    : isConfirmed
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(245, 158, 11, 0.15)',
                  color: isCompleted ? '#3b82f6' : isConfirmed ? '#10b981' : '#f59e0b',
                }}
              />
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          {t.btnCancel || 'Close'}
        </Button>
        {isConfirmed && !isCompleted && (
          <Button
            variant="contained"
            onClick={() => {
              onCheckIn(booking.bookingCode);
              onClose();
            }}
            startIcon={<CheckCircle />}
            sx={{
              textTransform: 'none',
              bgcolor: '#10b981',
              '&:hover': { bgcolor: '#059669' },
            }}
          >
            {t.btnConfirmCheckIn || 'Check-in Gate Entry'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
