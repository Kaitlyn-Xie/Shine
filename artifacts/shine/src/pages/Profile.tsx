import { useState, useEffect } from "react";
import { useGetMe, useUpdateMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Settings, UserCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { clearSession } from "@/lib/session";

export default function Profile() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });
  
  const [formData, setFormData] = useState({
    displayName: "",
    pseudonym: "",
    phase: "pre_arrival" as "pre_arrival" | "on_campus",
    comfortSpeaking: 3,
    comfortAsking: 3,
    comfortMeeting: 3,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        displayName: user.displayName,
        pseudonym: user.pseudonym || "",
        phase: user.phase,
        comfortSpeaking: user.comfortSpeaking,
        comfortAsking: user.comfortAsking,
        comfortMeeting: user.comfortMeeting,
      });
    }
  }, [user]);

  const updateMe = useUpdateMe({
    mutation: {
      onSuccess: () => {
        toast.success("Profile updated");
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err: any) => toast.error(err.message || "Failed to update profile")
    }
  });

  const handleSave = () => {
    updateMe.mutate({
      data: formData
    });
  };

  const handleLogout = () => {
    clearSession();
    window.location.href = "/";
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!user) return null;

  return (
    <div className="p-6 space-y-6 pb-24">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your settings and phase.</p>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          <UserCircle className="w-7 h-7" />
        </div>
      </header>

      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input 
              value={formData.displayName}
              onChange={e => setFormData({...formData, displayName: e.target.value})}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label>Pseudonym (for anonymous posts)</Label>
            <Input 
              value={formData.pseudonym}
              onChange={e => setFormData({...formData, pseudonym: e.target.value})}
              className="bg-background"
            />
          </div>
          
          <div className="pt-2">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl border border-border">
              <div>
                <div className="font-medium text-sm">I am on campus</div>
                <div className="text-xs text-muted-foreground">Unlocks scavenger hunt</div>
              </div>
              <Switch 
                checked={formData.phase === "on_campus"}
                onCheckedChange={checked => setFormData({...formData, phase: checked ? "on_campus" : "pre_arrival"})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="p-5 space-y-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" /> Comfort Levels
          </h3>
          
          <div className="space-y-3">
            <Label className="flex justify-between text-xs">
              <span>Speaking in class</span>
              <span className="text-muted-foreground">{formData.comfortSpeaking}/5</span>
            </Label>
            <Slider min={1} max={5} step={1} value={[formData.comfortSpeaking]} onValueChange={v => setFormData({...formData, comfortSpeaking: v[0]})} />
          </div>
          <div className="space-y-3">
            <Label className="flex justify-between text-xs">
              <span>Asking for help</span>
              <span className="text-muted-foreground">{formData.comfortAsking}/5</span>
            </Label>
            <Slider min={1} max={5} step={1} value={[formData.comfortAsking]} onValueChange={v => setFormData({...formData, comfortAsking: v[0]})} />
          </div>
          <div className="space-y-3">
            <Label className="flex justify-between text-xs">
              <span>Meeting new people</span>
              <span className="text-muted-foreground">{formData.comfortMeeting}/5</span>
            </Label>
            <Slider min={1} max={5} step={1} value={[formData.comfortMeeting]} onValueChange={v => setFormData({...formData, comfortMeeting: v[0]})} />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 pt-2">
        <Button onClick={handleSave} disabled={updateMe.isPending} className="w-full rounded-xl h-12">
          {updateMe.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={handleLogout} className="w-full rounded-xl h-12 text-destructive hover:bg-destructive/10 border-border">
          <LogOut className="w-4 h-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}
