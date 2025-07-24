import { useState } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns'

interface DateRangePickerProps {
  dateRange: {
    start: Date
    end: Date
  }
  onDateRangeChange: (range: { start: Date; end: Date }) => void
}

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const goToPreviousWeek = () => {
    const newStart = subWeeks(dateRange.start, 1)
    const newEnd = endOfWeek(newStart)
    onDateRangeChange({ start: newStart, end: newEnd })
  }

  const goToNextWeek = () => {
    const newStart = addWeeks(dateRange.start, 1)
    const newEnd = endOfWeek(newStart)
    onDateRangeChange({ start: newStart, end: newEnd })
  }

  const goToThisWeek = () => {
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 })
    onDateRangeChange({ start: weekStart, end: weekEnd })
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const weekStart = startOfWeek(date, { weekStartsOn: 1 })
      const weekEnd = endOfWeek(date, { weekStartsOn: 1 })
      onDateRangeChange({ start: weekStart, end: weekEnd })
      setIsOpen(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={goToPreviousWeek}
        className="px-3"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="min-w-[280px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d, yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 border-b">
            <Button
              variant="outline"
              size="sm"
              onClick={goToThisWeek}
              className="w-full"
            >
              This Week
            </Button>
          </div>
          <Calendar
            mode="single"
            selected={dateRange.start}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="outline"
        size="sm"
        onClick={goToNextWeek}
        className="px-3"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}