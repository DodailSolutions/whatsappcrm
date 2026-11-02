import { describe, it, expect, vi } from 'vitest'
import { checkSlotAvailability } from './booking-engine'

// Mock supabaseAdmin for isolated unit testing
vi.mock('@/lib/ai/admin-client', () => ({
  supabaseAdmin: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            eq: () => ({
              in: () => ({
                limit: () => Promise.resolve({ data: [] }),
              }),
            }),
          }),
        }),
      }),
    }),
  }),
}))

describe('Booking Availability Engine', () => {
  it('reports slot available when no conflicting appointments exist', async () => {
    const res = await checkSlotAvailability({
      accountId: 'test-account-123',
      appointmentDate: '2026-11-15',
      appointmentTime: '14:00',
      serviceName: 'Consultation',
    })

    expect(res.isAvailable).toBe(true)
    expect(res.message).toContain('is available for booking')
  })
})

