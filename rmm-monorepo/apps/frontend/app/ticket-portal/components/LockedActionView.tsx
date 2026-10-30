import { motion } from "framer-motion";
import styles from "../../page.module.css";
import type { Action } from "../hooks/useTicketPortal";

interface LockedActionViewProps {
  selectedAction: Action;
  activeAction: { label: string; description: string };
  chooseAction: (action: Action) => void;
}

export function LockedActionView({ selectedAction, activeAction, chooseAction }: LockedActionViewProps) {
  return (
    <motion.section key={selectedAction} className={styles.lockedCard} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }}>
      <span className={styles.kicker}>OWNERSHIP CHECK REQUIRED</span>
      <div className={styles.lockIcon} aria-hidden="true">⌑</div>
      <h2>{activeAction.label} is not enabled yet</h2>
      <p>{activeAction.description} Before this portal can access a saved ticket, it needs to verify that you own it. Email plus a ticket number alone is not enough to protect ticket details.</p>
      <div className={styles.verificationNote}><strong>What’s needed</strong><span>A one-time verification code or a code sent to your email before viewing or changing a ticket.</span></div>
      <button type="button" className={styles.backButton} onClick={() => chooseAction("create")}>Back to create a ticket <span aria-hidden="true">→</span></button>
    </motion.section>
  );
}
