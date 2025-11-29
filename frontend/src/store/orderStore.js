import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Order creation store using Zustand
 * Manages the multi-step order creation flow
 */
const useOrderStore = create(
  persist(
    (set, get) => ({
      // Order data
      currentStep: 1,
      cardType: null,
      template: null,
      customImage: null,
      message: '',
      recipientName: '',
      recipientAddress: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
      deliveryType: 'standard', // 'standard' or 'rush'

      // Actions
      setStep: (step) => set({ currentStep: step }),

      nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, 5)
      })),

      prevStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 1)
      })),

      setCardType: (type) => set({ cardType: type }),

      setTemplate: (template) => set({ template, customImage: null }),

      setCustomImage: (image) => set({ customImage: image, template: null }),

      setMessage: (message) => set({ message }),

      setRecipientName: (name) => set({ recipientName: name }),

      setRecipientAddress: (address) => set((state) => ({
        recipientAddress: { ...state.recipientAddress, ...address }
      })),

      setDeliveryType: (type) => set({ deliveryType: type }),

      // Get order summary
      getOrderSummary: () => {
        const state = get()
        return {
          cardType: state.cardType,
          template: state.template,
          customImage: state.customImage,
          message: state.message,
          recipientName: state.recipientName,
          recipientAddress: state.recipientAddress,
          deliveryType: state.deliveryType,
          price: state.deliveryType === 'rush' ? 15 : 7,
        }
      },

      // Reset order
      reset: () => set({
        currentStep: 1,
        cardType: null,
        template: null,
        customImage: null,
        message: '',
        recipientName: '',
        recipientAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
        },
        deliveryType: 'standard',
      }),
    }),
    {
      name: 'nearrun-order-storage', // localStorage key
      partialize: (state) => ({
        // Only persist these fields
        cardType: state.cardType,
        template: state.template,
        customImage: state.customImage,
        message: state.message,
        recipientName: state.recipientName,
        recipientAddress: state.recipientAddress,
        deliveryType: state.deliveryType,
      }),
    }
  )
)

export default useOrderStore
