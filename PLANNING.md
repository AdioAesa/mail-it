# MailIt - Planning & Future Improvements

## Nearby Mailers Map Feature

### Current Implementation (v1)
- Interactive Leaflet map showing delivery location and nearby mailers
- Address geocoding via OpenStreetMap Nominatim API
- Backend endpoint `/api/mailer/nearby` for proximity search
- Demo fallback data when backend unavailable
- Basic mailer info: name, rating, distance

### Future Improvements

#### Real-time Features
- [ ] WebSocket integration for live mailer location updates
- [ ] Mailer availability status (online/offline/busy)
- [ ] Push notifications when mailers accept jobs nearby

#### Enhanced UX
- [ ] Estimated delivery time based on mailer distance
- [ ] Filter mailers by rating threshold (e.g., 4.5+ stars)
- [ ] Filter mailers by completed jobs count
- [ ] Sort options: closest, highest rated, most experienced
- [ ] Mailer profile preview on marker click

#### Privacy & Security
- [ ] Backend returns fuzzy mailer coordinates (privacy-safe radius)
- [ ] Rate limiting on geocoding requests
- [ ] Cache geocoded addresses to reduce API calls

#### Performance
- [ ] Lazy load map component (reduce initial bundle)
- [ ] Cluster markers when many mailers in area
- [ ] Virtual scrolling for mailer list view

#### Advanced Features
- [ ] Mailer route visualization (driving directions)
- [ ] Delivery time windows selection
- [ ] Favorite mailers system
- [ ] Mailer specializations (e.g., same-day, bulk orders)
- [ ] Neighbor delivery network (community mailers)

---

## Other Planned Features

### Payment & Pricing
- [ ] Dynamic pricing based on distance/urgency
- [ ] Subscription plans for frequent senders
- [ ] Mailer tipping feature

### Card Creation
- [ ] AI-assisted message writing
- [ ] More card templates and categories
- [ ] Custom card designer (drag-and-drop)
- [ ] Handwriting font options

### Delivery Tracking
- [ ] Real-time delivery tracking
- [ ] Photo proof of delivery
- [ ] Delivery confirmation notifications
- [ ] Estimated arrival countdown

---

*Last updated: 2025-11-29*
