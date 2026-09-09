import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import Home from '@/app/page';

describe('Planora calendar', () => {
  it('renders mapped posts in the September month view', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: 'September 2026' })).toBeInTheDocument();
    expect(screen.getByText('Behind the scenes')).toBeInTheDocument();
    expect(screen.getByText('11 posts planned')).toBeInTheDocument();
  });

  it('filters posts by search query', () => {
    render(<Home />);
    fireEvent.change(screen.getByLabelText('Search scheduled posts'), { target: { value: 'launch' } });
    expect(screen.getByText('Launch countdown')).toBeInTheDocument();
    expect(screen.queryByText('Behind the scenes')).not.toBeInTheDocument();
  });

  it('creates a new scheduled post from a calendar day', () => {
    render(<Home />);
    fireEvent.click(screen.getByLabelText('Add post on September 10'));
    fireEvent.change(screen.getByPlaceholderText('What are you sharing?'), { target: { value: 'Community roundup' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save post' }));
    const day = screen.getByTestId('day-2026-09-10');
    expect(within(day).getByText('Community roundup')).toBeInTheDocument();
    expect(screen.getByText('Schedule updated')).toBeInTheDocument();
  });

  it('moves a post when it is dropped on another date', () => {
    render(<Home />);
    const source = screen.getByLabelText(/Edit Behind the scenes/);
    const target = screen.getByTestId('day-2026-09-06');
    const data: Record<string, string> = {};
    const dataTransfer = { setData: (type: string, value: string) => { data[type] = value; }, getData: (type: string) => data[type] ?? '' };
    fireEvent.dragStart(source, { dataTransfer });
    fireEvent.drop(target, { dataTransfer });
    expect(within(target).getByText('Behind the scenes')).toBeInTheDocument();
  });

  it('demonstrates optimized and unoptimized post render counts', async () => {
    render(<Home />);
    const data: Record<string, string> = {};
    const dataTransfer = { setData: (type: string, value: string) => { data[type] = value; }, getData: (type: string) => data[type] ?? '' };

    fireEvent.dragStart(screen.getByLabelText(/Edit Behind the scenes/), { dataTransfer });
    fireEvent.drop(screen.getByTestId('day-2026-09-06'), { dataTransfer });
    await waitFor(() => expect(screen.getByText('1', { selector: '.render-result > span' })).toBeInTheDocument());
    expect(screen.getByText('1', { selector: '.step-result > span' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Not optimize' }));
    fireEvent.dragStart(screen.getByLabelText(/Edit Q3 product recap/), { dataTransfer });
    fireEvent.drop(screen.getByTestId('day-2026-09-08'), { dataTransfer });
    await waitFor(() => expect(Number(screen.getByText(/^\d+$/, { selector: '.render-result > span' }).textContent)).toBeGreaterThan(1));
    expect(Number(screen.getByText(/^\d+$/, { selector: '.step-result > span' }).textContent)).toBeGreaterThan(1);
  });
});
