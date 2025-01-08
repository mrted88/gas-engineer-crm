interface LoginCredentials {
    email: string;
    password: string;
  }
  
  interface LoginResponse {
    token: string;
    user?: {
      id: string;
      email: string;
      name?: string;
    };
  }
  
  class AuthService {
    private baseUrl = import.meta.env.VITE_API_URL || '/api';
  
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
      try {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
        });
  
        if (!response.ok) {
          throw new Error('Login failed');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Auth service login error:', error);
        throw error;
      }
    }
  
    async logout(): Promise<void> {
      localStorage.removeItem('token');
    }
  
    isAuthenticated(): boolean {
      return !!localStorage.getItem('token');
    }
  }
  
  export const authService = new AuthService();