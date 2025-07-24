import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@blinkdotnew/sdk";

const blink = createClient({
  projectId: 'gurgaon-delhi-intellectual-events-finder-rb7rz076',
  authRequired: false
});

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const category = url.searchParams.get('category');
    const city = url.searchParams.get('city');
    const maxPrice = url.searchParams.get('maxPrice');
    const search = url.searchParams.get('search');

    console.log('Query params:', { startDate, endDate, category, city, maxPrice, search });

    // Build filter conditions for Blink SDK
    const whereConditions = {};
    
    if (startDate && endDate) {
      // For date range filtering, we'll filter in JavaScript since Blink SDK doesn't support complex WHERE clauses
    }
    
    if (category && category !== 'All') {
      whereConditions.category = category;
    }
    
    if (city && city !== 'All') {
      whereConditions.city = city;
    }

    console.log('Where conditions:', whereConditions);

    // Get all events from the database
    const events = await blink.db.events.list({
      where: Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      orderBy: { date: 'asc' },
      limit: 100
    });

    console.log('Raw events from DB:', events.length);

    // Apply additional filters in JavaScript
    let filteredEvents = events;

    // Date range filter
    if (startDate && endDate) {
      filteredEvents = filteredEvents.filter(event => {
        const eventDate = event.date;
        return eventDate >= startDate && eventDate <= endDate;
      });
    }

    // Price filter
    if (maxPrice) {
      const maxPriceNum = parseInt(maxPrice);
      filteredEvents = filteredEvents.filter(event => {
        const price = typeof event.price === 'number' ? event.price : parseInt(event.price || '0');
        return price <= maxPriceNum;
      });
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredEvents = filteredEvents.filter(event => {
        return (
          event.title?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.venue?.toLowerCase().includes(searchLower) ||
          event.organizer?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Process events to ensure proper format
    const processedEvents = filteredEvents.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      venue: event.venue,
      location: event.location,
      city: event.city,
      price: typeof event.price === 'number' ? event.price : parseInt(event.price || '0'),
      priceType: Number(event.isFree || event.is_free || 0) > 0 ? 'free' : 'paid',
      category: event.category,
      organizer: event.organizer,
      registrationUrl: event.registrationUrl || event.registration_url,
      tags: typeof event.tags === 'string' ? event.tags.split(',').map(tag => tag.trim()) : (event.tags || []),
      sourcePlatform: event.sourcePlatform || event.source_platform,
      scrapedAt: event.scrapedAt || event.scraped_at,
      createdAt: event.createdAt || event.created_at
    }));

    console.log('Processed events:', processedEvents.length);

    return new Response(JSON.stringify({
      success: true,
      events: processedEvents,
      count: processedEvents.length
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('Error fetching events:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      events: [],
      count: 0
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
});