// frontend/app/ticket-portal/components/CreateTicketForm.tsx

import { AnimatePresence, motion } from "framer-motion";
import type { FormEvent } from "react";
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
  submitTicket: (e: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function CreateTicketForm({
  form, setForm, issues, loading, submitting, submitError, ticketNumber, setTicketNumber, submitTicket
}: CreateTicketFormProps) {
  
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
            <span className={styles.successIcon}>✓</span><span><strong>Ticket created</strong><small>{`Ticket number ${ticketNumber}. Keep it for reference.`}</small></span>
            <button type="button" className={styles.dismiss} onClick={() => setTicketNumber("")} aria-label="Dismiss success message">×</button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {submitError && <div className={styles.errorNotice} role="alert"><strong>Ticket not sent</strong><span>{submitError}</span></div>}

      <form onSubmit={submitTicket} className={styles.form}>
        <section className={styles.formSection}>
          <div className={styles.sectionHeading}><span>1</span><div><h3>Your request</h3><p>Use the email address listed for your service-desk contact.</p></div></div>
          <label className={styles.fieldFull}><span>Email address <b>*</b></span><input type="email" autoComplete="email" required maxLength={254} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" /></label>
          <label className={styles.fieldFull}><span>Ticket title <b>*</b></span><input required maxLength={160} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. I can’t connect to the office network" /></label>
          <label className={styles.fieldFull}><span>Description <b>*</b></span><textarea required rows={5} maxLength={4000} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What happened? Include useful steps or error messages." /></label>
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
