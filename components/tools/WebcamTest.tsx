import React, { useRef, useState, useEffect } from 'react';
import { Camera, Mic, Video, VideoOff, MicOff, RefreshCw, Grid, Download, FlipHorizontal } from 'lucide-react';
import { Button } from '../common/Button';

const WebcamTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  // Features
  const [isMirrored, setIsMirrored] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [resolution, setResolution] = useState<{w: number, h: number} | null>(null);
  
  // Audio
  const [audioLevel, setAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationRef = useRef<number>();

  // Initialize Devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch (e) {
        console.error("Error enumerating devices", e);
      }
    };
    getDevices();
  }, []);

  // Start Camera Stream
  const startCamera = async () => {
    stopCamera();
    setError(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { 
            deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
            width: { ideal: 1920 }, // Request HD by default
            height: { ideal: 1080 } 
        },
        audio: true
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      // Init Audio Analysis
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(newStream);
      source.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      updateAudioLevel();

    } catch (err: any) {
      setError(err.message || 'Could not access camera/microphone. Please allow permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    setAudioLevel(0);
    setResolution(null);
  };

  const updateAudioLevel = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Average volume
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      setAudioLevel(average); // 0-255 range usually

      animationRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // Handle Video Metadata loaded
  const handleVideoLoaded = () => {
      if (videoRef.current) {
          setResolution({
              w: videoRef.current.videoWidth,
              h: videoRef.current.videoHeight
          });
      }
  };

  const takeSnapshot = () => {
      if (!videoRef.current || !resolution) return;
      const canvas = document.createElement('canvas');
      canvas.width = resolution.w;
      canvas.height = resolution.h;
      const ctx = canvas.getContext('2d');
      
      if (isMirrored) {
          ctx?.translate(canvas.width, 0);
          ctx?.scale(-1, 1);
      }
      
      ctx?.drawImage(videoRef.current, 0, 0);
      
      const link = document.createElement('a');
      link.download = `webcam-test-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
  };

  useEffect(() => {
      return () => stopCamera();
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 animate-fade-in">
      <div className="text-center mb-12">
         <div className="inline-flex items-center justify-center p-4 bg-red-500/10 text-red-500 rounded-2xl mb-4">
            <Camera size={32} />
         </div>
         <h1 className="text-4xl font-bold text-white mb-4">Webcam & Mic Test</h1>
         <p className="text-neutral-400 max-w-lg mx-auto">
            Check your video resolution, framing, and microphone levels before your next call.
            <br/><span className="text-xs opacity-60">Runs locally. No data is sent to server.</span>
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* Main Video Area */}
         <div className="lg:col-span-2 space-y-4">
            <div className="relative aspect-video bg-black rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex items-center justify-center group">
                {!stream ? (
                    <div className="text-neutral-500 flex flex-col items-center gap-4">
                        <VideoOff size={48} />
                        <span>Camera is off</span>
                        <Button onClick={startCamera}>Start Camera</Button>
                    </div>
                ) : (
                    <>
                       <video 
                          ref={videoRef}
                          autoPlay 
                          playsInline 
                          muted 
                          onLoadedMetadata={handleVideoLoaded}
                          className={`w-full h-full object-cover transition-transform duration-300 ${isMirrored ? 'scale-x-[-1]' : ''}`}
                       />
                       
                       {/* Grid Overlay */}
                       {showGrid && (
                           <div className="absolute inset-0 pointer-events-none">
                               <div className="w-full h-full border-t border-b border-white/20 absolute top-1/3 bottom-1/3"></div>
                               <div className="h-full w-full border-l border-r border-white/20 absolute left-1/3 right-1/3"></div>
                           </div>
                       )}

                       {/* Resolution Badge */}
                       {resolution && (
                           <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-mono text-white border border-white/10">
                               {resolution.w} × {resolution.h}
                           </div>
                       )}
                    </>
                )}
                
                {/* Error Overlay */}
                {error && (
                    <div className="absolute inset-0 bg-neutral-900/90 flex flex-col items-center justify-center p-8 text-center">
                        <div className="text-red-500 mb-2 font-bold">Access Denied / Error</div>
                        <p className="text-sm text-neutral-400">{error}</p>
                        <Button onClick={startCamera} className="mt-4" variant="outline">Retry</Button>
                    </div>
                )}
            </div>

            {/* Audio Meter */}
            <div className="bg-neutral-900/50 border border-white/10 p-4 rounded-xl flex items-center gap-4">
                <div className={`p-2 rounded-full ${stream ? 'bg-white/10' : 'bg-red-500/10'}`}>
                    {stream ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-red-500" />}
                </div>
                <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs text-neutral-400">
                        <span>Microphone Input</span>
                        <span>{Math.round(audioLevel / 2.55)}%</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-100 ${audioLevel > 200 ? 'bg-red-500' : audioLevel > 100 ? 'bg-green-500' : 'bg-green-700'}`}
                            style={{ width: `${(audioLevel / 255) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
         </div>

         {/* Controls Sidebar */}
         <div className="space-y-6">
            <div className="bg-neutral-900/50 border border-white/10 p-6 rounded-2xl space-y-6">
                <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Device Settings</h3>
                
                <div className="space-y-2">
                    <label className="text-xs text-neutral-500">Video Source</label>
                    <div className="relative">
                        <select 
                            value={selectedDeviceId}
                            onChange={(e) => { setSelectedDeviceId(e.target.value); if(stream) startCamera(); }}
                            className="w-full bg-neutral-950 border border-white/10 rounded-lg p-3 text-sm text-white appearance-none outline-none focus:border-blue-500"
                            disabled={videoDevices.length === 0}
                        >
                            {videoDevices.map(d => (
                                <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,5)}...`}</option>
                            ))}
                            {videoDevices.length === 0 && <option>Default Camera</option>}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button 
                        onClick={() => setIsMirrored(!isMirrored)}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${isMirrored ? 'bg-blue-600 border-blue-500 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'}`}
                    >
                        <FlipHorizontal size={20} />
                        <span className="text-xs font-bold">Mirror</span>
                    </button>
                    <button 
                        onClick={() => setShowGrid(!showGrid)}
                        className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all ${showGrid ? 'bg-blue-600 border-blue-500 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'}`}
                    >
                        <Grid size={20} />
                        <span className="text-xs font-bold">Grid</span>
                    </button>
                </div>

                <Button 
                    onClick={takeSnapshot} 
                    disabled={!stream}
                    className="w-full"
                    icon={Download}
                >
                    Take Snapshot
                </Button>

                {stream ? (
                    <Button onClick={stopCamera} variant="outline" className="w-full text-red-400 hover:border-red-500 border-red-900/30">
                        Stop Camera
                    </Button>
                ) : (
                    <Button onClick={startCamera} className="w-full" icon={RefreshCw}>
                        Start Camera
                    </Button>
                )}
            </div>
         </div>

      </div>
    </div>
  );
};

export default WebcamTest;