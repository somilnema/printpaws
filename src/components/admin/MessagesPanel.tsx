"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  getMessageSettings,
  resetEmailTemplate,
  saveEmailTemplate,
  saveVendorApi,
  type MessageSettings,
} from "@/app/actions/messageActions";
import { buttonClass, errorClass, ghostButtonClass, inputClass, okClass, Panel, warnClass } from "@/components/admin/ui";
import type { EmailTemplate } from "@/lib/email-templates";

export function MessagesPanel() {
  const [settings, setSettings] = useState<MessageSettings | null>(null);
  const [selected, setSelected] = useState("");
  const [subject, setSubject] = useState("");
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function applyTemplate(template: EmailTemplate) {
    setSelected(template.eventType);
    setSubject(template.subject);
    setHeading(template.heading);
    setBody(template.body);
  }

  function applySettings(next: MessageSettings) {
    setSettings(next);
    setEnabled(next.vendor.enabled);
    setEndpointUrl(next.vendor.endpointUrl);
    setApiKey("");
    const current = next.templates.find((template) => template.eventType === selected) || next.templates[0];
    if (current) applyTemplate(current);
  }

  useEffect(() => {
    getMessageSettings()
      .then((next) => {
        if (next) applySettings(next);
      })
      .finally(() => setLoading(false));
  }, []);

  const template = settings?.templates.find((item) => item.eventType === selected);

  async function handleTemplate(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    const result = await saveEmailTemplate({ eventType: selected, subject, heading, body });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice("Email saved. The next message uses this wording.");
    const next = await getMessageSettings();
    if (next) applySettings(next);
  }

  async function handleReset() {
    if (!selected) return;
    setBusy(true);
    setError("");
    setNotice("");
    const result = await resetEmailTemplate(selected);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice("Restored the original wording.");
    const next = await getMessageSettings();
    if (next) applySettings(next);
  }

  async function handleVendor(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const result = await saveVendorApi({ enabled, endpointUrl, apiKey });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setNotice("Vendor API saved.");
    setApiKey("");
    const next = await getMessageSettings();
    if (next) applySettings(next);
  }

  if (loading) return <p className="text-sm text-[#667085]">Loading…</p>;
  if (!settings) return <p className="text-sm text-[#667085]">Sign in again to edit messages.</p>;

  return (
    <div className="space-y-4">
      {settings.templatesMissing || settings.vendor.missing ? <p className={warnClass}>Run supabase/operations.sql in the Supabase SQL editor, then refresh.</p> : null}
      {error ? <p className={errorClass}>{error}</p> : null}
      {notice ? <p className={okClass}>{notice}</p> : null}

      <Panel title="Email wording" note="These are the emails the system sends. Use the tokens in double braces. They are filled in for each order.">
        <form onSubmit={handleTemplate} className="space-y-3">
          <select
            value={selected}
            onChange={(e) => {
              const next = settings.templates.find((item) => item.eventType === e.target.value);
              if (next) applyTemplate(next);
            }}
            className={inputClass}
          >
            {settings.templates.map((item) => (
              <option key={item.eventType} value={item.eventType}>
                {item.label}
              </option>
            ))}
          </select>
          {template?.hint ? <p className="text-xs text-[#667085]">{template.hint}</p> : null}
          {template?.tokens.length ? (
            <p className="text-xs text-[#98a2b3]">Tokens: {template.tokens.map((token) => `{{${token}}}`).join(", ")}</p>
          ) : null}
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" required className={inputClass} />
          <input value={heading} onChange={(e) => setHeading(e.target.value)} placeholder="Heading inside the email" className={inputClass} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={8} className={inputClass} />
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy} className={buttonClass}>
              {busy ? "Saving…" : "Save email"}
            </button>
            <button type="button" disabled={busy} onClick={handleReset} className={ghostButtonClass}>
              Restore original
            </button>
          </div>
        </form>
      </Panel>

      <Panel
        title="Vendor API"
        note="When a picture is approved, Peternity can send the order to your vendor. If they reply with a tracking link, it is saved and the customer is emailed. If the call fails, or no link comes back, the shipment desk still pastes the link."
      >
        <form onSubmit={handleVendor} className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
            Send approved orders to the vendor
          </label>
          <input
            value={endpointUrl}
            onChange={(e) => setEndpointUrl(e.target.value)}
            placeholder="https://vendor.example/orders"
            className={inputClass}
          />
          <input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={settings.vendor.hasKey ? `API key saved ${settings.vendor.keyHint}` : "API key"}
            className={inputClass}
            autoComplete="off"
          />
          <p className="text-xs text-[#98a2b3]">
            The vendor receives the order as JSON and can reply with {`{ "trackingUrl": "https://..." }`}. Leave the key blank to keep the saved one.
          </p>
          <button type="submit" disabled={busy} className={buttonClass}>
            {busy ? "Saving…" : "Save vendor API"}
          </button>
        </form>
      </Panel>
    </div>
  );
}
