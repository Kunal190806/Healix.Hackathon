
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Ear, Play, Download, Volume2, CheckCircle, Info, XCircle, RefreshCw, Loader2, History } from 'lucide-react';
import type { HearingResult, HearingTestRecord } from '@/lib/types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import type { User } from "firebase/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

const testFrequencies = [250, 500, 1000, 2000, 4000, 8000]; // in Hz
const testDecibels = [-10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]; // in dBHL
const normalHearingThreshold = 25; // dBHL
const maxDecibelIndex = testDecibels.length - 1;

type TestState = 'idle' | 'testing' | 'finished';

export default function HearingTest() {
  const [user, setUser] = useState<User | null>(null);
  const [testState, setTestState] = useState<TestState>('idle');
  const [results, setResults] = useState<HearingResult[]>([]);
  const [currentFrequencyIndex, setCurrentFrequencyIndex] = useState(0);
  const [currentDecibelIndex, setCurrentDecibelIndex] = useState(2); // Start at 10 dBHL
  const [currentEar, setCurrentEar] = useState<'left' | 'right'>('right');
  const [testHistory, setTestHistory] = useState<HearingTestRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [finalRecord, setFinalRecord] = useState<HearingTestRecord | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        const q = query(collection(db, "hearingTestHistory"), where("userId", "==", currentUser.uid), orderBy("date", "desc"), limit(5));
        const unsubFirestore = onSnapshot(q, (snapshot) => {
          const userHistory: HearingTestRecord[] = snapshot.docs.map(doc => doc.data() as HearingTestRecord);
          setTestHistory(userHistory);
        });
        return () => unsubFirestore();
      } else {
        setTestHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const finishTest = useCallback(async (finalResults: HearingResult[]) => {
    if (!user) return;
    setTestState('finished');
    const newRecord: HearingTestRecord = {
        userId: user.uid,
        results: finalResults,
        date: new Date().toISOString()
    };
    setFinalRecord(newRecord);
    await addDoc(collection(db, "hearingTestHistory"), newRecord);
  }, [user]);
  
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

    // Simple approximation of dBHL to gain
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
    setFinalRecord(null);
    setTestState('testing');
    timeoutRef.current = setTimeout(() => playTone(testFrequencies[0], testDecibels[2]), 500);
  };
  
  const nextStep = useCallback((currentResults: HearingResult[]) => {
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
          finishTest(currentResults);
      }
  }, [currentFrequencyIndex, currentEar, playTone, stopTone, finishTest]);

  const handleHeard = () => {
    if (testState !== 'testing') return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const newResult = {
      frequency: testFrequencies[currentFrequencyIndex],
      decibel: testDecibels[currentDecibelIndex],
      ear: currentEar,
    };
    const updatedResults = [...results, newResult];
    setResults(updatedResults);
    nextStep(updatedResults);
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
        const updatedResults = [...results, newResult];
        setResults(updatedResults);
        nextStep(updatedResults);
    }
  }, [testState, currentDecibelIndex, currentFrequencyIndex, playTone, nextStep, currentEar, results]);

  const getInterpretation = (ear: 'left' | 'right', currentResults: HearingResult[]) => {
    const earResults = currentResults.filter(r => r.ear === ear && r.decibel !== null).map(r => r.decibel as number);
    if (earResults.length === 0) return "Incomplete test for this ear.";

    const avgThreshold = earResults.reduce((sum, db) => sum + db, 0) / earResults.length;

    if (avgThreshold <= 25) return "Your results indicate hearing within the normal range. You can likely hear most everyday sounds clearly.";
    if (avgThreshold <= 40) return "Your results suggest a mild hearing loss. You might have difficulty hearing soft speech or sounds from a distance.";
    if (avgThreshold <= 70) return "Your results suggest a moderate hearing loss. You may have trouble following conversations, especially in noisy environments.";
    if (avgThreshold <= 90) return "Your results suggest a severe hearing loss. You likely have significant difficulty understanding speech without amplification.";
    return "Your results suggest a profound hearing loss. You may not hear most sounds and likely rely on visual cues or powerful hearing aids.";
  };

  const generatePDFReport = (record: HearingTestRecord) => {
    const doc = new jsPDF();
    const reportDate = format(new Date(record.date), 'PPpp');
    doc.setFontSize(20);
    doc.text("Hearing Screening Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Date: ${reportDate}`, 15, 30);
    doc.text(`Patient: ${user?.displayName || "Anonymous User"}`, 15, 36); 

    const leftEarResults = record.results.filter(r => r.ear === 'left');
    const rightEarResults = record.results.filter(r => r.ear === 'right');

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
      headStyles: { fillColor: [220, 53, 69] }, // A red color for right
    });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Interpretation (Right Ear):", 15, (doc as any).lastAutoTable.finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(getInterpretation('right', record.results), 15, (doc as any).lastAutoTable.finalY + 16, { maxWidth: 180 });

    const rightEarY = (doc as any).lastAutoTable.finalY;

    doc.setFontSize(14);
    doc.text("Left Ear Results", 15, rightEarY + 30);
    autoTable(doc, {
      startY: rightEarY + 35,
      head: [['Frequency', 'Threshold']],
      body: formatResults(leftEarResults),
      theme: 'grid',
      headStyles: { fillColor: [0, 123, 255] }, // A blue color for left
    });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Interpretation (Left Ear):", 15, (doc as any).lastAutoTable.finalY + 10);
    doc.setFont('helvetica', 'normal');
    doc.text(getInterpretation('left', record.results), 15, (doc as any).lastAutoTable.finalY + 16, { maxWidth: 180 });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text("Disclaimer:", 15, finalY + 30);
    doc.setFont('helvetica', 'normal');
    doc.text("This is a basic hearing screening and is not a substitute for a professional audiogram or medical diagnosis. The results are for informational purposes only. Please consult a qualified audiologist or ENT specialist for a comprehensive evaluation.", 15, finalY + 36, { maxWidth: 180 });

    doc.save(`HEALIX_Hearing_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const chartData = testFrequencies.map(freq => {
    const res = finalRecord?.results ?? [];
    const leftResult = res.find(r => r.ear === 'left' && r.frequency === freq);
    const rightResult = res.find(r => r.ear === 'right' && r.frequency === freq);
    return {
      frequency: freq,
      left: leftResult?.decibel,
      right: rightResult?.decibel,
    };
  });
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Please Log In</CardTitle>
        <CardDescription>You need to be logged in to take the hearing test.</CardDescription>
      </Card>
    );
  }

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
                   <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                        <span className="text-primary font-bold text-2xl">3</span>
                        <div>
                            <h4 className="font-semibold">Listen for the Tone</h4>
                            <p className="text-sm text-muted-foreground">You will hear a faint tone. Click the button that matches your experience.</p>
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
                      <p className="font-semibold text-xl">Did you hear the tone?</p>
                      <p className="text-muted-foreground">Click the appropriate button below.</p>
                    </div>
                    <div className="flex gap-4">
                        <Button size="lg" onClick={handleHeard} className="w-48 h-16 text-lg bg-green-600 hover:bg-green-700">
                          <CheckCircle className="mr-3 h-6 w-6"/>
                          Heard It
                        </Button>
                        <Button size="lg" onClick={handleNotHeard} className="w-48 h-16 text-lg" variant="destructive">
                           <XCircle className="mr-3 h-6 w-6"/>
                           Didn't Hear
                        </Button>
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
                   {finalRecord ? (
                     <>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 30, left: -10, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="frequency" type="category" allowDuplicatedCategory={false} label={{ value: 'Frequency (Hz)', position: 'bottom', offset: 0 }}/>
                                    <YAxis reversed domain={[-10, 120]} label={{ value: 'Hearing Level (dBHL)', angle: -90, position: 'insideLeft' }}/>
                                    <Tooltip 
                                    formatter={(value: number | null) => value === null ? '>120 dBHL' : `${value} dBHL`}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: '1px solid hsl(var(--border))'
                                    }}
                                    />
                                    <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '10px'}}/>
                                    <ReferenceLine y={normalHearingThreshold} label={{value: "Normal Hearing Range", position: "insideTopLeft", fill: 'hsl(var(--muted-foreground))', fontSize: 12}} stroke="hsl(var(--primary))" strokeDasharray="3 3" />
                                    <Line type="monotone" dataKey="right" name="Right Ear" stroke="hsl(var(--destructive))" strokeWidth={2} connectNulls />
                                    <Line type="monotone" dataKey="left" name="Left Ear" stroke="hsl(var(--ring))" strokeWidth={2} connectNulls/>
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Info className="h-5 w-5 text-primary"/>Disclaimer</h4>
                            <p className="text-sm text-muted-foreground">
                                This hearing screening is intended for informational purposes only and is not a substitute for a professional medical diagnosis. Results can be affected by your environment and equipment. Please consult a qualified audiologist or healthcare provider for a comprehensive hearing evaluation.
                            </p>
                        </div>
                     </>
                   ) : (
                     <div className="h-[400px] flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
                   )}
                </CardContent>
                 <CardFooter className="flex-col sm:flex-row justify-center gap-4">
                    <Button onClick={handleStartTest} variant="outline">
                        <RefreshCw className="mr-2 h-4 w-4" /> Retake Test
                    </Button>
                    <Button onClick={() => finalRecord && generatePDFReport(finalRecord)} disabled={!finalRecord}>
                        <Download className="mr-2 h-4 w-4" /> Download PDF Report
                    </Button>
                </CardFooter>
            </Card>
        )}

        {testHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Test History
              </CardTitle>
              <CardDescription>Your most recent hearing test results.</CardDescription>
            </CardHeader>
            <CardContent>
              {testHistory.map((record, index) => (
                <div key={index} className="mb-4 last:mb-0 p-4 border rounded-lg">
                  <h4 className="font-semibold">{format(new Date(record.date), 'PP')}</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Left Ear</TableHead>
                        <TableHead>Right Ear</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testFrequencies.map(freq => {
                        const left = record.results.find(r => r.ear === 'left' && r.frequency === freq);
                        const right = record.results.find(r => r.ear === 'right' && r.frequency === freq);
                        return (
                          <TableRow key={freq}>
                            <TableCell>{freq} Hz</TableCell>
                            <TableCell>{left?.decibel !== null && left?.decibel !== undefined ? `${left.decibel} dBHL` : '> 120'}</TableCell>
                            <TableCell>{right?.decibel !== null && right?.decibel !== undefined ? `${right.decibel} dBHL` : '> 120'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
    </div>
  );
}

    