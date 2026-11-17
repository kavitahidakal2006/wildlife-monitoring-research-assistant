import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useResearch } from '../context/ResearchContext';

interface CreateProjectModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
}

export function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const { addProject } = useResearch();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [cameraInput, setCameraInput] = useState('CAM-01');
  const [cameras, setCameras] = useState<string[]>(['CAM-01']);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleAddCamera = () => {
    const cleaned = cameraInput.trim().toUpperCase();
    if (!cleaned) return;
    if (!cameras.includes(cleaned)) {
      setCameras((prev) => [...prev, cleaned]);
    }
    setCameraInput('');
  };

  const handleRemoveCamera = (cam: string) => {
    if (cameras.length <= 1) return;
    setCameras((prev) => prev.filter((c) => c !== cam));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setError('Please enter a project name and general monitoring location.');
      return;
    }
    const created = addProject({
      name,
      description:
        description.trim() ||
        'Camera-trap wildlife biodiversity and seasonal movement monitoring.',
      location,
      cameras,
    });
    setName('');
    setDescription('');
    setLocation('');
    setCameras(['CAM-01']);
    setCameraInput('CAM-01');
    setError('');
    onCreated?.(created.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#202B24]/50 p-4 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-project-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-[#E2E5DA] bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#EFF1E8] pb-4">
          <div>
            <h2
              id="create-project-title"
              className="font-display text-lg font-semibold text-[#202B24]"
            >
              Create Monitoring Project
            </h2>
            <p className="mt-0.5 text-xs text-[#788078]">
              Set up a study area and assign camera-trap unit identifiers.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#788078] transition-colors hover:bg-[#F5F6EF] hover:text-[#202B24]"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <p className="rounded-lg bg-[#C65B4B]/10 px-3 py-2 text-xs font-medium text-[#A33E30]">
              {error}
            </p>
          )}

          <div>
            <label
              htmlFor="project-name"
              className="block text-xs font-semibold text-[#202B24]"
            >
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Western Ghats Riparian Corridor"
              className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] bg-white px-3.5 py-2 text-sm text-[#202B24] placeholder:text-[#9AA39A] focus:border-[#244B35] focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="project-location"
              className="block text-xs font-semibold text-[#202B24]"
            >
              General Monitoring Location
            </label>
            <input
              id="project-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Northern Reserve Ridge, Valley Buffer Zone"
              className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] bg-white px-3.5 py-2 text-sm text-[#202B24] placeholder:text-[#9AA39A] focus:border-[#244B35] focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="block text-xs font-semibold text-[#202B24]"
            >
              Description
            </label>
            <textarea
              id="project-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe the study objective and target wildlife habitats..."
              className="mt-1.5 w-full rounded-lg border border-[#D8DDD0] bg-white px-3.5 py-2 text-sm text-[#202B24] placeholder:text-[#9AA39A] focus:border-[#244B35] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="camera-id-input"
              className="block text-xs font-semibold text-[#202B24]"
            >
              Camera Name / Camera ID
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                id="camera-id-input"
                type="text"
                value={cameraInput}
                onChange={(e) => setCameraInput(e.target.value)}
                placeholder="e.g., CAM-W01"
                className="flex-1 rounded-lg border border-[#D8DDD0] bg-white px-3.5 py-2 font-mono text-sm text-[#202B24] placeholder:text-[#9AA39A] focus:border-[#244B35] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCamera}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8DDD0] bg-[#FAFBF7] px-3 py-2 text-xs font-semibold text-[#244B35] hover:bg-[#EFF1E8]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Unit</span>
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {cameras.map((cam) => (
                <span
                  key={cam}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#E2E5DA] bg-[#F5F6EF] px-2.5 py-1 font-mono text-xs text-[#202B24]"
                >
                  <span>{cam}</span>
                  {cameras.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCamera(cam)}
                      className="text-[#788078] hover:text-[#C65B4B]"
                      aria-label={`Remove ${cam}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-[#EFF1E8] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#D8DDD0] bg-white px-4 py-2 text-sm font-medium text-[#202B24] hover:bg-[#F5F6EF]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#244B35] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1C3B2A]"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
