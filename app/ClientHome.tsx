"use client";

import { useState, useRef, ChangeEvent } from 'react';
import styles from './page.module.css';

const STANDARD_RESOLUTIONS = [
  '300x250',
  '336x280',
  '160x600',
  '1024x1024',
  '728x90',
  '970x250',
  '320x50'
];

type ResultStatus = 'idle' | 'loading' | 'success' | 'error';

interface Result {
  id: string;
  resolution: string;
  status: ResultStatus;
  progress: number;
  imageUrl?: string;
  error?: string;
}

export default function ClientHome({ serverApiKey }: { serverApiKey: string }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [selectedStandard, setSelectedStandard] = useState<Set<string>>(new Set());
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [customResolutions, setCustomResolutions] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        const base64 = result.split(',')[1];
        setBase64Image(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStandard = (res: string) => {
    const next = new Set(selectedStandard);
    if (next.has(res)) next.delete(res);
    else next.add(res);
    setSelectedStandard(next);
  };

  const addCustomResolution = () => {
    if (customWidth && customHeight) {
      const res = `${customWidth}x${customHeight}`;
      if (!customResolutions.includes(res)) {
        setCustomResolutions([...customResolutions, res]);
      }
      setCustomWidth("");
      setCustomHeight("");
    }
  };

  const removeCustom = (res: string) => {
    setCustomResolutions(customResolutions.filter(r => r !== res));
  };

  const toggleAllStandard = () => {
    if (selectedStandard.size === STANDARD_RESOLUTIONS.length) {
      setSelectedStandard(new Set());
    } else {
      setSelectedStandard(new Set(STANDARD_RESOLUTIONS));
    }
  };

  const downloadAll = () => {
    results.forEach(result => {
      if (result.status === 'success' && result.imageUrl) {
        const a = document.createElement('a');
        a.href = result.imageUrl;
        a.download = `resized_${result.resolution}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    });
  };

  const handleGenerate = async () => {
    if (!base64Image) return;

    const allResolutions = [...Array.from(selectedStandard), ...customResolutions];
    if (allResolutions.length === 0) return;

    const initialResults: Result[] = allResolutions.map(res => ({
      id: Math.random().toString(36).substring(7),
      resolution: res,
      status: 'loading',
      progress: 0
    }));

    setResults(initialResults);

    initialResults.forEach(async (task) => {
      const progressInterval = setInterval(() => {
        setResults(prev => prev.map(r => {
          if (r.id === task.id && r.status === 'loading') {
            const nextProgress = r.progress + Math.random() * 15;
            return { ...r, progress: nextProgress > 90 ? 90 : nextProgress };
          }
          return r;
        }));
      }, 500);

      try {
        const [width, height] = task.resolution.split('x');
        
        const response = await fetch('/api/resize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': serverApiKey
          },
          body: JSON.stringify({
            image: base64Image,
            mimeType: selectedFile?.type || 'image/jpeg',
            width: parseInt(width),
            height: parseInt(height)
          })
        });

        const data = await response.json();
        clearInterval(progressInterval);

        if (response.ok) {
          setResults(prev => prev.map(r => 
            r.id === task.id ? { ...r, status: 'success', progress: 100, imageUrl: `data:image/jpeg;base64,${data.image}` } : r
          ));
        } else {
          setResults(prev => prev.map(r => 
            r.id === task.id ? { ...r, status: 'error', progress: 0, error: data.error } : r
          ));
        }

      } catch (e) {
        clearInterval(progressInterval);
        setResults(prev => prev.map(r => 
          r.id === task.id ? { ...r, status: 'error', progress: 0, error: 'Network error' } : r
        ));
      }
    });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>IAB Ad Resizer</h1>
      <p className={styles.subtitle}>AI-powered intelligent outpainting and resizing using Vertex AI</p>

      <div 
        className={`${styles.uploadArea} ${selectedFile ? styles.active : ''}`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          accept="image/*" 
          hidden 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
        />
        <div className={styles.uploadContent}>
          <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {selectedFile ? (
            <p className={styles.fileInfo}>{selectedFile.name} ready</p>
          ) : (
            <p>Click or drag image here to upload</p>
          )}
        </div>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.panel}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className={styles.panelTitle} style={{ marginBottom: 0, borderBottom: 'none' }}>IAB Standard Resolutions</h2>
            <button 
              onClick={toggleAllStandard}
              style={{ padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--card-border)', borderRadius: '4px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              {selectedStandard.size === STANDARD_RESOLUTIONS.length ? "Deselect All" : "Select All"}
            </button>
          </div>
          <div className={styles.checkboxList}>
            {STANDARD_RESOLUTIONS.map(res => (
              <label key={res} className={styles.checkboxItem}>
                <input 
                  type="checkbox" 
                  checked={selectedStandard.has(res)} 
                  onChange={() => toggleStandard(res)} 
                />
                {res}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>Custom Resolutions</h2>
          <div className={styles.customInputGroup}>
            <div className={styles.inputField}>
              <label>Width</label>
              <input type="number" placeholder="px" value={customWidth} onChange={e => setCustomWidth(e.target.value)} />
            </div>
            <span style={{ paddingBottom: '0.75rem', color: 'var(--text-secondary)' }}>x</span>
            <div className={styles.inputField}>
              <label>Height</label>
              <input type="number" placeholder="px" value={customHeight} onChange={e => setCustomHeight(e.target.value)} />
            </div>
            <button className={styles.addButton} onClick={addCustomResolution}>Add</button>
          </div>
          
          <div className={styles.customTags}>
            {customResolutions.map(res => (
              <span key={res} className={styles.tag}>
                {res}
                <button className={styles.removeTag} onClick={() => removeCustom(res)}>×</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.actionArea}>
        <button 
          className={styles.generateBtn} 
          onClick={handleGenerate}
          disabled={!selectedFile || (selectedStandard.size === 0 && customResolutions.length === 0)}
        >
          Generate Resized Ads
        </button>
      </div>

      {results.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '2rem 0 1rem 0', width: '100%' }}>
            <h2 className={styles.panelTitle} style={{ marginBottom: 0, borderBottom: 'none' }}>Generated Results</h2>
            <button 
              onClick={downloadAll}
              style={{ width: 'auto', padding: '0.5rem 1rem', margin: 0, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer' }}
              disabled={!results.some(r => r.status === 'success')}
            >
              Download All
            </button>
          </div>
          <div className={styles.resultsGrid}>
          {results.map(result => (
            <div key={result.id} className={styles.resultCard}>
              <div className={styles.resultHeader}>
                <span className={styles.resolution}>{result.resolution}</span>
                <span className={styles.status}>
                  {result.status === 'loading' ? 'Generating...' : result.status === 'success' ? 'Ready' : 'Failed'}
                </span>
              </div>
              <div className={styles.resultBody}>
                {result.status === 'loading' && (
                  <div className={styles.progressContainer}>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${result.progress}%` }}></div>
                    </div>
                    <span>{Math.round(result.progress)}%</span>
                  </div>
                )}
                
                {result.status === 'success' && result.imageUrl && (
                  <img src={result.imageUrl} alt={`Resized to ${result.resolution}`} className={styles.imagePreview} />
                )}

                {result.status === 'error' && (
                  <div style={{ color: 'var(--danger)', textAlign: 'center' }}>
                    Error: {result.error}
                  </div>
                )}
              </div>
              {result.status === 'success' && result.imageUrl && (
                <a 
                  href={result.imageUrl} 
                  download={`resized_${result.resolution}.jpg`} 
                  className={styles.downloadBtn}
                >
                  Download
                </a>
              )}
            </div>
          ))}
        </div>
        </>
      )}
    </div>
  );
}
