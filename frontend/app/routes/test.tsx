import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Toggle } from "@/components/Toggle";
import { Slider } from "@/components/Slider";
import type { Route } from "./+types/test";
import { useState } from "react";

export function meta(_: Route.MetaArgs) {
  return [{ title: "Test Form" }];
}

export default function TestPage() {
  const [values, setValues] = useState({
    text: "",
    number: "",
    password: "",
    email: "",
    toggle: false,
    slider: 50,
  });

  const errors = {
    text: values.text.length < 3 ? "Minimum 3 znaki" : null,
    number: Number(values.number) <= 0 ? "Musi być większe od 0" : null,
    password: values.password.length < 6 ? "Hasło: min. 6 znaków" : null,
    email: !values.email.includes("@") ? "Email musi zawierać @" : null,
    toggle: !values.toggle ? "Musisz zaznaczyć tę opcję" : null,
    slider: values.slider < 20 ? "Wartość musi być min. 20" : null,
  };

  const isInvalid = Object.values(errors).some((err) => err !== null);

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Wysłane dane:", values);
  };

  return (
    /* 1. Kontener strony - tło i wyśrodkowanie */
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
            <Slider
              label={`Wartość suwaka: ${values.slider}`}
              min={0}
              max={100}
              value={values.slider}
              error={errors.slider}
              onChange={(val: number) => setValues({ ...values, slider: val })}
            />
          </div>

          <div className="mt-4">
            <Button
              type="submit"
              disabled={isInvalid}
              className="w-full" // Rozciąga przycisk na całą szerokość
            >
              Wyślij do konsoli
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
