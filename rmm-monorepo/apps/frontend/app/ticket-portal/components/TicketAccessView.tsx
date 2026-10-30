"use client";

import { useState, type FormEvent } from "react";
import { API_ENDPOINTS } from "@repo/constants";
import styles from "../../page.module.css";
import { apiFetcher } from "../utils/fetcher";
import type { Action } from "../hooks/useTicketPortal";

type TicketSummary = {
  ticketId: string;
  ticketNumber: string;
  title: string;
  description: string;
  statusName: string;
  createdDate: string | null;
  completedDate: string | null;
  hardwareAssets?: Array<{ name: string; status: string }>;
};

type TicketResponse = {
  description: string;
  fromDisplay: string;
  createdDate: string | null;
};

interface TicketAccessViewProps {
  mode: Extract<Action, "view" | "update" | "close">;
}

const actionTitle = {
  view: "Track your ticket",
  update: "Reply to your ticket",
  close: "Request ticket closure",
} as const;

export function TicketAccessView({ mode }: TicketAccessViewProps) {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [ticket, setTicket] = useState<TicketSummary | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [reply, setReply] = useState("");
  const [cc, setCc] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadTicket(ticketReference = reference.trim(), ticketEmail = email.trim()) {
    if (!ticketReference || !ticketEmail) {
      setError("Enter your ticket number and the email on its contact profile.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await apiFetcher<{ ticket: TicketSummary; responses: TicketResponse[] }>(
        API_ENDPOINTS.PROXY.TICKETS.PORTAL_LOOKUP,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ reference: ticketReference, email: ticketEmail }),
        },
      );
      setTicket(result.ticket);
      setReference(result.ticket.ticketNumber || result.ticket.ticketId);
      setResponses(result.responses);
    } catch (requestError) {
      setTicket(null);
      setResponses([]);
      setError(requestError instanceof Error ? requestError.message : "Ticket could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    await loadTicket();
  }

  async function submitReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticket) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const addresses = cc.split(/[,\n;]/).map((item) => item.trim()).filter(Boolean);
      await apiFetcher(
        API_ENDPOINTS.PROXY.TICKETS.PORTAL_RESPONSES(ticket.ticketId),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: email.trim(), description: reply, cc: addresses }),
        },
      );
      setReply("");
      setCc("");
      await loadTicket(ticket.ticketId, email);
      setNotice("Your reply was added to the ticket.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Reply could not be sent.");
    } finally {
      setSaving(false);
    }
  }

  async function submitClose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ticket) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const addresses = cc.split(/[,\n;]/).map((item) => item.trim()).filter(Boolean);
      await apiFetcher(
        API_ENDPOINTS.PROXY.TICKETS.PORTAL_CLOSE(ticket.ticketId),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            description: reply,
            cc: addresses,
            ...(rating ? { rating: Number(rating) } : {}),
          }),
        },
      );
      await loadTicket(ticket.ticketId, email);
      setNotice("Your closure request was added to the ticket. It stays open until the service desk closes it.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Ticket could not be closed.");
    } finally {
      setSaving(false);
    }
  }

  const ticketIsClosed =
    ticket?.statusName.toLowerCase().includes("closed") || !!ticket?.completedDate;

  return (
    <section className={styles.formCard}>
      <div className={styles.cardHeader}>
        <div>
          <span className={styles.kicker}>YOUR TICKETS</span>
          <h2>{actionTitle[mode]}</h2>
          <p>Use the contact email recorded on the ticket.</p>
        </div>
      </div>

      {!ticket && (
        <form className={styles.accessForm} onSubmit={handleLookup}>
          <label className={styles.fieldFull}>
            <span>Ticket number or ID <b>*</b></span>
            <input
              required
              autoComplete="off"
              value={reference}
              onChange={(event) => setReference(event.target.value)}
              placeholder="e.g. 12345"
            />
          </label>
          <label className={styles.fieldFull}>
            <span>Contact email <b>*</b></span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <p className={styles.accessNote}>
            The server checks that this email belongs to the ticket’s contact. Email matching is not a mailbox sign-in check.
          </p>
          <button className={styles.submitButton} type="submit" disabled={loading}>
            {loading ? "Checking…" : "Find ticket"} <span aria-hidden="true">→</span>
          </button>
        </form>
      )}

      {error && <div className={styles.errorNotice} role="alert"><strong>Couldn’t complete that</strong><span>{error}</span></div>}
      {notice && <div className={styles.successNotice} role="status"><span className={styles.successIcon}>✓</span><span><strong>Updated</strong><small>{notice}</small></span></div>}

      {ticket && (
        <div className={styles.ticketAccessContent}>
          <article className={styles.ticketSummary}>
            <div className={styles.ticketSummaryTop}>
              <div>
                <span className={styles.kicker}>TICKET {ticket.ticketNumber || ticket.ticketId}</span>
                <h3>{ticket.title}</h3>
              </div>
              <span className={styles.ticketStatus}>{ticket.statusName}</span>
            </div>
            <p>{ticket.description}</p>
            <div className={styles.ticketTimeline} aria-label="Ticket status timeline">
              <span className={styles.timelineDone}><i />Submitted</span>
              <span className={ticketIsClosed ? styles.timelineDone : styles.timelineCurrent}><i />Current: {ticket.statusName}</span>
              <span className={ticketIsClosed ? styles.timelineDone : styles.timelinePending}><i />Closed</span>
            </div>
            {!!ticket.hardwareAssets?.length && (
              <div className={styles.hardwareStatus}>
                <strong>Linked device status</strong>
                {ticket.hardwareAssets.map((asset, index) => <span key={`${asset.name}-${index}`}>{asset.name}: {asset.status}</span>)}
              </div>
            )}
          </article>

          <section className={styles.responsesSection}>
            <h3>Updates</h3>
            {responses.length ? responses.map((item, index) => (
              <article className={styles.responseItem} key={`${item.createdDate ?? "response"}-${index}`}>
                <div><strong>{item.fromDisplay || "Service desk"}</strong>{item.createdDate && <time>{new Date(item.createdDate).toLocaleString()}</time>}</div>
                <p>{item.description}</p>
              </article>
            )) : <p className={styles.accessNote}>No replies have been added yet.</p>}
          </section>

          {mode === "update" && !ticketIsClosed && (
            <form className={styles.portalActionForm} onSubmit={submitReply}>
              <label className={styles.fieldFull}><span>Your reply <b>*</b></span><textarea required rows={3} maxLength={4000} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Add information for the service desk." /></label>
              <label className={styles.fieldFull}><span>CC email addresses <em>Optional · comma separated</em></span><input value={cc} onChange={(event) => setCc(event.target.value)} placeholder="colleague@example.com" /></label>
              <button className={styles.submitButton} type="submit" disabled={saving}>{saving ? "Sending…" : "Send reply"} <span aria-hidden="true">→</span></button>
            </form>
          )}

          {mode === "close" && !ticketIsClosed && (
            <form className={styles.portalActionForm} onSubmit={submitClose}>
              <label className={styles.fieldFull}><span>Why should this ticket be closed? <b>*</b></span><textarea required rows={3} maxLength={4000} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Tell us what was resolved or why you no longer need help." /></label>
              <label className={styles.fieldFull}><span>Rate the support <em>Optional</em></span><select value={rating} onChange={(event) => setRating(event.target.value)}><option value="">Skip rating</option>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score} / 5</option>)}</select></label>
              <label className={styles.fieldFull}><span>CC email addresses <em>Optional · comma separated</em></span><input value={cc} onChange={(event) => setCc(event.target.value)} placeholder="colleague@example.com" /></label>
              <button className={styles.submitButton} type="submit" disabled={saving}>{saving ? "Sending…" : "Request closure"} <span aria-hidden="true">→</span></button>
            </form>
          )}

          {ticketIsClosed && <p className={styles.accessNote}>This ticket is already closed.</p>}
          <button className={styles.backButton} type="button" onClick={() => { setTicket(null); setNotice(""); setError(""); }}>Look up another ticket</button>
        </div>
      )}
    </section>
  );
}
