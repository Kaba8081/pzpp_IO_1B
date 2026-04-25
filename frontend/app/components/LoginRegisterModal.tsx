import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, User, X } from "lucide-react";
import { Input } from "./Input";
import { Checkbox } from "./Checkbox";
import { useUserStore } from "@/stores/UserStore";
import { Modal } from "./Modal";
import { Button } from "./Button";
import loginRegisterBanner from "@/images/login_register_banner.jpg";
import { AuthService } from "@/services/auth";

type AuthTab = "LOGIN" | "REGISTER";

const AUTH_MODAL_NAMES = ["login", "register"] as const;

const isAuthModal = (name: string | undefined): name is (typeof AUTH_MODAL_NAMES)[number] =>
  AUTH_MODAL_NAMES.some((modalName) => modalName === name);

const getInitialTab = (modalName: (typeof AUTH_MODAL_NAMES)[number]): AuthTab =>
  modalName === "register" ? "REGISTER" : "LOGIN";

export const LoginRegisterModal = () => {
  const { currentModal, modal, setUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<AuthTab>("LOGIN");
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [values, setValues] = useState({
    password: "",
    confirmPassword: "",
    email: "",
    username: "",
  });

  const isRegister = activeTab === "REGISTER";
  const errors = {
    password: isSubmitted && values.password.length < 6 ? "Password: min. 6 characters" : null,
    confirmPassword:
      isSubmitted && isRegister && values.confirmPassword !== values.password
        ? "Passwords do not match"
        : null,
    email: isSubmitted && !values.email.includes("@") ? "Email must contain @" : null,
    username:
      isSubmitted && isRegister && values.username.length < 3
        ? "Username: min. 3 characters"
        : null,
    agree: isSubmitted && isRegister && !agreeToPolicy ? "You must accept the terms" : null,
  };

  useEffect(() => {
    if (isAuthModal(currentModal)) {
      setActiveTab(getInitialTab(currentModal));
    }
    setIsSubmitted(false);
    setServerError(null);
  }, [currentModal]);

  if (!isAuthModal(currentModal)) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setServerError(null);

    if (
      !values.email.includes("@") ||
      values.password.length < 6 ||
      (isRegister && values.password !== values.confirmPassword) ||
      (isRegister && values.username.length < 3) ||
      (isRegister && !agreeToPolicy)
    ) {
      return;
    }

    setIsLoading(true);

    try {
      if (isRegister) {
        await AuthService.register({
          email: values.email,
          password: values.password,
          username: values.username,
        });
      }

      const { user } = await AuthService.login({ email: values.email, password: values.password });
      setUser(user);
      modal.close();
    } catch (error: unknown) {
      console.error(error);

      const err = error as { response?: { data?: { message?: string } } };

      setServerError(err?.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal name={currentModal} size="lg" padding="none" contentClassName="m-0">
      <div className="flex max-w-4xl flex-col overflow-hidden sm:flex-row">
        <div className="w-full lg:w-1/2 flex flex-col p-10 text-white">
          <header className="flex items-center justify-between mb-10">
            <nav className="flex items-center gap-5">
              <button
                onClick={() => setActiveTab("LOGIN")}
                className={`pb-2 font-bold font-cinzel text-xs tracking-widest transition-all ${activeTab === "LOGIN" ? "text-white border-b-2 border-primary" : "text-white/50 hover:text-white"}`}
              >
                LOGIN
              </button>
              <button
                onClick={() => setActiveTab("REGISTER")}
                className={`pb-2 font-bold font-cinzel text-xs tracking-widest transition-all ${activeTab === "REGISTER" ? "text-white border-b-2 border-primary" : "text-white/50 hover:text-white"}`}
              >
                REGISTER
              </button>
            </nav>
            <button
              onClick={() => modal.close()}
              className="pb-2 flex items-center gap-2 text-white font-bold font-cinzel text-xs tracking-widest transition-colors"
            >
              SKIP
              <X size={15} className="text-white" />
            </button>
          </header>

          <div className="flex-1 flex flex-col gap-3">
            <div className="mb-5">
              <h1 className="font-cinzel text-2xl font-bold tracking-widest text-white uppercase mb-4">
                {activeTab === "LOGIN" ? "Continue Your Journey" : "Start Your Adventure"}
              </h1>
              <p className="text-xs text-white tracking-widest">
                {activeTab === "LOGIN" ? "New explorer?" : "Already a explorer?"}
                <button
                  onClick={() => setActiveTab(activeTab === "LOGIN" ? "REGISTER" : "LOGIN")}
                  className="text-primary hover:text-primary/70 font-bold transition-colors uppercase ml-2"
                >
                  {activeTab === "LOGIN" ? "SIGN UP" : "LOGIN"}
                </button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-lg mx-auto">
              {serverError && (
                <p className="text-error text-xs font-bold uppercase tracking-wider text-center">
                  {serverError}
                </p>
              )}

              <Input
                type="email"
                label="EMAIL"
                value={values.email}
                placeholder="your@mail.com"
                error={errors.email}
                icon={<Mail size={20} />}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValues({ ...values, email: e.target.value })
                }
              />

              {activeTab === "REGISTER" && (
                <Input
                  type="text"
                  label="USERNAME"
                  value={values.username}
                  placeholder="USERNAME"
                  error={errors.username}
                  icon={<User size={20} />}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setValues({ ...values, username: e.target.value })
                  }
                />
              )}

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="*****"
                label="Password"
                value={values.password}
                error={errors.password}
                icon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                }
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setValues({ ...values, password: e.target.value })
                }
              />

              {activeTab === "REGISTER" && (
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="*****"
                  label="Confirm password"
                  value={values.confirmPassword}
                  error={errors.confirmPassword}
                  icon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                    </button>
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setValues({ ...values, confirmPassword: e.target.value })
                  }
                />
              )}

              {activeTab === "REGISTER" && (
                <Checkbox
                  label="I agree with policy"
                  checked={agreeToPolicy}
                  onChange={setAgreeToPolicy}
                  error={errors.agree}
                />
              )}

              {activeTab === "LOGIN" && (
                <button
                  type="button"
                  className="text-primary hover:text-primary/70 transition-colors text-xs tracking-widest text-left uppercase"
                >
                  Forgot your password?
                </button>
              )}

              <Button
                type="submit"
                variant="primary"
                className="max-w-3xs mx-auto w-full"
                disabled={isLoading}
              >
                {activeTab === "LOGIN" ? "LOGIN" : "CREATE ACCOUNT"}
              </Button>
            </form>
          </div>
        </div>

        <div
          className="w-1/2 bg-cover bg-center self-stretch hidden lg:block"
          style={{ backgroundImage: `url(${loginRegisterBanner})` }}
        ></div>
      </div>
    </Modal>
  );
};
