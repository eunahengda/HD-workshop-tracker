import React, { useEffect, useRef, useState } from "react";
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
import { exportOrdersToExcel, exportPhotosZip } from "./exporters";
import {
  JOB_CATEGORIES,
  JOB_WORK_TYPES,
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
  const sessionRef = useRef(null);
  function updateSession(next) {
    sessionRef.current = next;
    setSession(next);
  }

  async function refresh(silent = false) {
    if (!isSupabaseConfigured) {
      setError("Supabase is not configured. Create .env.local using .env.example, then restart the dev server.");
      setLoading(false);
      return;
    }
    if (!sessionRef.current) {
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
      updateSession(currentSession);
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
      updateSession(nextSession);
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
      updateSession(nextSession);
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
      updateSession(nextSession);
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
    updateSession(null);
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
    const photos = form.getAll("photos").filter(file => file instanceof File && file.size > 0);
    const order = {
      customer: form.get("customer"),
      orderDate: form.get("orderDate"),
      jobCategory: form.get("jobCategory"),
      workTypes: form.getAll("workTypes"),
      qty: form.get("qty"),
      description: form.get("description"),
      material: form.get("material"),
      size: form.get("size"),
      sample: form.get("sample"),
      urgent: form.get("urgent") === "Yes",
      status: "New Order",
      dueDate: form.get("dueDate"),
      supplierName: form.get("supplierName"),
      supplierMaterial: form.get("supplierMaterial"),
      supplierSize: form.get("supplierSize"),
      supplierQty: form.get("supplierQty"),
      supplierOrderDate: form.get("supplierOrderDate"),
      supplierDeliveryDate: form.get("supplierDeliveryDate"),
      materialCost: form.get("materialCost"),
      laborCost: form.get("laborCost"),
      quotedPrice: form.get("quotedPrice"),
      driver: form.get("driver"),
      deliveryDatetime: form.get("deliveryDatetime"),
      quotationNo: form.get("quotationNo"),
      poNo: form.get("poNo"),
      doNo: form.get("doNo"),
      remark: form.get("remark")
    };
    await runAction(async () => {
      const id = await workOrdersApi.create(order);
      if (photos.length) await workOrdersApi.uploadImages(id, photos);
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
      orderDate: form.get("orderDate"),
      jobCategory: form.get("jobCategory"),
      workTypes: form.getAll("workTypes"),
      qty: form.get("qty"),
      description: form.get("description"),
      material: form.get("material"),
      size: form.get("size"),
      sample: form.get("sample"),
      urgent: form.get("urgent") === "Yes",
      dueDate: form.get("dueDate"),
      supplierName: form.get("supplierName"),
      supplierMaterial: form.get("supplierMaterial"),
      supplierSize: form.get("supplierSize"),
      supplierQty: form.get("supplierQty"),
      supplierOrderDate: form.get("supplierOrderDate"),
      supplierDeliveryDate: form.get("supplierDeliveryDate"),
      materialCost: form.get("materialCost"),
      laborCost: form.get("laborCost"),
      quotedPrice: form.get("quotedPrice"),
      driver: form.get("driver"),
      deliveryDatetime: form.get("deliveryDatetime"),
      quotationNo: form.get("quotationNo"),
      poNo: form.get("poNo"),
      doNo: form.get("doNo"),
      remark: form.get("remark")
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

  async function handleExportExcel() {
    try {
      exportOrdersToExcel(data.orders);
      showToast("Excel file downloaded");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleExportPhotos() {
    if (!data.orders.some(order => (order.images || []).length)) {
      showToast("No photos to download yet");
      return;
    }
    try {
      showToast("Preparing photo archive...");
      await exportPhotosZip(data.orders);
      showToast("Photo archive downloaded");
    } catch (err) {
      setError(err.message);
    }
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
    runAction,
    exportExcel: handleExportExcel,
    exportPhotos: handleExportPhotos
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
        React.createElement("strong", null, "H&D Hengda Record"),
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
        React.createElement("button", { className: "btn secondary", onClick: props.exportExcel }, "Export Excel"),
        React.createElement("button", { className: "btn secondary", onClick: props.exportPhotos }, "Download Photos"),
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
  const [sortKey, setSortKey] = useState("orderDate");
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("kanbanCollapsed") || "[]");
    } catch {
      return [];
    }
  });

  function toggleColumn(status) {
    setCollapsed(prev => {
      const next = prev.includes(status) ? prev.filter(item => item !== status) : [...prev, status];
      try {
        window.localStorage.setItem("kanbanCollapsed", JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }

  const query = search.trim().toLowerCase();
  const sorters = {
    orderDate: (a, b) => (b.orderDate || "").localeCompare(a.orderDate || ""),
    customer: (a, b) => a.customer.localeCompare(b.customer)
  };
  const orders = data.orders
    .filter(order => [order.orderNo, order.customer, order.material, order.size, ...(order.workTypes || [])].join(" ").toLowerCase().includes(query))
    .sort(sorters[sortKey]);

  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "field sort-control" },
      React.createElement("label", null, "Sort by"),
      React.createElement("select", { value: sortKey, onChange: event => setSortKey(event.target.value) },
        React.createElement("option", { value: "orderDate" }, "Order date"),
        React.createElement("option", { value: "customer" }, "Company name")
      )
    ),
    React.createElement(DndContext, {
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
          collapsed: collapsed.includes(status),
          onToggle: () => toggleColumn(status),
          setSelectedId,
          setPage
        }))
      )
    )
  );
}

function KanbanColumn({ status, orders, collapsed, onToggle, setSelectedId, setPage }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return React.createElement("article", { ref: setNodeRef, className: `column ${isOver ? "drop-over" : ""} ${collapsed ? "collapsed" : ""}` },
    React.createElement("div", { className: "column-head", onClick: onToggle, role: "button" },
      React.createElement("span", { className: "collapse-caret" }, collapsed ? "\u25B8" : "\u25BE"),
      React.createElement("div", { className: "column-title" }, status),
      React.createElement("span", { className: "count-pill" }, orders.length)
    ),
    !collapsed && React.createElement("div", { className: "cards" },
      orders.length ? orders.map(order => React.createElement(OrderCard, { key: order.id, order, setSelectedId, setPage })) : React.createElement("div", { className: "empty" }, "Drop orders here")
    )
  );
}

function OrderCard({ order, setSelectedId, setPage }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: order.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 } : undefined;
  const thumbnail = (order.images || [])[0];
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
    React.createElement("div", { className: "card-row" },
      thumbnail && React.createElement("img", { className: "card-thumb", src: thumbnail.url, alt: thumbnail.fileName || "Job photo" }),
      React.createElement("div", { className: "card-info" },
        React.createElement("div", { className: "order-no" }, order.orderNo),
        React.createElement("div", { className: "card-title" }, order.customer),
        order.size && React.createElement("div", { className: "card-line" }, order.size),
        order.qty !== "" && React.createElement("div", { className: "card-line" }, `${order.qty}pc`)
      ),
      React.createElement("div", { className: "card-side" },
        order.urgent && React.createElement("span", { className: "status-pill urgent-pill" }, "Urgent"),
        order.orderDate && React.createElement("span", { className: "card-date" }, fmtDate(order.orderDate))
      )
    )
  );
}

function CreateOrder({ data, createOrder }) {
  return React.createElement(React.Fragment, null,
    pageHead("Create Work Order", "Only client name is required - fill in the rest as it becomes available."),
    React.createElement("form", { className: "form-grid", onSubmit: createOrder },
      panel("Job Details",
        field("Client name", "customer", "text", "", true, data.customers.map(customer => customer.name)),
        field("Order date", "orderDate", "date", new Date().toISOString().slice(0, 10)),
        React.createElement("label", { className: "checkbox-option urgent-check" },
          React.createElement("input", { type: "checkbox", name: "urgent", value: "Yes" }),
          React.createElement("span", null, "Urgent")
        ),
        checkboxGroup("Repair / Make", "jobCategory", JOB_CATEGORIES, [], false),
        checkboxGroup("Work type (select any that apply)", "workTypes", JOB_WORK_TYPES),
        React.createElement(QtyField, {}),
        textarea("Part Name", "description"),
        field("Material", "material"),
        field("Size", "size"),
        React.createElement(SampleField, {}),
        React.createElement("div", { className: "field full-span" },
          React.createElement("label", null, "Photos"),
          React.createElement("input", { type: "file", name: "photos", accept: "image/*", multiple: true })
        )
      ),
      React.createElement("details", { className: "panel collapsible" },
        React.createElement("summary", null, "Supplier detail"),
        React.createElement("div", { className: "collapsible-body" },
          field("Supplier name", "supplierName", "text", "", false, data.suppliers.map(supplier => supplier.name)),
          field("Material", "supplierMaterial"),
          field("Size", "supplierSize"),
          field("QTY", "supplierQty", "number"),
          field("Order date", "supplierOrderDate", "date"),
          field("Delivery date", "supplierDeliveryDate", "date")
        )
      ),
      React.createElement("details", { className: "panel collapsible" },
        React.createElement("summary", null, "Price detail"),
        React.createElement("div", { className: "collapsible-body" },
          React.createElement(PriceDetailFields, {})
        )
      ),
      React.createElement("details", { className: "panel collapsible" },
        React.createElement("summary", null, "Delivery detail"),
        React.createElement("div", { className: "collapsible-body" },
          checkboxGroup("Driver", "driver", ["H&D", "Self Pick-Up"], [], false),
          field("Delivery date", "deliveryDatetime", "date")
        )
      ),
      React.createElement("details", { className: "panel collapsible" },
        React.createElement("summary", null, "Documentation"),
        React.createElement("div", { className: "collapsible-body" },
          field("Quotation No.", "quotationNo"),
          field("P.O. No.", "poNo"),
          field("D.O. No.", "doNo")
        )
      ),
      panel("Remark",
        textarea("Remark", "remark"),
        React.createElement("button", { className: "btn", type: "submit" }, "Save Work Order")
      )
    )
  );
}

function PriceDetailFields({ initial = {} }) {
  const [materialCost, setMaterialCost] = useState(initial.materialCost ?? "");
  const [laborCost, setLaborCost] = useState(initial.laborCost ?? "");
  const [quotedPrice, setQuotedPrice] = useState(initial.quotedPrice ?? "");
  const grossProfit = Number(quotedPrice || 0) - Number(materialCost || 0) - Number(laborCost || 0);
  return React.createElement(React.Fragment, null,
    React.createElement("div", { className: "field" },
      React.createElement("label", { htmlFor: "materialCost" }, "Mat Cost"),
      React.createElement("input", { id: "materialCost", name: "materialCost", type: "number", value: materialCost, onChange: event => setMaterialCost(event.target.value) })
    ),
    React.createElement("div", { className: "field" },
      React.createElement("label", { htmlFor: "laborCost" }, "Labour"),
      React.createElement("input", { id: "laborCost", name: "laborCost", type: "number", value: laborCost, onChange: event => setLaborCost(event.target.value) })
    ),
    React.createElement("div", { className: "field" },
      React.createElement("label", { htmlFor: "quotedPrice" }, "Price quote"),
      React.createElement("input", { id: "quotedPrice", name: "quotedPrice", type: "number", value: quotedPrice, onChange: event => setQuotedPrice(event.target.value) })
    ),
    React.createElement("div", { className: "field" },
      React.createElement("label", null, "Gross Profit"),
      React.createElement("div", { className: "computed-value" }, money(grossProfit))
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
      panel(order.customer,
        order.urgent && React.createElement("span", { className: "status-pill urgent-pill" }, "Urgent"),
        React.createElement("div", { className: "detail-meta" },
          order.qty !== "" && React.createElement("span", null, `Qty: ${order.qty}`),
          order.size && React.createElement("span", null, `Size: ${order.size}`),
          order.sample && React.createElement("span", null, `Sample: ${order.sample}`)
        ),
        order.remark && React.createElement("p", { className: "subtitle" }, `Remark: ${order.remark}`),
        React.createElement("div", { className: "image-grid" },
          ...(order.images || []).map(image => React.createElement("img", { key: image.id || image.url, src: image.url, alt: image.fileName || "Job photo" })),
          !(order.images || []).length && React.createElement("div", { className: "empty" }, "No photos yet")
        ),
        React.createElement("input", { type: "file", accept: "image/*", multiple: true, onChange: event => addImages(order.id, event.target.files) }),
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
          field("Client name", "customer", "text", order.customer, true, data.customers.map(customer => customer.name)),
          field("Order date", "orderDate", "date", order.orderDate),
          React.createElement("label", { className: "checkbox-option urgent-check" },
            React.createElement("input", { type: "checkbox", name: "urgent", value: "Yes", defaultChecked: order.urgent }),
            React.createElement("span", null, "Urgent")
          ),
          checkboxGroup("Repair / Make", "jobCategory", JOB_CATEGORIES, order.jobCategory ? [order.jobCategory] : [], false),
          checkboxGroup("Work type (select any that apply)", "workTypes", JOB_WORK_TYPES, order.workTypes),
          React.createElement(QtyField, { initial: order.qty, key: `qty-${order.id}` }),
          field("Material", "material", "text", order.material),
          field("Size", "size", "text", order.size),
          React.createElement(SampleField, { initial: order.sample, key: `sample-${order.id}` }),
          React.createElement("div", { className: "field full-span" },
            React.createElement("label", null, "Part Name"),
            React.createElement("textarea", { name: "description", defaultValue: order.description })
          ),
          React.createElement("div", { className: "field full-span" },
            React.createElement("label", null, "Remark"),
            React.createElement("textarea", { name: "remark", defaultValue: order.remark })
          ),
          React.createElement("details", { className: "collapsible nested" },
            React.createElement("summary", null, "Supplier detail"),
            React.createElement("div", { className: "collapsible-body" },
              field("Supplier name", "supplierName", "text", order.supplierName, false, data.suppliers.map(supplier => supplier.name)),
              field("Material", "supplierMaterial", "text", order.supplierMaterial),
              field("Size", "supplierSize", "text", order.supplierSize),
              field("QTY", "supplierQty", "number", order.supplierQty),
              field("Order date", "supplierOrderDate", "date", order.supplierOrderDate),
              field("Delivery date", "supplierDeliveryDate", "date", order.supplierDeliveryDate)
            )
          ),
          React.createElement("details", { className: "collapsible nested" },
            React.createElement("summary", null, "Price detail"),
            React.createElement("div", { className: "collapsible-body" },
              React.createElement(PriceDetailFields, { initial: order })
            )
          ),
          React.createElement("details", { className: "collapsible nested" },
            React.createElement("summary", null, "Delivery detail"),
            React.createElement("div", { className: "collapsible-body" },
              checkboxGroup("Driver", "driver", ["H&D", "Self Pick-Up"], order.driver ? [order.driver] : [], false),
              field("Delivery date", "deliveryDatetime", "date", order.deliveryDatetime ? order.deliveryDatetime.slice(0, 10) : "")
            )
          ),
          React.createElement("details", { className: "collapsible nested" },
            React.createElement("summary", null, "Documentation"),
            React.createElement("div", { className: "collapsible-body" },
              field("Quotation No.", "quotationNo", "text", order.quotationNo),
              field("P.O. No.", "poNo", "text", order.poNo),
              field("D.O. No.", "doNo", "text", order.doNo)
            )
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
  const rows = props.data.customers.map(item => {
    const orders = props.data.orders.filter(order => order.customer === item.name);
    const total = orders.reduce((sum, order) => sum + Number(order.quotedPrice || 0), 0);
    const lastOrder = orders.map(order => order.orderDate).filter(Boolean).sort().pop() || "";
    return { ...item, _lastOrder: lastOrder, _totalSales: total };
  });
  return React.createElement(CrudModule, {
    title: "Customer Management",
    api: customersApi,
    rows,
    runAction: props.runAction,
    sortOptions: [
      { key: "az", label: "Name (A-Z)", compare: (a, b) => a.name.localeCompare(b.name) },
      { key: "lastOrder", label: "Last order date", compare: (a, b) => b._lastOrder.localeCompare(a._lastOrder) },
      { key: "sales", label: "Total sales", compare: (a, b) => b._totalSales - a._totalSales }
    ],
    fields: [
      ["name", "Customer name", "text", true],
      ["companyFullName", "Company full name"],
      ["contact", "Contact person"],
      ["phone", "Phone"],
      ["email", "Email", "email"],
      ["industry", "Industry"],
      ["ssmNumber", "SSM number"],
      ["sstNumber", "SST number"],
      ["tinNumber", "TIN number"]
    ],
    renderLines: item => [
      `Company: ${item.companyFullName || "None"}`,
      `Contact: ${item.contact || "None"}`,
      `Phone: ${item.phone || "None"}`,
      `Email: ${item.email || "None"}`,
      `Industry: ${item.industry || "None"}`,
      `SSM: ${item.ssmNumber || "None"} - SST: ${item.sstNumber || "None"} - TIN: ${item.tinNumber || "None"}`,
      `Last order: ${item._lastOrder ? fmtDate(item._lastOrder) : "None"}`,
      `Total sales: ${money(item._totalSales)}`
    ],
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
    fields: [["name", "Worker name", "text", true], ["role", "Role", "text", true], ["dateOfBirth", "Date of birth", "date"], ["skills", "Skills"], ["status", "Status"], ["activeOrderId", "Active work order ID"]],
    renderLines: item => [`Role: ${item.role}`, `Age: ${calculateAge(item.dateOfBirth)}`, `Skills: ${item.skills || "None"}`, `Active order: ${item.activeOrderId || "None"}`],
    badge: item => item.status || "Available"
  });
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return "Unknown";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "Unknown";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear = (today.getMonth() > dob.getMonth()) || (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
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

function CrudModule({ title, api, rows, fields, renderLines, badge, heading, runAction, sortOptions }) {
  const [editing, setEditing] = useState(null);
  const [sortKey, setSortKey] = useState(sortOptions?.[0]?.key || "");
  const blank = Object.fromEntries(fields.map(([name]) => [name, ""]));
  const active = editing || blank;
  const activeSort = sortOptions?.find(option => option.key === sortKey);
  const sortedRows = activeSort ? [...rows].sort(activeSort.compare) : rows;

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
    sortOptions && React.createElement("div", { className: "field sort-control" },
      React.createElement("label", null, "Sort by"),
      React.createElement("select", { value: sortKey, onChange: event => setSortKey(event.target.value) },
        ...sortOptions.map(option => React.createElement("option", { key: option.key, value: option.key }, option.label))
      )
    ),
    React.createElement("section", { className: "cards module-list" },
      ...sortedRows.map(item => React.createElement("article", { key: item.id, className: "order-card static-card" },
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
      !sortedRows.length && React.createElement("div", { className: "panel empty" }, "No records yet.")
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

function optionalSelect(label, name, options, selected = "") {
  return React.createElement("div", { className: "field" },
    React.createElement("label", { htmlFor: name }, label),
    React.createElement("select", { id: name, name, defaultValue: selected },
      React.createElement("option", { value: "" }, "Not specified"),
      ...options.map(option => React.createElement("option", { key: option, value: option }, option))
    )
  );
}

function checkboxGroup(label, name, options, selectedValues = [], multiple = true) {
  const values = Array.isArray(selectedValues) ? selectedValues : [selectedValues].filter(Boolean);
  return React.createElement("div", { className: "field full-span" },
    label && React.createElement("label", null, label),
    React.createElement("div", { className: "checkbox-group" },
      ...options.map(option => React.createElement("label", { key: option, className: "checkbox-option" },
        React.createElement("input", { type: multiple ? "checkbox" : "radio", name, value: option, defaultChecked: values.includes(option) }),
        React.createElement("span", null, option)
      ))
    )
  );
}

const QTY_QUICK_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 10];

function QtyField({ initial = "" }) {
  const isQuick = QTY_QUICK_OPTIONS.includes(Number(initial));
  const [mode, setMode] = useState(initial === "" || isQuick ? "quick" : "custom");
  const [value, setValue] = useState(initial === "" ? "" : String(initial));
  return React.createElement("div", { className: "field" },
    React.createElement("label", null, "QTY"),
    React.createElement("div", { className: "checkbox-group" },
      ...QTY_QUICK_OPTIONS.map(option => React.createElement("label", { key: option, className: `checkbox-option ${mode === "quick" && Number(value) === option ? "active" : ""}` },
        React.createElement("input", {
          type: "radio",
          name: "qtyQuick",
          checked: mode === "quick" && Number(value) === option,
          onChange: () => { setMode("quick"); setValue(String(option)); }
        }),
        React.createElement("span", null, option)
      )),
      React.createElement("input", {
        type: "number",
        min: "0",
        placeholder: "Other",
        value: mode === "custom" ? value : "",
        onFocus: () => setMode("custom"),
        onChange: event => { setValue(event.target.value); setMode("custom"); }
      })
    ),
    React.createElement("input", { type: "hidden", name: "qty", value, readOnly: true })
  );
}

function SampleField({ initial = "" }) {
  const startsAsNo = initial === "" || initial === "No" || initial === "no";
  const [mode, setMode] = useState(startsAsNo ? "no" : "qty");
  const [qty, setQty] = useState(startsAsNo ? "" : initial);
  return React.createElement("div", { className: "field" },
    React.createElement("label", null, "Sample"),
    React.createElement("div", { className: "sample-toggle" },
      React.createElement("label", { className: `checkbox-option ${mode === "no" ? "active" : ""}` },
        React.createElement("input", {
          type: "radio",
          name: "sampleMode",
          checked: mode === "no",
          onChange: () => { setMode("no"); setQty(""); }
        }),
        React.createElement("span", null, "No")
      ),
      React.createElement("input", {
        type: "number",
        min: "0",
        placeholder: "Qty",
        value: qty,
        onFocus: () => setMode("qty"),
        onChange: event => { setQty(event.target.value); setMode("qty"); }
      })
    ),
    React.createElement("input", { type: "hidden", name: "sample", value: mode === "no" ? "No" : qty, readOnly: true })
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
