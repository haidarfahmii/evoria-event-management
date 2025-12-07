import { useState, useEffect } from "react";
import useUrlState from "./useUrlState"; // Pastikan path import ini benar

export function usePagination<T>(data: T[], itemsPerPage: number) {
    const { getParam, setParam } = useUrlState();

    // 1. Ambil halaman awal dari URL, jika tidak ada default ke 1
    const initialPage = parseInt(getParam("page") || "1", 10);

    const [currentPage, setCurrentPage] = useState<number>(
        !isNaN(initialPage) && initialPage > 0 ? initialPage : 1
    );

    const totalPages = Math.ceil(data.length / itemsPerPage);

    // 2. Fungsi ganti halaman (Update State & URL)
    const changePage = (page: number) => {
        const validPage = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(validPage);
        setParam("page", validPage.toString());

        // Opsional: Scroll ke atas saat ganti halaman
        // window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // 3. Menghitung data yang akan ditampilkan (Slicing)
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = data.slice(startIndex, endIndex);

    // 4. Sinkronisasi URL (Untuk tombol back/forward browser)
    useEffect(() => {
        const pageFromUrl = parseInt(getParam("page") || "1", 10);
        if (!isNaN(pageFromUrl) && pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl);
        }
    }, [getParam]);

    // 5. Safety Check: Jika data berubah (misal filter ganti) dan currentPage melebihi totalPages
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            changePage(1);
        }
    }, [data.length, totalPages]);

    return {
        currentPage,
        totalPages,
        currentData,
        changePage,
        isFirstPage: currentPage === 1,
        isLastPage: currentPage === totalPages || totalPages === 0,
    };
}