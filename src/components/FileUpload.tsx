import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSize?: number;
  currentImage?: string;
}

export default function FileUpload({ 
  onUpload, 
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  currentImage
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image');
        return;
      }

      // Vérifier la taille
      if (file.size > maxSize) {
        alert(`L'image ne doit pas dépasser ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      onUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        {isDragging ? (
          <p className="text-blue-600">Déposez le fichier ici</p>
        ) : (
          <div className="space-y-1">
            <p className="text-gray-600">
              Glissez-déposez un fichier ici, ou cliquez pour sélectionner
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG jusqu'à {maxSize / (1024 * 1024)}MB
            </p>
          </div>
        )}
      </div>

      {currentImage && (
        <div className="relative">
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img
              src={currentImage}
              alt="Aperçu"
              className="w-full h-full object-cover"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = 'https://via.placeholder.com/800x400?text=Image+non+disponible';
              }}
            />
          </div>
          <div className="absolute top-2 left-2 px-2 py-1 bg-black bg-opacity-50 rounded text-white text-sm flex items-center gap-1">
            <ImageIcon className="w-4 h-4" />
            <span>Image actuelle</span>
          </div>
        </div>
      )}
    </div>
  );
}