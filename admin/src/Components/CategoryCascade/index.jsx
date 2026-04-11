import { useEffect, useMemo, useState } from "react";
import { fetchDataFromApi } from "../../utils/api";

/**
 * CategoryCascade
 * ---------------------------------------------------
 * Selector de categoría en cascada de 3 niveles.
 *
 * El backend GET /api/category devuelve un árbol:
 *   [{ _id, name, depth, children: [{ _id, name, children: [...] }] }]
 *
 * Props:
 * - value: categoryId seleccionado (nivel hoja)
 * - onChange: (categoryId) => void
 * - disabled: boolean
 * - rootCategoryId: si se pasa, filtra el árbol a esa rama (para sellers).
 *     Puede ser un ObjectId string o un objeto populado { _id, name, ... }
 */

const toId = (v) => {
  if (!v) return null;
  if (typeof v === "object" && v._id) return String(v._id);
  return String(v);
};

export default function CategoryCascade({ value, onChange, disabled, rootCategoryId }) {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);

  const rootId = toId(rootCategoryId);

  // Si rootId está definido, filtrar el árbol para usar solo esa rama
  const { filteredTree, rootNode, ancestorPath, notFound } = useMemo(() => {
    if (!rootId || !tree.length) return { filteredTree: tree, rootNode: null, ancestorPath: [], notFound: false };

    const findWithPath = (nodes, path = []) => {
      for (const node of nodes) {
        if (String(node._id) === rootId) {
          return { rootNode: node, ancestorPath: path };
        }
        const result = findWithPath(node.children || [], [...path, { name: node.name }]);
        if (result.rootNode) return result;
      }
      return { rootNode: null, ancestorPath: [] };
    };

    const { rootNode, ancestorPath } = findWithPath(tree);

    if (!rootNode) {
      console.warn(
        `[CategoryCascade] rootCategoryId "${rootId}" no encontrado en el árbol (${tree.length} raíces). Mostrando árbol completo como fallback.`
      );
      return { filteredTree: tree, rootNode: null, ancestorPath: [], notFound: true };
    }

    return {
      filteredTree: rootNode.children || [],
      rootNode,
      ancestorPath,
      notFound: false,
    };
  }, [tree, rootId]);

  // IDs seleccionados por nivel
  const [level1Id, setLevel1Id] = useState("");
  const [level2Id, setLevel2Id] = useState("");
  const [level3Id, setLevel3Id] = useState("");

  // Cargar árbol una vez
  useEffect(() => {
    setLoading(true);
    fetchDataFromApi("/api/category")
      .then((res) => {
        const data = res?.data || [];
        setTree(data);
      })
      .catch((err) => console.error("CategoryCascade:", err))
      .finally(() => setLoading(false));
  }, []);

  // Cuando llega el árbol + value inicial → restaurar selecciones
  useEffect(() => {
    if (!value || !filteredTree.length) return;

    for (const cat1 of filteredTree) {
      if (String(cat1._id) === String(value)) {
        setLevel1Id(cat1._id);
        return;
      }
      for (const cat2 of cat1.children || []) {
        if (String(cat2._id) === String(value)) {
          setLevel1Id(cat1._id);
          setLevel2Id(cat2._id);
          return;
        }
        for (const cat3 of cat2.children || []) {
          if (String(cat3._id) === String(value)) {
            setLevel1Id(cat1._id);
            setLevel2Id(cat2._id);
            setLevel3Id(cat3._id);
            return;
          }
        }
      }
    }
  }, [value, filteredTree]);

  // Opciones de nivel 2 y 3
  const level1Cat = filteredTree.find((c) => String(c._id) === String(level1Id));
  const level2Options = level1Cat?.children || [];

  const level2Cat = level2Options.find((c) => String(c._id) === String(level2Id));
  const level3Options = level2Cat?.children || [];

  // Handlers
  const handleLevel1 = (id) => {
    setLevel1Id(id);
    setLevel2Id("");
    setLevel3Id("");
    const cat = filteredTree.find((c) => String(c._id) === String(id));
    if (cat && (!cat.children || cat.children.length === 0)) {
      onChange(id);
    } else {
      onChange("");
    }
  };

  const handleLevel2 = (id) => {
    setLevel2Id(id);
    setLevel3Id("");
    const cat = level2Options.find((c) => String(c._id) === String(id));
    if (cat && (!cat.children || cat.children.length === 0)) {
      onChange(id);
    } else {
      onChange("");
    }
  };

  const handleLevel3 = (id) => {
    setLevel3Id(id);
    onChange(id);
  };

  if (loading) return <p className="text-sm text-gray-500">Cargando categorías...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Breadcrumb del rubro de la tienda */}
      {rootNode && (
        <div className="col-span-full mb-1">
          <p className="text-sm text-gray-500">
            Rubro de tu tienda:{" "}
            <span className="font-medium text-gray-800">
              {[...ancestorPath.map(a => a.name), rootNode.name].join(" > ")}
            </span>
          </p>
        </div>
      )}

      {/* Aviso si la categoria de la tienda no se encontro */}
      {notFound && (
        <div className="col-span-full mb-1">
          <p className="text-xs text-amber-600">
            No se encontro la categoria asignada a tu tienda. Mostrando todas las categorias disponibles.
          </p>
        </div>
      )}

      {/* NIVEL 1 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          {rootId ? "Tipo de producto *" : "Categoria *"}
        </label>
        <select
          value={level1Id}
          onChange={(e) => handleLevel1(e.target.value)}
          className="w-full border rounded px-3 py-2"
          disabled={disabled}
        >
          <option value="">Seleccione</option>
          {filteredTree.map((cat) => (
            <option key={cat._id} value={cat._id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* NIVEL 2 */}
      {level2Options.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Subcategoria *</label>
          <select
            value={level2Id}
            onChange={(e) => handleLevel2(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={disabled}
          >
            <option value="">Seleccione</option>
            {level2Options.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* NIVEL 3 */}
      {level3Options.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Tipo *</label>
          <select
            value={level3Id}
            onChange={(e) => handleLevel3(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={disabled}
          >
            <option value="">Seleccione</option>
            {level3Options.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
