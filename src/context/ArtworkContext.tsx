import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Artwork {
  id: number | string;
  title: string;
  artist: string;
  tags: string[];
  imageUrl: string;
}

const DUMMY_IMAGES = [
  'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=1000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=1000&auto=format&fit=crop',
];

const INITIAL_ARTWORKS: Artwork[] = [
  { id: 1, title: 'Ethereal Passage', artist: 'Lumina Void', tags: ['space', 'nebula'], imageUrl: DUMMY_IMAGES[0] },
  { id: 2, title: 'Cosmic Dog', artist: 'Astro Creativ', tags: ['dog', 'stars'], imageUrl: DUMMY_IMAGES[1] },
  { id: 3, title: 'Neon Orbit', artist: 'Neon Dreams', tags: ['neon', 'cyberpunk'], imageUrl: DUMMY_IMAGES[2] },
  { id: 4, title: 'Stellar Birth', artist: 'Lumina Void', tags: ['star', 'creation'], imageUrl: DUMMY_IMAGES[3] },
  { id: 5, title: 'Galactic Hound', artist: 'Space Paws', tags: ['dog', 'galaxy'], imageUrl: DUMMY_IMAGES[4] },
  { id: 6, title: 'Void Walker', artist: 'Nebula Dreams', tags: ['void', 'dark'], imageUrl: DUMMY_IMAGES[5] },
];

interface ArtworkContextType {
  artworks: Artwork[];
  likedArtworks: Record<string, boolean>;
  savedArtworks: Record<string, boolean>;
  followedArtists: Record<string, boolean>;
  toggleLike: (id: string | number) => void;
  toggleSave: (id: string | number) => void;
  toggleFollow: (artistName: string) => void;
}

const ArtworkContext = createContext<ArtworkContextType | undefined>(undefined);

export function ArtworkProvider({ children }: { children: ReactNode }) {
  const [artworks] = useState<Artwork[]>(INITIAL_ARTWORKS);
  const [likedArtworks, setLikedArtworks] = useState<Record<string, boolean>>({});
  const [savedArtworks, setSavedArtworks] = useState<Record<string, boolean>>({});
  const [followedArtists, setFollowedArtists] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string | number) => {
    setLikedArtworks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSave = (id: string | number) => {
    setSavedArtworks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFollow = (artistName: string) => {
    setFollowedArtists((prev) => ({ ...prev, [artistName]: !prev[artistName] }));
  };

  return (
    <ArtworkContext.Provider value={{ artworks, likedArtworks, savedArtworks, followedArtists, toggleLike, toggleSave, toggleFollow }}>
      {children}
    </ArtworkContext.Provider>
  );
}

export function useArtwork() {
  const context = useContext(ArtworkContext);
  if (context === undefined) {
    throw new Error('useArtwork must be used within an ArtworkProvider');
  }
  return context;
}
