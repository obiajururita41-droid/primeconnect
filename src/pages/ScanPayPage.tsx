import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, QrCode, Camera, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function ScanPayPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'show' | 'scan'>('show');
  const [copied, setCopied] = useState(false);

  const paymentCode = profile?.referral_code ?? user?.id?.slice(0, 8).toUpperCase() ?? 'XXXXXXXX';
  const paymentLink = `https://primeconnect.app/pay/${paymentCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(paymentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="max-w-md mx-auto">

        {/* Header */}
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

        {/* Mode Toggle */}
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
              {/* QR Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
                <p className="text-xs text-gray-400 mb-4 font-medium">Scan to send me money</p>


                {/* QR Code Display */}
                <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center mb-4 relative">
                  <div className="w-40 h-40 relative flex items-center justify-center">
                    {/* Top-left finder */}
                    <div className="absolute top-0 left-0 w-10 h-10 border-4 border-gray-900 rounded-md flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-900 rounded-sm" />
                    </div>
                    {/* Top-right finder */}
                    <div className="absolute top-0 right-0 w-10 h-10 border-4 border-gray-900 rounded-md flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-900 rounded-sm" />
                    </div>
                    {/* Bottom-left finder */}
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-4 border-gray-900 rounded-md flex items-center justify-center">
                      <div className="w-4 h-4 bg-gray-900 rounded-sm" />
                    </div>
                    {/* Data dots */}
                    <div className="absolute top-12 left-12 right-0 bottom-0 grid grid-cols-5 gap-1 p-1">
                      {[1,0,1,1,0, 0,1,0,1,1, 1,1,0,0,1, 0,1,1,0,1, 1,0,0,1,0].map((v,i) => (
                        <div key={i} className={`w-2 h-2 rounded-sm ${v ? 'bg-gray-900' : 'bg-transparent'}`} />
                      ))}
                    </div>
                    {/* Center logo */}
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg z-10">
                      <span className="text-white text-xs font-black">PC</span>
                    </div>
                  </div>
                </div>

                {/* User info */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">
                    {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                  </span>
                </div>
                <p className="font-bold text-gray-900 text-base">{profile?.full_name ?? 'User'}</p>
                <p className="text-xs text-gray-400 mt-0.5">@{paymentCode.toLowerCase()}</p>
              </div>

              {/* Payment link */}
              <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
                <p className="text-xs text-gray-400 mb-2 font-medium">Payment Link</p>
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-600 flex-1 truncate font-mono">{paymentLink}</p>
                  <button
                    onClick={copyLink}
                    className="shrink-0 active:scale-95 transition-transform"
                  >
                    {copied
                      ? <CheckCircle className="w-4 h-4 text-green-500" />
                      : <Copy className="w-4 h-4 text-gray-400" />
                    }
                  </button>
                </div>
              </div>

              {/* Share button */}
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
              {/* Scanner UI */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-4">
                <p className="text-xs text-gray-400 mb-4 font-medium">Point camera at a QR code</p>

                {/* Scanner frame */}
                <div className="w-56 h-56 mx-auto relative mb-4">
                  <div className="w-full h-full bg-gray-900 rounded-2xl flex items-center justify-center relative overflow-hidden">
                    {/* Corner markers */}
                    <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
                    <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
                    <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
                    <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />
                    {/* Scan line */}
                    <div className="absolute left-4 right-4 h-0.5 bg-blue-400/60 top-1/2 animate-pulse" />
                    <Camera className="w-10 h-10 text-gray-600" />
                  </div>
                </div>

                <p className="text-sm text-gray-500 leading-relaxed">
                  Align the QR code within the frame to scan and pay instantly
                </p>
              </div>

              <button className="w-full bg-blue-600 text-white py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-200">
                <Camera className="w-4 h-4" />
                Open Camera to Scan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
