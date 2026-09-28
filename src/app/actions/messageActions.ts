"use server";

import { getAdminSession } from "@/lib/admin-auth";
import {
  defaultEmailTemplate,
  EMAIL_TEMPLATE_DEFAULTS,
  listEmailTemplates,
  type EmailTemplate,
} from "@/lib/email-templates";
import { OPERATIONS_MESSAGE, tableMissing } from "@/lib/portal-db";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { getVendorSettings, saveVendorSettings, type VendorSettingsView } from "@/lib/vendor";

export type MessageSettings = {
  templates: EmailTemplate[];
  templatesMissing: boolean;
  vendor: VendorSettingsView;
};

export async function getMessageSettings(): Promise<MessageSettings | null> {
  const session = await getAdminSession();
  if (!session) return null;
  const [{ templates, missing }, vendor] = await Promise.all([listEmailTemplates(), getVendorSettings()]);
  return { templates, templatesMissing: missing, vendor };
}

export async function saveEmailTemplate(input: { eventType: string; subject: string; heading: string; body: string }) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  const known = EMAIL_TEMPLATE_DEFAULTS.some((template) => template.eventType === input.eventType);
  if (!known) return { ok: false as const, error: "That email is not one of the templates." };
  const subject = input.subject.trim();
  const body = input.body.trim();
  const heading = input.heading.trim();
  if (!subject || !body) return { ok: false as const, error: "Subject and message are required." };
  if (subject.length > 180 || heading.length > 180 || body.length > 4000) {
    return { ok: false as const, error: "Keep the subject and heading short, and the message under 4000 characters." };
  }

  const { error } = await supabaseAdmin.from("email_templates").upsert({
    event_type: input.eventType,
    subject,
    heading,
    body,
    updated_at: new Date().toISOString(),
    updated_by: session.user,
  });
  if (error) {
    if (tableMissing(error)) return { ok: false as const, error: OPERATIONS_MESSAGE };
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

export async function resetEmailTemplate(eventType: string) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  if (!defaultEmailTemplate(eventType)) return { ok: false as const, error: "That email is not one of the templates." };
  const { error } = await supabaseAdmin.from("email_templates").delete().eq("event_type", eventType);
  if (error) {
    if (tableMissing(error)) return { ok: false as const, error: OPERATIONS_MESSAGE };
    return { ok: false as const, error: error.message };
  }
  return { ok: true as const };
}

export async function saveVendorApi(input: { enabled: boolean; endpointUrl: string; apiKey: string }) {
  const session = await getAdminSession();
  if (!session) return { ok: false as const, error: "Sign in again to continue." };
  return saveVendorSettings({ ...input, actor: session.user });
}
