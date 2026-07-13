import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  PRIORITIES,
  STATUSES,
  WORK_TYPES,
  authApi,
  customersApi,
  isSupabaseConfigured,
  loadWorkshopData,
  quotesApi,
  repairsApi,
  subscribeToRealtime,
  suppliersApi,
  workOrdersApi,
  workersApi
} from "./api";

const emptyData = {
  orders: [],
  customers: [],
  suppliers: [],
  workers: [],
  quotes: [],
  repairs: []
};

function App() {
  const [data, setData] = useState(emptyData);
  const [page, setPage] = useState("dashboard");
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);

  async function refresh(silent = false) {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Create .env.local using .env.example, then restart the dev server.");
      setLoading(false);
      return;
    }
    if (!session) {
      setData(emptyData);
      setLoading(false);
      return;
    }
    try {
      if (!silent) setLoading(true);
      const next = await loadWorkshopData();
      setData(next);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Create .env.local using .env.example, then restart the dev server.");
      setLoading(false);
      return undefined;
    }
    let unsubscribeRealtime = () => {};
    authApi.getSession().then(async currentSession => {
      setSession(currentSession);
      if (currentSession) {
        setProfile(await authApi.getProfile());
        await refresh();
        unsubscribeRealtime = subscribeToRealtime(() => refresh(true));
      } else {
        setLoading(false);
      }
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
    const unsubscribeAuth = authApi.onAuthStateChange(async nextSession => {
      setSession(nextSession);
      setProfile(nextSession ? await authApi.getProfile() : null);
      if (nextSession) {
        await refresh();
      } else {
        setData(emptyData);
        setPage("dashboard");
      }
    });
    return () => {
      unsubscribeAuth();
      unsubscribeRealtime();
    };
  }, []);

  useEffect(() => {
    if (session) refresh(true);
  }, [session?.user?.id]);

  function showToast(message) {
    setToast(message);
    setTimeout(() => setToast(""), 2200);
  }

  async function runAction(action, message) {
    try {
      await action();
      await refresh(true);
      showToast(message);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSignIn(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction(async () => {
      const nextSession = await authApi.signIn(form.get("email"), form.get("password"));
      setSession(nextSession);
      setProfile(await authApi.getProfile());
    }, "Signed in");
  }

  async function handleSignUp(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const nextSession = await authApi.signUp({
        email: form.get("email"),
        password: form.get("password"),
        fullName: form.get("fullName"),
        role: form.get("role")
      });
      setSession(nextSession);
      if (nextSession) {
        setProfile(await authApi.getProfile());
        showToast("Account created");
      } else {
        showToast("Check your email to confirm the account");
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSignOut() {
    await authApi.signOut();
    setSession(null);
    setProfile(null);
    setData(emptyData);
    showToast("Signed out");
  }

  async function moveOrder(orderId, status) {
    const order = data.orders.find(item => item.id === orderId);
    if (!order || order.status === status) return;
    setData(current => ({
      ...current,
      orders: current.orders.map(item => item.id === orderId ? { ...item, status } : item)
    }));
    await runAction(
      () => workOrdersApi.updateStatus(orderId, status, `Moved to ${status} on Kanban board`),
      `${order.orderNo} moved to ${status}`
    );
  }

  async function createOrder(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const status = form.get("status");
    const order = {
      orderNo: `HD-${new Date().getFullYear()}-${String(data.orders.length + 1).padStart(3, "0")}`,
      customer: form.get("customer"),
      phone: form.get("phone"),
      title: form.get("title"),
      workType: form.get("workType"),
      description: form.get("description"),
      status,
      priority: form.get("priority"),
      dueDate: form.get("dueDate"),
      deliveryAddress: form.get("deliveryAddress"),
      materialCost: form.get("materialCost"),
      laborCost: form.get("laborCost"),
      otherCost: form.get("otherCost"),
      quotedPrice: form.get("quotedPrice")
    };
    await runAction(async () => {
      const id = await workOrdersApi.create(order);
      setSelectedId(id);
      setPage("detail");
    }, "Work order created");
  }

  async function updateStatus(orderId, status, note) {
    await runAction(() => workOrdersApi.updateStatus(orderId, status, note), "Status updated");
  }

  async function updateOrder(event, order) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await runAction(() => workOrdersApi.update(order.id, {
      ...order,
      customer: form.get("customer"),
      phone: form.get("phone"),
      title: form.get("title"),
      workType: form.get("workType"),
      description: form.get("description"),
      priority: form.get("priority"),
      dueDate: form.get("dueDate"),
      deliveryAddress: form.get("deliveryAddress"),
      materialCost: form.get("materialCost"),
      laborCost: form.get("laborCost"),
      otherCost: form.get("otherCost"),
      quotedPrice: form.get("quotedPrice")
    }), "Work order updated");
  }

  async function addImages(orderId, files) {
    await runAction(() => workOrdersApi.uploadImages(orderId, files), "Images uploaded");
  }

  async function deleteOrder(orderId) {
    await runAction(async () => {
      await workOrdersApi.remove(orderId);
      setSelectedId(null);
      setPage("dashboard");
    }, "Work order deleted");
  }

  const common = {
    data,
    page,
    setPage,
    selectedId,
    setSelectedId,
    search,
    setSearch,
    moveOrder,
    createOrder,
    updateOrder,
    addImages,
    updateStatus,
    deleteOrder,
    refresh,
    runAction
  };

  if (!session) {
    return React.createElement("div", { className: "app-shell auth-only" },
      error && React.createElement("div", { className: "error-banner auth-error" }, error),
      React.createElement(AuthScreen, { onSignIn: handleSignIn, onSignUp: handleSignUp }),
      toast && React.createElement("div", { className: "toast" }, toast)
    );
  }

  return React.createElement("div", { className: "app-shell" },
    React.createElement(Header, { profile, onSignOut: handleSignOut }),
    React.createElement("main", null,
      error && React.createElement("div", { className: "error-banner" }, error),
      loading && React.createElement("div", { className: "panel empty" }, "Loading workshop data..."),
      !loading && page === "new" && React.createElement(CreateOrder, common),
      !loading && page === "detail" && React.createElement(Detail, common),
      !loading && page === "customers" && React.createElement(Customers, common),
      !loading && page === "suppliers" && React.createElement(Suppliers, common),
      !loading && page === "workers" && React.createElement(Workers, common),
      !loading && page === "quotes" && React.createElement(Quotes, common),
      !loading && page === "repairs" && React.createElement(Repairs, common),
      !loading && page === "dashboard" && React.createElement(Dashboard, common)
    ),
    React.createElement(Nav, { page, setPage }),
    toast && React.createElement("div", { className: "toast" }, toast)
  );
}

function Header({ profile, onSignOut }) {
  return React.createElement("header", { className: "topbar" },
    React.createElement("div", { className: "topbar-title" },
      React.createElement("div", { className: "mini-mark" }, "H&D"),
      React.createElement("div", null,
        React.createElement("strong", null, "Workshop Operations"),
        React.createElement("span", null, "Supabase realtime operations workflow")
      )
    ),
    React.createElement("div", { className: "user-chip" },
      React.createElement("span", null, `${profile?.fullName || profile?.email || "User"} - ${profile?.role || "Authenticated"}`),
      React.createElement("button", { className: "btn ghost", onClick: onSignOut }, "Sign out")
    )
  );
}

function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState("signin");
  return React.createElement("section", { className: "login-shell" },
    React.createElement("div", { className: "login-panel" },
      React.createElement("div", { className: "brand-mark" }, "H&D"),
      React.createElement("h1", null, mode === "signin" ? "Email Login" : "Create User"),
      React.createElement("p", { className: "subtitle" }, "Secure Supabase Auth access for workshop operations."),
      React.createElement("form", { onSubmit: mode === "signin" ? onSignIn : onSignUp },
        mode === "signup" && field("Full name", "fullName", "text", "", true),
        field("Email", "email", "email", "", true),
        field("Password", "password", "password", "", true),
        mode === "signup" && select("Role", "role", ["Owner", "Manager", "Production", "Driver"]),
        React.createElement("button", { className: "btn", type: "submit" }, mode === "signin" ? "Sign in" : "Create account")
      ),
      React.createElement("button", { className: "btn ghost auth-switch", onClick: () => setMode(mode === "signin" ? "signup" : "signin") },
        mode === "signin" ? "Create an account" : "Back to sign in"
      )
    )
  );
}

function Nav({ page, setPage }) {
  const items = [
    ["dashboard", "Dashboard"],
    ["new", "New Order"],
    ["customers", "Customers"],
    ["suppliers", "Suppliers"],
    ["workers", "Workers"],
    ["quotes", "Quotes"],
    ["repairs", "Repairs"]
  ];
  return React.createElement("nav", { className: "bottom-nav wide-nav" },
    ...items.map(([id, label]) => React.createElement("button", {
      key: id,
      className: `nav-btn ${page === id ? "active" : ""}`,
      onClick: () => setPage(id)
    }, label))
  );
}

function Dashboard(props) {
  const stats = getStats(props.data.orders);
  return React.createElement(React.Fragment, null,
    React.createElement("section", { className: "stats-grid five" },
      stat("Open Orders", stats.open),
      stat("Due Today", stats.dueToday),
      stat("Overdue", stats.overdue),
      stat("Delivered This Month", stats.deliveredMonth),
      stat("Monthly Revenue", money(stats.monthlyRevenue))
    ),
    React.createElement("section", { className: "toolbar" },
      React.createElement("input", {
        placeholder: "Search work order, customer, job type...",
        value: props.search,
        onChange: event => props.setSearch(event.target.value)
      }),
      React.createElement("div", { className: "toolbar-actions" },
        React.createElement("button", { className: "btn secondary", onClick: () => props.refresh() }, "Refresh"),
        React.createElement("button", { className: "btn", onClick: () => props.setPage("new") }, "New Order")
      )
    ),
    React.createElement(Kanban, props)
  );
}

function stat(label, value) {
  return React.createElement("div", { className: "stat" },
    React.createElement("span", null, label),
    React.createElement("strong", null, value)
  );
}

function getStats(orders) {
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const month = now.getMonth();
  const year = now.getFullYear();
  const deliveredThisMonth = orders.filter(order => {
    const date = new Date(order.updatedAt || order.dueDate);
    return order.status === "Delivered" && date.getMonth() === month && date.getFullYear() === year;
  });
  return {
    open: orders.filter(order => order.status !== "Delivered").length,
    dueToday: orders.filter(order => order.status !== "Delivered" && order.dueDate === todayKey).length,
    overdue: orders.filter(order => order.status !== "Delivered" && order.dueDate && dateOnly(order.dueDate) < dateOnly(todayKey)).length,
    deliveredMonth: deliveredThisMonth.length,
    monthlyRevenue: deliveredThisMonth.reduce((sum, order) => sum + Number(order.quotedPrice || 0), 0)
  };
}

function Kanban({ data, search, moveOrder, setSelectedId, setPage }) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 140, tolerance: 6 } })
  );
  const query = search.trim().toLowerCase();
  const orders = data.orders.filter(order => [order.orderNo, order.customer, order.title, order.workType].join(" ").toLowerCase().includes(query));

  return React.createElement(DndContext, {
    sensors,
    collisionDetection: closestCenter,
    onDragEnd: event => {
      const status = event.over?.id;
      if (status && STATUSES.includes(status)) moveOrder(event.active.id, status);
    }
  },
    React.createElement("section", { className: "kanban" },
      ...STATUSES.map(status => React.createElement(KanbanColumn, {
        key: status,
        status,
        orders: orders.filter(order => order.status === status),
        setSelectedId,
        setPage
      }))
    )
  );
}

function KanbanColumn({ status, orders, setSelectedId, setPage }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return React.createElement("article", { ref: setNodeRef, className: `column ${isOver ? "drop-over" : ""}` },
    React.createElement("div", { className: "column-head" },
      React.createElement("div", { className: "column-title" }, status),
      React.createElement("span", { className: "count-pill" }, orders.length)
    ),
    React.createElement("div", { className: "cards" },
      orders.length ? orders.map(order => React.createElement(OrderCard, { key: order.id, order, setSelectedId, setPage })) : React.createElement("div", { className: "empty" }, "Drop orders here")
    )
  );
}

function OrderCard({ order, setSelectedId, setPage }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 } : undefined;
  return React.createElement("button", {
    ref: setNodeRef,
    style,
    className: `order-card ${isOverdue(order) ? "overdue" : ""} ${isDragging ? "dragging" : ""}`,
    onClick: () => {
      if (!isDragging) {
        setSelectedId(order.id);
        setPage("detail");
      }
    },
    ...listeners,
    ...attributes
  },
    React.createElement("div", { className: "card-top" },
      React.createElement("div", null,
        React.createElement("div", { className: "order-no" }, order.orderNo),
        React.createElement("div", { className: "card-title" }, order.title)
      ),
      React.createElement("span", { className: "status-pill" }, order.priority)
    ),
    React.createElement("div", { className: "card-meta" },
      React.createElement("span", null, `${order.customer} - ${order.workType}`),
      React.createElement("span", null, `Due ${fmtDate(order.dueDate)}`),
      React.createElement("span", { className: "money" }, `${money(profit(order))} profit`)
    )
  );
}

function CreateOrder({ data, createOrder }) {
  return React.createElement(React.Fragment, null,
    pageHead("Create Work Order", "Capture job scope, costs, and delivery target."),
    React.createElement("form", { className: "form-grid", onSubmit: createOrder },
      panel("Job Details",
        field("Customer name", "customer", "text", "", true, data.customers.map(customer => customer.name)),
        field("Phone", "phone", "tel"),
        field("Work title", "title", "text", "", true),
        select("Work type", "workType", WORK_TYPES),
        select("Priority", "priority", PRIORITIES),
        textarea("Description", "description", true)
      ),
      panel("Delivery & Cost",
        field("Due date", "dueDate", "date", new Date().toISOString().slice(0, 10), true),
        select("Status", "status", STATUSES),
        field("Delivery address", "deliveryAddress"),
        field("Material cost", "materialCost", "number"),
        field("Labor cost", "laborCost", "number"),
        field("Other cost", "otherCost", "number"),
        field("Quoted price", "quotedPrice", "number", "", true),
        React.createElement("button", { className: "btn", type: "submit" }, "Save Work Order")
      )
    )
  );
}

function Detail({ data, selectedId, setPage, addImages, updateStatus, updateOrder, deleteOrder }) {
  const order = data.orders.find(item => item.id === selectedId) || data.orders[0];
  const [status, setStatus] = useState(order?.status || STATUSES[0]);
  const [note, setNote] = useState("");
  useEffect(() => {
    if (order) setStatus(order.status);
  }, [order?.id, order?.status]);
  if (!order) return React.createElement("div", { className: "panel empty" }, "No work order selected.");
  const currentIndex = STATUSES.indexOf(order.status);
  return React.createElement(React.Fragment, null,
    React.createElement("section", { className: "page-head" },
      React.createElement("button", { className: "btn secondary", onClick: () => setPage("dashboard") }, "Back"),
      React.createElement("h2", null, order.orderNo),
      React.createElement("button", { className: "btn danger", onClick: () => deleteOrder(order.id) }, "Delete")
    ),
    React.createElement("section", { className: "detail-hero" },
      panel(order.title,
        React.createElement("p", { className: "subtitle" }, order.description),
        React.createElement("div", { className: "detail-meta" },
          React.createElement("span", null, `Customer: ${order.customer}`),
          React.createElement("span", null, `Type: ${order.workType} - Priority: ${order.priority}`),
          React.createElement("span", null, `Delivery: ${order.deliveryAddress || "Not set"} - Due ${fmtDate(order.dueDate)}`)
        ),
        React.createElement("div", { className: "audit-box" },
          React.createElement("span", null, `Created by: ${order.createdByName || order.createdBy || "Unknown"}`),
          React.createElement("span", null, `Modified by: ${order.updatedByName || order.updatedBy || "No modifications yet"}`)
        )
      ),
      panel("Status Update",
        React.createElement("div", { className: "field" },
          React.createElement("label", null, "Current status"),
          React.createElement("select", { value: status, onChange: event => setStatus(event.target.value) },
            ...STATUSES.map(item => React.createElement("option", { key: item }, item))
          )
        ),
        React.createElement("div", { className: "field" },
          React.createElement("label", null, "Note"),
          React.createElement("textarea", { value: note, onChange: event => setNote(event.target.value) })
        ),
        React.createElement("button", { className: "btn", onClick: () => updateStatus(order.id, status, note) }, "Update Status")
      )
    ),
    React.createElement("section", { className: "detail-grid" },
      panel("Edit Work Order",
        React.createElement("form", { className: "module-form compact", onSubmit: event => updateOrder(event, order), key: order.id },
          field("Customer name", "customer", "text", order.customer, true, data.customers.map(customer => customer.name)),
          field("Phone", "phone", "tel", order.phone),
          field("Work title", "title", "text", order.title, true),
          select("Work type", "workType", WORK_TYPES, order.workType),
          select("Priority", "priority", PRIORITIES, order.priority),
          field("Due date", "dueDate", "date", order.dueDate, true),
          field("Delivery address", "deliveryAddress", "text", order.deliveryAddress),
          field("Material cost", "materialCost", "number", order.materialCost),
          field("Labor cost", "laborCost", "number", order.laborCost),
          field("Other cost", "otherCost", "number", order.otherCost),
          field("Quoted price", "quotedPrice", "number", order.quotedPrice, true),
          React.createElement("div", { className: "field full-span" },
            React.createElement("label", null, "Description"),
            React.createElement("textarea", { name: "description", defaultValue: order.description, required: true })
          ),
          React.createElement("button", { className: "btn", type: "submit" }, "Update Work Order")
        )
      ),
      panel("Progress Tracking",
        React.createElement("div", { className: "progress-list" },
          ...STATUSES.map((item, index) => React.createElement("div", { key: item, className: `progress-row ${index <= currentIndex ? "done" : ""}` },
            React.createElement("div", { className: "dot" }),
            React.createElement("div", null, React.createElement("strong", null, item), React.createElement("br"), React.createElement("span", { className: "subtitle" }, index <= currentIndex ? "Completed or active" : "Pending"))
          ))
        )
      ),
      panel("Cost & Profit",
        React.createElement("div", { className: "detail-meta" },
          React.createElement("span", null, `Material: ${money(order.materialCost)}`),
          React.createElement("span", null, `Labor: ${money(order.laborCost)}`),
          React.createElement("span", null, `Other: ${money(order.otherCost)}`),
          React.createElement("span", null, `Quoted: ${money(order.quotedPrice)}`),
          React.createElement("span", { className: "money" }, `Estimated profit: ${money(profit(order))}`)
        )
      ),
      panel("Images",
        React.createElement("input", { type: "file", accept: "image/*", multiple: true, onChange: event => addImages(order.id, event.target.files) }),
        React.createElement("div", { className: "image-grid" },
          ...(order.images || []).map(image => React.createElement("img", { key: image.id || image.url, src: image.url, alt: image.fileName || "Work order" })),
          !(order.images || []).length && React.createElement("div", { className: "empty" }, "No images yet")
        )
      ),
      panel("History",
        React.createElement("div", { className: "progress-list" },
          ...(order.history || []).slice().reverse().map(item => React.createElement("div", { key: item.id || item.at },
            React.createElement("strong", null, item.status),
            React.createElement("div", { className: "subtitle" }, `${item.note || "Status updated"} - ${item.createdByName || item.createdBy || "Unknown"} - ${new Date(item.at).toLocaleString()}`)
          ))
        )
      )
    )
  );
}

function Customers(props) {
  return React.createElement(CrudModule, {
    title: "Customer Management",
    api: customersApi,
    rows: props.data.customers,
    runAction: props.runAction,
    fields: [
      ["name", "Customer name", "text", true],
      ["contact", "Contact person"],
      ["phone", "Phone"],
      ["email", "Email", "email"],
      ["industry", "Industry"]
    ],
    renderLines: item => {
      const orders = props.data.orders.filter(order => order.customer === item.name);
      const total = orders.reduce((sum, order) => sum + Number(order.quotedPrice || 0), 0);
      const lastOrder = orders.map(order => order.dueDate).sort().pop();
      return [`Contact: ${item.contact || "None"}`, `Phone: ${item.phone || "None"}`, `Email: ${item.email || "None"}`, `Industry: ${item.industry || "None"}`, `Last order: ${lastOrder ? fmtDate(lastOrder) : "None"}`, `Total sales: ${money(total)}`];
    },
    badge: item => item.industry || "Customer"
  });
}

function Suppliers(props) {
  return React.createElement(CrudModule, {
    title: "Supplier Management",
    api: suppliersApi,
    rows: props.data.suppliers,
    runAction: props.runAction,
    fields: [["name", "Supplier name", "text", true], ["materials", "Materials"], ["phone", "Phone"], ["email", "Email", "email"], ["status", "Status"]],
    renderLines: item => [`Supplies: ${item.materials || "None"}`, `Phone: ${item.phone || "None"}`, `Email: ${item.email || "None"}`],
    badge: item => item.status || "Active"
  });
}

function Workers(props) {
  return React.createElement(CrudModule, {
    title: "Worker Management",
    api: workersApi,
    rows: props.data.workers,
    runAction: props.runAction,
    fields: [["name", "Worker name", "text", true], ["role", "Role", "text", true], ["skills", "Skills"], ["status", "Status"], ["activeOrderId", "Active work order ID"]],
    renderLines: item => [`Role: ${item.role}`, `Skills: ${item.skills || "None"}`, `Active order: ${item.activeOrderId || "None"}`],
    badge: item => item.status || "Available"
  });
}

function Quotes(props) {
  return React.createElement(CrudModule, {
    title: "Quote History",
    api: quotesApi,
    rows: props.data.quotes,
    runAction: props.runAction,
    fields: [["quoteNo", "Quote no", "text", true], ["customer", "Customer", "text", true], ["title", "Quote title", "text", true], ["amount", "Amount", "number"], ["status", "Status"], ["date", "Quote date", "date"]],
    renderLines: item => [`Customer: ${item.customer}`, `Amount: ${money(item.amount)}`, `Date: ${fmtDate(item.date)}`],
    badge: item => item.status || "Draft",
    heading: item => `${item.quoteNo} - ${item.title}`
  });
}

function Repairs(props) {
  return React.createElement(CrudModule, {
    title: "Repair Case Library",
    api: repairsApi,
    rows: props.data.repairs,
    runAction: props.runAction,
    fields: [["problem", "Problem", "text", true], ["workType", "Work type", "text", true], ["category", "Category"], ["solution", "Repair method", "textarea", true]],
    renderLines: item => [`Category: ${item.category || "None"}`, `Repair method: ${item.solution}`],
    badge: item => item.workType,
    heading: item => item.problem
  });
}

function CrudModule({ title, api, rows, fields, renderLines, badge, heading, runAction }) {
  const [editing, setEditing] = useState(null);
  const blank = Object.fromEntries(fields.map(([name]) => [name, ""]));
  const active = editing || blank;

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const record = Object.fromEntries(fields.map(([name]) => [name, form.get(name)]));
    await runAction(
      () => editing?.id ? api.update(editing.id, record) : api.create(record),
      editing?.id ? `${title} updated` : `${title} created`
    );
    setEditing(null);
    event.currentTarget.reset();
  }

  return React.createElement(React.Fragment, null,
    pageHead(title, "Create, edit, and remove workshop operating records."),
    React.createElement("form", { className: "panel module-form", onSubmit: submit },
      ...fields.map(([name, label, type = "text", required = false]) => type === "textarea"
        ? React.createElement("div", { className: "field", key: name }, React.createElement("label", null, label), React.createElement("textarea", { name, defaultValue: active[name] || "", required }))
        : field(label, name, type, active[name] || "", required)
      ),
      React.createElement("div", { className: "toolbar-actions" },
        React.createElement("button", { className: "btn", type: "submit" }, editing?.id ? "Update" : "Create"),
        editing?.id && React.createElement("button", { className: "btn secondary", type: "button", onClick: () => setEditing(null) }, "Cancel")
      )
    ),
    React.createElement("section", { className: "cards module-list" },
      ...rows.map(item => React.createElement("article", { key: item.id, className: "order-card static-card" },
        React.createElement("div", { className: "card-top" },
          React.createElement("div", { className: "card-title" }, heading ? heading(item) : item.name),
          React.createElement("span", { className: "status-pill" }, badge(item))
        ),
        React.createElement("div", { className: "card-meta" }, ...renderLines(item).map(line => React.createElement("span", { key: line }, line))),
        React.createElement("div", { className: "row-actions" },
          React.createElement("button", { className: "btn secondary", type: "button", onClick: () => setEditing(item) }, "Edit"),
          React.createElement("button", { className: "btn danger", type: "button", onClick: () => runAction(() => api.remove(item.id), `${title} deleted`) }, "Delete")
        )
      )),
      !rows.length && React.createElement("div", { className: "panel empty" }, "No records yet.")
    )
  );
}

function pageHead(title, subtitle) {
  return React.createElement("section", { className: "page-head" },
    React.createElement("div", null,
      React.createElement("h2", null, title),
      subtitle && React.createElement("p", { className: "subtitle" }, subtitle)
    )
  );
}

function panel(title, ...children) {
  return React.createElement("article", { className: "panel" },
    React.createElement("h3", null, title),
    ...children
  );
}

function field(label, name, type = "text", value = "", required = false, suggestions = []) {
  return React.createElement("div", { className: "field" },
    React.createElement("label", { htmlFor: name }, label),
    React.createElement("input", { id: name, name, type, defaultValue: value, required, list: suggestions.length ? `${name}-list` : undefined }),
    suggestions.length ? React.createElement("datalist", { id: `${name}-list` }, ...suggestions.map(item => React.createElement("option", { key: item, value: item }))) : null
  );
}

function select(label, name, options, selected = options[0]) {
  return React.createElement("div", { className: "field" },
    React.createElement("label", { htmlFor: name }, label),
    React.createElement("select", { id: name, name, defaultValue: selected }, ...options.map(option => React.createElement("option", { key: option }, option)))
  );
}

function textarea(label, name, required = false) {
  return React.createElement("div", { className: "field" },
    React.createElement("label", { htmlFor: name }, label),
    React.createElement("textarea", { id: name, name, required })
  );
}

function money(value) {
  return new Intl.NumberFormat("en-MY", { style: "currency", currency: "MYR", maximumFractionDigits: 0 }).format(Number(value || 0));
}

function dateOnly(value) {
  return new Date(`${value}T00:00:00`);
}

function fmtDate(value) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en-MY", { day: "2-digit", month: "short", year: "numeric" }).format(dateOnly(value));
}

function profit(order) {
  return Number(order.quotedPrice || 0) - Number(order.materialCost || 0) - Number(order.laborCost || 0) - Number(order.otherCost || 0);
}

function isOverdue(order) {
  const today = new Date().toISOString().slice(0, 10);
  return order.status !== "Delivered" && order.dueDate && dateOnly(order.dueDate) < dateOnly(today);
}

createRoot(document.querySelector("#app")).render(React.createElement(App));
