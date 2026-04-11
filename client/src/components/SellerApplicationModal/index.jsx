import React, { useState, useContext } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { IoCloseSharp } from "react-icons/io5";
import { FaClock, FaTimesCircle, FaCloudUploadAlt } from "react-icons/fa";
import { MyContext } from "../../App";
import { postData, uploadImage } from "../../utils/api";
import "./style.css";

const SellerApplicationModal = ({ open, onClose, sellerAppData, onSubmitSuccess }) => {
  const context = useContext(MyContext);
  const categories = context?.catData || [];

  const [formData, setFormData] = useState({
    storeName: "",
    businessName: "",
    description: "",
    categoryId: "",
    documentNumber: "",
  });

  const [idFrontUrl, setIdFrontUrl] = useState("");
  const [idBackUrl, setIdBackUrl] = useState("");
  const [selfieUrl, setSelfieUrl] = useState("");
  const [idFrontPreview, setIdFrontPreview] = useState(null);
  const [idBackPreview, setIdBackPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [uploading, setUploading] = useState({ front: false, back: false, selfie: false });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleUpload = async (file, type) => {
    if (!file) return;
    setUploading((prev) => ({ ...prev, [type]: true }));

    const fd = new FormData();
    fd.append("image", file);

    try {
      const res = await uploadImage("/api/upload/image?folder=mtz/seller-apps/ci", fd);
      const url = res?.data?.url || res?.data?.data?.url;
      if (!url) throw new Error("No URL returned");

      if (type === "front") {
        setIdFrontUrl(url);
        setIdFrontPreview(URL.createObjectURL(file));
      } else if (type === "back") {
        setIdBackUrl(url);
        setIdBackPreview(URL.createObjectURL(file));
      } else {
        setSelfieUrl(url);
        setSelfiePreview(URL.createObjectURL(file));
      }
    } catch (err) {
      context?.alertBox("error", "Error al subir imagen: " + (err?.message || err));
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.storeName.trim()) newErrors.storeName = "Requerido";
    if (!formData.businessName.trim()) newErrors.businessName = "Requerido";
    if (!formData.description.trim()) newErrors.description = "Requerido";
    if (!formData.categoryId) newErrors.categoryId = "Requerido";
    if (!idFrontUrl) newErrors.idFront = "CI anverso requerido";
    if (!idBackUrl) newErrors.idBack = "CI reverso requerido";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const body = {
      ...formData,
      idFrontUrl,
      idBackUrl,
      selfieUrl: selfieUrl || undefined,
    };

    try {
      const res = await postData("/api/seller-applications", body);
      if (res?.error === false) {
        context?.alertBox("success", "Solicitud enviada correctamente");
        onSubmitSuccess?.(res.data);
      } else {
        context?.alertBox("error", res?.message || "Error al enviar solicitud");
      }
    } catch (err) {
      context?.alertBox("error", "Error al enviar solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReapply = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const body = {
      ...formData,
      idFrontUrl,
      idBackUrl,
      selfieUrl: selfieUrl || undefined,
    };

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(apiUrl + "/api/seller-applications/reapply", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const res = await response.json();
      if (res?.error === false) {
        context?.alertBox("success", "Solicitud reenviada correctamente");
        onSubmitSuccess?.(res.data);
      } else {
        context?.alertBox("error", res?.message || "Error al reenviar solicitud");
      }
    } catch (err) {
      context?.alertBox("error", "Error al reenviar solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  const renderUploadBox = (label, preview, loading, type, required = true) => (
    <div className="formGroup">
      <label style={{ fontWeight: 500, marginBottom: 6, display: "block", fontSize: "0.875rem" }}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </label>
      <div
        className="uploadArea"
        onClick={() => document.getElementById(`upload-${type}`).click()}
      >
        {loading ? (
          <CircularProgress size={28} />
        ) : preview ? (
          <img src={preview} alt={label} />
        ) : (
          <div className="uploadLabel">
            <FaCloudUploadAlt size={28} style={{ color: "#999", marginBottom: 4 }} />
            <br />
            Click para subir
          </div>
        )}
        <input
          id={`upload-${type}`}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => handleUpload(e.target.files[0], type)}
        />
      </div>
      {errors[type === "front" ? "idFront" : type === "back" ? "idBack" : ""] && (
        <span style={{ color: "red", fontSize: "0.75rem" }}>
          {errors[type === "front" ? "idFront" : "idBack"]}
        </span>
      )}
    </div>
  );

  // ── PENDING state ──
  if (sellerAppData?.status === "PENDING") {
    return (
      <Dialog open={open} onClose={onClose} className="sellerAppModal">
        <div className="modalHeader">
          <h2>Postulación de Vendedor</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <IoCloseSharp size={22} />
          </button>
        </div>
        <DialogContent>
          <div className="statusContainer">
            <FaClock className="statusIcon" style={{ color: "#ff9800" }} />
            <h3>Tu solicitud está en revisión</h3>
            <p>
              Estamos revisando tu postulación. Te notificaremos cuando haya una actualización.
            </p>
            <Button variant="contained" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── REJECTED state ──
  if (sellerAppData?.status === "REJECTED") {
    return (
      <Dialog open={open} onClose={onClose} className="sellerAppModal">
        <div className="modalHeader">
          <h2>Postulación Rechazada</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <IoCloseSharp size={22} />
          </button>
        </div>
        <DialogContent>
          <div className="statusContainer">
            <FaTimesCircle className="statusIcon" style={{ color: "#f44336" }} />
            <h3>Tu solicitud fue rechazada</h3>
          </div>

          {sellerAppData?.notes && (
            <div className="rejectionNotes">
              <strong>Motivo:</strong>
              {sellerAppData.notes}
            </div>
          )}

          <div className="modalBody">
            <TextField
              label="Nombre de tienda"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.storeName}
              helperText={errors.storeName}
              className="formGroup"
              size="small"
            />
            <TextField
              label="Razón social"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.businessName}
              helperText={errors.businessName}
              className="formGroup"
              size="small"
              style={{ marginTop: 16 }}
            />
            <TextField
              label="Descripción del negocio"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={3}
              error={!!errors.description}
              helperText={errors.description}
              className="formGroup"
              size="small"
              style={{ marginTop: 16 }}
            />
            <FormControl fullWidth size="small" style={{ marginTop: 16 }} error={!!errors.categoryId}>
              <InputLabel>Categoría *</InputLabel>
              <Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                label="Categoría *"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat._id} value={cat._id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
              {errors.categoryId && (
                <span style={{ color: "red", fontSize: "0.75rem", marginTop: 4 }}>
                  {errors.categoryId}
                </span>
              )}
            </FormControl>
            <TextField
              label="Número de documento"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              fullWidth
              className="formGroup"
              size="small"
              style={{ marginTop: 16 }}
            />

            <div className="uploadRow" style={{ marginTop: 16 }}>
              {renderUploadBox("CI Anverso", idFrontPreview, uploading.front, "front")}
              {renderUploadBox("CI Reverso", idBackPreview, uploading.back, "back")}
            </div>
            {renderUploadBox("Selfie (opcional)", selfiePreview, uploading.selfie, "selfie", false)}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleReapply}
              disabled={submitting}
              style={{ marginTop: 8 }}
            >
              {submitting ? <CircularProgress size={22} color="inherit" /> : "Reaplicar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── NULL / no application → form ──
  return (
    <Dialog open={open} onClose={onClose} className="sellerAppModal">
      <div className="modalHeader">
        <h2>Postularse como Vendedor</h2>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <IoCloseSharp size={22} />
        </button>
      </div>
      <DialogContent>
        <div className="modalBody">
          <TextField
            label="Nombre de tienda"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.storeName}
            helperText={errors.storeName}
            size="small"
          />
          <TextField
            label="Razón social"
            name="businessName"
            value={formData.businessName}
            onChange={handleChange}
            fullWidth
            required
            error={!!errors.businessName}
            helperText={errors.businessName}
            size="small"
            style={{ marginTop: 16 }}
          />
          <TextField
            label="Descripción del negocio"
            name="description"
            value={formData.description}
            onChange={handleChange}
            fullWidth
            required
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description}
            size="small"
            style={{ marginTop: 16 }}
          />
          <FormControl fullWidth size="small" style={{ marginTop: 16 }} error={!!errors.categoryId}>
            <InputLabel>Categoría *</InputLabel>
            <Select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              label="Categoría *"
            >
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat._id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
            {errors.categoryId && (
              <span style={{ color: "red", fontSize: "0.75rem", marginTop: 4 }}>
                {errors.categoryId}
              </span>
            )}
          </FormControl>
          <TextField
            label="Número de documento"
            name="documentNumber"
            value={formData.documentNumber}
            onChange={handleChange}
            fullWidth
            size="small"
            style={{ marginTop: 16 }}
          />

          <div className="uploadRow" style={{ marginTop: 16 }}>
            {renderUploadBox("CI Anverso", idFrontPreview, uploading.front, "front")}
            {renderUploadBox("CI Reverso", idBackPreview, uploading.back, "back")}
          </div>
          {renderUploadBox("Selfie (opcional)", selfiePreview, uploading.selfie, "selfie", false)}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            disabled={submitting}
            style={{ marginTop: 8 }}
          >
            {submitting ? <CircularProgress size={22} color="inherit" /> : "Enviar Postulación"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellerApplicationModal;
