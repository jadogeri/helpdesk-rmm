// frontend/app/ticket-portal/hooks/useTicketPortal.ts

import { useState, useEffect, type FormEvent } from "react";
import { text, type Row } from "../utils/dataMappers";
import { useIssueTypes } from "../queries/useIssueTypeQueries"; 
import { useCreateTicket } from "../queries/useTicketQueries";
import { useServiceItems } from "../queries/useServiceItemQueries";
import { useLocations } from "../queries/useLocationQueries";
import { API_ENDPOINTS } from "@repo/constants";
import { apiFetcher } from "../utils/fetcher";

export type Action = "create" | "view" | "update" | "close";
export type Theme = "light" | "dark";
export type IssueOption = { id: string; label: string; children: IssueOption[] };
export type TicketForm = {
  email: string;
  title: string;
  description: string;
  issueTypeId: string;
  childIssueTypeId: string;
  dueDate: string;
  ticketPriorityCode: string;
  screenshot: File | null;
  voiceNote: File | null;
  includeDiagnostics: boolean;
};

export const actions = [
  { id: "create", label: "Create ticket", description: "Tell the service desk what you need help with.", icon: "+" },
  { id: "view", label: "Track ticket", description: "Check status and read ticket updates.", icon: "↗" },
  { id: "update", label: "Reply to ticket", description: "Add information to a request you submitted.", icon: "↻" },
  { id: "close", label: "Request closure", description: "Ask the service desk to close it and share why.", icon: "✓" },
] as const;

const emptyForm = (): TicketForm => ({
  email: "",
  title: "",
  description: "",
  issueTypeId: "",
  childIssueTypeId: "",
  dueDate: "",
  ticketPriorityCode: "",
  screenshot: null,
  voiceNote: null,
  includeDiagnostics: false,
});

export function useTicketPortal() {
  const [form, setForm] = useState<TicketForm>(emptyForm);
  const [selectedAction, setSelectedAction] = useState<Action>("create");
  const [theme, setTheme] = useState<Theme>("light");
  const [attachmentWarning, setAttachmentWarning] = useState("");
  
  // 🟢 FIXED: Converted to a safe state hook to avoid "Cannot assign to constant" compilation errors
  const [isInitialized, setIsInitialized] = useState(false);

  // 🔄 1. LOAD SYSTEM PREREQUISITES 
  const { data: rawBackendIssues, isLoading: loadingIssues, error: loadError } = useIssueTypes();
  const { data: serviceItems } = useServiceItems();
  const { data: locations } = useLocations();
  
  const createTicketMutation = useCreateTicket();

  const issues: IssueOption[] = (rawBackendIssues || []).map((parent: any) => ({
    id: parent.id,
    label: parent.name,
    children: (parent.children || []).map((child: any) => ({
      id: child.id,
      label: child.name,
      children: [],
    })),
  }));

  useEffect(() => {
    const saved = window.localStorage.getItem("rmm-service-desk-theme");
    const preferred = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const nextTheme: Theme = saved === "dark" || saved === "light" ? saved : preferred;
    setTheme(nextTheme);
    setIsInitialized(true); // 🟢 FIXED: Calls the state setter correctly
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    window.localStorage.setItem("rmm-service-desk-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme, isInitialized]);

  const selectedIssue = issues.find((item) => item.id === form.issueTypeId);
  const childIssues = selectedIssue?.children ?? [];
  const resolvedIssueTypeId = childIssues.length ? form.childIssueTypeId : form.issueTypeId;

  async function submitTicket(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resolvedIssueTypeId) return;

    // fallback configuration IDs
    const defaultServiceItem = serviceItems?.[0]?.id || "00000000-0000-0000-0000-000000000000";
    const defaultLocation = locations?.[0]?.id || "00000000-0000-0000-0000-000000000000";
    const defaultProject = "00000000-0000-0000-0000-000000000000"; 

    setAttachmentWarning("");
    let measuredLatency = "unavailable";
    if (form.includeDiagnostics) {
      const startedAt = performance.now();
      try {
        await fetch(API_ENDPOINTS.PROXY.ISSUE_TYPES.BASE, { cache: "no-store" });
        measuredLatency = `${Math.round(performance.now() - startedAt)} ms`;
      } catch {
        measuredLatency = "unavailable";
      }
    }
    const description = form.includeDiagnostics
      ? `${form.description.trim()}\n\nBrowser diagnostics (shared with support):\n${[
          `Browser: ${navigator.userAgent}`,
          `Viewport: ${window.innerWidth} × ${window.innerHeight}`,
          `Screen: ${window.screen.width} × ${window.screen.height}`,
          `Language: ${navigator.language}`,
          `Time zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
          `Connection: ${navigator.onLine ? "online" : "offline"}`,
          `Portal API response time: ${measuredLatency}`,
        ].join("\n")}`
      : form.description.trim();

    const ticketPayload: Record<string, string | number> = {
      email: form.email.trim(),
      title: form.title.trim(),
      description,
      issueTypeId: resolvedIssueTypeId,
      serviceItemId: defaultServiceItem,
      locationId: defaultLocation,
      projectId: defaultProject,
    };

    if (form.dueDate) {
      ticketPayload.dueDate = new Date(`${form.dueDate}T12:00:00`).toISOString();
    }
    if (form.ticketPriorityCode.trim()) {
      ticketPayload.ticketPriorityCode = Number(form.ticketPriorityCode);
    }

    try {
      const createdTicket = await createTicketMutation.mutateAsync(ticketPayload);
      const ticketId = text(createdTicket as Row, "ticketId", "TicketId");

      const attachments = [form.screenshot, form.voiceNote].filter(
        (file): file is File => file !== null,
      );
      if (attachments.length) {
        if (!ticketId) {
          setAttachmentWarning("Ticket created, but an attachment could not be added. Contact your service desk with the ticket number.");
        } else {
          for (const file of attachments) {
            try {
              const attachment = new FormData();
              attachment.append("attachment", file);
              attachment.append("email", form.email.trim());
              await apiFetcher(
                API_ENDPOINTS.PROXY.TICKETS.PORTAL_ATTACHMENT(ticketId),
                { method: "POST", body: attachment },
              );
            } catch {
              setAttachmentWarning("Ticket created, but one or more attachments could not be added. Contact your service desk with the ticket number.");
              break;
            }
          }
        }
      }

      setForm(emptyForm());
    } catch {
      // The mutation exposes the create error in submitError.
    }
  }

  function chooseAction(action: Action) {
    setSelectedAction(action);
    createTicketMutation.reset();
  }

  const activeAction = actions.find((action) => action.id === selectedAction)!;

  return {
    form, 
    setForm, 
    issues, 
    loading: loadingIssues,
    loadError: loadError instanceof Error ? loadError.message : loadError ? String(loadError) : "", 
    submitting: createTicketMutation.isPending,
    submitError: createTicketMutation.error instanceof Error ? createTicketMutation.error.message : "", 
    attachmentWarning,
    ticketNumber: createTicketMutation.data ? text(createTicketMutation.data as Row, "ticketNumber", "TicketNumber") : "", 
    setTicketNumber: () => createTicketMutation.reset(),
    selectedAction, 
    theme, 
    setTheme, 
    chooseAction, 
    submitTicket, 
    activeAction
  };
}
