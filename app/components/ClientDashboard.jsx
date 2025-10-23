"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import * as Yup from "yup";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit3, XCircle, Plus } from "lucide-react";

const MySwal = withReactContent(Swal);
const ITEMS_PER_PAGE = 12;

const ItemSchema = Yup.object().shape({
  title: Yup.string().min(2, "Too short").required("Required"),
  description: Yup.string().min(5, "Too short").required("Required"),
});

// ----------------- Internal SortableItem Component -----------------
function SortableItem({ id, item, openDetails, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : "auto",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className="relative bg-white p-4 rounded-xl shadow-md hover:shadow-xl border border-gray-100 transition-transform duration-200"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600"
        >
          <GripVertical size={18} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => openDetails(item._id)}
            className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
            aria-label="Edit / View"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(item._id)}
            className="p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
            aria-label="Delete"
          >
            <XCircle size={16} />
          </button>
        </div>
      </div>

      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
      <p className="text-gray-600 text-sm mb-2 line-clamp-3">{item.description}</p>
      <p className="text-xs text-gray-400">
        {new Date(item.createdAt).toLocaleString()}
      </p>
    </article>
  );
}

// ----------------- Main ClientDashboard Component -----------------
export default function ClientDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      if (res.ok) setItems(data.items || []);
    } catch {
      Swal.fire("Error", "Unexpected error", "error");
    } finally {
      setLoading(false);
    }
  };

  // ----------------- Add Item -----------------
  const handleAddItem = async () => {
    const { value: formValues } = await MySwal.fire({
      title: "Add New Item",
      html: `
        <div class="p-4 bg-gray-50 rounded-xl shadow-inner">
          <input id="swal-title" class="swal2-input mt-2 mb-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="Title"/>
          <textarea id="swal-description" class="swal2-textarea mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="Description"></textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add Item",
      preConfirm: () => {
        const title = document.getElementById("swal-title").value;
        const description = document.getElementById("swal-description").value;
        if (!title || !description) {
          Swal.showValidationMessage("Both fields are required");
          return false;
        }
        return { title, description };
      },
    });

    if (formValues) {
      try {
        const res = await fetch("/api/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire("Added!", "New item added successfully.", "success");
          fetchItems();
        } else Swal.fire("Error", data.message || "Failed to add item", "error");
      } catch {
        Swal.fire("Error", "Unexpected error", "error");
      }
    }
  };

  // ----------------- Edit Item -----------------
  const openDetails = async (id) => {
    const item = items.find((x) => x._id === id);
    if (!item) return;

    const { value: formValues } = await MySwal.fire({
      title: "Edit Item",
      html: `
        <div class="p-4 bg-gray-50 rounded-xl shadow-inner">
          <input id="swal-title" class="swal2-input mt-2 mb-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="Title" value="${item.title}" />
          <textarea id="swal-description" class="swal2-textarea mt-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="Description">${item.description}</textarea>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Save Changes",
      preConfirm: () => {
        const title = document.getElementById("swal-title").value;
        const description = document.getElementById("swal-description").value;
        if (!title || !description) {
          Swal.showValidationMessage("Both fields are required");
          return false;
        }
        return { title, description };
      },
    });

    if (formValues) {
      try {
        const res = await fetch(`/api/items/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValues),
        });
        const data = await res.json();
        if (res.ok) {
          Swal.fire("Updated!", "Item updated successfully.", "success");
          fetchItems();
        } else Swal.fire("Error", data.message || "Update failed", "error");
      } catch {
        Swal.fire("Error", "Unexpected error", "error");
      }
    }
  };

  // ----------------- Delete Item -----------------
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This item will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (res.ok) {
          Swal.fire("Deleted!", "Item removed successfully.", "success");
          fetchItems();
        } else Swal.fire("Error", data.message || "Failed to delete", "error");
      } catch {
        Swal.fire("Error", "Unexpected error", "error");
      }
    }
  };

  // ----------------- DnD Handlers -----------------
  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item._id === active.id);
    const newIndex = items.findIndex((item) => item._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove([...items], oldIndex, newIndex);
    setItems(reordered);
  };

  const handleDragStart = (event) => setActiveId(event.active.id);

  // ----------------- Filtered + Paginated Items -----------------
  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const pageCount = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // ----------------- Pagination Controls -----------------
  const paginationControls = (
    <div className="flex justify-center gap-2 mt-6 flex-wrap">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Prev
      </button>
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`px-3 py-1 rounded-lg ${
            page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        disabled={page === pageCount}
        onClick={() => setPage(page + 1)}
        className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  // ----------------- Render -----------------
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">📋 My Dashboard</h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition w-full sm:w-64"
            />
            <button
              onClick={handleAddItem}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : paginatedItems.length === 0 ? (
          <div className="text-center text-gray-500 py-10">No items found.</div>
        ) : (
          <>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              onDragStart={handleDragStart}
            >
              <SortableContext
                items={paginatedItems.map((i) => i._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedItems.map((item) => (
                    <SortableItem
                      key={item._id}
                      id={item._id}
                      item={item}
                      openDetails={openDetails}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <article className="p-4 rounded-xl shadow-lg bg-white cursor-grabbing select-none">
                    <h4 className="font-bold text-primary mb-1">
                      {items.find((i) => i._id === activeId)?.title}
                    </h4>
                    <p className="text-gray-700 mb-2">
                      {items.find((i) => i._id === activeId)?.description}
                    </p>
                  </article>
                ) : null}
              </DragOverlay>
            </DndContext>

            {pageCount > 1 && paginationControls}
          </>
        )}
      </div>
    </div>
  );
}
