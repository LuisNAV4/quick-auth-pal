
import React from 'react';

const LoginFooter = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-lg">Marketing Ágil</span>
        </div>
        <p className="text-gray-400 mb-4">
          Transforma tu forma de trabajar en equipos de marketing con metodologías ágiles
        </p>
        <p className="text-sm text-gray-500">
          © 2024 Marketing Ágil. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default LoginFooter;
