import React, { useState } from "react";
import { UserPlus, X } from "lucide-react";
import { useUserStore } from "@/stores/UserStore";
import { AuthService } from "@/services/auth";
import { Button } from "./Button";
import { Input } from "./Input";
import { Modal } from "./Modal";

export const RegisterModal = () => {
  const { setUser, modal } = useUserStore();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setEmail("");
    setUsername("");
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
      await AuthService.register({ email, password, username });
      const { user } = await AuthService.login({ email, password });
      setUser(user);
      reset();
      modal.close();
    } catch {
      setError("Registration failed. The email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal name="register">
      <div className="flex flex-col p-2">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-primary transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <UserPlus size={44} className="text-primary mb-4" strokeWidth={1.5} />
          <h2 className="text-md tracking-widest">Register</h2>
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
            label="USERNAME"
            type="text"
            placeholder="Your display name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
                modal.open("login");
              }}
              className="flex-1 tracking-widest  "
              disabled={loading}
            >
              LOGIN
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 tracking-widest  "
              disabled={loading}
            >
              {loading ? "CREATING..." : "CREATE ACCOUNT"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
