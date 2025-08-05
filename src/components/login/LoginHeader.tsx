
import React from 'react';

interface LoginHeaderProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

const LoginHeader = ({ onLoginClick, onSignupClick }: LoginHeaderProps) => {
  const handleAboutClick = () => {
    const aboutSection = document.querySelector('[data-section="about"]');
    aboutSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBenefitsClick = () => {
    const benefitsSection = document.querySelector('[data-section="benefits"]');
    benefitsSection?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">M</span>
        </div>
        <span className="font-bold text-lg text-gray-900">Marketing Ágil</span>
      </div>
      <nav className="flex items-center gap-8">
        <button 
          onClick={onLoginClick}
          className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          Iniciar Sesión
        </button>
        <button 
          onClick={onSignupClick}
          className="text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
        >
          Registrarse
        </button>
        <button 
          onClick={handleAboutClick}
          className="text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
        >
          ¿Quiénes somos?
        </button>
        <button 
          onClick={handleBenefitsClick}
          className="text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
        >
          Beneficios
        </button>
      </nav>
    </header>
  );
};

export default LoginHeader;
