// frontend/app/ticket-portal/hooks/useTicketPortal.ts

import { useState, useEffect, type FormEvent } from "react";
import { text, type Row } from "../utils/dataMappers";
import { useIssueTypes } from "../queries/useIssueTypeQueries"; 
import { useCreateTicket } from "../queries/useTicketQueries";
import { useServiceItems } from "../queries/useServiceItemQueries";
import { useLocations } from "../queries/useLocationQueries";
import { useSearchContactByEmail } from "../queries/useContactQueries"; 

export type Action = "create" | "view" | "update" | "delete";
export type Theme = "light" | "dark";
export type IssueOption = { id: string; label: string; children: IssueOption[] };
export type TicketForm = { email: string; title: string; description: string; issueTypeId: string; childIssueTypeId: string };

export const actions = [
  { id: "create", label: "Create ticket", description: "Tell the service desk what you need help with.", icon: "+" },
  { id: "view", label: "View ticket", description: "Check the latest update on a ticket you submitted.", icon: "↗" },
  { id: "update", label: "Update ticket", description: "Add details or a reply to an existing request.", icon: "↻" },
  { id: "delete", label: "Delete ticket", description: "Request removal of a ticket you no longer need.", icon: "×" },
] as const;

const emptyForm = (): TicketForm => ({ email: "", title: "", description: "", issueTypeId: "", childIssueTypeId: "" });

export function useTicketPortal() {
  const [form, setForm] = useState<TicketForm>(emptyForm);
  const [selectedAction, setSelectedAction] = useState<Action>("create");
  const [theme, setTheme] = useState<Theme>("light");
  
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

    const computedDueDate = new Date();
    computedDueDate.setDate(computedDueDate.getDate() + 7);

    // 🚀 POST full compliant DTO dataset block
    createTicketMutation.mutate(
      {
        title: form.title.trim(),
        description: form.description.trim(),
        issueTypeId: resolvedIssueTypeId,
        contactId: resolvedContactId,
        serviceItemId: defaultServiceItem,
        locationId: defaultLocation,
        projectId: defaultProject,
        dueDate: computedDueDate.toISOString(),
        ticketPriorityCode: 1, 
      },
      {
        onSuccess: () => {
          setForm(emptyForm());
        },
      }
    );
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
