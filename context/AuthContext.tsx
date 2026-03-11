import { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<string | null>;
    signUp: (email: string, password: string, name: string) => Promise<string | null>;
    verifyOtp: (email: string, token: string) => Promise<string | null>;
    resetPassword: (email: string) => Promise<string | null>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load existing session on mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string): Promise<string | null> => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error?.message ?? null;
    };

    const signUp = async (email: string, password: string, name: string): Promise<string | null> => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } },
        });
        return error?.message ?? null;
    };

    const verifyOtp = async (email: string, token: string): Promise<string | null> => {
        const { error } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'signup',
        });
        return error?.message ?? null;
    };

    const resetPassword = async (email: string): Promise<string | null> => {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return error?.message ?? null;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <AuthContext.Provider value={{ session, user, loading, signIn, signUp, verifyOtp, resetPassword, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
