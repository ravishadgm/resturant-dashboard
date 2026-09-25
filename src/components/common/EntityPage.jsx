import { useEffect, useState } from "react";
import { Eye, MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { entityService } from "../../services/entityService";
import { useToast } from "../../context/ToastContext";
import Avatar from "./Avatar";
import CommonTable from "./CommonTable";
import EntityForm from "./EntityForm";
import EntityView from "./EntityView";
import PageHeader from "./PageHeader";
import { ConfirmDialog, Modal } from "./Modal";
export default function EntityPage({
  type,
  singular,
  title,
  description,
  fields,
  withSelect = false,
}) {
  const [data, setData] = useState([]),
    [loading, setLoading] = useState(true),
    [mode, setMode] = useState(null),
    [active, setActive] = useState(null),
    [selected, setSelected] = useState([]);
  const toast = useToast();
  const load = () => {
    setLoading(true);
    entityService.list(type).then((rows) => {
      setData(rows);
      setTimeout(() => setLoading(false), 250);
    });
  };
  useEffect(load, [type]);
  const save = async (values) => {
    if (mode === "edit") {
      await entityService.update(type, active.id, values);
      toast(`${singular} updated successfully`);
    } else {
      await entityService.create(type, values);
      toast(`${singular} added successfully`);
    }
    setMode(null);
    setActive(null);
    load();
  };
  const remove = async () => {
    await entityService.delete(type, active.id);
    toast(`${singular} deleted`);
    setMode(null);
    setActive(null);
    setSelected((s) => s.filter((x) => x !== active.id));
    load();
  };
  const open = (next, item = null) => {
    setActive(item);
    setMode(next);
  };
  const columns = [
    {
      key: "name",
      label: singular,
      render: (v, r) => (
        <div className="person-cell">
          <Avatar name={v} image={r.image} />
          <div>
            <strong>{v}</strong>
            <small>{r.id.slice(0, 8)}</small>
          </div>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone number" },
    {
      key: "location",
      label: "Location",
      render: (v) => v || "—",
      sortable: fields.some((f) => f.name === "location"),
    },
    {
      key: "actions",
      label: "",
      sortable: false,
      className: "actions-col",
      render: (_, r) => (
        <div className="row-actions">
          <button title="View" onClick={() => open("view", r)}>
            <Eye />
          </button>
          <button title="Edit" onClick={() => open("edit", r)}>
            <Pencil />
          </button>
          <button
            title="Delete"
            className="danger"
            onClick={() => open("delete", r)}
          >
            <Trash2 />
          </button>
          <button className="more">
            <MoreHorizontal />
          </button>
        </div>
      ),
    },
  ].filter(
    (c) => c.key !== "location" || fields.some((f) => f.name === "location"),
  );
  return (
    <>
      <PageHeader
        eyebrow=""
        title={title}
        description={description}
        action={
          <button className="btn primary" onClick={() => open("add")}>
            <Plus size={18} /> Add {singular}
          </button>
        }
      />
      {selected.length > 0 && (
        <div className="selection-bar">
          <Users size={18} />
          <strong>{selected.length} selected</strong>
          <span>Use row actions to manage records.</span>
          <button onClick={() => setSelected([])}>Clear selection</button>
        </div>
      )}
      <CommonTable
        columns={columns}
        data={data}
        loading={loading}
        selected={selected}
        onSelectedChange={withSelect ? setSelected : undefined}
        searchPlaceholder={`Search ${title.toLowerCase()}…`}
      />
      <Modal
        open={mode === "add" || mode === "edit"}
        title={`${mode === "edit" ? "Edit" : "Add"} ${singular}`}
        onClose={() => setMode(null)}
        size="wide"
      >
        <EntityForm
          initial={mode === "edit" ? active : null}
          fields={fields}
          onCancel={() => setMode(null)}
          onSubmit={save}
          submitLabel={mode === "edit" ? "Save changes" : `Add ${singular}`}
        />
      </Modal>
      <Modal
        open={mode === "view"}
        title={`${singular} details`}
        onClose={() => setMode(null)}
      >
        <EntityView
          item={active}
          hasAddress={fields.some((f) => f.name === "address")}
        />
        <footer className="modal-actions">
          <button className="btn secondary" onClick={() => setMode(null)}>
            Close
          </button>
          <button className="btn primary" onClick={() => setMode("edit")}>
            <Pencil size={16} /> Edit record
          </button>
        </footer>
      </Modal>
      <ConfirmDialog
        open={mode === "delete"}
        name={active?.name}
        onClose={() => setMode(null)}
        onConfirm={remove}
      />
    </>
  );
}
