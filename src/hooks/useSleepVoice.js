import { useEffect, useRef, useCallback } from 'react';
import catVoiceUrl from '../assets/audio/cat_voice.mp3';

/**
 * useSleepVoice Hook
 *
 * Plays cat_voice.mp3 when the cat enters sleep mode:
 *  - Plays immediately on sleep-mode entry
 *  - Repeats every VOICE_INTERVAL_MS (5 minutes)
 *  - Never overlaps — checks if previous clip is still playing before starting
 *  - Fades audio in smoothly over FADE_DURATION_MS
 *  - Stops and cleans up when sleep mode ends
 *  - Respects the `enableVoiceReminder` and `voiceVolume` settings
 *
 * @param {boolean} isSleepMode   - true when the cat is in sleep state
 * @param {object}  settings      - the current app settings object (may be null)
 */
export function useSleepVoice(isSleepMode, settings) {
  // How often to replay the voice clip (ms)
  const VOICE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  // Fade-in duration (ms)
  const FADE_DURATION_MS = 800;
  // Fade step interval (ms)
  const FADE_STEP_MS = 50;

  // Persistent Audio instance — created once, reused across plays
  const audioRef = useRef(null);
  // setInterval handle for repeating playback
  const intervalRef = useRef(null);
  // rAF / setTimeout handle for fade animation
  const fadeRef = useRef(null);
  // Track whether sleep was active on last render to detect the edge
  const wasSleepRef = useRef(false);

  // ------------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------------

  /** Get the target volume from settings (0–1), default 0.8 */
  const getTargetVolume = useCallback(() => {
    const v = settings?.voiceVolume;
    if (typeof v === 'number' && v >= 0 && v <= 1) return v;
    return 0.8;
  }, [settings]);

  /** Cancel any in-progress fade animation */
  const cancelFade = useCallback(() => {
    if (fadeRef.current) {
      clearTimeout(fadeRef.current);
      fadeRef.current = null;
    }
  }, []);

  /**
   * Fade the audio element's volume from 0 to targetVolume
   * over FADE_DURATION_MS, then resolve.
   */
  const fadeIn = useCallback(
    (audioEl, targetVolume) => {
      cancelFade();
      audioEl.volume = 0;

      const steps = Math.ceil(FADE_DURATION_MS / FADE_STEP_MS);
      const increment = targetVolume / steps;
      let currentStep = 0;

      const tick = () => {
        currentStep++;
        audioEl.volume = Math.min(targetVolume, increment * currentStep);
        if (currentStep < steps) {
          fadeRef.current = setTimeout(tick, FADE_STEP_MS);
        } else {
          audioEl.volume = targetVolume;
          fadeRef.current = null;
        }
      };

      fadeRef.current = setTimeout(tick, FADE_STEP_MS);
    },
    [cancelFade]
  );

  /**
   * Play the voice clip once.
   * Skips playback if the clip is already playing (no overlap).
   */
  const playVoice = useCallback(() => {
    // Bail out if feature is disabled
    if (!settings?.enableVoiceReminder) return;

    // Initialise audio element on first call
    if (!audioRef.current) {
      audioRef.current = new Audio(catVoiceUrl);
      // Preload
      audioRef.current.preload = 'auto';
    }

    const audio = audioRef.current;

    // Do NOT restart if still playing (prevents overlap)
    if (!audio.paused && !audio.ended) {
      console.log('[useSleepVoice] Clip still playing — skipping duplicate');
      return;
    }

    const targetVolume = getTargetVolume();

    // Reset to start and play
    audio.currentTime = 0;
    audio.volume = 0; // will be raised by fadeIn

    audio
      .play()
      .then(() => {
        fadeIn(audio, targetVolume);
      })
      .catch((err) => {
        // Autoplay may be blocked — log but don't crash
        console.warn('[useSleepVoice] Playback blocked:', err);
      });
  }, [settings, getTargetVolume, fadeIn]);

  /**
   * Stop playback and clear the repeat interval.
   */
  const stopVoice = useCallback(() => {
    cancelFade();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [cancelFade]);

  // ------------------------------------------------------------------
  // Main effect — react to sleep-mode transitions
  // ------------------------------------------------------------------
  useEffect(() => {
    const voiceEnabled = settings?.enableVoiceReminder !== false;

    if (isSleepMode && voiceEnabled) {
      if (!wasSleepRef.current) {
        // ---- Sleep mode just started ----
        wasSleepRef.current = true;

        // Play immediately on entry
        playVoice();

        // Schedule repeats every 5 minutes
        intervalRef.current = setInterval(() => {
          playVoice();
        }, VOICE_INTERVAL_MS);
      }
      // else: already in sleep mode — nothing to do (interval is running)
    } else {
      if (wasSleepRef.current) {
        // ---- Sleep mode just ended ----
        wasSleepRef.current = false;
        stopVoice();
      }
      // If voice was disabled mid-sleep, also stop
      if (!voiceEnabled && intervalRef.current) {
        stopVoice();
      }
    }
  }, [isSleepMode, settings?.enableVoiceReminder, playVoice, stopVoice]);

  // Update volume live when slider changes (without restarting clip)
  useEffect(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.volume = getTargetVolume();
    }
  }, [settings?.voiceVolume, getTargetVolume]);

  // ------------------------------------------------------------------
  // Cleanup on unmount — prevent memory leaks
  // ------------------------------------------------------------------
  useEffect(() => {
    return () => {
      stopVoice();
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, [stopVoice]);
}
