// admin/src/Pages/SubCategory/EditSubCatBox.jsx
import React, { useContext, useEffect, useState } from "react";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaRegTrashAlt } from "react-icons/fa";
import { Button } from "@mui/material";

import { AppContext } from "../../context/AppContext";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { deleteData, editData } from "../../utils/api";

export const EditSubCatBox = (props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectVal, setSelectVal] = useState("");
  const [formFields, setFormFields] = useState({
    name: "",
    parentCatName: null,
    parentId: null,
  });

  const context = useContext(AppContext) || {};

  // 🔔 Notificador defensivo
  const notify = (type, message) => {
    const text = typeof message === "string" ? message : (message?.message || "Ocurrió un error");
    if (typeof context?.alertBox === "function") return context.alertBox(type, text);
    try { window.alert(text); } catch { }
  };

  // Helper: tomar tenant y mandarlo como header
  const getTenantHeaders = () => {
    const tenantId =
      context?.viewer?.activeStoreId ||
      context?.viewer?.storeId ||
      context?.userData?.storeId ||
      context?.tenant?.storeId ||
      localStorage.getItem("X-Store-Id") ||
      null;
    return tenantId ? { "x-tenant-id": String(tenantId) } : {};
  };

  useEffect(() => {
    setFormFields((p) => ({
      ...p,
      name: props?.name || "",
      parentCatName: props?.selectedCatName ?? null,
      parentId: props?.selectedCat ?? null,
    }));
    setSelectVal(props?.selectedCat || "");
  }, [props?.name, props?.selectedCat, props?.selectedCatName]);

  const onChangeInput = (e) => {
    const { name, value } = e.target;
    setFormFields((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectVal(value);
    setFormFields((prev) => ({ ...prev, parentId: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formFields.name?.trim()) {
      notify("error", "Por favor, ingrese el nombre de la categoría");
      return;
    }
    setIsLoading(true);
    try {
      const payload = {
        name: formFields.name.trim(),
        ...(formFields.parentId ? { parentId: formFields.parentId } : {}),
        ...(formFields.parentCatName ? { parentCatName: formFields.parentCatName } : {}),
      };
      const res = await editData(`/api/category/${props?.id}`, payload, {
        withCredentials: true,
        headers: { ...getTenantHeaders() },
      });

      notify("success", res?.data?.message || "Categoría actualizada");
      context?.getCat?.();
      setEditMode(false);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo actualizar la categoría";
      notify("error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCat = async (id) => {
    try {
      await deleteData(`/api/category/${id}`, {
        withCredentials: true,
        headers: { ...getTenantHeaders() },
      });
      notify("success", "Categoría eliminada");
      context?.getCat?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo eliminar la categoría";
      notify("error", msg);
    }
  };

  return (
    <form className="w-100 flex items-center gap-3 p-0 px-4" onSubmit={handleSubmit}>
      {editMode ? (
        <>
          <div className="flex items-center justify-between py-2 gap-4 whitespace-nowrap overflow-x-scroll">
            <div className="w-[180px] md:w-[150px]">
              <Select
                style={{ zoom: "75%" }}
                className="w-full"
                size="small"
                value={selectVal}
                onChange={handleChange}
                displayEmpty
                inputProps={{ "aria-label": "Without label" }}
              >
                {props?.catData?.length !== 0 &&
                  props?.catData?.map((item, index) => (
                    <MenuItem
                      value={item?._id}
                      key={index}
                      onClick={() =>
                        setFormFields((prev) => ({ ...prev, parentCatName: item?.name }))
                      }
                    >
                      {item?.name}
                    </MenuItem>
                  ))}
              </Select>
            </div>

            <input
              type="text"
              className="w-[150px] md:w-full h-[30px] border border-[rgba(0,0,0,0.2)] focus:outline-none focus:border-[rgba(0,0,0,0.4)] rounded-sm p-3 text-sm"
              name="name"
              value={formFields?.name}
              onChange={onChangeInput}
            />

            <div className="flex items-center gap-2">
              <Button size="small" className="btn-sml" type="submit" variant="contained">
                {isLoading ? <CircularProgress color="inherit" /> : <>Editar</>}
              </Button>
              <Button size="small" variant="outlined" onClick={() => setEditMode(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <span className="font-[500] text-[14px]">{props?.name}</span>
          <div className="flex items-center ml-auto gap-2">
            <Button
              className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full !text-black"
              onClick={() => setEditMode(true)}
            >
              <MdOutlineModeEdit />
            </Button>
            <Button
              className="!min-w-[35px] !w-[35px] !h-[35px] !rounded-full !text-black"
              onClick={() => deleteCat(props?.id)}
            >
              <FaRegTrashAlt />
            </Button>
          </div>
        </>
      )}
    </form>
  );
};

export default EditSubCatBox;
