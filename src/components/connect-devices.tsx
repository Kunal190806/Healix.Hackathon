
"use client";

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, Activity, Heart, Moon, Wind } from 'lucide-react';

const GoogleFitIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.1328 12.5531L15.3984 15.8203L15.3969 15.8219L12.1328 19.0859L6.15156 13.1031L8.525 10.7281L10.3703 12.5734L12.1313 10.8125L9.94844 8.62969L7.85469 6.53594L5.47969 8.91094L3 6.43125L8.98281 0.45L12.1328 3.59844L8.86875 6.8625L10.6297 8.62344L12.1328 7.12031L15.2266 10.2141L12.1328 13.3078V12.5531Z" fill="#34A853"/>
        <path d="M17.8484 12.825L14.7547 9.73125L12.1313 7.11875L8.86719 10.3828L12.1313 13.6469L13.8922 11.8859L15.7375 10.0406L18.1125 12.4156L17.8484 12.825Z" fill="#4285F4"/>
        <path d="M6.15156 13.1031L12.1328 19.0859L15.3969 15.8219L12.1328 12.5531L10.3703 14.3344L8.525 16.1812L6.15 13.8062L6.15156 13.1031Z" fill="#FABB05"/>
        <path d="M18.1125 12.4156L15.3984 15.8203L17.8016 18.2234L20.8953 21.3172L23.55 18.6625L18.1125 13.225V12.4156Z" fill="#EA4335"/>
    </svg>
);


export default function ConnectDevices() {
    const [isConnected, setIsConnected] = useState(false);

    const handleConnect = () => {
        // In a real application, this would initiate the OAuth 2.0 flow with Google Fit
        setIsConnected(true);
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <GoogleFitIcon />
                    <div>
                        <CardTitle>Connect with Google Fit</CardTitle>
                        <CardDescription>
                            Automatically sync your activity and health data to your HEALIX dashboard.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isConnected ? (
                    <div className="text-center p-8 bg-muted rounded-lg">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold">Successfully Connected!</h3>
                        <p className="text-muted-foreground mt-2">
                            HEALIX will now sync data from Google Fit in the background. You can manage permissions at any time in your Google account settings.
                        </p>
                         <Button variant="link" className="mt-4" asChild>
                            <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">
                                Manage Google Permissions <ExternalLink className="ml-2 h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <p>
                            By connecting your Google Fit account, you allow HEALIX to securely access your health and wellness data. This enables us to provide personalized insights and helps you track your progress seamlessly.
                        </p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <Heart className="h-5 w-5 text-red-500" />
                                <span>Heart rate and blood oxygen levels.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Moon className="h-5 w-5 text-indigo-500" />
                                <span>Sleep patterns, including duration and quality.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Activity className="h-5 w-5 text-green-500" />
                                <span>Activity levels, including step count and calories burned.</span>
                            </li>
                        </ul>
                        <Button className="w-full" size="lg" onClick={handleConnect}>
                            Connect with Google Fit
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">
                            We only request read-only access to your data. You can disconnect at any time.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
