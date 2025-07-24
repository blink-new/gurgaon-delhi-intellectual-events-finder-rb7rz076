import { Calendar, MapPin, Clock, Users, ExternalLink, IndianRupee, Tag } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Event } from '@/types/event'
import { format } from 'date-fns'

interface EventDetailsModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
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

export function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  if (!event) return null

  const eventDate = new Date(event.date)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className="text-xl font-bold text-gray-900 leading-tight">
              {event.title}
            </DialogTitle>
            <Badge 
              variant="secondary" 
              className={`${categoryColors[event.category]} shrink-0 font-medium`}
            >
              {categoryLabels[event.category]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">About this event</h4>
            <p className="text-gray-700 leading-relaxed">
              {event.description}
            </p>
          </div>

          <Separator />

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Date</p>
                  <p className="text-gray-600">
                    {format(eventDate, 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Time</p>
                  <p className="text-gray-600">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="font-medium text-gray-900">Organizer</p>
                  <p className="text-gray-600">{event.organizer}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600">{event.venue}</p>
                  <p className="text-sm text-gray-500">
                    {event.city === 'gurgaon' ? 'Gurgaon' : 'Delhi'}, India
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <IndianRupee className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium text-gray-900">Price</p>
                  {event.priceType === 'free' ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Free
                    </Badge>
                  ) : (
                    <p className="text-gray-600 font-semibold">₹{event.price}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <>
              <Separator />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <h4 className="font-semibold text-gray-900">Tags</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {event.registrationUrl && (
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={() => window.open(event.registrationUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Register for Event
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}