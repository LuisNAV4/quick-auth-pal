
import React from 'react';

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-blue-600 opacity-90"></div>
      <div className="relative max-w-4xl mx-auto text-center">
        <p className="text-xs sm:text-sm mb-3 sm:mb-4 opacity-90">Plataforma de gestión para equipos de marketing</p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
          Transforma tu equipo con<br className="hidden sm:block" />
          <span className="sm:hidden"> </span>metodologías ágiles
        </h1>
        <p className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 opacity-90 max-w-2xl mx-auto px-4">
          Gestiona proyectos, mejora la colaboración y alcanza resultados extraordinarios con Marketing Ágil
        </p>
      </div>
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L50 105C100 90 200 60 300 45C400 30 500 30 600 37.5C700 45 800 60 900 67.5C1000 75 1100 75 1150 75L1200 75V120H1150C1100 120 1000 120 900 120C800 120 700 120 600 120C500 120 400 120 300 120C200 120 100 120 50 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
