"use client";
import Folder from "./Folder";
import { PrivateRoute } from "../../components/PrivateRoute";

export default function FolderPage() {
  return (
    <PrivateRoute>
      <Folder />
    </PrivateRoute>
  );
}
