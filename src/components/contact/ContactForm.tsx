"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { waLink } from "@/lib/whatsapp";

type FormState = {
  name: string;
  phone: string;
  animal: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initial: FormState = {
  name: "",
  phone: "",
  animal: "",
  message: "",
};

const limits: Record<keyof FormState, number> = {
  name: 80,
  phone: 30,
  animal: 60,
  message: 2000,
};

const fieldClass = (invalid?: boolean) =>
  [
    "mt-2 h-11 w-full rounded-control border bg-white px-3.5 text-base text-charcoal",
    "placeholder:text-muted transition-[border-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
    "focus:border-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest",
    invalid ? "border-[#a03d2e]" : "border-border-subtle",
  ].join(" ");

/**
 * Format a locally entered Pakistani mobile number (without country code,
 * e.g. 3171234567 / 0317…) into international form (+92 3171234567) for
 * the prefilled WhatsApp message. Tolerates a pasted +92 / 0092 prefix.
 */
function formatPhoneForWhatsApp(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("92") && digits.length >= 12) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return `+92 ${digits}`;
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Please enter your name.";
  const phone = form.phone.trim();
  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else if ((phone.match(/\d/g) ?? []).length < 7) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!form.message.trim()) errors.message = "Please enter a message.";
  return errors;
}

/**
 * Client-side contact form. There is no backend — on submit the form
 * composes a WhatsApp message and opens the practice chat. This is
 * stated honestly in the UI.
 */
export function ContactForm() {
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      const first = (["name", "phone", "message"] as const).find(
        (k) => found[k],
      );
      if (first) document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    setErrors({});
    const text = [
      "Hello Dr. Ali Ahmad, I would like to get in touch.",
      `Name: ${form.name.trim()}`,
      `Phone: ${formatPhoneForWhatsApp(form.phone)}`,
      form.animal.trim() ? `Animal: ${form.animal.trim()}` : "",
      "",
      form.message.trim(),
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(text), "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-card border border-forest/20 bg-white p-8 text-center">
        <CheckCircle2
          className="mx-auto h-8 w-8 text-forest"
          aria-hidden="true"
        />
        <h3 className="mt-4 font-display text-[20px] font-medium leading-[1.25] tracking-[-0.01em] text-charcoal">
          WhatsApp is opening
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-[15px] leading-relaxed text-muted">
          Your message has been prepared in WhatsApp. If the chat did not
          open, call the practice directly using the number on this page.
        </p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-5"
          onClick={() => {
            setForm(initial);
            setSubmitted(false);
          }}
        >
          Send another message
        </Button>
      </div>
    );
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-card border border-border-subtle bg-white p-6 md:p-8"
      aria-label="Contact form"
    >
      <p className="text-[13px] leading-relaxed text-muted">
        This form opens WhatsApp with your details prefilled — there is no
        website inbox. For urgent matters, call directly.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label
            htmlFor="cf-name"
            className="block text-[13px] font-semibold uppercase tracking-[0.1em] text-muted"
          >
            Your name
          </label>
          <input
            id="cf-name"
            type="text"
            autoComplete="name"
            required
            maxLength={limits.name}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "cf-name-error" : undefined}
            className={fieldClass(!!errors.name)}
            placeholder="Full name"
          />
          {errors.name ? (
            <p
              id="cf-name-error"
              role="alert"
              className="mt-1.5 text-[13px] text-[#a03d2e]"
            >
              {errors.name}
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-1">
          <label
            htmlFor="cf-phone"
            className="block text-[13px] font-semibold uppercase tracking-[0.1em] text-muted"
          >
            Phone number
          </label>
          <input
            id="cf-phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={limits.phone}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={errors.phone ? "cf-phone-error" : undefined}
            className={fieldClass(!!errors.phone)}
            placeholder="e.g. 03001234567"
          />
          {errors.phone ? (
            <p
              id="cf-phone-error"
              role="alert"
              className="mt-1.5 text-[13px] text-[#a03d2e]"
            >
              {errors.phone}
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="cf-animal"
            className="block text-[13px] font-semibold uppercase tracking-[0.1em] text-muted"
          >
            Animal <span className="font-normal normal-case">(optional)</span>
          </label>
          <input
            id="cf-animal"
            type="text"
            maxLength={limits.animal}
            value={form.animal}
            onChange={(e) => update("animal", e.target.value)}
            className={fieldClass(false)}
            placeholder="e.g. Dog, cat, cattle…"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="cf-message"
            className="block text-[13px] font-semibold uppercase tracking-[0.1em] text-muted"
          >
            Message
          </label>
          <textarea
            id="cf-message"
            required
            rows={5}
            maxLength={limits.message}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "cf-message-error" : undefined}
            className={[
              fieldClass(!!errors.message),
              "h-auto min-h-[128px] resize-y py-3 leading-relaxed",
            ].join(" ")}
            placeholder="How can the practice help?"
          />
          {errors.message ? (
            <p
              id="cf-message-error"
              role="alert"
              className="mt-1.5 text-[13px] text-[#a03d2e]"
            >
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>

      {hasErrors ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 text-[14px] text-[#a03d2e]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Please fix the highlighted fields above.
        </p>
      ) : null}

      <Button type="submit" size="lg" variant="primary" className="mt-6 w-full">
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Send via WhatsApp
      </Button>
    </form>
  );
}
