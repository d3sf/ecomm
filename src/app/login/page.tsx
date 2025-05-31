'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ShoppingBag, Truck, Shield, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface CountryCode {
  code: string;
  name: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+1", name: "USA", flag: "🇺🇸" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
];

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [loginType, setLoginType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [showCountryList, setShowCountryList] = useState(false);
  const [isVerificationError, setIsVerificationError] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (status === 'authenticated') {
    return null; // Will redirect in useEffect
  }

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 15) { // Increased limit for international numbers
      setPhone(value);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsVerificationError(false);

    try {
      const result = await signIn('email-password', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'Please verify your email before logging in') {
          setIsVerificationError(true);
          setVerificationEmail(email);
        }
        setError(result.error);
      } else {
        router.push('/');
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/shop-auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: verificationEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success("Verification email sent! Please check your inbox.");
      } else {
        toast.error(data.error || "Failed to resend verification email");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (phone.length < 5) { // Minimum length check
      toast.error("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    try {
      const formattedPhoneNumber = `${selectedCountry.code}${phone}`;
      const response = await fetch("/api/shop-auth/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhoneNumber,
          action: "send",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        toast.success("OTP sent successfully!");
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formattedPhoneNumber = `${selectedCountry.code}${phone}`;
      const response = await fetch("/api/shop-auth/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhoneNumber,
          action: "verify",
          code: otp,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // If OTP verification is successful, use NextAuth to sign in
        const signInResult = await signIn("phone-otp", {
          redirect: false,
          id: data.user.id.toString(),
          phone: data.user.phone,
          name: data.user.name || "",
          email: data.user.email || "",
        });

        if (signInResult?.error) {
          toast.error("Authentication failed. Please try again.");
          setLoading(false);
          return;
        }
        
        toast.success("Login successful!");
        router.push('/');
      } else {
        toast.error(data.error || "Invalid OTP");
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-6xl flex bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Left side - Visual Section */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-gradient" />
          <div className="relative z-20 w-full h-full flex flex-col items-center justify-center px-8 text-white">
            <div className="max-w-md text-center">
              <ShoppingBag className="w-10 h-10 mb-3 animate-bounce mx-auto" />
              <h1 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
                Welcome to Merugo
              </h1>
              <p className="text-base text-white/90">
                Fresh groceries delivered to your doorstep in minutes
              </p>
            </div>
            
            <div className="space-y-4 mt-8">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <Truck className="w-7 h-7 text-blue-200" />
                <div className="text-left">
                  <h3 className="font-semibold">Lightning Fast</h3>
                  <p className="text-sm text-white/80">Get your groceries in 30 minutes or less</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <Shield className="w-7 h-7 text-blue-200" />
                <div className="text-left">
                  <h3 className="font-semibold">Fresh & Local</h3>
                  <p className="text-sm text-white/80">Handpicked quality from local vendors</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                <Clock className="w-7 h-7 text-blue-200" />
                <div className="text-left">
                  <h3 className="font-semibold">Shop Smart</h3>
                  <p className="text-sm text-white/80">Save time and money with smart shopping</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-12 px-4 sm:px-6">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <div className="inline-block p-2 rounded-full bg-blue-50 mb-3">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold ">
                <span className='text-blue-600'>Meru</span>
                <span className='text-gray-900'>go</span>
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Sign in to continue your shopping journey
              </p>
            </div>

            {/* Login type toggle */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => {
                  setLoginType('email');
                  setIsVerificationError(false);
                }}
                className={`px-3 py-2 rounded-md transition-all duration-300 ${
                  loginType === 'email'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Email Login
              </button>
              <button
                onClick={() => {
                  setLoginType('phone');
                  setIsVerificationError(false);
                }}
                className={`px-3 py-2 rounded-md transition-all duration-300 ${
                  loginType === 'phone'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Phone Login
              </button>
            </div>

            {/* Error display */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg relative animate-fade-in">
                {error}
                {isVerificationError && (
                  <div className="mt-1">
                    <p>Please check your email for a verification link or request a new one.</p>
                    <button 
                      onClick={handleResendVerification}
                      className="mt-1 text-red-800 underline hover:no-underline"
                      disabled={loading}
                    >
                      Resend verification email
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Forms */}
            {loginType === 'email' ? (
              <form className="space-y-4" onSubmit={handleEmailLogin}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none z-10 pointer-events-auto"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <FaEye className="h-5 w-5" aria-hidden="true" />
                        ) : (
                          <FaEyeSlash className="h-5 w-5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-200"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : 'Sign in'}
                  </button>
                </div>

                <div className="text-sm text-center">
                  <Link
                    href="/register"
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Don&apos;t have an account? Register
                  </Link>
                </div>
              </form>
            ) : (
              // Phone login form
              <form className="space-y-4" onSubmit={step === 'phone' ? handleSendOTP : handleVerifyOTP}>
                {step === 'phone' ? (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryList(!showCountryList)}
                          className="flex items-center gap-1 px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[90px] bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                          <span>{selectedCountry.flag}</span>
                          <span>{selectedCountry.code}</span>
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        {showCountryList && (
                          <div className="absolute z-10 mt-1 w-[90px] bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                            {countryCodes.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-1 whitespace-nowrap transition-colors duration-200"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setShowCountryList(false);
                                }}
                              >
                                <span>{country.flag}</span>
                                <span className="text-gray-500">{country.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={handlePhoneNumberChange}
                        maxLength={15}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                      OTP
                    </label>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-200"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </span>
                    ) : step === 'phone' ? 'Send OTP' : 'Verify OTP'}
                  </button>
                </div>

                {step === 'otp' && (
                  <div className="text-sm text-center">
                    <button
                      type="button"
                      onClick={() => setStep('phone')}
                      className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    >
                      Back to phone number
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* Demo credentials section */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-base font-semibold text-blue-800 mb-3">Demo Credentials</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors duration-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-blue-600">demo@quickshop.com</p>
                      <p className="text-sm text-blue-600">123456</p>
                    </div>
                    <button
                      onClick={() => {
                        setLoginType('email');
                        setEmail('demo@quickshop.com');
                        setPassword('123456');
                        navigator.clipboard.writeText('demo@quickshop.com\n123456');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                    >
                      Use
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors duration-200">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-blue-600">1234567890</p>
                      <p className="text-sm text-blue-600">123456</p>
                    </div>
                    <button
                      onClick={() => {
                        setLoginType('phone');
                        setPhone('1234567890');
                        setOtp('123456');
                        navigator.clipboard.writeText('1234567890\n123456');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                    >
                      Use
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}