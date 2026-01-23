import { useState, useEffect, FormEvent, useCallback, useRef, ChangeEvent } from "react";
import { useAppDispatch, useAppSelector } from "../../store";
import { closeUploadModal, addToast } from "../../store/uiSlice";
import { resetFeed, loadInitialFeed } from "../../store/feedSlice";
import { submitOccurrence, updateOccurrence, searchTaxa } from "../../services/api";
import type { TaxaResult } from "../../services/types";
import { ModalOverlay } from "./ModalOverlay";
import { ConservationStatus } from "../common/ConservationStatus";
import styles from "./UploadModal.module.css";

interface ImagePreview {
  file: File;
  preview: string;
}

const QUICK_SPECIES = [
  { name: "Eschscholzia californica", label: "California Poppy" },
  { name: "Quercus agrifolia", label: "Coast Live Oak" },
  { name: "Columba livia", label: "Rock Dove" },
  { name: "Sciurus griseus", label: "Western Gray Squirrel" },
];

export function UploadModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.uploadModalOpen);
  const editingOccurrence = useAppSelector((state) => state.ui.editingOccurrence);
  const user = useAppSelector((state) => state.auth.user);
  const currentLocation = useAppSelector((state) => state.ui.currentLocation);

  const isEditMode = !!editingOccurrence;

  const [species, setSpecies] = useState("");
  const [notes, setNotes] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [suggestions, setSuggestions] = useState<TaxaResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ImagePreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 10;
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const VALID_TYPES = ["image/jpeg", "image/png", "image/webp"];

  useEffect(() => {
    if (isOpen) {
      if (editingOccurrence) {
        // Pre-fill form with existing values when editing
        setSpecies(editingOccurrence.scientificName || "");
        setNotes(editingOccurrence.occurrenceRemarks || "");
        if (editingOccurrence.location) {
          setLat(editingOccurrence.location.lat.toFixed(6));
          setLng(editingOccurrence.location.lng.toFixed(6));
        }
      } else if (currentLocation) {
        setLat(currentLocation.lat.toFixed(6));
        setLng(currentLocation.lng.toFixed(6));
      } else {
        navigator.geolocation?.getCurrentPosition(
          (position) => {
            setLat(position.coords.latitude.toFixed(6));
            setLng(position.coords.longitude.toFixed(6));
          },
          () => {
            setLat("37.7749");
            setLng("-122.4194");
          }
        );
      }
    }
  }, [isOpen, currentLocation, editingOccurrence]);

  const handleClose = () => {
    dispatch(closeUploadModal());
    setSpecies("");
    setNotes("");
    setSuggestions([]);
    // Clean up image previews
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    for (const file of files) {
      // Validate file type
      if (!VALID_TYPES.includes(file.type)) {
        dispatch(addToast({
          message: `Invalid file type: ${file.name}. Use JPG, PNG, or WebP.`,
          type: "error"
        }));
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        dispatch(addToast({
          message: `File too large: ${file.name}. Max size is 10MB.`,
          type: "error"
        }));
        continue;
      }

      // Check max images limit
      if (images.length >= MAX_IMAGES) {
        dispatch(addToast({
          message: `Maximum ${MAX_IMAGES} images allowed.`,
          type: "error"
        }));
        break;
      }

      // Create preview and add to state
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { file, preview }]);

      // Try to extract EXIF location from first image
      if (images.length === 0 && !lat && !lng) {
        extractExifLocation(file);
      }
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const extractExifLocation = async (file: File) => {
    try {
      // Use exif-js style extraction - simplified version
      const arrayBuffer = await file.arrayBuffer();
      const dataView = new DataView(arrayBuffer);

      // Check for JPEG
      if (dataView.getUint16(0) !== 0xffd8) return;

      // For now, we'll rely on a more robust library in the future
      // This is a placeholder that demonstrates the intent
      // Real EXIF parsing would be done with exifr or similar
    } catch (error) {
      console.error("EXIF extraction error:", error);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      URL.revokeObjectURL(newImages[index].preview);
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSpeciesChange = useCallback(async (value: string) => {
    setSpecies(value);
    if (value.length >= 2) {
      const results = await searchTaxa(value);
      setSuggestions(results.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, []);

  const handleSuggestionClick = (name: string) => {
    setSpecies(name);
    setSuggestions([]);
  };

  const handleQuickSpecies = (name: string) => {
    setSpecies(name);
    setSuggestions([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!lat || !lng) {
      dispatch(addToast({ message: "Please provide a location", type: "error" }));
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert images to base64 for upload
      const imageData: Array<{ data: string; mimeType: string }> = [];
      for (const img of images) {
        const base64 = await fileToBase64(img.file);
        imageData.push({
          data: base64,
          mimeType: img.file.type,
        });
      }

      if (isEditMode && editingOccurrence) {
        // Update existing occurrence (images not supported in edit yet)
        await updateOccurrence({
          uri: editingOccurrence.uri,
          scientificName: species || "Unknown species",
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          notes: notes || undefined,
          eventDate: editingOccurrence.eventDate || new Date().toISOString(),
        });
        dispatch(addToast({ message: "Occurrence updated successfully!", type: "success" }));
      } else {
        // Create new occurrence with images
        await submitOccurrence({
          scientificName: species || "Unknown species",
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          notes: notes || undefined,
          eventDate: new Date().toISOString(),
          images: imageData.length > 0 ? imageData : undefined,
        });
        dispatch(addToast({ message: "Occurrence submitted successfully!", type: "success" }));
      }

      handleClose();
      dispatch(resetFeed());
      dispatch(loadInitialFeed());
    } catch (error) {
      dispatch(
        addToast({
          message: `Failed to ${isEditMode ? "update" : "submit"}: ${error instanceof Error ? error.message : "Unknown error"}`,
          type: "error",
        })
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const locationDisplay = lat && lng ? `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}` : "Getting location...";

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose}>
      {user && (
        <div className={styles.authBanner}>
          Posting as {user.handle ? `@${user.handle}` : user.did}
        </div>
      )}
      <h2>{isEditMode ? "Edit Occurrence" : "New Occurrence"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="species-input">Species</label>
          <input
            type="text"
            id="species-input"
            value={species}
            onChange={(e) => handleSpeciesChange(e.target.value)}
            placeholder="e.g. Eschscholzia californica"
            autoComplete="off"
          />
          <div className={styles.quickSpecies}>
            {QUICK_SPECIES.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => handleQuickSpecies(s.name)}
              >
                {s.label}
              </button>
            ))}
          </div>
          {suggestions.length > 0 && (
            <div className={styles.suggestions}>
              {suggestions.map((s) => (
                <div
                  key={s.scientificName}
                  className={styles.suggestion}
                  onClick={() => handleSuggestionClick(s.scientificName)}
                >
                  {s.photoUrl && (
                    <img
                      src={s.photoUrl}
                      alt=""
                      className={styles.suggestionPhoto}
                    />
                  )}
                  <div className={styles.suggestionText}>
                    <div className={styles.suggestionHeader}>
                      <strong>{s.scientificName}</strong>
                      {s.conservationStatus && (
                        <ConservationStatus status={s.conservationStatus} size="sm" />
                      )}
                    </div>
                    {s.commonName && <span>{s.commonName}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="notes-input">Notes (optional)</label>
          <textarea
            id="notes-input"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what you observed..."
          />
        </div>
        <div className="form-group">
          <label>Photos (optional)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageSelect}
            style={{ display: "none" }}
          />
          {images.length > 0 && (
            <div className={styles.imagePreviews}>
              {images.map((img, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img src={img.preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className={styles.removeImage}
                    onClick={() => handleRemoveImage(index)}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          {images.length < MAX_IMAGES && (
            <button
              type="button"
              className={styles.uploadButton}
              onClick={handleUploadClick}
            >
              {images.length === 0 ? "Add photos" : "Add more photos"}
            </button>
          )}
          <div className={styles.uploadHint}>
            JPG, PNG, or WebP • Max 10MB each • Up to {MAX_IMAGES} photos
          </div>
        </div>
        <div className="form-group">
          <label>Location (from map center)</label>
          <input type="text" value={locationDisplay} readOnly />
        </div>
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditMode ? "Saving..." : "Submitting..."
              : isEditMode ? "Save Changes" : "Submit"}
          </button>
        </div>
      </form>
    </ModalOverlay>
  );
}
