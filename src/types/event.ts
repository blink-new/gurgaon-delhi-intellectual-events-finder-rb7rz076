export interface Event {
  id: string
  title: string
  description: string
  category: 'chess' | 'boardgames' | 'bookclub' | 'discussion'
  date: string
  time: string
  location: string
  venue: string
  city: 'gurgaon' | 'delhi'
  price: number | null
  priceType: 'free' | 'paid'
  organizer: string
  registrationUrl?: string
  imageUrl?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface EventFilters {
  categories: string[]
  cities: string[]
  priceRange: [number, number]
  dateRange: {
    start: Date
    end: Date
  }
  searchQuery: string
}