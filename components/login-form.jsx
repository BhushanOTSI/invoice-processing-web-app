"use client";

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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useAuth } from "@/services/hooks/useAuth";
import { UserIcon } from "lucide-react";

export function LoginForm({ className, ...props }) {
  const { mutate: login, isPending } = useAuth();

  const form = useForm({
    resolver: zodResolver(
      z.object({
        username: z.string().min(2, {
          message: "Username is required.",
        }),
        password: z.string().min(2, {
          message: "Password is required.",
        }),
      })
    ),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  return (
    <fieldset disabled={isPending}>
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(login)} autoComplete="off">
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
                <h1 className="text-xl font-semibold">Welcome Back!</h1>
              </div>
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="email">User Name</FormLabel>
                    <FormControl>
                      <Input
                        id="username"
                        type="text"
                        placeholder="user name"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="********"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Field>
                <Button type="submit">Login</Button>
              </Field>
              <FieldSeparator>Test Acount</FieldSeparator>
              <div
                onClick={() => {
                  form.setValue("username", "otsi");
                  form.setValue("password", "otsi@1234");
                }}
                className="cursor-pointer border px-4 py-2 rounded-md flex items-center gap-2 hover:bg-accent"
              >
                <UserIcon className="h-4 w-4" />
                <div className="flex flex-col justify-center">
                  <div>Username: otsi</div>
                  <div>Password: *******</div>
                </div>
              </div>
            </FieldGroup>
          </form>
        </Form>
      </div>
    </fieldset>
  );
}
