import React, { useRef } from 'react';
import { useResumeStore } from '@/stores/resumeStore';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, Info, UploadCloud } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AI_PROVIDERS = [
  { value: 'google', label: 'Google AI (Gemini)', models: [
    'gemini-2.0-flash', 
    'gemini-2.5-flash', 
    'gemini-2.5-flash-lite-preview-06-17'
  ]},
  { value: 'ollama', label: 'Ollama (Local)', models: ['llama3', 'mistral', 'phi'] },
  { value: 'anthropic', label: 'Anthropic (Claude)', models: ['claude-4-opus', 'claude-4-sonnet'] },
] as const;

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { 
    aiConfig,
    isGeneratingSnapshot,
    updateAIConfig,
    extractJobInfoFromImage,
    updateUserBioFromFile,
    generateResumeSnapshotFromBio,
  } = useResumeStore();
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const bioFileInputRef = useRef<HTMLInputElement>(null);

  const selectedProvider = AI_PROVIDERS.find(p => p.value === aiConfig.provider);

  const handleProviderChange = (provider: string) => {
    const providerData = AI_PROVIDERS.find(p => p.value === provider);
    if (providerData) {
      updateAIConfig({
        provider: provider as typeof aiConfig.provider,
        model: providerData.models[0], // Default to first model
      });
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await extractJobInfoFromImage(file);
      // Reset file input to allow re-uploading the same file
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
      }
    }
  };

  const handleBioFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await updateUserBioFromFile(file);
      // Reset file input
      if (bioFileInputRef.current) {
        bioFileInputRef.current.value = '';
      }
    }
  };

  const handleApiKeyChange = (apiKey: string) => {
    updateAIConfig({ apiKey });
  };

  const handleModelChange = (model: string) => {
    updateAIConfig({ model });
  };

  const handleTargetJobInfoChange = (targetJobInfo: string) => {
    updateAIConfig({ targetJobInfo });
  };

  const handleUserBioChange = (userBio: string) => {
    updateAIConfig({ userBio });
  };

  const handleOllamaServerAddressChange = (ollamaServerAddress: string) => {
    updateAIConfig({ ollamaServerAddress });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>
            Configure AI provider settings and provide global context for AI operations.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {/* AI Provider Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Provider Configuration</h3>
            
            <div className="space-y-2">
              <Label htmlFor="provider">AI Provider</Label>
              <Select value={aiConfig.provider} onValueChange={handleProviderChange}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select AI provider" />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDERS.map((provider) => (
                    <SelectItem key={provider.value} value={provider.value}>
                      {provider.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select value={aiConfig.model} onValueChange={handleModelChange}>
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {selectedProvider?.models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {aiConfig.provider !== 'ollama' && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={aiConfig.apiKey || ''}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder={`Enter your ${aiConfig.provider === 'google' ? 'Google' : 'Anthropic'} API key`}
                />
                {process.env.NODE_ENV === 'development' && !aiConfig.apiKey && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      In development, the system will use API keys from .env.local if available.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {aiConfig.provider === 'ollama' && (
              <div className="space-y-2">
                <Label htmlFor="ollamaServer">Ollama Server Address</Label>
                <Input
                  id="ollamaServer"
                  type="text"
                  value={aiConfig.ollamaServerAddress || ''}
                  onChange={(e) => handleOllamaServerAddressChange(e.target.value)}
                  placeholder="http://127.0.0.1:11434"
                />
                <p className="text-sm text-muted-foreground">
                  Make sure Ollama is running on your local machine.
                </p>
              </div>
            )}
          </div>

          {/* Global AI Context */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Global AI Context</h3>
            <p className="text-sm text-muted-foreground">
              This information will be used by AI to provide more personalized suggestions.
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="targetJob">Target Job Info</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => imageFileInputRef.current?.click()}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Screenshot
                </Button>
              </div>
              <Input
                id="image-upload"
                ref={imageFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Textarea
                id="targetJob"
                value={aiConfig.targetJobInfo || ''}
                onChange={(e) => handleTargetJobInfoChange(e.target.value)}
                placeholder="e.g., Senior Software Engineer at Google. Or, upload a job description screenshot."
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Describe the position you're applying for, or upload an image of the job post.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="userBio">Professional Bio</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bioFileInputRef.current?.click()}
                >
                  <UploadCloud className="mr-2 h-4 w-4" />
                  Upload Doc/PDF
                </Button>
              </div>
              <Input
                id="bio-upload"
                ref={bioFileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleBioFileUpload}
                className="hidden"
              />
              <Textarea
                id="userBio"
                value={aiConfig.userBio || ''}
                onChange={(e) => handleUserBioChange(e.target.value)}
                placeholder="Brief description of your professional background, specialties, and career goals..."
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Provide context about yourself that AI can use to tailor suggestions.
              </p>
            </div>

            <Button 
              onClick={() => generateResumeSnapshotFromBio()}
              disabled={!aiConfig.userBio || !aiConfig.targetJobInfo || isGeneratingSnapshot}
              className="w-full"
            >
              {isGeneratingSnapshot ? 'Generating...' : 'Generate Resume Snapshot with AI'}
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              API keys are stored only in memory and never persisted. You'll need to re-enter them after refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </SheetContent>
    </Sheet>
  );
} 