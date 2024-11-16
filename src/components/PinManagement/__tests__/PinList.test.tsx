import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PinList } from '../PinList'
import { usePinterestApi } from '../../../hooks/usePinterestApi'

// Mock the Pinterest API hook
jest.mock('../../../hooks/usePinterestApi')

const mockPins = [
  {
    id: '1',
    title: 'Test Pin 1',
    description: 'Description 1',
    imageUrl: 'https://example.com/image1.jpg',
    boardName: 'Test Board',
    status: 'published',
  },
  {
    id: '2',
    title: 'Test Pin 2',
    description: 'Description 2',
    imageUrl: 'https://example.com/image2.jpg',
    boardName: 'Test Board',
    status: 'scheduled',
    scheduledTime: '2024-01-01T10:00:00Z',
  },
]

describe('PinList', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()

    // Mock the API hook implementation
    ;(usePinterestApi as jest.Mock).mockReturnValue({
      deletePin: jest.fn(),
      updatePin: jest.fn(),
      schedulePin: jest.fn(),
    })
  })

  it('renders pins correctly', () => {
    render(<PinList pins={mockPins} onPinUpdate={jest.fn()} loading={false} />)

    // Check if pins are rendered
    expect(screen.getByText('Test Pin 1')).toBeInTheDocument()
    expect(screen.getByText('Test Pin 2')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
    expect(screen.getByText('Description 2')).toBeInTheDocument()
  })

  it('shows loading state', () => {
    render(<PinList pins={[]} onPinUpdate={jest.fn()} loading={true} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('handles pin deletion', async () => {
    const mockDeletePin = jest.fn().mockResolvedValue(undefined)
    const mockOnPinUpdate = jest.fn()
    ;(usePinterestApi as jest.Mock).mockReturnValue({
      deletePin: mockDeletePin,
      updatePin: jest.fn(),
      schedulePin: jest.fn(),
    })

    render(
      <PinList pins={mockPins} onPinUpdate={mockOnPinUpdate} loading={false} />
    )

    // Click delete button for first pin
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    fireEvent.click(deleteButtons[0])

    // Confirm deletion in modal
    const confirmButton = screen.getByRole('button', { name: /ok/i })
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(mockDeletePin).toHaveBeenCalledWith('1')
      expect(mockOnPinUpdate).toHaveBeenCalled()
    })
  })

  it('opens edit modal', () => {
    render(<PinList pins={mockPins} onPinUpdate={jest.fn()} loading={false} />)

    // Click edit button for first pin
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    fireEvent.click(editButtons[0])

    // Check if modal is opened
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Test Pin 1')).toBeInTheDocument()
  })

  it('opens schedule modal', () => {
    render(<PinList pins={mockPins} onPinUpdate={jest.fn()} loading={false} />)

    // Click schedule button for first pin
    const scheduleButtons = screen.getAllByRole('button', {
      name: /schedule/i,
    })
    fireEvent.click(scheduleButtons[0])

    // Check if modal is opened
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(
      screen.getByText(/select a date and time to schedule this pin/i)
    ).toBeInTheDocument()
  })

  it('displays scheduled time correctly', () => {
    render(<PinList pins={mockPins} onPinUpdate={jest.fn()} loading={false} />)

    // Check if scheduled time is displayed
    expect(screen.getByText(/2024-01-01/)).toBeInTheDocument()
  })

  it('handles pin status correctly', () => {
    render(<PinList pins={mockPins} onPinUpdate={jest.fn()} loading={false} />)

    // Check if status tags are displayed
    expect(screen.getByText('PUBLISHED')).toBeInTheDocument()
    expect(screen.getByText('SCHEDULED')).toBeInTheDocument()
  })
})
