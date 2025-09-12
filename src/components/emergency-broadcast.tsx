
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, CheckCircle, ShieldAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function EmergencyBroadcast() {
  const [message, setMessage] = useState("Medical emergency at 123 Health St, Wellness City. Need immediate assistance. Patient is conscious but having difficulty breathing.");
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const { toast } = useToast();

  const handleSendBroadcast = () => {
    if (!message.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Broadcast message cannot be empty.",
      });
      return;
    }
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      toast({
        title: "Broadcast Sent",
        description: "Nearby community responders have been alerted.",
      });
    }, 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Alert variant="destructive" className="mb-6">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Use as a Last Resort</AlertTitle>
        <AlertDescription>
          This system should only be used when official emergency services are confirmed to be unavailable or severely delayed.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Create Emergency Broadcast</CardTitle>
          <CardDescription>
            Your message will be sent to registered community volunteers and first responders within a 5km radius.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="broadcast-message">Message</Label>
            <Textarea
              id="broadcast-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Clearly describe the emergency, location, and type of assistance needed."
              disabled={status !== 'idle'}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Keep the message concise and clear. Include the exact location and patient's primary symptoms. Do not include sensitive personal information.
          </p>
        </CardContent>
        <CardFooter>
          {status === 'idle' && (
            <Button size="lg" className="w-full" onClick={handleSendBroadcast}>
              <Send className="mr-2 h-5 w-5" /> Send Broadcast
            </Button>
          )}
          {status === 'sending' && (
            <Button size="lg" className="w-full" disabled>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...
            </Button>
          )}
          {status === 'sent' && (
            <div className="w-full text-center p-4 bg-green-500/10 text-green-500 border border-green-500/20 rounded-lg">
              <CheckCircle className="mx-auto h-12 w-12 mb-2" />
              <p className="font-semibold">Broadcast successfully sent to 12 responders.</p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
