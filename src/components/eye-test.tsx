
"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, Play, Info, Check, X, RefreshCw, Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import type { EyeTestResult } from '@/lib/types';
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";
import type { User } from "firebase/auth";

// Snellen chart letters - avoiding letters that can be confused (O, G, C)
const snellenLetters = ['C', 'D', 'E', 'F', 'H', 'K', 'N', 'P', 'R', 'T', 'V', 'Z'];

const chartLines = [
  { score: '20/200', size: 88, letters: 1 },
  { score: '20/100', size: 44, letters: 2 },
  { score: '20/80', size: 35, letters: 3 },
  { score: '20/60', size: 26, letters: 4 },
  { score: '20/50', size: 22, letters: 5 },
  { score: '20/40', size: 18, letters: 6 },
  { score: '20/30', size: 13, letters: 7 },
  { score: '20/25', size: 11, letters: 8 },
  { score: '20/20', size: 9, letters: 9 },
];

const generateRandomLetters = (count: number) => {
  let result = '';
  for (let i = 0; i < count; i++) {
    result += snellenLetters[Math.floor(Math.random() * snellenLetters.length)];
  }
  return result;
};

type TestState = 'idle' | 'testing' | 'finished';


export default function EyeTest() {
  const [user, setUser] = useState<User | null>(null);
  const [testState, setTestState] = useState<TestState>('idle');
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [lastCorrectLine, setLastCorrectLine] = useState<number | null>(null);
  const [currentLetters, setCurrentLetters] = useState('');
  const [testHistory, setTestHistory] = useState<EyeTestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [finalResult, setFinalResult] = useState<EyeTestResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
      if (currentUser) {
        const q = query(collection(db, "eyeTestHistory"), where("userId", "==", currentUser.uid), orderBy("date", "desc"), limit(10));
        const unsubFirestore = onSnapshot(q, (snapshot) => {
          const userHistory: EyeTestResult[] = snapshot.docs.map(doc => doc.data() as EyeTestResult);
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
    if (testState === 'testing') {
      const line = chartLines[currentLineIndex];
      setCurrentLetters(generateRandomLetters(line.letters));
      inputRef.current?.focus();
    }
  }, [currentLineIndex, testState]);

  const handleStartTest = () => {
    setTestState('testing');
    setCurrentLineIndex(0);
    setUserInput('');
    setLastCorrectLine(null);
    setFinalResult(null);
  };
  
  const finalScore = useMemo(() => lastCorrectLine !== null ? chartLines[lastCorrectLine].score : 'Below 20/200', [lastCorrectLine]);

  const getInterpretation = useCallback((score: string) => {
      const lineIndex = chartLines.findIndex(l => l.score === score);
      if (lineIndex === -1) {
        return "Your vision appears to be significantly impaired. It's highly recommended to see an eye care professional.";
      }
      if (lineIndex >= chartLines.findIndex(l => l.score === '20/40')) {
        return `Your estimated visual acuity is ${score}. This is within the normal range for most activities, but regular check-ups are still important.`;
      }
      if (lineIndex >= chartLines.findIndex(l => l.score === '20/60')) {
        return `Your estimated visual acuity is ${score}. You may experience some difficulty with distance vision. It is advisable to consult an optometrist.`;
      }
      return `Your estimated visual acuity is ${score}. You likely have difficulty seeing distant objects clearly. A professional eye examination is strongly recommended.`;
  }, []);

  const finishTest = useCallback(async () => {
    setTestState('finished');
    const score = finalScore;
    const newResult: EyeTestResult = {
        userId: user!.uid,
        score: score,
        interpretation: getInterpretation(score),
        date: new Date().toISOString()
    };
    setFinalResult(newResult);
    if (!user) return;
    await addDoc(collection(db, "eyeTestHistory"), newResult);
  }, [finalScore, getInterpretation, user]);

  const handleNextLine = useCallback(() => {
    const isCorrect = userInput.toUpperCase() === currentLetters;
    
    if (isCorrect) {
      setLastCorrectLine(currentLineIndex);
      if (currentLineIndex < chartLines.length - 1) {
        setCurrentLineIndex(prev => prev + 1);
        setUserInput('');
      } else {
        finishTest();
      }
    } else {
      finishTest();
    }
  }, [userInput, currentLetters, currentLineIndex, finishTest]);
  
  const handleRestart = () => {
    setTestState('idle');
  };
  
  const disclaimerText = "This test is a screening tool and is NOT a substitute for a professional eye exam by a qualified optometrist or ophthalmologist. Results can be affected by screen size, resolution, and distance from the screen. This tool is for informational purposes only.";

  const generatePDFReport = (result: EyeTestResult) => {
    const doc = new jsPDF();
    const testDate = format(new Date(result.date), 'PPpp');
    
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Visual Acuity Screening Report", 105, 25, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date of Test: ${testDate}`, 15, 40);
    doc.text(`Patient: ${user?.displayName || 'Anonymous User'}`, 15, 46);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Your Estimated Score:", 15, 60);

    doc.setFontSize(48);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(63, 81, 181); // Primary color
    doc.text(result.score, 15, 80);
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Interpretation:", 15, 100);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const interpretationLines = doc.splitTextToSize(result.interpretation, 180);
    doc.text(interpretationLines, 15, 110);
    
    doc.setDrawColor(200); // Light gray
    doc.line(15, 140, 195, 140);

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Important Disclaimer:", 15, 150);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const disclaimerLines = doc.splitTextToSize(disclaimerText, 180);
    doc.text(disclaimerLines, 15, 158);

    doc.save(`HEALIX_Eye_Test_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Please Log In</CardTitle>
        <CardDescription>You need to be logged in to take the eye test.</CardDescription>
      </Card>
    );
  }

  const renderContent = () => {
    switch (testState) {
      case 'testing':
        const line = chartLines[currentLineIndex];
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Line {currentLineIndex + 1} of {chartLines.length}</CardTitle>
              <CardDescription>Type the letters you see below.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-8 py-10">
              <div className="w-full text-center" style={{ fontSize: `${line.size}px`, fontFamily: 'monospace', fontWeight: 'bold' }}>
                {currentLetters}
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Label htmlFor="letter-input">Your Answer</Label>
                <Input
                  ref={inputRef}
                  id="letter-input"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="text-center text-2xl tracking-[.5em] uppercase"
                  onKeyDown={(e) => { if(e.key === 'Enter') handleNextLine() }}
                />
              </div>
              <Button onClick={handleNextLine} className="w-full max-w-sm">
                <Check className="mr-2 h-4 w-4" />
                Submit Answer
              </Button>
            </CardContent>
          </Card>
        );
      case 'finished':
        if (!finalResult) {
            return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
        }
        return (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Test Complete</CardTitle>
              <CardDescription>Here is your estimated visual acuity.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="p-8 rounded-lg bg-muted/50 w-full">
                <p className="text-sm text-muted-foreground">Your Score</p>
                <p className="text-6xl font-bold text-primary">
                  {finalResult.score}
                </p>
              </div>
              <p className="max-w-prose">{finalResult.interpretation}</p>
              <div className="mt-4 p-4 rounded-lg bg-muted/50 border">
                <h4 className="font-semibold flex items-center justify-center gap-2 mb-2"><Info className="h-5 w-5 text-primary"/>Disclaimer</h4>
                <p className="text-sm text-muted-foreground max-w-prose">
                  {disclaimerText}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex-col sm:flex-row justify-center gap-4">
              <Button onClick={handleRestart} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Take Test Again
              </Button>
              <Button onClick={() => generatePDFReport(finalResult)}>
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
              <CardTitle>Prepare for Your Eye Test</CardTitle>
              <CardDescription>Follow these instructions for the most accurate screening.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <span className="text-primary font-bold text-2xl">1</span>
                <div>
                  <h4 className="font-semibold">Position Yourself</h4>
                  <p className="text-sm text-muted-foreground">Sit or stand about 6 feet (2 meters) away from your screen for an accurate result.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <span className="text-primary font-bold text-2xl">2</span>
                <div>
                  <h4 className="font-semibold">Test One Eye at a Time</h4>
                  <p className="text-sm text-muted-foreground">Cover one eye and read the letters. Then, repeat the test for the other eye. Do not squint.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <span className="text-primary font-bold text-2xl">3</span>
                <div>
                  <h4 className="font-semibold">Enter What You See</h4>
                  <p className="text-sm text-muted-foreground">You will be shown a line of letters. Type the letters you see clearly and press Enter or click the button.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-center">
              <Button size="lg" onClick={handleStartTest}>
                <Play className="mr-2 h-5 w-5" /> Start Test
              </Button>
            </CardFooter>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  );
}
