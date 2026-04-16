import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { EnvValidator } from '@/lib/envValidation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate environment on mount
  useEffect(() => {
    try {
      EnvValidator.getEnvConfig();
      if (EnvValidator.isDevelopment()) {
        console.log('Environment validation passed');
      }
    } catch (error) {
      console.error('Environment validation failed:', error.message);
      // Don't block app in development, just log the error
    }
  }, []);

  useEffect(() => {
    // onAuthStateChange fires immediately with the current session (INITIAL_SESSION event),
    // so getSession() is redundant and causes a double-set race condition.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Validate inputs
      const emailValidation = EnvValidator.validateEmail(email);
      const passwordValidation = EnvValidator.validatePassword(password);
      const usernameValidation = EnvValidator.validateUsername(username);
      
      if (!emailValidation.valid || !passwordValidation.valid || !usernameValidation.valid) {
        const errorMessage = [
          emailValidation.message,
          passwordValidation.message,
          usernameValidation.message
        ].filter(Boolean).join('; ');
        
        if (EnvValidator.isDevelopment()) {
          console.error('Validation failed:', errorMessage);
        }
        
        return { error: new Error(errorMessage) };
      }
      
      // Log signup attempt in development only
      if (EnvValidator.isDevelopment()) {
        console.log('Signup attempt:', { 
          email, 
          username, 
          passwordLength: password.length,
          emailValid: emailValidation.valid,
          passwordValid: passwordValidation.valid,
          usernameValid: usernameValidation.valid
        });
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      
      if (EnvValidator.isDevelopment()) {
        console.log('Signup response:', { data, error });
      }
      
      if (error) {
        // Classify error type
        let errorMessage = 'Ro\'yxatdan o\'tishda xatolik yuz berdi';
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'Bu email allaqachon ro\'yxatdan o\'tgan. Iltimos boshqa urinib ko\'ring.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Email noto\'g\'ri formatda.';
        } else if (error.message.includes('weak_password')) {
          errorMessage = 'Parol juda oddiy. Kamida 8 ta belgi, harf va raqam bo\'lishi kerak.';
        }
        
        if (EnvValidator.isDevelopment()) {
          console.error('Supabase signup error:', error);
        }
        
        return { error: new Error(errorMessage) };
      }
      
      return { error: null };
    } catch (err) {
      if (EnvValidator.isDevelopment()) {
        console.error('Kutilmagan signup xatosi:', err);
      }
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Log signin attempt in development only
      if (import.meta.env.DEV) {
        console.log('Signin attempt:', { email, passwordLength: password.length });
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (import.meta.env.DEV) {
        console.log('Signin response:', { data, error });
      }
      
      if (error) {
        // Use proper error handling
        if (import.meta.env.DEV) {
          console.error('Supabase tizimga kirish xatosi:', error);
        }
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      // Use proper error handling
      if (import.meta.env.DEV) {
        console.error('Kutilmagan tizimga kirish xatosi:', err);
      }
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth faqat AuthProvider ichida ishlatilishi kerak');
  return context;
};
