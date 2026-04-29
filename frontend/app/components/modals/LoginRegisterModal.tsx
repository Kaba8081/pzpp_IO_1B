import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Mail, User, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { useUserStore } from "@/stores/UserStore";
import { Modal } from "@/components/modals/Modal";
import { Button } from "@/components/ui/Button";
import loginRegisterBanner from "@/images/login_register_banner.webp";
import { AuthService } from "@/services/auth";

type AuthTab = "LOGIN" | "REGISTER";

const AUTH_MODAL_NAMES = ["login", "register"] as const;

const isAuthModal = (name: string | undefined): name is (typeof AUTH_MODAL_NAMES)[number] =>
  AUTH_MODAL_NAMES.some((modalName) => modalName === name);

const getInitialTab = (modalName: (typeof AUTH_MODAL_NAMES)[number]): AuthTab =>
  modalName === "register" ? "REGISTER" : "LOGIN";

export const LoginRegisterModal = () => {
  const { currentModal, modal, setUser } = useUserStore();
  const [activeTab, setActiveTab] = useState<AuthTab>(() =>
    isAuthModal(currentModal) ? getInitialTab(currentModal) : "LOGIN"
  );
  const [prevModal, setPrevModal] = useState<string | undefined>(currentModal);
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

  if (prevModal !== currentModal) {
    setPrevModal(currentModal);
    if (isAuthModal(currentModal)) {
      setActiveTab(getInitialTab(currentModal));
    }
  }

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
    setIsSubmitted(false);
    setServerError(null);
  }, [currentModal]);

  const handleTabSwitch = (tab: AuthTab) => {
    setActiveTab(tab);
    setIsSubmitted(false);
    setServerError(null);
  };

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
    <Modal name={["login", "register"]} size="lg" padding="none" contentClassName="m-0">
      <div className="flex max-w-4xl flex-col overflow-hidden sm:flex-row">
        <div className="w-full lg:w-1/2 flex flex-col p-10">
          <header className="flex items-center justify-between mb-10">
            <nav className="flex items-center gap-5">
              <button
                onClick={() => handleTabSwitch("LOGIN")}
                className={`pb-2 transition-all ${activeTab === "LOGIN" ? "border-b-2 border-primary" : "text-white"}`}
              >
                Login
              </button>
              <button
                onClick={() => handleTabSwitch("REGISTER")}
                className={`pb-2 transition-all ${activeTab === "REGISTER" ? "border-b-2 border-primary" : "text-white"}`}
              >
                Register
              </button>
            </nav>
            <button
              onClick={() => modal.close()}
              className="pb-2 flex items-center gap-2 transition-colors"
            >
              Skip
              <X size={15} />
            </button>
          </header>

          <div className="flex-1 flex flex-col gap-3">
            <div className="mb-5">
              <h1 className="text-2xl mb-4">
                {activeTab === "LOGIN" ? "Continue Your Journey" : "Start Your Adventure"}
              </h1>
              <p>
                {activeTab === "LOGIN" ? "New explorer?" : "Already a explorer?"}
                <button
                  onClick={() => handleTabSwitch(activeTab === "LOGIN" ? "REGISTER" : "LOGIN")}
                  className="text-primary hover:text-primary/70 transition-colors ml-2"
                >
                  {activeTab === "LOGIN" ? "Sign up" : "Login"}
                </button>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-lg mx-auto">
              {serverError && <p className="text-error text-center">{serverError}</p>}

              <Input
                type="email"
                label="Email"
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
                  label="Username"
                  value={values.username}
                  placeholder="Username"
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
                  className="text-primary hover:text-primary/70 transition-colors text-left"
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
                {activeTab === "LOGIN" ? "Login" : "Create account"}
              </Button>
            </form>
          </div>
        </div>

        <div
          className="w-1/2 bg-cover bg-center hidden lg:block object-fill"
          style={{ backgroundImage: `url(${loginRegisterBanner})` }}
        ></div>
      </div>
    </Modal>
  );
};
