import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { submitAlumni } from "@/lib/alumni.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { GraduationCap, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JNV Alumni Directory — Submit your details" },
      {
        name: "description",
        content:
          "Join the JNV Alumni Directory. Share your batch, occupation and current posting so classmates can stay in touch.",
      },
      { property: "og:title", content: "JNV Alumni Directory" },
      {
        property: "og:description",
        content: "Share your details to be listed in the JNV Alumni Directory.",
      },
    ],
  }),
  component: Index,
});

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  batch: z.string().trim().regex(/^(19|20)\d{2}$/, "Enter a 4-digit year, e.g. 2007"),
  mobile: z.string().trim().regex(/^[0-9+\-\s]{7,20}$/, "Enter a valid mobile number"),
  address: z.string().trim().min(1, "Address is required").max(500),
  occupation: z.string().trim().max(200).optional().default(""),
  department: z.string().trim().max(200).optional().default(""),
  post: z.string().trim().max(200).optional().default(""),
  postingPlace: z.string().trim().max(200).optional().default(""),
  remarks: z.string().trim().max(500).optional().default(""),
  email: z.string().trim().max(200).optional().default(""),
});

type FormValues = z.input<typeof formSchema>;

function Index() {
  const submit = useServerFn(submitAlumni);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      batch: "",
      mobile: "",
      address: "",
      occupation: "",
      department: "",
      post: "",
      postingPlace: "",
      remarks: "",
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await submit({ data: values });
      toast.success("Submitted! Thank you for joining the directory.");
      reset();
      setSubmitted(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />

      <header className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg font-semibold tracking-tight">
              JNV Alumni Directory
            </span>
          </div>
          <nav className="flex items-center gap-4 text-xs">
            <Link
              to="/visualize"
              className="text-primary-foreground/80 hover:text-primary-foreground"
            >
              Visualize
            </Link>
            <Link
              to="/admin"
              className="text-primary-foreground/70 hover:text-primary-foreground"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-14 pb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Reconnect with your batchmates.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Share where life has taken you. Your details help us build a directory
          of JNV alumni — from teachers and doctors to engineers and officers
          across the country.
        </p>
      </section>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        {submitted ? (
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="mt-1 h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  You're in the directory.
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Thanks for sharing your details. They've been added to the
                  alumni list.
                </p>
                <Button
                  className="mt-5"
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                >
                  Submit another entry
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-lg font-semibold text-foreground">
              Your details
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Fields marked * are required.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Full name *" error={errors.name?.message}>
                <Input placeholder="e.g. Avtar Kishor Gour" {...register("name")} />
              </Field>
              <Field label="Batch (year) *" error={errors.batch?.message}>
                <Input inputMode="numeric" placeholder="2007" {...register("batch")} />
              </Field>
              <Field label="Mobile number *" error={errors.mobile?.message}>
                <Input inputMode="tel" placeholder="9876543210" {...register("mobile")} />
              </Field>
              <Field label="Email (optional)" error={errors.email?.message}>
                <Input type="email" placeholder="name@example.com" {...register("email")} />
              </Field>
              <Field
                label="Address *"
                error={errors.address?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  rows={2}
                  placeholder="Village/Town, District, State, PIN"
                  {...register("address")}
                />
              </Field>
              <Field label="Occupation" error={errors.occupation?.message}>
                <Input
                  placeholder="e.g. Software Development, Govt teacher"
                  {...register("occupation")}
                />
              </Field>
              <Field label="Department / Firm" error={errors.department?.message}>
                <Input
                  placeholder="e.g. Indian Air Force, HDFC Bank"
                  {...register("department")}
                />
              </Field>
              <Field label="Post / Role" error={errors.post?.message}>
                <Input placeholder="e.g. Sergeant, CTO" {...register("post")} />
              </Field>
              <Field label="Posting place / Work location" error={errors.postingPlace?.message}>
                <Input
                  placeholder="e.g. Kuchaman City"
                  {...register("postingPlace")}
                />
              </Field>
              <Field
                label="Remarks (optional)"
                error={errors.remarks?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  rows={2}
                  placeholder="Anything else you'd like to share"
                  {...register("remarks")}
                />
              </Field>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <Button type="submit" disabled={isSubmitting} size="lg">
                {isSubmitting ? "Submitting…" : "Submit details"}
              </Button>
            </div>
          </form>
        )}
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-muted-foreground">
          JNV Alumni Directory · Built with care for the JNV community.
        </div>
      </footer>
    </div>
  );
}

function Field({
  label,
  error,
  className,
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
