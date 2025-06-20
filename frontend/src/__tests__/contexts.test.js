// import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

// Mock API
jest.mock('../services/api', () => ({
  authAPI: {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Test component to use auth context
const TestAuthComponent = () => {
  const { user, loading, error, login, register, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'No user'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={() => register({ name: 'Test', email: 'test@example.com', password: 'password' })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

// Test component to use theme context
const TestThemeComponent = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  return (
    <div>
      <div data-testid="theme-mode">{isDarkMode ? 'dark' : 'light'}</div>
      <button onClick={toggleDarkMode}>Toggle Theme</button>
    </div>
  );
};

const renderWithAuth = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

// describe('AuthContext', () => {
//   beforeEach(() => {
//     localStorageMock.clear();
//     jest.clearAllMocks();
//   });

//   it('provides initial state', () => {
//     require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
//     renderWithAuth(<TestAuthComponent />);
//     
//     expect(screen.getByTestId('user')).toHaveTextContent('No user');
//     expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
//     expect(screen.getByTestId('error')).toHaveTextContent('No error');
//   });

//   it('handles successful authentication check', async () => {
//     const mockUser = { id: 1, email: 'test@example.com', fullName: 'Test User' };
//     require('../services/api').authAPI.getProfile.mockResolvedValue({ data: mockUser });
//     
//     renderWithAuth(<TestAuthComponent />);
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
//       expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
//     });
//   });

//   it('handles failed authentication check', async () => {
//     require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
//     
//     renderWithAuth(<TestAuthComponent />);
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('user')).toHaveTextContent('No user');
//       expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
//     });
//   });

//   it('handles successful login', async () => {
//     require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
//     const mockLogin = require('../services/api').authAPI.login;
//     const mockUser = { id: 1, email: 'test@example.com', fullName: 'Test User' };
//     
//     mockLogin.mockResolvedValue({ data: { user: mockUser, accessToken: 'token' } });
//     require('../services/api').authAPI.getProfile.mockResolvedValue({ data: mockUser });
//     
//     renderWithAuth(<TestAuthComponent />);
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
//     });
//     
//     const loginButton = screen.getByText('Login');
//     fireEvent.click(loginButton);
//     
//     await waitFor(() => {
//       expect(mockLogin).toHaveBeenCalledWith({
//         email: 'test@example.com',
//         password: 'password'
//       });
//     });
//   });

//   it('handles failed login', async () => {
//     require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
//     const mockLogin = require('../services/api').authAPI.login;
//     
//     mockLogin.mockRejectedValue({
//       response: { data: { error: 'Invalid credentials' } }
//     });
//     
//     renderWithAuth(<TestAuthComponent />);
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
//     });
//     
//     const loginButton = screen.getByText('Login');
//     fireEvent.click(loginButton);
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('error')).toHaveTextContent('Invalid credentials');
//     });
//   });

//   it('handles successful registration', async () => {
//     require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
//     const mockRegister = require('../services/api').authAPI.register;
//     const mockUser = { id: 1, email: 'test@example.com', fullName: 'Test User' };
//     
//     mockRegister.mockResolvedValue({ data: { user: mockUser, accessToken: 'token' } });
//     require('../services/api').authAPI.getProfile.mockResolvedValue({ data: mockUser });
//     
//     renderWithAuth(<TestAuthComponent />);
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
//     });
//     
//     const registerButton = screen.getByText('Register');
//     fireEvent.click(registerButton);
//     
//     await waitFor(() => {
//       expect(mockRegister).toHaveBeenCalledWith({
//         name: 'Test',
//         email: 'test@example.com',
//         password: 'password'
//       });
//     });
//   });

//   it('handles failed registration', async () => {
//     require('../services/api').authAPI.getProfile.mockRejectedValue(new Error('Not authenticated'));
//     const mockRegister = require('../services/api').authAPI.register;
//     
//     mockRegister.mockRejectedValue({
//       response: { data: { error: 'Email already exists' } }
//     });
//     
//     renderWithAuth(<TestAuthComponent />);
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
//     });
//     
//     const registerButton = screen.getByText('Register');
//     fireEvent.click(registerButton);
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('error')).toHaveTextContent('Email already exists');
//     });
//   });

//   it('handles logout', async () => {
//     const mockUser = { id: 1, email: 'test@example.com', fullName: 'Test User' };
//     require('../services/api').authAPI.getProfile.mockResolvedValue({ data: mockUser });
//     const mockLogout = require('../services/api').authAPI.logout;
//     mockLogout.mockResolvedValue({});
//     
//     renderWithAuth(<TestAuthComponent />);
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
//     });
//     
//     const logoutButton = screen.getByText('Logout');
//     fireEvent.click(logoutButton);
//     
//     await waitFor(() => {
//       expect(mockLogout).toHaveBeenCalled();
//       expect(screen.getByTestId('user')).toHaveTextContent('No user');
//     });
//   });

//   it('handles auth error event', async () => {
//     const mockUser = { id: 1, email: 'test@example.com', fullName: 'Test User' };
//     require('../services/api').authAPI.getProfile.mockResolvedValue({ data: mockUser });
//     
//     renderWithAuth(<TestAuthComponent />);
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
//     });
//     
//     // Simulate auth error event
//     act(() => {
//       window.dispatchEvent(new Event('auth-error'));
//     });
//     
//     await waitFor(() => {
//       expect(screen.getByTestId('user')).toHaveTextContent('No user');
//     });
//   });

//   it('throws error when used outside provider', () => {
//     // Suppress console.error for this test
//     const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
//     
//     expect(() => {
//       render(<TestAuthComponent />);
//     }).toThrow('useAuth must be used within an AuthProvider');
//     
//     consoleSpy.mockRestore();
//   });
// });

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  it('provides initial light theme state', () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderWithTheme(<TestThemeComponent />);
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('loads theme from localStorage', () => {
    localStorageMock.getItem.mockReturnValue('true');
    renderWithTheme(<TestThemeComponent />);
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
  });

  it('handles invalid localStorage value', () => {
    localStorageMock.getItem.mockReturnValue('invalid');
    renderWithTheme(<TestThemeComponent />);
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('toggles theme on button click', () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderWithTheme(<TestThemeComponent />);
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
    
    const toggleButton = screen.getByText('Toggle Theme');
    fireEvent.click(toggleButton);
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  it('saves theme preference to localStorage', () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderWithTheme(<TestThemeComponent />);
    
    const toggleButton = screen.getByText('Toggle Theme');
    fireEvent.click(toggleButton);
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith('darkMode', 'true');
  });

  it('applies dark theme to document', () => {
    localStorageMock.getItem.mockReturnValue('true');
    renderWithTheme(<TestThemeComponent />);
    
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark theme from document', () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderWithTheme(<TestThemeComponent />);
    
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('handles system preference', () => {
    localStorageMock.getItem.mockReturnValue(null);
    window.matchMedia.mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
    
    renderWithTheme(<TestThemeComponent />);
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestThemeComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleSpy.mockRestore();
  });

  it('handles localStorage errors gracefully', () => {
    localStorageMock.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });
    
    renderWithTheme(<TestThemeComponent />);
    
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('light');
  });

  it('handles setItem errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('setItem error');
    });
    
    renderWithTheme(<TestThemeComponent />);
    
    const toggleButton = screen.getByText('Toggle Theme');
    fireEvent.click(toggleButton);
    
    // Should not crash and should still toggle theme
    expect(screen.getByTestId('theme-mode')).toHaveTextContent('dark');
  });
}); 