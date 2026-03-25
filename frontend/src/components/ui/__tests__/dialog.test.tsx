import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

describe('Dialog', () => {
  it('renders dialog component', () => {
    const { container } = render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>This is a test dialog</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button>Cancel</button>
            <button>Confirm</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    
    expect(container).toBeInTheDocument();
  });

  it('displays dialog title', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    
    expect(screen.getByText('Test Dialog Title')).toBeInTheDocument();
  });

  it('displays dialog description', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test</DialogTitle>
            <DialogDescription>Test Description</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
    
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });
});
