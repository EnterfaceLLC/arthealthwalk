// Types
export interface Artwork {
  id: number;
  name: string;
  artist: string;
  description: string;
  image?: string; // URL string for remote images
  coords: ArtCoordinates;
  triggerDistance: number; // Distance in miles
  visited: boolean;
  art_type?: string;
  year?: number;
}
interface ArtCoordinates {
  latitude: number;
  longitude: number;
}

export interface ArtDetailModalProps {
  visible: boolean;
  art: Artwork | null;
  onClose: () => void;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}
