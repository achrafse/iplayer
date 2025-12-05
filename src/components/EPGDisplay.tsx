import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { EPGService } from '../services/epg.service';
import { EPGListing } from '../types/iptv.types';
import { useAuth } from '../contexts/AuthContext';

interface EPGDisplayProps {
  streamId: number;
  compact?: boolean;
}

export function EPGDisplay({ streamId, compact = true }: EPGDisplayProps) {
  const { credentials } = useAuth();
  const [currentProgram, setCurrentProgram] = useState<EPGListing | null>(null);
  const [nextProgram, setNextProgram] = useState<EPGListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!credentials) return;
    
    const epgService = new EPGService(credentials);
    let intervalId: NodeJS.Timeout;

    const loadEPG = async () => {
      try {
        const { current, next } = await epgService.getCurrentAndNext(streamId);
        setCurrentProgram(current);
        setNextProgram(next);
        
        if (current) {
          setProgress(epgService.getProgramProgress(current));
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading EPG:', error);
        setLoading(false);
      }
    };

    loadEPG();
    
    // Refresh EPG every 2 minutes
    intervalId = setInterval(loadEPG, 120000);

    // Update progress every 30 seconds
    const progressInterval = setInterval(() => {
      if (currentProgram) {
        const epgService = new EPGService(credentials);
        setProgress(epgService.getProgramProgress(currentProgram));
      }
    }, 30000);

    return () => {
      clearInterval(intervalId);
      clearInterval(progressInterval);
    };
  }, [streamId, credentials]);

  if (loading || !currentProgram) {
    return null;
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.compactText} numberOfLines={1}>
          {currentProgram.title}
        </Text>
        {nextProgram && (
          <Text style={styles.compactNextText} numberOfLines={1}>
            Next: {nextProgram.title}
          </Text>
        )}
      </View>
    );
  }

  const epgService = credentials ? new EPGService(credentials) : null;

  return (
    <View style={styles.container}>
      <View style={styles.programSection}>
        <Text style={styles.programLabel}>NOW</Text>
        <Text style={styles.programTitle}>{currentProgram.title}</Text>
        <Text style={styles.programTime}>
          {epgService?.formatTime(currentProgram.start_timestamp)} - {epgService?.formatTime(currentProgram.stop_timestamp)}
        </Text>
        {currentProgram.description && (
          <Text style={styles.programDescription} numberOfLines={2}>
            {currentProgram.description}
          </Text>
        )}
        <View style={styles.progressBarLarge}>
          <View style={[styles.progressFillLarge, { width: `${progress}%` }]} />
        </View>
      </View>
      
      {nextProgram && (
        <View style={styles.programSection}>
          <Text style={styles.programLabel}>NEXT</Text>
          <Text style={styles.programTitle}>{nextProgram.title}</Text>
          <Text style={styles.programTime}>
            {epgService?.formatTime(nextProgram.start_timestamp)} - {epgService?.formatTime(nextProgram.stop_timestamp)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  compactContainer: {
    marginTop: 4,
  },
  compactText: {
    color: '#E50914', // Vibrant red accent
    fontSize: 11,
    fontWeight: '600',
  },
  compactNextText: {
    color: '#A3A3A3', // Medium gray for secondary text
    fontSize: 10,
    marginTop: 2,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(229, 9, 20, 0.2)', // Red progress background
    borderRadius: 1,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914', // Vibrant red
  },
  container: {
    padding: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.95)', // Premium dark card background
    borderRadius: 12,
    marginVertical: 8,
  },
  programSection: {
    marginBottom: 16,
  },
  programLabel: {
    color: '#E50914', // Vibrant red accent
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  programTitle: {
    color: '#FFFFFF', // Pure white for primary text
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  programTime: {
    color: '#A3A3A3', // Medium gray for secondary text
    fontSize: 13,
    marginBottom: 8,
  },
  programDescription: {
    color: '#CCCCCC', // Light gray for description
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  progressBarLarge: {
    height: 4,
    backgroundColor: 'rgba(229, 9, 20, 0.2)', // Red progress background
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFillLarge: {
    height: '100%',
    backgroundColor: '#E50914', // Vibrant red
  },
});
