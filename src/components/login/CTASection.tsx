
import React from 'react';

interface CTASectionProps {
  onStartNowClick: () => void;
}

const CTASection = ({ onStartNowClick }: CTASectionProps) => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">
          ¿Listo para transformar tu equipo de marketing?
        </h2>
        <p className="text-lg mb-8 opacity-90">
          Únete a los equipos que ya están optimizando sus resultados con Marketing Ágil
        </p>
        <button 
          onClick={onStartNowClick}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
        >
          Comenzar ahora
        </button>
      </div>
    </section>
  );
};

export default CTASection;
