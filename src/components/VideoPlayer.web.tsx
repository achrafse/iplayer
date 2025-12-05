import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import Hls from 'hls.js';

interface VideoPlayerProps {
  uri: string;
  title?: string;
  onBack?: () => void;
  onError?: (error: string) => void;
}

export function VideoPlayer({ uri, title, onBack, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Check if HLS is supported
    if (uri.includes('.m3u8')) {
      if (Hls.isSupported()) {
        // Use HLS.js for browsers that don't have native HLS support
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });
        
        hlsRef.current = hls;
        hls.loadSource(uri);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('HLS manifest loaded, starting playback');
          video.play().catch(err => {
            console.error('Autoplay failed:', err);
            setIsPlaying(false);
          });
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log('Network error, trying to recover...');
                setError('Failed to load video stream. The stream may be offline or incompatible.');
                setIsLoading(false);
                if (onError) onError('Network error');
                // Try to recover once
                setTimeout(() => {
                  if (hlsRef.current) {
                    hls.startLoad();
                  }
                }, 2000);
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                setError('Failed to load video stream. The stream may be offline or incompatible.');
                setIsLoading(false);
                if (onError) onError('Stream error');
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        video.src = uri;
        video.play().catch(err => {
          console.error('Autoplay failed:', err);
          setIsPlaying(false);
        });
      } else {
        setError('HLS not supported in this browser');
      }
    } else {
      // Direct video URL (mp4, etc)
      video.src = uri;
      video.play().catch(err => {
        console.error('Autoplay failed:', err);
        setIsPlaying(false);
      });
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [uri]);

  useEffect(() => {
    // Auto-hide controls after 3 seconds
    if (showControls) {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls]);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleError = () => {
    const errorMessage = 'Failed to load video stream. The stream may be offline or incompatible.';
    setError(errorMessage);
    setIsLoading(false);
    onError?.(errorMessage);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleRewind = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
    }
  };

  const handleForward = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
    }
  };

  const handleScreenPress = () => {
    setShowControls(!showControls);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <div 
        style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#000',
          position: 'relative',
          cursor: showControls ? 'default' : 'none'
        }}
        onClick={handleScreenPress}
      >
        <video
          ref={videoRef}
          src={uri}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            backgroundColor: '#000',
          }}
          autoPlay
          playsInline
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={handlePlay}
          onPause={handlePause}
          onError={handleError}
          onCanPlay={handleCanPlay}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
        />

        {/* Loading Indicator */}
        {isLoading && !error && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 10,
          }}>
            <div style={{
              border: '5px solid rgba(229, 9, 20, 0.2)',
              borderTop: '5px solid #E50914',
              borderRadius: '50%',
              width: '60px',
              height: '60px',
              animation: 'spin 0.8s linear infinite',
              marginBottom: '20px',
              marginLeft: 'auto',
              marginRight: 'auto',
              boxShadow: '0 0 20px rgba(229, 9, 20, 0.4)',
            }} />
            <Text style={styles.loadingText}>Loading stream...</Text>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 10, 10, 0.98)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '40px',
            zIndex: 100,
          }}>
            <div style={{
              fontSize: '60px',
              marginBottom: '20px',
            }}>⚠️</div>
            <Text style={styles.errorText}>{error}</Text>
            {onBack && (
              <TouchableOpacity style={styles.retryButton} onPress={onBack}>
                <Text style={styles.retryButtonText}>← Go Back</Text>
              </TouchableOpacity>
            )}
          </div>
        )}

        {/* Controls Overlay */}
        {showControls && !error && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(18,18,18,0.85) 0%, rgba(18,18,18,0) 20%, rgba(18,18,18,0) 80%, rgba(18,18,18,0.85) 100%)',
            zIndex: 5,
          }}>
            {/* Top Bar */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              padding: '24px',
              gap: '16px',
              backdropFilter: 'blur(10px)',
            }}>
              {onBack && (
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                  <Text style={styles.backBtnText}>← Back</Text>
                </TouchableOpacity>
              )}
              {title && <Text style={styles.title}>{title}</Text>}
            </div>

            {/* Center Controls */}
            <div style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '40px',
            }}>
              <TouchableOpacity style={styles.controlButton} onPress={handleRewind}>
                <Text style={styles.controlButtonText}>⏪ 10s</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.playButton} onPress={togglePlayPause}>
                <Text style={styles.playButtonText}>
                  {isPlaying ? '⏸' : '▶'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.controlButton} onPress={handleForward}>
                <Text style={styles.controlButtonText}>10s ⏩</Text>
              </TouchableOpacity>
            </div>

            {/* Bottom Bar */}
            <div style={{
              padding: '24px',
              backdropFilter: 'blur(10px)',
            }}>
              <Text style={styles.timeText}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
              <div style={{
                height: '6px',
                backgroundColor: 'rgba(42, 42, 42, 0.8)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '12px',
              }}>
                <div style={{
                  height: '100%',
                  backgroundColor: '#E50914',
                  width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                  transition: 'width 0.1s',
                  boxShadow: '0 0 10px rgba(229, 9, 20, 0.5)',
                }} />
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    zIndex: 10,
  },
  loadingText: {
    color: '#A3A3A3',
    fontSize: 16,
    marginTop: 20,
    letterSpacing: 0.5,
  },
  errorText: {
    color: '#E50914',
    fontSize: 20,
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 12,
    fontWeight: '600',
  },
  errorHint: {
    color: '#A3A3A3',
    fontSize: 13,
    textAlign: 'center',
    marginHorizontal: 32,
    marginBottom: 24,
  },
  backButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#E50914',
    borderRadius: 12,
    boxShadow: '0 4px 8px rgba(229, 9, 20, 0.3)',
    elevation: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#E50914',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(229, 9, 20, 0.4)',
    elevation: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  backBtn: {
    padding: 12,
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    borderRadius: 10,
  },
  backBtnText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  controlButton: {
    padding: 18,
    backgroundColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(229, 9, 20, 0.3)',
  },
  controlButtonText: {
    color: '#E50914',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  playButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(229, 9, 20, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E50914',
  },
  playButtonText: {
    color: '#E50914',
    fontSize: 36,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
  },
});
