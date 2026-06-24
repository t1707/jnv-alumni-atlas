import { createFileRoute } from "@tanstack/react-router";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { submitAlumni, listAlumniPublic } from "@/lib/alumni.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { GraduationCap, CheckCircle2, MapPin, ArrowRight } from "lucide-react";
import { useI18n, LangToggle } from "@/lib/i18n";
import { RecentlyAdded } from "@/routes/visualize";

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
  const { t } = useI18n();

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
      toast.success(t("index.toast.success"));
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
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-6 py-5">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 shrink-0" />
            <span className="text-base font-semibold tracking-tight sm:text-lg">
              {t("brand")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/visualize"
              className="group relative inline-flex items-center gap-1.5 rounded-full bg-primary-foreground px-3 py-1.5 text-xs font-semibold text-primary shadow-sm transition hover:bg-primary-foreground/90 sm:text-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              <MapPin className="h-3.5 w-3.5" />
              <span>{t("nav.visualize")}</span>
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </Link>
            <LangToggle />
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pt-14 pb-10">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("index.hero.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {t("index.hero.subtitle")}
        </p>
        <div className="mt-6">
          <Link
            to="/visualize"
            className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-sm transition hover:border-primary/40 hover:bg-accent/80"
          >
            <MapPin className="h-4 w-4 text-primary" />
            {t("index.cta.explore")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 pb-20">
        {submitted ? (
          <div className="rounded-2xl border bg-card p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="mt-1 h-6 w-6 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {t("index.success.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("index.success.body")}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    {t("index.success.another")}
                  </Button>
                  <Link
                    to="/visualize"
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                  >
                    <MapPin className="h-4 w-4" />
                    {t("index.cta.explore")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
          >
            <h2 className="text-lg font-semibold text-foreground">
              {t("index.form.title")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("index.form.required")}
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label={t("index.field.name")} error={errors.name?.message}>
                <Input placeholder="e.g. Avtar Kishor Gour" {...register("name")} />
              </Field>
              <Field label={t("index.field.batch")} error={errors.batch?.message}>
                <Input inputMode="numeric" placeholder="2007" {...register("batch")} />
              </Field>
              <Field label={t("index.field.mobile")} error={errors.mobile?.message}>
                <Input inputMode="tel" placeholder="9876543210" {...register("mobile")} />
              </Field>
              <Field label={t("index.field.email")} error={errors.email?.message}>
                <Input type="email" placeholder="name@example.com" {...register("email")} />
              </Field>
              <Field
                label={t("index.field.address")}
                error={errors.address?.message}
                className="sm:col-span-2"
              >
                <Textarea
                  rows={2}
                  placeholder="Village/Town, District, State, PIN"
                  {...register("address")}
                />
              </Field>
              <Field label={t("index.field.occupation")} error={errors.occupation?.message}>
                <Input
                  placeholder="e.g. Software Development, Govt teacher"
                  {...register("occupation")}
                />
              </Field>
              <Field label={t("index.field.department")} error={errors.department?.message}>
                <Input
                  placeholder="e.g. Indian Air Force, HDFC Bank"
                  {...register("department")}
                />
              </Field>
              <Field label={t("index.field.post")} error={errors.post?.message}>
                <Input placeholder="e.g. Sergeant, CTO" {...register("post")} />
              </Field>
              <Field label={t("index.field.postingPlace")} error={errors.postingPlace?.message}>
                <Input
                  placeholder="e.g. Kuchaman City"
                  {...register("postingPlace")}
                />
              </Field>
              <Field
                label={t("index.field.remarks")}
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
                {isSubmitting ? t("index.submitting") : t("index.submit")}
              </Button>
            </div>
          </form>
        )}
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-muted-foreground">
          {t("index.footer")}
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
