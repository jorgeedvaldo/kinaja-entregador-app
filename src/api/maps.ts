// ============================================================
// Maps API — Google Directions, route decoding, ETA
// ============================================================

import { GOOGLE_MAPS_API_KEY } from '@env';
import { GOOGLE_MAPS } from '../constants/api';
import type { LatLng, RouteInfo, FullRoute } from '../types';

/**
 * Decode Google Maps encoded polyline string into coordinate array
 * Uses the standard Google polyline encoding algorithm
 */
function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    // Decode latitude
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    // Decode longitude
    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}

/**
 * Fetch route directions between two points using Google Directions API
 * Returns decoded polyline coordinates, distance, and duration
 */
export async function getDirections(
  origin: LatLng,
  destination: LatLng,
  waypoints?: LatLng[]
): Promise<RouteInfo | null> {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;

    let url = `${GOOGLE_MAPS.DIRECTIONS_URL}?origin=${originStr}&destination=${destStr}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`;

    // Add waypoints if provided (e.g., restaurant between driver and client)
    if (waypoints && waypoints.length > 0) {
      const waypointStr = waypoints
        .map((wp) => `${wp.latitude},${wp.longitude}`)
        .join('|');
      url += `&waypoints=${waypointStr}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.routes?.length) {
      console.warn('[Maps] Directions API returned:', data.status);
      return null;
    }

    const route = data.routes[0];
    const leg = route.legs[0]; // First leg if no waypoints, otherwise combined

    // Decode the overview polyline for the entire route
    const coordinates = decodePolyline(route.overview_polyline.points);

    // Calculate total distance and duration across all legs
    let totalDistanceMeters = 0;
    let totalDurationSeconds = 0;
    for (const l of route.legs) {
      totalDistanceMeters += l.distance.value;
      totalDurationSeconds += l.duration.value;
    }

    return {
      coordinates,
      distance: formatDistance(totalDistanceMeters),
      distanceValue: totalDistanceMeters,
      duration: formatDuration(totalDurationSeconds),
      durationValue: totalDurationSeconds,
    };
  } catch (error) {
    console.error('[Maps] Error fetching directions:', error);
    return null;
  }
}

/**
 * Get the full route: driver → restaurant → client
 * Returns separate segments for each leg
 */
export async function getFullRoute(
  driverLocation: LatLng,
  restaurantLocation: LatLng,
  clientLocation: LatLng
): Promise<FullRoute> {
  // Fetch both route segments in parallel
  const [toRestaurant, toClient] = await Promise.all([
    getDirections(driverLocation, restaurantLocation),
    getDirections(restaurantLocation, clientLocation),
  ]);

  // Compute totals
  const totalDistanceMeters =
    (toRestaurant?.distanceValue || 0) + (toClient?.distanceValue || 0);
  const totalDurationSeconds =
    (toRestaurant?.durationValue || 0) + (toClient?.durationValue || 0);

  return {
    toRestaurant,
    toClient,
    totalDistance: formatDistance(totalDistanceMeters),
    totalDuration: formatDuration(totalDurationSeconds),
  };
}

/** Format meters into human-readable distance string */
function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Format seconds into human-readable duration string */
function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seg`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return `${hours}h ${remainingMins}min`;
}
