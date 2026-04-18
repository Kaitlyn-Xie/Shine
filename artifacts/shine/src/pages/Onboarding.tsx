import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useOnboardUser, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getSessionId } from "@/lib/session";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, ArrowRight, Loader2 } from "lucide-react";

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: user, isLoading: isLoadingUser } = useGetMe({ query: { retry: false } });
  
  const onboardMutation = useOnboardUser({
    mutation: {
      onSuccess: (data) => {
        queryClient.setQueryData(getGetMeQueryKey(), data);
        setLocation("/home");
      }
    }
  });

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    displayName: "",
    pseudonym: "",
    country: "",
    timezone: "",
    concentration: "",
    phase: "pre_arrival" as "pre_arrival" | "on_campus",
    comfortSpeaking: 3,
    comfortAsking: 3,
    comfortMeeting: 3,
  });

  useEffect(() => {
    if (!isLoadingUser && user?.onboardingCompleted) {
      setLocation("/home");
    }
  }, [isLoadingUser, user, setLocation]);

  if (isLoadingUser) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (user?.onboardingCompleted) return null;

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      onboardMutation.mutate({
        data: {
          sessionId: getSessionId(),
          ...formData
        }
      });
    }
  };

  const steps = [
    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <div className="text-center mb-8">
        <Sun className="w-12 h-12 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-semibold mb-2 text-foreground">Welcome to Shine</h1>
        <p className="text-muted-foreground text-sm">A safe, quiet space for your first year at Harvard.</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>What should we call you?</Label>
          <Input placeholder="Your preferred name" value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Anonymous Pseudonym (Optional)</Label>
          <p className="text-xs text-muted-foreground">For when you want to ask questions privately.</p>
          <Input placeholder="e.g. Curious Owl" value={formData.pseudonym} onChange={e => setFormData({ ...formData, pseudonym: e.target.value })} />
        </div>
      </div>
    </motion.div>,
    
    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Tell us a bit about yourself</h2>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Home Country</Label>
          <Input placeholder="Where are you from?" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Timezone</Label>
          <Input placeholder="e.g. EST, GMT+1" value={formData.timezone} onChange={e => setFormData({ ...formData, timezone: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Intended Concentration</Label>
          <Input placeholder="Undecided is totally fine!" value={formData.concentration} onChange={e => setFormData({ ...formData, concentration: e.target.value })} />
        </div>
      </div>
    </motion.div>,

    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
      <h2 className="text-xl font-semibold mb-2">How are you feeling about...</h2>
      <p className="text-sm text-muted-foreground mb-6">This helps us personalize your experience.</p>
      
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="flex justify-between">
            <span>Speaking in class</span>
            <span className="text-muted-foreground">{formData.comfortSpeaking}/5</span>
          </Label>
          <Slider min={1} max={5} step={1} value={[formData.comfortSpeaking]} onValueChange={v => setFormData({ ...formData, comfortSpeaking: v[0] })} />
        </div>
        <div className="space-y-3">
          <Label className="flex justify-between">
            <span>Asking for help</span>
            <span className="text-muted-foreground">{formData.comfortAsking}/5</span>
          </Label>
          <Slider min={1} max={5} step={1} value={[formData.comfortAsking]} onValueChange={v => setFormData({ ...formData, comfortAsking: v[0] })} />
        </div>
        <div className="space-y-3">
          <Label className="flex justify-between">
            <span>Meeting new people</span>
            <span className="text-muted-foreground">{formData.comfortMeeting}/5</span>
          </Label>
          <Slider min={1} max={5} step={1} value={[formData.comfortMeeting]} onValueChange={v => setFormData({ ...formData, comfortMeeting: v[0] })} />
        </div>
      </div>
    </motion.div>,

    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
      <h2 className="text-xl font-semibold mb-6">Where are you right now?</h2>
      <RadioGroup value={formData.phase} onValueChange={v => setFormData({ ...formData, phase: v as any })}>
        <div className="flex items-center space-x-2 border p-4 rounded-xl cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => setFormData({ ...formData, phase: "pre_arrival" })}>
          <RadioGroupItem value="pre_arrival" id="pre" />
          <Label htmlFor="pre" className="flex-1 cursor-pointer">
            <div className="font-medium text-base">Pre-arrival</div>
            <div className="text-sm text-muted-foreground font-normal mt-1">I'm preparing to come to campus</div>
          </Label>
        </div>
        <div className="flex items-center space-x-2 border p-4 rounded-xl cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => setFormData({ ...formData, phase: "on_campus" })}>
          <RadioGroupItem value="on_campus" id="on" />
          <Label htmlFor="on" className="flex-1 cursor-pointer">
            <div className="font-medium text-base">On campus</div>
            <div className="text-sm text-muted-foreground font-normal mt-1">I've arrived in Cambridge</div>
          </Label>
        </div>
      </RadioGroup>
    </motion.div>
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-12 max-w-md mx-auto relative overflow-hidden">
      <div className="flex-1 mt-12">
        <AnimatePresence mode="wait">
          {steps[step]}
        </AnimatePresence>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex gap-1 mb-8 justify-center">
          {[0,1,2,3].map(i => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-primary' : i < step ? 'w-4 bg-primary/40' : 'w-4 bg-muted'}`} />
          ))}
        </div>
        
        <Button 
          className="w-full rounded-full py-6 text-base" 
          onClick={handleNext}
          disabled={step === 0 && !formData.displayName || onboardMutation.isPending}
        >
          {onboardMutation.isPending ? <Loader2 className="animate-spin" /> : (
            <>
              {step === 3 ? "Start Exploring" : "Continue"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
