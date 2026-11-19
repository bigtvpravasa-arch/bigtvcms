'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import { CreateBookingInput } from '../domain/event.types';
import { FOLK_NIGHT_EVENT_ID } from '../repositories/events.repository';
import { useAppTheme } from '@/shared/providers/ThemeProvider';

interface CreateBookingModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: CreateBookingInput) => Promise<void>;
  translations: Record<string, string>;
}

const TIERS = [
  { id: 'db5b7a7b-61d8-4460-bd63-f23acfe8ed53', name: 'Regular', price: 500 },
  { id: '690b2622-f9b4-457a-843e-a9cf2c7a15fb', name: 'Early Bird', price: 1000 },
  { id: '6676784b-e4f5-4c35-ae35-244d322854dd', name: 'Fanpit', price: 3000 },
];

export const CreateBookingModal: React.FC<CreateBookingModalProps> = ({
  open,
  onClose,
  onSave,
  translations: t,
}) => {
  const { mode } = useAppTheme();
  const isDark = mode === 'dark';

  const [ticketTypeId, setTicketTypeId] = useState<string>('690b2622-f9b4-457a-843e-a9cf2c7a15fb');
  const [quantity, setQuantity] = useState<number>(2);
  const [userName, setUserName] = useState<string>('');
  const [userPhone, setUserPhone] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [couponCode, setCouponCode] = useState<string>('BIGTVFN30');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const selectedTier = TIERS.find((t) => t.id === ticketTypeId) || TIERS[1];
  const unitPrice = selectedTier.price;
  const subTotal = unitPrice * quantity;

  let discountAmount = 0;
  const cleanCoupon = couponCode.trim().toUpperCase();
  if (cleanCoupon === 'BIGTVFN30') {
    discountAmount = Math.round(subTotal * 0.3);
  } else if (cleanCoupon === 'FN300') {
    discountAmount = Math.round(subTotal * 0.98);
  }
  const totalAmount = Math.max(0, subTotal - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Customer name is required');
      return;
    }
    if (!userPhone.trim()) {
      setError('Customer phone is required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onSave({
        eventId: FOLK_NIGHT_EVENT_ID,
        ticketTypeId,
        quantity,
        userName: userName.trim(),
        userPhone: userPhone.trim(),
        userEmail: userEmail.trim() || undefined,
        couponCode: cleanCoupon || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
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
      <DialogTitle sx={{ fontWeight: 700, color: isDark ? '#FFFFFF' : '#0f172a' }}>
        {t.modalCreateBookingTitle || 'Create Ticket Booking'}
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent
          dividers
          sx={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
        >
          {error && (
            <Typography variant="body2" sx={{ color: '#ef4444', mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: isDark ? 'rgba(255,255,255,0.5)' : 'text.secondary',
                  display: 'block',
                }}
              >
                Target Event:
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#ea580c' }}>
                BIGTV Folk Night 2026 (Bigtv-2026)
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'text.secondary' }}
              >
                Dec 12, 2026, 06:00 PM IST • Boulder Hills Golf Club, Hyderabad
              </Typography>
            </Box>

            <FormControl fullWidth size="small">
              <InputLabel id="tier-select-label">
                {t.lblSelectTier || 'Select Ticket Tier'}
              </InputLabel>
              <Select
                labelId="tier-select-label"
                value={ticketTypeId}
                label={t.lblSelectTier || 'Select Ticket Tier'}
                onChange={(e) => setTicketTypeId(e.target.value)}
              >
                <MenuItem value="db5b7a7b-61d8-4460-bd63-f23acfe8ed53">
                  Regular — ₹500 (5,000 Seats)
                </MenuItem>
                <MenuItem value="690b2622-f9b4-457a-843e-a9cf2c7a15fb">
                  Early Bird — ₹1,000 (3,000 Seats)
                </MenuItem>
                <MenuItem value="6676784b-e4f5-4c35-ae35-244d322854dd">
                  Fanpit — ₹3,000 (300 VIP Seats)
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={t.lblQuantity || 'Ticket Quantity'}
              type="number"
              size="small"
              fullWidth
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))
              }
              inputProps={{ min: 1, max: 10 }}
            />

            <TextField
              label={t.lblCustomerName || 'Customer Name'}
              size="small"
              fullWidth
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
            />

            <TextField
              label={t.lblCustomerPhone || 'Mobile Phone'}
              size="small"
              fullWidth
              required
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              placeholder="e.g. 9876543210"
            />

            <TextField
              label={t.lblCustomerEmail || 'Email Address (Optional)'}
              type="email"
              size="small"
              fullWidth
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="e.g. ramesh@example.com"
            />

            <Box>
              <TextField
                label={t.lblCouponCode || 'Promo Coupon Code'}
                size="small"
                fullWidth
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="BIGTVFN30 or FN300"
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label="BIGTVFN30 (30% Off)"
                  size="small"
                  clickable
                  onClick={() => setCouponCode('BIGTVFN30')}
                  color={cleanCoupon === 'BIGTVFN30' ? 'primary' : 'default'}
                />
                <Chip
                  label="FN300 (98% Off)"
                  size="small"
                  clickable
                  onClick={() => setCouponCode('FN300')}
                  color={cleanCoupon === 'FN300' ? 'primary' : 'default'}
                />
              </Box>
            </Box>

            {/* Price Breakdown */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                mt: 1,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography
                  variant="body2"
                  sx={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary' }}
                >
                  Subtotal ({quantity} × ₹{unitPrice}):
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ color: isDark ? '#FFFFFF' : '#1e293b' }}
                >
                  ₹{subTotal.toLocaleString('en-IN')}
                </Typography>
              </Box>
              {discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: '#10b981' }}>
                    Discount ({cleanCoupon}):
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ color: '#10b981' }}>
                    -₹{discountAmount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              )}
              <Divider
                sx={{ my: 1, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ color: isDark ? '#FFFFFF' : '#0f172a' }}
                >
                  Total Payable:
                </Typography>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#ea580c' }}>
                  ₹{totalAmount.toLocaleString('en-IN')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{ p: 2, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
        >
          <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none' }}>
            {t.btnCancel || 'Cancel'}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              textTransform: 'none',
              bgcolor: '#ea580c',
              '&:hover': { bgcolor: '#c2410c' },
            }}
          >
            {loading ? 'Creating...' : t.btnSave || 'Create Booking'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
