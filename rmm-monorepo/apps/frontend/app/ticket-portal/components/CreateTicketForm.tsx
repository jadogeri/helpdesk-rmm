// frontend/app/ticket-portal/components/CreateTicketForm.tsx

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { API_ENDPOINTS } from "@repo/constants";
import styles from "../../page.module.css";
import type { IssueOption, TicketForm } from "../hooks/useTicketPortal";
import { apiFetcher } from "../utils/fetcher";

const TICKET_TEMPLATES = [
  { title: "Printer not responding", description: "Printer name or location:\nWhat happens when you try to print?\nWhen did it last work?", priority: "3" },
  { title: "VPN connection issue", description: "Where are you connecting from?\nWhat error message do you see?\nWhen did the issue start?", priority: "3" },
  { title: "Sign-in or password issue", description: "Which account or application is affected?\nWhat message do you see?\nWhen did you last sign in successfully?", priority: "2" },
] as const;

type KnowledgeSuggestion = { title: string; excerpt: string };

function VoiceNoteRecorder({ onRecorded }: { onRecorded: (file: File | null) => void }) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
        throw new Error("Voice recording is not supported in this browser.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const preferredType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
        .find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = preferredType
        ? new MediaRecorder(stream, { mimeType: preferredType })
        : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const extension = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
        const file = new File(chunksRef.current, `voice-note.${extension}`, { type });
        if (file.size > 10 * 1024 * 1024) {
          setError("That voice note is larger than the 10 MB limit.");
          onRecorded(null);
        } else {
          onRecorded(file);
        }
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        setRecording(false);
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch (recordError) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setError(recordError instanceof Error ? recordError.message : "Microphone access was not available.");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  return (
    <div className={styles.voiceRecorder}>
      <button className={styles.utilityButton} type="button" onClick={recording ? stopRecording : startRecording}>
        {recording ? "Stop recording" : "Record voice note"}
      </button>
      <small>{recording ? "Recording from your microphone…" : "Your browser will ask for microphone permission."}</small>
      {error && <em className={styles.fieldError} role="alert">{error}</em>}
    </div>
  );
}

const PRIORITY_OPTIONS = [
  { code: 1, label: "Low", description: "Non-urgent request or minor cosmetic issue." },
  { code: 2, label: "Medium / Normal", description: "Typical user request; the usual default." },
  { code: 3, label: "High", description: "Work is blocked for one or more users." },
  { code: 4, label: "Urgent", description: "Time-sensitive issue affecting business operations." },
  { code: 5, label: "Critical", description: "Critical outage or widespread service disruption." },
] as const;

interface CreateTicketFormProps {
  form: TicketForm;
  setForm: React.Dispatch<React.SetStateAction<TicketForm>>;
  issues: IssueOption[];
  loading: boolean;
  submitting: boolean;
  submitError: string;
  ticketNumber: string;
  setTicketNumber: (num: string) => void;
  attachmentWarning: string;
  submitTicket: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function CreateTicketForm({
  form, setForm, issues, loading, submitting, submitError, ticketNumber, setTicketNumber, attachmentWarning, submitTicket
}: CreateTicketFormProps) {
  const [screenshotError, setScreenshotError] = useState("");
  const [clipboardError, setClipboardError] = useState("");
  const [suggestions, setSuggestions] = useState<KnowledgeSuggestion[]>([]);
  const searchText = `${form.title} ${form.description}`.trim();

  useEffect(() => {
    if (searchText.length < 3) {
      setSuggestions([]);
      return;
    }
    let active = true;
    const timer = window.setTimeout(() => {
      void apiFetcher<KnowledgeSuggestion[]>(
        `${API_ENDPOINTS.PROXY.TICKETS.PORTAL_KNOWLEDGE_BASE}?q=${encodeURIComponent(searchText.slice(0, 160))}`,
      ).then((items) => {
        if (active) setSuggestions(items);
      }).catch(() => {
        if (active) setSuggestions([]);
      });
    }, 350);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchText]);

  // Directly calculate cascading sub-issues here so that shifts re-evaluate instantly
  const selectedParent = issues.find((item) => item.id === form.issueTypeId);
  const activeChildIssues = selectedParent?.children ?? [];

  return (
    <motion.section key="create" className={styles.formCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
      <div className={styles.cardHeader}>
        <div><span className={styles.kicker}>NEW TICKET</span><h2>What can we help with?</h2><p>Share the details we need to route your request.</p></div>
        <span className={styles.cardCount}>01 <i>/ 01</i></span>
      </div>
      
      <AnimatePresence mode="wait">
        {ticketNumber && (
          <motion.div className={styles.successNotice} role="status" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <span className={styles.successIcon}>✓</span><span><strong>Ticket created</strong><small>{`Ticket number ${ticketNumber}. Keep it for reference.`}{attachmentWarning && <><br />{attachmentWarning}</>}</small></span>
            <button type="button" className={styles.dismiss} onClick={() => setTicketNumber("")} aria-label="Dismiss success message">×</button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {submitError && <div className={styles.errorNotice} role="alert"><strong>Ticket not sent</strong><span>{submitError}</span></div>}

      <form onSubmit={submitTicket} className={styles.form}>
        <section className={styles.formSection}>
          <div className={styles.sectionHeading}><span>1</span><div><h3>Your request</h3><p>Use the email address listed for your service-desk contact.</p></div></div>
          <div className={styles.requestFields}>
            <label className={styles.fieldFull}><span>Email address <b>*</b></span><input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" /></label>
            <label className={styles.fieldFull}><span>Start from a template <em>Optional</em></span><select defaultValue="" onChange={(event) => {
              const template = TICKET_TEMPLATES[Number(event.target.value)];
              if (template) setForm((current) => ({ ...current, title: template.title, description: template.description, ticketPriorityCode: template.priority }));
            }}><option value="">Choose a common issue</option>{TICKET_TEMPLATES.map((template, index) => <option key={template.title} value={index}>{template.title}</option>)}</select></label>
            <label className={styles.fieldFull}><span>Ticket title <b>*</b></span><input required maxLength={160} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. I can’t connect to the office network" /></label>
            <div className={`${styles.fieldFull} ${styles.fieldWide}`}><label htmlFor="ticket-description"><span>Description <b>*</b></span></label><textarea id="ticket-description" required rows={3} maxLength={4000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What happened? Include useful steps or error messages." />
              <button className={styles.utilityButton} type="button" onClick={async () => {
                setClipboardError("");
                try {
                  const clipboardText = await navigator.clipboard.readText();
                  if (!clipboardText.trim()) {
                    setClipboardError("The clipboard is empty.");
                    return;
                  }
                  setForm((current) => ({ ...current, description: `${current.description.trim()}\n\n\`\`\`\n${clipboardText.slice(0, 3000)}\n\`\`\``.trim().slice(0, 4000) }));
                } catch {
                  setClipboardError("Clipboard access was blocked. Paste into the description field instead.");
                }
              }}>Paste logs from clipboard</button>
              {clipboardError && <em className={styles.fieldError} role="alert">{clipboardError}</em>}
            </div>
          </div>
        </section>

        {suggestions.length > 0 && (
          <section className={styles.kbSuggestions} aria-live="polite">
            <span className={styles.kicker}>SELF-HELP SUGGESTIONS</span>
            <p>Public knowledge-base articles that may help:</p>
            {suggestions.map((item, index) => (
              <article key={`${item.title}-${index}`}><strong>{item.title}</strong>{item.excerpt && <small>{item.excerpt}</small>}</article>
            ))}
          </section>
        )}

        <section className={styles.formSection}>
          <div className={styles.sectionHeading}><span>2</span><div><h3>Issue type</h3><p>Choose the closest match so your request reaches the right team.</p></div></div>
          <label className={styles.fieldFull}><span>Issue type <b>*</b></span><select required value={form.issueTypeId} onChange={(event) => setForm((current) => ({ ...current, issueTypeId: event.target.value, childIssueTypeId: "" }))} disabled={loading}>
            <option value="">Select an issue type</option>{issues.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select></label>
          
          {activeChildIssues.length > 0 && (
            <label className={styles.fieldFull}><span>Sub-issue <b>*</b></span><select required value={form.childIssueTypeId} onChange={(event) => setForm((current) => ({ ...current, childIssueTypeId: event.target.value }))}><option value="">Select one sub-issue</option>{activeChildIssues.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><em>Select one child issue; only that choice is attached to the ticket.</em></label>
          )}
        </section>

        <details className={styles.optionalDetails}>
          <summary className={styles.optionalSummary}>
            <span><strong>Optional details</strong><small>Priority, due date, or a screenshot</small></span>
            <span className={styles.optionalChevron} aria-hidden="true">+</span>
          </summary>
          <div className={styles.optionalGrid}>
            <label className={styles.fieldFull}>
              <span>Due date <em>Optional</em></span>
              <input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
            </label>
            <label className={styles.fieldFull}>
              <span>Priority <em>Optional</em></span>
              <select value={form.ticketPriorityCode} onChange={(event) => setForm((current) => ({ ...current, ticketPriorityCode: event.target.value }))}>
                <option value="">Use default</option>
                {PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority.code} value={priority.code}>
                    {priority.code} — {priority.label}
                  </option>
                ))}
              </select>
              <em>{PRIORITY_OPTIONS.find((priority) => String(priority.code) === form.ticketPriorityCode)?.description ?? "Code 2 (Medium / Normal) is used when no priority is selected."}</em>
            </label>
            <label className={`${styles.fieldFull} ${styles.fieldWide}`}>
              <span>Screenshot <em>Optional · PNG, JPG, or WebP · 5 MB max</em></span>
              <input
                key={form.screenshot?.name ?? "empty-screenshot"}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0] ?? null;
                  if (file && file.size > 5 * 1024 * 1024) {
                    setScreenshotError("That image is larger than the 5 MB limit.");
                    event.currentTarget.value = "";
                    return;
                  }
                  if (file && !["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
                    setScreenshotError("Choose a PNG, JPG, or WebP image.");
                    event.currentTarget.value = "";
                    return;
                  }
                  setScreenshotError("");
                  setForm((current) => ({ ...current, screenshot: file }));
                }}
              />
              {screenshotError && <em className={styles.fieldError} role="alert">{screenshotError}</em>}
              {form.screenshot && (
                <span className={styles.fileInfo}>
                  {form.screenshot.name}
                  <button type="button" onClick={() => setForm((current) => ({ ...current, screenshot: null }))}>Remove</button>
                </span>
              )}
            </label>
            <div className={`${styles.fieldFull} ${styles.fieldWide}`}>
              <span className={styles.optionalLabel}>Voice note <em>Optional · 10 MB max</em></span>
              <VoiceNoteRecorder onRecorded={(voiceNote) => setForm((current) => ({ ...current, voiceNote }))} />
              {form.voiceNote && <span className={styles.fileInfo}>{form.voiceNote.name}<button type="button" onClick={() => setForm((current) => ({ ...current, voiceNote: null }))}>Remove</button></span>}
            </div>
            <label className={`${styles.fieldFull} ${styles.fieldWide} ${styles.checkboxField}`}>
              <input type="checkbox" checked={form.includeDiagnostics} onChange={(event) => setForm((current) => ({ ...current, includeDiagnostics: event.target.checked }))} />
              <span>Include browser diagnostics <em>Optional · browser, screen, language and connection state</em></span>
            </label>
          </div>
        </details>

        <div className={styles.formFooter}>
          <span className={styles.secureNote}><span aria-hidden="true">⌑</span> Ticket number is a reference, not an access credential.</span>
          <button className={styles.submitButton} type="submit" disabled={loading || submitting}>
            {submitting ? <><i className={styles.spinner} /> Sending…</> : <>Create ticket <span aria-hidden="true">→</span></>}
          </button>
        </div>
      </form>
    </motion.section>
  );
}
