"use client";

import { useEffect, useState } from "react";
import { ApiModels } from "@/lib/models";
import { useToast } from "../../../../hooks/use-toast";
import { apiService, Model, Product } from "../../../../lib/api";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [models, setModels] = useState<Model[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );

    // Form states
    const [formData, setFormData] = useState({
        type: "",
        publicId: "",
        tissue: "",
        quantity: "",
        direction: "",
        desciption: "",
        modelId: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [modelOpen, setModelOpen] = useState(false);
    const [directionOpen, setDirectionOpen] = useState(false);
    const [modelSearch, setModelSearch] = useState("");

    const { toast } = useToast();

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await apiService.getProducts({
                pageNumber: currentPage,
                pageSize,
                search: searchTerm || undefined,
                pagination: true,
            });

            if (response.success.is) {
                setProducts(response.data.data);
                setTotalCount(response.data.totalCount || 0);
                setTotalPages(response.data.pagesCount || 0);
            } else if (response.error.is) {
                toast({
                    variant: "destructive",
                    title: "Xatolik",
                    description: response.error.messages.join(", "),
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Xatolik",
                description: "Ma'lumotlarni yuklashda xatolik yuz berdi",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchModels = async (search?: string) => {
        try {
            const response = await apiService.getModels({
                name: search,
                pagination: false,
            });

            if (response.success.is) {
                setModels(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching models:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage, pageSize, searchTerm]);

    useEffect(() => {
        fetchModels();
    }, []);

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
