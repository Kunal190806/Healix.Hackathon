
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Timer, Play, XCircle, CheckCircle, RefreshCw, Zap, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { type ResponseTimeResult } from '@/lib/types';
import { format } from 'date-fns';
import jsPDF from 'jspdf';

type TestStatus = 'idle' | 'waiting' | 'ready' | 'tooSoon' | 'result' | 'finished';
const TOTAL_ROUNDS = 5;

export default function ResponseTimeTester() {
  const [status, setStatus] = useState<TestStatus>('idle');
  const [scores, setScores] = useState<number[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [currentRound, setCurrentRound] = useState(0);

  const [history, setHistory] = useLocalStorage<ResponseTimeResult[]>('responseTimeHistory', []);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startWaiting = useCallback(() => {
    setStatus('waiting');
    const waitTime = Math.random() * 4000 + 1000; // 1-5 seconds
    timerRef.current = setTimeout(() => {
      setStatus('ready');
      startTimeRef.current = Date.now();
    }, waitTime);
  }, []);

  const handleClick = () => {
    if (status === 'waiting') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setStatus('tooSoon');
    } else if (status === 'ready') {
      const endTime = Date.now();
      const score = endTime - startTimeRef.current;
      setScores(prevScores => [...prevScores, score]);
      setStatus('result');
    }
  };

  const nextRound = () => {
    if (currentRound < TOTAL_ROUNDS) {
      setCurrentRound(prev => prev + 1);
      startWaiting();
    } else {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      setAverage(avg);
      const newResult: ResponseTimeResult = { average: avg, scores, date: new Date().toISOString() };
      setHistory([newResult, ...history]);
      setStatus('finished');
    }
  };

  useEffect(() => {
    if (status === 'result' || status === 'tooSoon') {
      const timeout = setTimeout(() => {
        nextRound();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [status, nextRound]);
  
  useEffect(() => {
    // This effect ensures nextRound is called with the updated scores state
    if (scores.length > 0 && scores.length === currentRound -1) {
        nextRound();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scores, currentRound]);
  
  const handleStart = () => {
    setScores([]);
    setAverage(0);
    setCurrentRound(1);
    startWaiting();
  };

  const handleRestart = () => {
    setStatus('idle');
    setScores([]);
    setAverage(0);
    setCurrentRound(0);
  };
  
  const generatePDFReport = () => {
    const doc = new jsPDF();
    const testResult = history[0];
    if (!testResult) return;
    
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Cognitive Response Test Report", 105, 25, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date of Test: ${format(new Date(testResult.date), 'PPpp')}`, 15, 40);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Average Response Time:", 15, 60);
    
    doc.setFontSize(48);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(63, 81, 181); // Primary color
    doc.text(`${Math.round(testResult.average)} ms`, 15, 80);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Scores per Round:", 15, 100);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    testResult.scores.forEach((score, index) => {
        doc.text(`Round ${index + 1}: ${score} ms`, 15, 110 + (index * 8));
    });

    doc.setDrawColor(200); // Light gray
    const finalY = 110 + (testResult.scores.length * 8);
    doc.line(15, finalY + 5, 195, finalY + 5);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Interpretation & Disclaimer:", 15, finalY + 15);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const interpretationText = "This test measures simple reaction time to a visual stimulus. A lower score is better. For most people, the average reaction time is between 200-300 milliseconds. This is a screening tool and not a substitute for a professional neurological or cognitive assessment. Results can be affected by device performance, alertness, and other factors.";
    const disclaimerLines = doc.splitTextToSize(interpretationText, 180);
    doc.text(disclaimerLines, 15, finalY + 22);

    doc.save(`HEALIX_Response_Time_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  const renderContent = () => {
    switch (status) {
      case 'waiting':
        return (
          <div className="bg-destructive text-destructive-foreground rounded-lg h-80 flex flex-col items-center justify-center text-center cursor-pointer" onClick={handleClick}>
            <h2 className="text-4xl font-bold">Wait for Green...</h2>
          </div>
        );
      case 'ready':
        return (
          <div className="bg-green-500 text-white rounded-lg h-80 flex flex-col items-center justify-center text-center cursor-pointer" onClick={handleClick}>
            <h2 className="text-4xl font-bold">Click Now!</h2>
          </div>
        );
      case 'tooSoon':
        return (
          <div className="bg-amber-500 text-white rounded-lg h-80 flex flex-col items-center justify-center text-center">
            <XCircle className="h-16 w-16 mb-4" />
            <h2 className="text-4xl font-bold">Too Soon!</h2>
            <p className="text-lg">Wait for the screen to turn green.</p>
          </div>
        );
      case 'result':
        return (
          <div className="bg-primary text-primary-foreground rounded-lg h-80 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-16 w-16 mb-4" />
            <p className="text-6xl font-bold font-mono">{scores[scores.length - 1]}<span className="text-2xl ml-2">ms</span></p>
          </div>
        );
      case 'finished':
        return (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Test Complete</CardTitle>
              <CardDescription>You completed all {TOTAL_ROUNDS} rounds.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="p-8 rounded-lg bg-muted/50 w-full">
                <p className="text-sm text-muted-foreground">Your Average Response Time</p>
                <p className="text-6xl font-bold font-mono text-primary">{Math.round(average)}<span className="text-2xl ml-2">ms</span></p>
              </div>
              <div className="w-full text-left">
                  <h4 className="font-semibold mb-2">Round Scores:</h4>
                  <ul className="grid grid-cols-5 gap-2 text-center text-sm">
                      {scores.map((s, i) => (
                          <li key={i} className="p-2 bg-muted rounded-md font-mono">{s} ms</li>
                      ))}
                  </ul>
              </div>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row justify-center gap-4">
                <Button onClick={handleRestart} variant="outline"><RefreshCw className="mr-2 h-4 w-4" />Take Test Again</Button>
                 <Button onClick={generatePDFReport}>
                    <Download className="mr-2 h-4 w-4" /> Download PDF Report
                </Button>
            </CardFooter>
          </Card>
        );
      case 'idle':
      default:
        return (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Response Time Test</CardTitle>
              <CardDescription>Measure how quickly you can react to a visual change.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <span className="text-primary font-bold text-2xl">1</span>
                <div>
                  <h4 className="font-semibold">Start the Test</h4>
                  <p className="text-sm text-muted-foreground">Click the "Start Test" button below.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <span className="text-primary font-bold text-2xl">2</span>
                <div>
                  <h4 className="font-semibold">Wait for Green</h4>
                  <p className="text-sm text-muted-foreground">The screen will turn red. Wait for it to turn green. Do not click yet!</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <span className="text-primary font-bold text-2xl">3</span>
                <div>
                  <h4 className="font-semibold">Click!</h4>
                  <p className="text-sm text-muted-foreground">As soon as the screen turns green, click your mouse as fast as you can.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button size="lg" onClick={handleStart}>
                <Play className="mr-2 h-5 w-5" /> Start Test
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {status !== 'idle' && status !== 'finished' && (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Round {currentRound} of {TOTAL_ROUNDS}</span>
                        <span>{Math.round((currentRound / TOTAL_ROUNDS) * 100)}%</span>
                    </div>
                    <Progress value={(currentRound / TOTAL_ROUNDS) * 100} />
                </div>
            </CardContent>
        </Card>
      )}
      {renderContent()}
    </div>
  );
}
