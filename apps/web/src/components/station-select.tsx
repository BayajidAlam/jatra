"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
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

interface Station {
  id: string
  name: string
  city: string
}

interface StationSelectProps {
  value: string
  onChange: (value: string) => void
  stations: Station[] | undefined
  placeholder?: string
  width?: string
  disabled?: boolean
  className?: string
}

export function StationSelect({
  value,
  onChange,
  stations,
  placeholder = "Select station",
  width = "w-full",
  disabled = false,
  className
}: StationSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedStation = stations?.find((station) => station.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full grid grid-cols-[1fr_auto] items-center font-normal px-3 overflow-hidden",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <span className="truncate flex-1 text-left min-w-0">
            {selectedStation
              ? `${selectedStation.name} (${selectedStation.city})`
              : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[280px] sm:w-[350px]" align="start">
        <Command>
          <CommandInput placeholder="Search station..." />
          <CommandList>
            <CommandEmpty>No station found.</CommandEmpty>
            <CommandGroup>
              {stations?.map((station) => (
                <CommandItem
                  key={station.id}
                  value={station.name} // Using name for search
                  onSelect={(currentValue) => {
                    // We need to find the ID based on the name if duplicates exist, better if cmdk supports object value
                    // But typically cmdk uses string value. We can search back the ID.
                    // Or we can pass a composite value like "Name (City) - ID" but that makes search weird.
                    // Let's use name for search, and when selected, we use the ID from the closure.
                    onChange(station.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === station.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {station.name} ({station.city})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
