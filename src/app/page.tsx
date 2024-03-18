"use client";

import React, { useState, useEffect } from "react";
import "@glideapps/glide-data-grid/dist/index.css";
import { useExtraCells } from "@glideapps/glide-data-grid-cells";
import dynamic from "next/dynamic";

import {
  GridCell,
  GridCellKind,
  GridColumn,
  EditableGridCell,
  Item,
  GridColumnIcon,
} from "@glideapps/glide-data-grid";

const Grid = dynamic(
  () => {
    return import("../app/components/grid");
  },
  { ssr: false }
);

interface TableData {
  id: number;
  name: string;
  completed: boolean;
  color: string[];
}

export default function App() {
  const [commentData, setCommentData] = useState<TableData[]>([]);
  const cellProps: object = useExtraCells();

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://65f70b7db4f842e808850415.mockapi.io/api/v1/todos"
      );
      const json = await response.json();
      setCommentData(json);
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const appendRow = async () => {
    const newRow: TableData = {
      id: commentData.length + 1,
      name: "New Task",
      completed: false,
      color: ["red", "green", "yellow", "blue"],
    };

    try {
      const response = await fetch(
        "https://65f70b7db4f842e808850415.mockapi.io/api/v1/todos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRow),
        }
      );

      if (response.ok) {
        fetchData();
      } else {
        throw new Error("Failed to create the item");
      }
    } catch (error) {
      console.error("Error creating data: ", error);
    }
  };

  const columns: GridColumn[] = [
    { title: "ID", width: 100, icon: GridColumnIcon.HeaderNumber },
    { title: "Name", width: 800, icon: GridColumnIcon.HeaderString },
    { title: "Completed", width: 100 },
    { title: "Color", width: 100, icon: GridColumnIcon.HeaderMarkdown },
  ];

  const colorOptions = [
    { label: "Red", value: "red" },
    { label: "Green", value: "green" },
    { label: "Yellow", value: "yellow" },
    { label: "Blue", value: "blue" },
  ];

  const getData = React.useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell;
      const dataRow = commentData[row];
      const indexes = ["id", "name", "completed", "color"] as const;
      const index = indexes[col];
      const d = String(dataRow[index]);

      if (col === 0 || col === 1) {
        return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          displayData: d,
          readonly: false,
          data: d,
        };
      } else if (col === 2) {
        return {
          kind: GridCellKind.Boolean,
          readonly: false,
          allowOverlay: false,
          data: Boolean(d),
        };
      } else if (col === 3) {
        return {
          kind: GridCellKind.Custom,
          allowOverlay: true,
          readonly: false,
          copyData: "4",
          data: {
            kind: "dropdown-cell",
            allowedValues: ["red", "green", "yellow", "blue"],
            value: d.split(",")[row] || "red",
          },
        };
      } else {
        return {
          kind: GridCellKind.Text,
          allowOverlay: true,
          displayData: d,
          readonly: false,
          data: d,
        };
      }
    },
    [commentData]
  );

  async function updateData(data) {
    const { id, ...changes } = data;

    console.log(changes, "changes");

    try {
      const response = await fetch(
        `https://65f70b7db4f842e808850415.mockapi.io/api/v1/todos/${id + 1}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(changes),
        }
      );

      if (response.ok) {
        fetchData();
      } else {
        throw new Error("Failed to update the item");
      }
    } catch (error) {
      console.error("Error updating data: ", error);
    }
  }

  const onCellEdited = React.useCallback(
    (cell: Item, newValue: EditableGridCell) => {
      const [col, row] = cell;

      if (newValue.kind === GridCellKind.Text && col == 1) {
        updateData({ id: row, name: newValue.data });
      } else if (newValue.kind === "boolean" && col == 2) {
        updateData({ id: row, completed: !newValue.data });
      } else if (newValue.kind === "custom" && col == 3) {
        updateData({ id: row, color: newValue.data.value });
      } else {
        console.log("Need to implement");
      }
    },
    []
  );

  return (
    <>
      <Grid
        {...cellProps}
        columns={columns}
        getCellContent={getData}
        rows={commentData.length}
        onCellEdited={onCellEdited}
      />

      <button
        onClick={appendRow}
        style={{
          backgroundColor: "#4CAF50",
          color: "white",
          padding: "10px 20px",
          margin: "10px",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
          marginTop: "2rem",
        }}
      >
        Add New Row
      </button>
    </>
  );
}
