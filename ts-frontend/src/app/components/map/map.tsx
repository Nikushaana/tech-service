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
import { useQuery } from "@tanstack/react-query";
import { fetchFrontBranches } from "@/app/lib/api/frontBranches";

interface MapProps {
  id?: string;
  uiControl?: boolean;
  checkCoverageRadius?: boolean;
  centerCoordinates?: LatLng;
  markerCoordinates?: LatLng;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Map({
  id,
  uiControl,
  checkCoverageRadius,
  centerCoordinates,
  markerCoordinates,
  onChange,
}: MapProps) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const { data: branches } = useQuery({
    queryKey: ["frontBranches"],
    queryFn: fetchFrontBranches,
    staleTime: 1000 * 60 * 10,
  });

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

  const centerPosition =
    centerCoordinates ||
    currentPosition ||
    (branches && branches[0] && branches[0].location);

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

      if (checkCoverageRadius) {
        // Check if click is inside any filial circle
        if (!branches?.length)
          return toast.warning("დროებით ჩვენი სერვისი მიუწვდომელია.", {
            position: "bottom-right",
            autoClose: 3000,
          });

        const insideCircle = branches.some((f: Branch) => {
          const distance =
            google.maps.geometry.spherical.computeDistanceBetween(
              new google.maps.LatLng(f.location.lat, f.location.lng),
              new google.maps.LatLng(clickedPoint.lat, clickedPoint.lng)
            );
          return distance <= Number(f.coverage_radius_km) * 1000; // meters
        });

        if (!insideCircle) {
          toast.warning("დასვი პინი იქ, სადაც სერვისი ხელმისაწვდომია.", {
            position: "bottom-right",
            autoClose: 3000,
          });
          return;
        } // Ignore clicks outside circles
      }
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

      {branches?.map((f: Branch) => (
        <React.Fragment key={f.id}>
          <Circle
            center={{ lat: f.location.lat, lng: f.location.lng }}
            radius={Number(f.coverage_radius_km) * 1000}
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
