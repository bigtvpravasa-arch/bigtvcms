'use client';

import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Sync,
  ConfirmationNumber,
  CheckCircle,
  ErrorOutline,
  MonetizationOn,
  TrendingUp,
  Festival,
} from '@mui/icons-material';
import { BookingAdminStats } from '../domain/event.types';
import { useAppTheme } from '@/shared/providers/ThemeProvider';

interface BookingAnalyticsCardsProps {
  stats: BookingAdminStats | null;
  onSyncInventory: () => void;
  isSyncing: boolean;
  translations: Record<string, string>;
}

export const BookingAnalyticsCards: React.FC<BookingAnalyticsCardsProps> = ({
  stats,
  onSyncInventory,
  isSyncing,
  translations: t,
}) => {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  const totalBookings = stats?.totalBookings ?? 0;
  const confirmed = stats?.confirmedCount ?? 0;
  const pending = stats?.pendingCount ?? 0;
  const failed = stats?.failedCount ?? 0;
  const totalRevenue = stats?.totalRevenue ?? 0;
  const failedRevenue = stats?.totalFailedPayments ?? 0;
  const occupancy = stats?.event?.occupancyPercentage || '0.1%';

  const cardBg = isDark ? '#141824' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  return (
    <Box sx={{ mb: 3 }}>
      {/* Top Banner / Event Bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          p: 2,
          mb: 2.5,
          borderRadius: 2,
          background: isDark
            ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(30, 41, 59, 0.7) 100%)'
            : 'linear-gradient(135deg, rgba(254, 215, 170, 0.4) 0%, rgba(241, 245, 249, 0.9) 100%)',
          border: `1px solid ${isDark ? 'rgba(234, 88, 12, 0.3)' : 'rgba(234, 88, 12, 0.2)'}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Festival sx={{ color: '#ea580c', fontSize: 28 }} />
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ color: isDark ? '#FFFFFF' : '#1e293b' }}
            >
              BIGTV Folk Night 2026 (Bigtv-2026)
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}
            >
              Boulder Hills Golf Club, Gachibowli, Hyderabad • 10,000 Capacity
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label={`${t.statOccupancy || 'Venue Occupancy'}: ${occupancy}`}
            size="small"
            sx={{
              fontWeight: 600,
              bgcolor: isDark ? 'rgba(234, 88, 12, 0.2)' : 'rgba(234, 88, 12, 0.1)',
              color: '#ea580c',
            }}
          />
          <Button
            variant="outlined"
            size="small"
            onClick={onSyncInventory}
            disabled={isSyncing}
            startIcon={isSyncing ? <CircularProgress size={16} /> : <Sync />}
            sx={{
              textTransform: 'none',
              borderColor: '#ea580c',
              color: '#ea580c',
              '&:hover': {
                borderColor: '#c2410c',
                bgcolor: 'rgba(234, 88, 12, 0.08)',
              },
            }}
          >
            {isSyncing ? 'Syncing...' : t.btnSyncInventory || 'Sync Inventory'}
          </Button>
        </Box>
      </Box>

      {/* KPI Stats Cards */}
      <Grid container spacing={2}>
        {/* Total Bookings */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {t.statBookingsTotal || 'Total Bookings'}
                </Typography>
                <ConfirmationNumber sx={{ color: '#3b82f6', fontSize: 22 }} />
              </Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}
              >
                {totalBookings}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}
              >
                {stats?.totalTicketsBooked ?? 0} tickets booked total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Confirmed / Completed */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {t.statBookingsConfirmed || 'Confirmed Bookings'}
                </Typography>
                <CheckCircle sx={{ color: '#10b981', fontSize: 22 }} />
              </Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#10b981' }}>
                {confirmed}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}
              >
                {pending} pending payment verification
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {t.statTotalRevenue || 'Total Revenue'}
                </Typography>
                <MonetizationOn sx={{ color: '#f59e0b', fontSize: 22 }} />
              </Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}
              >
                ₹{totalRevenue.toLocaleString('en-IN')}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}
              >
                ₹{stats?.payments?.totalDiscount ?? 0} discounts applied
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Failed / Recovery */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2 }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                    fontWeight: 500,
                  }}
                >
                  {t.statBookingsFailed || 'Failed / Cancelled'}
                </Typography>
                <ErrorOutline sx={{ color: '#ef4444', fontSize: 22 }} />
              </Box>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{ color: failed > 0 ? '#ef4444' : isDark ? '#FFFFFF' : '#0f172a' }}
              >
                {failed}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}
              >
                ₹{failedRevenue.toLocaleString('en-IN')} recoverable
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ticket Tier Inventory Breakdown */}
      {stats?.byTicketType && stats.byTicketType.length > 0 && (
        <Box
          sx={{ mt: 2, p: 2, bgcolor: cardBg, border: `1px solid ${borderColor}`, borderRadius: 2 }}
        >
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{
              textTransform: 'uppercase',
              color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary',
              mb: 1.5,
              display: 'block',
            }}
          >
            Ticket Tier Capacity & Real-Time Availability
          </Typography>
          <Grid container spacing={2}>
            {stats.byTicketType.map((tier) => {
              const booked = tier.bookedTickets ?? 0;
              const total = tier.totalQuantity || 1;
              const percent = Math.min(100, Math.round((booked / total) * 100));
              return (
                <Grid item xs={12} sm={4} key={tier.ticketTypeId}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ color: isDark ? '#FFFFFF' : '#1e293b' }}
                      >
                        {tier.name}
                      </Typography>
                      <Typography variant="caption" fontWeight={700} sx={{ color: '#ea580c' }}>
                        ₹{tier.price}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}
                      >
                        {booked} booked / {tier.availableQuantity} left
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        sx={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'text.primary' }}
                      >
                        {percent}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: percent > 80 ? '#ef4444' : percent > 40 ? '#f59e0b' : '#3b82f6',
                        },
                      }}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
    </Box>
  );
};
