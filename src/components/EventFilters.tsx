import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { EventFilters as EventFiltersType } from '@/types/event'

interface EventFiltersProps {
  filters: EventFiltersType
  onFiltersChange: (filters: EventFiltersType) => void
  eventCount: number
}

const categories = [
  { id: 'chess', label: 'Chess', color: 'bg-blue-100 text-blue-800' },
  { id: 'boardgames', label: 'Board Games', color: 'bg-green-100 text-green-800' },
  { id: 'bookclub', label: 'Book Club', color: 'bg-purple-100 text-purple-800' },
  { id: 'discussion', label: 'Discussion', color: 'bg-orange-100 text-orange-800' }
]

const cities = [
  { id: 'gurgaon', label: 'Gurgaon' },
  { id: 'delhi', label: 'Delhi' }
]

export function EventFilters({ filters, onFiltersChange, eventCount }: EventFiltersProps) {
  const updateFilters = (updates: Partial<EventFiltersType>) => {
    onFiltersChange({ ...filters, ...updates })
  }

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId]
    updateFilters({ categories: newCategories })
  }

  const toggleCity = (cityId: string) => {
    const newCities = filters.cities.includes(cityId)
      ? filters.cities.filter(id => id !== cityId)
      : [...filters.cities, cityId]
    updateFilters({ cities: newCities })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      categories: [],
      cities: [],
      priceRange: [0, 5000],
      dateRange: filters.dateRange,
      searchQuery: ''
    })
  }

  const hasActiveFilters = filters.categories.length > 0 || 
                          filters.cities.length > 0 || 
                          filters.searchQuery.length > 0 ||
                          filters.priceRange[0] > 0 || 
                          filters.priceRange[1] < 5000

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search events, venues, organizers..."
          value={filters.searchQuery}
          onChange={(e) => updateFilters({ searchQuery: e.target.value })}
          className="pl-10 h-11"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4 mr-2" />
              Categories
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {filters.categories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Event Categories</h4>
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.id}
                    checked={filters.categories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <label
                    htmlFor={category.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* City Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Cities
              {filters.cities.length > 0 && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  {filters.cities.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48" align="start">
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Cities</h4>
              {cities.map((city) => (
                <div key={city.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={city.id}
                    checked={filters.cities.includes(city.id)}
                    onCheckedChange={() => toggleCity(city.id)}
                  />
                  <label
                    htmlFor={city.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {city.label}
                  </label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Price Range Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              Price
              {(filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) && (
                <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                  ₹{filters.priceRange[0]}-{filters.priceRange[1]}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Price Range</h4>
              <div className="px-2">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
                  max={5000}
                  min={0}
                  step={100}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>₹{filters.priceRange[0]}</span>
                <span>₹{filters.priceRange[1]}</span>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-9 text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </Button>
        )}

        {/* Results Count */}
        <div className="ml-auto text-sm text-gray-600">
          {eventCount} {eventCount === 1 ? 'event' : 'events'} found
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map((categoryId) => {
            const category = categories.find(c => c.id === categoryId)
            return category ? (
              <Badge
                key={categoryId}
                variant="secondary"
                className={`${category.color} cursor-pointer`}
                onClick={() => toggleCategory(categoryId)}
              >
                {category.label}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ) : null
          })}
          {filters.cities.map((cityId) => {
            const city = cities.find(c => c.id === cityId)
            return city ? (
              <Badge
                key={cityId}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => toggleCity(cityId)}
              >
                {city.label}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}