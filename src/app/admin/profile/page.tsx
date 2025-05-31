"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const personalInfoSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email format").optional(),
});

const securitySchema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().refine((val) => val.length >= 8, {
        message: "Password must be at least 8 characters",
    }),
    confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
type SecurityFormData = z.infer<typeof securitySchema>;

export default function AdminProfile() {
    const { data: session, update } = useSession();
    const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');
    const [isLoading, setIsLoading] = useState(false);
    
    const {
        register: registerPersonal,
        handleSubmit: handleSubmitPersonal,
        formState: { errors: personalErrors },
    } = useForm<PersonalInfoFormData>({
        resolver: zodResolver(personalInfoSchema),
        defaultValues: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
        },
    });

    const {
        register: registerSecurity,
        handleSubmit: handleSubmitSecurity,
        formState: { errors: securityErrors },
        reset: resetSecurity,
    } = useForm<SecurityFormData>({
        resolver: zodResolver(securitySchema),
    });

    const onSubmitPersonal = async (data: PersonalInfoFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Something went wrong");
            }

            // Force a session update without parameters to trigger a refresh
            await update();
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update profile");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmitSecurity = async (data: SecurityFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/admin/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Something went wrong");
            }

            resetSecurity();
            toast.success("Password updated successfully");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to update password");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner size="lg" color="primary" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Profile Settings</h1>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`${
                            activeTab === 'personal'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Personal Information
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`${
                            activeTab === 'security'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        Security
                    </button>
                </nav>
            </div>

            {/* Personal Information Form */}
            {activeTab === 'personal' && (
                <form onSubmit={handleSubmitPersonal(onSubmitPersonal)} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            {...registerPersonal("name")}
                            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                personalErrors.name ? "border-red-500" : ""
                            }`}
                        />
                        {personalErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{personalErrors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            {...registerPersonal("email")}
                            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                personalErrors.email ? "border-red-500" : ""
                            }`}
                        />
                        {personalErrors.email && (
                            <p className="mt-1 text-sm text-red-600">{personalErrors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                isLoading
                                    ? "bg-indigo-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                            } text-white`}
                        >
                            {isLoading ? "Updating..." : "Update Profile"}
                        </button>
                    </div>
                </form>
            )}

            {/* Security Form */}
            {activeTab === 'security' && (
                <form onSubmit={handleSubmitSecurity(onSubmitSecurity)} className="space-y-6">
                    <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            {...registerSecurity("currentPassword")}
                            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                securityErrors.currentPassword ? "border-red-500" : ""
                            }`}
                        />
                        {securityErrors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600">{securityErrors.currentPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            {...registerSecurity("newPassword")}
                            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                securityErrors.newPassword ? "border-red-500" : ""
                            }`}
                        />
                        {securityErrors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">{securityErrors.newPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            {...registerSecurity("confirmPassword")}
                            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                                securityErrors.confirmPassword ? "border-red-500" : ""
                            }`}
                        />
                        {securityErrors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">{securityErrors.confirmPassword.message}</p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                isLoading
                                    ? "bg-indigo-400 cursor-not-allowed"
                                    : "bg-indigo-600 hover:bg-indigo-700"
                            } text-white`}
                        >
                            {isLoading ? "Updating..." : "Change Password"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
} 