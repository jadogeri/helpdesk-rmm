import styles from "../../page.module.css";

export function SidePanel() {
  const statusUrl = safeHttpsUrl(process.env.NEXT_PUBLIC_STATUS_PAGE_URL);
  const remoteSupportUrl = safeHttpsUrl(process.env.NEXT_PUBLIC_REMOTE_SUPPORT_URL);
  const statusMessage = process.env.NEXT_PUBLIC_STATUS_MESSAGE?.trim();

  return (
    <aside className={styles.sidePanel}>
      <div className={styles.sideCard}>
        <span className={styles.sideEyebrow}>GOOD TO KNOW</span>
        <h3>A little context goes a long way.</h3>
        <p>Add the exact error message and what you were doing when it happened. It helps us find a fix sooner.</p>
        <div className={styles.tipLine}><span>01</span><div><strong>Use your work email</strong><small>The service desk matches it to your contact record.</small></div></div>
        <div className={styles.tipLine}><span>02</span><div><strong>Be specific</strong><small>What’s affected, and when did it start?</small></div></div>
        <div className={styles.tipLine}><span>03</span><div><strong>Keep your ticket number</strong><small>It helps us identify your request; it doesn’t grant access.</small></div></div>
      </div>
      {statusMessage && <div className={styles.statusBanner} role="status">
        <strong>Service notice</strong>
        <span>{statusMessage}</span>
        {statusUrl && <a href={statusUrl} target="_blank" rel="noreferrer">View status page ↗</a>}
      </div>}
      <div className={styles.statusCard}>
        <span className={styles.statusPulse} />
        <div><strong>System Status</strong><small>{statusUrl ? <a href={statusUrl} target="_blank" rel="noreferrer">Open service status page ↗</a> : "Status page is not configured."}</small></div>
      </div>
      {remoteSupportUrl && <a className={styles.statusCard} href={remoteSupportUrl} target="_blank" rel="noreferrer">
        <span className={styles.statusPulse} />
        <div><strong>Start remote support</strong><small>Opens the configured support session link.</small></div>
      </a>}
    </aside>
  );
}

function safeHttpsUrl(value: string | undefined): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}
