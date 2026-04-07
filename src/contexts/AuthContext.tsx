import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => { subscription.unsubscribe(); };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      console.log('Signup attempt:', { email, username, passwordLength: password.length });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      
      console.log('Signup response:', { data, error });
      
      if (error) {
        console.error('Supabase signup error:', error);
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Unexpected signup error:', err);
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signin attempt:', { email, passwordLength: password.length });
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log('Signin response:', { data, error });
      
      if (error) {
        console.error('Supabase signin error:', error);
        return { error };
      }
      
      return { error: null };
    } catch (err) {
      console.error('Unexpected signin error:', err);
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
