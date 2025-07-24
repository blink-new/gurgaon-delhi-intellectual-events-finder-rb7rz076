import { useState, useEffect, useMemo, useCallback } from 'react'
import { startOfWeek, endOfWeek, isWithinInterval, parseISO, format } from 'date-fns'
import { Calendar, MapPin, Sparkles, Users, RefreshCw } from 'lucide-react'
import { EventCard } from '@/components/EventCard'
import { EventDetailsModal } from '@/components/EventDetailsModal'
import { DateRangePicker } from '@/components/DateRangePicker'
import { EventFilters } from '@/components/EventFilters'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Event, EventFilters as EventFiltersType } from '@/types/event'
import { blink } from '@/blink/client'

// Mock data for initial development
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Delhi Chess Championship - Weekly Tournament',
    description: 'Join us for an exciting weekly chess tournament featuring players of all skill levels. Prizes for top 3 winners and rating points for all participants.',
    category: 'chess',
    date: '2025-01-27',
    time: '6:00 PM - 10:00 PM',
    location: 'Connaught Place',
    venue: 'Chess Academy Delhi, CP Metro Station',
    city: 'delhi',
    price: 200,
    priceType: 'paid',
    organizer: 'Delhi Chess Club',
    registrationUrl: 'https://example.com/register',
    tags: ['tournament', 'rated', 'prizes'],
    createdAt: '2025-01-24T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  },
  {
    id: '2',
    title: 'Board Game Cafe Meetup - Strategy Night',
    description: 'Explore modern board games in a cozy cafe setting. We have Catan, Ticket to Ride, Azul, and many more. Perfect for beginners and experienced players.',
    category: 'boardgames',
    date: '2025-01-25',
    time: '7:00 PM - 11:00 PM',
    location: 'Cyber Hub',
    venue: 'Game Theory Cafe, Cyber Hub',
    city: 'gurgaon',
    price: null,
    priceType: 'free',
    organizer: 'Gurgaon Board Game Society',
    registrationUrl: 'https://example.com/register',
    tags: ['strategy', 'social', 'beginners-welcome'],
    createdAt: '2025-01-24T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  },
  {
    id: '3',
    title: 'Philosophy Book Club - "Sapiens" Discussion',
    description: 'Monthly discussion on Yuval Noah Harari\'s "Sapiens". We\'ll explore chapters 10-15 focusing on the Agricultural Revolution and its impact on human society.',
    category: 'bookclub',
    date: '2025-01-26',
    time: '4:00 PM - 6:00 PM',
    location: 'Khan Market',
    venue: 'Cafe Turtle, Khan Market',
    city: 'delhi',
    price: 150,
    priceType: 'paid',
    organizer: 'Delhi Philosophy Circle',
    registrationUrl: 'https://example.com/register',
    tags: ['philosophy', 'history', 'discussion'],
    createdAt: '2025-01-24T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  },
  {
    id: '4',
    title: 'AI & Future of Work - Open Discussion',
    description: 'Join tech professionals and enthusiasts for an engaging discussion about artificial intelligence and its impact on the future of work. Share insights and network.',
    category: 'discussion',
    date: '2025-01-28',
    time: '7:30 PM - 9:30 PM',
    location: 'Sector 29',
    venue: 'WeWork Galaxy, Sector 29',
    city: 'gurgaon',
    price: null,
    priceType: 'free',
    organizer: 'Tech Talks Gurgaon',
    registrationUrl: 'https://example.com/register',
    tags: ['technology', 'AI', 'networking', 'career'],
    createdAt: '2025-01-24T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  },
  {
    id: '5',
    title: 'Speed Chess Tournament - Blitz Format',
    description: 'Fast-paced chess tournament with 5+3 time control. Open to all ratings. Entry includes refreshments and analysis session with a master.',
    category: 'chess',
    date: '2025-01-29',
    time: '2:00 PM - 6:00 PM',
    location: 'Lajpat Nagar',
    venue: 'Chess Point Academy',
    city: 'delhi',
    price: 300,
    priceType: 'paid',
    organizer: 'Speed Chess Delhi',
    registrationUrl: 'https://example.com/register',
    tags: ['blitz', 'tournament', 'all-levels'],
    createdAt: '2025-01-24T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  },
  {
    id: '6',
    title: 'Dungeons & Dragons Beginner Session',
    description: 'New to D&D? Join our beginner-friendly session with pre-made characters and an experienced DM. All materials provided. Adventure awaits!',
    category: 'boardgames',
    date: '2025-01-30',
    time: '6:00 PM - 10:00 PM',
    location: 'Golf Course Road',
    venue: 'The Boardroom Cafe',
    city: 'gurgaon',
    price: 400,
    priceType: 'paid',
    organizer: 'Gurgaon RPG Guild',
    registrationUrl: 'https://example.com/register',
    tags: ['RPG', 'beginners', 'storytelling'],
    createdAt: '2025-01-24T10:00:00Z',
    updatedAt: '2025-01-24T10:00:00Z'
  }
]

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [scrapingLoading, setScraping] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Initialize date range to current week
  const today = new Date()
  const [dateRange, setDateRange] = useState({
    start: startOfWeek(today, { weekStartsOn: 1 }),
    end: endOfWeek(today, { weekStartsOn: 1 })
  })

  const [filters, setFilters] = useState<EventFiltersType>({
    categories: [],
    cities: [],
    priceRange: [0, 5000],
    dateRange,
    searchQuery: ''
  })

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  // Load events from API
  const loadEvents = useCallback(async () => {
    setEventsLoading(true)
    try {
      const startDate = format(dateRange.start, 'yyyy-MM-dd')
      const endDate = format(dateRange.end, 'yyyy-MM-dd')
      
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(filters.categories.length > 0 && { category: filters.categories[0] }),
        ...(filters.cities.length > 0 && { city: filters.cities[0] }),
        ...(filters.priceRange[1] < 5000 && { maxPrice: filters.priceRange[1].toString() }),
        ...(filters.searchQuery && { search: filters.searchQuery })
      })

      const response = await fetch(`https://rb7rz076--get-events.functions.blink.new?${params}`)
      const data = await response.json()
      
      if (data.success) {
        // Transform API data to match our Event interface
        const transformedEvents = data.events.map((event: any) => {
          // Map API categories to frontend categories
          const categoryMap: { [key: string]: string } = {
            'Chess': 'chess',
            'Board Games': 'boardgames', 
            'Book Club': 'bookclub',
            'Discussion': 'discussion'
          }
          
          return {
            id: event.id,
            title: event.title,
            description: event.description,
            category: categoryMap[event.category] || event.category.toLowerCase(),
            date: event.date,
            time: event.time,
            location: event.location,
            venue: event.venue,
            city: event.city.toLowerCase(),
            price: event.price,
            priceType: event.is_free ? 'free' : 'paid',
            organizer: event.organizer,
            registrationUrl: event.registration_url,
            tags: event.tags || [],
            createdAt: event.scraped_at,
            updatedAt: event.scraped_at
          }
        })
        
        setEvents(transformedEvents)
      } else {
        // Fallback to mock data if API fails
        console.warn('API failed, using mock data:', data.error)
        setEvents(mockEvents)
      }
    } catch (error) {
      console.error('Error loading events:', error)
      // Fallback to mock data on error
      setEvents(mockEvents)
    } finally {
      setEventsLoading(false)
    }
  }, [dateRange, filters])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  // Update filters when date range changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, dateRange }))
  }, [dateRange])

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Date range filter
      const eventDate = parseISO(event.date)
      if (!isWithinInterval(eventDate, { start: dateRange.start, end: dateRange.end })) {
        return false
      }

      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(event.category)) {
        return false
      }

      // City filter
      if (filters.cities.length > 0 && !filters.cities.includes(event.city)) {
        return false
      }

      // Price filter
      const eventPrice = event.price || 0
      if (eventPrice < filters.priceRange[0] || eventPrice > filters.priceRange[1]) {
        return false
      }

      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const searchableText = [
          event.title,
          event.description,
          event.venue,
          event.organizer,
          ...event.tags
        ].join(' ').toLowerCase()
        
        if (!searchableText.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [events, dateRange, filters])

  const handleViewDetails = (event: Event) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
  }

  const handleScrapeEvents = async () => {
    setScraping(true)
    try {
      const response = await fetch('https://rb7rz076--scrape-events.functions.blink.new', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        console.log(`Successfully scraped ${data.events_count} events`)
        // Reload events after scraping
        await loadEvents()
      } else {
        console.error('Scraping failed:', data.error)
      }
    } catch (error) {
      console.error('Error triggering scrape:', error)
    } finally {
      setScraping(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your intellectual events...</p>
        </div>
      </div>
    )
  }

  // Remove authentication requirement - let users browse events without signing in

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Intellectual Events
                </h1>
                <p className="text-sm text-gray-600">Gurgaon & Delhi</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={handleScrapeEvents}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                disabled={scrapingLoading}
              >
                {scrapingLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                {scrapingLoading ? 'Scraping...' : 'Refresh Events'}
              </Button>
              {user ? (
                <Button
                  onClick={() => blink.auth.logout()}
                  variant="ghost"
                  size="sm"
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  onClick={() => blink.auth.login()}
                  variant="outline"
                  size="sm"
                >
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Intellectual Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find Chess tournaments, Board game meetups, Book clubs, and Discussion groups 
            happening in Gurgaon and Delhi this week.
          </p>
        </div>

        {/* Date Range Picker */}
        <div className="flex justify-center mb-8">
          <DateRangePicker
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </div>

        {/* Filters */}
        <div className="mb-8">
          <EventFilters
            filters={filters}
            onFiltersChange={setFilters}
            eventCount={filteredEvents.length}
          />
        </div>

        {/* Events Grid */}
        {eventsLoading || events.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or date range to find more events.
            </p>
            <Button
              onClick={() => setFilters({
                categories: [],
                cities: [],
                priceRange: [0, 5000],
                dateRange,
                searchQuery: ''
              })}
              variant="outline"
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}

        {/* Stats */}
        {filteredEvents.length > 0 && (
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredEvents.length}
              </div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredEvents.filter(e => e.priceType === 'free').length}
              </div>
              <div className="text-sm text-gray-600">Free Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(filteredEvents.map(e => e.organizer)).size}
              </div>
              <div className="text-sm text-gray-600">Organizers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(filteredEvents.map(e => e.venue)).size}
              </div>
              <div className="text-sm text-gray-600">Venues</div>
            </div>
          </div>
        )}
      </main>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedEvent(null)
        }}
      />
    </div>
  )
}

export default App