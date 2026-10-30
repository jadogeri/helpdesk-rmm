import { motion } from "framer-motion";
import styles from "../../page.module.css";

export function PortalHero() {
  return (
    <motion.section className={styles.hero} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <div className={styles.heroCopy}>
        <div className={styles.eyebrow}><span /> SUPPORT REQUEST</div>
        <h1>Support that<br /><span>moves you forward.</span></h1>
        <p>Choose what you need and we’ll help get it sorted.</p>
      </div>
      <motion.div className={styles.heroBadge} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12, duration: 0.4 }}>
        <span className={styles.badgeIcon} aria-hidden="true">✓</span>
        <span><strong>Here when you need us</strong><small>One request, one place.</small></span>
      </motion.div>
    </motion.section>
  );
}
