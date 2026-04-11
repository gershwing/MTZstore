// admin/src/components/UploadBox/index.jsx
import React, { useContext, useEffect, useRef, useState } from "react";
import { FaRegImages } from "react-icons/fa6";
import CircularProgress from "@mui/material/CircularProgress";

// import { AppContext } from "../../context/AppContext";
import { uploadImages } from "../../utils/api.js";

const ALLOWED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function UploadBox({
    url,                   // endpoint: ej. "/api/product/upload-images"
    name = "images",       // field name esperado por multer en tu back
    multiple = false,
    maxFiles = 6,
    maxSizeMB = 5,
    allowSVG = false,
    headers = {},          // { "Idempotency-Key": "...", ... }
    className = "",

    // ✅ Nuevos props
    label,                 // texto arriba del cuadro
    required = false,      // muestra *
    placeholder = "Subir imagen", // texto dentro del cuadro
    ariaLabel,             // accesibilidad

    // Callbacks
    onStart,               // () => void
    onError,               // (error) => void
    onComplete,            // (images[]) => void
    setPreviewsFun,        // compat
}) {
    // Si deseas usar AppContext, destapa esto:
    // const context = useContext(AppContext) || {};
    const inputRef = useRef(null);

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [previews, setPreviews] = useState([]); // [{url, name, size}]

    // 🔔 Notificador defensivo (evita romper si no hay provider)
    const notify = (type, message) => {
        const text = typeof message === "string" ? message : (message?.message || "Ocurrió un error");
        try {
            // Si usas AppContext con alertBox, puedes intentar:
            // context?.alertBox?.(type, text);
            // y siempre hacer fallback:
            if (!window?.alert) return;
            window.alert(text);
        } catch { }
    };

    // limpiar objectURLs al desmontar
    useEffect(() => {
        return () => {
            previews.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [previews]);

    const validateFile = (file) => {
        const okType = ALLOWED.includes(file.type) || (allowSVG && file.type === "image/svg+xml");
        if (!okType) {
            throw new Error("Tipo inválido. Usa JPG, PNG o WebP" + (allowSVG ? " o SVG" : ""));
        }
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > maxSizeMB) {
            throw new Error(`Archivo muy grande (> ${maxSizeMB} MB): ${file.name}`);
        }
    };

    const onChangeFile = async (e) => {
        try {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;

            if (multiple === false && files.length > 1) {
                notify("error", "Solo se permite 1 imagen.");
                return;
            }

            if (files.length > maxFiles) {
                notify("error", `Máximo ${maxFiles} imágenes.`);
                return;
            }

            // Validación y previews locales
            const nextPreviews = [];
            for (const f of files) {
                validateFile(f);
                nextPreviews.push({
                    url: URL.createObjectURL(f),
                    name: f.name,
                    size: f.size,
                });
            }
            setPreviews((prev) => {
                prev.forEach((p) => URL.revokeObjectURL(p.url));
                return nextPreviews;
            });

            // Construye FormData nuevo en cada subida
            const fd = new FormData();
            for (const f of files) fd.append(name, f);

            onStart?.();
            setUploading(true);
            setProgress(0);

            // headers multi-tenant
            const storeId = localStorage.getItem("X-Store-Id") || "";
            const mergedHeaders = {
                ...(storeId ? { "X-Store-Id": storeId } : {}),
                ...headers,
            };

            const res = await uploadImages(url, fd, {
                headers: mergedHeaders,
                onUploadProgress: (evt) => {
                    if (!evt?.total) return;
                    const pct = Math.round((evt.loaded * 100) / evt.total);
                    setProgress(pct);
                },
            });

            setUploading(false);
            setProgress(100);

            const images = res?.data?.images || res?.images || res?.data || [];
            setPreviewsFun?.(images);
            onComplete?.(images);

            // reset para permitir re-seleccionar el mismo archivo luego
            if (inputRef.current) inputRef.current.value = "";
        } catch (err) {
            console.error(err);
            setUploading(false);
            setProgress(0);
            onError?.(err);
            notify("error", err?.message || "Error al subir imagen");
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            {/* ✅ Label arriba del cuadro */}
            {label && (
                <div className="text-sm text-gray-700 mb-1">
                    {label} {required ? <span className="text-red-500">*</span> : null}
                </div>
            )}

            <div
                className={`uploadBox p-3 rounded-md border border-dashed border-black/30 h-[150px] w-full bg-gray-100 hover:bg-gray-200 cursor-pointer flex items-center justify-center flex-col relative ${className}`}
            >
                {uploading ? (
                    <>
                        <CircularProgress />
                        <h4 className="text-center mt-2">Subiendo… {progress}%</h4>
                    </>
                ) : (
                    <>
                        <FaRegImages className="text-[40px] opacity-35 pointer-events-none" />
                        {/* ✅ Placeholder configurable */}
                        <h4 className="text-[14px] pointer-events-none">{placeholder}</h4>

                        {/* input "tapa" clickable */}
                        <input
                            ref={inputRef}
                            type="file"
                            accept={allowSVG ? "image/*,.svg" : "image/*"}
                            multiple={multiple}
                            className="absolute inset-0 w-full h-full z-10 opacity-0"
                            onChange={onChangeFile}
                            name={name}
                            aria-label={ariaLabel || placeholder || label || "Subir imagen"}
                        />
                    </>
                )}

                {/* previews pequeñas (opcional) */}
                {!uploading && previews?.length > 0 && (
                    <div className="absolute bottom-2 left-2 right-2 flex gap-2 overflow-x-auto">
                        {previews.map((p, i) => (
                            <img
                                key={i}
                                src={p.url}
                                alt={p.name}
                                className="w-12 h-12 rounded object-cover border border-black/10"
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
