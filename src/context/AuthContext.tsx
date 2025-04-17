import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserRole, User, Student, MessAuthority, HostelOffice } from '../types';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | Student | MessAuthority | HostelOffice | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<Student>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | Student | MessAuthority | HostelOffice | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const DEMO_CREDENTIALS = {
    student: {
      email: 'demo.student@hostel.com',
      password: 'student123',
      role: 'student' as UserRole
    },
    mess: {
      email: 'demo.mess@hostel.com', 
      password: 'mess123',
      role: 'mess' as UserRole
    },
    office: {
      email: 'hosteloffice@mescoe.pune',
      password: 'office123', 
      role: 'office' as UserRole
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('hostelUser');
    const storedRole = localStorage.getItem('hostelUserRole');
    
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole as UserRole);
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, userRole: UserRole) => {
    setIsLoading(true);
    
    try {
      const matchingDemo = Object.values(DEMO_CREDENTIALS).find(
        demo => 
          demo.email === email && 
          demo.password === password && 
          demo.role === userRole
      );

      if (!matchingDemo) {
        throw new Error('Invalid credentials');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      let userData: User | Student | MessAuthority | HostelOffice;
      
      switch(userRole) {
        case 'student':
          userData = {
            id: '1',
            name: 'Mukesh Das',
            email,
            role: 'student',
            roomNumber: 'A-101',
            rollNumber: 'ST12345',
            parentContact: '+91 9769884860',
          };
          break;
        case 'mess':
          userData = {
            id: '2',
            name: 'Mess Manager',
            email,
            role: 'mess',
            designation: 'Head Chef',
          };
          break;
        case 'office':
          userData = {
            id: '3',
            name: 'Hostel Warden',
            email,
            role: 'office',
            designation: 'Chief Warden',
            contactNumber: '9067572205'
          };
          break;
      }
      
      localStorage.setItem('hostelUser', JSON.stringify(userData));
      localStorage.setItem('hostelUserRole', userRole);
      
      setUser(userData);
      setRole(userRole);
      setIsAuthenticated(true);
      
      toast({
        title: "Login successful",
        description: `Welcome back, demo ${userRole} account!`,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hostelUser');
    localStorage.removeItem('hostelUserRole');
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const register = async (userData: Partial<Student>) => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (!userData.email || !userData.name) {
        throw new Error('Email and name are required');
      }
      
      toast({
        title: "Registration successful",
        description: "Your account has been created. You can now log in.",
      });
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
