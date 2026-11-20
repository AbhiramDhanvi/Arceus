import { useCallback, useEffect, useRef, useState } from 'react';
import { locales } from './languages.js';
import { voiceHeaders } from './backend.js';

function listenForPause(stream, finish) {
  const AudioContext = window.AudioContext ?? window.webkitAudioContext;
  if (!AudioContext) return () => {};
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  const source = context.createMediaStreamSource(stream);
  source.connect(analyser);
  void context.resume().catch(() => {});
  const samples = new Float32Array(analyser.fftSize);
  let lastVoice = 0;
  let voicedFrames = 0;
  const timer = setInterval(() => {
    if (context.state !== 'running') return;
    analyser.getFloatTimeDomainData(samples);
    let energy = 0;
    for (const value of samples) energy += value * value;
    if (Math.sqrt(energy / samples.length) > .018) {
      lastVoice = performance.now();
      voicedFrames++;
    } else if (voicedFrames >= 4 && performance.now() - lastVoice > 1300) {
      finish();
    }
  }, 65);
  return () => {
    clearInterval(timer);
    void context.close().catch(() => {});
  };
}

export function useSpeech(lang, onTurn, onError, onPartial, { signedIn = false, handsFree = false } = {}) {
  const [status, setStatus] = useState('idle');
  const recognition = useRef(null);
  const utterance = useRef(null);
  const managed = useRef(null);
  const useProvider = useRef(false);
  const [providerReady, setProviderReady] = useState(false);
  const [signInRequired, setSignInRequired] = useState(false);
  const callbacks = useRef({});
  callbacks.current = { onTurn, onError, onPartial, lang, handsFree };

  const stop = useCallback(() => {
    const current = recognition.current;
    recognition.current = null;
    if (current) current.abort();
    utterance.current = null;
    window.speechSynthesis?.cancel();
    const capture = managed.current;
    managed.current = null;
    capture?.dispose?.();
    setStatus('idle');
  }, []);

  useEffect(() => {
    stop();
    return stop;
  }, [lang, signedIn, stop]);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/voice/config', { signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((config) => {
        setSignInRequired(config?.managed === true && config.authRequired && !signedIn);
        useProvider.current = config?.managed === true && (!config.authRequired || signedIn);
        setProviderReady(useProvider.current);
      }).catch(() => {});
    return () => controller.abort();
  }, [signedIn]);

  async function captureManaged() {
    const operation = {};
    managed.current = operation;
    setStatus('connecting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const release = () => stream.getTracks().forEach((track) => track.stop());
      if (managed.current !== operation) {
        release();
        return;
      }
      operation.dispose = release;
      const formats = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const mimeType = formats.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];
      const controller = new AbortController();
      const language = locales[callbacks.current.lang];
      let stopDetector = () => {};
      const timer = setTimeout(() => operation.finish(), 25000);
      operation.finish = () => {
        stopDetector();
        stopDetector = () => {};
        if (recorder.state !== 'inactive') recorder.stop();
        release();
      };
      operation.dispose = () => {
        clearTimeout(timer);
        operation.finish();
        controller.abort();
      };
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      recorder.onerror = () => {
        if (managed.current !== operation) return;
        stop();
        callbacks.current.onError('micError');
      };
      recorder.onstop = async () => {
        clearTimeout(timer);
        if (managed.current !== operation) return;
        setStatus('processing');
        try {
          const clip = new Blob(chunks, { type: recorder.mimeType || chunks[0]?.type || 'audio/webm' });
          const response = await fetch('/api/voice/recognise?lang=' + language, { method: 'POST', body: clip, headers: await voiceHeaders(), signal: controller.signal });
          if (!response.ok) throw new Error('Voice unavailable');
          const { transcript } = await response.json();
          if (managed.current !== operation) return;
          managed.current = null;
          setStatus('idle');
          if (transcript?.trim()) callbacks.current.onTurn(transcript.trim());
          else callbacks.current.onError('noSpeech');
        } catch {
          if (managed.current === operation) {
            managed.current = null;
            setStatus('idle');
            callbacks.current.onError('micError');
          }
        }
      };
      recorder.start();
      if (callbacks.current.handsFree) {
        try { stopDetector = listenForPause(stream, operation.finish); } catch { /* Manual submission remains available. */ }
      }
      setStatus('listening');
    } catch {
      if (managed.current !== operation) return;
      stop();
      callbacks.current.onError('micError');
    }
  }

  async function speakManaged(text, onDone) {
    const controller = new AbortController();
    let audio;
    let url;
    const dispose = () => {
      controller.abort();
      if (audio) {
        audio.pause();
        audio.removeAttribute('src');
      }
      if (url) URL.revokeObjectURL(url);
    };
    const operation = { dispose };
    managed.current = operation;
    setStatus('speaking');
    try {
      const response = await fetch('/api/voice/speak?lang=' + locales[callbacks.current.lang], {
        method: 'POST', headers: { 'Content-Type': 'application/json', ...await voiceHeaders() }, body: JSON.stringify({ text }), signal: controller.signal,
      });
      if (!response.ok) throw new Error('Voice unavailable');
      const content = await response.blob();
      if (managed.current !== operation) return;
      url = URL.createObjectURL(content);
      audio = new Audio(url);
      const done = (error) => {
        if (managed.current !== operation) return;
        managed.current = null;
        dispose();
        setStatus('idle');
        if (error) callbacks.current.onError('speakError');
        else onDone?.();
      };
      audio.onended = () => done(false);
      audio.onerror = () => done(true);
      try {
        await audio.play();
      } catch (error) {
        if (error.name !== 'NotAllowedError') throw error;
        operation.play = () => {
          setStatus('speaking');
          audio.play().catch(() => done(true));
        };
        setStatus('playback-ready');
      }
    } catch {
      if (managed.current !== operation) return;
      managed.current = null;
      dispose();
      setStatus('idle');
      callbacks.current.onError('speakError');
    }
  }

  const start = useCallback(() => {
    stop();
    if (useProvider.current && navigator.mediaDevices?.getUserMedia && window.MediaRecorder) {
      void captureManaged();
      return;
    }
    const Recognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Recognition) {
      callbacks.current.onError('micUnsupported');
      return;
    }
    const input = new Recognition();
    input.lang = locales[callbacks.current.lang];
    input.continuous = false;
    input.interimResults = true;
    input.maxAlternatives = 1;
    recognition.current = input;
    input.onresult = (event) => {
      if (recognition.current !== input) return;
      const result = event.results[event.resultIndex];
      const text = result[0]?.transcript.trim();
      if (!text) return;
      if (result.isFinal) {
        recognition.current = null;
        input.stop();
        setStatus('idle');
        callbacks.current.onTurn(text);
      } else {
        callbacks.current.onPartial(text);
      }
    };
    input.onerror = (event) => {
      if (recognition.current !== input) return;
      recognition.current = null;
      setStatus('idle');
      if (event.error !== 'aborted') callbacks.current.onError(event.error === 'no-speech' ? 'noSpeech' : 'micError');
    };
    input.onend = () => {
      if (recognition.current !== input) return;
      recognition.current = null;
      setStatus('idle');
    };
    try {
      input.start();
      setStatus('listening');
    } catch {
      recognition.current = null;
      callbacks.current.onError('micError');
    }
  }, [stop]);

  const speak = useCallback((text, onDone) => {
    stop();
    if (useProvider.current && text.length <= 2500) {
      void speakManaged(text, onDone);
      return;
    }
    const synthesis = window.speechSynthesis;
    if (!synthesis || !window.SpeechSynthesisUtterance) {
      callbacks.current.onError('speakError');
      return;
    }
    const lang = callbacks.current.lang;
    const available = synthesis.getVoices();
    const voice = available.find((entry) => entry.lang.toLowerCase() === locales[lang].toLowerCase())
      ?? available.find((entry) => entry.lang.toLowerCase().split('-')[0] === lang);
    if (!voice && lang !== 'en') {
      callbacks.current.onError('speakError');
      return;
    }
    const message = new SpeechSynthesisUtterance(text);
    message.lang = locales[lang];
    if (voice) message.voice = voice;
    message.rate = 0.94;
    utterance.current = message;
    message.onend = () => {
      if (utterance.current !== message) return;
      utterance.current = null;
      setStatus('idle');
      onDone?.();
    };
    message.onerror = () => {
      if (utterance.current !== message) return;
      utterance.current = null;
      setStatus('idle');
      callbacks.current.onError('speakError');
    };
    setStatus('speaking');
    synthesis.speak(message);
  }, [stop]);

  useEffect(() => {
    window.speechSynthesis?.getVoices();
  }, []);

  return {
    status, start, stop, speak, providerReady, signInRequired,
    finish() {
      const finish = managed.current?.finish;
      if (finish) finish();
      else stop();
    },
    resume: () => managed.current?.play?.(),
  };
}
