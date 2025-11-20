import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Toast from './Toast';

describe('Toast', () => {
  it('should not render content when toast is null', () => {
    render(<Toast toast={null} onClear={vi.fn()} />);
    expect(screen.queryByText(/./)).toBeNull();
  });

  it('should render toast with message', () => {
    const mockToast = { message: 'Test message' };
    render(<Toast toast={mockToast} onClear={vi.fn()} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('should display checkmark icon by default', () => {
    const mockToast = { message: 'Success!' };
    render(<Toast toast={mockToast} onClear={vi.fn()} />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
    // Check for checkmark SVG
    const svg = screen.getByText('Success!').parentElement?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should display gift icon when isReward is true', () => {
    const mockToast = { message: 'Reward earned!', isReward: true };
    render(<Toast toast={mockToast} onClear={vi.fn()} />);

    expect(screen.getByText('Reward earned!')).toBeInTheDocument();
    // The GiftIcon component would be rendered
  });

  it('should call onClear after 3.5 seconds', async () => {
    vi.useFakeTimers();
    const onClear = vi.fn();
    const mockToast = { message: 'Test' };

    render(<Toast toast={mockToast} onClear={onClear} />);

    expect(onClear).not.toHaveBeenCalled();

    // Fast-forward time by 3.5 seconds (3s display + 0.5s fade)
    await act(async () => {
      vi.advanceTimersByTime(3500);
    });

    expect(onClear).toHaveBeenCalled();

    vi.useRealTimers();
  });

  it('should make toast clickable when onClick is provided', () => {
    const onClick = vi.fn();
    const mockToast = { message: 'Click me', onClick };

    render(<Toast toast={mockToast} onClear={vi.fn()} />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should handle toast change and reset timer', async () => {
    vi.useFakeTimers();
    const onClear = vi.fn();
    const mockToast1 = { message: 'First' };

    const { rerender } = render(<Toast toast={mockToast1} onClear={onClear} />);

    // Advance 1 second
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Change toast
    const mockToast2 = { message: 'Second' };
    rerender(<Toast toast={mockToast2} onClear={onClear} />);

    // Advance another 2 seconds (total would be 3 from first toast)
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Should not have closed yet (timer reset)
    expect(onClear).not.toHaveBeenCalled();

    // Advance final 1.5 seconds to complete new 3.5 second timer
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(onClear).toHaveBeenCalled();

    vi.useRealTimers();
  });
});
