
import React, { useState } from 'react';

interface FeaturesSectionProps {
  onLoginSubmit: (email: string, password: string, name?: string, userType?: string, jobTitle?: string) => void;
  onToggleMode: () => void;
  isSignup: boolean;
}

const FeaturesSection = ({ onLoginSubmit, onToggleMode, isSignup }: FeaturesSectionProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [userType, setUserType] = useState("director");
  const [jobTitle, setJobTitle] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = isSignup ? `${firstName} ${lastName}` : "";
    onLoginSubmit(email, password, fullName, userType, jobTitle);
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
              Potencia tu equipo de marketing
            </h2>
            <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
              Marketing Ágil te permite gestionar proyectos, mejorar la colaboración y alcanzar resultados excepcionales con metodologías orientadas específicamente para equipos de marketing.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-xs">✓</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Metodologías Ágiles</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Implementa Kanban, Scrum y otras metodologías para mejorar la eficiencia del equipo.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-xs">👥</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Gestión de Equipos</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Coordina equipos de marketing con herramientas de comunicación integradas.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-xs">📊</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Organización Visual</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Visualiza el progreso de tus campañas con tableros Kanban intuitivos.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 text-xs">📈</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">Análisis Detallados</h3>
                </div>
                <p className="text-sm text-gray-600">
                  Cada miembro puede visualizar sus habilidades y experiencia en marketing.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 order-first lg:order-last">
            <div className="bg-blue-600 text-white p-3 sm:p-4 rounded-t-lg text-center">
              <h3 className="font-bold text-sm sm:text-base">Marketing Ágil</h3>
              <p className="text-xs sm:text-sm opacity-90">Accede a tu plataforma de gestión</p>
            </div>
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="flex gap-4">
                <button 
                  onClick={onToggleMode}
                  className={`flex-1 text-center py-2 font-medium ${
                    !isSignup 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button 
                  onClick={onToggleMode}
                  className={`flex-1 text-center py-2 font-medium ${
                    isSignup 
                      ? 'text-blue-600 border-b-2 border-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Registrarse
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Nombre
                        </label>
                        <input 
                          type="text" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tu nombre"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Apellido
                        </label>
                        <input 
                          type="text" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tu apellido"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Foto de perfil
                      </label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico
                  </label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu correo"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                </div>
                
                {isSignup && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de usuario
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="userType"
                            value="director"
                            checked={userType === "director"}
                            onChange={(e) => setUserType(e.target.value)}
                            className="text-blue-600"
                          />
                          <span className="text-sm">Director de equipo</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input 
                            type="radio" 
                            name="userType"
                            value="integrante"
                            checked={userType === "integrante"}
                            onChange={(e) => setUserType(e.target.value)}
                            className="text-blue-600"
                          />
                          <span className="text-sm">Integrante de equipo</span>
                        </label>
                      </div>
                    </div>
                    
                    {userType === "integrante" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rol dentro del equipo
                        </label>
                        <input 
                          type="text" 
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ej. Diseñador gráfico, Community Manager, etc."
                          required
                        />
                      </div>
                    )}
                  </>
                )}
                
                {!isSignup && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input 
                        type="checkbox" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded"
                      />
                      Recordarme
                    </label>
                    <button 
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
                
                <button 
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  {isSignup ? 'Registrarse' : 'Iniciar sesión'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
