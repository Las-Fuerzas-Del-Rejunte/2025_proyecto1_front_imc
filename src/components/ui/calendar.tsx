import * as React from "react"
import { DayPicker } from "react-day-picker"
import { es } from "date-fns/locale"
import "react-day-picker/dist/style.css"

import { cn } from "../../lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, modifiersClassNames, modifiersStyles, ...props }: CalendarProps) {
  const defaultModifiersClassNames = {
    range_start: "bg-primary text-primary-foreground",
    range_end: "bg-primary text-primary-foreground",
    range_middle: "bg-transparent",
  } as CalendarProps["modifiersClassNames"]
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={es}
      className={cn("p-2 shc-calendar", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100",
        table: "w-full border-collapse space-y-1",
        head_row: "grid grid-cols-7",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "grid grid-cols-7 mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-none border-0 outline-none ring-0 focus-visible:outline-none focus-visible:ring-0 shadow-none hover:bg-violet-500/20",
        day_selected: "bg-primary text-primary-foreground rounded-full border-0",
        day_range_start: "bg-primary text-primary-foreground rounded-full border-0",
        day_range_end: "bg-primary text-primary-foreground rounded-full border-0",
        day_range_middle: "",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-50",
        ...classNames,
      }}
      modifiersClassNames={{
        ...defaultModifiersClassNames,
        ...(modifiersClassNames ?? {}),
      }}
      modifiersStyles={{
        range_middle: {
          borderRadius: 0,
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'rgba(59,130,246,0.20)',
          color: 'hsl(var(--foreground))',
        },
        range_start: {
          borderRadius: '9999px',
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
        },
        range_end: {
          borderRadius: '9999px',
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary-foreground))',
        },
        ...(modifiersStyles ?? {}),
      }}
      {...props}
    />
  )
}

Calendar.displayName = "Calendar"

export { Calendar }


