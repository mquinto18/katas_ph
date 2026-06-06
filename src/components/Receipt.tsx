"use client";

import { forwardRef } from "react";

interface OrderItem {
  product: { name: string; price: number; };
  quantity: number;
}

interface ReceiptProps {
  orderItems: OrderItem[];
  orderType: string;
  orderTotal: number;
  payment: "cash" | "online";
  cashReceived?: number;
  change?: number;
  receiptNumber: string;
  date: string;
  time: string;
  shopName?: string;
  shopAddress?: string;
  receiptFooter?: string;
}

const ORDER_TYPE_LABELS: Record<string, string> = {
  "dine-in": "Dine-In",
  "takeout":  "Take Out",
  "delivery": "Delivery",
};

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ orderItems, orderType, orderTotal, payment, cashReceived, change, receiptNumber, date, time, shopName, shopAddress, receiptFooter }, ref) => {
    const DIVIDER = "- - - - - - - - - - - - - - - - - - - -";

    return (
      <div
        ref={ref}
        style={{
          width: 300,
          backgroundColor: "#fff",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: 12,
          color: "#000",
          padding: "24px 20px",
          boxSizing: "border-box",
          lineHeight: 1.6,
        }}
      >
        {/* Logo & Header */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <img src="/image.png" alt="Katas PH" style={{ width: 80, height: 80, objectFit: "contain", marginBottom: 4, display: "block", margin: "0 auto 4px" }} />
          <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: 3 }}>{shopName ?? "KATAS PH"}</div>
        </div>

        {shopAddress && (
          <div style={{ textAlign: "center", fontSize: 10, color: "#555", marginBottom: 10, lineHeight: 1.8 }}>
            <div>{shopAddress}</div>
          </div>
        )}

        <div style={{ textAlign: "center", marginBottom: 10 }}>{DIVIDER}</div>

        {/* Receipt info */}
        <div style={{ fontSize: 11, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>DATE:</span><span>{date}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>TIME:</span><span>{time}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>RECEIPT:</span><span>#{receiptNumber}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>ORDER TYPE:</span><span>{ORDER_TYPE_LABELS[orderType] ?? orderType}</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 10 }}>{DIVIDER}</div>

        {/* Items */}
        <div style={{ marginBottom: 10 }}>
          {orderItems.map((item, i) => {
            const subtotal = item.product.price * item.quantity;
            return (
              <div key={i} style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700 }}>
                    {item.quantity}X {item.product.name.toUpperCase()}
                  </span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", marginBottom: 10 }}>{DIVIDER}</div>

        {/* Totals */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>SUBTOTAL:</span><span>₱{orderTotal.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 14, marginTop: 4 }}>
            <span>TOTAL:</span><span>₱{orderTotal.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 10 }}>{DIVIDER}</div>

        {/* Payment */}
        <div style={{ marginBottom: 10, fontSize: 11 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>PAYMENT:</span>
            <span>{payment === "cash" ? "CASH" : "ONLINE PAYMENT"}</span>
          </div>
          {payment === "cash" && cashReceived !== undefined && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>CASH RECEIVED:</span><span>₱{cashReceived.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>CHANGE:</span><span>₱{(change ?? 0).toFixed(2)}</span>
              </div>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>STATUS:</span><span style={{ fontWeight: 700 }}>APPROVED</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 12 }}>{DIVIDER}</div>

        {/* Footer */}
        <div style={{ textAlign: "center", fontSize: 11, marginBottom: 12 }}>
          <div>{receiptFooter ?? "PLEASE COME AGAIN!"}</div>
          <div style={{ marginTop: 8, fontWeight: 900, fontSize: 13, letterSpacing: 1 }}>
            THANK YOU FOR YOUR ORDER!
          </div>
        </div>

        <div style={{ textAlign: "center", fontSize: 10, letterSpacing: 2, marginTop: 4 }}>
          {receiptNumber}
        </div>
      </div>
    );
  }
);

Receipt.displayName = "Receipt";
export default Receipt;
