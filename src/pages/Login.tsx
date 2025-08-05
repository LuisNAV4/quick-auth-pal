
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import LoginHeader from "../components/login/LoginHeader";
import HeroSection from "../components/login/HeroSection";
import FeaturesSection from "../components/login/FeaturesSection";
import AboutSection from "../components/login/AboutSection";
import BenefitsSection from "../components/login/BenefitsSection";
import CTASection from "../components/login/CTASection";
import LoginFooter from "../components/login/LoginFooter";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleSubmit = async (email: string, password: string, name?: string, userType?: string, jobTitle?: string) => {
    setError("");
    
    try {
      if (isSignup) {
        await signup(email, password, name || "");
        toast.success("Cuenta creada exitosamente");
        navigate("/dashboard");
      } else {
        await login(email, password);
        toast.success("Sesión iniciada exitosamente");
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleGetStarted = () => {
    const featuresSection = document.querySelector('[data-section="features"]');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLoginClick = () => {
    setIsSignup(false);
    const featuresSection = document.querySelector('[data-section="features"]');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignupClick = () => {
    setIsSignup(true);
    const featuresSection = document.querySelector('[data-section="features"]');
    featuresSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setError("");
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LoginHeader onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />
      <HeroSection />
      <div data-section="features">
        <FeaturesSection 
          onLoginSubmit={handleSubmit} 
          onToggleMode={toggleMode} 
          isSignup={isSignup} 
        />
      </div>
      <div data-section="about">
        <AboutSection />
      </div>
      <div data-section="benefits">
        <BenefitsSection />
      </div>
      <CTASection onStartNowClick={handleGetStarted} />
      <LoginFooter />
    </div>
  );
};

export default Login;
