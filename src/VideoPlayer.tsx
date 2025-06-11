import React, { useRef, useState } from 'react';
import './VideoPlayer.css';

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
};

const VideoPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [videoFile, setVideoFile] = useState<string | undefined>();
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [brightness, setBrightness] = useState(100);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) setCurrentTime(video.currentTime);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) setDuration(video.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = Number(e.target.value);
      setCurrentTime(Number(e.target.value));
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const vol = Number(e.target.value);
    if (video) video.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!isFullscreen) {
      if (video.requestFullscreen) video.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(URL.createObjectURL(file));
      setCurrentTime(0);
      setIsPlaying(false);
    }
  };

  const handleDarkMode = () => setDarkMode((d) => !d);

  const handleSpeedPercent = (percent: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const jump = duration * (percent / 100);
    let newTime = video.currentTime + jump;
    if (newTime < 0) newTime = 0;
    if (newTime > duration) newTime = duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handlePlaybackRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rate = Number(e.target.value);
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
  };

  // Color controls
  const handleHue = (e: React.ChangeEvent<HTMLInputElement>) => setHue(Number(e.target.value));
  const handleSaturation = (e: React.ChangeEvent<HTMLInputElement>) => setSaturation(Number(e.target.value));
  const handleBrightness = (e: React.ChangeEvent<HTMLInputElement>) => setBrightness(Number(e.target.value));

  // Set playbackRate on video element when it changes
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return (
    <div className={`video-player${darkMode ? ' dark' : ''}`}>
      <div className="video-container">
        <video
          ref={videoRef}
          src={videoFile}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={handlePlayPause}
          controls={false}
          tabIndex={0}
          style={{
            filter: `hue-rotate(${hue}deg) saturate(${saturation}%) brightness(${brightness}%)`,
          }}
        />
        {!videoFile && (
          <div className="video-placeholder">
            <input type="file" accept="video/*" onChange={handleFileChange} />
            <p>Choose a video file to play</p>
          </div>
        )}
      </div>
      <div className="controls">
        <button onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'} title="Play/Pause">
          {isPlaying ? '⏸' : '▶️'}
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          step={0.1}
          aria-label="Seek bar"
          title="Seek Bar"
        />
        <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
        <button onClick={handleMute} aria-label={isMuted ? 'Unmute' : 'Mute'} title="Mute/Unmute">
          {isMuted ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolume}
          aria-label="Volume"
          title="Volume"
        />
        <button onClick={handleFullscreen} aria-label="Fullscreen" title="Fullscreen">
          {isFullscreen ? '🡼' : '⛶'}
        </button>
        <button onClick={handleDarkMode} aria-label="Toggle dark mode" title="Dark Mode Toggle">
          {darkMode ? '🌙' : '☀️'}
        </button>
        <label style={{display:'flex',alignItems:'center',gap:4}} title="Speed Controller">
          Speed
          <input
            type="range"
            min={0.25}
            max={2}
            step={0.01}
            value={playbackRate}
            onChange={handlePlaybackRate}
            aria-label="Playback speed"
            style={{width:80}}
            title="Playback Speed"
          />
          <span>{playbackRate.toFixed(2)}x</span>
          <button
            type="button"
            style={{marginLeft:8}}
            onClick={() => handlePlaybackRate({target: {value: '1'}} as React.ChangeEvent<HTMLInputElement>)}
            aria-label="Reset speed to 1x"
            title="Reset Speed"
          >
            Reset
          </button>
        </label>
        <div style={{display:'flex',gap:4,alignItems:'center'}} title="Jump by Percent">
          {[5,10,15].map(p => (
            <button key={p} onClick={() => handleSpeedPercent(-p)} aria-label={`Back ${p}%`} title={`Back ${p}%`}>
              -{p}%
            </button>
          ))}
          {[5,10,15].map(p => (
            <button key={p+100} onClick={() => handleSpeedPercent(p)} aria-label={`Forward ${p}%`} title={`Forward ${p}%`}>
              +{p}%
            </button>
          ))}
          <form
            onSubmit={e => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('percent') as HTMLInputElement;
              const val = parseFloat(input.value);
              if (!isNaN(val) && val !== 0) handleSpeedPercent(val);
              input.value = '';
            }}
            style={{display:'inline-flex',alignItems:'center',gap:2,marginLeft:8}}
            title="Manual Percent Jump"
          >
            <input
              name="percent"
              type="number"
              min={-100}
              max={100}
              step={1}
              placeholder="%"
              style={{width:40}}
              aria-label="Jump percent manual"
              title="Manual Percent Input"
            />
            <button type="submit" aria-label="Jump by percent" title="Go by Percent">Go</button>
          </form>
        </div>
        {/* Video color controls */}
        <div style={{display:'flex',flexDirection:'column',gap:2,marginLeft:8}} title="Video Color Controls">
          <label style={{fontSize:'0.9em'}} title="Hue">
            Hue
            <input type="range" min={-180} max={180} value={hue} onChange={handleHue} aria-label="Hue" style={{width:80}} title="Hue" />
            <span>{hue}°</span>
          </label>
          <label style={{fontSize:'0.9em'}} title="Saturation">
            Saturation
            <input type="range" min={0} max={200} value={saturation} onChange={handleSaturation} aria-label="Saturation" style={{width:80}} title="Saturation" />
            <span>{saturation}%</span>
          </label>
          <label style={{fontSize:'0.9em'}} title="Brightness">
            Brightness
            <input type="range" min={50} max={200} value={brightness} onChange={handleBrightness} aria-label="Brightness" style={{width:80}} title="Brightness" />
            <span>{brightness}%</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
