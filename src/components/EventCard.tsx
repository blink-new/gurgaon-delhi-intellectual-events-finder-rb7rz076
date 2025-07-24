import { Calendar, MapPin, Clock, Users, ExternalLink, IndianRupee } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Event } from '@/types/event'
import { format } from 'date-fns'

interface EventCardProps {
  event: Event
  onViewDetails: (event: Event) => void
}

const categoryColors = {
  chess: 'bg-blue-100 text-blue-800 border-blue-200',
  boardgames: 'bg-green-100 text-green-800 border-green-200',
  bookclub: 'bg-purple-100 text-purple-800 border-purple-200',
  discussion: 'bg-orange-100 text-orange-800 border-orange-200'
}

const categoryLabels = {
  chess: 'Chess',
  boardgames: 'Board Games',
  bookclub: 'Book Club',
  discussion: 'Discussion'
}

export function EventCard({ event, onViewDetails }: EventCardProps) {
  const eventDate = new Date(event.date)
  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {event.title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {event.description}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className={`${categoryColors[event.category]} shrink-0 font-medium`}
          >
            {categoryLabels[event.category]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="font-medium">
            {format(eventDate, 'EEE, MMM d, yyyy')}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-green-500" />
          <span>{event.time}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="line-clamp-1">{event.venue}, {event.city === 'gurgaon' ? 'Gurgaon' : 'Delhi'}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4 text-purple-500" />
          <span>{event.organizer}</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            {event.priceType === 'free' ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Free
              </Badge>
            ) : (
              <div className="flex items-center gap-1 text-lg font-semibold text-gray-900">
                <IndianRupee className="w-4 h-4" />
                <span>{event.price}</span>
              </div>
            )}
          </div>
          
          {event.tags.length > 0 && (
            <div className="flex gap-1">
              {event.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {event.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{event.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex gap-2 w-full">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails(event)}
          >
            View Details
          </Button>
          {event.registrationUrl && (
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => window.open(event.registrationUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Register
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}