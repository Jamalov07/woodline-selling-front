"use client";

import { useState } from "react";
import { Product } from "@/lib/api";

export default function ProductsPage() {
    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Mahsulotlar
                </h1>
                <p className="text-muted-foreground">
                    Barcha mahsulotlar ro'yxati
                </p>
            </div>

            <div className="rounded-lg border p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">
                    Mahsulotlar sahifasi
                </h2>
                <p className="text-muted-foreground">
                    Bu yerda barcha mahsulotlar va ularning ma'lumotlari bo'ladi
                </p>
            </div>
        </div>
    );
}
