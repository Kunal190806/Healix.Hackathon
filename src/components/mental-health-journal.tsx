"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, orderBy } from "firebase/firestore";
import type { User } from "firebase/auth";
import type { JournalEntry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { BookHeart, Trash2, Loader2 } from "lucide-react";

export default function MentalHealthJournal() {
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsLoading(true);
        const q = query(collection(db, "journalEntries"), where("userId", "==", currentUser.uid), orderBy("date", "desc"));
        const unsubFirestore = onSnapshot(q, (snapshot) => {
          const userEntries: JournalEntry[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
          setEntries(userEntries);
          setIsLoading(false);
        });
        return () => unsubFirestore();
      } else {
        setUser(null);
        setEntries([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntry.trim() || !user) return;
    const entryData = {
      userId: user.uid,
      content: newEntry,
      date: new Date().toISOString(),
    };
    await addDoc(collection(db, "journalEntries"), entryData);
    setNewEntry("");
  };
  
  const handleDeleteEntry = async (id: string) => {
    await deleteDoc(doc(db, "journalEntries", id));
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    return (
      <Card className="text-center p-8">
        <CardTitle>Please Log In</CardTitle>
        <CardDescription>You need to be logged in to use the journal.</CardDescription>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>New Journal Entry</CardTitle>
            <CardDescription>How are you feeling today?</CardDescription>
          </CardHeader>
          <form onSubmit={handleSaveEntry}>
            <CardContent>
              <Textarea
                value={newEntry}
                onChange={(e) => setNewEntry(e.target.value)}
                placeholder="Write down your thoughts and feelings..."
                rows={10}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit">Save Entry</Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Past Entries</CardTitle>
            <CardDescription>Review your journal history.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {entries.length > 0 ? (
              entries.map(entry => (
                <Card key={entry.id} className="relative">
                  <CardHeader>
                    <CardTitle className="text-base">{format(new Date(entry.date), "PPP")}</CardTitle>
                    <CardDescription>{format(new Date(entry.date), "p")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{entry.content}</p>
                  </CardContent>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleDeleteEntry(entry.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </Card>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12">
                <div className="text-center text-muted-foreground">
                  <BookHeart className="mx-auto h-12 w-12" />
                  <p className="mt-4 font-semibold">No entries yet.</p>
                  <p className="mt-1 text-sm">Start by writing your first journal entry.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
