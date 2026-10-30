"use client";

import React from "react";
import Providers from "../provider";
import { useTickets } from "../queries/useTicketQueries";
import { useUsers } from "../queries/useUserQueries";
import { useLocations } from "../queries/useLocationQueries";
import { useCustomers } from "../queries/useCustomerQueries";
import { useIssueTypes } from "../queries/useIssueTypeQueries";
import { useContacts } from "../queries/useContactQueries";
import { useServiceItems } from "../queries/useServiceItemQueries";
import { useTicketCustomStatuses } from "../queries/useTicketCustomStatusQueries";

function TestSiteContent() {
  // Existing resource hooks
  const { data: tickets, isLoading: loadingTickets, error: ticketError } = useTickets();
  const { data: customers, isLoading: loadingCustomers, error: customerError } = useCustomers();
  const { data: locations, isLoading: loadingLocations, error: locationError } = useLocations();
  const { data: users, isLoading: loadingUsers, error: userError } = useUsers();

  // New missing resource hooks
  const { data: issueTypes, isLoading: loadingIssueTypes, error: issueTypeError } = useIssueTypes();
  const { data: customStatuses, isLoading: loadingCustomStatuses, error: customStatusError } = useTicketCustomStatuses();
  const { data: contacts, isLoading: loadingContacts, error: contactError } = useContacts();
  const { data: serviceItems, isLoading: loadingServiceItems, error: serviceItemError } = useServiceItems();

  const isAnyLoading = 
    loadingTickets || loadingCustomers || loadingLocations || loadingUsers ||
    loadingIssueTypes || loadingCustomStatuses || loadingContacts || loadingServiceItems;

  return (
    <main style={{ padding: "2rem", fontFamily: "monospace", maxWidth: "1200px", margin: "0 auto", color: "var(--text)" }}>
      <h1>🧪 Helpdesk Proxy API Verification Test</h1>
      <p>Verifying active route payloads through Next.js proxy tunnel layer.</p>
      <hr style={{ margin: "2rem 0", borderColor: "#333" }} />

      {isAnyLoading && (
        <div style={{ padding: "1rem", background: "#0ea5e9", color: "#fff", marginBottom: "1rem", borderRadius: "4px" }}>
          ⏳ Fetching comprehensive payload structures live from backend...
        </div>
      )}

      {/* 📋 TICKETS ENDPOINT TEST */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2>📋 Tickets API Output (GET /api/tickets)</h2>
        {ticketError ? (
          <p style={{ color: "red" }}>❌ Error: {ticketError.message}</p>
        ) : (
          <pre style={{ background: "#1e1e1e", color: "#9cdcfe", padding: "1.5rem", borderRadius: "6px", overflowX: "auto" }}>
            {tickets ? JSON.stringify(tickets, null, 2) : "No ticket data stream payload returned."}
          </pre>
        )}
      </section>

      {/* 🤝 CUSTOMERS ENDPOINT TEST */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2>🤝 Customers API Output (GET /api/customers)</h2>
        {customerError ? (
          <p style={{ color: "red" }}>❌ Error: {customerError.message}</p>
        ) : (
          <pre style={{ background: "#1e1e1e", color: "#ce9178", padding: "1.5rem", borderRadius: "6px", overflowX: "auto" }}>
            {customers ? JSON.stringify(customers, null, 2) : "No customer records configuration found."}
          </pre>
        )}
      </section>

      {/* 📍 LOCATIONS ENDPOINT TEST */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2>📍 Locations API Output (GET /api/locations)</h2>
        {locationError ? (
          <p style={{ color: "red" }}>❌ Error: {locationError.message}</p>
        ) : (
          <pre style={{ background: "#1e1e1e", color: "#b5cea8", padding: "1.5rem", borderRadius: "6px", overflowX: "auto" }}>
            {locations ? JSON.stringify(locations, null, 2) : "No location configurations returned."}
          </pre>
        )}
      </section>

      {/* 🏷️ ISSUE TYPES ENDPOINT TEST */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2>🏷️ Issue Types API Output (GET /api/issue-types)</h2>
        {issueTypeError ? (
          <p style={{ color: "red" }}>❌ Error: {issueTypeError.message}</p>
        ) : (
          <pre style={{ background: "#1e1e1e", color: "#dcdcdc", padding: "1.5rem", borderRadius: "6px", overflowX: "auto" }}>
            {issueTypes ? JSON.stringify(issueTypes, null, 2) : "No issue types metadata configurations found."}
          </pre>
        )}
      </section>

      {/* 🔒 CUSTOM STATUSES ENDPOINT TEST */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2>🔒 Ticket Custom Statuses API Output (GET /api/ticket-custom-statuses)</h2>
        {customStatusError ? (
          <p style={{ color: "red" }}>❌ Error: {customStatusError.message}</p>
        ) : (
          <pre style={{ background: "#1e1e1e", color: "#c586c0", padding: "1.5rem", borderRadius: "6px", overflowX: "auto" }}>
            {customStatuses ? JSON.stringify(customStatuses, null, 2) : "No custom workflow status configurations returned."}
          </pre>
        )}
      </section>

      {/* 📞 CONTACTS ENDPOINT TEST */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2>📞 Contacts API Output (GET /api/contacts)</h2>
        {contactError ? (
          <p style={{ color: "red" }}>❌ Error: {contactError.message}</p>
        ) : (
          <pre style={{ background: "#1e1e1e", color: "#6a9955", padding: "1.5rem", borderRadius: "6px", overflowX: "auto" }}>
            {contacts ? JSON.stringify(contacts, null, 2) : "No cached background contacts profiles returned."}
          </pre>
        )}
      </section>

      {/* 👤 USERS ENDPOINT TEST */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2>👤 Users API Output (GET /api/users)</h2>
        {userError ? (
          <p style={{ color: "red" }}>❌ Error: {userError.message}</p>
        ) : (
          <pre style={{ background: "#1e1e1e", color: "#b5cea8", padding: "1.5rem", borderRadius: "6px", overflowX: "auto" }}>
            {users ? JSON.stringify(users, null, 2) : "No cached application profile users found."}
          </pre>
        )}
      </section>

      {/* 🛠️ SERVICE ITEMS ENDPOINT TEST */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2>🛠️ Service Items API Output (GET /api/service-items)</h2>
        {serviceItemError ? (
          <p style={{ color: "red" }}>❌ Error: {serviceItemError.message}</p>
        ) : (
          <pre style={{ background: "#1e1e1e", color: "#da70d6", padding: "1.5rem", borderRadius: "6px", overflowX: "auto" }}>
            {serviceItems ? JSON.stringify(serviceItems, null, 2) : "No active cached contract service items found."}
          </pre>
        )}
      </section>
    </main>
  );
}

export default function TestSitePage() {
  return (
    <Providers>
      <TestSiteContent />
    </Providers>
  );
}
