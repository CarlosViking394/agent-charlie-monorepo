import React, { useState } from "react";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
}

interface Payment {
  id: string;
  user: string;
  amount: number;
  status: "pending" | "completed";
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function AgentInterface() {
  type Role = "customer" | "manager" | "employee";
  const [role, setRole] = useState<Role | null>(null);
  const [screen, setScreen] = useState<
    "chat" | "payments" | "users" | "analytics"
  >("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [payments, setPayments] = useState<Payment[]>([
    { id: "1", user: "Alice", amount: 120, status: "pending" },
    { id: "2", user: "Bob", amount: 90, status: "completed" },
  ]);
  const [users] = useState<User[]>([
    { id: "1", name: "Alice", email: "alice@example.com" },
    { id: "2", name: "Bob", email: "bob@example.com" },
  ]);

  async function sendMessage() {
    if (!input) return;
    const message: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input,
    };
    setMessages((prev) => [...prev, message]);
    setInput("");

    try {
      const res = await fetch("https://example.com/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, text: message.text }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: "agent", text: data.reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: "agent", text: "Error" },
      ]);
    }
  }

  function completePayment(id: string) {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "completed" } : p))
    );
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  const completed = payments.filter((p) => p.status === "completed").length;
  const pending = payments.length - completed;

  if (!role) {
    return (
      <div style={styles.centered}>
        <h2 style={styles.title}>Select your role</h2>
        <button onClick={() => setRole("customer")}>Customer</button>
        <button onClick={() => setRole("manager")}>Manager</button>
        <button onClick={() => setRole("employee")}>Employee</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tabBar}>
        <TabButton label="Chat" active={screen === "chat"} onPress={() => setScreen("chat")} />
        <TabButton label="Payments" active={screen === "payments"} onPress={() => setScreen("payments")} />
        <TabButton label="Users" active={screen === "users"} onPress={() => setScreen("users")} />
        <TabButton label="Analytics" active={screen === "analytics"} onPress={() => setScreen("analytics")} />
      </div>

      {screen === "chat" && (
        <div style={{ flex: 1 }}>
          <div>
            {messages.map((item) => (
              <div key={item.id} style={{ margin: "4px 0" }}>
                {item.sender}: {item.text}
              </div>
            ))}
          </div>
          <div style={styles.row}>
            <input
              style={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the agent..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}

      {screen === "payments" && (
        <div>
          {payments.map((item) => (
            <div key={item.id} style={styles.row}>
              <span>
                {item.user} - ${item.amount} ({item.status})
              </span>
              {item.status === "pending" && (
                <button onClick={() => completePayment(item.id)}>Complete</button>
              )}
            </div>
          ))}
        </div>
      )}

      {screen === "users" && (
        <div>
          {users.map((item) => (
            <div key={item.id} style={{ margin: "4px 0" }}>
              {item.name} - {item.email}
            </div>
          ))}
        </div>
      )}

      {screen === "analytics" && (
        <div>
          <div>Total Amount: ${total}</div>
          <div>Completed Payments: {completed}</div>
          <div>Pending Payments: {pending}</div>
        </div>
      )}
    </div>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <button onClick={onPress} style={styles.tabButton}>
      <span style={{ color: active ? "#007AFF" : "#555" }}>{label}</span>
    </button>
  );
}

const styles = {
  container: { flex: 1, padding: 16, paddingTop: 48 },
  centered: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" },
  title: { fontSize: 24, marginBottom: 16 },
  row: { display: "flex", flexDirection: "row" as const, alignItems: "center", margin: "8px 0" },
  input: {
    flex: 1,
    border: "1px solid #ccc",
    padding: 8,
    marginRight: 8,
    borderRadius: 4,
  },
  tabBar: {
    display: "flex",
    flexDirection: "row" as const,
    justifyContent: "space-around",
    marginBottom: 12,
  },
  tabButton: { padding: 8, border: "none", background: "transparent", cursor: "pointer" },
} as const;

