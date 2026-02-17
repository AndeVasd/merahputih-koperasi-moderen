import { useState, useEffect } from 'react';
import { Download, Share, MoreVertical, CheckCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import logoKopdes from '@/assets/logo-kopdes.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Install() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setIsInstalled(true);
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h2 className="text-xl font-bold">Aplikasi Sudah Terinstall!</h2>
            <p className="text-muted-foreground">Buka aplikasi dari home screen Anda.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <img src={logoKopdes} alt="Logo Koperasi" className="h-20 w-20 mx-auto object-contain" />
          <CardTitle className="text-xl">Install Aplikasi</CardTitle>
          <p className="text-sm text-muted-foreground">
            Install Koperasi Desa Merah Putih ke home screen untuk akses cepat seperti aplikasi native.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {deferredPrompt ? (
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Install Sekarang
            </Button>
          ) : isIOS ? (
            <div className="space-y-3 text-sm">
              <p className="font-medium">Cara install di iPhone/iPad:</p>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <Share className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <span>1. Ketuk tombol <strong>Share</strong> di Safari</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <Smartphone className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <span>2. Pilih <strong>"Add to Home Screen"</strong></span>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="font-medium">Cara install di Android:</p>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <MoreVertical className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <span>1. Ketuk menu <strong>⋮</strong> di Chrome</span>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                <Download className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />
                <span>2. Pilih <strong>"Install app"</strong> atau <strong>"Add to Home Screen"</strong></span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
