'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-meal-ideas.ts';
import '@/ai/flows/extract-prescription-details.ts';
