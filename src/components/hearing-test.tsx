
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ear, Play, Download, Volume2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import type { HearingResult } from '@/lib/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

const testFrequencies = [250, 500, 1000, 2000, 4000, 8000]; // in Hz
const testDecibels = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]; // in dBHL
const normalHearingThreshold = 25; // dBHL
const maxDecibelIndex = testDecibels.length - 1;

type TestState = 'idle' | 'testing' | 'finished';

export default function HearingTest() {
  const [testState, setTestState] = useState<TestState>('idle');
  const [results, setResults] = useState<HearingResult[]>([]);
  const [currentFrequencyIndex, setCurrentFrequencyIndex] = useState(0);
  const [currentDecibelIndex, setCurrentDecibelIndex] = useState(2); // Start at 10 dBHL
  const [currentEar, setCurrentEar] = useState<'left' | 'right'>('right');

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
  
  const playTone = useCallback((frequency: number, decibel: number) => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser.", e);
        return;
      }
    }

    const context = audioContextRef.current;
    
    oscillatorRef.current?.stop();

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const panner = context.createStereoPanner();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);

    const gainValue = Math.pow(10, (decibel - 100) / 20);
    gainNode.gain.setValueAtTime(gainValue, context.currentTime);

    panner.pan.setValueAtTime(currentEar === 'left' ? -1 : 1, context.currentTime);

    oscillator.connect(gainNode).connect(panner).connect(context.destination);
    oscillator.start();

    oscillatorRef.current = oscillator;
    gainNodeRef.current = gainNode;
  }, [currentEar]);
  
  const stopTone = useCallback(() => {
      oscillatorRef.current?.stop();
      oscillatorRef.current = null;
  }, []);

  const handleStartTest = () => {
    setResults([]);
    setCurrentFrequencyIndex(0);
    setCurrentDecibelIndex(2);
    setCurrentEar('right');
    setTestState('testing');
    timeoutRef.current = setTimeout(() => playTone(testFrequencies[0], testDecibels[2]), 500);
  };
  
  const nextStep = useCallback(() => {
      stopTone();
      let freqIndex = currentFrequencyIndex;
      let ear = currentEar;

      if (freqIndex < testFrequencies.length - 1) {
          setCurrentFrequencyIndex(freqIndex + 1);
          setCurrentDecibelIndex(2);
          timeoutRef.current = setTimeout(() => playTone(testFrequencies[freqIndex + 1], testDecibels[2]), 500);
      } else if (ear === 'right') {
          setCurrentEar('left');
          setCurrentFrequencyIndex(0);
          setCurrentDecibelIndex(2);
          timeoutRef.current = setTimeout(() => playTone(testFrequencies[0], testDecibels[2]), 500);
      } else {
          setTestState('finished');
      }
  }, [currentFrequencyIndex, currentEar, playTone, stopTone]);

  const handleHeard = () => {
    if (testState !== 'testing') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const newResult = {
      frequency: testFrequencies[currentFrequencyIndex],
      decibel: testDecibels[currentDecibelIndex],
      ear: currentEar,
    };
    setResults(prev => [...prev, newResult]);
    nextStep();
  };
  
  const handleNotHeard = useCallback(() => {
    if (testState !== 'testing') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    if (currentDecibelIndex < maxDecibelIndex) {
        const nextDbIndex = currentDecibelIndex + 1;
        setCurrentDecibelIndex(nextDbIndex);
        timeoutRef.current = setTimeout(() => playTone(testFrequencies[currentFrequencyIndex], testDecibels[nextDbIndex]), 500);
    } else {
        const newResult = {
            frequency: testFrequencies[currentFrequencyIndex],
            decibel: null, // Mark as not heard
            ear: currentEar
        };
        setResults(prev => [...prev, newResult]);
        nextStep();
    }
  }, [testState, currentDecibelIndex, currentFrequencyIndex, playTone, nextStep, currentEar]);

  useEffect(() => {
    if (testState === 'testing') {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.code === 'Space') {
          event.preventDefault();
          handleHeard();
        }
      };
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [testState, handleHeard]);


  const getInterpretation = (ear: 'left' | 'right') => {
    const earResults = results.filter(r => r.ear === ear && r.decibel !== null).map(r => r.decibel as number);
    if (earResults.length === 0) return "Incomplete test for this ear.";

    const avgThreshold = earResults.reduce((sum, db) => sum + db, 0) / earResults.length;

    if (avgThreshold <= 25) return "Your results indicate hearing within the normal range. You can likely hear most everyday sounds clearly.";
    if (avgThreshold <= 40) return "Your results suggest a mild hearing loss. You might have difficulty hearing soft speech or sounds from a distance.";
    if (avgThreshold <= 70) return "Your results suggest a moderate hearing loss. You may have trouble following conversations, especially in noisy environments.";
    if (avgThreshold <= 90) return "Your results suggest a severe hearing loss. You likely have significant difficulty understanding speech without amplification.";
    return "Your results suggest a profound hearing loss. You may not hear most sounds and likely rely on visual cues or powerful hearing aids.";
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const today = format(new Date(), 'PPpp');
    doc.setFontSize(20);
    doc.text("Hearing Screening Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date: ${today}`, 15, 30);
    doc.text("Patient: Anonymous User", 15, 36); 

    const leftEarResults = results.filter(r => r.ear === 'left');
    const rightEarResults = results.filter(r => r.ear === 'right');

    const formatResults = (earResults: HearingResult[]) => 
      testFrequencies.map(freq => {
        const result = earResults.find(r => r.frequency === freq);
        return [freq + " Hz", result?.decibel !== null && result?.decibel !== undefined ? `${result?.decibel} dBHL` : '> 120 dBHL'];
      });

    doc.setFontSize(14);
    doc.text("Right Ear Results", 15, 50);
    autoTable(doc, {
      startY: 55,
      head: [['Frequency', 'Threshold']],
      body: formatResults(rightEarResults),
      theme: 'grid',
      headStyles: { fillColor: [231, 48, 48] },
    });
    
    doc.setFontSize(10);
    doc.text("Interpretation:", 15, (doc as any).lastAutoTable.finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(getInterpretation('right'), 15, (doc as any).lastAutoTable.finalY + 16, { maxWidth: 180 });

    doc.setFontSize(14);
    doc.text("Left Ear Results", 15, (doc as any).lastAutoTable.finalY + 30);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 35,
      head: [['Frequency', 'Threshold']],
      body: formatResults(leftEarResults),
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] },
    });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Interpretation:", 15, (doc as any).lastAutoTable.finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(getInterpretation('left'), 15, (doc as any).lastAutoTable.finalY + 16, { maxWidth: 180 });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Disclaimer:", 15, finalY + 30);
    doc.setFont('helvetica', 'normal');
    doc.text("This is a basic hearing screening and is not a substitute for a professional audiogram or medical diagnosis. The results are for informational purposes only. Please consult a qualified audiologist or ENT specialist for a comprehensive evaluation.", 15, finalY + 36, { maxWidth: 180 });

    doc.save(`HEALIX_Hearing_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const chartData = testFrequencies.map(freq => {
    const leftResult = results.find(r => r.ear === 'left' && r.frequency === freq);
    const rightResult = results.find(r => r.ear === 'right' && r.frequency === freq);
    return {
      frequency: freq,
      left: leftResult?.decibel,
      right: rightResult?.decibel,
    };
  });

  return (
    <div className="space-y-6">
        {testState === 'idle' && (
            <Card className="text-center">
                <CardHeader>
                    <CardTitle>Prepare for Your Hearing Test</CardTitle>
                    <CardDescription>Follow these steps for the most accurate results.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-left max-w-md mx-auto">
                   <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <span className="text-primary font-bold text-2xl">1</span>
                        <div>
                            <h4 className="font-semibold">Find a Quiet Place</h4>
                            <p className="text-sm text-muted-foreground">Minimize background noise to ensure you only hear the test tones.</p>
                        </div>
                   </div>
                   <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <span className="text-primary font-bold text-2xl">2</span>
                        <div>
                            <h4 className="font-semibold">Use Headphones</h4>
                            <p className="text-sm text-muted-foreground">For accurate results, use headphones and ensure they are on the correct ears (Left/Right).</p>
                        </div>
                   </div>
                   <div className="flex items-start gap-4 p-4 rounded-lg bg-muted_50">
                        <span className="text-primary font-bold text-2xl">3</span>
                        <div>
                            <h4 className="font-semibold">Listen for the Tone</h4>
                            <p className="text-sm text-muted-foreground">Click the "I Hear the Tone" button as soon as you hear a sound, no matter how faint.</p>
                        </div>
                   </div>
                </CardContent>
                <CardContent>
                    <Button size="lg" onClick={handleStartTest}>
                        <Play className="mr-2 h-5 w-5" /> Start Test
                    </Button>
                </CardContent>
            </Card>
        )}
        
        {testState === 'testing' && (
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>Test in Progress</CardTitle>
                    <CardDescription className="capitalize text-lg font-semibold">
                        Testing {currentEar} Ear at {testFrequencies[currentFrequencyIndex]} Hz
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-6 py-16">
                    <Volume2 className="h-24 w-24 text-primary animate-pulse" />
                    <div className="text-center">
                      <p className="font-semibold text-xl">Listen for the faint tone.</p>
                      <p className="text-muted-foreground">Click the button below (or press Spacebar) as soon as you hear it.</p>
                    </div>
                    <Button size="lg" onClick={handleHeard} className="w-64 h-16 text-lg">
                      <CheckCircle className="mr-3 h-6 w-6"/>
                      I Hear the Tone
                    </Button>
                    <div className="text-center text-muted-foreground text-sm space-y-1">
                      <p>If you don't hear anything after a few moments...</p>
                      <Button variant="link" onClick={handleNotHeard} className="h-auto p-0">Click here to continue</Button>
                    </div>
                </CardContent>
            </Card>
        )}

        {testState === 'finished' && (
            <Card>
                <CardHeader>
                    <CardTitle>Test Complete</CardTitle>
                    <CardDescription>Review your results below. This is a screening, not a medical diagnosis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: -10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="frequency" type="category" allowDuplicatedCategory={false} label={{ value: 'Frequency (Hz)', position: 'bottom', offset: 0 }}/>
                                <YAxis reversed domain={[-10, 120]} label={{ value: 'Hearing Level (dBHL)', angle: -90, position: 'insideLeft' }}/>
                                <Tooltip />
                                <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '10px'}}/>
                                <ReferenceLine y={normalHearingThreshold} label={{value: "Normal Hearing Range", position: "insideTopLeft", fill: 'hsl(var(--muted-foreground))', fontSize: 12}} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="right" name="Right Ear" stroke="hsl(var(--destructive))" strokeWidth={2} connectNulls />
                                <Line type="monotone" dataKey="left" name="hsl(210 40% 50%)" stroke="hsl(var(--ring))" strokeWidth={2} connectNulls/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
                        <h4 className="font-semibold flex items-center gap-2 mb-2"><Info className="h-5 w-5 text-primary"/>Disclaimer</h4>
                        <p className="text-sm text-muted-foreground">
                            This hearing screening is intended for informational purposes only and is not a substitute for a professional medical diagnosis. Results can be affected by your environment and equipment. Please consult a qualified audiologist or healthcare provider for a comprehensive hearing evaluation.
                        </p>
                    </div>
                </CardContent>
                 <CardContent className="flex justify-center gap-4">
                    <Button onClick={handleStartTest} variant="outline">
                        <Play className="mr-2 h-4 w-4" /> Retake Test
                    </Button>
                    <Button onClick={generatePDFReport}>
                        <Download className="mr-2 h-4 w-4" /> Download PDF Report
                    </Button>
                </CardContent>
            </Card>
        )}
    </div>
  );
}

    