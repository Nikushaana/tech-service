"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Circle,
  useJsApiLoader,
} from "@react-google-maps/api";
import { Loader2Icon } from "lucide-react";
import { toast } from "react-toastify";

interface MapProps {
  id?: string;
  uiControl?: boolean;
  centerCoordinates?: LatLng;
  markerCoordinates?: LatLng;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const filials = [
  {
    id: 1,
    name: "Telavi",
    lat: 41.921723899941945,
    lng: 45.483651509989606,
    radius_km: 28,
  },
  {
    id: 2,
    name: "Tbilisi",
    lat: 41.723112929454636,
    lng: 44.72531435779539,
    radius_km: 14,
  },
];

export default function Map({
  id,
  uiControl,
  centerCoordinates,
  markerCoordinates,
  onChange,
}: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const [currentPosition, setCurrentPosition] = React.useState<LatLng | null>(
    null
  );

  useEffect(() => {
    if (!centerCoordinates && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast.warning(
            "თქვენი მდებარეობის დასადგენად გთხოვთ გააქტიუროთ მდებარეობის გაზიარება.",
            {
              position: "bottom-right",
              autoClose: 3000,
            }
          );
        }
      );
    }
  }, [centerCoordinates]);

  const centerPosition = centerCoordinates ||
    currentPosition || { lat: 41.723112929454636, lng: 44.72531435779539 };

  const options = {
    disableDefaultUI: true,
    mapTypeId: "hybrid",
    fullscreenControl: uiControl,
    mapTypeControl: uiControl,
  };

  // Handle click only inside a filial circle
  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!onChange || !e.latLng) return;

      const clickedPoint = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };

      // Check if click is inside any filial circle
      const insideCircle = filials.some((f) => {
        const distance = google.maps.geometry.spherical.computeDistanceBetween(
          new google.maps.LatLng(f.lat, f.lng),
          new google.maps.LatLng(clickedPoint.lat, clickedPoint.lng)
        );
        return distance <= f.radius_km * 1000; // meters
      });

      if (!insideCircle) {
        toast.warning("დასვი პინი იქ, სადაც სერვისი ხელმისაწვდომია.", {
          position: "bottom-right",
          autoClose: 3000,
        });
        return;
      } // Ignore clicks outside circles

      const syntheticEvent = {
        target: { id, value: clickedPoint },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange(syntheticEvent);
    },
    [id, onChange]
  );

  // Smoothly pan to marker when markerCoordinates change
  useEffect(() => {
    if (mapRef.current && markerCoordinates) {
      mapRef.current.panTo(markerCoordinates);
    }
  }, [markerCoordinates]);

  if (!isLoaded)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader2Icon className="animate-spin" />
      </div>
    );

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={centerPosition}
      zoom={18}
      options={options}
      onClick={handleMapClick}
      onLoad={(map) => {
        mapRef.current = map;
      }}
    >
      {markerCoordinates && <Marker position={markerCoordinates} />}

      {filials.map((f) => (
        <React.Fragment key={f.id}>
          <Circle
            center={{ lat: f.lat, lng: f.lng }}
            radius={f.radius_km * 1000}
            options={{
              fillColor: "#ffffff",
              fillOpacity: 0.01,
              strokeColor: "#00AAFF",
              strokeOpacity: 0.5,
              strokeWeight: 1,
              clickable: false,
            }}
          />
        </React.Fragment>
      ))}
    </GoogleMap>
  );
}
