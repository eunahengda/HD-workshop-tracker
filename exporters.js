import * as XLSX from "xlsx";
import JSZip from "jszip";

function timestampSuffix() {
  return new Date().toISOString().slice(0, 10);
}

export function exportOrdersToExcel(orders) {
  const rows = orders.map(order => ({
    "Job Number": order.orderNo,
    "Client Name": order.customer,
    "Order Date": order.orderDate,
    "Repair / Make": order.jobCategory,
    "Work Type": (order.workTypes || []).join(", "),
    "Qty": order.qty,
    "Part Name": order.description,
    "Material": order.material,
    "Size": order.size,
    "Sample": order.sample,
    "Urgent": order.urgent ? "Yes" : "No",
    "Status": order.status,
    "Supplier Name": order.supplierName,
    "Supplier Material": order.supplierMaterial,
    "Supplier Size": order.supplierSize,
    "Supplier Qty": order.supplierQty,
    "Mat Cost": order.materialCost,
    "Labour": order.laborCost,
    "Price Quote": order.quotedPrice,
    "Gross Profit": Number(order.quotedPrice || 0) - Number(order.materialCost || 0) - Number(order.laborCost || 0),
    "Driver": order.driver,
    "Delivery Date": order.deliveryDatetime ? order.deliveryDatetime.slice(0, 10) : "",
    "Quotation No.": order.quotationNo,
    "P.O. No.": order.poNo,
    "D.O. No.": order.doNo,
    "Remark": order.remark,
    "Created At": order.createdAt
  }));
  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Work Orders");
  XLSX.writeFile(workbook, `HD-work-orders-${timestampSuffix()}.xlsx`);
}

function extensionFromImage(image) {
  const source = image.fileName || image.url || "";
  const match = source.match(/\.([a-zA-Z0-9]+)(?:\?.*)?$/);
  return match ? match[1].toLowerCase() : "jpg";
}

export async function exportPhotosZip(orders, onProgress) {
  const zip = new JSZip();
  const ordersWithPhotos = orders.filter(order => (order.images || []).length);
  let done = 0;
  for (const order of ordersWithPhotos) {
    const images = order.images || [];
    for (let index = 0; index < images.length; index += 1) {
      const image = images[index];
      if (!image.url) continue;
      try {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const ext = extensionFromImage(image);
        const name = images.length > 1 ? `${order.orderNo}-${index + 1}.${ext}` : `${order.orderNo}.${ext}`;
        zip.file(name, blob);
      } catch (error) {
        console.error(`Failed to download photo for ${order.orderNo}:`, error.message);
      }
    }
    done += 1;
    if (onProgress) onProgress(done, ordersWithPhotos.length);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `HD-work-order-photos-${timestampSuffix()}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
