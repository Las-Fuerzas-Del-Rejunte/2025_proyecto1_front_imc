    import { render, screen } from '@testing-library/react';
    import { Calendar}  from '../components/ui/calendar'; // Assuming your calendar component is in Calendar.js

    describe('Calendar component', () => {
      test('should render the calendar correctly', () => {
        render(<Calendar />);
        
        expect(screen.getByText(/septiembre/i)).toBeInTheDocument();
        expect(screen.getByText('15')).toBeInTheDocument(); // Assuming today's date
      });
    });