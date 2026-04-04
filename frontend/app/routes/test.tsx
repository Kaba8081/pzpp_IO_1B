import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Toggle } from "@/components/Toggle";
import { Slider } from "@/components/Slider";
import { Checkbox } from "@/components/Checkbox";
import { Sidebar, type UserData, type WorldData } from "@/components/Sidebar";
import type { Route } from "./+types/test";
import { useState } from "react";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Test Form & Sidebar" }];
}

// Przykładowe dane mockowane dla zalogowanego użytkownika
const mockUser: UserData = {
  name: "Nick",
  avatarUrl: "https://i.pravatar.cc/150?img=5",
};

const mockWorlds: WorldData[] = [
  {
    title: "World 1",
    defaultOpen: true,
    items: [{ label: "Cave" }, { label: "Mountain" }, { label: "Kingdom", isActive: true }],
  },
  {
    title: "World 2",
    defaultOpen: false,
    items: [{ label: "Forest" }, { label: "Desert" }],
  },
];

export default function TestPage() {
  const [values, setValues] = useState({
    text: "",
    number: "",
    password: "",
    email: "",
    toggle: false,
    slider: 50,
    agree: false,
  });

  // Stan zalogowania dla sidebara
  const [isSidebarLoggedIn, setIsSidebarLoggedIn] = useState(false);

  const errors = {
    text: values.text.length < 3 ? "Minimum 3 znaki" : null,
    number: Number(values.number) <= 0 ? "Musi być większe od 0" : null,
    password: values.password.length < 6 ? "Hasło: min. 6 znaków" : null,
    email: !values.email.includes("@") ? "Email musi zawierać @" : null,
    toggle: !values.toggle ? "Musisz zaznaczyć tę opcję" : null,
    slider: values.slider < 20 ? "Wartość musi być min. 20" : null,
    agree: !values.agree ? "Musisz zaakceptować warunki" : null,
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Wysłane dane:", values);
  };

  return (
    // Główny kontener strony
    <div className="h-screen bg-background flex overflow-hidden p-6 gap-8">
      {/* sidebar */}
      <Sidebar
        isLoggedIn={isSidebarLoggedIn}
        user={mockUser}
        worlds={mockWorlds}
        isHomeActive={false}
      />

      {/* komponenty testowe */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center pb-20 pt-4 custom-scrollbar">
        {/* Przelacznik sidebara */}
        <div className="w-full max-w-lg mb-8 bg-input-bg/30 p-6 rounded-2xl border border-input-border flex justify-between items-center shadow-lg">
          <span className="text-white font-cinzel font-bold tracking-widest text-sm uppercase">
            Stan Sidebara:
          </span>
          <Toggle
            label={isSidebarLoggedIn ? "Zalogowany" : "Niezalogowany"}
            checked={isSidebarLoggedIn}
            onChange={(val: boolean) => setIsSidebarLoggedIn(val)}
          />
        </div>

        {/* Ttest samych komponentow */}
        <div className="w-full max-w-lg bg-input-bg/30 p-8 rounded-2xl border border-input-border shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Rejestracja <span className="text-primary">.</span>
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              label="Tekst"
              placeholder="Wpisz tekst..."
              type="text"
              value={values.text}
              error={errors.text}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValues({ ...values, text: e.target.value })
              }
            />

            <Input
              label="Liczba"
              placeholder="0"
              type="number"
              value={values.number}
              error={errors.number}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValues({ ...values, number: e.target.value })
              }
            />

            <Input
              label="Hasło"
              placeholder="••••••••"
              type="password"
              value={values.password}
              error={errors.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValues({ ...values, password: e.target.value })
              }
            />

            <Input
              label="Email"
              placeholder="twoj@email.pl"
              type="email"
              value={values.email}
              error={errors.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setValues({ ...values, email: e.target.value })
              }
            />

            <div className="py-2">
              <Toggle
                label="Zgadzam się z regulaminem"
                checked={values.toggle}
                error={errors.toggle}
                onChange={(val: boolean) => setValues({ ...values, toggle: val })}
              />
            </div>

            <div className="py-2">
              <Checkbox
                label="Akceptuję regulamin i politykę prywatności"
                checked={values.agree}
                error={errors.agree}
                onChange={(val: boolean) => setValues({ ...values, agree: val })}
              />
            </div>

            <div className="py-2">
              <Slider
                label={`Wartość suwaka: `}
                min={0}
                max={100}
                value={values.slider}
                error={errors.slider}
                onChange={(val: number) => setValues({ ...values, slider: val })}
              />
            </div>

            <div className="flex gap-4 mt-6">
              <Button variant="primary">Zarejestruj się</Button>
              <Button variant="outline">Anuluj</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
