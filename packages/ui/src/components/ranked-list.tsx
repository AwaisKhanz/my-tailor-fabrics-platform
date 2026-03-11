import * as React from "react"

import { Badge } from "@tbms/ui/components/badge"
import { LoadingState } from "@tbms/ui/components/loading-state"
import { Text } from "@tbms/ui/components/typography"
import { cn } from "@tbms/ui/lib/utils"

export interface RankedListItem {
  id: string
  label: string
  value: string
}

interface RankedListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: RankedListItem[]
  loading?: boolean
  emptyMessage?: string
  skeletonCount?: number
}

export function RankedList({
  items,
  loading = false,
  emptyMessage = "No records found.",
  skeletonCount = 5,
  className,
  ...props
}: RankedListProps) {
  if (loading) {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        <LoadingState
          compact
          text="Loading ranking..."
          caption="Calculating top performers."
        />
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="h-8 animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <Text
        as="p"
        variant="muted"
        className={cn("py-6 text-center text-sm", className)}
        {...props}
      >
        {emptyMessage}
      </Text>
    )
  }

  return (
    <div className={cn("space-y-2", className)} {...props}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <Badge variant="outline">#{index + 1}</Badge>
            <Text as="span" variant="body">
              {item.label}
            </Text>
          </div>
          <Text as="span" variant="muted" className="text-xs font-semibold">
            {item.value}
          </Text>
        </div>
      ))}
    </div>
  )
}
