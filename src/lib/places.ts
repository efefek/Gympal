export interface Place {
  id: string
  name: string
  lat: number
  lng: number
  type: 'gym' | 'park'
  description: string
}

export const londonGyms: Place[] = [
  { id: 'lido-1', name: 'London Fields Lido', lat: 51.541, lng: -0.057, type: 'gym', description: 'Outdoor heated pool & gym' },
  { id: 'lido-2', name: 'Parliament Hill Lido', lat: 51.558, lng: -0.155, type: 'gym', description: 'Olympic-length outdoor pool' },
  { id: 'lido-3', name: 'Brockwell Lido', lat: 51.451, lng: -0.101, type: 'gym', description: 'Art deco lido & fitness centre' },
  { id: 'gym-1', name: 'The Gym Group London Bridge', lat: 51.505, lng: -0.086, type: 'gym', description: '24/7 gym near London Bridge' },
  { id: 'gym-2', name: 'PureGym Shoreditch', lat: 51.525, lng: -0.078, type: 'gym', description: 'Affordable gym in Shoreditch' },
  { id: 'gym-3', name: 'Third Space Soho', lat: 51.514, lng: -0.133, type: 'gym', description: 'Premium gym & spa in Soho' },
]

export const londonParks: Place[] = [
  { id: 'park-1', name: 'Hyde Park', lat: 51.507, lng: -0.166, type: 'park', description: '142 hectares of open space, running routes & outdoor gym' },
  { id: 'park-2', name: 'Regent\'s Park', lat: 51.531, lng: -0.156, type: 'park', description: 'Outdoor gym equipment & running tracks' },
  { id: 'park-3', name: 'Victoria Park', lat: 51.536, lng: -0.041, type: 'park', description: 'East London\'s green gym & sports fields' },
  { id: 'park-4', name: 'Hampstead Heath', lat: 51.559, lng: -0.160, type: 'park', description: 'Swimming ponds, hills & trails' },
  { id: 'park-5', name: 'Battersea Park', lat: 51.480, lng: -0.154, type: 'park', description: 'Peace Pagoda, running path & outdoor gym' },
  { id: 'park-6', name: 'Richmond Park', lat: 51.443, lng: -0.267, type: 'park', description: 'Deer park with cycling & running trails' },
]

export const bikeRoutes = [
  { id: 'route-1', name: 'Thames Path — Greenwich to Richmond', distance: '35 km', difficulty: 'Easy', description: 'Riverside path along the Thames through central London' },
  { id: 'route-2', name: 'Regent\'s Canal — Little Venice to Victoria Park', distance: '14 km', difficulty: 'Easy', description: 'Flat canal towpath through north London' },
  { id: 'route-3', name: 'Richmond Park Loop', distance: '12 km', difficulty: 'Moderate', description: 'Scenic loop around the park with deer sightings' },
  { id: 'route-4', name: 'Epping Forest — Chingford to Theydon Bois', distance: '18 km', difficulty: 'Moderate', description: 'Wooded trails through ancient forest' },
  { id: 'route-5', name: 'Box Hill Zig-Zag', distance: '25 km', difficulty: 'Hard', description: 'Classic Surrey climb with panoramic views' },
  { id: 'route-6', name: 'Lee Valley — Hackney Marshes to Enfield', distance: '22 km', difficulty: 'Easy', description: 'Dedicated cycle path along the Lee Navigation' },
]
