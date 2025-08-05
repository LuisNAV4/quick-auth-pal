
import React from 'react';

const AboutSection = () => {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-600 mb-4">¿Quiénes somos?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Marketing Ágil nació de la necesidad de aplicar metodologías ágiles específicamente para 
            equipos de marketing, permitiendo maximizar resultados y minimizar desperdicios.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=600&h=400&fit=crop&crop=center" 
              alt="Equipo de marketing digital trabajando con datos y análisis" 
              className="rounded-lg shadow-lg w-full"
            />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-blue-600 mb-6">Nuestra misión</h3>
            <p className="text-gray-600 mb-6">
              Potenciar equipos de marketing con herramientas y metodologías ágiles que les permitan 
              gestionar proyectos de ROI en las campañas del mercado y maximizar el impacto de las campañas.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Enfocados en resultados</h4>
                  <p className="text-sm text-gray-600">Metodologías diseñadas para campañas de marketing</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Adaptabilidad</h4>
                  <p className="text-sm text-gray-600">Nos adaptamos a las necesidades cambiantes del mercado</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                  <span className="text-blue-600 text-xs">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Mejora continua</h4>
                  <p className="text-sm text-gray-600">Optimizamos procesos continuamente para mayor eficiencia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
