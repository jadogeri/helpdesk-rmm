// frontend/app/ticket-portal/components/CreateTicketForm.tsx

import { AnimatePresence, motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import styles from "../../page.module.css";
import type { IssueOption, TicketForm } from "../hooks/useTicketPortal";

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
            <label className={styles.fieldFull}><span>Ticket title <b>*</b></span><input required maxLength={160} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. I can’t connect to the office network" /></label>
            <label className={`${styles.fieldFull} ${styles.fieldWide}`}><span>Description <b>*</b></span><textarea required rows={3} maxLength={4000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What happened? Include useful steps or error messages." /></label>
          </div>
        </section>

        <section className={styles.formSection}>
          <div className={styles.sectionHeading}><span>2</span><div><h3>Issue type</h3><p>Static sample categories. Ticket creation also requires the selected issue to exist in the backend.</p></div></div>
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
              <span>Priority code <em>Optional</em></span>
              <input type="number" min="1" step="1" inputMode="numeric" value={form.ticketPriorityCode} onChange={(event) => setForm((current) => ({ ...current, ticketPriorityCode: event.target.value }))} placeholder="Leave blank for default" />
              <em>Use the numeric priority code configured in your helpdesk.</em>
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
