import { useState, useCallback, useRef } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import api, { classifyError, ApiErrorCode, CURRENT_ENV } from './api';
import axios from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface PaymentOptions {
  amount: number; // Amount in INR (not paise)
  currency?: string;
  description?: string;
  orderId?: string;
  prefill?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
  };
}

export interface VerifyPaymentResponse {
  success: boolean;
  verified: boolean;
}

type PaymentPurpose = 'donation' | 'store' | 'booking';

interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  lastPaymentId: string | null;
}

// ============================================================================
// RAZORPAY CONFIG
// ============================================================================

// These would come from environment variables in production
const RAZORPAY_KEY_ID = CURRENT_ENV === 'production'
  ? 'rzp_live_your_key_id' // Replace with actual live key
  : 'rzp_test_your_test_key'; // Replace with actual test key

const RAZORPAY_CONFIG = {
  key: RAZORPAY_KEY_ID,
  name: 'JainSetu',
  description: 'JainSetu Payment',
  image: 'https://jainsetu.com/logo.png', // Replace with actual logo URL
  theme: {
    color: '#E97A2B', // Saffron color
  },
};

// ============================================================================
// PAYMENT HOOK
// ============================================================================

export function usePayment() {
  const [state, setState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    lastPaymentId: null,
  });

  // Prevent duplicate submissions
  const processingRef = useRef(false);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Create a payment order on the backend
   */
  const createOrder = useCallback(async (
    purpose: PaymentPurpose,
    amount: number,
    metadata: Record<string, string> = {}
  ): Promise<CreateOrderResponse | null> => {
    try {
      let endpoint: string;

      switch (purpose) {
        case 'donation':
          endpoint = '/donations/create-order';
          break;
        case 'store':
          endpoint = '/store/create-order';
          break;
        case 'booking':
          endpoint = '/tirth/create-order';
          break;
        default:
          throw new Error('Invalid payment purpose');
      }

      const response = await api.post<CreateOrderResponse>(endpoint, {
        amount,
        ...metadata,
      });

      return response;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const apiError = classifyError(error);
        throw new Error(apiError.userMessage);
      }
      throw error;
    }
  }, []);

  /**
   * Verify payment signature on the backend
   */
  const verifyPayment = useCallback(async (
    purpose: PaymentPurpose,
    paymentId: string,
    orderId: string,
    signature: string
  ): Promise<boolean> => {
    try {
      let endpoint: string;

      switch (purpose) {
        case 'donation':
          endpoint = '/donations/verify';
          break;
        case 'store':
          endpoint = '/store/verify-payment';
          break;
        case 'booking':
          endpoint = '/tirth/verify-payment';
          break;
        default:
          throw new Error('Invalid payment purpose');
      }

      const response = await api.post<VerifyPaymentResponse>(endpoint, {
        paymentId,
        orderId,
        signature,
      });

      return response.verified;
    } catch (error) {
      console.error('[Payment] Verification failed:', error);
      return false;
    }
  }, []);

  /**
   * Open Razorpay checkout
   * Note: In a real implementation, this would use react-native-razorpay
   * For now, we provide a simulation for development
   */
  const openCheckout = useCallback(async (
    options: PaymentOptions,
    onSuccess: (result: PaymentResult) => void,
    onError: (error: string) => void
  ): Promise<void> => {
    // Duplicate tap protection
    if (processingRef.current) {
      console.log('[Payment] Payment already in progress');
      return;
    }

    processingRef.current = true;
    setState((prev) => ({ ...prev, isProcessing: true, error: null }));

    try {
      // In development mode, simulate payment
      if (CURRENT_ENV === 'development' || __DEV__) {
        // Simulate payment processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulate successful payment
        const mockResult: PaymentResult = {
          success: true,
          paymentId: `pay_mock_${Date.now()}`,
          orderId: options.orderId || `order_mock_${Date.now()}`,
          signature: `sig_mock_${Date.now()}`,
        };

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          lastPaymentId: mockResult.paymentId || null,
        }));
        processingRef.current = false;

        Alert.alert(
          'Development Mode',
          `Payment simulated successfully!\n\nAmount: ₹${options.amount}\nPayment ID: ${mockResult.paymentId}`,
          [{ text: 'OK', onPress: () => onSuccess(mockResult) }]
        );
        return;
      }

      // Production: Use actual Razorpay SDK
      // This requires react-native-razorpay to be installed
      const RazorpayCheckout = require('react-native-razorpay').default;

      const razorpayOptions = {
        ...RAZORPAY_CONFIG,
        amount: options.amount * 100, // Convert to paise
        currency: options.currency || 'INR',
        order_id: options.orderId,
        description: options.description || RAZORPAY_CONFIG.description,
        prefill: {
          name: options.prefill?.name || '',
          email: options.prefill?.email || '',
          contact: options.prefill?.phone || '',
        },
        notes: options.notes || {},
        theme: {
          ...RAZORPAY_CONFIG.theme,
          ...options.theme,
        },
      };

      const result = await RazorpayCheckout.open(razorpayOptions);

      const paymentResult: PaymentResult = {
        success: true,
        paymentId: result.razorpay_payment_id,
        orderId: result.razorpay_order_id,
        signature: result.razorpay_signature,
      };

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        lastPaymentId: paymentResult.paymentId || null,
      }));
      processingRef.current = false;

      onSuccess(paymentResult);
    } catch (error: any) {
      console.error('[Payment] Checkout error:', error);

      let errorMessage = 'Payment failed. Please try again.';

      if (error.code === 'PAYMENT_CANCELLED') {
        errorMessage = 'Payment was cancelled.';
      } else if (error.description) {
        errorMessage = error.description;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setState((prev) => ({
        ...prev,
        isProcessing: false,
        error: errorMessage,
      }));
      processingRef.current = false;

      onError(errorMessage);
    }
  }, []);

  /**
   * Complete payment flow for donations
   */
  const processDonation = useCallback(async (
    causeId: string,
    amount: number,
    donorInfo: {
      name: string;
      phone: string;
      email?: string;
      pan?: string;
      isAnonymous?: boolean;
    }
  ): Promise<PaymentResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Step 1: Create order
        const orderResponse = await createOrder('donation', amount, { causeId });

        if (!orderResponse?.order) {
          throw new Error('Failed to create payment order');
        }

        // Step 2: Open checkout
        await openCheckout(
          {
            amount,
            orderId: orderResponse.order.id,
            description: 'Donation to JainSetu',
            prefill: {
              name: donorInfo.name,
              phone: donorInfo.phone,
              email: donorInfo.email,
            },
            notes: {
              causeId,
              purpose: 'donation',
            },
          },
          async (result) => {
            try {
              // Step 3: Verify payment
              const verified = await verifyPayment(
                'donation',
                result.paymentId!,
                result.orderId!,
                result.signature!
              );

              if (!verified) {
                console.warn('[Payment] Payment verification failed');
              }

              // Step 4: Record donation
              await api.post('/donations', {
                causeId,
                amount,
                donorName: donorInfo.name,
                donorPhone: donorInfo.phone,
                donorEmail: donorInfo.email,
                donorPAN: donorInfo.pan,
                isAnonymous: donorInfo.isAnonymous || false,
                paymentId: result.paymentId,
                paymentMethod: 'online',
              });

              resolve(result);
            } catch (error) {
              // Payment succeeded but recording failed
              // User should still be notified of success
              console.error('[Payment] Post-payment processing failed:', error);
              resolve(result);
            }
          },
          (error) => {
            reject(new Error(error));
          }
        );
      } catch (error: any) {
        reject(error);
      }
    });
  }, [createOrder, openCheckout, verifyPayment]);

  /**
   * Complete payment flow for store orders
   */
  const processStoreOrder = useCallback(async (
    items: Array<{ id: string; quantity: number; price: number }>,
    shippingAddress: {
      name: string;
      phone: string;
      email?: string;
      address: string;
      city: string;
      pincode: string;
    }
  ): Promise<PaymentResult> => {
    return new Promise(async (resolve, reject) => {
      try {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Step 1: Create order
        const orderResponse = await createOrder('store', total, {
          items: JSON.stringify(items),
        });

        if (!orderResponse?.order) {
          throw new Error('Failed to create payment order');
        }

        // Step 2: Open checkout
        await openCheckout(
          {
            amount: total,
            orderId: orderResponse.order.id,
            description: 'JainSetu Store Order',
            prefill: {
              name: shippingAddress.name,
              phone: shippingAddress.phone,
              email: shippingAddress.email,
            },
            notes: {
              purpose: 'store_order',
            },
          },
          async (result) => {
            try {
              // Step 3: Verify and create order
              await api.post('/store/orders', {
                items,
                shippingAddress,
                paymentId: result.paymentId,
                orderId: result.orderId,
              });

              resolve(result);
            } catch (error) {
              console.error('[Payment] Post-payment processing failed:', error);
              resolve(result);
            }
          },
          (error) => {
            reject(new Error(error));
          }
        );
      } catch (error: any) {
        reject(error);
      }
    });
  }, [createOrder, openCheckout]);

  return {
    ...state,
    clearError,
    createOrder,
    verifyPayment,
    openCheckout,
    processDonation,
    processStoreOrder,
  };
}

export default usePayment;
