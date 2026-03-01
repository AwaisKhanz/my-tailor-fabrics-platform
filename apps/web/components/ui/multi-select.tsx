"use client"

import * as React from "react"
import { X, Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface Option {
  label: string
  value: string
}

interface MultiSelectProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleUnselect = (item: string) => {
    onChange(selected.filter((i) => i !== item))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between h-auto min-h-11 px-3 py-2 border-border/50 bg-background/50 hover:bg-background hover:border-primary/30 transition-all",
            className
          )}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selected.length > 0 ? (
              selected.map((value) => {
                const option = options.find((o) => o.value === value)
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/10 hover:bg-primary/20 transition-colors pr-1 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUnselect(value)
                    }}
                  >
                    {option?.label || value}
                    <div className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                       <X className="h-3 w-3 text-primary/70 hover:text-primary transition-colors" />
                    </div>
                  </Badge>
                )
              })
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command className="border-none">
          <CommandInput placeholder="Search..." className="h-10" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    const isSelected = selected.includes(option.value)
                    if (isSelected) {
                      onChange(selected.filter((i) => i !== option.value))
                    } else {
                      onChange([...selected, option.value])
                    }
                  }}
                  className="cursor-pointer py-2 px-3 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{option.label}</span>
                  {selected.includes(option.value) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
