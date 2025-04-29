"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { X, ChevronDown } from "lucide-react";
import { signIn } from "next-auth/react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]);
  const [showCountryList, setShowCountryList] = useState(false);

  if (!isOpen) return null;

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 15) { // Increased limit for international numbers
      setPhoneNumber(value);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (phoneNumber.length < 5) { // Minimum length check
      toast.error("Please enter a valid phone number");
      setLoading(false);
      return;
    }

    try {
      const formattedPhoneNumber = `${selectedCountry.code}${phoneNumber}`;
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

    try {
      const formattedPhoneNumber = `${selectedCountry.code}${phoneNumber}`;
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
        onClose();
        router.refresh();
      } else {
        toast.error(data.error || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error during verification:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          India&apos;s Last Minute App 
        </h2>
        
        <form
          className="space-y-4"
          onSubmit={step === "phone" ? handleSendOTP : handleVerifyOTP}
        >
          <div>
            {step === "phone" ? (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryList(!showCountryList)}
                      className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.code}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    {showCountryList && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {countryCodes.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                            onClick={() => {
                              setSelectedCountry(country);
                              setShowCountryList(false);
                            }}
                          >
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter phone number"
                    value={phoneNumber}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {step === "phone" ? "Sending OTP..." : "Verifying..."}
              </span>
            ) : (
              step === "phone" ? "Send OTP" : "Verify OTP"
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 