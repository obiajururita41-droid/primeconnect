import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, QrCode, Camera, Share2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';

type ScannerStatus = 'idle' | 'requesting' | 'scanning' | 'success' | 'error';

export default function ScanPayPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'show' | 'scan'>('show');
  const [copied, setCopied] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<ScannerStatus>('idle');
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivId = 'html5qr-scanner';

  const paymentCode = profile?.referral_code ?? user?.id?.slice(0, 8).toUpperCase() ?? 'XXXXXXXX';
  const paymentLink = `https://primeconnect.app/pay/${paymentCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => { stopScanner(); };
  }, []);

  useEffect(() => {
    if (mode !== 'scan') {
      stopScanner();
      setScannerStatus('idle');
      setScannedData(null);
      setErrorMsg('');
    }
  }, [mode]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (_) {}
      scannerRef.current = null;
    }
  };

  const startScanner = async () => {
    setErrorMsg('');
    setScannedData(null);
    setScannerStatus('requesting');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Camera not supported on this browser.');
      setScannerStatus('error');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(t => t.stop());
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setErrorMsg('Camera permission denied. Please allow camera access in your browser settings and try again.');
      } else if (err?.name === 'NotFoundError') {
        setErrorMsg('No camera found on this device.');
      } else {
        setErrorMsg('Could not access camera. Please try again.');
      }
      setScannerStatus('error');
      return;
    }

    setScannerStatus('scanning');

    try {
      await stopScanner();
      const html5QrCode = new Html5Qrcode(scannerDivId);
      scannerRef.current = html5QrCode;
      await html5QrCode.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 200, height: 200 }, aspectRatio: 1.0 },
        (decodedText) => {
          setScannedData(decodedText);
          setScannerStatus('success');
          stopScanner();
        },
        () => {}
      );
    } catch (err: any) {
      setErrorMsg('Failed to start scanner. Please try again.');
      setScannerStatus('error');
      scannerRef.current = null;
    }
  };

  const resetScanner = () => {
    stopScanner();
    setScannerStatus('idle');
    setScannedData(null);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-md mx-auto">
        <div className="bg-white px-4 pt-6 pb-4 flex items-center gap-3 border-b border-gray-100">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Scan / Pay</h1>
            <p className="text-xs text-gray-400">Send or receive money instantly</p>
          </div>
        </div>

        <div className="px-4 pt-4">
          <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              onClick={() => setMode('show')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'show' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <QrCode className="w-4 h-4" /> My QR Code
            </button>
            <button
              onClick={() => setMode('scan')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'scan' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <Camera className="w-4 h-4" /> Scan Code
            </button>
          </div>
          {mode === 'show' ? (
            <div className="text-center">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
                <p className="text-xs text-gray-400 mb-4 font-medium">Scan to send me money</p>
                <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center mb-4 relative">
                  <div className="w-40 h-40 relative flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-10 h-10 border-4 border-gray-900 rounded-md flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-900 rounded-sm" />
                    </div>
                    <div className="absolute top-0 right-0 w-10 h-10 border-4 border-gray-900 rounded-md flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-900 rounded-sm" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-4 border-gray-900 rounded-md flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-900 rounded-sm" />
                    </div>
                    <div className="absolute top-12 left-12 right-0 bottom-0 grid grid-cols-5 gap-1 p-1">
                      {[1,0,1,1,0, 0,1,0,1,1, 1,1,0,0,1, 0,1,1,0,1, 1,0,0,1,0].map((v, i) => (
                        <div key={i} className={`w-2 h-2 rounded-sm ${v ? 'bg-gray-900' : 'bg-transparent'}`} />
                      ))}
                    </div>
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg z-10">
                      <span className="text-white text-xs font-black">PC</span>
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">
                    {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-base">{profile?.full_name ?? 'User'}</p>
                <p className="text-xs text-gray-400 mt-0.5">@{paymentCode.toLowerCase()}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
                <p className="text-xs text-gray-400 mb-2 font-medium">Payment Link</p>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-600 flex-1 truncate font-mono">{paymentLink}</p>
                  <button onClick={copyLink} className="shrink-0 active:scale-95 transition-transform">
                    {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              </div>
              <button
                onClick={copyLink}
                className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-200"
              >
                <Share2 className="w-4 h-4" />
                Share Payment Link
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
                {scannerStatus === 'success' && scannedData ? (
                  <div className="py-4">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">QR Code Scanned!</p>
                    <p className="text-xs text-gray-400 mb-4">Data received successfully</p>
                    <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4 text-left">
                      <p className="text-xs text-gray-400 mb-1 font-medium">Scanned Data</p>
                      <p className="text-sm text-gray-800 font-mono break-all">{scannedData}</p>
                    </div>
                    <button
                      onClick={resetScanner}
                      className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                    >
                      <X className="w-4 h-4" /> Scan Another
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-4 font-medium">
                      {scannerStatus === 'scanning' ? 'Scanning — point at a QR code' : 'Point camera at a QR code'}
                    </p>
                    <div className="w-56 h-56 mx-auto relative mb-4">
                      <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-lg z-10 pointer-events-none" />
                        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-lg z-10 pointer-events-none" />
                        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-lg z-10 pointer-events-none" />
                        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-lg z-10 pointer-events-none" />
                        {scannerStatus === 'scanning' && (
                          <div className="absolute left-4 right-4 h-0.5 bg-blue-400/80 top-1/2 animate-pulse z-10 pointer-events-none" />
                        )}
                        <div id="html5qr-scanner" className="absolute inset-0 rounded-2xl overflow-hidden" style={{ width: '100%', height: '100%' }} />
                        {(scannerStatus === 'idle' || scannerStatus === 'requesting') && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                            {scannerStatus === 'requesting' ? (
                              <>
                                <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2" />
                                <p className="text-xs text-gray-400">Requesting camera...</p>
                              </>
                            ) : (
                              <Camera className="w-10 h-10 text-gray-600" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {scannerStatus === 'error' && errorMsg && (
                      <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-left">
                        <p className="text-xs text-red-600 leading-relaxed">{errorMsg}</p>
                      </div>
                    )}
                    {scannerStatus !== 'scanning' && (
                      <p className="text-sm text-gray-500 leading-relaxed">
                        Align the QR code within the frame to scan and pay instantly
                      </p>
                    )}
                  </>
                )}
              </div>
              {scannerStatus !== 'success' && (
                scannerStatus === 'scanning' ? (
                  <button
                    onClick={resetScanner}
                    className="w-full bg-gray-800 text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  >
                    <X className="w-4 h-4" /> Cancel Scan
                  </button>
                ) : (
                  <button
                    onClick={startScanner}
                    disabled={scannerStatus === 'requesting'}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-200 disabled:opacity-60 disabled:active:scale-100"
                  >
                    <Camera className="w-4 h-4" />
                    {scannerStatus === 'error' ? 'Try Again' : 'Open Camera to Scan'}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
