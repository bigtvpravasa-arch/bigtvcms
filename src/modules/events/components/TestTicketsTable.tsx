'use client';

import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Science,
  RestartAlt,
  QrCodeScanner,
  QrCode2,
  CheckCircle,
  DoNotDisturbOn,
  WarningAmber,
  CancelOutlined,
  ContentCopy,
  Search,
  ConfirmationNumber,
  MeetingRoom,
} from '@mui/icons-material';
import { BookingItem } from '../domain/event.types';
import { useAppTheme } from '@/shared/providers/ThemeProvider';

export interface TestTicketsTableProps {
  testTickets: BookingItem[];
  onOpenTicketQrModal: (booking: BookingItem) => void;
  onCheckIn: (code: string) => Promise<any> | void;
  onResetTestTickets: () => Promise<void> | void;
  isResetting: boolean;
  onOpenGateScanner?: () => void;
  translations: Record<string, string>;
}

export const TestTicketsTable: React.FC<TestTicketsTableProps> = ({
  testTickets,
  onOpenTicketQrModal,
  onCheckIn,
  onResetTestTickets,
  isResetting,
  onOpenGateScanner,
  translations: t,
}) => {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  const [search, setSearch] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 10;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [checkingInCode, setCheckingInCode] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setToastSeverity('info');
      setToastMessage(`${text} copied to clipboard`);
    }
  };

  // Filter test tickets
  const filteredTickets = useMemo(() => {
    return testTickets.filter((ticket) => {
      if (search) {
        const q = search.toLowerCase();
        const matchesCode = ticket.bookingCode.toLowerCase().includes(q);
        const matchesTier =
          (ticket.ticketTypeName && ticket.ticketTypeName.toLowerCase().includes(q)) ||
          (ticket.ticketType?.name && ticket.ticketType.name.toLowerCase().includes(q));
        const matchesScenario = ticket.testScenario && ticket.testScenario.toLowerCase().includes(q);
        if (!matchesCode && !matchesTier && !matchesScenario) return false;
      }

      if (selectedTier !== 'ALL') {
        const tierName = ticket.ticketTypeName || ticket.ticketType?.name || '';
        if (selectedTier === 'Regular' && !tierName.toLowerCase().includes('regular')) return false;
        if (selectedTier === 'Early Bird' && !tierName.toLowerCase().includes('early')) return false;
        if (selectedTier === 'Fanpit' && !tierName.toLowerCase().includes('fanpit')) return false;
      }

      if (selectedStatus !== 'ALL') {
        if (ticket.bookingStatus !== selectedStatus) return false;
      }

      return true;
    });
  }, [testTickets, search, selectedTier, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / itemsPerPage));
  const paginatedTickets = useMemo(() => {
    return filteredTickets.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  }, [filteredTickets, page, itemsPerPage]);

  // Counts
  const confirmedCount = testTickets.filter((t) => t.bookingStatus === 'CONFIRMED').length;
  const completedCount = testTickets.filter((t) => t.bookingStatus === 'COMPLETED').length;
  const pendingCount = testTickets.filter((t) => t.bookingStatus === 'PENDING').length;
  const cancelledCount = testTickets.filter((t) => t.bookingStatus === 'CANCELLED').length;

  const handleActionCheckIn = async (code: string) => {
    setCheckingInCode(code);
    try {
      await onCheckIn(code);
      setToastSeverity('success');
      setToastMessage(`${t.scanSuccessToast || 'Gate Check-in successful for'} ${code}`);
    } catch (err: any) {
      setToastSeverity('error');
      setToastMessage(err.message || 'Check-in failed');
    } finally {
      setCheckingInCode(null);
    }
  };

  const getTierChip = (tierName?: string) => {
    const name = tierName || '';
    if (name.toLowerCase().includes('fanpit')) {
      return (
        <Chip
          label={name}
          size="small"
          sx={{
            bgcolor: 'rgba(234, 88, 12, 0.15)',
            color: '#ea580c',
            fontWeight: 700,
            border: '1px solid rgba(234, 88, 12, 0.3)',
          }}
        />
      );
    }
    if (name.toLowerCase().includes('early')) {
      return (
        <Chip
          label={name}
          size="small"
          sx={{
            bgcolor: 'rgba(168, 85, 247, 0.15)',
            color: '#a855f7',
            fontWeight: 700,
            border: '1px solid rgba(168, 85, 247, 0.3)',
          }}
        />
      );
    }
    return (
      <Chip
        label={name || 'Regular'}
        size="small"
        sx={{
          bgcolor: 'rgba(59, 130, 246, 0.15)',
          color: '#3b82f6',
          fontWeight: 700,
          border: '1px solid rgba(59, 130, 246, 0.3)',
        }}
      />
    );
  };

  const getBookingStatusChip = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <Chip
            label={t.statusConfirmed || 'CONFIRMED'}
            size="small"
            icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
            sx={{ bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700 }}
          />
        );
      case 'COMPLETED':
        return (
          <Chip
            label={t.statusCompleted || 'COMPLETED'}
            size="small"
            icon={<DoNotDisturbOn sx={{ fontSize: '14px !important' }} />}
            sx={{ bgcolor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 700 }}
          />
        );
      case 'CANCELLED':
        return (
          <Chip
            label={t.statusCancelled || 'CANCELLED'}
            size="small"
            icon={<CancelOutlined sx={{ fontSize: '14px !important' }} />}
            sx={{ bgcolor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 700 }}
          />
        );
      case 'PENDING':
      default:
        return (
          <Chip
            label={t.statusPending || 'PENDING'}
            size="small"
            icon={<WarningAmber sx={{ fontSize: '14px !important' }} />}
            sx={{ bgcolor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: 700 }}
          />
        );
    }
  };

  const getPaymentStatusChip = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <Chip
            label={t.statusPaid || 'PAID'}
            size="small"
            sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10b981', fontWeight: 600 }}
          />
        );
      case 'FAILED':
        return (
          <Chip
            label={t.statusFailed || 'FAILED'}
            size="small"
            sx={{ bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', fontWeight: 600 }}
          />
        );
      case 'PENDING':
      default:
        return (
          <Chip
            label={t.statusPending || 'PENDING'}
            size="small"
            sx={{ bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', fontWeight: 600 }}
          />
        );
    }
  };

  const renderScenarioBadge = (scenario?: string, bookingStatus?: string) => {
    if (!scenario) return null;
    let icon = <CheckCircle sx={{ fontSize: 16, color: '#10b981' }} />;
    let textColor = isDark ? '#a7f3d0' : '#065f46';
    let bgColor = isDark ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5';

    if (bookingStatus === 'COMPLETED' || scenario.toLowerCase().includes('already')) {
      icon = <DoNotDisturbOn sx={{ fontSize: 16, color: '#3b82f6' }} />;
      textColor = isDark ? '#bfdbfe' : '#1e40af';
      bgColor = isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff';
    } else if (bookingStatus === 'CANCELLED' || scenario.toLowerCase().includes('cancel')) {
      icon = <CancelOutlined sx={{ fontSize: 16, color: '#ef4444' }} />;
      textColor = isDark ? '#fecaca' : '#991b1b';
      bgColor = isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2';
    } else if (bookingStatus === 'PENDING' || scenario.toLowerCase().includes('pending')) {
      icon = <WarningAmber sx={{ fontSize: 16, color: '#f59e0b' }} />;
      textColor = isDark ? '#fde68a' : '#92400e';
      bgColor = isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb';
    }

    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.8,
          px: 1.2,
          py: 0.6,
          borderRadius: 1.5,
          backgroundColor: bgColor,
          color: textColor,
          fontSize: '0.82rem',
          fontWeight: 600,
        }}
      >
        {icon}
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'inherit' }}>
          {scenario}
        </Typography>
      </Box>
    );
  };

  const tableBg = isDark ? '#141824' : '#FFFFFF';
  const borderColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)';

  return (
    <Box>
      {/* 1. Header Banner & Safety Notification */}
      <Box
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          background: isDark
            ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(15, 23, 42, 0.8) 100%)'
            : 'linear-gradient(135deg, rgba(207, 250, 254, 0.7) 0%, rgba(248, 250, 252, 0.9) 100%)',
          border: `1px solid ${isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(6, 182, 212, 0.3)'}`,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              color: '#06b6d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Science sx={{ fontSize: 32 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {t.testSandboxTitle || 'Isolated Test Sandbox (userId: 79833)'}
              </Typography>
              <Chip
                label="Zero-Contamination"
                size="small"
                sx={{
                  bgcolor: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                }}
              />
            </Box>
            <Typography
              variant="body2"
              sx={{ color: isDark ? '#94a3b8' : '#64748b', mt: 0.5, maxWidth: 750 }}
            >
              {t.testSandboxDesc ||
                '30 static test tickets isolated from real customer bookings, live revenue calculations, and seat inventory. Gate scanner testing can be performed safely.'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {onOpenGateScanner && (
            <Button
              variant="outlined"
              startIcon={<QrCodeScanner />}
              onClick={onOpenGateScanner}
              sx={{
                borderRadius: '10px',
                fontWeight: 700,
                textTransform: 'none',
                borderColor: '#06b6d4',
                color: '#06b6d4',
                '&:hover': {
                  borderColor: '#0891b2',
                  backgroundColor: 'rgba(6, 182, 212, 0.08)',
                },
              }}
            >
              {t.btnGateScanner || 'Gate Scanner'}
            </Button>
          )}

          <Button
            variant="contained"
            startIcon={isResetting ? <CircularProgress size={18} color="inherit" /> : <RestartAlt />}
            disabled={isResetting}
            onClick={async () => {
              await onResetTestTickets();
              setToastSeverity('success');
              setToastMessage(
                t.msgTestTicketsReset ||
                  'All 30 test tickets have been reset to their initial test scenarios.'
              );
            }}
            sx={{
              borderRadius: '10px',
              fontWeight: 700,
              textTransform: 'none',
              backgroundColor: '#06b6d4',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.35)',
              '&:hover': { backgroundColor: '#0891b2' },
            }}
          >
            {isResetting ? t.btnResetting || 'Resetting...' : t.btnResetTestTickets || 'Reset Test Tickets'}
          </Button>
        </Box>
      </Box>

      {/* 2. KPI Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              backgroundColor: isDark ? 'rgba(28,22,3,0.45)' : '#ffffff',
              borderRadius: 2.5,
              border: `1px solid ${borderColor}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                {t.statTestTotal || 'Total Test Tickets'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: '#06b6d4' }}>
                {testTickets.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              backgroundColor: isDark ? 'rgba(28,22,3,0.45)' : '#ffffff',
              borderRadius: 2.5,
              border: `1px solid ${borderColor}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                {t.statTestConfirmed || 'Ready to Scan (21)'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: '#10b981' }}>
                {confirmedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              backgroundColor: isDark ? 'rgba(28,22,3,0.45)' : '#ffffff',
              borderRadius: 2.5,
              border: `1px solid ${borderColor}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                {t.statTestCompleted || 'Already Scanned (4)'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: '#3b82f6' }}>
                {completedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              backgroundColor: isDark ? 'rgba(28,22,3,0.45)' : '#ffffff',
              borderRadius: 2.5,
              border: `1px solid ${borderColor}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                {t.statTestPending || 'Payment Pending (3)'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: '#f59e0b' }}>
                {pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card
            sx={{
              backgroundColor: isDark ? 'rgba(28,22,3,0.45)' : '#ffffff',
              borderRadius: 2.5,
              border: `1px solid ${borderColor}`,
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" sx={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                {t.statTestCancelled || 'Cancelled / Denied (2)'}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5, color: '#ef4444' }}>
                {cancelledCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3. Filter Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder={
            t.searchTestPlaceholder || 'Search booking code (e.g. BKS-FN7901), tier, scenario...'
          }
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          size="small"
          sx={{ flexGrow: 1, minWidth: 280 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: isDark ? '#94a3b8' : '#64748b' }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t.filterTier || 'Filter Tier'}</InputLabel>
          <Select
            value={selectedTier}
            label={t.filterTier || 'Filter Tier'}
            onChange={(e) => {
              setSelectedTier(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="ALL">{t.allTiers || 'All Ticket Tiers'}</MenuItem>
            <MenuItem value="Regular">{t.tierRegularFolk || 'Regular (₹1,000)'}</MenuItem>
            <MenuItem value="Early Bird">{t.tierEarlyBirdFolk || 'Early Bird (₹1,500)'}</MenuItem>
            <MenuItem value="Fanpit">{t.tierFanpitFolk || 'Fanpit VIP (₹3,000)'}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>{t.filterBookingStatus || 'Booking Status'}</InputLabel>
          <Select
            value={selectedStatus}
            label={t.filterBookingStatus || 'Booking Status'}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="ALL">{t.allBookingStatuses || 'All Statuses'}</MenuItem>
            <MenuItem value="CONFIRMED">{t.statusConfirmed || 'CONFIRMED'}</MenuItem>
            <MenuItem value="COMPLETED">{t.statusCompleted || 'COMPLETED'}</MenuItem>
            <MenuItem value="PENDING">{t.statusPending || 'PENDING'}</MenuItem>
            <MenuItem value="CANCELLED">{t.statusCancelled || 'CANCELLED'}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 4. Tickets Table */}
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
        <Table sx={{ minWidth: 950 }}>
          <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                {t.colBookingCode || 'Booking Code'}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                {t.colTierName || 'Ticket Tier'}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                {t.colQty || 'Seats'}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                {t.colAmount || 'Amount (₹)'}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                {t.colPaymentStatus || 'Payment'}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                {t.colBookingStatus || 'Status'}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                {t.colTestScenario || 'Scanner Test Scenario'}
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}>
                {t.colActions || 'Actions'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}>
                    {t.noBookings || 'No test tickets found matching filter criteria.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTickets.map((ticket) => (
                <TableRow
                  key={ticket.bookingCode}
                  hover
                  sx={{
                    '&:hover': {
                      bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.01)',
                    },
                    borderBottom: `1px solid ${borderColor}`,
                  }}
                >
                  {/* Booking Code with Copy */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color: isDark ? '#facc15' : '#b45309',
                          letterSpacing: 0.5,
                        }}
                      >
                        {ticket.bookingCode}
                      </Typography>
                      <Tooltip title="Copy code">
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(ticket.bookingCode)}
                          sx={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'text.secondary', p: 0.5 }}
                        >
                          <ContentCopy sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>

                  {/* Tier */}
                  <TableCell>
                    {getTierChip(ticket.ticketTypeName || ticket.ticketType?.name)}
                  </TableCell>

                  {/* Seats */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {ticket.quantity} {ticket.quantity > 1 ? 'seats' : 'seat'}
                    </Typography>
                  </TableCell>

                  {/* Amount */}
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      ₹{ticket.totalAmount.toLocaleString()}
                    </Typography>
                  </TableCell>

                  {/* Payment Status */}
                  <TableCell>{getPaymentStatusChip(ticket.paymentStatus)}</TableCell>

                  {/* Booking Status */}
                  <TableCell>{getBookingStatusChip(ticket.bookingStatus)}</TableCell>

                  {/* Test Scenario */}
                  <TableCell>
                    {renderScenarioBadge(ticket.testScenario, ticket.bookingStatus)}
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title={t.btnViewTicket || 'View Ticket & QR Pass'}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<QrCode2 />}
                          onClick={() => onOpenTicketQrModal(ticket)}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            py: 0.5,
                            px: 1.2,
                            borderColor: borderColor,
                            color: isDark ? '#ffffff' : '#0f172a',
                            '&:hover': {
                              borderColor: '#06b6d4',
                              color: '#06b6d4',
                              backgroundColor: 'rgba(6, 182, 212, 0.08)',
                            },
                          }}
                        >
                          QR Pass
                        </Button>
                      </Tooltip>

                      <Tooltip title="Test Gate Check-in">
                        <span>
                          <Button
                            size="small"
                            variant="contained"
                            disabled={
                              checkingInCode === ticket.bookingCode ||
                              ticket.bookingStatus === 'COMPLETED'
                            }
                            onClick={() => handleActionCheckIn(ticket.bookingCode)}
                            sx={{
                              borderRadius: '8px',
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              py: 0.5,
                              px: 1.2,
                              backgroundColor:
                                ticket.bookingStatus === 'COMPLETED'
                                ? 'rgba(59, 130, 246, 0.3)'
                                : '#10b981',
                              color: '#ffffff',
                              '&:hover': {
                                backgroundColor: '#059669',
                              },
                            }}
                          >
                            {checkingInCode === ticket.bookingCode ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : ticket.bookingStatus === 'COMPLETED' ? (
                              'Scanned'
                            ) : (
                              t.btnCheckInAction || 'Check-in'
                            )}
                          </Button>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 5. Pagination */}
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

      {/* Toast Notification */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity={toastSeverity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
