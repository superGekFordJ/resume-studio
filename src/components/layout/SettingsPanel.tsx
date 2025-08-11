import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { useResumeStore } from '@/stores/resumeStore';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Info,
  UploadCloud,
  Settings,
  ClipboardListIcon,
  Languages,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUploadArea } from './upload/ImageUploadArea';

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AI_PROVIDERS = [
  {
    value: 'google',
    getLabel: (t: TFunction) => t('SettingsPanel.googleAiLabel'),
    models: [
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite-preview-06-17',
    ],
  },
  {
    value: 'ollama',
    getLabel: (t: TFunction) => t('SettingsPanel.ollamaLabel'),
    models: ['llama3', 'mistral', 'phi'],
  },
  {
    value: 'anthropic',
    getLabel: (t: TFunction) => t('SettingsPanel.anthropicLabel'),
    models: ['claude-4-opus', 'claude-4-sonnet'],
  },
] as const;

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { t, i18n } = useTranslation('components');
  const {
    aiConfig,
    isGeneratingSnapshot,
    isExtractingJobInfo,
    updateAIConfig,
    extractJobInfoFromImage,
    updateUserBioFromFile,
    generateResumeSnapshotFromBio,
  } = useResumeStore();
  const bioFileInputRef = useRef<HTMLInputElement>(null);
  const targetJobTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const selectedProvider = AI_PROVIDERS.find(
    (p) => p.value === aiConfig.provider
  );

  const handleProviderChange = (provider: string) => {
    const providerData = AI_PROVIDERS.find((p) => p.value === provider);
    if (providerData) {
      updateAIConfig({
        provider: provider as typeof aiConfig.provider,
        model: providerData.models[0], // Default to first model
      });
    }
  };

  const handleImageFile = async (file: File) => {
    if (file) {
      await extractJobInfoFromImage(file);
    }
  };

  const handleBioFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
          <SheetTitle>{t('SettingsPanel.title')}</SheetTitle>
          <SheetDescription>{t('SettingsPanel.description')}</SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-4"
            defaultValue="global-context"
          >
            {/* Card 3: Language & Appearance */}
            <AccordionItem
              value="language-appearance"
              className="border rounded-lg data-[state=closed]:border-b"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">
                    {t('SettingsPanel.languageAppearanceTitle')}
                  </h3>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 px-4 pb-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">
                      {t('SettingsPanel.languageLabel')}
                    </Label>
                    <Select
                      value={i18n.language.split('-')[0]}
                      onValueChange={(lang) => i18n.changeLanguage(lang)}
                    >
                      <SelectTrigger id="language">
                        <SelectValue
                          placeholder={t('SettingsPanel.languagePlaceholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">
                          {t('SettingsPanel.english')}
                        </SelectItem>
                        <SelectItem value="zh">
                          {t('SettingsPanel.simplifiedChinese')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            {/* Card 1: AI Provider Configuration */}
            <AccordionItem
              value="ai-provider"
              className="border rounded-lg data-[state=closed]:border-b"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">
                    {t('SettingsPanel.aiProviderConfigTitle')}
                  </h3>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 px-4 pb-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider">
                      {t('SettingsPanel.aiProviderLabel')}
                    </Label>
                    <Select
                      value={aiConfig.provider}
                      onValueChange={handleProviderChange}
                    >
                      <SelectTrigger id="provider">
                        <SelectValue
                          placeholder={t('SettingsPanel.aiProviderPlaceholder')}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {AI_PROVIDERS.map((provider) => (
                          <SelectItem
                            key={provider.value}
                            value={provider.value}
                          >
                            {provider.getLabel(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="model">
                      {t('SettingsPanel.modelLabel')}
                    </Label>
                    <Select
                      value={aiConfig.model}
                      onValueChange={handleModelChange}
                    >
                      <SelectTrigger id="model">
                        <SelectValue
                          placeholder={t('SettingsPanel.modelPlaceholder')}
                        />
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
                      <Label htmlFor="apiKey">
                        {t('SettingsPanel.apiKeyLabel')}
                      </Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={aiConfig.apiKey || ''}
                        onChange={(e) => handleApiKeyChange(e.target.value)}
                        placeholder={t('SettingsPanel.apiKeyPlaceholder', {
                          provider:
                            aiConfig.provider.charAt(0).toUpperCase() +
                            aiConfig.provider.slice(1),
                        })}
                      />
                      {process.env.NODE_ENV === 'development' &&
                        !aiConfig.apiKey && (
                          <Alert>
                            <Info className="h-4 w-4" />
                            <AlertDescription>
                              {t('SettingsPanel.apiKeyWarning')}
                            </AlertDescription>
                          </Alert>
                        )}
                    </div>
                  )}

                  {aiConfig.provider === 'ollama' && (
                    <div className="space-y-2">
                      <Label htmlFor="ollamaServer">
                        {t('SettingsPanel.ollamaServerAddressLabel')}
                      </Label>
                      <Input
                        id="ollamaServer"
                        type="text"
                        value={aiConfig.ollamaServerAddress || ''}
                        onChange={(e) =>
                          handleOllamaServerAddressChange(e.target.value)
                        }
                        placeholder="http://127.0.0.1:11434"
                      />
                      <p className="text-sm text-muted-foreground">
                        {t('SettingsPanel.ollamaServerDescription')}
                      </p>
                    </div>
                  )}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t('SettingsPanel.apiKeyMemoryWarning')}
                    </AlertDescription>
                  </Alert>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Card 2: Global AI Context */}
            <AccordionItem
              value="global-context"
              className="border rounded-lg data-[state=closed]:border-b"
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline">
                <div className="flex items-center gap-2">
                  <ClipboardListIcon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold">
                    {t('SettingsPanel.globalAiContextTitle')}
                  </h3>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-2 px-4 pb-4 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {t('SettingsPanel.globalAiContextDescription')}
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="targetJob">
                      {t('SettingsPanel.targetJobInfoLabel')}
                    </Label>
                    <ImageUploadArea
                      ref={targetJobTextAreaRef}
                      id="targetJob"
                      value={aiConfig.targetJobInfo || ''}
                      onChange={handleTargetJobInfoChange}
                      onImageUpload={handleImageFile}
                      isLoading={isExtractingJobInfo}
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      {t('SettingsPanel.targetJobInfoDescription')}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="userBio">
                        {t('SettingsPanel.professionalBioLabel')}
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => bioFileInputRef.current?.click()}
                      >
                        <UploadCloud className="mr-2 h-4 w-4" />
                        {t('SettingsPanel.uploadButton')}
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
                      placeholder={t(
                        'SettingsPanel.professionalBioPlaceholder'
                      )}
                      rows={4}
                    />
                    <p className="text-sm text-muted-foreground">
                      {t('SettingsPanel.professionalBioDescription')}
                    </p>
                  </div>

                  <Button
                    onClick={() => generateResumeSnapshotFromBio()}
                    disabled={
                      !aiConfig.userBio ||
                      !aiConfig.targetJobInfo ||
                      isGeneratingSnapshot
                    }
                    className="w-full"
                  >
                    {isGeneratingSnapshot
                      ? t('SettingsPanel.generatingButton')
                      : t('SettingsPanel.generateSnapshotButton')}
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
