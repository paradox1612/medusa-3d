// backend/src/admin/routes/gallery-uploads/page.tsx
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataTable, createDataTableColumnHelper, useDataTable, DataTablePaginationState } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Button, Select, Text, Container, Heading } from "@medusajs/ui"
import { PencilSquare, Photo } from "@medusajs/icons"
import { sdk } from "../../../lib/sdk"

type GalleryUpload = {
  id: string
  image_url: string
  title: string | null
  description: string | null
  status: "pending" | "approved" | "rejected"
  created_at: string
}

const columnHelper = createDataTableColumnHelper<GalleryUpload>()

const GalleryUploadsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({ pageSize: 10, pageIndex: 0 })
  const [statusFilter, setStatusFilter] = useState<"all" | GalleryUpload["status"]>("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<GalleryUpload["status"]>("pending")
  
  const queryClient = useQueryClient()

  // Fetch data with pagination
  interface GalleryUploadsResponse {
    success: boolean
    items: GalleryUpload[]
    count: number
    limit: number
    offset: number
  }

  const { data, isLoading } = useQuery<GalleryUploadsResponse>({
    queryKey: ["gallery-uploads", pagination.pageIndex, pagination.pageSize, statusFilter],
    queryFn: async () => {
      const response = await sdk.client.fetch("/admin/gallery-uploads", {
        query: { 
          limit: pagination.pageSize, 
          offset: pagination.pageIndex * pagination.pageSize,
          status: statusFilter === "all" ? undefined : statusFilter
        },
      })
      return response as GalleryUploadsResponse
    },
  })

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: GalleryUpload["status"] }) => {
      const response = await sdk.client.fetch(`/admin/gallery-uploads/${id}`, {
        method: "PATCH",
        body: { status },
      })
      return response as { success: boolean; item: GalleryUpload }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery-uploads"] })
      setEditingId(null)
    },
  })

  // Status badge component
  const StatusBadgeComponent = ({ status }: { status: GalleryUpload["status"] }) => {
    const statusMap = {
      pending: { label: "Pending", colorClass: "bg-orange-100 text-orange-800" },
      approved: { label: "Approved", colorClass: "bg-green-100 text-green-800" },
      rejected: { label: "Rejected", colorClass: "bg-red-100 text-red-800" },
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusMap[status].colorClass}`}>
        {statusMap[status].label}
      </span>
    )
  }

  // Define columns
  const columns = [
    columnHelper.accessor("image_url", {
      header: "Preview",
      cell: ({ getValue }) => (
        <div className="w-16 h-16 overflow-hidden rounded">
          <img 
            src={getValue()} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
        </div>
      ),
    }),
    columnHelper.accessor("title", { 
      header: "Title",
      cell: ({ getValue, row }) => (
        <div>
          <p className="font-medium">{getValue() || "Untitled"}</p>
          {row.original.description && (
            <p className="text-gray-500 text-sm line-clamp-2">
              {row.original.description}
            </p>
          )}
        </div>
      )
    }),
    columnHelper.accessor("status", { 
      header: "Status",
      cell: ({ row }) => (
        editingId === row.original.id ? (
          <div className="flex items-center gap-2">
            <Select
              value={selectedStatus}
              onValueChange={(value) => setSelectedStatus(value as GalleryUpload["status"])}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="pending">Pending</Select.Item>
                <Select.Item value="approved">Approved</Select.Item>
                <Select.Item value="rejected">Rejected</Select.Item>
              </Select.Content>
            </Select>
            <Button
              variant="secondary"
              size="small"
              onClick={() => updateStatusMutation.mutate({ 
                id: row.original.id, 
                status: selectedStatus 
              })}
              disabled={updateStatusMutation.isPending}
            >
              Save
            </Button>
            <Button
              variant="danger"
              size="small"
              onClick={() => setEditingId(null)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <StatusBadgeComponent status={row.original.status} />
            <button
              onClick={() => {
                setSelectedStatus(row.original.status)
                setEditingId(row.original.id)
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <PencilSquare className="w-4 h-4" />
            </button>
          </div>
        )
      )
    }),
  ]

  const table = useDataTable({
    columns,
    data: data?.items || [],
    getRowId: (row) => row.id,
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination,
    },
  })

  if (isLoading && !data) {
    return (
      <Container className="flex items-center justify-center h-64">
        <Text>Loading gallery uploads...</Text>
      </Container>
    )
  }

  return (
    <Container className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading level="h1" className="text-2xl font-bold">Gallery Uploads</Heading>
          <Text className="text-gray-500">
            Manage and moderate user-uploaded gallery content
          </Text>
        </div>
        
        <div className="flex items-center gap-4">
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as "all" | GalleryUpload["status"])
              setPagination(prev => ({ ...prev, pageIndex: 0 })) // Reset to first page when filter changes
            }}
          >
            <Select.Trigger>
              <Select.Value placeholder="Filter by status" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">All Uploads</Select.Item>
              <Select.Item value="pending">Pending</Select.Item>
              <Select.Item value="approved">Approved</Select.Item>
              <Select.Item value="rejected">Rejected</Select.Item>
            </Select.Content>
          </Select>
        </div>
      </div>

      <DataTable instance={table}>
        <DataTable.Table />
        <DataTable.Pagination />
      </DataTable>
    </Container>
  );
};

export const config = defineRouteConfig({
  label: 'Gallery Uploads',
  icon: Photo,
})

export default GalleryUploadsPage