
import React from 'react';

const BenefitsSection = () => {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-blue-600 mb-4">Beneficios de Marketing Ágil</h2>
          <p className="text-gray-600">
            Descubre cómo nuestras herramientas pueden transformar la forma en que tu equipo trabaja
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 text-center shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-2xl">👥</span>
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-3">Colaboración Efectiva</h3>
            <p className="text-gray-600 mb-4">
              Facilita la comunicación y el trabajo en equipo con herramientas integradas diseñadas específicamente para marketing
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Chat en tiempo real
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Comentarios en tareas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Menciones y notificaciones
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-3">Gestión Visual</h3>
            <p className="text-gray-600 mb-4">
              Visualiza el progreso y los cuellos de botella con tableros Kanban y gráficos intuitivos que facilitan el seguimiento
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Tableros personalizables
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Informes visuales
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Filtros avanzados
              </li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg p-6 text-center shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-3">Mejora Continua</h3>
            <p className="text-gray-600 mb-4">
              Optimiza procesos y resultados con métricas y herramientas de análisis para evolucionar y mejorar constantemente
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Análisis de rendimiento
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Métricas personalizadas
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                Retroalimentación guidada
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
