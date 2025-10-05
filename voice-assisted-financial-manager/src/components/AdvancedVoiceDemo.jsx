import React, { useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Database, 
  Brain, 
  Zap, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Play,
  Square,
  Upload,
  Download,
  BarChart3,
  TrendingUp,
  DollarSign,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SpeechService from '../services/speechService';
import TransactionService from '../services/transactionService';
import { supabase } from '../lib/supabase';

const AdvancedVoiceDemo = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [processing, setProcessing] = useState(false);
  co