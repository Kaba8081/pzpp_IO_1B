import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import type { Route } from "./+types/test";
import { useState } from "react";
import { AuthService } from "@/services/auth";
import { useUserStore } from "@/stores/UserStore";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Auth Test" }];
}

export default function TestPage() {
  const { user, isLoggedIn, logout, setUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [tab, setTab] = useState<"login" | "register">("login");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    username: "",
    description: "",
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { user: loginUser } = await AuthService.login(loginData);
      setUser(loginUser);
      setLoginData({ email: "", password: "" });
      console.log("✅ Login successful");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Login failed";
      setErrorMsg(msg);
      console.error("❌ Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await AuthService.register(registerData);
      setRegisterData({ email: "", password: "", username: "", description: "" });
      console.log("✅ Register successful");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Register failed";
      setErrorMsg(msg);
      console.error("❌ Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await AuthService.refresh();
      console.log("✅ Refresh successful:", result);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Refresh failed";
      setErrorMsg(msg);
      console.error("❌ Refresh error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    AuthService.clearAuth();
    console.log("✅ Logged out");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h1>Test Auth</h1>

      {/* Status */}
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <p>
          <strong>Status:</strong> {isLoggedIn ? "✅ Zalogowany" : "❌ Niezalogowany"}
        </p>
        {user && (
          <>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Username:</strong> {user.profile?.username || "-"}
            </p>
          </>
        )}
      </div>

      {errorMsg && <p style={{ color: "red", marginBottom: "10px" }}>{errorMsg}</p>}

      {/* Tabs */}
      <div style={{ marginBottom: "15px", borderBottom: "1px solid #ddd" }}>
        <Button onClick={() => setTab("login")} disabled={tab === "login"}>
          Logowanie
        </Button>
        <Button onClick={() => setTab("register")} disabled={tab === "register"}>
          Rejestracja
        </Button>
      </div>

      {/* Login */}
      {tab === "login" && (
        <form onSubmit={handleLogin} style={{ marginBottom: "20px" }}>
          <Input
            label="Email"
            type="email"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
          />
          <Input
            label="Hasło"
            type="password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Ładowanie..." : "Zaloguj"}
          </Button>
        </form>
      )}

      {/* Register */}
      {tab === "register" && (
        <form onSubmit={handleRegister} style={{ marginBottom: "20px" }}>
          <Input
            label="Email"
            type="email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
          />
          <Input
            label="Username"
            type="text"
            value={registerData.username}
            onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
          />
          <Input
            label="Hasło"
            type="password"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
          />
          <Input
            label="Opis"
            type="text"
            value={registerData.description}
            onChange={(e) => setRegisterData({ ...registerData, description: e.target.value })}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Ładowanie..." : "Zarejestruj"}
          </Button>
        </form>
      )}

      {/* Actions */}
      {isLoggedIn && (
        <div style={{ marginTop: "20px" }}>
          <Button onClick={handleRefresh} disabled={isLoading}>
            Odśwież token
          </Button>
          <Button onClick={handleLogout} disabled={isLoading}>
            Wyloguj się
          </Button>
        </div>
      )}
    </div>
  );
}
