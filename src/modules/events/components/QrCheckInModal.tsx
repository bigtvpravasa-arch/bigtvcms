'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import { QrCodeScanner, CheckCircle, Cancel, VerifiedUser } from '@mui/icons-material';
import { VerifyQrResult } from '../domain/event.types';
import { useAppTheme } from '@/shared/providers/ThemeProvider';

interface QrCheckInModalProps {
  open: boolean;
  initialCode?: string;
  onClose: () => void;
  onVerify: (code: string) => Promise<VerifyQrResult>;
  onCheckIn: (code: string) => Promise<any>;
  translations: Record<string, string>;
}

export const QrCheckInModal: React.FC<QrCheckInModalProps> = ({
  open,
  initialCode = '',
  onClose,
  onVerify,
  onCheckIn,
  translations: t,
}) => {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  const [code, setCode] = useState<string>(initialCode);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [checkingIn, setCheckingIn] = useState<boolean>(false);
  const [result, setResult] = useState<VerifyQrResult | null>(null);
  const [checkedInMessage, setCheckedInMessage] = useState<string>('');

  React.useEffect(() => {
    if (initialCode) {
      setCode(initialCode);
      handleVerify(initialCode);
    } else {
      setCode('');
      setResult(null);
      setCheckedInMessage('');
    }
  }, [initialCode, open]);

  const handleVerify = async (codeToVerify?: string) => {
    const target = (codeToVerify || code).trim().toUpperCase();
    if (!target) return;
    setVerifying(true);
    setCheckedInMessage('');
    try {
      const res = await onVerify(target);
      setResult(res);
    } finally {
      setVerifying(false);
    }
  };

  const handleConfirmCheckIn = async () => {
    const target = code.trim().toUpperCase();
    if (!target) return;
    setCheckingIn(true);
    try {
      const res = await onCheckIn(target);
      setCheckedInMessage(
        res?.message ||
          t.msgCheckedInSuccess ||
          'Ticket scanned successfully. Customer checked in for event.'
      );
      setResult(null);
    } finally {
      setCheckingIn(false);
    }
  };

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
      <DialogTitle
        sx={{
          fontWeight: 700,
          color: isDark ? '#FFFFFF' : '#0f172a',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <QrCodeScanner sx={{ color: '#ea580c' }} />
        {t.modalGateCheckInTitle || 'Gate Check-in & QR Verification'}
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, mt: 1 }}>
          <TextField
            label={t.lblBookingCode || 'Booking Code / Ticket ID'}
            size="small"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. BTV-FN26-K92A"
            inputProps={{
              style: { textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 },
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleVerify()}
            disabled={verifying || !code.trim()}
            sx={{
              textTransform: 'none',
              bgcolor: '#ea580c',
              '&:hover': { bgcolor: '#c2410c' },
              whiteSpace: 'nowrap',
            }}
          >
            {verifying ? (
              <CircularProgress size={18} sx={{ color: '#FFF' }} />
            ) : (
              t.btnScanVerify || 'Verify Ticket'
            )}
          </Button>
        </Box>

        {/* Checked in success banner */}
        {checkedInMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {checkedInMessage}
          </Alert>
        )}

        {/* Verification result card */}
        {result && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              border: `1px solid ${result.isValid ? '#10b981' : '#ef4444'}`,
              bgcolor: result.isValid
                ? isDark
                  ? 'rgba(16, 185, 129, 0.08)'
                  : 'rgba(16, 185, 129, 0.05)'
                : isDark
                  ? 'rgba(239, 68, 68, 0.08)'
                  : 'rgba(239, 68, 68, 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              {result.isValid ? (
                <CheckCircle sx={{ color: '#10b981', fontSize: 26 }} />
              ) : (
                <Cancel sx={{ color: '#ef4444', fontSize: 26 }} />
              )}
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ color: result.isValid ? '#10b981' : '#ef4444' }}
              >
                {result.isValid ? 'GATE ENTRY ALLOWED' : 'ENTRY DENIED'}
              </Typography>
            </Box>

            <Typography
              variant="body2"
              sx={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'text.primary', mb: 2 }}
            >
              {result.reason}
            </Typography>

            {result.booking && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  pt: 1.5,
                  borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    variant="caption"
                    sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}
                  >
                    Attendee:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}
                  >
                    {result.booking.userName}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography
                    variant="caption"
                    sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}
                  >
                    Tickets & Tier:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}
                  >
                    {result.booking.quantity} ×{' '}
                    {result.booking.ticketType?.name || result.booking.ticketTypeName || 'Ticket'}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary' }}
                  >
                    Payment & Status:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip
                      label={result.booking.paymentStatus}
                      size="small"
                      color={result.booking.paymentStatus === 'PAID' ? 'success' : 'error'}
                    />
                    <Chip label={result.booking.bookingStatus} size="small" />
                  </Box>
                </Box>
              </Box>
            )}

            {result.isValid && (
              <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleConfirmCheckIn}
                  disabled={checkingIn}
                  startIcon={
                    checkingIn ? (
                      <CircularProgress size={16} sx={{ color: '#FFF' }} />
                    ) : (
                      <VerifiedUser />
                    )
                  }
                  sx={{
                    textTransform: 'none',
                    bgcolor: '#10b981',
                    '&:hover': { bgcolor: '#059669' },
                  }}
                >
                  {checkingIn ? 'Checking In...' : t.btnConfirmCheckIn || 'Confirm Gate Check-in'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{ p: 2, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
      >
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          {t.btnCancel || 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
