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
    <form onSubmit={handleSubmit}>
      <Input
        label="Tekst"
        type="text"
        value={values.text}
        error={errors.text}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValues({ ...values, text: e.target.value })
        }
      />

      <Input
        label="Liczba"
        type="number"
        value={values.number}
        error={errors.number}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValues({ ...values, number: e.target.value })
        }
      />

      <Input
        label="Hasło"
        type="password"
        value={values.password}
        error={errors.password}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValues({ ...values, password: e.target.value })
        }
      />

      <Input
        label="Email"
        type="email"
        value={values.email}
        error={errors.email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setValues({ ...values, email: e.target.value })
        }
      />

      <Toggle
        label="Zgoda"
        checked={values.toggle}
        error={errors.toggle}
        onChange={(val: boolean) => setValues({ ...values, toggle: val })}
      />

      <Slider
        label="Suwak"
        min={0}
        max={100}
        value={values.slider}
        error={errors.slider}
        onChange={(val: number) => setValues({ ...values, slider: val })}
      />

      <Button type="submit" disabled={isInvalid}>
        Wyślij do konsoli
      </Button>
    </form>
  );
}
