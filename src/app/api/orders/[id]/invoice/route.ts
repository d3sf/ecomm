import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { shopAuthOptions } from "@/app/api/shop-auth/[...nextauth]/auth";
import { prisma } from "@/lib/prisma";
import { jsPDF } from "jspdf";
import { Order, OrderItem, Product, Address, User } from "@prisma/client";

interface OrderWithDetails extends Order {
  orderItems: (OrderItem & {
    product: Product;
  })[];
  shippingAddress: Address;
  user: User;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(shopAuthOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Await the params
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return new NextResponse("Invalid order ID", { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        userId: parseInt(session.user.id),
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        user: true,
      },
    }) as OrderWithDetails | null;

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    // Create PDF document (A4 format)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Define constants for layout
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15
    };
    const contentWidth = pageWidth - margin.left - margin.right;
    
    // Initialize position
    let yPos = margin.top;
    
    // Add shop logo/name
    doc.setFillColor(66, 91, 235); // Indigo color
    doc.rect(0, 0, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("Merugo", pageWidth / 2, 20, { align: "center" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPos = 40;
    
    // Title
    doc.setFontSize(20);
    doc.text("INVOICE", pageWidth / 2, yPos, { align: "center" });
    yPos += 12;

    // Horizontal line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin.left, yPos, pageWidth - margin.right, yPos);
    yPos += 10;
    
    // Two column layout - left side
    const leftColX = margin.left;
    const rightColX = margin.left + contentWidth / 2 + 10;
    
    // Invoice details (right side)
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Invoice Number:", rightColX, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`#${order.id}`, rightColX + 35, yPos);
    yPos += 7;
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Date:", rightColX, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`${new Date(order.createdAt).toLocaleDateString()}`, rightColX + 35, yPos);
    yPos += 7;
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text("Status:", rightColX, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    // Set status color based on status value
    if (order.status === 'COMPLETED') {
      doc.setTextColor(46, 125, 50); // Green
    } else if (order.status === 'PENDING') {
      doc.setTextColor(245, 124, 0); // Orange
    } else if (order.status === 'CANCELLED') {
      doc.setTextColor(211, 47, 47); // Red
    }
    
    doc.text(`${order.status}`, rightColX + 35, yPos);
    doc.setTextColor(0, 0, 0); // Reset text color
    
    // Reset yPos for the left column
    yPos = yPos - 14;
    
    // Customer details (left side)
    doc.setFontSize(14);
    doc.text("Bill To:", leftColX, yPos);
    yPos += 7;
    
    doc.setFontSize(12);
    doc.text(`${order.user.name || 'N/A'}`, leftColX, yPos);
    yPos += 7;
    
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Email: ${order.user.email || 'N/A'}`, leftColX, yPos);
    yPos += 7;
    
    if (order.user.phone) {
      doc.text(`Phone: ${order.user.phone}`, leftColX, yPos);
      yPos += 7;
    }
    
    // Reset color
    doc.setTextColor(0, 0, 0);
    
    // Shipping address (left side)
    yPos += 5;
    doc.setFontSize(14);
    doc.text("Ship To:", leftColX, yPos);
    yPos += 7;
    
    doc.setFontSize(12);
    doc.text(order.shippingAddress.fullName, leftColX, yPos);
    yPos += 7;
    
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(order.shippingAddress.addressLine1, leftColX, yPos);
    yPos += 7;
    
    if (order.shippingAddress.addressLine2) {
      doc.text(order.shippingAddress.addressLine2, leftColX, yPos);
      yPos += 7;
    }
    
    doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`, leftColX, yPos);
    yPos += 7;
    
    // Reset for items section
    yPos += 10;
    doc.setTextColor(0, 0, 0);
    
    // Horizontal line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin.left, yPos, pageWidth - margin.right, yPos);
    yPos += 10;
    
    // Order items
    doc.setFontSize(16);
    doc.text("Order Items", margin.left, yPos);
    yPos += 10;
    
    // Table headers - with background
    const colWidth = [100, 25, 30, 30]; // Width for each column
    const headerHeight = 9;
    const colStart = [
      margin.left, 
      margin.left + colWidth[0], 
      margin.left + colWidth[0] + colWidth[1], 
      margin.left + colWidth[0] + colWidth[1] + colWidth[2]
    ];
    
    // Header background
    doc.setFillColor(240, 240, 240);
    doc.rect(margin.left, yPos - 6, pageWidth - margin.left - margin.right, headerHeight, 'F');
    
    // Draw header text
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text("Product", colStart[0] + 2, yPos);
    doc.text("Qty", colStart[1] + 2, yPos);
    doc.text("Price", colStart[2] + 2, yPos);
    doc.text("Total", colStart[3] + 2, yPos);
    yPos += headerHeight;
    
    // Table rows with alternating colors
    doc.setFontSize(10);
    let isAlternate = false;
    
    order.orderItems.forEach((item) => {
      // Alternate row background
      if (isAlternate) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin.left, yPos - 6, pageWidth - margin.left - margin.right, 9, 'F');
      }
      isAlternate = !isAlternate;
      
      // Make sure long product names wrap
      const itemName = item.product.name;
      doc.setTextColor(0, 0, 0);
      doc.text(itemName, colStart[0] + 2, yPos, { maxWidth: colWidth[0] - 5 });
      
      // If the text wrapped to multiple lines, get the height
      const textHeight = Math.max(
        doc.getTextDimensions(itemName, { maxWidth: colWidth[0] - 5 }).h,
        6 // Minimum row height
      );
      
      // Format the currency properly without any special characters
      const priceFormatted = "INR " + item.price.toFixed(2);
      const totalFormatted = "INR " + (item.price * item.quantity).toFixed(2);
      
      doc.text(item.quantity.toString(), colStart[1] + 2, yPos);
      doc.text(priceFormatted, colStart[2] + 2, yPos);
      doc.text(totalFormatted, colStart[3] + 2, yPos);
      
      yPos += textHeight + 3; // Add some space between rows
    });
    
    // Bottom border for the table
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin.left, yPos, pageWidth - margin.right, yPos);
    yPos += 10;
    
    // Total section with highlighted background
    doc.setFillColor(250, 250, 250);
    doc.rect(pageWidth / 2, yPos - 6, pageWidth / 2 - margin.right, 12, 'F');
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(12);
    doc.text("Total Amount:", pageWidth / 2 + 5, yPos);
    
    // Format final total without special characters
    const finalTotalFormatted = "INR " + order.totalAmount.toFixed(2);
    
    doc.setTextColor(66, 91, 235); // Indigo for total amount
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(finalTotalFormatted, pageWidth - margin.right - 5, yPos, { align: "right" });
    
    // Footer
    yPos = pageHeight - 20;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for shopping with Merugo!", pageWidth / 2, yPos, { align: "center" });
    yPos += 5;
    doc.text(`Generated on ${new Date().toLocaleString()}`, pageWidth / 2, yPos, { align: "center" });
    
    // Convert PDF to buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${order.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate invoice" }), 
      { 
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
} 