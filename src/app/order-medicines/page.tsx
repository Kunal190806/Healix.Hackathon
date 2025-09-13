
import OrderMedicines from "@/components/order-medicines";

export default function OrderMedicinesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">Order Medicines</h1>
        <p className="text-muted-foreground mt-2">
          Upload a prescription or add medicines manually to compare prices and order.
        </p>
      </header>
      <OrderMedicines />
    </div>
  );
}
