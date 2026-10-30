// frontend/app/ticket-portal/hooks/useTicketPortal.ts

import { useState, useEffect, type FormEvent } from "react";
import { text, type Row } from "../utils/dataMappers";
import { useIssueTypes } from "../queries/useIssueTypeQueries"; 
import { useCreateTicket } from "../queries/useTicketQueries";
import { useServiceItems } from "../queries/useServiceItemQueries";
import { useLocations } from "../queries/useLocationQueries";
import { useSearchContactByEmail } from "../queries/useContactQueries"; 
import { API_ENDPOINTS } from "@repo/constants";
import { apiFetcher } from "../utils/fetcher";

export type Action = "create" | "view" | "update" | "delete";
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
};

export const actions = [
  { id: "create", label: "Create ticket", description: "Tell the service desk what you need help with.", icon: "+" },
  { id: "view", label: "View ticket", description: "Check the latest update on a ticket you submitted.", icon: "↗" },
  { id: "update", label: "Update ticket", description: "Add details or a reply to an existing request.", icon: "↻" },
  { id: "delete", label: "Delete ticket", description: "Request removal of a ticket you no longer need.", icon: "×" },
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
  
  // 🔄 2. SCAN CONTACTS LIVE BY EMAIL INPUT STATE
  const { data: contactProfile, isLoading: loadingContact } = useSearchContactByEmail(form.email);
  
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

    // Relational Guard: Extract the unique contact payload ID safely
    const resolvedContactId = contactProfile?.id || contactProfile?.id || (contactProfile as any)?.ContactId;
    
    if (!resolvedContactId) {
      alert("Verification Failed: The entered email address could not be matched with any active service-desk contact profiles.");
      return;
    }

    // fallback configuration IDs
    const defaultServiceItem = serviceItems?.[0]?.id || "00000000-0000-0000-0000-000000000000";
    const defaultLocation = locations?.[0]?.id || contactProfile?.locationId || (contactProfile as any)?.LocationId || "00000000-0000-0000-0000-000000000000";
    const defaultProject = "00000000-0000-0000-0000-000000000000"; 

    setAttachmentWarning("");

    const ticketPayload: Record<string, string | number> = {
      title: form.title.trim(),
      description: form.description.trim(),
      issueTypeId: resolvedIssueTypeId,
      contactId: resolvedContactId,
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

      if (form.screenshot) {
        if (!ticketId) {
          setAttachmentWarning("Ticket created, but its screenshot could not be attached. Contact your service desk with the ticket number.");
        } else {
          try {
            const attachment = new FormData();
            attachment.append("attachment", form.screenshot);
            await apiFetcher(
              API_ENDPOINTS.PROXY.TICKETS.ATTACHMENT(ticketId),
              { method: "POST", body: attachment },
            );
          } catch {
            setAttachmentWarning("Ticket created, but the screenshot could not be attached. Contact your service desk with the ticket number.");
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
    loading: loadingIssues || loadingContact, 
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
