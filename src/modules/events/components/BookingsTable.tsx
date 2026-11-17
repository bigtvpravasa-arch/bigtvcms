'use client';

import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  EditOutlined,
  QrCode2,
  CheckCircleOutline,
  ContentCopy,
  ReceiptLong,
} from '@mui/icons-material';
import { BookingItem } from '../domain/event.types';
import { useAppTheme } from '@/shared/providers/ThemeProvider';

interface BookingsTableProps {
  bookings: BookingItem[];
  onOpenStatusModal: (booking: BookingItem) => void;
  onOpenTicketQrModal: (booking: BookingItem) => void;
  onCheckIn: (code: string) => void;
  translations: Record<string, string>;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  onOpenStatusModal,
  onOpenTicketQrModal,
  onCheckIn,
  translations: t,
}) => {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  const getPaymentStatusChip = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'PAID':
        return <Chip label={t.statusPaid || 'PAID'} size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }} />;
      case 'FAILED':
        return <Chip label={t.statusFailed || 'FAILED'} size="small" sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 600 }} />;
      case 'REFUNDED':
        return <Chip label={t.statusRefunded || 'REFUNDED'} size="small" sx={{ bgcolor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', fontWeight: 600 }} />;
      case 'PENDING':
      default:
        return <Chip label={t.statusPending || 'PENDING'} size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 600 }} />;
    }
  };

  const getBookingStatusChip = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return <Chip label={t.statusConfirmed || 'CONFIRMED'} size="small" sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }} />;
      case 'COMPLETED':
        return <Chip label={t.statusCompleted || 'COMPLETED'} size="small" sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 600 }} />;
      case 'CANCELLED':
        return <Chip label={t.statusCancelled || 'CANCELLED'} size="small" sx={{ bgcolor: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', fontWeight: 600 }} />;
      case 'PENDING':
      default:
        return <Chip label={t.statusPending || 'PENDING'} size="small" sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 600 }} />;
    }
  };

  const tableBg = isDark ? '#141824' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <TableContainer
      component={Paper}
      sx={{
        bgcolor: tableBg,
        borderRadius: 2,
        border: `1px solid ${borderColor}`,
        boxShadow: 'none',
        overflowX: 'auto',
      }}
    >
      <Table sx={{ minWidth: 800 }}>
        <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', py: 1.5 }}>
              {t.colBookingCode || 'Booking Code'}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', py: 1.5 }}>
              {t.colCustomer || 'Customer'}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', py: 1.5 }}>
              {t.colTier || 'Ticket Tier'}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', py: 1.5 }}>
              {t.colAmount || 'Amount (₹)'}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', py: 1.5 }}>
              {t.colPaymentStatus || 'Payment Status'}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', py: 1.5 }}>
              {t.colBookingStatus || 'Booking Status'}
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 600, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary', py: 1.5 }}>
              {t.colActions || 'Actions'}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <ReceiptLong sx={{ fontSize: 40, color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }} />
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}>
                    {t.noBookings || 'No bookings found.'}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            bookings.map((b) => (
              <TableRow
                key={b.id || b.bookingCode}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  borderColor,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
                  },
                }}
              >
                {/* Booking Code */}
                <TableCell sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#ea580c', fontFamily: 'monospace' }}>
                      {b.bookingCode}
                    </Typography>
                    <Tooltip title="Copy code">
                      <IconButton size="small" onClick={() => copyToClipboard(b.bookingCode)} sx={{ p: 0.3 }}>
                        <ContentCopy sx={{ fontSize: 14, color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary' }}>
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ''}
                  </Typography>
                </TableCell>

                {/* Customer */}
                <TableCell sx={{ py: 1.5 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}>
                    {b.userName || 'Guest User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary', display: 'block' }}>
                    {b.userPhone}
                  </Typography>
                  {b.userEmail && (
                    <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary', display: 'block' }}>
                      {b.userEmail}
                    </Typography>
                  )}
                </TableCell>

                {/* Tier & Qty */}
                <TableCell sx={{ py: 1.5 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ color: isDark ? '#FFFFFF' : '#1e293b' }}>
                    {b.ticketType?.name || b.ticketTypeName || 'Early Bird'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}>
                    {b.quantity} {b.quantity === 1 ? 'ticket' : 'tickets'}
                  </Typography>
                </TableCell>

                {/* Amount */}
                <TableCell sx={{ py: 1.5 }}>
                  <Typography variant="body2" fontWeight={700} sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}>
                    ₹{b.totalAmount?.toLocaleString('en-IN') ?? 0}
                  </Typography>
                  {b.discountAmount > 0 && (
                    <Typography variant="caption" sx={{ color: '#10b981', display: 'block', fontWeight: 600 }}>
                      -₹{b.discountAmount} promo
                    </Typography>
                  )}
                </TableCell>

                {/* Payment Status */}
                <TableCell sx={{ py: 1.5 }}>
                  {getPaymentStatusChip(b.paymentStatus)}
                </TableCell>

                {/* Booking Status */}
                <TableCell sx={{ py: 1.5 }}>
                  {getBookingStatusChip(b.bookingStatus)}
                </TableCell>

                {/* Actions */}
                <TableCell align="center" sx={{ py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <Tooltip title={t.btnUpdateStatus || 'Update Status'}>
                      <IconButton
                        size="small"
                        onClick={() => onOpenStatusModal(b)}
                        sx={{
                          color: '#3b82f6',
                          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
                          bgcolor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)',
                        }}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title={t.btnViewTicket || 'View Ticket & QR'}>
                      <IconButton
                        size="small"
                        onClick={() => onOpenTicketQrModal(b)}
                        sx={{
                          color: '#ea580c',
                          border: `1px solid ${isDark ? 'rgba(234, 88, 12, 0.3)' : 'rgba(234, 88, 12, 0.2)'}`,
                          bgcolor: isDark ? 'rgba(234, 88, 12, 0.08)' : 'rgba(234, 88, 12, 0.04)',
                        }}
                      >
                        <QrCode2 fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    {b.bookingStatus !== 'COMPLETED' && b.paymentStatus === 'PAID' && (
                      <Tooltip title={t.btnGateCheckIn || 'Gate Check-in'}>
                        <IconButton
                          size="small"
                          onClick={() => onCheckIn(b.bookingCode)}
                          sx={{
                            color: '#10b981',
                            border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}`,
                            bgcolor: isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)',
                          }}
                        >
                          <CheckCircleOutline fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
