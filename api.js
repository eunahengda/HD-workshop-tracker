import { isSupabaseConfigured, supabase } from "./supabaseClient";

export { isSupabaseConfigured };

export const STATUSES = ["New Order", "Material Ordering", "Machining", "Ready To Deliver", "Delivered"];
export const WORK_TYPES = ["Lathe", "Turning", "Milling", "Welding", "Repair Works"];
export const JOB_WORK_TYPES = ["Lathe", "Milling", "Welding"];
export const JOB_CATEGORIES = ["Repair", "Make"];
export const PRIORITIES = ["Medium", "High", "Low"];
export const STORAGE_BUCKET = "work-order-images";

const TABLES = [
  "customers",
  "suppliers",
  "workers",
  "quote_history",
  "repair_case_library",
  "work_orders",
  "work_order_status_history",
  "work_order_images"
];

export const authApi = {
  async getSession() {
    const client = requireSupabase();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session;
  },
  async signIn(email, password) {
    const client = requireSupabase();
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) await this.ensureProfile(data.user);
    return data.session;
  },
  async signUp({ email, password, fullName, role }) {
    const client = requireSupabase();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role
        }
      }
    });
    if (error) throw error;
    return data.session;
  },
  async signOut() {
    const { error } = await requireSupabase().auth.signOut();
    if (error) throw error;
  },
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured || !supabase) return () => {};
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },
  async getProfile() {
    const client = requireSupabase();
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError) throw userError;
    if (!userData.user) return null;
    let profile = await run(client.from("profiles").select("*").eq("id", userData.user.id).maybeSingle());
    if (!profile) {
      profile = await this.ensureProfile(userData.user);
    }
    return profile ? mapProfile(profile) : null;
  },
  async ensureProfile(user) {
    const metadata = user.user_metadata || {};
    const role = ["Owner", "Manager", "Production", "Driver"].includes(metadata.role) ? metadata.role : "Production";
    const row = await run(requireSupabase().from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: metadata.full_name || user.email,
      role
    }).select().single());
    return row;
  }
};

export function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.");
  }
  return supabase;
}

async function run(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export function subscribeToRealtime(onChange) {
  const client = requireSupabase();
  const channel = client.channel("workshop-operations");
  TABLES.forEach(table => {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, onChange);
  });
  channel.subscribe();
  return () => client.removeChannel(channel);
}

export async function loadWorkshopData() {
  const client = requireSupabase();
  const [
    customers,
    suppliers,
    workers,
    quotes,
    repairs,
    orders,
    history,
    images,
    profiles
  ] = await Promise.all([
    run(client.from("customers").select("*").order("name")),
    run(client.from("suppliers").select("*").order("name")),
    run(client.from("workers").select("*").order("name")),
    run(client.from("quote_history").select("*").order("quote_date", { ascending: false })),
    run(client.from("repair_case_library").select("*").order("problem")),
    run(client.from("work_orders").select("*").order("created_at", { ascending: false })),
    run(client.from("work_order_status_history").select("*").order("created_at", { ascending: true })),
    run(client.from("work_order_images").select("*").order("created_at", { ascending: true })),
    run(client.from("profiles").select("*"))
  ]);

  const profileMap = new Map(profiles.map(profile => [profile.id, profile.full_name || profile.email]));
  const signedImages = await Promise.all(images.map(async image => ({
    ...image,
    signed_url: await createImageUrl(image.image_url)
  })));

  return {
    customers: customers.map(mapCustomer),
    suppliers: suppliers.map(mapSupplier),
    workers: workers.map(mapWorker),
    quotes: quotes.map(mapQuote),
    repairs: repairs.map(mapRepair),
    orders: orders.map(order => mapOrder(
      order,
      history.filter(item => item.work_order_id === order.id),
      signedImages.filter(item => item.work_order_id === order.id),
      profileMap
    ))
  };
}

export const customersApi = crudApi("customers", mapCustomer, customerToRow, "name");
export const suppliersApi = crudApi("suppliers", mapSupplier, supplierToRow, "name");
export const workersApi = crudApi("workers", mapWorker, workerToRow, "name");
export const quotesApi = crudApi("quote_history", mapQuote, quoteToRow, "quote_date");
export const repairsApi = crudApi("repair_case_library", mapRepair, repairToRow, "problem");

function crudApi(table, map, toRow, orderColumn) {
  return {
    async create(record) {
      const row = await run(requireSupabase().from(table).insert(toRow(record)).select().single());
      return map(row);
    },
    async update(id, record) {
      const row = await run(requireSupabase().from(table).update(toRow(record)).eq("id", id).select().single());
      return map(row);
    },
    async remove(id) {
      await run(requireSupabase().from(table).delete().eq("id", id));
    },
    async list() {
      const rows = await run(requireSupabase().from(table).select("*").order(orderColumn));
      return rows.map(map);
    }
  };
}

export const workOrdersApi = {
  async create(record) {
    const row = await run(requireSupabase().from("work_orders").insert(orderToRow(record)).select().single());
    await this.addStatusHistory(row.id, row.status, "Work order created");
    return row.id;
  },
  async update(id, record) {
    await run(requireSupabase().from("work_orders").update(orderToRow(record)).eq("id", id).select().single());
  },
  async remove(id) {
    await run(requireSupabase().from("work_orders").delete().eq("id", id));
  },
  async updateStatus(id, status, note = "Status updated") {
    await run(requireSupabase().from("work_orders").update({ status }).eq("id", id).select().single());
    await this.addStatusHistory(id, status, note);
  },
  async addStatusHistory(workOrderId, status, note) {
    await run(requireSupabase().from("work_order_status_history").insert({
      work_order_id: workOrderId,
      status,
      note
    }));
  },
  async uploadImages(workOrderId, files) {
    const client = requireSupabase();
    const uploaded = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${workOrderId}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { error } = await client.storage.from(STORAGE_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false
      });
      if (error) throw error;
      const image = await run(client.from("work_order_images").insert({
        work_order_id: workOrderId,
        image_url: path,
        file_name: file.name
      }).select().single());
      uploaded.push(mapImage({ ...image, signed_url: await createImageUrl(path) }));
    }
    return uploaded;
  }
};

function mapProfile(row) {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: row.role
  };
}

function mapCustomer(row) {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact_person || "",
    phone: row.phone || "",
    email: row.email || "",
    industry: row.industry || ""
  };
}

function customerToRow(record) {
  return {
    name: record.name,
    contact_person: record.contact,
    phone: record.phone,
    email: record.email,
    industry: record.industry
  };
}

function mapSupplier(row) {
  return {
    id: row.id,
    name: row.name,
    materials: row.materials || "",
    phone: row.phone || "",
    email: row.email || "",
    status: row.status || "Active"
  };
}

function supplierToRow(record) {
  return {
    name: record.name,
    materials: record.materials,
    phone: record.phone,
    email: record.email,
    status: record.status
  };
}

function mapWorker(row) {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    skills: row.skills || "",
    status: row.status || "Available",
    activeOrderId: row.active_order_id || ""
  };
}

function workerToRow(record) {
  return {
    name: record.name,
    role: record.role,
    skills: record.skills,
    status: record.status,
    active_order_id: record.activeOrderId || null
  };
}

function mapQuote(row) {
  return {
    id: row.id,
    quoteNo: row.quote_no,
    customerId: row.customer_id || "",
    customer: row.customer_name,
    title: row.title,
    amount: Number(row.amount || 0),
    status: row.status,
    date: row.quote_date
  };
}

function quoteToRow(record) {
  return {
    quote_no: record.quoteNo,
    customer_id: record.customerId || null,
    customer_name: record.customer,
    title: record.title,
    amount: Number(record.amount || 0),
    status: record.status,
    quote_date: record.date
  };
}

function mapRepair(row) {
  return {
    id: row.id,
    problem: row.problem,
    workType: row.work_type,
    category: row.category || "",
    solution: row.solution
  };
}

function repairToRow(record) {
  return {
    problem: record.problem,
    work_type: record.workType,
    category: record.category,
    solution: record.solution
  };
}

function mapOrder(row, history, images, profileMap = new Map()) {
  return {
    id: row.id,
    orderNo: row.order_no,
    customer: row.customer,
    phone: row.phone || "",
    title: row.title || "",
    workType: row.work_type || "",
    description: row.description || "",
    status: row.status,
    priority: row.priority || "",
    dueDate: row.due_date,
    deliveryAddress: row.delivery_address || "",
    materialCost: Number(row.material_cost || 0),
    laborCost: Number(row.labor_cost || 0),
    otherCost: Number(row.other_cost || 0),
    quotedPrice: Number(row.quoted_price || 0),
    orderDate: row.order_date || "",
    jobCategory: row.job_category || "",
    workTypes: Array.isArray(row.work_types) ? row.work_types : [],
    qty: row.qty === null || row.qty === undefined ? "" : Number(row.qty),
    material: row.material || "",
    size: row.size || "",
    sample: row.sample || "",
    urgent: Boolean(row.urgent),
    remark: row.remark || "",
    supplierName: row.supplier_name || "",
    supplierMaterial: row.supplier_material || "",
    supplierSize: row.supplier_size || "",
    supplierQty: row.supplier_qty === null || row.supplier_qty === undefined ? "" : Number(row.supplier_qty),
    driver: row.driver || "",
    deliveryDatetime: row.delivery_datetime || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdByName: profileMap.get(row.created_by) || "",
    updatedByName: profileMap.get(row.updated_by) || "",
    history: history.map(item => mapHistory(item, profileMap)),
    images: images.map(mapImage)
  };
}

function orderToRow(record) {
  return {
    // order_no is intentionally omitted on create - the database trigger
    // assigns it automatically (format YYMM-NNN, resets each month).
    customer: record.customer,
    phone: record.phone || null,
    title: record.title || null,
    work_type: record.workType || null,
    description: record.description || null,
    status: record.status,
    priority: record.priority || null,
    due_date: record.dueDate || null,
    delivery_address: record.deliveryAddress || null,
    material_cost: Number(record.materialCost || 0),
    labor_cost: Number(record.laborCost || 0),
    other_cost: Number(record.otherCost || 0),
    quoted_price: Number(record.quotedPrice || 0),
    order_date: record.orderDate || new Date().toISOString().slice(0, 10),
    job_category: record.jobCategory || null,
    work_types: Array.isArray(record.workTypes) ? record.workTypes : [],
    qty: record.qty === "" || record.qty === undefined || record.qty === null ? null : Number(record.qty),
    material: record.material || null,
    size: record.size || null,
    sample: record.sample || null,
    urgent: Boolean(record.urgent),
    remark: record.remark || null,
    supplier_name: record.supplierName || null,
    supplier_material: record.supplierMaterial || null,
    supplier_size: record.supplierSize || null,
    supplier_qty: record.supplierQty === "" || record.supplierQty === undefined || record.supplierQty === null ? null : Number(record.supplierQty),
    driver: record.driver || null,
    delivery_datetime: record.deliveryDatetime || null
  };
}

function mapHistory(row, profileMap = new Map()) {
  return {
    id: row.id,
    status: row.status,
    note: row.note || "",
    createdBy: row.created_by,
    createdByName: profileMap.get(row.created_by) || "",
    at: row.created_at
  };
}

function mapImage(row) {
  return {
    id: row.id,
    url: row.signed_url || row.image_url,
    path: row.image_url,
    fileName: row.file_name || "Upload"
  };
}

async function createImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const { data, error } = await requireSupabase().storage.from(STORAGE_BUCKET).createSignedUrl(path, 3600);
  if (error) return "";
  return data.signedUrl;
}
