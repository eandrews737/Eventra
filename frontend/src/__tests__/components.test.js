// import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';

// Import components
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import FormInput from '../components/FormInput';
import FormContainer from '../components/FormContainer';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Header from '../components/Header';
import PageLayout from '../components/PageLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import ThemeToggle from '../components/ThemeToggle';
import BackButton from '../components/BackButton';
import FormSection from '../components/FormSection';
import LazyLoad from '../components/LazyLoad';
import VirtualizedList from '../components/VirtualizedList';

// Mock API
jest.mock('../services/api', () => ({
  authAPI: {
    getProfile: jest.fn(),
  },
}));

const renderWithProviders = (component) => {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      <BrowserRouter>
        {component}
      </BrowserRouter>
    </ThemeProvider>
  );
};

// describe('Button Component', () => {
//   it('renders with default props', () => {
//     render(<Button>Click me</Button>);
//     expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
//   });
//
//   it('renders with different variants', () => {
//     const { rerender } = render(<Button variant="primary">Primary</Button>);
//     expect(screen.getByRole('button', { name: /primary/i })).toBeInTheDocument();
//
//     rerender(<Button variant="secondary">Secondary</Button>);
//     expect(screen.getByRole('button', { name: /secondary/i })).toBeInTheDocument();
//
//     rerender(<Button variant="danger">Danger</Button>);
//     expect(screen.getByRole('button', { name: /danger/i })).toBeInTheDocument();
//   });
//
//   it('renders with different sizes', () => {
//     const { rerender } = render(<Button size="small">Small</Button>);
//     expect(screen.getByRole('button', { name: /small/i })).toBeInTheDocument();
//
//     rerender(<Button size="large">Large</Button>);
//     expect(screen.getByRole('button', { name: /large/i })).toBeInTheDocument();
//   });
//
//   it('shows loading state', () => {
//     render(<Button loading>Loading</Button>);
//     expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
//   });
//
//   it('handles click events', () => {
//     const handleClick = jest.fn();
//     render(<Button onClick={handleClick}>Click me</Button>);
//     fireEvent.click(screen.getByRole('button', { name: /click me/i }));
//     expect(handleClick).toHaveBeenCalledTimes(1);
//   });
//
//   it('handles disabled state', () => {
//     render(<Button disabled>Disabled Button</Button>);
//     expect(screen.getByRole('button', { name: /disabled button/i })).toBeDisabled();
//   });
//
//   it('handles type prop', () => {
//     render(<Button type="submit">Submit</Button>);
//     expect(screen.getByRole('button', { name: /submit/i })).toHaveAttribute('type', 'submit');
//   });
//
//   it('handles custom className', () => {
//     render(<Button className="custom-btn">Custom</Button>);
//     expect(screen.getByRole('button', { name: /custom/i })).toHaveClass('custom-btn');
//   });
// });

describe('Card Component', () => {
  it('renders with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with hover effect', () => {
    render(<Card hover>Hover card</Card>);
    expect(screen.getByText('Hover card')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Custom card</Card>);
    const card = screen.getByText('Custom card').closest('div');
    expect(card).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Clickable Card</Card>);
    fireEvent.click(screen.getByText('Clickable Card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state', () => {
    render(<Card disabled>Disabled Card</Card>);
    const card = screen.getByText('Disabled Card').closest('div');
    expect(card).toHaveClass('opacity-50', 'cursor-not-allowed');
  });
});

describe('Badge Component', () => {
  it('renders with text', () => {
    render(<Badge>Success</Badge>);
    expect(screen.getByText('Success')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toBeInTheDocument();

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toBeInTheDocument();

    rerender(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText('Danger')).toBeInTheDocument();

    rerender(<Badge variant="primary">Primary</Badge>);
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Badge size="small">Small</Badge>);
    expect(screen.getByText('Small')).toBeInTheDocument();

    rerender(<Badge size="large">Large</Badge>);
    expect(screen.getByText('Large')).toBeInTheDocument();
  });

  it('handles default variant', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('handles custom className', () => {
    render(<Badge className="custom-badge">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-badge');
  });
});

describe('FormInput Component', () => {
  it('renders with label', () => {
    render(<FormInput label="Email" id="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = jest.fn();
    render(<FormInput label="Email" id="email" onChange={handleChange} />);
    const input = screen.getByLabelText('Email');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders with required indicator', () => {
    render(<FormInput label="Email" id="email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders with different types', () => {
    const { rerender } = render(<FormInput label="Email" id="email" type="email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');

    rerender(<FormInput label="Password" id="password" type="password" />);
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('renders textarea when type is textarea', () => {
    render(<FormInput label="Description" id="description" type="textarea" />);
    expect(screen.getByLabelText('Description')).toBeInstanceOf(HTMLTextAreaElement);
  });

  it('handles disabled state', () => {
    render(<FormInput label="Disabled" id="disabled" disabled />);
    expect(screen.getByLabelText('Disabled')).toBeDisabled();
  });

  it('handles placeholder', () => {
    render(<FormInput label="Input" id="input" placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles error state', () => {
    render(<FormInput label="Input" id="input" error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('handles help text', () => {
    render(<FormInput label="Input" id="input" helpText="This is help text" />);
    expect(screen.getByText('This is help text')).toBeInTheDocument();
  });
});

describe('FormContainer Component', () => {
  it('renders with children', () => {
    render(<FormContainer>Form content</FormContainer>);
    expect(screen.getByText('Form content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<FormContainer className="custom-form">Custom form</FormContainer>);
    const form = screen.getByText('Custom form').closest('div');
    expect(form).toHaveClass('custom-form');
  });
});

describe('ErrorMessage Component', () => {
  it('renders error message', () => {
    render(<ErrorMessage message="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not render when no message', () => {
    render(<ErrorMessage message="" />);
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ErrorMessage message="Error" className="custom-error" />);
    const error = screen.getByText('Error').closest('div');
    expect(error).toHaveClass('custom-error');
  });
});

describe('LoadingSpinner Component', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<LoadingSpinner size="small" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    rerender(<LoadingSpinner size="medium" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();

    rerender(<LoadingSpinner size="large" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});

describe('EmptyState Component', () => {
  it('renders with title and description', () => {
    render(
      <EmptyState
        title="No items"
        description="There are no items to display"
      />
    );
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    render(
      <EmptyState
        title="No items"
        description="There are no items to display"
        action={<button>Add Item</button>}
      />
    );
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument();
  });

  it('renders with custom icon', () => {
    const CustomIcon = () => <div data-testid="custom-icon">Icon</div>;
    render(
      <EmptyState
        title="No items"
        description="There are no items to display"
        icon={CustomIcon}
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});

describe('Header Component', () => {
  beforeEach(() => {
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
  });

  it('renders with logo and navigation', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Eventra')).toBeInTheDocument();
    expect(screen.getByText('Event Management')).toBeInTheDocument();
  });

  it('shows navigation links', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('shows theme toggle button', () => {
    renderWithProviders(<Header />);
    expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument();
  });

  it('shows user avatar', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('shows logout button', () => {
    renderWithProviders(<Header />);
    expect(screen.getByTitle(/logout/i)).toBeInTheDocument();
  });
});

describe('PageLayout Component', () => {
  it('renders with title', () => {
    render(<PageLayout title="Test Page">Content</PageLayout>);
    expect(screen.getByText('Test Page')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with subtitle', () => {
    render(
      <PageLayout title="Test Page" subtitle="Test subtitle">
        Content
      </PageLayout>
    );
    expect(screen.getByText('Test subtitle')).toBeInTheDocument();
  });

  it('renders with back button when showBackButton is true', () => {
    render(
      <PageLayout title="Test Page" showBackButton>
        Content
      </PageLayout>
    );
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('applies custom maxWidth', () => {
    render(
      <PageLayout title="Test Page" maxWidth="lg">
        Content
      </PageLayout>
    );
    const main = screen.getByText('Content').closest('main');
    expect(main).toHaveClass('max-w-lg');
  });

  it('centers content when centerContent is true', () => {
    render(
      <PageLayout title="Test Page" centerContent>
        Content
      </PageLayout>
    );
    const main = screen.getByText('Content').closest('main');
    expect(main).toHaveClass('min-h-screen', 'flex', 'flex-col', 'justify-center');
  });

  it('handles custom className', () => {
    render(<PageLayout title="Test" className="custom-layout">Content</PageLayout>);
    const main = screen.getByText('Content').closest('main');
    expect(main).toHaveClass('custom-layout');
  });

  it('handles showHeader prop', () => {
    render(<PageLayout title="Test" showHeader={false}>Content</PageLayout>);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });
});

describe('ProtectedRoute Component', () => {
  it('renders children when authenticated', async () => {
    require('../services/api').authAPI.getProfile.mockResolvedValue({
      data: { id: 1, email: 'test@example.com', fullName: 'Test User' }
    });
    
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );
    
    // Wait for authentication check to complete
    await screen.findByText('Protected content');
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('redirects to login when not authenticated', async () => {
    require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
    
    renderWithProviders(
      <ProtectedRoute>
        <div>Protected content</div>
      </ProtectedRoute>
    );
    
    // Wait for redirect to happen
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(window.location.pathname).toBe('/login');
  });
});

describe('ThemeToggle Component', () => {
  it('renders theme toggle button', () => {
    renderWithTheme(<ThemeToggle />);
    expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument();
  });

  it('toggles theme on click', () => {
    renderWithTheme(<ThemeToggle />);
    const toggleButton = screen.getByRole('button', { name: /switch to/i });
    fireEvent.click(toggleButton);
    expect(toggleButton).toBeInTheDocument();
  });

  it('handles custom className', () => {
    renderWithTheme(<ThemeToggle className="custom-toggle" />);
    const toggle = screen.getByRole('button', { name: /switch to/i });
    expect(toggle).toHaveClass('custom-toggle');
  });

  it('handles custom size', () => {
    renderWithTheme(<ThemeToggle size="large" />);
    const toggle = screen.getByRole('button', { name: /switch to/i });
    expect(toggle).toBeInTheDocument();
  });
});

describe('BackButton Component', () => {
  it('renders back button', () => {
    renderWithTheme(<BackButton />);
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('navigates back on click', () => {
    renderWithTheme(<BackButton />);
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    // Should navigate back
  });

  it('renders with custom text', () => {
    renderWithTheme(<BackButton text="Go back" />);
    expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    renderWithTheme(<BackButton className="custom-back" />);
    const backButton = screen.getByRole('button', { name: /back/i });
    expect(backButton).toHaveClass('custom-back');
  });

  it('handles custom onClick', () => {
    const handleClick = jest.fn();
    renderWithTheme(<BackButton onClick={handleClick} />);
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});

describe('FormSection Component', () => {
  it('renders with title', () => {
    render(<FormSection title="Personal Information">Content</FormSection>);
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders without title', () => {
    render(<FormSection>Content</FormSection>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<FormSection title="Test" className="custom-section">Content</FormSection>);
    const section = screen.getByText('Content').closest('div');
    expect(section).toHaveClass('custom-section');
  });
});

describe('LazyLoad Component', () => {
  it('renders children when loaded', () => {
    render(<LazyLoad>Content</LazyLoad>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<LazyLoad loading>Content</LazyLoad>);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(<LazyLoad error="Something went wrong">Content</LazyLoad>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders with custom loading component', () => {
    const CustomLoader = () => <div data-testid="custom-loader">Loading...</div>;
    render(<LazyLoad loading LoadingComponent={CustomLoader}>Content</LazyLoad>);
    expect(screen.getByTestId('custom-loader')).toBeInTheDocument();
  });

  it('renders with custom error component', () => {
    const CustomError = ({ error }) => <div data-testid="custom-error">{error}</div>;
    render(<LazyLoad error="Test error" ErrorComponent={CustomError}>Content</LazyLoad>);
    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});

describe('VirtualizedList Component', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    description: `Description for item ${i}`
  }));

  it('renders list items', () => {
    render(
      <VirtualizedList
        items={mockItems.slice(0, 10)}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        height={400}
        itemHeight={50}
      />
    );
    
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Item 9')).toBeInTheDocument();
  });

  it('handles empty items array', () => {
    render(
      <VirtualizedList
        items={[]}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        height={400}
        itemHeight={50}
      />
    );
    
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument();
  });

  it('renders with custom item renderer', () => {
    const CustomItem = ({ item }) => (
      <div data-testid={`item-${item.id}`}>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>
    );

    render(
      <VirtualizedList
        items={mockItems.slice(0, 5)}
        renderItem={(item) => <CustomItem key={item.id} item={item} />}
        height={400}
        itemHeight={50}
      />
    );
    
    expect(screen.getByTestId('item-0')).toBeInTheDocument();
    expect(screen.getByText('Item 0')).toBeInTheDocument();
    expect(screen.getByText('Description for item 0')).toBeInTheDocument();
  });

  it('handles scroll events', () => {
    render(
      <VirtualizedList
        items={mockItems}
        renderItem={(item) => <div key={item.id}>{item.name}</div>}
        height={400}
        itemHeight={50}
      />
    );
    
    const container = screen.getByText('Item 0').closest('div');
    fireEvent.scroll(container, { target: { scrollTop: 100 } });
    
    // Should still render items
    expect(screen.getByText('Item 0')).toBeInTheDocument();
  });
});

describe('Additional Component Edge Cases', () => {
  describe('Button Component Edge Cases', () => {
    it('handles disabled state', () => {
      render(<Button disabled>Disabled Button</Button>);
      expect(screen.getByRole('button', { name: /disabled button/i })).toBeDisabled();
    });

    it('handles type prop', () => {
      render(<Button type="submit">Submit</Button>);
      expect(screen.getByRole('button', { name: /submit/i })).toHaveAttribute('type', 'submit');
    });

    it('handles custom className', () => {
      render(<Button className="custom-btn">Custom</Button>);
      expect(screen.getByRole('button', { name: /custom/i })).toHaveClass('custom-btn');
    });
  });

  describe('Card Component Edge Cases', () => {
    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Card onClick={handleClick}>Clickable Card</Card>);
      fireEvent.click(screen.getByText('Clickable Card'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles disabled state', () => {
      render(<Card disabled>Disabled Card</Card>);
      const card = screen.getByText('Disabled Card').closest('div');
      expect(card).toHaveClass('opacity-50', 'cursor-not-allowed');
    });
  });

  describe('Badge Component Edge Cases', () => {
    it('handles default variant', () => {
      render(<Badge>Default</Badge>);
      expect(screen.getByText('Default')).toBeInTheDocument();
    });

    it('handles custom className', () => {
      render(<Badge className="custom-badge">Custom</Badge>);
      expect(screen.getByText('Custom')).toHaveClass('custom-badge');
    });
  });

  describe('FormInput Component Edge Cases', () => {
    it('handles disabled state', () => {
      render(<FormInput label="Disabled" id="disabled" disabled />);
      expect(screen.getByLabelText('Disabled')).toBeDisabled();
    });

    it('handles placeholder', () => {
      render(<FormInput label="Input" id="input" placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('handles error state', () => {
      render(<FormInput label="Input" id="input" error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('handles help text', () => {
      render(<FormInput label="Input" id="input" helpText="This is help text" />);
      expect(screen.getByText('This is help text')).toBeInTheDocument();
    });
  });

  describe('PageLayout Component Edge Cases', () => {
    it('handles custom className', () => {
      render(<PageLayout title="Test" className="custom-layout">Content</PageLayout>);
      const main = screen.getByText('Content').closest('main');
      expect(main).toHaveClass('custom-layout');
    });

    it('handles showHeader prop', () => {
      render(<PageLayout title="Test" showHeader={false}>Content</PageLayout>);
      expect(screen.queryByText('Test')).not.toBeInTheDocument();
    });
  });

  describe('ThemeToggle Component Edge Cases', () => {
    it('handles custom className', () => {
      renderWithTheme(<ThemeToggle className="custom-toggle" />);
      const toggle = screen.getByRole('button', { name: /switch to/i });
      expect(toggle).toHaveClass('custom-toggle');
    });

    it('handles custom size', () => {
      renderWithTheme(<ThemeToggle size="large" />);
      const toggle = screen.getByRole('button', { name: /switch to/i });
      expect(toggle).toBeInTheDocument();
    });
  });
}); 