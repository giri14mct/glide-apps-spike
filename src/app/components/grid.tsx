import React from "react";
import DataEditor, { DataEditorProps } from "@glideapps/glide-data-grid";

export default function Grid(args: DataEditorProps) {
  return (
    <>
      <DataEditor {...args} />
    </>
  );
}
