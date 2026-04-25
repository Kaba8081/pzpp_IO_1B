import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Slider } from "@/components/ui/Slider";
import { Checkbox } from "@/components/ui/Checkbox";

const ComponentShowcase = () => {
  const [values, setValues] = useState({
    text: "",
    number: "",
    password: "",
    email: "",
    toggle: false,
    slider: 50,
    agree: false,
  });

  const errors = {
    text: values.text.length < 3 ? "Minimum 3 characters" : null,
    number: Number(values.number) <= 0 ? "Must be greater than 0" : null,
    password: values.password.length < 6 ? "Password: min. 6 characters" : null,
    email: !values.email.includes("@") ? "Email must contain @" : null,
    toggle: !values.toggle ? "You must accept this option" : null,
    slider: values.slider < 20 ? "Value must be at least 20" : null,
    agree: !values.agree ? "You must accept the terms" : null,
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Submitted data:", values);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-input-bg/30 p-8 rounded-2xl border border-input-border shadow-2xl">
        <h1 className="text-3xl text-white mb-8 text-center">example form</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Text"
            placeholder="Enter text..."
            type="text"
            value={values.text}
            error={errors.text}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValues({ ...values, text: e.target.value })
            }
          />

          <Input
            label="Number"
            placeholder="0"
            type="number"
            value={values.number}
            error={errors.number}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValues({ ...values, number: e.target.value })
            }
          />

          <Input
            label="Password"
            placeholder="enter password..."
            type="password"
            value={values.password}
            error={errors.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValues({ ...values, password: e.target.value })
            }
          />

          <Input
            label="Email"
            placeholder="your@email.com"
            type="email"
            value={values.email}
            error={errors.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setValues({ ...values, email: e.target.value })
            }
          />

          <div className="py-2">
            <Toggle
              label="Accept terms and conditions"
              checked={values.toggle}
              error={errors.toggle}
              onChange={(val: boolean) => setValues({ ...values, toggle: val })}
            />
          </div>

          <div className="py-2">
            <Checkbox
              label="I accept the terms and privacy policy"
              checked={values.agree}
              error={errors.agree}
              onChange={(val: boolean) => setValues({ ...values, agree: val })}
            />
          </div>

          <div className="py-2">
            <Slider
              label={`Slider value:`}
              min={0}
              max={100}
              value={values.slider}
              error={errors.slider}
              onChange={(val: number) => setValues({ ...values, slider: val })}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button variant="primary">Submit</Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const meta: Meta<typeof ComponentShowcase> = {
  title: "Pages/Inputs",
  component: ComponentShowcase,
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "dark",
    },
  },
};

export default meta;

type Story = StoryObj<typeof ComponentShowcase>;

export const Default: Story = {};
