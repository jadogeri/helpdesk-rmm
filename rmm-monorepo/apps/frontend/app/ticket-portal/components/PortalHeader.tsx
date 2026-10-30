import styles from "../../page.module.css";
import type { Theme } from "../hooks/useTicketPortal";

interface PortalHeaderProps {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
}

export function PortalHeader({ theme, setTheme }: PortalHeaderProps) {
  return (
    <header className={styles.topbar}>
      <a className={styles.brand} href="/" aria-label="RMM service desk home">
        <span className={styles.brandMark}>R</span>
        <span>RMM <span className={styles.brandSub}>/ SERVICE DESK</span></span>
      </a>
      <div className={styles.topbarRight}>
        <span className={styles.online}><i /> Helpdesk portal</span>
        <button className={styles.themeToggle} type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={"Switch to " + (theme === "light" ? "dark" : "light") + " mode"}>
          <span aria-hidden="true">{theme === "light" ? "☾" : "☀"}</span>
          <span>{theme === "light" ? "Dark mode" : "Light mode"}</span>
        </button>
      </div>
    </header>
  );
}
