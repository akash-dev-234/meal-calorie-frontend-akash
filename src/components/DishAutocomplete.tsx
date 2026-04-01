"use client"

import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
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

const POPULAR_DISHES = [
  "Chicken biryani",
  "Grilled chicken breast",
  "Caesar salad",
  "Margherita pizza",
  "Beef burger",
  "Spaghetti bolognese",
  "Salmon fillet",
  "Fried rice",
  "Butter chicken",
  "Avocado toast",
  "Greek yogurt",
  "Oatmeal",
  "Scrambled eggs",
  "Pancakes",
  "French fries",
  "Cheeseburger",
  "Chicken tikka masala",
  "Pad thai",
  "Tacos",
  "Burritos",
  "Hummus",
  "Lentil soup",
  "Tomato soup",
  "Grilled salmon",
  "Steak",
  "Lamb chops",
  "Dal makhani",
  "Palak paneer",
  "Masala dosa",
  "Idli sambar",
]

type Props = {
  id?: string
  value: string
  onChange: (value: string) => void
  onEnter?: () => void
  error?: string
}

export function DishAutocomplete({ id, value, onChange, onEnter, error }: Props) {
  const [open, setOpen] = useState(false)

  const filtered = value.length > 0
    ? POPULAR_DISHES.filter((d) =>
        d.toLowerCase().includes(value.toLowerCase())
      )
    : POPULAR_DISHES.slice(0, 8)

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          id={id}
          role="combobox"
          aria-expanded={open}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive"
          )}
        >
          <span className="truncate">{value || "e.g. grilled chicken breast"}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search dishes…"
              value={value}
              onValueChange={onChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setOpen(false)
                  onEnter?.()
                }
              }}
            />
            <CommandList>
              <CommandEmpty>No suggestions — just press search.</CommandEmpty>
              <CommandGroup heading="Popular dishes">
                {filtered.map((dish) => (
                  <CommandItem
                    key={dish}
                    value={dish}
                    data-checked={value.toLowerCase() === dish.toLowerCase()}
                    onSelect={() => {
                      onChange(dish)
                      setOpen(false)
                    }}
                  >
                    {dish}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
