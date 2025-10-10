import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { LogoOTS } from "@/components/logos";

export function LoginForm({ className, ...props }) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex w-24 items-center justify-center rounded-md">
                <LogoOTS />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Welcome Back!</h1>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="********"
              required
            />
          </Field>
          <Field>
            <Button type="submit">Login</Button>
          </Field>
          <FieldSeparator>Demo Credentials</FieldSeparator>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="demo-email">Email</FieldLabel>
            <FieldDescription>admin@invoiceai.pro</FieldDescription>
          </Field>
          <Field orientation="horizontal">
            <FieldLabel htmlFor="demo-password">Password</FieldLabel>
            <FieldDescription>admin123</FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
