import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../card';

describe('Card', () => {
  it('renders card component', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );
    
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('renders card with header', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Header Only</CardTitle>
        </CardHeader>
      </Card>
    );
    expect(screen.getByText('Header Only')).toBeInTheDocument();
  });

  it('renders card with content only', () => {
    render(
      <Card>
        <CardContent>Just Content</CardContent>
      </Card>
    );
    expect(screen.getByText('Just Content')).toBeInTheDocument();
  });
});
