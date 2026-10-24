'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ImageField({
  label,
  value,
  onChange,
  aspect = 'cover',
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  aspect?: string;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const deleteOld = (url: string) => {
    if (!url) return;
    fetch('/api/upload', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    }).catch((err) => console.warn('[ImageField] Failed to delete old image:', err));
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return toast.error('Please select an image');
    if (file.size > 2 * 1024 * 1024) return toast.error('Max 2MB allowed');
    const oldValue = value;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) { toast.error('Upload failed'); return; }
      const data = await res.json();
      onChange(data.url);
      if (oldValue) deleteOld(oldValue);
      toast.success('Uploaded!');
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  };

  return (
    <div>
      <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2 block">{label}</Label>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 cursor-pointer transition-[color,background-color,border-color,opacity,box-shadow]',
          dragging ? 'border-[#C85A40] bg-[#C85A40]/5' : 'border-input hover:border-muted-foreground',
        )}
      >
        {value && value.trim() ? (
          <div className={`relative ${aspect === 'logo' ? 'w-20 h-20' : 'w-full h-36'}`}>
            <img src={value} alt={label} className="w-full h-full object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              <Upload size={20} className="text-white" />
            </div>
          </div>
        ) : uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Uploading…</span>
          </div>
        ) : (
          <>
            <Upload size={28} className="text-muted-foreground mb-2" />
            <span className="text-sm font-medium text-foreground">Drop an image or click to browse</span>
            <span className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP — max 2MB</span>
          </>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
      {value && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="gap-1.5 rounded-xl mt-2"
        >
          {uploading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-muted-foreground border-t-foreground rounded-full animate-spin" />{' '}
              Uploading
            </>
          ) : (
            <>
              <Upload size={14} /> Replace
            </>
          )}
        </Button>
      )}
      {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    </div>
  );
}
