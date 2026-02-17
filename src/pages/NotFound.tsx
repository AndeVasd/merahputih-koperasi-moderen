import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import logoKopdes from '@/assets/logo-kopdes.png';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center max-w-md">
        <img src={logoKopdes} alt="Logo Koperasi" className="h-20 w-20 mx-auto mb-6 object-contain" />
        <h1 className="text-7xl font-extrabold text-primary mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-sm text-muted-foreground mb-8">
          Maaf, halaman <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{location.pathname}</code> tidak tersedia atau telah dipindahkan.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Button className="gradient-primary" onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
