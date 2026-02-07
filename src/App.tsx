import React, { useState, useRef, useCallback } from 'react';
import {
  Palette,
  Type,
  Image as ImageIcon,
  RotateCcw,
  Trash2,
  Layers,
  Move,
  Download,
  Sun,
  Moon,
} from 'lucide-react';
import { Rnd } from 'react-rnd';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { useExport } from './hooks/useExport';
import { ExportModal } from './components/ExportModal';
import type { ExportFormat } from './hooks/useExport';



type View = 'front' | 'back' | 'sleeve-left' | 'sleeve-right';

interface DesignElement {
  id: string;
  type: 'text' | 'image';
  content: string;
  x: number;
  y: number;
  width: number | string;
  height: number | string;
  rotation: number;
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  view: View;
}

interface ShirtConfig {
  color: string;
  view: View;
}



const SHIRT_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Heather Gray', value: '#a0a0a0' },
  { name: 'Navy', value: '#1e293b' },
  { name: 'Royal Blue', value: '#2563eb' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Forest Green', value: '#166534' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#f472b6' },
];

const FONTS = [
  'Inter',
  'Roboto',
  'Oswald',
  'Pacifico',
  'Playfair Display',
  'Permanent Marker',
  'Bebas Neue',
];



export function App() {
  return (
    <ThemeProvider>
      <Designer />
    </ThemeProvider>
  );
}



function Designer() {
  const { isDark, toggleTheme } = useTheme();

  const [config, setConfig] = useState<ShirtConfig>({
    color: '#ffffff',
    view: 'front',
  });
  const [elements, setElements] = useState<DesignElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [textureIntensity, setTextureIntensity] = useState(0.15);
  const [showExportModal, setShowExportModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const { exportAsFile, exportComposite, isExporting, exportError } = useExport({
    ref: exportRef,
    filename: `t-shirt-design-${config.view}`,
    scale: 2,
  });

  const addText = () => {
    const newText: DesignElement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'text',
      content: 'YOUR TEXT',
      x: 100,
      y: 100,
      width: 'auto',
      height: 'auto',
      rotation: 0,
      color: config.color === '#1a1a1a' ? '#ffffff' : '#000000',
      fontSize: 24,
      fontFamily: 'Inter',
      view: config.view,
    };
    setElements([...elements, newText]);
    setSelectedId(newText.id);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: DesignElement = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'image',
          content: event.target?.result as string,
          x: 100,
          y: 100,
          width: 150,
          height: 150,
          rotation: 0,
          view: config.view,
        };
        setElements([...elements, newImage]);
        setSelectedId(newImage.id);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateElement = (id: string, updates: Partial<DesignElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id));
    setSelectedId(null);
  };

  const filteredElements = elements.filter((el) => el.view === config.view);
  const selectedElement = elements.find((e) => e.id === selectedId);

  const handleOpenExport = useCallback(() => {
    setSelectedId(null);
    // Small delay to let selection border disappear before showing modal
    setTimeout(() => setShowExportModal(true), 50);
  }, []);

  const handleExportFormat = useCallback(
    async (format: ExportFormat) => {
      await exportAsFile(format);
      if (!exportError) {
        setShowExportModal(false);
      }
    },
    [exportAsFile, exportError]
  );

  // exportComposite is available from useExport for multi-view export if needed
  void exportComposite;

  return (
    <div
      className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-300 ${
        isDark ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-100 text-zinc-900'
      }`}
    >
      {/* Sidebar Controls */}
      <div
        className={`w-80 flex flex-col h-full shadow-xl z-10 border-r transition-colors duration-300 ${
          isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}
      >
        {/* Header with Theme Toggle */}
        <div
          className={`p-6 border-b flex items-center justify-between transition-colors duration-300 ${
            isDark ? 'border-zinc-800' : 'border-zinc-100'
          }`}
        >
          <div>
            <h1 className="text-xl font-bold tracking-tight">T-Shirt Designer</h1>
            <p
              className={`text-xs mt-1 uppercase tracking-widest ${
                isDark ? 'text-zinc-500' : 'text-zinc-500'
              }`}
            >
              Premium Customizer
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2.5 rounded-xl transition-all duration-300 ${
              isDark
                ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-400'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <AnimatePresence mode="wait">
              {isDark ? (
                <motion.div
                  key="sun"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Color Selection */}
          <section>
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Palette size={16} /> Garment Color
            </label>
            <div className="grid grid-cols-5 gap-2 mt-3">
              {SHIRT_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setConfig({ ...config, color: c.value })}
                  className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${
                    config.color === c.value
                      ? 'border-indigo-500 scale-110 shadow-md shadow-indigo-500/20'
                      : isDark
                      ? 'border-zinc-700'
                      : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </section>

          {/* Add Elements */}
          <section>
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Layers size={16} /> Add Elements
            </label>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <button
                onClick={addText}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
                    : 'bg-zinc-900 text-white hover:bg-zinc-800'
                }`}
              >
                <Type size={18} /> <span className="text-sm font-medium">Text</span>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700'
                    : 'bg-zinc-100 text-zinc-900 border-zinc-200 hover:bg-zinc-200'
                }`}
              >
                <ImageIcon size={18} /> <span className="text-sm font-medium">Graphic</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
          </section>

          {/* Element Editor */}
          <AnimatePresence>
            {selectedId && selectedElement && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className={`p-4 rounded-xl border transition-colors duration-300 ${
                  isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                    }`}
                  >
                    Editor
                  </span>
                  <button
                    onClick={() => deleteElement(selectedId)}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {selectedElement.type === 'text' && (
                  <div className="space-y-4">
                    <input
                      type="text"
                      className={`w-full border p-2 rounded text-sm transition-colors ${
                        isDark
                          ? 'bg-zinc-800 border-zinc-600 text-white'
                          : 'bg-white border-zinc-200 text-zinc-900'
                      }`}
                      value={selectedElement.content}
                      onChange={(e) => updateElement(selectedId, { content: e.target.value })}
                    />
                    <div>
                      <label
                        className={`text-[10px] font-bold uppercase ${
                          isDark ? 'text-zinc-500' : 'text-zinc-400'
                        }`}
                      >
                        Font Family
                      </label>
                      <select
                        className={`w-full mt-1 border p-2 rounded text-sm transition-colors ${
                          isDark
                            ? 'bg-zinc-800 border-zinc-600 text-white'
                            : 'bg-white border-zinc-200 text-zinc-900'
                        }`}
                        value={selectedElement.fontFamily}
                        onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })}
                      >
                        {FONTS.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label
                          className={`text-[10px] font-bold uppercase ${
                            isDark ? 'text-zinc-500' : 'text-zinc-400'
                          }`}
                        >
                          Size
                        </label>
                        <input
                          type="number"
                          className={`w-full mt-1 border p-2 rounded text-sm transition-colors ${
                            isDark
                              ? 'bg-zinc-800 border-zinc-600 text-white'
                              : 'bg-white border-zinc-200 text-zinc-900'
                          }`}
                          value={selectedElement.fontSize}
                          onChange={(e) =>
                            updateElement(selectedId, { fontSize: parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <label
                          className={`text-[10px] font-bold uppercase ${
                            isDark ? 'text-zinc-500' : 'text-zinc-400'
                          }`}
                        >
                          Color
                        </label>
                        <input
                          type="color"
                          className="w-full mt-1 h-9 rounded cursor-pointer"
                          value={selectedElement.color}
                          onChange={(e) => updateElement(selectedId, { color: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={`mt-4 pt-4 border-t transition-colors ${
                    isDark ? 'border-zinc-700' : 'border-zinc-200'
                  }`}
                >
                  <label
                    className={`text-[10px] font-bold uppercase ${
                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                    }`}
                  >
                    Rotation: {selectedElement.rotation}°
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    className={`w-full h-2 rounded-lg appearance-none cursor-pointer mt-2 ${
                      isDark ? 'bg-zinc-700' : 'bg-zinc-200'
                    }`}
                    value={selectedElement.rotation}
                    onChange={(e) =>
                      updateElement(selectedId, { rotation: parseInt(e.target.value) })
                    }
                  />
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Fabric Texture */}
          <section>
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              Fabric Texture
            </label>
            <div className="mt-3">
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  isDark ? 'bg-zinc-700' : 'bg-zinc-200'
                }`}
                value={textureIntensity}
                onChange={(e) => setTextureIntensity(parseFloat(e.target.value))}
              />
              <div
                className={`flex justify-between text-[10px] mt-1 ${
                  isDark ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                <span>Smooth</span>
                <span>Textured</span>
              </div>
            </div>
          </section>
        </div>

        {/* Export Button */}
        <div
          className={`p-6 border-t transition-colors duration-300 ${
            isDark ? 'border-zinc-800' : 'border-zinc-100'
          }`}
        >
          <button
            onClick={handleOpenExport}
            disabled={isExporting}
            className={`w-full font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/30'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
            }`}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                Exporting...
              </>
            ) : (
              <>
                <Download size={18} /> Export Design
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Preview Area */}
      <main
        className={`flex-1 relative flex flex-col items-center justify-center p-12 transition-colors duration-300 ${
          isDark ? 'bg-zinc-950' : 'bg-zinc-50'
        }`}
      >
        {/* Theme indicator badge */}
        <div className="absolute top-8 right-8 z-20">
          <div
            className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-white text-zinc-500 shadow-sm'
            }`}
          >
            {isDark ? '● Dark Mode' : '○ Light Mode'}
          </div>
        </div>

        {/* View Switcher Overlay */}
        <div
          className={`absolute top-8 left-1/2 -translate-x-1/2 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border flex gap-4 z-20 transition-colors duration-300 ${
            isDark
              ? 'bg-zinc-900/80 border-zinc-700'
              : 'bg-white/80 border-white'
          }`}
        >
          {(['front', 'back', 'sleeve-left', 'sleeve-right'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                setConfig({ ...config, view: v });
                setSelectedId(null);
              }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                config.view === v
                  ? isDark
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-zinc-900 text-white shadow-md'
                  : isDark
                  ? 'text-zinc-500 hover:text-zinc-200'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {v.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* T-Shirt Canvas Container — ENTIRE preview captured for export */}
        <div
          ref={exportRef}
          className={`relative w-full max-w-[600px] aspect-square flex items-center justify-center rounded-3xl shadow-inner p-8 transition-colors duration-300 ${
            isDark ? 'bg-zinc-900' : 'bg-white'
          }`}
        >
          {/* T-Shirt SVG Mockup */}
          <div className="absolute inset-8 transition-all duration-500 flex items-center justify-center">
            <TShirtSvg
              color={config.color}
              view={config.view}
              textureIntensity={textureIntensity}
              isDark={isDark}
            />
          </div>

          {/* Design Interaction Layer */}
          <div
            className={`relative ${
              config.view.includes('sleeve') ? 'w-[120px] h-[120px]' : 'w-[300px] h-[400px]'
            } border-2 border-dashed rounded-lg transition-colors ${
              isDark ? 'border-zinc-700/30' : 'border-zinc-300/30'
            }`}
          >
            <div
              className={`absolute -top-6 left-0 text-[10px] font-bold uppercase opacity-50 ${
                isDark ? 'text-zinc-500' : 'text-zinc-400'
              }`}
            >
              Print Area
            </div>

            {filteredElements.map((el) => (
              <Rnd
                key={el.id}
                size={{ width: el.width, height: el.height }}
                position={{ x: el.x, y: el.y }}
                onDragStop={(_, d) => updateElement(el.id, { x: d.x, y: d.y })}
                onResizeStop={(_e, _direction, ref, _delta, position) => {
                  updateElement(el.id, {
                    width: ref.style.width,
                    height: ref.style.height,
                    ...position,
                  });
                }}
                onMouseDown={() => setSelectedId(el.id)}
                bounds="parent"
                style={{
                  border:
                    selectedId === el.id ? '2px solid #6366f1' : '1px solid transparent',
                  zIndex: selectedId === el.id ? 100 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: `rotate(${el.rotation}deg)`,
                }}
              >
                {el.type === 'text' ? (
                  <div
                    style={{
                      color: el.color,
                      fontSize: `${el.fontSize}px`,
                      fontFamily: el.fontFamily,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    {el.content}
                  </div>
                ) : (
                  <img
                    src={el.content}
                    alt="design"
                    crossOrigin="anonymous"
                    className="w-full h-full object-contain pointer-events-none select-none"
                  />
                )}
                {selectedId === el.id && (
                  <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1 cursor-move shadow-lg">
                    <Move size={12} />
                  </div>
                )}
              </Rnd>
            ))}
          </div>
        </div>

        {/* Floating Action Hint */}
        <div
          className={`absolute bottom-8 text-sm flex items-center gap-2 ${
            isDark ? 'text-zinc-600' : 'text-zinc-400'
          }`}
        >
          <RotateCcw size={14} /> Use controls to customize or drag elements directly
        </div>
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportFormat}
        isExporting={isExporting}
        exportError={exportError}
      />
    </div>
  );
}

// --- SVG Mockup Component ---

function TShirtSvg({
  color,
  view,
  textureIntensity,
  isDark,
}: {
  color: string;
  view: View;
  textureIntensity: number;
  isDark: boolean;
}) {
  const getPath = () => {
    switch (view) {
      case 'back':
        return 'M150,50 L250,50 L300,70 L350,150 L300,180 L300,450 L100,450 L100,180 L50,150 L100,70 Z';
      case 'sleeve-left':
        return 'M100,100 L250,50 L300,150 L150,250 Z';
      case 'sleeve-right':
        return 'M300,100 L150,50 L100,150 L250,250 Z';
      default:
        return 'M150,50 C175,70 225,70 250,50 L300,70 L350,150 L300,180 L300,450 L100,450 L100,180 L50,150 L100,70 Z';
    }
  };

  const textureStroke = isDark ? '#fff' : '#000';

  return (
    <div className="relative w-full h-full flex items-center justify-center drop-shadow-2xl">
      <svg
        viewBox="0 0 400 500"
        className="w-full h-full"
        style={{ filter: `drop-shadow(0 10px 20px rgba(0,0,0,${isDark ? '0.4' : '0.1'}))` }}
      >
        <defs>
          <pattern
            id="fabric"
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0,0 L10,10 M10,0 L0,10"
              stroke={textureStroke}
              strokeWidth="0.5"
              opacity={textureIntensity}
            />
          </pattern>
          <filter id="shadow">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Main Shirt Shape */}
        <path d={getPath()} fill={color} stroke="#0000001a" strokeWidth="1" />

        {/* Fabric Texture Overlay */}
        <path d={getPath()} fill="url(#fabric)" pointerEvents="none" />

        {/* Shading/Highlights */}
        <path d={getPath()} fill="rgba(0,0,0,0.03)" pointerEvents="none" />
      </svg>
    </div>
  );
}
