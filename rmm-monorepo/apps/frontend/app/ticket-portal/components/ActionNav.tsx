import { motion } from "framer-motion";
import styles from "../../page.module.css";
import { actions, type Action } from "../hooks/useTicketPortal";

interface ActionNavProps {
  selectedAction: Action;
  chooseAction: (action: Action) => void;
}

export function ActionNav({ selectedAction, chooseAction }: ActionNavProps) {
  return (
    <nav className={styles.actionNav} aria-label="Ticket actions">
      {actions.map((action, index) => (
        <motion.button
          key={action.id}
          type="button"
          className={styles.actionCard + (selectedAction === action.id ? " " + styles.actionSelected : "")}
          onClick={() => chooseAction(action.id)}
          aria-pressed={selectedAction === action.id}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * index, duration: 0.3 }}
          whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
        >
          <span className={styles.actionIcon} aria-hidden="true">{action.icon}</span>
          <span className={styles.actionLabel}>{action.label}</span>
          <span className={styles.actionDescription}>{action.description}</span>
        </motion.button>
      ))}
    </nav>
  );
}
