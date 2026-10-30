import styles from "../../page.module.css";

export function SidePanel() {
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
      <div className={styles.statusCard}>
        <span className={styles.statusPulse} />
        <div><strong>System Status</strong><small>All helpdesk services operational.</small></div>
      </div>
    </aside>
  );
}
