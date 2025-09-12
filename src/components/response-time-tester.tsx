
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Timer, Play, XCircle, CheckCircle, RefreshCw, Zap, Download, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { type ResponseTimeResult } from '@/lib/types';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import type { User } from "firebase/auth";

type TestStatus = 'idle' | 'waiting' | 'ready' | 'tooSoon' | 'result' | 'finished';
const TOTAL_ROUNDS = 5;

export default function ResponseTimeTester() {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<TestStatus>('idle');
  const [scores, setScores] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);

  const [history, setHistory] = useState<ResponseTimeResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        const q = query(collection(db, "responseTimeHistory"), where("userId", "==", currentUser.uid), orderBy("date", "desc"), limit(10));
        const unsubFirestore = onSnapshot(q, (snapshot) => {
          const userHistory: ResponseTimeResult[] = snapshot.docs.map(doc => doc.data() as ResponseTimeResult);
          setHistory(userHistory);
        });
        return () => unsubFirestore();
      } else {
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const startWaiting = useCallback(() => {
    setStatus('waiting');
    const waitTime = Math.random() * 4000 + 1000; // 1-5 seconds
    timerRef.current = setTimeout(() => {
      setStatus('ready');
      startTimeRef.current = Date.now();
    }, waitTime);
  }, []);
  
  const finishTest = useCallback(async (finalScores: number[]) => {
    if (!user) return;
    const avg = finalScores.reduce((a, b) => a + b, 0) / finalScores.length;
    const newResult: ResponseTimeResult = { 
      userId: user.uid,
      average: avg,
      scores: finalScores,
      date: new Date().toISOString()
    };
    await addDoc(collection(db, "responseTimeHistory"), newResult);
    setStatus('finished');
  }, [user]);

  const nextRound = useCallback(() => {
    if (scores.length < TOTAL_ROUNDS) {
      setCurrentRound(prev => prev + 1);
      startWaiting();
    } else {
      finishTest(scores);
    }
  }, [scores, startWaiting, finishTest]);

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

  useEffect(() => {
    if (status === 'result' || status === 'tooSoon') {
      const timeout = setTimeout(() => {
        nextRound();
      }, 2000); // Wait 2 seconds before starting next round
      return () => clearTimeout(timeout);
    }
  }, [status, nextRound]);

  const handleStart = () => {
    setScores([]);
    setCurrentRound(1);
    startWaiting();
  };

  const handleRestart = () => {
    setStatus('idle');
    setScores([]);
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
    doc.text(`Patient: ${user?.displayName || 'Anonymous User'}`, 15, 46);

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

    let finalY = 110 + (testResult.scores.length * 8);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Methods to Improve Response Time:", 15, finalY + 10);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const improvementTips = [
        ['Stay Active:', 'Regular physical exercise can improve blood flow to the brain and enhance cognitive function.'],
        ['Get Enough Sleep:', 'Aim for 7-9 hours of quality sleep per night. Sleep is crucial for memory consolidation and brain health.'],
        ['Eat a Healthy Diet:', 'A diet rich in antioxidants, omega-3s, and vitamins (like berries, fish, and leafy greens) supports brain function.'],
        ['Practice Mindfulness:', 'Meditation and mindfulness can reduce stress and improve focus and attention.'],
        ['Engage Your Brain:', 'Challenge your mind with puzzles, learning a new skill, or playing strategy games.']
    ];
    
    let tipY = finalY + 18;
    improvementTips.forEach(tip => {
        doc.setFont('helvetica', 'bold');
        doc.text(tip[0], 20, tipY);
        doc.setFont('helvetica', 'normal');
        const tipText = doc.splitTextToSize(tip[1], 160);
        doc.text(tipText, 50, tipY);
        tipY += (tipText.length * 5) + 4;
    });

    finalY = tipY;
    
    doc.setDrawColor(200); // Light gray
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Please Log In</CardTitle>
        <CardDescription>You need to be logged in to take the response time test.</CardDescription>
      </Card>
    );
  }

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
        const latestResult = history[0];
        if (!latestResult) return null;
        return (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Test Complete</CardTitle>
              <CardDescription>You completed all {TOTAL_ROUNDS} rounds.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="p-8 rounded-lg bg-muted/50 w-full">
                <p className="text-sm text-muted-foreground">Your Average Response Time</p>
                <p className="text-6xl font-bold font-mono text-primary">{Math.round(latestResult.average)}<span className="text-2xl ml-2">ms</span></p>
              </div>
              <div className="w-full text-left">
                  <h4 className="font-semibold mb-2">Round Scores:</h4>
                  <ul className="grid grid-cols-5 gap-2 text-center text-sm">
                      {latestResult.scores.map((s, i) => (
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

  const progressPercentage = (scores.length / TOTAL_ROUNDS) * 100;

  return (
    <div className="space-y-6">
      {status !== 'idle' && status !== 'finished' && (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Round {currentRound} of {TOTAL_ROUNDS}</span>
                        <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress value={progressPercentage} />
                </div>
            </CardContent>
        </Card>
      )}
      {renderContent()}
    </div>
  );
}

    