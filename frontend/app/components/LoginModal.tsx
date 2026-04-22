import React, { useState } from "react";
import { LogIn, X } from "lucide-react";
import { useUserStore } from "@/stores/UserStore";
import { AuthService } from "@/services/auth";
import { Button } from "./Button";
import { Input } from "./Input";
import { Modal } from "./Modal";

export const LoginModal = () => {
  const { setUser, modal } = useUserStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail("");
    setPassword("");
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    modal.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { user } = await AuthService.login({ email, password });
      setUser(user);
      reset();
      modal.close();
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal name="login">
      <div className="flex flex-col p-2">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <LogIn size={44} className="text-primary mb-4" strokeWidth={1.5} />
          <h2 className="text-md tracking-widest">Login</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="EMAIL"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <Input
            label="PASSWORD"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />

          {error && <p className="text-error     tracking-widest text-center mb-4">{error}</p>}

          <div className="flex gap-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                modal.open("register");
              }}
              className="flex-1 tracking-widest  "
              disabled={loading}
            >
              REGISTER
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 tracking-widest  "
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOGIN"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
