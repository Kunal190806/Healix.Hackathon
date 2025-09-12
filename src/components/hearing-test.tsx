
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Ear, Play, Pause, Download, Volume2, AlertCircle, CheckCircle } from 'lucide-react';
import type { HearingResult } from '@/lib/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

const testFrequencies = [250, 500, 1000, 2000, 4000, 8000]; // in Hz
const testDecibels = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]; // in dBHL
const normalHearingThreshold = 25; // dBHL

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

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
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
    
    // Stop any existing tone
    oscillatorRef.current?.stop();

    const oscillator = context.createOscillator();
    const gainNode = context.createGain();
    const panner = context.createStereoPanner();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, context.currentTime);

    // This is a simplified conversion from dBHL to gain. It's not perfectly accurate but serves for this test.
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
    setCurrentDecibelIndex(2); // Start at 10dB
    setCurrentEar('right');
    setTestState('testing');
    playTone(testFrequencies[0], testDecibels[2]);
  };
  
  const nextStep = useCallback(() => {
      stopTone();
      let freqIndex = currentFrequencyIndex;
      let ear = currentEar;

      if (freqIndex < testFrequencies.length - 1) {
          setCurrentFrequencyIndex(freqIndex + 1);
          setCurrentDecibelIndex(2);
          playTone(testFrequencies[freqIndex + 1], testDecibels[2]);
      } else if (ear === 'right') {
          setCurrentEar('left');
          setCurrentFrequencyIndex(0);
          setCurrentDecibelIndex(2);
          playTone(testFrequencies[0], testDecibels[2]);
      } else {
          setTestState('finished');
      }
  }, [currentFrequencyIndex, currentEar, playTone, stopTone]);

  const handleHeard = () => {
    if (testState !== 'testing') return;

    const newResult = {
      frequency: testFrequencies[currentFrequencyIndex],
      decibel: testDecibels[currentDecibelIndex],
      ear: currentEar,
    };
    setResults(prev => [...prev, newResult]);
    nextStep();
  };
  
  const handleNotHeard = () => {
    if (testState !== 'testing') return;
    
    if (currentDecibelIndex < testDecibels.length - 1) {
        const nextDbIndex = currentDecibelIndex + 1;
        setCurrentDecibelIndex(nextDbIndex);
        playTone(testFrequencies[currentFrequencyIndex], testDecibels[nextDbIndex]);
    } else {
        // Max decibel reached, treat as not heard at all and move on
        const newResult = {
            frequency: testFrequencies[currentFrequencyIndex],
            decibel: null, // Mark as not heard
            ear: currentEar
        };
        setResults(prev => [...prev, newResult]);
        nextStep();
    }
  };

  const generatePDFReport = () => {
    const doc = new jsPDF();
    const today = format(new Date(), 'PPpp');
    doc.setFontSize(20);
    doc.text("Hearing Test Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date: ${today}`, 15, 30);
    doc.text("Patient: User", 15, 36); 

    const leftEarResults = results.filter(r => r.ear === 'left');
    const rightEarResults = results.filter(r => r.ear === 'right');

    const formatResults = (earResults: HearingResult[]) => 
      testFrequencies.map(freq => {
        const result = earResults.find(r => r.frequency === freq);
        return [freq + " Hz", result?.decibel !== null ? `${result?.decibel} dBHL` : '> 120 dBHL'];
      });

    doc.setFontSize(16);
    doc.text("Right Ear Results", 15, 50);
    autoTable(doc, {
      startY: 55,
      head: [['Frequency', 'Threshold']],
      body: formatResults(rightEarResults),
      theme: 'grid',
      headStyles: { fillColor: [63, 81, 181] },
    });
    
    doc.setFontSize(16);
    doc.text("Left Ear Results", 15, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Frequency', 'Threshold']],
      body: formatResults(leftEarResults),
      theme: 'grid',
      headStyles: { fillColor: [231, 48, 48] },
    });
    
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
                            <h4 className="font-semibold">Press 'I Heard It'</h4>
                            <p className="text-sm text-muted-foreground">As soon as you hear a tone, no matter how faint, click the button.</p>
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
                    <CardDescription className="capitalize text-lg">
                        Testing {currentEar} Ear at {testFrequencies[currentFrequencyIndex]} Hz
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center space-y-6 py-16">
                    <Volume2 className="h-24 w-24 text-primary animate-pulse" />
                    <p className="text-muted-foreground">Listen carefully for the tone.</p>
                    <div className="flex gap-4">
                        <Button size="lg" onClick={handleHeard} className="bg-green-600 hover:bg-green-700">I Heard It</Button>
                        <Button size="lg" variant="destructive" onClick={handleNotHeard}>I Don't Hear It</Button>
                    </div>
                </CardContent>
            </Card>
        )}

        {testState === 'finished' && (
            <Card>
                <CardHeader>
                    <CardTitle>Test Complete</CardTitle>
                    <CardDescription>Review your results below on the audiogram.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 30, left: -10, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="frequency" type="category" allowDuplicatedCategory={false} label={{ value: 'Frequency (Hz)', position: 'bottom', offset: 0 }}/>
                                <YAxis reversed domain={[-10, 120]} label={{ value: 'Hearing Level (dBHL)', angle: -90, position: 'insideLeft' }}/>
                                <Tooltip />
                                <Legend verticalAlign="top" />
                                <ReferenceLine y={normalHearingThreshold} label={{value: "Normal Hearing Range", position: "insideTopLeft"}} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                                <Line type="monotone" dataKey="right" name="Right Ear" stroke="#e74c3c" strokeWidth={2} connectNulls />
                                <Line type="monotone" dataKey="left" name="Left Ear" stroke="#3498db" strokeWidth={2} connectNulls/>
                            </LineChart>
                        </ResponsiveContainer>
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
