// frontend/app/ticket-portal/page.tsx

"use client";

import { AnimatePresence } from "framer-motion";
import { ActionNav } from "./components/ActionNav";
import { CreateTicketForm } from "./components/CreateTicketForm";
import { PortalHeader } from "./components/PortalHeader";
import { PortalHero } from "./components/PortalHero";
import { useTicketPortal } from "./hooks/useTicketPortal";
import { TicketAccessView } from "./components/TicketAccessView";
import { SidePanel } from "./components/SidePanel";
import styles from "../page.module.css";
import Providers from "./provider";

// 2. Extract layout workspace tree content out into an inner component shell
function TicketPortalContent() {
  const portal = useTicketPortal();

  return (
    <main className={styles.shell}>
      <PortalHeader theme={portal.theme} setTheme={portal.setTheme} />
      <PortalHero />
      <ActionNav selectedAction={portal.selectedAction} chooseAction={portal.chooseAction} />

      <div className={styles.contentGrid}>
        <AnimatePresence mode="wait" initial={false}>
          {portal.selectedAction === "create" ? (
            <CreateTicketForm
              form={portal.form}
              setForm={portal.setForm}
              issues={portal.issues}
              loading={portal.loading}
              submitting={portal.submitting}
              submitError={portal.submitError}
              ticketNumber={portal.ticketNumber}
              setTicketNumber={portal.setTicketNumber}
              attachmentWarning={portal.attachmentWarning}
              submitTicket={portal.submitTicket}
            />
          ) : (
            <TicketAccessView mode={portal.selectedAction} />
          )}
        </AnimatePresence>
        
        <SidePanel />
      </div>
    </main>
  );
}

// 3. Export default entrypoint cleanly wrapped inside the Hydration cache Provider layer
export default function Home() {
  return (
    <Providers>
      <TicketPortalContent />
    </Providers>
  );
}
