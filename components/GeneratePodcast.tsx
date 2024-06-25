import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Loader } from 'lucide-react';
import { useToast } from './ui/use-toast';
import { useAction, useMutation } from 'convex/react';
import { useUploadFiles } from '@xixixao/uploadstuff/react';
import { api } from '@/convex/_generated/api';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import { Input } from './ui/input';

export interface GeneratePodcastProps {
  setAudio: (audio: string) => void;
  setAudioStorageId: (id: string) => void;
  audio: string;
  voicePrompt: string;
  setVoicePrompt: (prompt: string) => void;
}

const GeneratePodcast = ({
  setAudio,
  setAudioStorageId,
  audio,
  voicePrompt,
  setVoicePrompt,
}: GeneratePodcastProps) => {
  const [isAiAudio, setIsAiAudio] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const audioRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const { startUpload } = useUploadFiles(generateUploadUrl);
  const getPodcastAudio = useAction(api.openai.generateAudioAction);
  const getAudioUrl = useMutation(api.podcasts.getUrl);

  const handleAudio = async (blob: Blob, fileName: string) => {
    setIsUploading(true);
    setAudio('');

    try {
      const file = new File([blob], fileName, { type: 'audio/mpeg' });

      const uploaded = await startUpload([file]);
      const storageId = (uploaded[0].response as any).storageId;

      setAudioStorageId(storageId);

      const audioUrl = await getAudioUrl({ storageId });
      setAudio(audioUrl!);
      setIsUploading(false);
      toast({
        title: "Audio uploaded successfully",
      });
    } catch (error) {
      console.log(error);
      toast({ title: 'Error uploading audio', variant: 'destructive' });
      setIsUploading(false);
    }
  };

  const generateAudio = async () => {
    setIsGenerating(true);
    setAudio('');

    if (!voicePrompt) {
      toast({
        title: "Please provide a voice prompt to generate a podcast",
      });
      return setIsGenerating(false);
    }

    try {
      const response = await getPodcastAudio({
        voice: "default", // Replace with actual voice type if needed
        input: voicePrompt,
      });

      const blob = new Blob([response], { type: 'audio/mpeg' });
      const fileName = `podcast-${uuidv4()}.mp3`;
      handleAudio(blob, fileName);
      setIsGenerating(false);
    } catch (error) {
      console.log("Error generating podcast", error);
      toast({
        title: "Error creating a podcast",
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };

  const uploadAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    try {
      const files = e.target.files;
      if (!files) return;
      const file = files[0];
      const blob = await file.arrayBuffer().then((ab) => new Blob([ab]));

      handleAudio(blob, file.name);
    } catch (error) {
      console.log(error);
      toast({ title: 'Error uploading audio', variant: 'destructive' });
    }
  };

  return (
    <>
      <div className="generate_audio">
        <Button
          type="button"
          variant="plain"
          onClick={() => setIsAiAudio(true)}
          className={cn('', {
            'bg-black-6': isAiAudio
          })}
        >
          Generate AI Audio
        </Button>
        <Button
          type="button"
          variant="plain"
          onClick={() => setIsAiAudio(false)}
          className={cn('', {
            'bg-black-6': !isAiAudio
          })}
        >
          Upload Audio
        </Button>
      </div>
      {isAiAudio ? (
        <div className="flex flex-col gap-5">
          <div className="mt-5 flex flex-col gap-2.5">
            <Label className="text-16 font-bold text-white-1">
              AI Prompt to Generate Audio
            </Label>
            <Textarea
              className="input-class font-light focus-visible:ring-offset-orange-1"
              placeholder='Provide text to generate audio'
              rows={5}
              value={voicePrompt}
              onChange={(e) => setVoicePrompt(e.target.value)}
            />
          </div>
          <div className="w-full max-w-[200px]">
            <Button
              type="submit"
              className="text-16 bg-orange-1 py-4 font-bold text-white-1"
              onClick={generateAudio}
            >
              {isGenerating ? (
                <>
                  Generating
                  <Loader size={20} className="animate-spin ml-2" />
                </>
              ) : (
                'Generate'
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="image_div" onClick={() => audioRef?.current?.click()}>
          <Input
            type="file"
            className="hidden"
            ref={audioRef}
            accept="audio/*"
            onChange={(e) => uploadAudio(e)}
          />
          {!isUploading ? (
            <Image src="/icons/upload-image.svg" width={40} height={40} alt="upload" />
          ) : (
            <div className="text-16 flex-center font-medium text-white-1">
              Uploading
              <Loader size={20} className="animate-spin ml-2" />
            </div>
          )}
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-12 font-bold text-orange-1">
              Click to upload
            </h2>
            <p className="text-12 font-normal text-gray-1">MP3, WAV, or OGG (max. 10MB)</p>
          </div>
        </div>
      )}
      {audio && (
        <div className="flex-center w-full">
          <audio
            controls
            src={audio}
            className="mt-5"
            onLoadedMetadata={(e) => console.log(`Audio duration: ${e.currentTarget.duration}`)}
          />
        </div>
      )}
    </>
  );
};

export default GeneratePodcast;
