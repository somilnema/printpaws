import { parseChangePoints } from "@/lib/change-points";
import { tableMissing } from "@/lib/portal-db";
import { supabaseAdmin } from "@/lib/supabase-admin";

export type EmailTemplate = {
  eventType: string;
  label: string;
  subject: string;
  heading: string;
  body: string;
  tokens: string[];
  hint?: string;
};

const SHARED_TRACK =
  "Open the menu on the Peternity site, choose Track order, and enter the phone number from your order.";

export const EMAIL_TEMPLATE_DEFAULTS: EmailTemplate[] = [
  {
    eventType: "order_confirmed",
    label: "Order confirmed",
    subject: "🐾 Order Confirmed! Peternity Masterpiece #{{orderShort}}",
    heading: "Masterpiece confirmed",
    body: "We have received your custom order details. Our master artists are ready to transform your uploaded photo into a magnificent, premium portrait!",
    tokens: ["petName", "orderShort", "customerName"],
    hint: "This changes the subject and the opening line. The order details under that line stay as they are.",
  },
  {
    eventType: "preview_ready",
    label: "Preview ready",
    subject: "Your {{petName}} preview is ready",
    heading: "Your preview is ready",
    body: `The preview for {{petName}} is ready for you to review.\n\n{{previewImage}}\n\n${SHARED_TRACK} You can approve this picture or, if a revision round is still available, ask for a change.`,
    tokens: ["petName", "previewImage"],
  },
  {
    eventType: "revised_preview_ready",
    label: "Revised preview ready",
    subject: "Updated preview for {{petName}}",
    heading: "Your updated preview is ready",
    body: `The updated preview for {{petName}} is ready for you to review.\n\n{{previewImage}}\n\n${SHARED_TRACK}`,
    tokens: ["petName", "previewImage"],
  },
  {
    eventType: "revision_received",
    label: "Revision received",
    subject: "We received your changes for {{petName}}",
    heading: "Your change request was received",
    body: `We received your changes for {{petName}}. This is revision round {{round}} of 2.\n\n{{note}}\n\nThe artist will upload an updated preview. ${SHARED_TRACK}`,
    tokens: ["petName", "round", "note"],
  },
  {
    eventType: "revision_for_artist",
    label: "Revision for the artist",
    subject: "Revision requested: {{petName}}",
    heading: "Revision requested",
    body: "Hi {{artistName}}, the customer asked for a revision on {{petName}}.\n\n{{note}}\n\n{{portalUrl}}",
    tokens: ["artistName", "petName", "note", "portalUrl"],
  },
  {
    eventType: "artwork_approved",
    label: "Artwork approved",
    subject: "{{petName}} is approved",
    heading: "Your artwork is approved",
    body: `The approved picture for {{petName}} is locked. We are moving this order to shipment.\n\n${SHARED_TRACK}`,
    tokens: ["petName"],
  },
  {
    eventType: "shipment_queued",
    label: "Ready to ship",
    subject: "Ready to ship: {{petName}}",
    heading: "An approved order is ready to ship",
    body: "{{petName}} (#{{orderShort}}) was approved and is waiting for a tracking link.\n\n{{portalUrl}}",
    tokens: ["petName", "orderShort", "portalUrl"],
  },
  {
    eventType: "shipped",
    label: "Shipped",
    subject: "Your {{petName}} has shipped",
    heading: "Your order has shipped",
    body: "{{petName}} is on the way.\n\n{{trackingUrl}}\n\nThe same link is on the order timeline. Open Track order and enter the phone number from the order.",
    tokens: ["petName", "trackingUrl"],
  },
  {
    eventType: "delivered",
    label: "Delivered",
    subject: "{{petName}} has been delivered",
    heading: "Your order has been delivered",
    body: "{{petName}} is marked delivered.\n\n{{trackingUrl}}",
    tokens: ["petName", "trackingUrl"],
  },
  {
    eventType: "artist_assigned",
    label: "Artist assigned",
    subject: "New portrait assigned: {{petName}}",
    heading: "A new order is yours",
    body: "Hi {{artistName}}, {{petName}} (#{{orderShort}}) has been assigned to you.\n\n{{portalUrl}}",
    tokens: ["artistName", "petName", "orderShort", "portalUrl"],
  },
  {
    eventType: "overdue_artist",
    label: "Overdue reminder for the artist",
    subject: "Artwork overdue: {{petName}}",
    heading: "This artwork is past the deadline",
    body: "Hi {{artistName}}, {{petName}} (#{{orderShort}}) was due {{dueAt}} and is still open.\n\n{{portalUrl}}",
    tokens: ["artistName", "petName", "orderShort", "dueAt", "portalUrl"],
  },
  {
    eventType: "overdue_admin",
    label: "Overdue reminder for admin",
    subject: "Overdue artwork: {{petName}}",
    heading: "An artwork deadline has passed",
    body: "{{petName}} (#{{orderShort}}) was due {{dueAt}} and is still open. Artist: {{artistName}}.",
    tokens: ["petName", "orderShort", "dueAt", "artistName"],
  },
];

const DEFAULTS = new Map(EMAIL_TEMPLATE_DEFAULTS.map((template) => [template.eventType, template]));

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => escapeHtml(vars[key] ?? ""));
}

function noteHtml(note: string) {
  const points = parseChangePoints(note);
  if (!points) {
    const text = escapeHtml(note).replace(/\n/g, "<br>");
    return text
      ? `<p style="background: #fcf9f6; border-radius: 12px; padding: 12px 16px;">${text}</p>`
      : "";
  }
  const items = points.map((point) => `<li>${escapeHtml(point)}</li>`).join("");
  return `<ol style="background: #fcf9f6; border-radius: 12px; padding: 12px 16px 12px 32px;">${items}</ol>`;
}

function previewImageHtml(url: string) {
  const safe = escapeHtml(url);
  if (!safe) return "";
  return `<img src="${safe}" alt="Portrait preview" style="width: 100%; max-width: 420px; border-radius: 12px; margin: 16px 0;" />`;
}

function linkHtml(url: string, label: string) {
  const safe = escapeHtml(url);
  if (!safe) return "";
  return `<a href="${safe}" style="color: #8A6651; font-weight: 700;">${escapeHtml(label)}</a>`;
}

function applyRich(template: string, vars: Record<string, string>) {
  return template
    .replaceAll("{{note}}", noteHtml(vars.note || ""))
    .replaceAll("{{previewImage}}", previewImageHtml(vars.previewUrl || ""))
    .replaceAll("{{trackingUrl}}", vars.trackingUrl ? `<p>${linkHtml(vars.trackingUrl, "Open the shipment link")}</p>` : "")
    .replaceAll("{{portalUrl}}", vars.portalUrl ? `<p>${linkHtml(vars.portalUrl, "Open the dashboard")}</p>` : "");
}

function bodyHtml(body: string) {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => (block.startsWith("<") ? block : `<p>${block.replace(/\n/g, "<br>")}</p>`))
    .join("");
}

export async function loadEmailTemplate(eventType: string): Promise<EmailTemplate> {
  const fallback = DEFAULTS.get(eventType);
  if (!fallback) {
    return {
      eventType,
      label: eventType,
      subject: "",
      heading: "",
      body: "",
      tokens: [],
    };
  }
  const { data, error } = await supabaseAdmin
    .from("email_templates")
    .select("subject, heading, body")
    .eq("event_type", eventType)
    .maybeSingle();
  if (error || !data) return fallback;
  return {
    ...fallback,
    subject: String(data.subject || fallback.subject),
    heading: String(data.heading || fallback.heading),
    body: String(data.body || fallback.body),
  };
}

export async function listEmailTemplates(): Promise<{ templates: EmailTemplate[]; missing: boolean }> {
  const { data, error } = await supabaseAdmin.from("email_templates").select("event_type, subject, heading, body");
  if (error) {
    return { templates: EMAIL_TEMPLATE_DEFAULTS, missing: tableMissing(error) };
  }
  const saved = new Map((data ?? []).map((row) => [String(row.event_type), row]));
  return {
    missing: false,
    templates: EMAIL_TEMPLATE_DEFAULTS.map((template) => {
      const row = saved.get(template.eventType);
      if (!row) return template;
      return {
        ...template,
        subject: String(row.subject || template.subject),
        heading: String(row.heading || template.heading),
        body: String(row.body || template.body),
      };
    }),
  };
}

export async function renderPortalEmail(eventType: string, vars: Record<string, string>) {
  const template = await loadEmailTemplate(eventType);
  const subject = fill(template.subject, vars).trim() || template.subject;
  const heading = fill(template.heading, vars).trim() || subject;
  const rich = applyRich(template.body, vars);
  return {
    subject,
    heading,
    bodyHtml: bodyHtml(fill(rich, vars)),
  };
}

export function defaultEmailTemplate(eventType: string) {
  return DEFAULTS.get(eventType) || null;
}
