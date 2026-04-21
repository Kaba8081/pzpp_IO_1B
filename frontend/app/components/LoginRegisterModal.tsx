import React, { useEffect, useState } from "react";
import { Mail, Eye, EyeOff, X } from "lucide-react";
import { Input } from "./Input";
import { Checkbox } from "./Checkbox";
import { useUserStore } from "@/stores/UserStore";
import { Modal } from "./Modal";
import { Button } from "./Button";
import login_register_banner from "@/images/login_register_banner.jpg"

export const LoginRegisterModal = () => {
  const { currentModal, modal } = useUserStore();
  const [activeTab, setActiveTab] = useState<"LOGIN" | "REGISTER">("LOGIN");
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (currentModal === "login") {
      setActiveTab("LOGIN");
    } else if (currentModal === "register") {
      setActiveTab("REGISTER");
    }
  }, [currentModal]);

  if (currentModal !== "login" && currentModal !== "register") {
    return null;
  }

  return (
    <Modal name={currentModal}>
        <div className="flex flex-col sm:flex-row max-w-4xl overflow-hidden">
        <div className="w-full lg:w-1/2 flex flex-col p-10 text-white">
          
          <header className="flex items-center justify-between mb-10">
            <nav className="flex items-center gap-5">
              <button 
                onClick={() => setActiveTab("LOGIN")}
                className={`pb-2 font-bold font-cinzel text-xs tracking-widest transition-all ${activeTab === 'LOGIN' ? 'text-white border-b-2 border-primary' : 'text-white/50 hover:text-white'}`}
              >
                LOGIN
              </button>
              <button 
                onClick={() => setActiveTab("REGISTER")}
                className={`pb-2 font-bold font-cinzel text-xs tracking-widest transition-all ${activeTab === 'REGISTER' ? 'text-white border-b-2 border-primary' : 'text-white/50 hover:text-white'}`}
              >
                REGISTER
              </button>
            </nav>
            <button onClick={() => modal.close()} className="pb-2 flex items-center gap-2 text-white font-bold font-cinzel text-xs tracking-widest transition-colors">
              SKIP
              <X size={15} className="text-white" />
            </button>
          </header>

          <div className="flex-1 flex flex-col gap-3">
            
            <div className="mb-5">
              <h1 className="font-cinzel text-2xl font-bold tracking-widest text-white uppercase mb-4">
                {activeTab === 'LOGIN' ? 'Continue Your Journey' : 'Start Your Adventure'}
              </h1>
              <p className="text-xs text-white tracking-widest">
                {activeTab === 'LOGIN' ? 'NEW EXPLORER?' : 'ALREADY AN EXPLORER?'} 
                <button 
                  onClick={() => setActiveTab(activeTab === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                  className="text-primary hover:text-primary/70 font-bold transition-colors uppercase ml-2"
                >
                  {activeTab === 'LOGIN' ? 'SIGN UP' : 'LOGIN'}
                </button>
              </p>
            </div>

            <form className="flex flex-col gap-5 w-full max-w-lg mx-auto">
              
              <div className="relative mb-3">
                <Input 
                  type="email" 
                  label="EMAIL"
                  placeholder="EMAIL@COM.OPL"
                />
                <Mail size={20} className="absolute top-1/2 right-6 -translate-y-1/2 text-white" />
              </div>

              <div className="relative mb-3">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="*****"
                  label="PASSWORD"
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 text-white top-1/2 -translate-y-1/2 transition-colors"
                >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              {activeTab === 'REGISTER' && (
              <div className="relative mb-3">
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="*****"
                  label="CONFIRM PASSWORD"
                />
                <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 text-white top-1/2 -translate-y-1/2 transition-colors"
                >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
              )}

              {activeTab === 'REGISTER' && (
                  <Checkbox label="I AGREE WITH PRIVACY POLICY" checked={agreeToPolicy} onChange={setAgreeToPolicy} />
              )}

              {activeTab === 'LOGIN' && (
                <button type="button" className="text-primary hover:text-primary/70 transition-colors text-xs tracking-widest text-left uppercase">
                  Forgot your password?
                </button>
              )}

              <Button 
                type="submit" 
                variant="primary"
                className="max-w-3xs mx-auto w-full"
              >
                {activeTab === 'LOGIN' ? 'LOGIN' : 'CREATE ACCOUNT'}
              </Button>
            </form>
          </div>
        </div>

        <div 
          className="w-1/2 bg-cover bg-center self-stretch hidden lg:block"
          style={{ backgroundImage: `url(${login_register_banner})` }}
        >
        </div>
        </div>
    </Modal>
  );
};