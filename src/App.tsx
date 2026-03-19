import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ChevronRight, 
  Heart,
  Church
} from 'lucide-react';
import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';
import { RegistrationForm } from './components/RegistrationForm';
import { AdminPanel } from './components/Admin';
import { AdminLogin } from './components/Admin/AdminLogin';
import { EventType, UserRole, Profile } from './types';
import { supabase } from './lib/supabase';
import { getUserProfile, logout, getCurrentSession } from './services/authService';
import { useEffect } from 'react';

type View = 'HOME' | 'CHOICE' | 'LOGIN' | 'REGISTRATION' | 'ADMIN_PANEL' | 'EJC_PANEL' | 'ECC_PANEL' | 'ADMIN_LOGIN';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('HOME');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Redirecionamento baseado no perfil
  const redirectByProfile = (profile: Profile) => {
    if (profile.tipo_permissao === 'admin_geral') {
      setCurrentView('ADMIN_PANEL');
    } else if (profile.tipo_permissao === 'ejc') {
      setCurrentView('EJC_PANEL');
    } else if (profile.tipo_permissao === 'ecc') {
      setCurrentView('ECC_PANEL');
    }
  };

  // Verifica sessão ao carregar e monitora mudanças
  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          if (profile) {
            if (!profile.ativo) {
              alert('Sua conta está inativa. Entre em contato com o administrador.');
              await logout();
              return;
            }
            setCurrentUser(session.user);
            setAdminProfile(profile);
            // Só redireciona se estiver na HOME ou LOGIN
            if (currentView === 'HOME' || currentView === 'LOGIN' || currentView === 'ADMIN_LOGIN') {
              redirectByProfile(profile);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão inicial:', error);
      } finally {
        setIsAuthChecking(false);
      }
    };

    checkSession();

    // Listener para mudanças de auth (Login, Logout, Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          if (!profile.ativo) {
            alert('Sua conta está inativa. Entre em contato com o administrador.');
            await logout();
            return;
          }
          setCurrentUser(session.user);
          setAdminProfile(profile);
          
          // Só redireciona automaticamente se o evento for SIGNED_IN (login explícito)
          // ou se estivermos em uma tela de login/home com uma sessão válida
          if (event === 'SIGNED_IN' || currentView === 'HOME' || currentView === 'LOGIN' || currentView === 'ADMIN_LOGIN') {
            redirectByProfile(profile);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setAdminProfile(null);
        setCurrentView('HOME');
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]); // Adicionado currentView como dependência para controle de redirecionamento

  const handleLoginClick = (role: UserRole) => {
    if (role === 'ADMIN') {
      setCurrentView('ADMIN_LOGIN');
    } else {
      setSelectedRole(role);
      setCurrentView('LOGIN');
    }
  };

  const handleRegistrationClick = (type: EventType) => {
    setSelectedEventType(type);
    setCurrentView('REGISTRATION');
  };

  const handleLoginSuccess = (user: any, profile?: Profile) => {
    setCurrentUser(user);
    if (profile) {
      setAdminProfile(profile);
      redirectByProfile(profile);
    } else {
      // Caso padrão se não houver perfil (não deve acontecer com a lógica atual)
      setCurrentView('HOME');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const handleBackToPanel = () => {
    if (adminProfile) {
      redirectByProfile(adminProfile);
    } else {
      setCurrentView('HOME');
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-church-creme flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-church-brown-dark"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-church-creme font-sans text-church-brown-dark">
      {/* Navbar Minimalista */}
      <nav className="bg-white border-b border-church-bege/30 py-4 px-6 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => currentView !== 'DASHBOARD' && setCurrentView('HOME')}
          >
            <div className="bg-church-brown-dark p-2 rounded-xl shadow-md">
              <Church className="text-church-gold" size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif font-bold tracking-tight text-church-brown-dark leading-none">Paróquia de São Francisco das Chagas</span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-church-gold mt-1">Comunidade e Fé</span>
            </div>
          </div>
          
          {currentView === 'HOME' && (
            <button 
              onClick={() => handleLoginClick('ADMIN')}
              className="p-2 text-church-brown-medium hover:text-church-gold transition-colors"
              title="Acesso Administrador"
            >
              <Shield size={20} />
            </button>
          )}
        </div>
      </nav>

      <main className="py-12 px-4">
        <AnimatePresence mode="wait">
          {currentView === 'HOME' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-20">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="inline-block p-5 bg-white rounded-full mb-8 shadow-xl border border-church-gold/20"
                >
                  <Church className="text-church-brown-dark" size={40} />
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-serif font-bold text-church-brown-dark mb-6 tracking-tight leading-tight">
                  Paróquia de São Francisco das Chagas
                </h1>
                <p className="text-xl text-church-brown-medium max-w-2xl mx-auto leading-relaxed italic font-serif">
                  "Senhor, fazei-me instrumento de vossa paz."
                </p>
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-church-gold to-transparent mx-auto mt-10"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <HomeCard 
                  title="EJC"
                  description="Acesso exclusivo para a coordenação do Encontro de Jovens com Cristo."
                  icon={<Shield className="text-church-brown-dark" size={32} />}
                  onClick={() => handleLoginClick('COORDINATOR_EJC')}
                  accentColor="brown"
                />
                <HomeCard 
                  title="ECC"
                  description="Acesso exclusivo para a coordenação do Encontro de Casais com Cristo."
                  icon={<Shield className="text-church-brown-dark" size={32} />}
                  onClick={() => handleLoginClick('COORDINATOR_ECC')}
                  accentColor="brown"
                />
                <HomeCard 
                  title="Encontrista"
                  description="Clique aqui para iniciar seu cadastro em um de nossos encontros paroquiais."
                  icon={<UserPlus className="text-church-gold" size={32} />}
                  onClick={() => setCurrentView('CHOICE')}
                  accentColor="gold"
                />
              </div>
            </motion.div>
          )}

          {currentView === 'CHOICE' && (
            <motion.div 
              key="choice"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto text-center"
            >
              <h2 className="text-4xl font-serif font-bold text-church-brown-dark mb-8">Escolha seu Encontro</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <HomeCard 
                  title="EJC"
                  description="Encontro de Jovens com Cristo"
                  icon={<Heart className="text-church-brown-dark" size={28} />}
                  onClick={() => handleRegistrationClick('ejc')}
                  accentColor="brown"
                />
                <HomeCard 
                  title="ECC"
                  description="Encontro de Casais com Cristo"
                  icon={<Heart className="text-church-gold" size={28} />}
                  onClick={() => handleRegistrationClick('ecc')}
                  accentColor="gold"
                />
              </div>
              <button 
                onClick={() => setCurrentView('HOME')}
                className="mt-12 text-church-brown-medium font-bold hover:text-church-gold transition-colors flex items-center justify-center mx-auto group"
              >
                <ChevronRight size={18} className="rotate-180 mr-2 group-hover:-translate-x-1 transition-transform" />
                Voltar ao Início
              </button>
            </motion.div>
          )}

          {currentView === 'LOGIN' && selectedRole && (
            <LoginForm 
              key="login"
              role={selectedRole} 
              onBack={() => setCurrentView('HOME')} 
              onLoginSuccess={handleLoginSuccess}
            />
          )}

          {currentView === 'REGISTRATION' && selectedEventType && (
            <RegistrationForm 
              key="registration"
              eventType={selectedEventType} 
              onBack={handleBackToPanel} 
            />
          )}

          {(currentView === 'ADMIN_PANEL' || currentView === 'EJC_PANEL' || currentView === 'ECC_PANEL') && currentUser && (
            <AdminPanel 
              key="admin"
              user={currentUser} 
              profile={adminProfile}
              onLogout={handleLogout} 
              onNewRegistration={handleRegistrationClick}
            />
          )}

          {currentView === 'ADMIN_LOGIN' && (
            <AdminLogin 
              onLoginSuccess={handleLoginSuccess}
              onBack={() => setCurrentView('HOME')}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="py-12 text-center text-church-brown-medium/60 text-sm border-t border-church-bege/20 mt-20">
        <p>© 2026 Paróquia de São Francisco das Chagas. Desenvolvido com fé e tecnologia.</p>
      </footer>
    </div>
  );
}

interface HomeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  accentColor: 'brown' | 'gold';
}

const HomeCard: React.FC<HomeCardProps> = ({ title, description, icon, onClick, accentColor }) => {
  const colors = {
    brown: 'hover:border-church-brown-dark hover:shadow-church-brown-dark/10 bg-white',
    gold: 'hover:border-church-gold hover:shadow-church-gold/10 bg-white',
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`p-8 rounded-3xl border-2 border-transparent shadow-xl shadow-church-brown-dark/5 cursor-pointer transition-all flex flex-col items-center text-center group ${colors[accentColor]}`}
    >
      <div className={`mb-6 p-5 rounded-2xl shadow-inner transition-transform group-hover:scale-110 ${accentColor === 'brown' ? 'bg-church-creme' : 'bg-church-bege/20'}`}>
        {icon}
      </div>
      <h3 className="text-2xl font-serif font-bold text-church-brown-dark mb-3">{title}</h3>
      <p className="text-church-brown-medium text-sm leading-relaxed mb-8">{description}</p>
      <div className={`mt-auto flex items-center text-sm font-bold uppercase tracking-widest transition-all ${accentColor === 'brown' ? 'text-church-brown-dark group-hover:text-church-gold' : 'text-church-gold group-hover:text-church-brown-dark'}`}>
        Acessar <ChevronRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </motion.div>
  );
}
