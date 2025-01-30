"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash } from "lucide-react"

// Define the type for class group data based on the existing components
interface ClassGroup {
  id: string
  name: string
  program: {
    id: string
    name: string
  }
  classes: any[]
  subjects: any[]
  status: "ACTIVE" | "INACTIVE"
  description?: string | null
}

export const columns: ColumnDef<ClassGroup>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "program.name",
    header: "Program",
  },
  {
    accessorKey: "classes",
    header: "Classes",
    cell: ({ row }) => {
      const classes = row.original.classes
      return <span>{classes.length}</span>
    },
  },
  {
    accessorKey: "subjects",
    header: "Subjects",
    cell: ({ row }) => {
      const subjects = row.original.subjects
      return <span>{subjects.length}</span>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant={status === "ACTIVE" ? "default" : "secondary"}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description
      return <span>{description || "No description"}</span>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const classGroup = row.original
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // Handle edit action
              if (classGroup.program?.id) {
                window.location.href = `/dashboard/super-admin/program/${classGroup.program.id}`
              }
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  }
]